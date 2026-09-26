"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().trim().min(1, "Category is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  reorder_level: z.coerce.number().min(0),
});

type ProductActionResult =
  | { success: true }
  | {
      success: false;
      formError?: string;
      fieldErrors?: Record<string, string>;
    };

function parseProduct(formData: FormData): {
  data?: z.infer<typeof ProductSchema>;
  result?: ProductActionResult;
} {
  const parsed = ProductSchema.safeParse(Object.fromEntries(formData));
  if (parsed.success) return { data: parsed.data };

  const fieldErrors = Object.fromEntries(
    Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, errors]) =>
      errors?.[0] ? [[field, errors[0]]] : []
    )
  );
  return {
    result: {
      success: false,
      formError: "Please correct the highlighted fields.",
      fieldErrors,
    },
  };
}

function databaseError(message: string): ProductActionResult {
  if (message.includes("products_sku_key") || message.includes("duplicate key")) {
    return {
      success: false,
      fieldErrors: { sku: "This SKU already exists." },
      formError: "A product with this SKU already exists.",
    };
  }
  return { success: false, formError: message };
}

export async function createProduct(formData: FormData) {
  const parsed = parseProduct(formData);
  if (!parsed.data) return parsed.result;

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(parsed.data);
  
  if (error) return databaseError(error.message);
  revalidatePath("/products");
  return { success: true } as const;
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = parseProduct(formData);
  if (!parsed.data) return parsed.result;

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  
  if (error) return databaseError(error.message);
  revalidatePath("/products");
  return { success: true } as const;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return databaseError(error.message);
  revalidatePath("/products");
  return { success: true } as const;
}
