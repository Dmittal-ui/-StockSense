"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, X, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Trash2 } from "lucide-react";
import { createOperation, confirmOperation, cancelOperation } from "./actions";
import { toast } from "sonner";
import { clsx } from "clsx";
import type { Operation, Product, Warehouse } from "@/lib/database.types";

type OperationRow = Operation & {
  source_warehouse: Pick<Warehouse, "name"> | null;
  destination_warehouse: Pick<Warehouse, "name"> | null;
};

export function OperationsTable({ 
  operations, 
  products, 
  warehouses 
}: { 
  operations: OperationRow[];
  products: Pick<Product, "id" | "name" | "sku">[];
  warehouses: Pick<Warehouse, "id" | "name">[];
}) {
  const [filterType, setFilterType] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pendingOperationIds = useRef(new Set<string>());
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [opType, setOpType] = useState<string>("receipt");
  const [sourceId, setSourceId] = useState<string>("");
  const [destId, setDestId] = useState<string>("");
  const [items, setItems] = useState<Array<{ product_id: string; quantity: number }>>([{ product_id: "", quantity: 1 }]);

  const filteredOps = filterType === "all" 
    ? operations 
    : operations.filter(o => o.operation_type === filterType);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Draft</Badge>;
      case "done":
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Confirmed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "receipt":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ArrowDownToLine className="w-3 h-3 mr-1" /> Receipt
          </Badge>
        );
      case "delivery":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <ArrowUpFromLine className="w-3 h-3 mr-1" /> Delivery
          </Badge>
        );
      case "transfer":
        return (
          <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
            <ArrowLeftRight className="w-3 h-3 mr-1" /> Transfer
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleCreate = () => {
    if (items.length === 0) {
      toast.error("Add at least one line item.");
      return;
    }
    if (items.some(i => !i.product_id || !Number.isInteger(i.quantity) || i.quantity <= 0)) {
      toast.error("Please fill all item lines correctly.");
      return;
    }
    if (new Set(items.map((item) => item.product_id)).size !== items.length) {
      toast.error("Each product can only appear once.");
      return;
    }
    if ((opType === "delivery" || opType === "transfer") && !sourceId) {
      toast.error("Source warehouse required.");
      return;
    }
    if ((opType === "receipt" || opType === "transfer") && !destId) {
      toast.error("Destination warehouse required.");
      return;
    }
    if (opType === "transfer" && sourceId === destId) {
      toast.error("Transfer source and destination must be different.");
      return;
    }

    startTransition(async () => {
      try {
        await createOperation({
          type: opType,
          source_warehouse_id: (opType === "delivery" || opType === "transfer") ? sourceId : null,
          destination_warehouse_id: (opType === "receipt" || opType === "transfer") ? destId : null,
          items
        });
        toast.success("Draft operation created successfully.");
        setIsDialogOpen(false);
        setItems([{ product_id: "", quantity: 1 }]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to create operation.");
      }
    });
  };

  const handleConfirm = (id: string) => {
    if (pendingOperationIds.current.has(id)) return;
    pendingOperationIds.current.add(id);
    setPendingOperations(new Set(pendingOperationIds.current));

    startTransition(async () => {
      try {
        await confirmOperation(id);
        toast.success("Operation confirmed and stock updated.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to confirm operation.");
      } finally {
        pendingOperationIds.current.delete(id);
        setPendingOperations(new Set(pendingOperationIds.current));
        router.refresh();
      }
    });
  };

  const handleCancel = (id: string) => {
    if (pendingOperationIds.current.has(id)) return;
    pendingOperationIds.current.add(id);
    setPendingOperations(new Set(pendingOperationIds.current));

    startTransition(async () => {
      try {
        await cancelOperation(id);
        toast.success("Operation cancelled.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to cancel operation.");
      } finally {
        pendingOperationIds.current.delete(id);
        setPendingOperations(new Set(pendingOperationIds.current));
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex space-x-2">
          {["all", "receipt", "delivery", "transfer"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                filterType === type
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Operation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Draft New Operation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Operation Type</Label>
                <Select value={opType} onValueChange={(val) => setOpType(val as string)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receipt">Receipt (In)</SelectItem>
                    <SelectItem value="delivery">Delivery (Out)</SelectItem>
                    <SelectItem value="transfer">Internal Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(opType === "delivery" || opType === "transfer") && (
                <div className="space-y-2">
                  <Label>Source Warehouse</Label>
                  <Select value={sourceId} onValueChange={(val) => setSourceId(val as string)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(opType === "receipt" || opType === "transfer") && (
                <div className="space-y-2">
                  <Label>Destination Warehouse</Label>
                  <Select value={destId} onValueChange={(val) => setDestId(val as string)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <Label>Line Items</Label>
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Select 
                        value={item.product_id} 
                        onValueChange={(val) => {
                          const newItems = [...items];
                          newItems[index].product_id = val as string;
                          setItems(newItems);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].quantity = parseInt(e.target.value) || 0;
                          setItems(newItems);
                        }}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (items.length > 1) {
                          setItems(items.filter((_, i) => i !== index));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setItems([...items, { product_id: "", quantity: 1 }])}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Line
                </Button>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isPending}>
                  {isPending ? "Creating..." : "Create Draft"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No operations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOps.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                    {op.reference}
                  </TableCell>
                  <TableCell>{getTypeBadge(op.operation_type)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {op.source_warehouse?.name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {op.destination_warehouse?.name || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(op.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(op.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {op.status === "draft" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleConfirm(op.id)}
                          disabled={isPending || pendingOperations.has(op.id)}
                          title="Confirm Operation"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleCancel(op.id)}
                          disabled={isPending || pendingOperations.has(op.id)}
                          title="Cancel Operation"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
