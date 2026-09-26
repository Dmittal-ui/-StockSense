// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OperationSchema = z
  .object({
    type: z.enum(["receipt", "delivery", "transfer"]),
    source_warehouse_id: z.string().nullable().optional(),
    destination_warehouse_id: z.string().nullable().optional(),
    items: z
      .array(
        z.object({
          product_id: z.string().min(1),
          quantity: z.number().int().positive("Quantity must be a positive whole number"),
        })
      )
      .min(1, "At least one line item is required"),
  })
  .superRefine((value, context) => {
    const productIds = value.items.map((item) => item.product_id);
    if (new Set(productIds).size !== productIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "Each product can only appear once.",
      });
    }

    if (value.type === "transfer") {
      if (!value.source_warehouse_id || !value.destination_warehouse_id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source_warehouse_id"],
          message: "Transfer source and destination are required.",
        });
      } else if (value.source_warehouse_id === value.destination_warehouse_id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["destination_warehouse_id"],
          message: "Transfer source and destination must be different.",
        });
      }
    }
  });

export async function createOperation(data: {
  type: string;
  source_warehouse_id?: string | null;
  destination_warehouse_id?: string | null;
  items: Array<{ product_id: string; quantity: number }>;
}) {
  const parsed = OperationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid operation.");
  }

  const supabase = await createClient();

  // 1. Insert Operation
  const { data: opData, error: opError } = await supabase
    .from("operations")
    .insert({
      operation_type: data.type,
      status: "draft",
      source_warehouse_id: data.source_warehouse_id,
      destination_warehouse_id: data.destination_warehouse_id,
    })
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
    .insert(itemsToInsert);

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
