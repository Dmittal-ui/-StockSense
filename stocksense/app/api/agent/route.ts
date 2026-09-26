
import { anthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createOperation } from '@/app/(dashboard)/operations/actions';

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The AI assistant is not configured. Set ANTHROPIC_API_KEY." },
      { status: 503 }
    );
  }

  const body = await req.json();
  if (!body || !Array.isArray(body.messages)) {
    return Response.json({ error: "messages must be an array." }, { status: 400 });
  }

  const { messages } = body;
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: modelMessages,
    system: "You are StockSense AI, an intelligent inventory assistant. You can lookup products, check stock levels, list warehouses, and draft internal transfers. NEVER confirm an operation. You ONLY create drafts. If a user asks to move stock, find the product ID and warehouse IDs first, verify stock exists if possible, and then call the draftTransfer tool.",
    tools: {
      searchProducts: tool({
        description: 'Search for products by name or SKU',
        inputSchema: z.object({ query: z.string().describe("The search term for product name or SKU") }),
        execute: async ({ query }) => {
          const supabase = await createClient();
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
            .limit(10);
          return error ? { success: false, error: error.message } : { success: true, data: data ?? [] };
        },
      }),
      listWarehouses: tool({
        description: 'List all warehouses in the system',
        inputSchema: z.object({}),
        execute: async () => {
          const supabase = await createClient();
          const { data, error } = await supabase.from('warehouses').select('*');
          return error ? { success: false, error: error.message } : { success: true, data: data ?? [] };
        },
      }),
      checkStock: tool({
        description: 'Check stock levels for a specific product ID across all warehouses',
        inputSchema: z.object({ productId: z.string().describe("The UUID of the product") }),
        execute: async ({ productId }) => {
          const supabase = await createClient();
          const { data, error } = await supabase
            .from('inventory')
            .select('*, warehouse:warehouse_id(name)')
            .eq('product_id', productId);
          return error ? { success: false, error: error.message } : { success: true, data: data ?? [] };
        },
      }),
      draftTransfer: tool({
        description: 'Create a draft transfer operation between two warehouses',
        inputSchema: z.object({
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
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unable to create draft transfer.",
            };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
