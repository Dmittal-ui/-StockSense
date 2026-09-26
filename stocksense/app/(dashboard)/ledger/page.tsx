import { createClient } from "@/lib/supabase/server";
import { LedgerTable } from "./ledger-table";

export default async function LedgerPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const productId = searchParams?.product_id as string | undefined;
  const warehouseId = searchParams?.warehouse_id as string | undefined;
  const search = searchParams?.search as string | undefined;
  const from = searchParams?.from as string | undefined;
  const to = searchParams?.to as string | undefined;
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const pageSize = 25;

  const supabase = await createClient();

  let query = supabase
    .from("stock_ledger")
    .select(`
      *,
      operation:operation_id!inner(reference),
      product:product_id(name, sku),
      warehouse:warehouse_id(name)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (productId) {
    query = query.eq("product_id", productId);
  }
  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }
  if (search) {
    query = query.ilike("operation.reference", `%${search}%`);
  }
  if (from) {
    query = query.gte("created_at", `${from}T00:00:00.000Z`);
  }
  if (to) {
    query = query.lte("created_at", `${to}T23:59:59.999Z`);
  }

  const [ledgerRes, prodRes, whRes] = await Promise.all([
    query,
    supabase.from("products").select("id, name, sku").order("name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Ledger</h1>
        <p className="text-muted-foreground mt-1">
          Complete history of all inventory movements.
        </p>
      </div>

      <LedgerTable
        ledgerEntries={ledgerRes.data || []}
        products={prodRes.data || []}
        warehouses={whRes.data || []}
        page={page}
        pageSize={pageSize}
        total={ledgerRes.count || 0}
      />
    </div>
  );
}
