// =====================================================
// TIPOS: Área de Recrutamento VEON
// =====================================================

export interface EmpresaRecrutamento {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral?: string;
  data_abertura?: string;
  natureza_juridica?: string;
  porte?: string;
  capital_social?: number;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone_empresa?: string;
  email_empresa?: string;
  socio_nome: string;
  socio_cpf: string;
  socio_email: string;
  socio_telefone: string;
  socio_foto_url?: string;
  senha_hash: string;
  creditos?: number;
  cartao_token?: string;
  aceite_termos?: boolean;
  aceite_termos_data?: string;
  aceite_lgpd?: boolean;
  aceite_lgpd_data?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CandidatoRecrutamento {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
  email: string;
  estado: string;
  cidade: string;
  bairro?: string;
  esta_trabalhando?: boolean;
  salario_atual?: string;
  regime_atual?: string;
  motivo_busca_oportunidade?: string;
  disponibilidade_inicio?: string;
  regime_preferido?: string;
  ultima_empresa?: string;
  ultimo_cargo?: string;
  tempo_ultima_empresa?: string;
  motivo_saida?: string;
  areas_experiencia?: string[];
  anos_experiencia?: number;
  escolaridade?: string;
  curso?: string;
  certificacoes?: string;
  possui_veiculo?: string;
  possui_cnh?: string;
  disponibilidade_horario?: string;
  aceita_viajar?: string;
  aceita_mudanca?: string;
  estado_civil?: string;
  tem_filhos?: boolean;
  quantidade_filhos?: number;
  idade_filhos?: string;
  instagram?: string;
  pretensao_salarial?: string;
  valores_empresa?: string[];
  areas_interesse?: string[];
  objetivo_profissional?: string;
  foto_url?: string;
  video_url?: string;
  video_duracao?: number;
  video_tipo?: string;
  documento_url?: string;
  documento_tipo?: string;
  documento_verificado?: boolean;
  teste_disc_id?: string;
  perfil_disc?: string;
  perfil_valores?: Record<string, unknown>;
  status?: string;
  recrutado_por_empresa_id?: string;
  recrutado_data?: string;
  aceite_termos?: boolean;
  aceite_termos_data?: string;
  aceite_lgpd?: boolean;
  aceite_lgpd_data?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VagaRecrutamento {
  id: string;
  empresa_id: string;
  titulo: string;
  descricao?: string;
  faixa_salarial_min?: number;
  faixa_salarial_max?: number;
  regime?: string;
  cidade?: string;
  estado?: string;
  modalidade?: string;
  horario?: string;
  beneficios?: string[];
  requisitos?: string[];
  palavras_funcionario_ideal?: string;
  perfil_disc_ideal?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SolicitacaoEntrevista {
  id: string;
  empresa_id: string;
  candidato_id: string;
  vaga_id?: string;
  status?: string;
  empresa_pagou?: boolean;
  empresa_valor_pago?: number;
  empresa_pagamento_data?: string;
  empresa_pagamento_id?: string;
  candidato_pagou?: boolean;
  candidato_valor_pago?: number;
  candidato_pagamento_data?: string;
  candidato_pagamento_id?: string;
  motivo_recusa?: string;
  dados_liberados?: boolean;
  dados_liberados_data?: string;
  match_percentual?: number;
  created_at?: string;
  updated_at?: string;
  expira_em?: string;
}

export interface TransacaoRecrutamento {
  id: string;
  tipo: string;
  usuario_id: string;
  solicitacao_id?: string;
  valor: number;
  tipo_transacao?: string;
  metodo_pagamento?: string;
  status?: string;
  gateway_id?: string;
  gateway_response?: Record<string, unknown>;
  created_at?: string;
}

export interface NotificacaoRecrutamento {
  id: string;
  tipo_destinatario: string;
  destinatario_id: string;
  tipo_notificacao: string;
  titulo: string;
  mensagem: string;
  dados?: Record<string, unknown>;
  lida?: boolean;
  lida_em?: string;
  enviada_whatsapp?: boolean;
  enviada_whatsapp_em?: string;
  created_at?: string;
}
