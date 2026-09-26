// Mock data for the dashboard - mirrors the seed data from schema.sql
// Used when Supabase is not yet configured or for development/demo

export interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  internalTransfers: number;
  totalWarehouses: number;
  totalValue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  warehouse: string;
  severity: "critical" | "warning" | "low";
}

export interface RecentOperation {
  id: string;
  reference: string;
  type: "receipt" | "delivery" | "transfer" | "adjustment";
  status: "draft" | "confirmed" | "done" | "cancelled";
  partner: string | null;
  date: string;
  itemCount: number;
  notes: string;
}

export interface WarehouseOverview {
  id: string;
  name: string;
  code: string;
  totalProducts: number;
  totalStock: number;
  locations: number;
  utilizationPercent: number;
}

export interface StockByCategory {
  category: string;
  totalQuantity: number;
  productCount: number;
  color: string;
}

export interface InventoryMovement {
  date: string;
  incoming: number;
  outgoing: number;
  adjustments: number;
}

// ==============================
// MOCK DATA
// ==============================

export const mockDashboardStats: DashboardStats = {
  totalProducts: 12,
  lowStock: 6,
  outOfStock: 0,
  pendingReceipts: 2,
  pendingDeliveries: 2,
  internalTransfers: 1,
  totalWarehouses: 3,
  totalValue: 284500,
};

export const mockLowStockProducts: LowStockProduct[] = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    name: "Motor 5HP",
    sku: "MOT-5HP",
    category: "Machinery",
    unit: "pcs",
    currentStock: 1,
    reorderLevel: 3,
    warehouse: "Production Floor",
    severity: "critical",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Hydraulic Pump HP-50",
    sku: "HYD-P50",
    category: "Machinery",
    unit: "pcs",
    currentStock: 2,
    reorderLevel: 5,
    warehouse: "Distribution Center",
    severity: "critical",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Bearing BRG-021",
    sku: "BRG-021",
    category: "Components",
    unit: "pcs",
    currentStock: 4,
    reorderLevel: 20,
    warehouse: "Production Floor",
    severity: "critical",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "Circuit Breaker 32A",
    sku: "CB-32A",
    category: "Electrical",
    unit: "pcs",
    currentStock: 6,
    reorderLevel: 10,
    warehouse: "Distribution Center",
    severity: "warning",
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    name: "Welding Electrode",
    sku: "WLD-E01",
    category: "Consumables",
    unit: "kg",
    currentStock: 8,
    reorderLevel: 25,
    warehouse: "Main Warehouse",
    severity: "warning",
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Steel Rod 12mm",
    sku: "STL-ROD-12",
    category: "Raw Materials",
    unit: "kg",
    currentStock: 12,
    reorderLevel: 50,
    warehouse: "Production Floor",
    severity: "warning",
  },
];

export const mockRecentOperations: RecentOperation[] = [
  {
    id: "op222222-2222-2222-2222-222222222222",
    reference: "REC-2024-002",
    type: "receipt",
    status: "confirmed",
    partner: "Bearing Corp India",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 2,
    notes: "Bearing restock",
  },
  {
    id: "op555555-5555-5555-5555-555555555555",
    reference: "DEL-2024-002",
    type: "delivery",
    status: "confirmed",
    partner: "MechWorks Pvt Ltd",
    date: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 3,
    notes: "Bearings and bolts delivery",
  },
  {
    id: "op888888-8888-8888-8888-888888888888",
    reference: "TRF-2024-002",
    type: "transfer",
    status: "confirmed",
    partner: null,
    date: new Date(Date.now() - 0.25 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
    notes: "Pipe stock redistribution",
  },
  {
    id: "op777777-7777-7777-7777-777777777777",
    reference: "TRF-2024-001",
    type: "transfer",
    status: "done",
    partner: null,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
    notes: "Steel rods to production",
  },
  {
    id: "op444444-4444-4444-4444-444444444444",
    reference: "DEL-2024-001",
    type: "delivery",
    status: "done",
    partner: "BuildTech Industries",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
    notes: "Steel rods for construction project",
  },
  {
    id: "op999999-9999-9999-9999-999999999999",
    reference: "ADJ-2024-001",
    type: "adjustment",
    status: "done",
    partner: null,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
    notes: "Monthly physical count — welding electrodes corrected",
  },
  {
    id: "op111111-1111-1111-1111-111111111111",
    reference: "REC-2024-001",
    type: "receipt",
    status: "done",
    partner: "Tata Steel Supplies",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
    notes: "Monthly steel rod delivery",
  },
];

export const mockWarehouseOverview: WarehouseOverview[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Main Warehouse",
    code: "WH-MAIN",
    totalProducts: 7,
    totalStock: 1013,
    locations: 3,
    utilizationPercent: 72,
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Production Floor",
    code: "WH-PROD",
    totalProducts: 4,
    totalStock: 45,
    locations: 2,
    utilizationPercent: 35,
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Distribution Center",
    code: "WH-DIST",
    totalProducts: 3,
    totalStock: 53,
    locations: 2,
    utilizationPercent: 48,
  },
];

export const mockStockByCategory: StockByCategory[] = [
  { category: "Raw Materials", totalQuantity: 397, productCount: 2, color: "#6366f1" },
  { category: "Fasteners", totalQuantity: 450, productCount: 1, color: "#8b5cf6" },
  { category: "Consumables", totalQuantity: 128, productCount: 2, color: "#a78bfa" },
  { category: "Components", totalQuantity: 54, productCount: 2, color: "#c4b5fd" },
  { category: "Safety", totalQuantity: 28, productCount: 1, color: "#e879f9" },
  { category: "Plumbing", totalQuantity: 45, productCount: 1, color: "#f472b6" },
  { category: "Machinery", totalQuantity: 3, productCount: 2, color: "#fb7185" },
  { category: "Electrical", totalQuantity: 6, productCount: 1, color: "#f97316" },
];

export const mockInventoryMovement: InventoryMovement[] = [
  { date: "Mon", incoming: 0, outgoing: 0, adjustments: 0 },
  { date: "Tue", incoming: 200, outgoing: 80, adjustments: -5 },
  { date: "Wed", incoming: 0, outgoing: 20, adjustments: 0 },
  { date: "Thu", incoming: 30, outgoing: 0, adjustments: 0 },
  { date: "Fri", incoming: 0, outgoing: 35, adjustments: 0 },
  { date: "Sat", incoming: 50, outgoing: 15, adjustments: 0 },
  { date: "Sun", incoming: 10, outgoing: 0, adjustments: 0 },
];
