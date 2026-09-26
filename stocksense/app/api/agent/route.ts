// @ts-nocheck
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createOperation } from '@/app/(dashboard)/operations/actions';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages,
    system: "You are StockSense AI, an intelligent inventory assistant. You can lookup products, check stock levels, list warehouses, and draft internal transfers. NEVER confirm an operation. You ONLY create drafts. If a user asks to move stock, find the product ID and warehouse IDs first, verify stock exists if possible, and then call the draftTransfer tool.",
    tools: {
      searchProducts: tool({
        description: 'Search for products by name or SKU',
        parameters: z.object({ query: z.string().describe("The search term for product name or SKU") }),
        execute: async ({ query }) => {
          const supabase = await createClient();
          const { data } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
            .limit(10);
          return data;
        },
      }),
      listWarehouses: tool({
        description: 'List all warehouses in the system',
        parameters: z.object({}),
        execute: async () => {
          const supabase = await createClient();
          const { data } = await supabase.from('warehouses').select('*');
          return data;
        },
      }),
      checkStock: tool({
        description: 'Check stock levels for a specific product ID across all warehouses',
        parameters: z.object({ productId: z.string().describe("The UUID of the product") }),
        execute: async ({ productId }) => {
          const supabase = await createClient();
          const { data } = await supabase
            .from('inventory')
            .select('*, warehouse:warehouse_id(name)')
            .eq('product_id', productId);
          return data;
        },
      }),
      draftTransfer: tool({
        description: 'Create a draft transfer operation between two warehouses',
        parameters: z.object({
          sourceWarehouseId: z.string().describe("UUID of the source warehouse"),
          destWarehouseId: z.string().describe("UUID of the destination warehouse"),
          productId: z.string().describe("UUID of the product to transfer"),
          quantity: z.number().positive().describe("Quantity to transfer"),
        }),
        execute: async (args) => {
          try {
            const opId = await createOperation({
              type: 'transfer',
              source_warehouse_id: args.sourceWarehouseId,
              destination_warehouse_id: args.destWarehouseId,
              items: [{ product_id: args.productId, quantity: args.quantity }],
            });
            // Let the UI know a draft was created so it can fetch the latest drafts
            return { 
              success: true, 
              message: `Draft transfer for ${args.quantity} units created successfully.`,
              needsConfirmation: true,
              operationId: opId
            };
          } catch (e: any) {
            return { success: false, error: e.message };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
