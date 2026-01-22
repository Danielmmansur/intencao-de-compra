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
      campaigns: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bonus_description: string | null
          bonus_value: number | null
          created_at: string
          discount_type: string | null
          discount_value: number | null
          id: string
          name: string
          proposal_id: string
          special_conditions: string | null
          status: Database["public"]["Enums"]["campaign_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bonus_description?: string | null
          bonus_value?: number | null
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          name: string
          proposal_id: string
          special_conditions?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bonus_description?: string | null
          bonus_value?: number | null
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          name?: string
          proposal_id?: string
          special_conditions?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          birth_date: string | null
          cpf: string
          created_at: string
          email: string | null
          family_composition: string | null
          full_name: string
          id: string
          monthly_income: number
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cpf: string
          created_at?: string
          email?: string | null
          family_composition?: string | null
          full_name: string
          id?: string
          monthly_income?: number
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cpf?: string
          created_at?: string
          email?: string | null
          family_composition?: string | null
          full_name?: string
          id?: string
          monthly_income?: number
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      corretores: {
        Row: {
          created_at: string
          creci: string | null
          email: string | null
          id: string
          imobiliaria_id: string | null
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          creci?: string | null
          email?: string | null
          id?: string
          imobiliaria_id?: string | null
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          creci?: string | null
          email?: string | null
          id?: string
          imobiliaria_id?: string | null
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corretores_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimentos: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      imobiliarias: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposal_clients: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_main_proponent: boolean | null
          proposal_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_main_proponent?: boolean | null
          proposal_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_main_proponent?: boolean | null
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_clients_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_history: {
        Row: {
          changed_by: string | null
          changes: Json | null
          created_at: string
          id: string
          proposal_id: string
        }
        Insert: {
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          proposal_id: string
        }
        Update: {
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_history_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          amortization_system: string | null
          apply_annual_adjustment: boolean | null
          appraisal_value: number | null
          approved_value: number | null
          bank: string | null
          construction_months: number | null
          construction_phases: Json | null
          construction_rate: number | null
          coordinator_name: string | null
          corretor_id: string | null
          created_at: string
          created_by: string | null
          empreendimento_id: string | null
          entry_bands: Json | null
          entry_term_months: number | null
          entry_value: number | null
          fgts: number | null
          financed_value: number | null
          first_installment: number | null
          habite_se_date: string | null
          id: string
          imobiliaria_id: string | null
          manager_name: string | null
          notes: string | null
          pdf_url: string | null
          property_block: string | null
          property_unit: string | null
          sale_value: number | null
          simulation_start_date: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          subsidy: number | null
          updated_at: string
          version: number | null
        }
        Insert: {
          amortization_system?: string | null
          apply_annual_adjustment?: boolean | null
          appraisal_value?: number | null
          approved_value?: number | null
          bank?: string | null
          construction_months?: number | null
          construction_phases?: Json | null
          construction_rate?: number | null
          coordinator_name?: string | null
          corretor_id?: string | null
          created_at?: string
          created_by?: string | null
          empreendimento_id?: string | null
          entry_bands?: Json | null
          entry_term_months?: number | null
          entry_value?: number | null
          fgts?: number | null
          financed_value?: number | null
          first_installment?: number | null
          habite_se_date?: string | null
          id?: string
          imobiliaria_id?: string | null
          manager_name?: string | null
          notes?: string | null
          pdf_url?: string | null
          property_block?: string | null
          property_unit?: string | null
          sale_value?: number | null
          simulation_start_date?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          subsidy?: number | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          amortization_system?: string | null
          apply_annual_adjustment?: boolean | null
          appraisal_value?: number | null
          approved_value?: number | null
          bank?: string | null
          construction_months?: number | null
          construction_phases?: Json | null
          construction_rate?: number | null
          coordinator_name?: string | null
          corretor_id?: string | null
          created_at?: string
          created_by?: string | null
          empreendimento_id?: string | null
          entry_bands?: Json | null
          entry_term_months?: number | null
          entry_value?: number | null
          fgts?: number | null
          financed_value?: number | null
          first_installment?: number | null
          habite_se_date?: string | null
          id?: string
          imobiliaria_id?: string | null
          manager_name?: string | null
          notes?: string | null
          pdf_url?: string | null
          property_block?: string | null
          property_unit?: string | null
          sale_value?: number | null
          simulation_start_date?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          subsidy?: number | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "corretores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          default_construction_rate: number
          default_entry_bands: Json
          default_pdf_text: string | null
          default_phases: Json
          id: string
          max_income_commitment: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_construction_rate?: number
          default_entry_bands?: Json
          default_pdf_text?: string | null
          default_phases?: Json
          id?: string
          max_income_commitment?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_construction_rate?: number
          default_entry_bands?: Json
          default_pdf_text?: string | null
          default_phases?: Json
          id?: string
          max_income_commitment?: number
          updated_at?: string
        }
        Relationships: []
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
      app_role: "admin" | "gerente" | "corretor"
      campaign_status: "pendente" | "aprovada" | "rejeitada"
      proposal_status: "rascunho" | "enviada" | "aprovada" | "cancelada"
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
      app_role: ["admin", "gerente", "corretor"],
      campaign_status: ["pendente", "aprovada", "rejeitada"],
      proposal_status: ["rascunho", "enviada", "aprovada", "cancelada"],
    },
  },
} as const
