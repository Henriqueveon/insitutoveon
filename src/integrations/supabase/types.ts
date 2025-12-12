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
      analistas: {
        Row: {
          id: string
          nome: string
          email: string
          senha: string
          telefone: string | null
          empresa: string | null
          tipo: Database["public"]["Enums"]["tipo_analista"]
          licencas_total: number
          licencas_usadas: number
          link_unico: string
          ativo: boolean
          data_cadastro: string
          ultimo_acesso: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          senha: string
          telefone?: string | null
          empresa?: string | null
          tipo?: Database["public"]["Enums"]["tipo_analista"]
          licencas_total?: number
          licencas_usadas?: number
          link_unico?: string
          ativo?: boolean
          data_cadastro?: string
          ultimo_acesso?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          senha?: string
          telefone?: string | null
          empresa?: string | null
          tipo?: Database["public"]["Enums"]["tipo_analista"]
          licencas_total?: number
          licencas_usadas?: number
          link_unico?: string
          ativo?: boolean
          data_cadastro?: string
          ultimo_acesso?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidatos_disc: {
        Row: {
          cargo_atual: string
          created_at: string | null
          email: string | null
          empresa_instagram: string
          id: string
          nome_completo: string
          pdf_url: string | null
          perfil_adaptado: Json | null
          perfil_natural: Json | null
          perfil_tipo: string | null
          status: string | null
          telefone_whatsapp: string
          updated_at: string | null
          analista_id: string | null
        }
        Insert: {
          cargo_atual: string
          created_at?: string | null
          email?: string | null
          empresa_instagram: string
          id?: string
          nome_completo: string
          pdf_url?: string | null
          perfil_adaptado?: Json | null
          perfil_natural?: Json | null
          perfil_tipo?: string | null
          status?: string | null
          telefone_whatsapp: string
          updated_at?: string | null
          analista_id?: string | null
        }
        Update: {
          cargo_atual?: string
          created_at?: string | null
          email?: string | null
          empresa_instagram?: string
          id?: string
          nome_completo?: string
          pdf_url?: string | null
          perfil_adaptado?: Json | null
          perfil_natural?: Json | null
          perfil_tipo?: string | null
          status?: string | null
          telefone_whatsapp?: string
          updated_at?: string | null
          analista_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatos_disc_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          }
        ]
      }
      fundador: {
        Row: {
          id: string
          email: string
          senha: string
          nome: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          senha: string
          nome: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          senha?: string
          nome?: string
          created_at?: string
          updated_at?: string
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
      analista_tem_licenca: {
        Args: {
          p_analista_id: string
        }
        Returns: boolean
      }
      consumir_licenca: {
        Args: {
          p_analista_id: string
        }
        Returns: boolean
      }
      atualizar_ultimo_acesso_analista: {
        Args: {
          p_analista_id: string
        }
        Returns: undefined
      }
      login_usuario: {
        Args: {
          p_email: string
          p_senha: string
        }
        Returns: Json
      }
      alterar_senha: {
        Args: {
          p_tipo: string
          p_id: string
          p_senha_atual: string
          p_nova_senha: string
        }
        Returns: Json
      }
      criar_hash_senha: {
        Args: {
          p_senha: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      tipo_analista: "coach" | "psicologo" | "empresa" | "rh" | "escola" | "outro"
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
      tipo_analista: ["coach", "psicologo", "empresa", "rh", "escola", "outro"],
    },
  },
} as const
