export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      project_reports: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          project_id: string | null
          proof_urls: string[] | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          resolution_message: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          project_id?: string | null
          proof_urls?: string[] | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolution_message?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          project_id?: string | null
          proof_urls?: string[] | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolution_message?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_start_date: string | null
          additional_details: string | null
          branch: Database["public"]["Enums"]["branch_type"]
          category_type: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_social: string | null
          contract_cost: number | null
          created_at: string | null
          description: string
          document_urls: string | null
          effectivity_date: string | null
          engineer_name: string
          expiry_date: string | null
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          project_date: string
          project_id: string
          province: string | null
          region: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
          user_name: string
          year: number | null
        }
        Insert: {
          actual_start_date?: string | null
          additional_details?: string | null
          branch: Database["public"]["Enums"]["branch_type"]
          category_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: string | null
          contract_cost?: number | null
          created_at?: string | null
          description: string
          document_urls?: string | null
          effectivity_date?: string | null
          engineer_name: string
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          project_date?: string
          project_id: string
          province?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          user_name: string
          year?: number | null
        }
        Update: {
          actual_start_date?: string | null
          additional_details?: string | null
          branch?: Database["public"]["Enums"]["branch_type"]
          category_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: string | null
          contract_cost?: number | null
          created_at?: string | null
          description?: string
          document_urls?: string | null
          effectivity_date?: string | null
          engineer_name?: string
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          project_date?: string
          project_id?: string
          province?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          user_name?: string
          year?: number | null
        }
        Relationships: []
      }
      user_credentials: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          password: string
          updated_at: string | null
          updated_by: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          password: string
          updated_at?: string | null
          updated_by?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          password?: string
          updated_at?: string | null
          updated_by?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      branch_type: "ADC" | "QGDC" | "QMB"
      project_status:
        | "active"
        | "inactive"
        | "completed"
        | "not_started"
        | "ongoing"
        | "terminated"
        | "implemented"
      report_status: "pending" | "catered" | "cancelled"
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
      branch_type: ["ADC", "QGDC", "QMB"],
      project_status: [
        "active",
        "inactive",
        "completed",
        "not_started",
        "ongoing",
        "terminated",
        "implemented",
      ],
      report_status: ["pending", "catered", "cancelled"],
    },
  },
} as const
