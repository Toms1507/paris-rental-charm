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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          bedrooms: string | null
          city: string | null
          created_at: string
          district: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string
          property_type: string | null
          surface: string | null
        }
        Insert: {
          bedrooms?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          property_type?: string | null
          surface?: string | null
        }
        Update: {
          bedrooms?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          property_type?: string | null
          surface?: string | null
        }
        Relationships: []
      }
      pms_cleaners: {
        Row: {
          active: boolean
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rate: number
          token: string
        }
        Insert: {
          active?: boolean
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rate?: number
          token?: string
        }
        Update: {
          active?: boolean
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rate?: number
          token?: string
        }
        Relationships: []
      }
      pms_cleaning_tasks: {
        Row: {
          checklist: Json
          cleaner_id: string | null
          completed_at: string | null
          condition: string | null
          created_at: string
          date: string
          id: string
          next_guests: number | null
          next_reservation_id: string | null
          notified_at: string | null
          photos: Json
          price: number
          property_id: string
          report_notes: string | null
          reservation_id: string | null
          started_at: string | null
          status: string
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          checklist?: Json
          cleaner_id?: string | null
          completed_at?: string | null
          condition?: string | null
          created_at?: string
          date: string
          id?: string
          next_guests?: number | null
          next_reservation_id?: string | null
          notified_at?: string | null
          photos?: Json
          price?: number
          property_id: string
          report_notes?: string | null
          reservation_id?: string | null
          started_at?: string | null
          status?: string
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          checklist?: Json
          cleaner_id?: string | null
          completed_at?: string | null
          condition?: string | null
          created_at?: string
          date?: string
          id?: string
          next_guests?: number | null
          next_reservation_id?: string | null
          notified_at?: string | null
          photos?: Json
          price?: number
          property_id?: string
          report_notes?: string | null
          reservation_id?: string | null
          started_at?: string | null
          status?: string
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pms_cleaning_tasks_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "pms_cleaners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_cleaning_tasks_next_reservation_id_fkey"
            columns: ["next_reservation_id"]
            isOneToOne: false
            referencedRelation: "pms_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_cleaning_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pms_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_cleaning_tasks_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "pms_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_expenses: {
        Row: {
          amount: number
          billable_to_owner: boolean
          category: string
          created_at: string
          date: string
          id: string
          invoice_url: string | null
          label: string
          property_id: string
        }
        Insert: {
          amount?: number
          billable_to_owner?: boolean
          category?: string
          created_at?: string
          date?: string
          id?: string
          invoice_url?: string | null
          label: string
          property_id: string
        }
        Update: {
          amount?: number
          billable_to_owner?: boolean
          category?: string
          created_at?: string
          date?: string
          id?: string
          invoice_url?: string | null
          label?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pms_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pms_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_guest_requests: {
        Row: {
          answer: string | null
          created_at: string
          details: string | null
          id: string
          price: number | null
          rating: number | null
          requested_time: string | null
          reservation_id: string
          status: string
          type: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          details?: string | null
          id?: string
          price?: number | null
          rating?: number | null
          requested_time?: string | null
          reservation_id: string
          status?: string
          type: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          details?: string | null
          id?: string
          price?: number | null
          rating?: number | null
          requested_time?: string | null
          reservation_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pms_guest_requests_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "pms_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_incidents: {
        Row: {
          billable_to_owner: boolean
          cost: number
          created_at: string
          description: string | null
          id: string
          photos: Json
          property_id: string
          reported_by: string | null
          reservation_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          task_id: string | null
          title: string
        }
        Insert: {
          billable_to_owner?: boolean
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          photos?: Json
          property_id: string
          reported_by?: string | null
          reservation_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          task_id?: string | null
          title: string
        }
        Update: {
          billable_to_owner?: boolean
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          photos?: Json
          property_id?: string
          reported_by?: string | null
          reservation_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pms_incidents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pms_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_incidents_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "pms_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_incidents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "pms_cleaning_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_message_templates: {
        Row: {
          active: boolean
          body: string
          channel: string
          created_at: string
          id: string
          name: string
          offset_days: number
          position: number
          send_time: string
          subject: string | null
          trigger: string
        }
        Insert: {
          active?: boolean
          body: string
          channel?: string
          created_at?: string
          id?: string
          name: string
          offset_days?: number
          position?: number
          send_time?: string
          subject?: string | null
          trigger: string
        }
        Update: {
          active?: boolean
          body?: string
          channel?: string
          created_at?: string
          id?: string
          name?: string
          offset_days?: number
          position?: number
          send_time?: string
          subject?: string | null
          trigger?: string
        }
        Relationships: []
      }
      pms_messages: {
        Row: {
          body: string
          channel: string
          created_at: string
          direction: string
          error: string | null
          id: string
          recipient: string | null
          reservation_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string | null
          template_id: string | null
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          direction?: string
          error?: string | null
          id?: string
          recipient?: string | null
          reservation_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          direction?: string
          error?: string | null
          id?: string
          recipient?: string | null
          reservation_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pms_messages_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "pms_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "pms_message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_owner_reports: {
        Row: {
          created_at: string
          data: Json
          id: string
          month: string
          owner_id: string | null
          property_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          month: string
          owner_id?: string | null
          property_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          month?: string
          owner_id?: string | null
          property_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pms_owner_reports_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pms_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_owner_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pms_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_owners: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          iban: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      pms_properties: {
        Row: {
          active: boolean
          address: string | null
          arrondissement: string | null
          bedrooms: number
          capacity: number
          checkin_time: string
          checklist: Json
          checkout_time: string
          cleaner_id: string | null
          cleaning_fee: number
          commission_rate: number
          created_at: string
          early_checkin_price: number
          export_token: string
          guide: Json
          ical_feeds: Json
          id: string
          late_checkout_price: number
          late_checkout_until: string
          name: string
          owner_id: string | null
          photo_url: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          arrondissement?: string | null
          bedrooms?: number
          capacity?: number
          checkin_time?: string
          checklist?: Json
          checkout_time?: string
          cleaner_id?: string | null
          cleaning_fee?: number
          commission_rate?: number
          created_at?: string
          early_checkin_price?: number
          export_token?: string
          guide?: Json
          ical_feeds?: Json
          id?: string
          late_checkout_price?: number
          late_checkout_until?: string
          name: string
          owner_id?: string | null
          photo_url?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          arrondissement?: string | null
          bedrooms?: number
          capacity?: number
          checkin_time?: string
          checklist?: Json
          checkout_time?: string
          cleaner_id?: string | null
          cleaning_fee?: number
          commission_rate?: number
          created_at?: string
          early_checkin_price?: number
          export_token?: string
          guide?: Json
          ical_feeds?: Json
          id?: string
          late_checkout_price?: number
          late_checkout_until?: string
          name?: string
          owner_id?: string | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pms_properties_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "pms_cleaners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pms_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_recommendations: {
        Row: {
          active: boolean
          address: string | null
          arrondissement: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          price_level: string | null
          property_id: string | null
          source: string | null
          tip: string | null
          trending: boolean
          url: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          arrondissement?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_level?: string | null
          property_id?: string | null
          source?: string | null
          tip?: string | null
          trending?: boolean
          url?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          arrondissement?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_level?: string | null
          property_id?: string | null
          source?: string | null
          tip?: string | null
          trending?: boolean
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pms_recommendations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pms_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_reservations: {
        Row: {
          amount_gross: number
          arrival_time: string | null
          check_in: string
          check_out: string
          cleaning_fee: number
          created_at: string
          departure_time: string | null
          external_uid: string | null
          guest_email: string | null
          guest_language: string
          guest_name: string | null
          guest_phone: string | null
          guest_token: string
          guests: number
          id: string
          notes: string | null
          platform: string
          platform_fee: number
          property_id: string
          raw: Json | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_gross?: number
          arrival_time?: string | null
          check_in: string
          check_out: string
          cleaning_fee?: number
          created_at?: string
          departure_time?: string | null
          external_uid?: string | null
          guest_email?: string | null
          guest_language?: string
          guest_name?: string | null
          guest_phone?: string | null
          guest_token?: string
          guests?: number
          id?: string
          notes?: string | null
          platform?: string
          platform_fee?: number
          property_id: string
          raw?: Json | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_gross?: number
          arrival_time?: string | null
          check_in?: string
          check_out?: string
          cleaning_fee?: number
          created_at?: string
          departure_time?: string | null
          external_uid?: string | null
          guest_email?: string | null
          guest_language?: string
          guest_name?: string | null
          guest_phone?: string | null
          guest_token?: string
          guests?: number
          id?: string
          notes?: string | null
          platform?: string
          platform_fee?: number
          property_id?: string
          raw?: Json | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pms_reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pms_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_reviews: {
        Row: {
          comment: string | null
          created_at: string
          date: string
          id: string
          platform: string
          property_id: string
          rating: number
          reservation_id: string | null
          response: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          date?: string
          id?: string
          platform?: string
          property_id: string
          rating: number
          reservation_id?: string | null
          response?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          date?: string
          id?: string
          platform?: string
          property_id?: string
          rating?: number
          reservation_id?: string | null
          response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pms_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pms_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pms_reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "pms_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_settings: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pms_staff: {
        Row: {
          created_at: string
          email: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      pms_add_staff: { Args: { p_email: string }; Returns: boolean }
      pms_cleaner_update_task: {
        Args: { p_patch: Json; p_task_id: string; p_token: string }
        Returns: Json
      }
      pms_get_cleaner: { Args: { p_token: string }; Returns: Json }
      pms_get_export: { Args: { p_token: string }; Returns: Json }
      pms_get_stay: { Args: { p_token: string }; Returns: Json }
      pms_guest_log_chat: {
        Args: { p_answer: string; p_question: string; p_token: string }
        Returns: undefined
      }
      pms_guest_request: {
        Args: {
          p_details: string
          p_rating: number
          p_requested_time: string
          p_token: string
          p_type: string
        }
        Returns: string
      }
      pms_is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
