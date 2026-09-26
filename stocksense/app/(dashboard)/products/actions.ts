// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  reorder_level: z.coerce.number().min(0),
});

export async function createProduct(formData: FormData) {
  const parsed = ProductSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(parsed as any);
  
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = ProductSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(parsed as any).eq("id", id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}
