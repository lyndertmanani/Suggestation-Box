export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      history: {
        Row: {
          amount: number
          date: string
          event_id: string
          event_title: string
          id: number
          original_quantity: number | null
          scanned_at: string | null
          scanned_by: string
          status: string
          ticket_quantity: number
          ticket_type: string
          tx_ref: string
          user_email: string
          user_name: string | null
        }
        Insert: {
          amount: number
          date: string
          event_id: string
          event_title: string
          id?: number
          original_quantity?: number | null
          scanned_at?: string | null
          scanned_by: string
          status?: string
          ticket_quantity: number
          ticket_type: string
          tx_ref: string
          user_email: string
          user_name?: string | null
        }
        Update: {
          amount?: number
          date?: string
          event_id?: string
          event_title?: string
          id?: number
          original_quantity?: number | null
          scanned_at?: string | null
          scanned_by?: string
          status?: string
          ticket_quantity?: number
          ticket_type?: string
          tx_ref?: string
          user_email?: string
          user_name?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          channel: string | null
          country: string | null
          created_at: string | null
          currency: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          id: number
          mobile: string | null
          payment_description: string | null
          payment_title: string | null
          provider: string | null
          ref_id: string | null
          status: string
          transaction_charges: number | null
          tx_ref: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          channel?: string | null
          country?: string | null
          created_at?: string | null
          currency: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          id?: number
          mobile?: string | null
          payment_description?: string | null
          payment_title?: string | null
          provider?: string | null
          ref_id?: string | null
          status: string
          transaction_charges?: number | null
          tx_ref: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          channel?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string
          customer_email?: string
          customer_first_name?: string
          customer_last_name?: string
          id?: number
          mobile?: string | null
          payment_description?: string | null
          payment_title?: string | null
          provider?: string | null
          ref_id?: string | null
          status?: string
          transaction_charges?: number | null
          tx_ref?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scanners: {
        Row: {
          created_at: string
          email: string
          id: string
          password: string
          status: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password: string
          status?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password?: string
          status?: string
          ticket_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          event_id: string
          event_title: string
          id: number
          original_quantity: number | null
          status: string
          ticket_quantity: number
          ticket_type: string
          tx_ref: string
          user_email: string
          user_name: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          event_id: string
          event_title: string
          id?: number
          original_quantity?: number | null
          status: string
          ticket_quantity: number
          ticket_type: string
          tx_ref: string
          user_email: string
          user_name: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          event_id?: string
          event_title?: string
          id?: number
          original_quantity?: number | null
          status?: string
          ticket_quantity?: number
          ticket_type?: string
          tx_ref?: string
          user_email?: string
          user_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      begin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_all_expired_tickets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      commit: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rollback: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      payment_status: "pending" | "completed" | "failed" | "refunded"
      ticket_status: "pending" | "active" | "expired" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_status: ["pending", "completed", "failed", "refunded"],
      ticket_status: ["pending", "active", "expired", "cancelled"],
    },
  },
} as const
