"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
} from "lucide-react";
import type { RecentOperation } from "@/lib/mock-data";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";

interface RecentOperationsTableProps {
  operations: RecentOperation[];
}

export function RecentOperationsTable({
  operations,
}: RecentOperationsTableProps) {
  const getOperationConfig = (type: string) => {
    switch (type) {
      case "receipt":
        return {
          icon: ArrowDownToLine,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "delivery":
        return {
          icon: ArrowUpFromLine,
          color: "text-violet-500",
          bg: "bg-violet-500/10",
        };
      case "transfer":
        return {
          icon: ArrowLeftRight,
          color: "text-pink-500",
          bg: "bg-pink-500/10",
        };
      case "adjustment":
        return {
          icon: ClipboardCheck,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        };
      default:
        return {
          icon: ClipboardCheck,
          color: "text-muted-foreground",
          bg: "bg-muted",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
          >
            Done
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
          >
            Confirmed
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border"
          >
            Draft
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-border/50 col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Recent Operations
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Latest inventory movements and updates
            </p>
          </div>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[180px]">Reference</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op) => {
              const config = getOperationConfig(op.type);
              const Icon = config.icon;

              return (
                <TableRow
                  key={op.id}
                  className="border-border/50 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <TableCell className="font-medium">
                    {op.reference}
                    {op.itemCount > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({op.itemCount} items)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={clsx(
                          "flex items-center justify-center w-6 h-6 rounded-md",
                          config.bg
                        )}
                      >
                        <Icon className={clsx("w-3.5 h-3.5", config.color)} />
                      </div>
                      <span className="capitalize text-sm">{op.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {op.partner || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(op.status)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(op.date), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
