// Mirrors supabase/migrations/*.sql in the shape
// `supabase gen types typescript` emits. Regenerate with `npm run db:types`
// once the local stack is running; that output replaces this file.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      activity: {
        Row: {
          amount: number;
          category: Database["public"]["Enums"]["activity_category"];
          created_at: string;
          cycle_id: string;
          id: string;
          item_id: string | null;
          name: string;
          occurred_at: string;
        };
        Insert: {
          amount: number;
          category: Database["public"]["Enums"]["activity_category"];
          created_at?: string;
          cycle_id: string;
          id?: string;
          item_id?: string | null;
          name: string;
          occurred_at?: string;
        };
        Update: {
          amount?: number;
          category?: Database["public"]["Enums"]["activity_category"];
          created_at?: string;
          cycle_id?: string;
          id?: string;
          item_id?: string | null;
          name?: string;
          occurred_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycle_summaries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      cycles: {
        Row: {
          closed: boolean;
          created_at: string;
          id: string;
          income: number;
          name: string;
          user_id: string;
        };
        Insert: {
          closed?: boolean;
          created_at?: string;
          id?: string;
          income?: number;
          name: string;
          user_id?: string;
        };
        Update: {
          closed?: boolean;
          created_at?: string;
          id?: string;
          income?: number;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          note: string | null;
          saved: number;
          target: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          note?: string | null;
          saved?: number;
          target: number;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          note?: string | null;
          saved?: number;
          target?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          currency: string;
          display_name: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          display_name: string;
          id: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          display_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          amount: number;
          category: Database["public"]["Enums"]["item_category"];
          created_at: string;
          cycle_id: string;
          enabled: boolean;
          id: string;
          name: string;
        };
        Insert: {
          amount: number;
          category: Database["public"]["Enums"]["item_category"];
          created_at?: string;
          cycle_id: string;
          enabled?: boolean;
          id?: string;
          name: string;
        };
        Update: {
          amount?: number;
          category?: Database["public"]["Enums"]["item_category"];
          created_at?: string;
          cycle_id?: string;
          enabled?: boolean;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "items_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycle_summaries";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      cycle_summaries: {
        Row: {
          closed: boolean | null;
          created_at: string | null;
          id: string | null;
          income: number | null;
          name: string | null;
          planned: number | null;
          saved: number | null;
          spent: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      has_passcode: { Args: never; Returns: boolean };
      set_passcode: {
        Args: { p_current?: string; p_new: string };
        Returns: undefined;
      };
      verify_passcode: { Args: { p_code: string }; Returns: Json };
      open_new_cycle: {
        Args: { p_income?: number; p_name: string };
        Returns: {
          closed: boolean;
          created_at: string;
          id: string;
          income: number;
          name: string;
          user_id: string;
        };
      };
    };
    Enums: {
      activity_category: "Fixed" | "Variable" | "Savings" | "Income";
      item_category: "Fixed" | "Variable" | "Savings";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
