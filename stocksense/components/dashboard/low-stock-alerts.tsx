"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";
import type { LowStockProduct } from "@/lib/mock-data";
import { clsx } from "clsx";
import { Progress } from "@base-ui/react/progress";

interface LowStockAlertsProps {
  products: LowStockProduct[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  return (
    <Card className="border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Low Stock Alerts
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {products.length} products need reordering
              </p>
            </div>
          </div>
          <Badge variant="destructive" className="font-semibold">
            Action Needed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-4 pr-2">
          {products.slice(0, 5).map((product) => {
            const percentage = Math.max(
              0,
              Math.min(100, (product.currentStock / product.reorderLevel) * 100)
            );

            return (
              <div
                key={product.id}
                className="group flex flex-col gap-2 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.sku} • {product.warehouse}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={clsx(
                        "text-sm font-bold",
                        product.severity === "critical"
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {product.currentStock} {product.unit}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                      Reorder at {product.reorderLevel}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 mt-1">
                  <Progress.Root value={percentage} className="flex w-full items-center">
                    <Progress.Track className="relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted">
                      <Progress.Indicator
                        className={clsx(
                          "h-full transition-all",
                          product.severity === "critical" ? "bg-red-500" : "bg-amber-500"
                        )}
                      />
                    </Progress.Track>
                  </Progress.Root>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {product.severity === "critical"
                        ? "Critically Low"
                        : "Getting Low"}
                    </span>
                    <span>{Math.round(percentage)}% of minimum</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
