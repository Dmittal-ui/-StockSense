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
        Relationships: [];
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
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at" | "is_active" | "description" | "image_url"> & {
          is_active?: boolean;
          description?: string | null;
          image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "operations_source_warehouse_id_fkey";
            columns: ["source_warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "operations_destination_warehouse_id_fkey";
            columns: ["destination_warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["operation_lines"]["Row"], "id" | "created_at" | "done_quantity"> & {
          done_quantity?: number;
        };
        Update: Partial<Database["public"]["Tables"]["operation_lines"]["Insert"]>;
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "stock_ledger_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_ledger_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_ledger_warehouse_id_fkey";
            columns: ["warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
      Functions: {
        confirm_stock_operation: {
          Args: { p_operation_id: string };
          Returns: undefined;
        };
        get_dashboard_stats: {
          Args: Record<string, never>;
          Returns: Record<string, unknown>;
        };
        get_low_stock_products: {
          Args: Record<string, never>;
          Returns: Array<{
            id: string;
            name: string;
            sku: string;
            category: string;
            unit: string;
            reorder_level: number;
            on_hand: number;
          }>;
        };
        get_stock_by_category: {
          Args: Record<string, never>;
          Returns: Array<{
            category: string;
            total_quantity: number;
            product_count: number;
          }>;
        };
        get_inventory_movement: {
          Args: Record<string, never>;
          Returns: Array<{
            day_label: string;
            incoming: number;
            outgoing: number;
            adjustments: number;
          }>;
        };
        get_warehouse_overview: {
          Args: Record<string, never>;
          Returns: Array<{
            id: string;
            name: string;
            code: string;
            total_products: number;
            total_stock: number;
            location_count: number;
          }>;
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
