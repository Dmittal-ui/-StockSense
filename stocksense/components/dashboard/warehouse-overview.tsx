"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, Layers } from "lucide-react";
import type { WarehouseOverview as WarehouseOverviewType } from "@/lib/mock-data";
import { Progress } from "@base-ui/react/progress";
import { clsx } from "clsx";

interface WarehouseOverviewProps {
  warehouses: WarehouseOverviewType[];
}

export function WarehouseOverview({ warehouses }: WarehouseOverviewProps) {
  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Warehouse Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Stock distribution by location
            </p>
          </div>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Manage
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 pr-2">
          {warehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {warehouse.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {warehouse.code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{warehouse.totalStock}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    Total Items
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="w-3.5 h-3.5" />
                  <span>{warehouse.totalProducts} Products</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{warehouse.locations} Locations</span>
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Capacity Utilization
                  </span>
                  <span>{warehouse.utilizationPercent}%</span>
                </div>
                <Progress.Root value={warehouse.utilizationPercent} className="flex w-full items-center">
                  <Progress.Track className="relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted">
                    <Progress.Indicator
                      className={clsx(
                        "h-full transition-all",
                        warehouse.utilizationPercent > 80
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                      )}
                    />
                  </Progress.Track>
                </Progress.Root>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
