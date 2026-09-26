import { createClient } from "@/lib/supabase/server";
import { ProductsTable } from "./products-table";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error(error);
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-1">
          Manage your product catalog and reorder levels.
        </p>
      </div>
      <ProductsTable products={products || []} />
    </div>
  );
}
