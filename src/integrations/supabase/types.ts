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
      candidatos_recrutamento: {
        Row: {
          aceita_mudanca: string | null
          aceita_viajar: string | null
          aceite_lgpd: boolean | null
          aceite_lgpd_data: string | null
          aceite_termos: boolean | null
          aceite_termos_data: string | null
          anos_experiencia: number | null
          areas_experiencia: string[] | null
          areas_interesse: string[] | null
          bairro: string | null
          certificacoes: string | null
          cidade: string
          cpf: string
          created_at: string | null
          curso: string | null
          data_nascimento: string
          disponibilidade_horario: string | null
          disponibilidade_inicio: string | null
          documento_tipo: string | null
          documento_url: string | null
          documento_verificado: boolean | null
          email: string
          escolaridade: string | null
          esta_trabalhando: boolean | null
          estado: string
          estado_civil: string | null
          foto_url: string | null
          id: string
          idade_filhos: string | null
          instagram: string | null
          motivo_busca_oportunidade: string | null
          motivo_saida: string | null
          nome_completo: string
          objetivo_profissional: string | null
          perfil_disc: string | null
          perfil_valores: Json | null
          possui_cnh: string | null
          possui_veiculo: string | null
          pretensao_salarial: string | null
          quantidade_filhos: number | null
          recrutado_data: string | null
          recrutado_por_empresa_id: string | null
          regime_atual: string | null
          regime_preferido: string | null
          salario_atual: string | null
          status: string | null
          telefone: string
          tem_filhos: boolean | null
          tempo_ultima_empresa: string | null
          teste_disc_id: string | null
          ultima_empresa: string | null
          ultimo_cargo: string | null
          updated_at: string | null
          valores_empresa: string[] | null
          video_duracao: number | null
          video_tipo: string | null
          video_url: string | null
        }
        Insert: {
          aceita_mudanca?: string | null
          aceita_viajar?: string | null
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          anos_experiencia?: number | null
          areas_experiencia?: string[] | null
          areas_interesse?: string[] | null
          bairro?: string | null
          certificacoes?: string | null
          cidade: string
          cpf: string
          created_at?: string | null
          curso?: string | null
          data_nascimento: string
          disponibilidade_horario?: string | null
          disponibilidade_inicio?: string | null
          documento_tipo?: string | null
          documento_url?: string | null
          documento_verificado?: boolean | null
          email: string
          escolaridade?: string | null
          esta_trabalhando?: boolean | null
          estado: string
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          idade_filhos?: string | null
          instagram?: string | null
          motivo_busca_oportunidade?: string | null
          motivo_saida?: string | null
          nome_completo: string
          objetivo_profissional?: string | null
          perfil_disc?: string | null
          perfil_valores?: Json | null
          possui_cnh?: string | null
          possui_veiculo?: string | null
          pretensao_salarial?: string | null
          quantidade_filhos?: number | null
          recrutado_data?: string | null
          recrutado_por_empresa_id?: string | null
          regime_atual?: string | null
          regime_preferido?: string | null
          salario_atual?: string | null
          status?: string | null
          telefone: string
          tem_filhos?: boolean | null
          tempo_ultima_empresa?: string | null
          teste_disc_id?: string | null
          ultima_empresa?: string | null
          ultimo_cargo?: string | null
          updated_at?: string | null
          valores_empresa?: string[] | null
          video_duracao?: number | null
          video_tipo?: string | null
          video_url?: string | null
        }
        Update: {
          aceita_mudanca?: string | null
          aceita_viajar?: string | null
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          anos_experiencia?: number | null
          areas_experiencia?: string[] | null
          areas_interesse?: string[] | null
          bairro?: string | null
          certificacoes?: string | null
          cidade?: string
          cpf?: string
          created_at?: string | null
          curso?: string | null
          data_nascimento?: string
          disponibilidade_horario?: string | null
          disponibilidade_inicio?: string | null
          documento_tipo?: string | null
          documento_url?: string | null
          documento_verificado?: boolean | null
          email?: string
          escolaridade?: string | null
          esta_trabalhando?: boolean | null
          estado?: string
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          idade_filhos?: string | null
          instagram?: string | null
          motivo_busca_oportunidade?: string | null
          motivo_saida?: string | null
          nome_completo?: string
          objetivo_profissional?: string | null
          perfil_disc?: string | null
          perfil_valores?: Json | null
          possui_cnh?: string | null
          possui_veiculo?: string | null
          pretensao_salarial?: string | null
          quantidade_filhos?: number | null
          recrutado_data?: string | null
          recrutado_por_empresa_id?: string | null
          regime_atual?: string | null
          regime_preferido?: string | null
          salario_atual?: string | null
          status?: string | null
          telefone?: string
          tem_filhos?: boolean | null
          tempo_ultima_empresa?: string | null
          teste_disc_id?: string | null
          ultima_empresa?: string | null
          ultimo_cargo?: string | null
          updated_at?: string | null
          valores_empresa?: string[] | null
          video_duracao?: number | null
          video_tipo?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      email_otps: {
        Row: {
          codigo: string
          criado_em: string | null
          email: string
          expira_em: string
          id: string
          max_tentativas: number | null
          tentativas: number | null
          tipo: string
          verificado: boolean | null
          verificado_em: string | null
        }
        Insert: {
          codigo: string
          criado_em?: string | null
          email: string
          expira_em: string
          id?: string
          max_tentativas?: number | null
          tentativas?: number | null
          tipo?: string
          verificado?: boolean | null
          verificado_em?: string | null
        }
        Update: {
          codigo?: string
          criado_em?: string | null
          email?: string
          expira_em?: string
          id?: string
          max_tentativas?: number | null
          tentativas?: number | null
          tipo?: string
          verificado?: boolean | null
          verificado_em?: string | null
        }
        Relationships: []
      }
      empresas_recrutamento: {
        Row: {
          aceite_lgpd: boolean | null
          aceite_lgpd_data: string | null
          aceite_termos: boolean | null
          aceite_termos_data: string | null
          bairro: string | null
          capital_social: number | null
          cartao_token: string | null
          cep: string | null
          cidade: string | null
          cnpj: string
          complemento: string | null
          created_at: string | null
          creditos: number | null
          data_abertura: string | null
          email_empresa: string | null
          estado: string | null
          id: string
          logradouro: string | null
          natureza_juridica: string | null
          nome_fantasia: string | null
          numero: string | null
          porte: string | null
          razao_social: string
          senha_hash: string
          situacao_cadastral: string | null
          socio_cpf: string
          socio_email: string
          socio_foto_url: string | null
          socio_nome: string
          socio_telefone: string
          status: string | null
          telefone_empresa: string | null
          updated_at: string | null
        }
        Insert: {
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          bairro?: string | null
          capital_social?: number | null
          cartao_token?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj: string
          complemento?: string | null
          created_at?: string | null
          creditos?: number | null
          data_abertura?: string | null
          email_empresa?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          porte?: string | null
          razao_social: string
          senha_hash: string
          situacao_cadastral?: string | null
          socio_cpf: string
          socio_email: string
          socio_foto_url?: string | null
          socio_nome: string
          socio_telefone: string
          status?: string | null
          telefone_empresa?: string | null
          updated_at?: string | null
        }
        Update: {
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          bairro?: string | null
          capital_social?: number | null
          cartao_token?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          complemento?: string | null
          created_at?: string | null
          creditos?: number | null
          data_abertura?: string | null
          email_empresa?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          porte?: string | null
          razao_social?: string
          senha_hash?: string
          situacao_cadastral?: string | null
          socio_cpf?: string
          socio_email?: string
          socio_foto_url?: string | null
          socio_nome?: string
          socio_telefone?: string
          status?: string | null
          telefone_empresa?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      notificacoes_recrutamento: {
        Row: {
          created_at: string | null
          dados: Json | null
          destinatario_id: string
          enviada_whatsapp: boolean | null
          enviada_whatsapp_em: string | null
          id: string
          lida: boolean | null
          lida_em: string | null
          mensagem: string
          tipo_destinatario: string
          tipo_notificacao: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          dados?: Json | null
          destinatario_id: string
          enviada_whatsapp?: boolean | null
          enviada_whatsapp_em?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem: string
          tipo_destinatario: string
          tipo_notificacao: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          dados?: Json | null
          destinatario_id?: string
          enviada_whatsapp?: boolean | null
          enviada_whatsapp_em?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string
          tipo_destinatario?: string
          tipo_notificacao?: string
          titulo?: string
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
      solicitacoes_entrevista: {
        Row: {
          candidato_id: string | null
          candidato_pagamento_data: string | null
          candidato_pagamento_id: string | null
          candidato_pagou: boolean | null
          candidato_valor_pago: number | null
          created_at: string | null
          dados_liberados: boolean | null
          dados_liberados_data: string | null
          empresa_id: string | null
          empresa_pagamento_data: string | null
          empresa_pagamento_id: string | null
          empresa_pagou: boolean | null
          empresa_valor_pago: number | null
          expira_em: string | null
          id: string
          match_percentual: number | null
          motivo_recusa: string | null
          status: string | null
          updated_at: string | null
          vaga_id: string | null
        }
        Insert: {
          candidato_id?: string | null
          candidato_pagamento_data?: string | null
          candidato_pagamento_id?: string | null
          candidato_pagou?: boolean | null
          candidato_valor_pago?: number | null
          created_at?: string | null
          dados_liberados?: boolean | null
          dados_liberados_data?: string | null
          empresa_id?: string | null
          empresa_pagamento_data?: string | null
          empresa_pagamento_id?: string | null
          empresa_pagou?: boolean | null
          empresa_valor_pago?: number | null
          expira_em?: string | null
          id?: string
          match_percentual?: number | null
          motivo_recusa?: string | null
          status?: string | null
          updated_at?: string | null
          vaga_id?: string | null
        }
        Update: {
          candidato_id?: string | null
          candidato_pagamento_data?: string | null
          candidato_pagamento_id?: string | null
          candidato_pagou?: boolean | null
          candidato_valor_pago?: number | null
          created_at?: string | null
          dados_liberados?: boolean | null
          dados_liberados_data?: string | null
          empresa_id?: string | null
          empresa_pagamento_data?: string | null
          empresa_pagamento_id?: string | null
          empresa_pagou?: boolean | null
          empresa_valor_pago?: number | null
          expira_em?: string | null
          id?: string
          match_percentual?: number | null
          motivo_recusa?: string | null
          status?: string | null
          updated_at?: string | null
          vaga_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_entrevista_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_entrevista_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_entrevista_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas_recrutamento"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_recrutamento: {
        Row: {
          created_at: string | null
          gateway_id: string | null
          gateway_response: Json | null
          id: string
          metodo_pagamento: string | null
          solicitacao_id: string | null
          status: string | null
          tipo: string
          tipo_transacao: string | null
          usuario_id: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          metodo_pagamento?: string | null
          solicitacao_id?: string | null
          status?: string | null
          tipo: string
          tipo_transacao?: string | null
          usuario_id: string
          valor: number
        }
        Update: {
          created_at?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          metodo_pagamento?: string | null
          solicitacao_id?: string | null
          status?: string | null
          tipo?: string
          tipo_transacao?: string | null
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_recrutamento_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_entrevista"
            referencedColumns: ["id"]
          },
        ]
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
      vagas_recrutamento: {
        Row: {
          beneficios: string[] | null
          cidade: string | null
          created_at: string | null
          descricao: string | null
          empresa_id: string | null
          estado: string | null
          faixa_salarial_max: number | null
          faixa_salarial_min: number | null
          horario: string | null
          id: string
          modalidade: string | null
          palavras_funcionario_ideal: string | null
          perfil_disc_ideal: string | null
          regime: string | null
          requisitos: string[] | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          beneficios?: string[] | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          estado?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          horario?: string | null
          id?: string
          modalidade?: string | null
          palavras_funcionario_ideal?: string | null
          perfil_disc_ideal?: string | null
          regime?: string | null
          requisitos?: string[] | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          beneficios?: string[] | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          estado?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          horario?: string | null
          id?: string
          modalidade?: string | null
          palavras_funcionario_ideal?: string | null
          perfil_disc_ideal?: string | null
          regime?: string | null
          requisitos?: string[] | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vagas_recrutamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_recrutamento"
            referencedColumns: ["id"]
          },
        ]
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
      cadastrar_empresa: {
        Args: {
          p_aceite_lgpd?: boolean
          p_aceite_termos?: boolean
          p_bairro?: string
          p_capital_social?: number
          p_cep?: string
          p_cidade?: string
          p_cnpj: string
          p_complemento?: string
          p_data_abertura?: string
          p_email_empresa?: string
          p_estado?: string
          p_logradouro?: string
          p_natureza_juridica?: string
          p_nome_fantasia?: string
          p_numero?: string
          p_porte?: string
          p_razao_social: string
          p_situacao_cadastral?: string
          p_socio_cpf: string
          p_socio_email: string
          p_socio_foto_url?: string
          p_socio_nome: string
          p_socio_telefone: string
          p_telefone_empresa?: string
        }
        Returns: Json
      }
      criar_otp: { Args: { p_email: string; p_tipo?: string }; Returns: Json }
      delete_candidato: { Args: { p_candidato_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      limpar_otps_expirados: { Args: never; Returns: undefined }
      verificar_otp: {
        Args: { p_codigo: string; p_email: string; p_tipo?: string }
        Returns: Json
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
