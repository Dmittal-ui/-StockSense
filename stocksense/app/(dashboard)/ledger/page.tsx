import { createClient } from "@/lib/supabase/server";
import { LedgerTable } from "./ledger-table";

export default async function LedgerPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const productId = searchParams?.product_id as string | undefined;
  const warehouseId = searchParams?.warehouse_id as string | undefined;
  const search = searchParams?.search as string | undefined;

  const supabase = await createClient();

  let query = supabase
    .from("stock_ledger")
    .select(`
      *,
      operation:operation_id(reference),
      product:product_id(name, sku),
      warehouse:warehouse_id(name)
    `)
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }
  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }
  // search by reference requires join filtering, or we filter locally for MVP
  // Supabase RPC or textSearch is better, but since this is an MVP we'll just fetch.
  // We can filter locally for simplicity if search is provided, or add a basic ilike if we query operation table.

  const [ledgerRes, prodRes, whRes] = await Promise.all([
    query,
    supabase.from("products").select("id, name, sku").order("name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  let ledgerData = ledgerRes.data || [];

  if (search) {
    const s = search.toLowerCase();
    ledgerData = ledgerData.filter((entry: any) =>
      entry.operation?.reference?.toLowerCase().includes(s)
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Ledger</h1>
        <p className="text-muted-foreground mt-1">
          Complete history of all inventory movements.
        </p>
      </div>

      <LedgerTable
        ledgerEntries={ledgerData}
        products={prodRes.data || []}
        warehouses={whRes.data || []}
      />
    </div>
  );
}
