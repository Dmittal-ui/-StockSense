"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "./actions";
import { toast } from "sonner";

export function ProductsTable({ products }: { products: any[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isEdit = !!editingProduct;

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateProduct(editingProduct.id, formData);
          toast.success("Product updated successfully");
        } else {
          await createProduct(formData);
          toast.success("Product created successfully");
        }
        setIsDialogOpen(false);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        toast.success("Product deleted");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setEditingProduct(null)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={editingProduct?.sku}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingProduct?.name}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    defaultValue={editingProduct?.category}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    name="unit"
                    defaultValue={editingProduct?.unit || "pcs"}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_level">Reorder Level</Label>
                <Input
                  id="reorder_level"
                  name="reorder_level"
                  type="number"
                  min="0"
                  defaultValue={editingProduct?.reorder_level || 10}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50">
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Reorder Lvl</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={p.id} className="border-border/50">
                  <TableCell className="font-medium">{p.sku}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell className="text-right font-medium">
                    {p.reorder_level}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingProduct(p);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product 
                              <strong className="text-foreground ml-1">{p.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(p.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              {isPending ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
