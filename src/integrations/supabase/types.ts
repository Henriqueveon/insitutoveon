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
      candidatos_disc: {
        Row: {
          cargo_atual: string
          created_at: string | null
          empresa_instagram: string
          id: string
          nome_completo: string
          telefone_whatsapp: string
          updated_at: string | null
          empresa_id: string | null
          link_id: string | null
          email: string | null
          perfil_natural: Json | null
          perfil_adaptado: Json | null
          perfil_tipo: string | null
          pdf_url: string | null
          notion_page_id: string | null
          status: string
        }
        Insert: {
          cargo_atual: string
          created_at?: string | null
          empresa_instagram: string
          id?: string
          nome_completo: string
          telefone_whatsapp: string
          updated_at?: string | null
          empresa_id?: string | null
          link_id?: string | null
          email?: string | null
          perfil_natural?: Json | null
          perfil_adaptado?: Json | null
          perfil_tipo?: string | null
          pdf_url?: string | null
          notion_page_id?: string | null
          status?: string
        }
        Update: {
          cargo_atual?: string
          created_at?: string | null
          empresa_instagram?: string
          id?: string
          nome_completo?: string
          telefone_whatsapp?: string
          updated_at?: string | null
          empresa_id?: string | null
          link_id?: string | null
          email?: string | null
          perfil_natural?: Json | null
          perfil_adaptado?: Json | null
          perfil_tipo?: string | null
          pdf_url?: string | null
          notion_page_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidatos_disc_empresa_id_fkey"
            columns: ["empresa_id"]
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidatos_disc_link_id_fkey"
            columns: ["link_id"]
            referencedRelation: "links_avaliacao"
            referencedColumns: ["id"]
          }
        ]
      }
      empresas: {
        Row: {
          id: string
          nome: string
          cnpj: string | null
          logo_url: string | null
          cor_primaria: string
          cor_secundaria: string
          ativo: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          cnpj?: string | null
          logo_url?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          ativo?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          cnpj?: string | null
          logo_url?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          ativo?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string | null
          id: string
          nome_completo: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          id: string
          nome_completo: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          id?: string
          nome_completo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      gestores: {
        Row: {
          id: string
          user_id: string | null
          empresa_id: string | null
          nome: string
          email: string
          cargo: string | null
          is_admin: boolean
          ativo: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          empresa_id?: string | null
          nome: string
          email: string
          cargo?: string | null
          is_admin?: boolean
          ativo?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          empresa_id?: string | null
          nome?: string
          email?: string
          cargo?: string | null
          is_admin?: boolean
          ativo?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gestores_empresa_id_fkey"
            columns: ["empresa_id"]
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      links_avaliacao: {
        Row: {
          id: string
          empresa_id: string
          gestor_id: string | null
          codigo: string
          nome: string
          descricao: string | null
          cargo_vaga: string | null
          limite_candidatos: number | null
          data_expiracao: string | null
          ativo: boolean
          total_acessos: number
          total_completados: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          gestor_id?: string | null
          codigo: string
          nome: string
          descricao?: string | null
          cargo_vaga?: string | null
          limite_candidatos?: number | null
          data_expiracao?: string | null
          ativo?: boolean
          total_acessos?: number
          total_completados?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          gestor_id?: string | null
          codigo?: string
          nome?: string
          descricao?: string | null
          cargo_vaga?: string | null
          limite_candidatos?: number | null
          data_expiracao?: string | null
          ativo?: boolean
          total_acessos?: number
          total_completados?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_avaliacao_empresa_id_fkey"
            columns: ["empresa_id"]
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_avaliacao_gestor_id_fkey"
            columns: ["gestor_id"]
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          }
        ]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
