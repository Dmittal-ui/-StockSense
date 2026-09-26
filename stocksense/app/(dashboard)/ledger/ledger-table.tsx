"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine, Search } from "lucide-react";

export function LedgerTable({
  ledgerEntries,
  products,
  warehouses,
}: {
  ledgerEntries: any[];
  products: any[];
  warehouses: any[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getTypeBadge = (type: string) => {
    if (type === "in") {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <ArrowDownToLine className="w-3 h-3 mr-1" /> In
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
        <ArrowUpFromLine className="w-3 h-3 mr-1" /> Out
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by operation reference..."
            className="pl-9"
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => {
              // debounce is better, but simple timeout works for demo
              const val = e.target.value;
              setTimeout(() => handleFilterChange("search", val), 300);
            }}
          />
        </div>

        <Select
          defaultValue={searchParams.get("product_id") || "all"}
          onValueChange={(val) => handleFilterChange("product_id", val as string)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("warehouse_id") || "all"}
          onValueChange={(val) => handleFilterChange("warehouse_id", val as string)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Operation Ref</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty Change</TableHead>
              <TableHead className="text-right">Stock After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No ledger entries found.
                </TableCell>
              </TableRow>
            ) : (
              ledgerEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(entry.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                    {entry.operation?.reference || "-"}
                  </TableCell>
                  <TableCell>
                    {entry.product?.name} <span className="text-muted-foreground text-xs">({entry.product?.sku})</span>
                  </TableCell>
                  <TableCell>{entry.warehouse?.name}</TableCell>
                  <TableCell>{getTypeBadge(entry.movement_type)}</TableCell>
                  <TableCell className={`text-right font-medium ${entry.movement_type === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                    {entry.movement_type === "in" ? "+" : "-"}{entry.quantity}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {entry.stock_after_operation}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
