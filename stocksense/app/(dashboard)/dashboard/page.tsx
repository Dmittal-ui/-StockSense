import { KpiCards } from "@/components/dashboard/kpi-cards";
import { InventoryMovementChart } from "@/components/dashboard/inventory-movement-chart";
import { StockByCategoryChart } from "@/components/dashboard/stock-by-category-chart";
import { RecentOperationsTable } from "@/components/dashboard/recent-operations-table";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { WarehouseOverview } from "@/components/dashboard/warehouse-overview";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const {
    stats,
    inventoryMovement,
    stockByCategory,
    recentOperations,
    lowStockProducts,
    warehouseOverview,
  } = await getDashboardData();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here's an overview of your inventory today.
        </p>
      </div>

      {/* KPI Row */}
      <KpiCards stats={stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-full">
          <InventoryMovementChart data={inventoryMovement} />
        </div>
        <div className="h-full">
          <StockByCategoryChart data={stockByCategory} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <RecentOperationsTable operations={recentOperations} />
        </div>
        <div className="h-full">
          <LowStockAlerts products={lowStockProducts} />
        </div>
        <div className="h-full">
          <WarehouseOverview warehouses={warehouseOverview} />
        </div>
      </div>
    </div>
  );
}

