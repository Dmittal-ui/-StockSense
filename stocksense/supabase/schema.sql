-- StockSense Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- WAREHOUSES
-- ========================================
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- LOCATIONS (shelves, racks, bins within warehouses)
-- ========================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('shelf', 'rack', 'bin', 'zone', 'floor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(warehouse_id, code)
);

-- ========================================
-- PRODUCTS
-- ========================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  description TEXT,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- INVENTORY (current stock state per product per location)
-- ========================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, location_id)
);

-- ========================================
-- OPERATIONS (receipts, deliveries, transfers, adjustments)
-- ========================================
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('receipt', 'delivery', 'transfer', 'adjustment')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'done', 'cancelled')),
  source_location_id UUID REFERENCES locations(id),
  destination_location_id UUID REFERENCES locations(id),
  source_warehouse_id UUID REFERENCES warehouses(id),
  destination_warehouse_id UUID REFERENCES warehouses(id),
  partner_name TEXT,
  notes TEXT,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- OPERATION LINES (products within an operation)
-- ========================================
CREATE TABLE operation_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  done_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- STOCK LEDGER (complete movement history)
-- ========================================
CREATE TABLE stock_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  operation_id UUID REFERENCES operations(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_operations_type ON operations(operation_type);
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_created ON operations(created_at DESC);
CREATE INDEX idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX idx_stock_ledger_created ON stock_ledger(created_at DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

-- ========================================
-- UPDATED_AT TRIGGER (auto-update timestamps)
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (enable for all tables)
-- ========================================
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Authenticated users can read warehouses" ON warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read locations" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read inventory" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read operations" ON operations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read operation_lines" ON operation_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read stock_ledger" ON stock_ledger FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update (fine-tune later per role)
CREATE POLICY "Authenticated users can manage warehouses" ON warehouses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage locations" ON locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage inventory" ON inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage operations" ON operations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage operation_lines" ON operation_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage stock_ledger" ON stock_ledger FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- SEED DATA
-- ========================================

-- Warehouses
INSERT INTO warehouses (id, name, code, address) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Main Warehouse', 'WH-MAIN', '123 Industrial Ave, Mumbai'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Production Floor', 'WH-PROD', '456 Manufacturing St, Mumbai'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Distribution Center', 'WH-DIST', '789 Logistics Rd, Pune');

-- Locations
INSERT INTO locations (id, warehouse_id, name, code, location_type) VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rack A', 'MAIN-RA', 'rack'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rack B', 'MAIN-RB', 'rack'),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Shelf C', 'MAIN-SC', 'shelf'),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Zone 1', 'PROD-Z1', 'zone'),
  ('b8c9d0e1-f2a3-4567-bcde-678901234567', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Zone 2', 'PROD-Z2', 'zone'),
  ('c9d0e1f2-a3b4-5678-cdef-789012345678', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Bay 1', 'DIST-B1', 'bin'),
  ('d0e1f2a3-b4c5-6789-defa-890123456789', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Bay 2', 'DIST-B2', 'bin');

-- Products
INSERT INTO products (id, name, sku, category, unit, reorder_level, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Steel Rod 12mm', 'STL-ROD-12', 'Raw Materials', 'kg', 50, 'High-grade steel rod, 12mm diameter'),
  ('22222222-2222-2222-2222-222222222222', 'Bearing BRG-021', 'BRG-021', 'Components', 'pcs', 20, 'Industrial ball bearing, standard size'),
  ('33333333-3333-3333-3333-333333333333', 'Hex Bolt M10', 'HEX-M10', 'Fasteners', 'pcs', 100, 'M10 hex bolt, zinc plated'),
  ('44444444-4444-4444-4444-444444444444', 'Copper Wire 2.5mm', 'COP-W25', 'Raw Materials', 'meter', 200, '2.5mm copper electrical wire'),
  ('55555555-5555-5555-5555-555555555555', 'Safety Gloves', 'SAF-GLV', 'Safety', 'pair', 30, 'Industrial safety gloves, heat resistant'),
  ('66666666-6666-6666-6666-666666666666', 'Hydraulic Pump HP-50', 'HYD-P50', 'Machinery', 'pcs', 5, '50 bar hydraulic pump'),
  ('77777777-7777-7777-7777-777777777777', 'Welding Electrode', 'WLD-E01', 'Consumables', 'kg', 25, 'AWS E6013 welding electrode'),
  ('88888888-8888-8888-8888-888888888888', 'PVC Pipe 4inch', 'PVC-P4', 'Plumbing', 'pcs', 15, '4 inch PVC pipe, 6m length'),
  ('99999999-9999-9999-9999-999999999999', 'Motor 5HP', 'MOT-5HP', 'Machinery', 'pcs', 3, '5HP three-phase electric motor'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lubricant Oil', 'LUB-OIL', 'Consumables', 'liter', 40, 'Industrial grade lubricant oil'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Circuit Breaker 32A', 'CB-32A', 'Electrical', 'pcs', 10, '32A miniature circuit breaker'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gasket Set', 'GSK-SET', 'Components', 'set', 15, 'Universal gasket set for industrial use');

-- Inventory (current stock)
INSERT INTO inventory (product_id, location_id, warehouse_id, quantity, reserved_quantity) VALUES
  ('11111111-1111-1111-1111-111111111111', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 300, 20),
  ('11111111-1111-1111-1111-111111111111', 'a7b8c9d0-e1f2-3456-abcd-567890123456', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 12, 0),
  ('22222222-2222-2222-2222-222222222222', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 40, 5),
  ('22222222-2222-2222-2222-222222222222', 'b8c9d0e1-f2a3-4567-bcde-678901234567', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 4, 0),
  ('33333333-3333-3333-3333-333333333333', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 450, 0),
  ('44444444-4444-4444-4444-444444444444', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 85, 0),
  ('55555555-5555-5555-5555-555555555555', 'a7b8c9d0-e1f2-3456-abcd-567890123456', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 28, 0),
  ('66666666-6666-6666-6666-666666666666', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 2, 0),
  ('77777777-7777-7777-7777-777777777777', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 0),
  ('88888888-8888-8888-8888-888888888888', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 45, 10),
  ('99999999-9999-9999-9999-999999999999', 'b8c9d0e1-f2a3-4567-bcde-678901234567', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 1, 0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 120, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd0e1f2a3-b4c5-6789-defa-890123456789', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 6, 0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 10, 0);

-- Operations (recent activity)
INSERT INTO operations (id, reference, operation_type, status, source_warehouse_id, destination_warehouse_id, partner_name, scheduled_date, completed_date, notes) VALUES
  ('op111111-1111-1111-1111-111111111111', 'REC-2024-001', 'receipt', 'done', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tata Steel Supplies', now() - interval '5 days', now() - interval '5 days', 'Monthly steel rod delivery'),
  ('op222222-2222-2222-2222-222222222222', 'REC-2024-002', 'receipt', 'confirmed', NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bearing Corp India', now() - interval '1 day', NULL, 'Bearing restock'),
  ('op333333-3333-3333-3333-333333333333', 'REC-2024-003', 'receipt', 'draft', NULL, 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'FastenAll Ltd', now() + interval '3 days', NULL, 'Fastener batch order'),
  ('op444444-4444-4444-4444-444444444444', 'DEL-2024-001', 'delivery', 'done', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'BuildTech Industries', now() - interval '3 days', now() - interval '3 days', 'Steel rods for construction project'),
  ('op555555-5555-5555-5555-555555555555', 'DEL-2024-002', 'delivery', 'confirmed', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'MechWorks Pvt Ltd', now() - interval '12 hours', NULL, 'Bearings and bolts delivery'),
  ('op666666-6666-6666-6666-666666666666', 'DEL-2024-003', 'delivery', 'draft', 'c3d4e5f6-a7b8-9012-cdef-123456789012', NULL, 'ElecPower Solutions', now() + interval '2 days', NULL, 'Circuit breakers and motors'),
  ('op777777-7777-7777-7777-777777777777', 'TRF-2024-001', 'transfer', 'done', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', NULL, now() - interval '2 days', now() - interval '2 days', 'Steel rods to production'),
  ('op888888-8888-8888-8888-888888888888', 'TRF-2024-002', 'transfer', 'confirmed', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c3d4e5f6-a7b8-9012-cdef-123456789012', NULL, now(), NULL, 'Pipe stock redistribution'),
  ('op999999-9999-9999-9999-999999999999', 'ADJ-2024-001', 'adjustment', 'done', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, NULL, now() - interval '4 days', now() - interval '4 days', 'Monthly physical count — welding electrodes corrected'),
  ('opaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ADJ-2024-002', 'adjustment', 'draft', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', NULL, NULL, now() + interval '1 day', NULL, 'Quarterly audit — production floor');

-- Stock Ledger entries
INSERT INTO stock_ledger (product_id, location_id, warehouse_id, operation_id, movement_type, quantity, balance_after, reference, notes, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'op111111-1111-1111-1111-111111111111', 'in', 200, 300, 'REC-2024-001', 'Received from Tata Steel', now() - interval '5 days'),
  ('11111111-1111-1111-1111-111111111111', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'op444444-4444-4444-4444-444444444444', 'out', -80, 220, 'DEL-2024-001', 'Delivered to BuildTech', now() - interval '3 days'),
  ('11111111-1111-1111-1111-111111111111', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'op777777-7777-7777-7777-777777777777', 'out', -20, 300, 'TRF-2024-001', 'Transferred to production', now() - interval '2 days'),
  ('11111111-1111-1111-1111-111111111111', 'a7b8c9d0-e1f2-3456-abcd-567890123456', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'op777777-7777-7777-7777-777777777777', 'in', 20, 12, 'TRF-2024-001', 'Received from main warehouse', now() - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'op222222-2222-2222-2222-222222222222', 'in', 30, 40, 'REC-2024-002', 'Bearing restock', now() - interval '1 day'),
  ('77777777-7777-7777-7777-777777777777', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'op999999-9999-9999-9999-999999999999', 'adjustment', -5, 8, 'ADJ-2024-001', 'Physical count correction', now() - interval '4 days'),
  ('33333333-3333-3333-3333-333333333333', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'in', 450, 450, 'INIT', 'Initial stock load', now() - interval '30 days'),
  ('44444444-4444-4444-4444-444444444444', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'in', 85, 85, 'INIT', 'Initial stock load', now() - interval '30 days');
