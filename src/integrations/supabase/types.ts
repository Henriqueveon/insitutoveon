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
          ativo: boolean | null
          cpf_cnpj: string | null
          data_cadastro: string | null
          email: string
          empresa: string | null
          id: string
          licencas_total: number | null
          licencas_usadas: number | null
          link_unico: string | null
          nome: string
          senha: string
          telefone: string | null
          tipo: string | null
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cpf_cnpj?: string | null
          data_cadastro?: string | null
          email: string
          empresa?: string | null
          id?: string
          licencas_total?: number | null
          licencas_usadas?: number | null
          link_unico?: string | null
          nome: string
          senha: string
          telefone?: string | null
          tipo?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cpf_cnpj?: string | null
          data_cadastro?: string | null
          email?: string
          empresa?: string | null
          id?: string
          licencas_total?: number | null
          licencas_usadas?: number | null
          link_unico?: string | null
          nome?: string
          senha?: string
          telefone?: string | null
          tipo?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candidatos_disc: {
        Row: {
          analista_id: string | null
          cargo_atual: string
          confiabilidade_nivel: string | null
          confiabilidade_score: number | null
          created_at: string | null
          email: string | null
          empresa_instagram: string
          flags_detectadas: string[] | null
          id: string
          nome_completo: string
          pdf_url: string | null
          perfil_adaptado: Json | null
          perfil_natural: Json | null
          perfil_tipo: string | null
          status: string | null
          telefone_whatsapp: string
          tempo_por_questao: Json | null
          tempo_total_segundos: number | null
          updated_at: string | null
        }
        Insert: {
          analista_id?: string | null
          cargo_atual: string
          confiabilidade_nivel?: string | null
          confiabilidade_score?: number | null
          created_at?: string | null
          email?: string | null
          empresa_instagram: string
          flags_detectadas?: string[] | null
          id?: string
          nome_completo: string
          pdf_url?: string | null
          perfil_adaptado?: Json | null
          perfil_natural?: Json | null
          perfil_tipo?: string | null
          status?: string | null
          telefone_whatsapp: string
          tempo_por_questao?: Json | null
          tempo_total_segundos?: number | null
          updated_at?: string | null
        }
        Update: {
          analista_id?: string | null
          cargo_atual?: string
          confiabilidade_nivel?: string | null
          confiabilidade_score?: number | null
          created_at?: string | null
          email?: string | null
          empresa_instagram?: string
          flags_detectadas?: string[] | null
          id?: string
          nome_completo?: string
          pdf_url?: string | null
          perfil_adaptado?: Json | null
          perfil_natural?: Json | null
          perfil_tipo?: string | null
          status?: string | null
          telefone_whatsapp?: string
          tempo_por_questao?: Json | null
          tempo_total_segundos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatos_disc_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas_teste: {
        Row: {
          candidato_id: string | null
          confiabilidade_nivel: string | null
          confiabilidade_score: number | null
          created_at: string | null
          ctrl_atencao_passou: boolean | null
          ctrl_atencao_resposta: string | null
          ctrl_consistencia_passou: boolean | null
          ctrl_consistencia_questao_comparada: number | null
          ctrl_consistencia_resposta: string | null
          ctrl_consistencia_resposta_original: string | null
          ctrl_desejabilidade_passou: boolean | null
          ctrl_desejabilidade_resposta: string | null
          ctrl_tempo_passou: boolean | null
          dispositivo: string | null
          flags_detectadas: string[] | null
          id: string
          ip_hash: string | null
          navegador: string | null
          padrao_contraditorio: boolean | null
          padrao_flat_profile: boolean | null
          padrao_tempo_lento: boolean | null
          padrao_tempo_rapido: boolean | null
          respostas_brutas: Json | null
          scores_disc_brutos: Json | null
          scores_spranger_brutos: Json | null
          tempo_medio_ms: number | null
          tempo_por_questao: Json | null
          tempo_total_segundos: number | null
          versao_teste: string | null
        }
        Insert: {
          candidato_id?: string | null
          confiabilidade_nivel?: string | null
          confiabilidade_score?: number | null
          created_at?: string | null
          ctrl_atencao_passou?: boolean | null
          ctrl_atencao_resposta?: string | null
          ctrl_consistencia_passou?: boolean | null
          ctrl_consistencia_questao_comparada?: number | null
          ctrl_consistencia_resposta?: string | null
          ctrl_consistencia_resposta_original?: string | null
          ctrl_desejabilidade_passou?: boolean | null
          ctrl_desejabilidade_resposta?: string | null
          ctrl_tempo_passou?: boolean | null
          dispositivo?: string | null
          flags_detectadas?: string[] | null
          id?: string
          ip_hash?: string | null
          navegador?: string | null
          padrao_contraditorio?: boolean | null
          padrao_flat_profile?: boolean | null
          padrao_tempo_lento?: boolean | null
          padrao_tempo_rapido?: boolean | null
          respostas_brutas?: Json | null
          scores_disc_brutos?: Json | null
          scores_spranger_brutos?: Json | null
          tempo_medio_ms?: number | null
          tempo_por_questao?: Json | null
          tempo_total_segundos?: number | null
          versao_teste?: string | null
        }
        Update: {
          candidato_id?: string | null
          confiabilidade_nivel?: string | null
          confiabilidade_score?: number | null
          created_at?: string | null
          ctrl_atencao_passou?: boolean | null
          ctrl_atencao_resposta?: string | null
          ctrl_consistencia_passou?: boolean | null
          ctrl_consistencia_questao_comparada?: number | null
          ctrl_consistencia_resposta?: string | null
          ctrl_consistencia_resposta_original?: string | null
          ctrl_desejabilidade_passou?: boolean | null
          ctrl_desejabilidade_resposta?: string | null
          ctrl_tempo_passou?: boolean | null
          dispositivo?: string | null
          flags_detectadas?: string[] | null
          id?: string
          ip_hash?: string | null
          navegador?: string | null
          padrao_contraditorio?: boolean | null
          padrao_flat_profile?: boolean | null
          padrao_tempo_lento?: boolean | null
          padrao_tempo_rapido?: boolean | null
          respostas_brutas?: Json | null
          scores_disc_brutos?: Json | null
          scores_spranger_brutos?: Json | null
          tempo_medio_ms?: number | null
          tempo_por_questao?: Json | null
          tempo_total_segundos?: number | null
          versao_teste?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_teste_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos_disc"
            referencedColumns: ["id"]
          },
        ]
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
      estatisticas_validacao: {
        Row: {
          falhas_atencao: number | null
          falhas_consistencia: number | null
          falhas_desejabilidade: number | null
          falhas_tempo: number | null
          score_medio: number | null
          tempo_medio_por_questao_ms: number | null
          tempo_medio_segundos: number | null
          testes_alta: number | null
          testes_baixa: number | null
          testes_media: number | null
          testes_suspeita: number | null
          total_testes: number | null
          versao_teste: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_candidato: { Args: { p_candidato_id: string }; Returns: Json }
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
