import { KpiCards } from "@/components/dashboard/kpi-cards";
import { InventoryMovementChart } from "@/components/dashboard/inventory-movement-chart";
import { StockByCategoryChart } from "@/components/dashboard/stock-by-category-chart";
import { RecentOperationsTable } from "@/components/dashboard/recent-operations-table";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { WarehouseOverview } from "@/components/dashboard/warehouse-overview";

import {
  mockDashboardStats,
  mockInventoryMovement,
  mockStockByCategory,
  mockRecentOperations,
  mockLowStockProducts,
  mockWarehouseOverview,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here's an overview of your inventory today.
        </p>
      </div>

      {/* KPI Row */}
      <KpiCards stats={mockDashboardStats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-full">
          <InventoryMovementChart data={mockInventoryMovement} />
        </div>
        <div className="h-full">
          <StockByCategoryChart data={mockStockByCategory} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <RecentOperationsTable operations={mockRecentOperations} />
        </div>
        <div className="h-full">
          <LowStockAlerts products={mockLowStockProducts} />
        </div>
        <div className="h-full">
          <WarehouseOverview warehouses={mockWarehouseOverview} />
        </div>
      </div>
    </div>
  );
}
