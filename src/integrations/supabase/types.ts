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
      acessos_link: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          referencia_id: string
          referer: string | null
          tipo_link: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          referencia_id: string
          referer?: string | null
          tipo_link: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          referencia_id?: string
          referer?: string | null
          tipo_link?: string
          user_agent?: string | null
        }
        Relationships: []
      }
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
          ano_conclusao: string | null
          anos_experiencia: number | null
          areas_experiencia: string[] | null
          areas_interesse: string[] | null
          auth_user_id: string | null
          bairro: string | null
          cadastro_completo: boolean | null
          categoria_cnh: string | null
          cep: string | null
          certificacoes: string | null
          cidade: string | null
          complemento: string | null
          confiabilidade: number | null
          confiabilidade_flags: Json | null
          confiabilidade_nivel: string | null
          confiabilidade_score: number | null
          cpf: string | null
          created_at: string | null
          curriculo_publico: boolean | null
          curriculo_url: string | null
          curso: string | null
          data_nascimento: string | null
          disc_completado_em: string | null
          disc_resultado_json: Json | null
          disponibilidade_horario: string | null
          disponibilidade_inicio: string | null
          documento_tipo: string | null
          documento_url: string | null
          documento_verificado: boolean | null
          email: string
          escolaridade: string | null
          esta_trabalhando: boolean | null
          estado: string | null
          estado_civil: string | null
          etapa_atual: number | null
          etapa_cadastro: number | null
          etapas_completadas: number | null
          etapas_json: Json | null
          foto_url: string | null
          id: string
          idade_filhos: string | null
          indicado_por_candidato_id: string | null
          indicado_por_empresa_id: string | null
          instagram: string | null
          instituicao: string | null
          logradouro: string | null
          motivo_busca_oportunidade: string | null
          motivo_saida: string | null
          nome_completo: string
          numero: string | null
          objetivo_profissional: string | null
          perfil_disc: string | null
          perfil_disc_detalhado: Json | null
          perfil_natural: Json | null
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
          sexo: Database["public"]["Enums"]["sexo_tipo"] | null
          slug_publico: string | null
          status: string | null
          telefone: string
          tem_filhos: boolean | null
          tempo_ultima_empresa: string | null
          teste_disc_concluido: boolean | null
          teste_disc_data: string | null
          teste_disc_id: string | null
          ultima_empresa: string | null
          ultimo_cargo: string | null
          updated_at: string | null
          valores_empresa: string[] | null
          video_duracao: number | null
          video_tipo: string | null
          video_url: string | null
          visualizacoes_perfil: number | null
        }
        Insert: {
          aceita_mudanca?: string | null
          aceita_viajar?: string | null
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          ano_conclusao?: string | null
          anos_experiencia?: number | null
          areas_experiencia?: string[] | null
          areas_interesse?: string[] | null
          auth_user_id?: string | null
          bairro?: string | null
          cadastro_completo?: boolean | null
          categoria_cnh?: string | null
          cep?: string | null
          certificacoes?: string | null
          cidade?: string | null
          complemento?: string | null
          confiabilidade?: number | null
          confiabilidade_flags?: Json | null
          confiabilidade_nivel?: string | null
          confiabilidade_score?: number | null
          cpf?: string | null
          created_at?: string | null
          curriculo_publico?: boolean | null
          curriculo_url?: string | null
          curso?: string | null
          data_nascimento?: string | null
          disc_completado_em?: string | null
          disc_resultado_json?: Json | null
          disponibilidade_horario?: string | null
          disponibilidade_inicio?: string | null
          documento_tipo?: string | null
          documento_url?: string | null
          documento_verificado?: boolean | null
          email: string
          escolaridade?: string | null
          esta_trabalhando?: boolean | null
          estado?: string | null
          estado_civil?: string | null
          etapa_atual?: number | null
          etapa_cadastro?: number | null
          etapas_completadas?: number | null
          etapas_json?: Json | null
          foto_url?: string | null
          id?: string
          idade_filhos?: string | null
          indicado_por_candidato_id?: string | null
          indicado_por_empresa_id?: string | null
          instagram?: string | null
          instituicao?: string | null
          logradouro?: string | null
          motivo_busca_oportunidade?: string | null
          motivo_saida?: string | null
          nome_completo: string
          numero?: string | null
          objetivo_profissional?: string | null
          perfil_disc?: string | null
          perfil_disc_detalhado?: Json | null
          perfil_natural?: Json | null
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
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          slug_publico?: string | null
          status?: string | null
          telefone: string
          tem_filhos?: boolean | null
          tempo_ultima_empresa?: string | null
          teste_disc_concluido?: boolean | null
          teste_disc_data?: string | null
          teste_disc_id?: string | null
          ultima_empresa?: string | null
          ultimo_cargo?: string | null
          updated_at?: string | null
          valores_empresa?: string[] | null
          video_duracao?: number | null
          video_tipo?: string | null
          video_url?: string | null
          visualizacoes_perfil?: number | null
        }
        Update: {
          aceita_mudanca?: string | null
          aceita_viajar?: string | null
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          ano_conclusao?: string | null
          anos_experiencia?: number | null
          areas_experiencia?: string[] | null
          areas_interesse?: string[] | null
          auth_user_id?: string | null
          bairro?: string | null
          cadastro_completo?: boolean | null
          categoria_cnh?: string | null
          cep?: string | null
          certificacoes?: string | null
          cidade?: string | null
          complemento?: string | null
          confiabilidade?: number | null
          confiabilidade_flags?: Json | null
          confiabilidade_nivel?: string | null
          confiabilidade_score?: number | null
          cpf?: string | null
          created_at?: string | null
          curriculo_publico?: boolean | null
          curriculo_url?: string | null
          curso?: string | null
          data_nascimento?: string | null
          disc_completado_em?: string | null
          disc_resultado_json?: Json | null
          disponibilidade_horario?: string | null
          disponibilidade_inicio?: string | null
          documento_tipo?: string | null
          documento_url?: string | null
          documento_verificado?: boolean | null
          email?: string
          escolaridade?: string | null
          esta_trabalhando?: boolean | null
          estado?: string | null
          estado_civil?: string | null
          etapa_atual?: number | null
          etapa_cadastro?: number | null
          etapas_completadas?: number | null
          etapas_json?: Json | null
          foto_url?: string | null
          id?: string
          idade_filhos?: string | null
          indicado_por_candidato_id?: string | null
          indicado_por_empresa_id?: string | null
          instagram?: string | null
          instituicao?: string | null
          logradouro?: string | null
          motivo_busca_oportunidade?: string | null
          motivo_saida?: string | null
          nome_completo?: string
          numero?: string | null
          objetivo_profissional?: string | null
          perfil_disc?: string | null
          perfil_disc_detalhado?: Json | null
          perfil_natural?: Json | null
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
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          slug_publico?: string | null
          status?: string | null
          telefone?: string
          tem_filhos?: boolean | null
          tempo_ultima_empresa?: string | null
          teste_disc_concluido?: boolean | null
          teste_disc_data?: string | null
          teste_disc_id?: string | null
          ultima_empresa?: string | null
          ultimo_cargo?: string | null
          updated_at?: string | null
          valores_empresa?: string[] | null
          video_duracao?: number | null
          video_tipo?: string | null
          video_url?: string | null
          visualizacoes_perfil?: number | null
        }
        Relationships: []
      }
      candidaturas: {
        Row: {
          candidato_id: string | null
          carta_apresentacao: string | null
          comentario_recrutador: string | null
          created_at: string | null
          data_candidatura: string | null
          data_entrevista: string | null
          data_visualizacao: string | null
          fit_score: number | null
          historico_status: Json | null
          id: string
          nota_recrutador: number | null
          status: string | null
          updated_at: string | null
          vaga_id: string | null
        }
        Insert: {
          candidato_id?: string | null
          carta_apresentacao?: string | null
          comentario_recrutador?: string | null
          created_at?: string | null
          data_candidatura?: string | null
          data_entrevista?: string | null
          data_visualizacao?: string | null
          fit_score?: number | null
          historico_status?: Json | null
          id?: string
          nota_recrutador?: number | null
          status?: string | null
          updated_at?: string | null
          vaga_id?: string | null
        }
        Update: {
          candidato_id?: string | null
          carta_apresentacao?: string | null
          comentario_recrutador?: string | null
          created_at?: string | null
          data_candidatura?: string | null
          data_entrevista?: string | null
          data_visualizacao?: string | null
          fit_score?: number | null
          historico_status?: Json | null
          id?: string
          nota_recrutador?: number | null
          status?: string | null
          updated_at?: string | null
          vaga_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidaturas_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidaturas_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      cidades_brasil: {
        Row: {
          capital: boolean | null
          estado: string
          id: number
          nome: string
        }
        Insert: {
          capital?: boolean | null
          estado: string
          id?: number
          nome: string
        }
        Update: {
          capital?: boolean | null
          estado?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
      cidades_coordenadas: {
        Row: {
          cidade: string
          estado: string
          id: number
          latitude: number | null
          longitude: number | null
          populacao: number | null
        }
        Insert: {
          cidade: string
          estado: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          populacao?: number | null
        }
        Update: {
          cidade?: string
          estado?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          populacao?: number | null
        }
        Relationships: []
      }
      codigos_indicacao: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          creditos_ganhos: number | null
          id: string
          tipo_usuario: string
          total_indicacoes: number | null
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          creditos_ganhos?: number | null
          id?: string
          tipo_usuario: string
          total_indicacoes?: number | null
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          creditos_ganhos?: number | null
          id?: string
          tipo_usuario?: string
          total_indicacoes?: number | null
          usuario_id?: string
        }
        Relationships: []
      }
      diferenciais_empresa: {
        Row: {
          ativo: boolean | null
          categoria: string
          icone: string | null
          id: number
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          icone?: string | null
          id?: number
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          icone?: string | null
          id?: number
          nome?: string
          ordem?: number | null
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
          auth_user_id: string | null
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
          diferenciais: string[] | null
          email_empresa: string | null
          estado: string | null
          fotos_ambiente: string[] | null
          id: string
          instagram_empresa: string | null
          link_recrutamento: string | null
          logo_url: string | null
          logradouro: string | null
          natureza_juridica: string | null
          nome_fantasia: string | null
          num_colaboradores: string | null
          numero: string | null
          porque_trabalhar: string | null
          porte: string | null
          razao_social: string
          responsavel_cargo: string | null
          responsavel_nome: string | null
          segmento: string | null
          senha_hash: string
          site_url: string | null
          situacao_cadastral: string | null
          sobre_empresa: string | null
          socio_cpf: string
          socio_email: string
          socio_foto_url: string | null
          socio_funcao: string | null
          socio_nome: string
          socio_telefone: string
          status: string | null
          telefone_empresa: string | null
          tempo_mercado: string | null
          total_acessos_link: number | null
          updated_at: string | null
          verificado: boolean | null
        }
        Insert: {
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          auth_user_id?: string | null
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
          diferenciais?: string[] | null
          email_empresa?: string | null
          estado?: string | null
          fotos_ambiente?: string[] | null
          id?: string
          instagram_empresa?: string | null
          link_recrutamento?: string | null
          logo_url?: string | null
          logradouro?: string | null
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          num_colaboradores?: string | null
          numero?: string | null
          porque_trabalhar?: string | null
          porte?: string | null
          razao_social: string
          responsavel_cargo?: string | null
          responsavel_nome?: string | null
          segmento?: string | null
          senha_hash: string
          site_url?: string | null
          situacao_cadastral?: string | null
          sobre_empresa?: string | null
          socio_cpf: string
          socio_email: string
          socio_foto_url?: string | null
          socio_funcao?: string | null
          socio_nome: string
          socio_telefone: string
          status?: string | null
          telefone_empresa?: string | null
          tempo_mercado?: string | null
          total_acessos_link?: number | null
          updated_at?: string | null
          verificado?: boolean | null
        }
        Update: {
          aceite_lgpd?: boolean | null
          aceite_lgpd_data?: string | null
          aceite_termos?: boolean | null
          aceite_termos_data?: string | null
          auth_user_id?: string | null
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
          diferenciais?: string[] | null
          email_empresa?: string | null
          estado?: string | null
          fotos_ambiente?: string[] | null
          id?: string
          instagram_empresa?: string | null
          link_recrutamento?: string | null
          logo_url?: string | null
          logradouro?: string | null
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          num_colaboradores?: string | null
          numero?: string | null
          porque_trabalhar?: string | null
          porte?: string | null
          razao_social?: string
          responsavel_cargo?: string | null
          responsavel_nome?: string | null
          segmento?: string | null
          senha_hash?: string
          site_url?: string | null
          situacao_cadastral?: string | null
          sobre_empresa?: string | null
          socio_cpf?: string
          socio_email?: string
          socio_foto_url?: string | null
          socio_funcao?: string | null
          socio_nome?: string
          socio_telefone?: string
          status?: string | null
          telefone_empresa?: string | null
          tempo_mercado?: string | null
          total_acessos_link?: number | null
          updated_at?: string | null
          verificado?: boolean | null
        }
        Relationships: []
      }
      entrevistas_recrutamento: {
        Row: {
          candidato_id: string | null
          created_at: string | null
          data_entrevista: string
          empresa_id: string | null
          feedback_candidato: string | null
          feedback_empresa: string | null
          horario_fim: string | null
          horario_inicio: string
          id: string
          link_reuniao: string | null
          local: string | null
          nota_candidato: number | null
          nota_empresa: number | null
          proposta_id: string | null
          resultado: string | null
          status: string | null
          tipo: string
          updated_at: string | null
          vaga_id: string | null
        }
        Insert: {
          candidato_id?: string | null
          created_at?: string | null
          data_entrevista: string
          empresa_id?: string | null
          feedback_candidato?: string | null
          feedback_empresa?: string | null
          horario_fim?: string | null
          horario_inicio: string
          id?: string
          link_reuniao?: string | null
          local?: string | null
          nota_candidato?: number | null
          nota_empresa?: number | null
          proposta_id?: string | null
          resultado?: string | null
          status?: string | null
          tipo: string
          updated_at?: string | null
          vaga_id?: string | null
        }
        Update: {
          candidato_id?: string | null
          created_at?: string | null
          data_entrevista?: string
          empresa_id?: string | null
          feedback_candidato?: string | null
          feedback_empresa?: string | null
          horario_fim?: string | null
          horario_inicio?: string
          id?: string
          link_reuniao?: string | null
          local?: string | null
          nota_candidato?: number | null
          nota_empresa?: number | null
          proposta_id?: string | null
          resultado?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
          vaga_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entrevistas_recrutamento_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrevistas_recrutamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrevistas_recrutamento_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrevistas_recrutamento_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas_recrutamento"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos_recrutamento: {
        Row: {
          candidato_id: string | null
          created_at: string | null
          empresa_id: string | null
          id: string
        }
        Insert: {
          candidato_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
        }
        Update: {
          candidato_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_recrutamento_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_recrutamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_recrutamento"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes: {
        Row: {
          codigo_indicacao_id: string | null
          created_at: string | null
          creditado_em: string | null
          credito_indicado: number | null
          credito_indicador: number
          id: string
          indicado_id: string
          indicado_tipo: string
          indicador_id: string
          indicador_tipo: string
          status: string | null
        }
        Insert: {
          codigo_indicacao_id?: string | null
          created_at?: string | null
          creditado_em?: string | null
          credito_indicado?: number | null
          credito_indicador: number
          id?: string
          indicado_id: string
          indicado_tipo: string
          indicador_id: string
          indicador_tipo: string
          status?: string | null
        }
        Update: {
          codigo_indicacao_id?: string | null
          created_at?: string | null
          creditado_em?: string | null
          credito_indicado?: number | null
          credito_indicador?: number
          id?: string
          indicado_id?: string
          indicado_tipo?: string
          indicador_id?: string
          indicador_tipo?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicacoes_codigo_indicacao_id_fkey"
            columns: ["codigo_indicacao_id"]
            isOneToOne: false
            referencedRelation: "codigos_indicacao"
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
      notificacoes: {
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
      notificacoes_gestor: {
        Row: {
          agendada_para: string | null
          created_at: string | null
          criado_por: string | null
          destinatario_tipo: string
          destinatarios_ids: string[] | null
          enviada: boolean | null
          enviada_em: string | null
          id: string
          mensagem: string
          tipo: string | null
          titulo: string
          total_enviadas: number | null
          total_lidas: number | null
        }
        Insert: {
          agendada_para?: string | null
          created_at?: string | null
          criado_por?: string | null
          destinatario_tipo: string
          destinatarios_ids?: string[] | null
          enviada?: boolean | null
          enviada_em?: string | null
          id?: string
          mensagem: string
          tipo?: string | null
          titulo: string
          total_enviadas?: number | null
          total_lidas?: number | null
        }
        Update: {
          agendada_para?: string | null
          created_at?: string | null
          criado_por?: string | null
          destinatario_tipo?: string
          destinatarios_ids?: string[] | null
          enviada?: boolean | null
          enviada_em?: string | null
          id?: string
          mensagem?: string
          tipo?: string | null
          titulo?: string
          total_enviadas?: number | null
          total_lidas?: number | null
        }
        Relationships: []
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
      pacotes_creditos: {
        Row: {
          ativo: boolean | null
          badge: string | null
          cor_botao: string | null
          created_at: string | null
          destaque: boolean | null
          economia: number | null
          id: string
          nome: string
          ordem: number | null
          preco: number
          preco_original: number | null
          preco_por_entrevista: number
          quantidade_entrevistas: number
        }
        Insert: {
          ativo?: boolean | null
          badge?: string | null
          cor_botao?: string | null
          created_at?: string | null
          destaque?: boolean | null
          economia?: number | null
          id?: string
          nome: string
          ordem?: number | null
          preco: number
          preco_original?: number | null
          preco_por_entrevista: number
          quantidade_entrevistas: number
        }
        Update: {
          ativo?: boolean | null
          badge?: string | null
          cor_botao?: string | null
          created_at?: string | null
          destaque?: boolean | null
          economia?: number | null
          id?: string
          nome?: string
          ordem?: number | null
          preco?: number
          preco_original?: number | null
          preco_por_entrevista?: number
          quantidade_entrevistas?: number
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
      propostas_recrutamento: {
        Row: {
          candidato_id: string | null
          created_at: string | null
          data_contratacao: string | null
          data_entrevista: string | null
          data_pagamento: string | null
          empresa_id: string | null
          horario_entrevista: string | null
          id: string
          link_entrevista: string | null
          local_entrevista: string | null
          mensagem: string | null
          motivo_recusa: string | null
          observacao_recusa: string | null
          pago: boolean | null
          respondida_em: string | null
          salario_contratacao: number | null
          salario_oferecido: number | null
          status: string | null
          tipo_entrevista: string | null
          updated_at: string | null
          vaga_id: string | null
          valor_pago: number | null
        }
        Insert: {
          candidato_id?: string | null
          created_at?: string | null
          data_contratacao?: string | null
          data_entrevista?: string | null
          data_pagamento?: string | null
          empresa_id?: string | null
          horario_entrevista?: string | null
          id?: string
          link_entrevista?: string | null
          local_entrevista?: string | null
          mensagem?: string | null
          motivo_recusa?: string | null
          observacao_recusa?: string | null
          pago?: boolean | null
          respondida_em?: string | null
          salario_contratacao?: number | null
          salario_oferecido?: number | null
          status?: string | null
          tipo_entrevista?: string | null
          updated_at?: string | null
          vaga_id?: string | null
          valor_pago?: number | null
        }
        Update: {
          candidato_id?: string | null
          created_at?: string | null
          data_contratacao?: string | null
          data_entrevista?: string | null
          data_pagamento?: string | null
          empresa_id?: string | null
          horario_entrevista?: string | null
          id?: string
          link_entrevista?: string | null
          local_entrevista?: string | null
          mensagem?: string | null
          motivo_recusa?: string | null
          observacao_recusa?: string | null
          pago?: boolean | null
          respondida_em?: string | null
          salario_contratacao?: number | null
          salario_oferecido?: number | null
          status?: string | null
          tipo_entrevista?: string | null
          updated_at?: string | null
          vaga_id?: string | null
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_recrutamento_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_recrutamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_recrutamento_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas_recrutamento"
            referencedColumns: ["id"]
          },
        ]
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
          candidato_id: string | null
          created_at: string | null
          gateway_id: string | null
          gateway_response: Json | null
          id: string
          metodo_pagamento: string | null
          proposta_id: string | null
          solicitacao_id: string | null
          status: string | null
          tipo: string
          tipo_transacao: string | null
          usuario_id: string
          valor: number
        }
        Insert: {
          candidato_id?: string | null
          created_at?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          metodo_pagamento?: string | null
          proposta_id?: string | null
          solicitacao_id?: string | null
          status?: string | null
          tipo: string
          tipo_transacao?: string | null
          usuario_id: string
          valor: number
        }
        Update: {
          candidato_id?: string | null
          created_at?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          metodo_pagamento?: string | null
          proposta_id?: string | null
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
      vagas: {
        Row: {
          beneficios: string | null
          cargo: string | null
          cidade: string | null
          created_at: string | null
          data_encerramento: string | null
          data_publicacao: string | null
          descricao: string | null
          destaque: boolean | null
          empresa_id: string | null
          estado: string | null
          id: string
          modelo: string | null
          nivel: string | null
          perfil_disc_ideal: string | null
          regime: string | null
          requisitos: string | null
          salario_max: number | null
          salario_min: number | null
          salario_visivel: boolean | null
          status: string | null
          titulo: string
          total_candidaturas: number | null
          updated_at: string | null
          urgente: boolean | null
          visualizacoes: number | null
        }
        Insert: {
          beneficios?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string | null
          data_encerramento?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          destaque?: boolean | null
          empresa_id?: string | null
          estado?: string | null
          id?: string
          modelo?: string | null
          nivel?: string | null
          perfil_disc_ideal?: string | null
          regime?: string | null
          requisitos?: string | null
          salario_max?: number | null
          salario_min?: number | null
          salario_visivel?: boolean | null
          status?: string | null
          titulo: string
          total_candidaturas?: number | null
          updated_at?: string | null
          urgente?: boolean | null
          visualizacoes?: number | null
        }
        Update: {
          beneficios?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string | null
          data_encerramento?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          destaque?: boolean | null
          empresa_id?: string | null
          estado?: string | null
          id?: string
          modelo?: string | null
          nivel?: string | null
          perfil_disc_ideal?: string | null
          regime?: string | null
          requisitos?: string | null
          salario_max?: number | null
          salario_min?: number | null
          salario_visivel?: boolean | null
          status?: string | null
          titulo?: string
          total_candidaturas?: number | null
          updated_at?: string | null
          urgente?: boolean | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vagas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_recrutamento"
            referencedColumns: ["id"]
          },
        ]
      }
      vagas_recrutamento: {
        Row: {
          areas_conhecimento: string[] | null
          beneficios: string[] | null
          carga_horaria: string | null
          categoria_cnh_requerida: string | null
          cidade: string | null
          created_at: string | null
          descricao: string | null
          empresa_id: string | null
          encerrada_em: string | null
          endereco: string | null
          escolaridade_minima: string | null
          estado: string | null
          experiencia_minima: number | null
          faixa_salarial: string | null
          faixa_salarial_max: number | null
          faixa_salarial_min: number | null
          horario: string | null
          id: string
          modalidade: string | null
          palavras_funcionario_ideal: string | null
          perfil_disc_desejado: string | null
          perfil_disc_ideal: string | null
          quantidade_vagas: number | null
          regime: string | null
          requer_cnh: boolean | null
          requer_veiculo: boolean | null
          requisitos: string[] | null
          salario_maximo: number | null
          salario_minimo: number | null
          status: string | null
          titulo: string
          updated_at: string | null
          urgente: boolean | null
        }
        Insert: {
          areas_conhecimento?: string[] | null
          beneficios?: string[] | null
          carga_horaria?: string | null
          categoria_cnh_requerida?: string | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          encerrada_em?: string | null
          endereco?: string | null
          escolaridade_minima?: string | null
          estado?: string | null
          experiencia_minima?: number | null
          faixa_salarial?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          horario?: string | null
          id?: string
          modalidade?: string | null
          palavras_funcionario_ideal?: string | null
          perfil_disc_desejado?: string | null
          perfil_disc_ideal?: string | null
          quantidade_vagas?: number | null
          regime?: string | null
          requer_cnh?: boolean | null
          requer_veiculo?: boolean | null
          requisitos?: string[] | null
          salario_maximo?: number | null
          salario_minimo?: number | null
          status?: string | null
          titulo: string
          updated_at?: string | null
          urgente?: boolean | null
        }
        Update: {
          areas_conhecimento?: string[] | null
          beneficios?: string[] | null
          carga_horaria?: string | null
          categoria_cnh_requerida?: string | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          encerrada_em?: string | null
          endereco?: string | null
          escolaridade_minima?: string | null
          estado?: string | null
          experiencia_minima?: number | null
          faixa_salarial?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          horario?: string | null
          id?: string
          modalidade?: string | null
          palavras_funcionario_ideal?: string | null
          perfil_disc_desejado?: string | null
          perfil_disc_ideal?: string | null
          quantidade_vagas?: number | null
          regime?: string | null
          requer_cnh?: boolean | null
          requer_veiculo?: boolean | null
          requisitos?: string[] | null
          salario_maximo?: number | null
          salario_minimo?: number | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
          urgente?: boolean | null
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
      visualizacoes_perfil: {
        Row: {
          candidato_id: string | null
          empresa_id: string | null
          id: string
          ip_address: string | null
          origem: string | null
          user_agent: string | null
          vaga_id: string | null
          visualizado_em: string | null
        }
        Insert: {
          candidato_id?: string | null
          empresa_id?: string | null
          id?: string
          ip_address?: string | null
          origem?: string | null
          user_agent?: string | null
          vaga_id?: string | null
          visualizado_em?: string | null
        }
        Update: {
          candidato_id?: string | null
          empresa_id?: string | null
          id?: string
          ip_address?: string | null
          origem?: string | null
          user_agent?: string | null
          vaga_id?: string | null
          visualizado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visualizacoes_perfil_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visualizacoes_perfil_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_recrutamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visualizacoes_perfil_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
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
      atualizar_status_candidato: {
        Args: { p_candidato_id: string; p_status: string }
        Returns: Json
      }
      atualizar_status_empresa: {
        Args: { p_empresa_id: string; p_status: string }
        Returns: Json
      }
      buscar_candidatos_por_raio: {
        Args: {
          p_cidade_origem: string
          p_estado_origem: string
          p_raio_km?: number
        }
        Returns: {
          candidato_id: string
          cidade: string
          distancia_km: number
          estado: string
          nome_completo: string
        }[]
      }
      buscar_cidades: {
        Args: { p_estado?: string; p_limite?: number; p_termo: string }
        Returns: {
          capital: boolean
          cidade: string
          estado: string
        }[]
      }
      cadastrar_candidato_com_auth: {
        Args: {
          p_auth_user_id?: string
          p_codigo_indicacao?: string
          p_email: string
          p_nome: string
          p_sexo?: string
          p_telefone?: string
        }
        Returns: Json
      }
      cadastrar_candidato_rapido: {
        Args: {
          p_auth_user_id?: string
          p_codigo_indicacao?: string
          p_email: string
          p_nome_completo: string
          p_telefone: string
        }
        Returns: Json
      }
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
      cadastrar_empresa_com_auth: {
        Args: {
          p_auth_user_id?: string
          p_email: string
          p_razao_social: string
          p_responsavel_nome?: string
          p_socio_funcao?: string
          p_telefone?: string
        }
        Returns: Json
      }
      calcular_confiabilidade: {
        Args: { p_candidato_id: string }
        Returns: number
      }
      calcular_distancia_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      completar_cadastro_candidato: {
        Args: {
          p_candidato_id: string
          p_cidade?: string
          p_cpf?: string
          p_data_nascimento?: string
          p_estado?: string
          p_instagram?: string
          p_objetivo_profissional?: string
          p_pretensao_salarial?: string
          p_ultima_empresa?: string
          p_ultimo_cargo?: string
        }
        Returns: Json
      }
      completar_cadastro_empresa: {
        Args: {
          p_cep?: string
          p_cidade?: string
          p_cnpj?: string
          p_empresa_id: string
          p_estado?: string
          p_logradouro?: string
          p_nome_fantasia?: string
          p_porte?: string
          p_segmento?: string
        }
        Returns: Json
      }
      contar_notificacoes_nao_lidas: {
        Args: { p_tipo_usuario: string; p_usuario_id: string }
        Returns: number
      }
      creditar_indicacao: { Args: { p_indicado_id: string }; Returns: Json }
      criar_otp: { Args: { p_email: string; p_tipo?: string }; Returns: Json }
      delete_candidato: { Args: { p_candidato_id: string }; Returns: Json }
      delete_candidato_completo: {
        Args: { p_candidato_id: string }
        Returns: Json
      }
      delete_empresa: { Args: { p_empresa_id: string }; Returns: Json }
      enviar_notificacao_massa: {
        Args: {
          p_destinatario_tipo: string
          p_destinatarios_ids?: string[]
          p_mensagem: string
          p_tipo: string
          p_titulo: string
        }
        Returns: Json
      }
      finalizar_disc_candidato: {
        Args: {
          p_candidato_id: string
          p_perfil_disc: string
          p_resultado_json?: Json
        }
        Returns: Json
      }
      gerar_codigo_indicacao: {
        Args: { p_tipo_usuario: string; p_usuario_id: string }
        Returns: Json
      }
      get_candidato_logado: { Args: never; Returns: Json }
      get_candidato_por_slug: { Args: { p_slug: string }; Returns: Json }
      get_empresa_logada: { Args: never; Returns: Json }
      get_tipo_usuario: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      limpar_otps_expirados: { Args: never; Returns: undefined }
      listar_candidatos_publicos: {
        Args: {
          p_cidade?: string
          p_estado?: string
          p_limite?: number
          p_offset?: number
          p_perfil_disc?: string
        }
        Returns: Json
      }
      marcar_notificacao_lida: {
        Args: { p_notificacao_id: string }
        Returns: Json
      }
      marcar_todas_notificacoes_lidas: {
        Args: { p_tipo_usuario: string; p_usuario_id: string }
        Returns: Json
      }
      obter_estatisticas_sexo: {
        Args: { p_empresa_id?: string }
        Returns: Json
      }
      processar_indicacao: {
        Args: {
          p_codigo: string
          p_indicado_id: string
          p_indicado_tipo: string
        }
        Returns: Json
      }
      registrar_acesso_link: {
        Args: {
          p_ip_address?: string
          p_referencia_id: string
          p_referer?: string
          p_tipo_link: string
          p_user_agent?: string
        }
        Returns: Json
      }
      unaccent: { Args: { "": string }; Returns: string }
      verificar_otp: {
        Args: { p_codigo: string; p_email: string; p_tipo?: string }
        Returns: Json
      }
      vincular_auth_candidato: {
        Args: { p_auth_user_id?: string; p_candidato_id: string }
        Returns: Json
      }
      vincular_auth_empresa: {
        Args: { p_auth_user_id?: string; p_empresa_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      sexo_tipo: "masculino" | "feminino" | "outro" | "prefiro_nao_informar"
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
      sexo_tipo: ["masculino", "feminino", "outro", "prefiro_nao_informar"],
    },
  },
} as const
