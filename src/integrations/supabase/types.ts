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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cleaning_reports: {
        Row: {
          cleaner_name: string
          cleaning_date: string
          completed_tasks: number
          created_at: string
          end_time: number | null
          id: string
          job_id: string | null
          language: string
          notes: string | null
          property_address: string
          property_id: string | null
          property_name: string
          public_token: string
          service_type: string
          start_time: number | null
          status: string
          total_photos: number
          total_tasks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cleaner_name?: string
          cleaning_date?: string
          completed_tasks?: number
          created_at?: string
          end_time?: number | null
          id?: string
          job_id?: string | null
          language?: string
          notes?: string | null
          property_address: string
          property_id?: string | null
          property_name: string
          public_token?: string
          service_type?: string
          start_time?: number | null
          status?: string
          total_photos?: number
          total_tasks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cleaner_name?: string
          cleaning_date?: string
          completed_tasks?: number
          created_at?: string
          end_time?: number | null
          id?: string
          job_id?: string | null
          language?: string
          notes?: string | null
          property_address?: string
          property_id?: string | null
          property_name?: string
          public_token?: string
          service_type?: string
          start_time?: number | null
          status?: string
          total_photos?: number
          total_tasks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          quantity: number
          reorder_photo: string | null
          threshold: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          quantity?: number
          reorder_photo?: string | null
          threshold?: number
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          quantity?: number
          reorder_photo?: string | null
          threshold?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          address: string
          assigned_to: string | null
          check_in_time: string | null
          checkin_deadline: string | null
          checklist: Json | null
          checkout_time: string | null
          client_name: string
          created_at: string
          current_step: string | null
          damages: Json | null
          date: string
          end_time: number | null
          id: string
          inventory_used: Json | null
          lost_and_found: Json | null
          photos_after: string[] | null
          photos_before: string[] | null
          price: number | null
          property_id: string | null
          report_note: string | null
          report_pdf_url: string | null
          start_time: number | null
          status: string
          time: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          assigned_to?: string | null
          check_in_time?: string | null
          checkin_deadline?: string | null
          checklist?: Json | null
          checkout_time?: string | null
          client_name: string
          created_at?: string
          current_step?: string | null
          damages?: Json | null
          date: string
          end_time?: number | null
          id?: string
          inventory_used?: Json | null
          lost_and_found?: Json | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          price?: number | null
          property_id?: string | null
          report_note?: string | null
          report_pdf_url?: string | null
          start_time?: number | null
          status?: string
          time: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          assigned_to?: string | null
          check_in_time?: string | null
          checkin_deadline?: string | null
          checklist?: Json | null
          checkout_time?: string | null
          client_name?: string
          created_at?: string
          current_step?: string | null
          damages?: Json | null
          date?: string
          end_time?: number | null
          id?: string
          inventory_used?: Json | null
          lost_and_found?: Json | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          price?: number | null
          property_id?: string | null
          report_note?: string | null
          report_pdf_url?: string | null
          start_time?: number | null
          status?: string
          time?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          access_code: string | null
          address: string
          base_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          checklist_template: Json | null
          client_email: string | null
          created_at: string
          id: string
          last_cleaned: string | null
          manual_url: string | null
          name: string
          notes: string | null
          photo_url: string | null
          rooms: Json | null
          service_type: string
          sqft: number | null
          status: string
          supplies_location: string | null
          type: string
          updated_at: string
          user_id: string
          wifi_password: string | null
        }
        Insert: {
          access_code?: string | null
          address: string
          base_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          checklist_template?: Json | null
          client_email?: string | null
          created_at?: string
          id?: string
          last_cleaned?: string | null
          manual_url?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          rooms?: Json | null
          service_type?: string
          sqft?: number | null
          status?: string
          supplies_location?: string | null
          type?: string
          updated_at?: string
          user_id: string
          wifi_password?: string | null
        }
        Update: {
          access_code?: string | null
          address?: string
          base_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          checklist_template?: Json | null
          client_email?: string | null
          created_at?: string
          id?: string
          last_cleaned?: string | null
          manual_url?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          rooms?: Json | null
          service_type?: string
          sqft?: number | null
          status?: string
          supplies_location?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          wifi_password?: string | null
        }
        Relationships: []
      }
      report_photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          photo_type: string
          photo_url: string
          report_id: string
          room_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_type?: string
          photo_url: string
          report_id: string
          room_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_type?: string
          photo_url?: string
          report_id?: string
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_photos_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "cleaning_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "report_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      report_rooms: {
        Row: {
          checklist: Json
          created_at: string
          damages: Json
          display_order: number
          id: string
          lost_and_found: Json
          name: string
          report_id: string
          room_type: string
          tasks_completed: number
          tasks_total: number
        }
        Insert: {
          checklist?: Json
          created_at?: string
          damages?: Json
          display_order?: number
          id?: string
          lost_and_found?: Json
          name: string
          report_id: string
          room_type?: string
          tasks_completed?: number
          tasks_total?: number
        }
        Update: {
          checklist?: Json
          created_at?: string
          damages?: Json
          display_order?: number
          id?: string
          lost_and_found?: Json
          name?: string
          report_id?: string
          room_type?: string
          tasks_completed?: number
          tasks_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_rooms_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "cleaning_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cleaner" | "manager"
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
      app_role: ["admin", "cleaner", "manager"],
    },
  },
} as const
