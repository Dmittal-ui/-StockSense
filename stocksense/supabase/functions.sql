-- StockSense SQL Functions
-- Run this AFTER schema.sql in your Supabase SQL Editor

-- ========================================
-- LOW STOCK VIEW
-- ========================================
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.category,
  p.unit,
  p.reorder_level,
  COALESCE(SUM(i.quantity), 0)::INTEGER AS on_hand
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id
WHERE p.is_active = true
GROUP BY p.id
HAVING COALESCE(SUM(i.quantity), 0) <= p.reorder_level;

-- ========================================
-- GET LOW STOCK PRODUCTS FUNCTION (callable via .rpc())
-- ========================================
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  category TEXT,
  unit TEXT,
  reorder_level INTEGER,
  on_hand INTEGER
)
LANGUAGE sql STABLE
AS $$
  SELECT * FROM low_stock_products ORDER BY on_hand ASC;
$$;

-- ========================================
-- GET DASHBOARD STATS
-- ========================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalProducts', (SELECT COUNT(*) FROM products WHERE is_active = true),
    'lowStock', (
      SELECT COUNT(*) FROM (
        SELECT p.id
        FROM products p
        LEFT JOIN inventory i ON i.product_id = p.id
        WHERE p.is_active = true
        GROUP BY p.id
        HAVING COALESCE(SUM(i.quantity), 0) <= p.reorder_level
          AND COALESCE(SUM(i.quantity), 0) > 0
      ) sub
    ),
    'outOfStock', (
      SELECT COUNT(*) FROM (
        SELECT p.id
        FROM products p
        LEFT JOIN inventory i ON i.product_id = p.id
        WHERE p.is_active = true
        GROUP BY p.id
        HAVING COALESCE(SUM(i.quantity), 0) = 0
      ) sub
    ),
    'pendingReceipts', (SELECT COUNT(*) FROM operations WHERE operation_type = 'receipt' AND status IN ('draft', 'confirmed')),
    'pendingDeliveries', (SELECT COUNT(*) FROM operations WHERE operation_type = 'delivery' AND status IN ('draft', 'confirmed')),
    'internalTransfers', (SELECT COUNT(*) FROM operations WHERE operation_type = 'transfer' AND status IN ('draft', 'confirmed')),
    'totalWarehouses', (SELECT COUNT(*) FROM warehouses WHERE is_active = true),
    'totalValue', 0
  ) INTO result;

  RETURN result;
END;
$$;

-- ========================================
-- STOCK BY CATEGORY
-- ========================================
CREATE OR REPLACE FUNCTION get_stock_by_category()
RETURNS TABLE (
  category TEXT,
  total_quantity BIGINT,
  product_count BIGINT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.category,
    COALESCE(SUM(i.quantity), 0) AS total_quantity,
    COUNT(DISTINCT p.id) AS product_count
  FROM products p
  LEFT JOIN inventory i ON i.product_id = p.id
  WHERE p.is_active = true
  GROUP BY p.category
  ORDER BY total_quantity DESC;
$$;

-- ========================================
-- INVENTORY MOVEMENT (last 7 days)
-- ========================================
CREATE OR REPLACE FUNCTION get_inventory_movement()
RETURNS TABLE (
  day_label TEXT,
  incoming BIGINT,
  outgoing BIGINT,
  adjustments BIGINT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    TO_CHAR(d.day, 'Dy') AS day_label,
    COALESCE(SUM(CASE WHEN sl.movement_type = 'in' THEN sl.quantity ELSE 0 END), 0) AS incoming,
    COALESCE(SUM(CASE WHEN sl.movement_type = 'out' THEN ABS(sl.quantity) ELSE 0 END), 0) AS outgoing,
    COALESCE(SUM(CASE WHEN sl.movement_type = 'adjustment' THEN ABS(sl.quantity) ELSE 0 END), 0) AS adjustments
  FROM generate_series(
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS d(day)
  LEFT JOIN stock_ledger sl ON DATE(sl.created_at) = d.day
  GROUP BY d.day
  ORDER BY d.day;
$$;

-- ========================================
-- WAREHOUSE OVERVIEW
-- ========================================
CREATE OR REPLACE FUNCTION get_warehouse_overview()
RETURNS TABLE (
  id UUID,
  name TEXT,
  code TEXT,
  total_products BIGINT,
  total_stock BIGINT,
  location_count BIGINT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    w.id,
    w.name,
    w.code,
    COUNT(DISTINCT i.product_id) AS total_products,
    COALESCE(SUM(i.quantity), 0) AS total_stock,
    (SELECT COUNT(*) FROM locations l WHERE l.warehouse_id = w.id AND l.is_active = true) AS location_count
  FROM warehouses w
  LEFT JOIN inventory i ON i.warehouse_id = w.id
  WHERE w.is_active = true
  GROUP BY w.id
  ORDER BY total_stock DESC;
$$;

-- ========================================
-- CONFIRM STOCK OPERATION (atomic transaction)
-- This is the ONLY way inventory should be modified.
-- ========================================
CREATE OR REPLACE FUNCTION confirm_stock_operation(p_operation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  op operations%ROWTYPE;
  line operation_lines%ROWTYPE;
  new_balance INTEGER;
  src_warehouse_id UUID;
  dst_warehouse_id UUID;
BEGIN
  -- Lock the operation row
  SELECT * INTO op FROM operations WHERE id = p_operation_id FOR UPDATE;

  IF op IS NULL THEN
    RAISE EXCEPTION 'Operation % not found', p_operation_id;
  END IF;

  IF op.status <> 'draft' AND op.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Operation % is not in draft/confirmed status (current: %)', p_operation_id, op.status;
  END IF;

  src_warehouse_id := op.source_warehouse_id;
  dst_warehouse_id := op.destination_warehouse_id;

  FOR line IN SELECT * FROM operation_lines WHERE operation_id = p_operation_id LOOP
    -- Deduct from source location (delivery / transfer out)
    IF op.source_location_id IS NOT NULL THEN
      UPDATE inventory
        SET quantity = quantity - line.quantity, updated_at = now()
        WHERE product_id = line.product_id AND location_id = op.source_location_id
        RETURNING quantity INTO new_balance;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'No inventory found for product % at source location %', line.product_id, op.source_location_id;
      END IF;

      IF new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for product % at source location (would be %)', line.product_id, new_balance;
      END IF;

      INSERT INTO stock_ledger (product_id, location_id, warehouse_id, operation_id, movement_type, quantity, balance_after, reference)
        VALUES (line.product_id, op.source_location_id, src_warehouse_id, op.id, 'out', -line.quantity, new_balance, op.reference);
    END IF;

    -- Add to destination location (receipt / transfer in)
    IF op.destination_location_id IS NOT NULL THEN
      INSERT INTO inventory (product_id, location_id, warehouse_id, quantity, reserved_quantity)
        VALUES (line.product_id, op.destination_location_id, dst_warehouse_id, line.quantity, 0)
        ON CONFLICT (product_id, location_id)
        DO UPDATE SET quantity = inventory.quantity + line.quantity, updated_at = now()
        RETURNING quantity INTO new_balance;

      INSERT INTO stock_ledger (product_id, location_id, warehouse_id, operation_id, movement_type, quantity, balance_after, reference)
        VALUES (line.product_id, op.destination_location_id, dst_warehouse_id, op.id, 'in', line.quantity, new_balance, op.reference);
    END IF;

    -- Update done_quantity on the line
    UPDATE operation_lines SET done_quantity = line.quantity WHERE id = line.id;
  END LOOP;

  -- Mark operation as done
  UPDATE operations SET status = 'done', completed_date = now() WHERE id = p_operation_id;
END;
$$;

-- ========================================
-- GENERATE OPERATION REFERENCE
-- ========================================
CREATE OR REPLACE FUNCTION generate_operation_reference(op_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  seq INTEGER;
BEGIN
  CASE op_type
    WHEN 'receipt' THEN prefix := 'REC';
    WHEN 'delivery' THEN prefix := 'DEL';
    WHEN 'transfer' THEN prefix := 'TRF';
    WHEN 'adjustment' THEN prefix := 'ADJ';
    ELSE prefix := 'OP';
  END CASE;

  SELECT COUNT(*) + 1 INTO seq FROM operations WHERE operation_type = op_type;

  RETURN prefix || '-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(seq::TEXT, 3, '0');
END;
$$;

-- ========================================
-- RLS policy for the low_stock_products view
-- ========================================
-- Views inherit RLS from base tables, so no additional policy needed.

-- ========================================
-- Grant anon/authenticated access to RPC functions
-- ========================================
GRANT EXECUTE ON FUNCTION get_low_stock_products() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_stock_by_category() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_inventory_movement() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_warehouse_overview() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION confirm_stock_operation(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_operation_reference(TEXT) TO authenticated, anon;
