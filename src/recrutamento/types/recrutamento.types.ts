// =====================================================
// TYPES: Área de Recrutamento VEON
// =====================================================

// ============================================
// EMPRESA RECRUTADORA
// ============================================
export interface EmpresaRecrutamento {
  id: string;

  // Dados do CNPJ
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  situacao_cadastral: string | null;
  data_abertura: string | null;
  natureza_juridica: string | null;
  porte: string | null;
  capital_social: number | null;

  // Endereço
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;

  // Contato
  telefone_empresa: string | null;
  email_empresa: string | null;

  // Sócio responsável
  socio_nome: string;
  socio_cpf: string;
  socio_email: string;
  socio_telefone: string;
  socio_foto_url: string | null;

  // Financeiro
  creditos: number;
  cartao_token: string | null;

  // Termos
  aceite_termos: boolean;
  aceite_termos_data: string | null;
  aceite_lgpd: boolean;
  aceite_lgpd_data: string | null;

  // Controle
  status: 'ativo' | 'inativo' | 'suspenso';
  created_at: string;
  updated_at: string;
}

// ============================================
// CANDIDATO RECRUTAMENTO
// ============================================
export interface CandidatoRecrutamento {
  id: string;

  // BLOCO 1: Dados Pessoais
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
  email: string;
  estado: string;
  cidade: string;
  bairro: string | null;

  // BLOCO 2: Situação Atual
  esta_trabalhando: boolean | null;
  salario_atual: string | null;
  regime_atual: 'CLT' | 'PJ' | null;
  motivo_busca_oportunidade: string | null;
  disponibilidade_inicio: string | null;
  regime_preferido: 'CLT' | 'PJ' | 'Ambos' | null;

  // BLOCO 3: Experiência Profissional
  ultima_empresa: string | null;
  ultimo_cargo: string | null;
  tempo_ultima_empresa: string | null;
  motivo_saida: string | null;
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;

  // BLOCO 4: Formação
  escolaridade: string | null;
  curso: string | null;
  certificacoes: string | null;

  // BLOCO 5: Logística
  possui_veiculo: 'Carro' | 'Moto' | 'Bicicleta' | 'Não' | null;
  possui_cnh: 'A' | 'B' | 'AB' | 'Não' | null;
  disponibilidade_horario: string | null;
  aceita_viajar: string | null;
  aceita_mudanca: string | null;

  // BLOCO 6: Vida Pessoal
  estado_civil: string | null;
  tem_filhos: boolean | null;
  quantidade_filhos: number | null;
  idade_filhos: string | null;
  instagram: string | null;

  // BLOCO 7: Expectativas
  pretensao_salarial: string | null;
  valores_empresa: string[] | null;
  areas_interesse: string[] | null;
  objetivo_profissional: string | null;

  // Mídia
  foto_url: string | null;
  video_url: string | null;
  video_duracao: number | null;
  video_tipo: 'roteiro' | 'livre' | null;
  documento_url: string | null;
  documento_tipo: 'CNH' | 'RG' | null;
  documento_verificado: boolean;

  // DISC e Valores
  teste_disc_id: string | null;
  perfil_disc: string | null;
  perfil_valores: Record<string, number> | null;

  // Status
  status: 'disponivel' | 'em_processo' | 'recrutado' | 'pausado';
  recrutado_por_empresa_id: string | null;
  recrutado_data: string | null;

  // Termos
  aceite_termos: boolean;
  aceite_termos_data: string | null;
  aceite_lgpd: boolean;
  aceite_lgpd_data: string | null;

  // Controle
  created_at: string;
  updated_at: string;
}

// ============================================
// VAGA
// ============================================
export interface VagaRecrutamento {
  id: string;
  empresa_id: string;

  // Dados da vaga
  titulo: string;
  descricao: string | null;
  faixa_salarial_min: number | null;
  faixa_salarial_max: number | null;
  regime: 'CLT' | 'PJ' | 'Ambos' | null;
  cidade: string | null;
  estado: string | null;
  modalidade: 'Presencial' | 'Híbrido' | 'Remoto' | null;
  horario: string | null;
  beneficios: string[] | null;
  requisitos: string[] | null;

  // Match DISC
  palavras_funcionario_ideal: string | null;
  perfil_disc_ideal: string | null;

  // Status
  status: 'ativa' | 'pausada' | 'encerrada';

  // Controle
  created_at: string;
  updated_at: string;

  // Relacionamentos (quando carregados)
  empresa?: EmpresaRecrutamento;
}

// ============================================
// SOLICITAÇÃO DE ENTREVISTA
// ============================================
export interface SolicitacaoEntrevista {
  id: string;

  empresa_id: string;
  candidato_id: string;
  vaga_id: string;

  // Status
  status: 'aguardando_candidato' | 'aceita' | 'recusada' | 'expirada';

  // Pagamentos
  empresa_pagou: boolean;
  empresa_valor_pago: number | null;
  empresa_pagamento_data: string | null;
  empresa_pagamento_id: string | null;

  candidato_pagou: boolean;
  candidato_valor_pago: number | null;
  candidato_pagamento_data: string | null;
  candidato_pagamento_id: string | null;

  // Recusa
  motivo_recusa: 'sem_interesse_empresa' | 'sem_dinheiro' | 'indisponivel' | null;

  // Dados liberados
  dados_liberados: boolean;
  dados_liberados_data: string | null;

  // Match
  match_percentual: number | null;

  // Controle
  created_at: string;
  updated_at: string;
  expira_em: string | null;

  // Relacionamentos (quando carregados)
  empresa?: EmpresaRecrutamento;
  candidato?: CandidatoRecrutamento;
  vaga?: VagaRecrutamento;
}

// ============================================
// TRANSAÇÃO FINANCEIRA
// ============================================
export interface TransacaoRecrutamento {
  id: string;

  tipo: 'empresa' | 'candidato';
  usuario_id: string;
  solicitacao_id: string | null;

  valor: number;
  tipo_transacao: 'pagamento' | 'credito' | 'estorno';
  metodo_pagamento: 'cartao' | 'pix' | null;

  status: 'pendente' | 'aprovado' | 'recusado' | 'estornado';

  gateway_id: string | null;
  gateway_response: Record<string, unknown> | null;

  created_at: string;
}

// ============================================
// NOTIFICAÇÃO
// ============================================
export interface NotificacaoRecrutamento {
  id: string;

  tipo_destinatario: 'empresa' | 'candidato';
  destinatario_id: string;

  tipo_notificacao:
    | 'nova_proposta'
    | 'proposta_aceita'
    | 'proposta_recusada'
    | 'credito_devolvido'
    | 'novo_match'
    | 'perfil_visualizado';

  titulo: string;
  mensagem: string;
  dados: Record<string, unknown> | null;

  lida: boolean;
  lida_em: string | null;

  enviada_whatsapp: boolean;
  enviada_whatsapp_em: string | null;

  created_at: string;
}

// ============================================
// RESPOSTA API CNPJ
// ============================================
export interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  data_abertura: string;
  natureza_juridica: string;
  porte: string;
  capital_social: number;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  qsa: Array<{
    nome: string;
    qual: string;
  }>;
}

// ============================================
// FORMS
// ============================================
export interface CadastroEmpresaForm {
  cnpj: string;
  socio_nome: string;
  socio_cpf: string;
  socio_email: string;
  socio_telefone: string;
  senha: string;
  confirmar_senha: string;
  aceite_termos: boolean;
  aceite_lgpd: boolean;
}

export interface CadastroCandidatoForm {
  // Bloco 1: Dados Pessoais
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
  email: string;
  estado: string;
  cidade: string;
  bairro: string;

  // Bloco 2: Situação Atual
  esta_trabalhando: boolean;
  salario_atual: string;
  regime_atual: string;
  motivo_busca_oportunidade: string;
  disponibilidade_inicio: string;
  regime_preferido: string;

  // Bloco 3: Experiência
  ultima_empresa: string;
  ultimo_cargo: string;
  tempo_ultima_empresa: string;
  motivo_saida: string;
  areas_experiencia: string[];
  anos_experiencia: number;

  // Bloco 4: Formação
  escolaridade: string;
  curso: string;
  certificacoes: string;

  // Bloco 5: Logística
  possui_veiculo: string;
  possui_cnh: string;
  disponibilidade_horario: string;
  aceita_viajar: string;
  aceita_mudanca: string;

  // Bloco 6: Vida Pessoal
  estado_civil: string;
  tem_filhos: boolean;
  quantidade_filhos: number;
  idade_filhos: string;
  instagram: string;

  // Bloco 7: Expectativas
  pretensao_salarial: string;
  valores_empresa: string[];
  areas_interesse: string[];
  objetivo_profissional: string;

  // Termos
  aceite_termos: boolean;
  aceite_lgpd: boolean;
}

// ============================================
// MATCH
// ============================================
export interface MatchResult {
  candidato_id: string;
  vaga_id: string;
  percentual: number;
  fatores: {
    disc: number;
    valores: number;
    localizacao: number;
    salario: number;
    experiencia: number;
  };
}

// ============================================
// CONSTANTES
// ============================================
export const VALOR_SOLICITACAO_EMPRESA = 39.90;
export const VALOR_ACEITE_CANDIDATO = 9.90;
export const HORAS_EXPIRACAO_PROPOSTA = 48;

export const FAIXAS_SALARIAIS = [
  'Até R$ 1.500',
  'R$ 1.500 a R$ 2.500',
  'R$ 2.500 a R$ 3.500',
  'R$ 3.500 a R$ 5.000',
  'R$ 5.000 a R$ 7.500',
  'R$ 7.500 a R$ 10.000',
  'Acima de R$ 10.000',
];

export const ESCOLARIDADES = [
  'Ensino Fundamental',
  'Ensino Médio',
  'Técnico',
  'Superior Incompleto',
  'Superior Completo',
  'Pós-graduação',
  'Mestrado',
  'Doutorado',
];

export const AREAS_ATUACAO = [
  'Vendas',
  'Atendimento ao Cliente',
  'Administrativo',
  'Financeiro',
  'RH',
  'Marketing',
  'TI',
  'Logística',
  'Produção',
  'Operacional',
  'Gerência',
  'Direção',
];

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
