import { createClient } from "@/lib/supabase/server";
import {
  mockDashboardStats,
  mockInventoryMovement,
  mockStockByCategory,
  mockRecentOperations,
  mockLowStockProducts,
  mockWarehouseOverview,
} from "@/lib/mock-data";
import type {
  DashboardStats,
  LowStockProduct,
  RecentOperation,
  WarehouseOverview,
  StockByCategory,
  InventoryMovement,
} from "@/lib/mock-data";

const CATEGORY_COLORS: Record<string, string> = {
  "Raw Materials": "#6366f1",
  Fasteners: "#8b5cf6",
  Consumables: "#a78bfa",
  Components: "#c4b5fd",
  Safety: "#e879f9",
  Plumbing: "#f472b6",
  Machinery: "#fb7185",
  Electrical: "#f97316",
};

/**
 * Fetch all dashboard data from Supabase.
 * Falls back to mock data if Supabase is not configured or queries fail.
 */
export async function getDashboardData() {
  const isConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-supabase-url-here";

  if (!isConfigured) {
    return {
      stats: mockDashboardStats,
      lowStockProducts: mockLowStockProducts,
      recentOperations: mockRecentOperations,
      warehouseOverview: mockWarehouseOverview,
      stockByCategory: mockStockByCategory,
      inventoryMovement: mockInventoryMovement,
    };
  }

  try {
    const supabase = await createClient();

    // Fetch all data in parallel
    const [statsRes, lowStockRes, recentOpsRes, warehouseRes, categoryRes, movementRes] =
      await Promise.all([
        supabase.rpc("get_dashboard_stats"),
        supabase.rpc("get_low_stock_products"),
        supabase
          .from("operations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.rpc("get_warehouse_overview"),
        supabase.rpc("get_stock_by_category"),
        supabase.rpc("get_inventory_movement"),
      ]);

    // Parse stats
    const stats: DashboardStats = (statsRes.data as any)
      ? (statsRes.data as any as DashboardStats)
      : mockDashboardStats;

    // Parse low stock products
    const lowStockProducts: LowStockProduct[] = (lowStockRes.data as any)
      ? ((lowStockRes.data as any) as Array<{
          id: string;
          name: string;
          sku: string;
          category: string;
          unit: string;
          reorder_level: number;
          on_hand: number;
        }>).map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          unit: p.unit,
          currentStock: p.on_hand,
          reorderLevel: p.reorder_level,
          warehouse: "",
          severity:
            p.on_hand <= p.reorder_level * 0.3
              ? "critical"
              : p.on_hand <= p.reorder_level * 0.6
                ? "warning"
                : "low",
        }))
      : mockLowStockProducts;

    // Parse recent operations
    const recentOperations: RecentOperation[] = (recentOpsRes.data as any)
      ? ((recentOpsRes.data as any) as Array<{
          id: string;
          reference: string;
          operation_type: string;
          status: string;
          partner_name: string | null;
          created_at: string;
          notes: string | null;
        }>).map((op) => ({
          id: op.id,
          reference: op.reference,
          type: op.operation_type as RecentOperation["type"],
          status: op.status as RecentOperation["status"],
          partner: op.partner_name,
          date: op.created_at,
          itemCount: 0,
          notes: op.notes || "",
        }))
      : mockRecentOperations;

    // Parse warehouse overview
    const warehouseOverview: WarehouseOverview[] = (warehouseRes.data as any)
      ? ((warehouseRes.data as any) as Array<{
          id: string;
          name: string;
          code: string;
          total_products: number;
          total_stock: number;
          location_count: number;
        }>).map((w) => ({
          id: w.id,
          name: w.name,
          code: w.code,
          totalProducts: w.total_products,
          totalStock: w.total_stock,
          locations: w.location_count,
          utilizationPercent: Math.min(
            100,
            Math.round((w.total_stock / Math.max(w.total_products * 100, 1)) * 100)
          ),
        }))
      : mockWarehouseOverview;

    // Parse stock by category
    const stockByCategory: StockByCategory[] = (categoryRes.data as any)
      ? ((categoryRes.data as any) as Array<{
          category: string;
          total_quantity: number;
          product_count: number;
        }>).map((c, i) => ({
          category: c.category,
          totalQuantity: c.total_quantity,
          productCount: c.product_count,
          color:
            CATEGORY_COLORS[c.category] ||
            `hsl(${(i * 45) % 360}, 70%, 60%)`,
        }))
      : mockStockByCategory;

    // Parse inventory movement
    const inventoryMovement: InventoryMovement[] = (movementRes.data as any)
      ? ((movementRes.data as any) as Array<{
          day_label: string;
          incoming: number;
          outgoing: number;
          adjustments: number;
        }>).map((m) => ({
          date: m.day_label,
          incoming: m.incoming,
          outgoing: m.outgoing,
          adjustments: m.adjustments,
        }))
      : mockInventoryMovement;

    return {
      stats,
      lowStockProducts,
      recentOperations,
      warehouseOverview,
      stockByCategory,
      inventoryMovement,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data from Supabase:", error);
    return {
      stats: mockDashboardStats,
      lowStockProducts: mockLowStockProducts,
      recentOperations: mockRecentOperations,
      warehouseOverview: mockWarehouseOverview,
      stockByCategory: mockStockByCategory,
      inventoryMovement: mockInventoryMovement,
    };
  }
}
