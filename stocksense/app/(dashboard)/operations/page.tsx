import { createClient } from "@/lib/supabase/server";
import { OperationsTable } from "./operations-table";

export default async function OperationsPage() {
  const supabase = await createClient();

  const [opsRes, prodRes, whRes] = await Promise.all([
    supabase
      .from("operations")
      .select(`
        *,
        source_warehouse:source_warehouse_id(name),
        destination_warehouse:destination_warehouse_id(name)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, sku").order("name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  const queryError = opsRes.error || prodRes.error || whRes.error;
  if (queryError) {
    throw new Error("Unable to load operations: " + queryError.message);
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
        <p className="text-muted-foreground mt-1">
          Manage receipts, deliveries, and internal transfers.
        </p>
      </div>
      
      <OperationsTable 
        operations={opsRes.data || []} 
        products={prodRes.data || []} 
        warehouses={whRes.data || []} 
      />
    </div>
  );
}
