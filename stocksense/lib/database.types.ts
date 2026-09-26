export type Database = {
  public: {
    Tables: {
      warehouses: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["warehouses"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["warehouses"]["Insert"]>;
      };
      locations: {
        Row: {
          id: string;
          warehouse_id: string;
          name: string;
          code: string;
          location_type: "shelf" | "rack" | "bin" | "zone" | "floor";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["locations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          category: string;
          unit: string;
          description: string | null;
          reorder_level: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          location_id: string;
          warehouse_id: string;
          quantity: number;
          reserved_quantity: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      operations: {
        Row: {
          id: string;
          reference: string;
          operation_type: "receipt" | "delivery" | "transfer" | "adjustment";
          status: "draft" | "confirmed" | "done" | "cancelled";
          source_location_id: string | null;
          destination_location_id: string | null;
          source_warehouse_id: string | null;
          destination_warehouse_id: string | null;
          partner_name: string | null;
          notes: string | null;
          scheduled_date: string | null;
          completed_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["operations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["operations"]["Insert"]>;
      };
      operation_lines: {
        Row: {
          id: string;
          operation_id: string;
          product_id: string;
          quantity: number;
          done_quantity: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["operation_lines"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["operation_lines"]["Insert"]>;
      };
      stock_ledger: {
        Row: {
          id: string;
          product_id: string;
          location_id: string;
          warehouse_id: string;
          operation_id: string | null;
          movement_type: "in" | "out" | "adjustment";
          quantity: number;
          balance_after: number;
          reference: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stock_ledger"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["stock_ledger"]["Insert"]>;
      };
    };
  };
};

// Convenience row types
export type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
export type Operation = Database["public"]["Tables"]["operations"]["Row"];
export type OperationLine = Database["public"]["Tables"]["operation_lines"]["Row"];
export type StockLedgerEntry = Database["public"]["Tables"]["stock_ledger"]["Row"];
