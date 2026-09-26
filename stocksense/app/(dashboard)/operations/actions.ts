// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOperation(data: {
  type: string;
  source_warehouse_id?: string | null;
  destination_warehouse_id?: string | null;
  items: Array<{ product_id: string; quantity: number }>;
}) {
  const supabase = await createClient();

  // 1. Insert Operation
  const { data: opData, error: opError } = await supabase
    .from("operations")
    .insert({
      type: data.type,
      status: "draft",
      source_warehouse_id: data.source_warehouse_id,
      destination_warehouse_id: data.destination_warehouse_id,
    } as any)
    .select()
    .single();

  if (opError) throw new Error("Failed to create operation: " + opError.message);

  // 2. Insert Line Items
  const itemsToInsert = data.items.map((item) => ({
    operation_id: opData.id,
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const { error: lineError } = await supabase
    .from("operation_lines")
    .insert(itemsToInsert as any);

  if (lineError) {
    // Attempt rollback
    await supabase.from("operations").delete().eq("id", opData.id);
    throw new Error("Failed to add line items: " + lineError.message);
  }

  revalidatePath("/operations");
  revalidatePath("/dashboard");
  return opData.id;
}

export async function confirmOperation(operationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_stock_operation", {
    op_id: operationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/operations");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/ledger");
}

export async function cancelOperation(operationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("operations")
    .update({ status: "cancelled" } as any)
    .eq("id", operationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/operations");
}
