"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Warehouse,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { DashboardStats } from "@/lib/mock-data";
import { clsx } from "clsx";

interface KpiCardsProps {
  stats: DashboardStats;
}

const kpiConfig = [
  {
    key: "totalProducts" as const,
    label: "Total Products",
    icon: Package,
    gradient: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/10",
    trend: "+3 this week",
    trendUp: true,
  },
  {
    key: "lowStock" as const,
    label: "Low Stock",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/10",
    trend: "+2 since yesterday",
    trendUp: false,
  },
  {
    key: "outOfStock" as const,
    label: "Out of Stock",
    icon: XCircle,
    gradient: "from-red-500 to-rose-500",
    bgGlow: "bg-red-500/10",
    trend: "No change",
    trendUp: true,
  },
  {
    key: "pendingReceipts" as const,
    label: "Pending Receipts",
    icon: ArrowDownToLine,
    gradient: "from-emerald-500 to-green-500",
    bgGlow: "bg-emerald-500/10",
    trend: "2 awaiting",
    trendUp: true,
  },
  {
    key: "pendingDeliveries" as const,
    label: "Pending Deliveries",
    icon: ArrowUpFromLine,
    gradient: "from-violet-500 to-purple-500",
    bgGlow: "bg-violet-500/10",
    trend: "2 to process",
    trendUp: false,
  },
  {
    key: "internalTransfers" as const,
    label: "Internal Transfers",
    icon: ArrowLeftRight,
    gradient: "from-pink-500 to-rose-500",
    bgGlow: "bg-pink-500/10",
    trend: "1 in progress",
    trendUp: true,
  },
];

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiConfig.map((kpi) => {
        const Icon = kpi.icon;
        const value = stats[kpi.key];

        return (
          <Card
            key={kpi.key}
            className="relative overflow-hidden border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 group py-0"
          >
            {/* Subtle gradient glow on hover */}
            <div
              className={clsx(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                kpi.bgGlow
              )}
            />
            <CardContent className="relative p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br shadow-sm",
                    kpi.gradient
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {typeof value === "number" && kpi.key === "totalValue"
                    ? `₹${value.toLocaleString()}`
                    : value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {kpi.label}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {kpi.trendUp ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-amber-500" />
                )}
                <span
                  className={clsx(
                    "text-[11px] font-medium",
                    kpi.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {kpi.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
