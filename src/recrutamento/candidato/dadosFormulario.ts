// =====================================================
// DADOS DO FORMULÁRIO DE CADASTRO DO CANDIDATO
// Constantes, opções e estrutura das perguntas
// =====================================================

// Estados brasileiros
export const ESTADOS_BR = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

// Faixas salariais
export const FAIXAS_SALARIAIS = [
  { value: 'ate_1500', label: 'Até R$ 1.500' },
  { value: '1500_2000', label: 'R$ 1.500 a R$ 2.000' },
  { value: '2000_2500', label: 'R$ 2.000 a R$ 2.500' },
  { value: '2500_3000', label: 'R$ 2.500 a R$ 3.000' },
  { value: '3000_4000', label: 'R$ 3.000 a R$ 4.000' },
  { value: '4000_5000', label: 'R$ 4.000 a R$ 5.000' },
  { value: '5000_6000', label: 'R$ 5.000 a R$ 6.000' },
  { value: '6000_8000', label: 'R$ 6.000 a R$ 8.000' },
  { value: '8000_10000', label: 'R$ 8.000 a R$ 10.000' },
  { value: '10000_15000', label: 'R$ 10.000 a R$ 15.000' },
  { value: '15000_20000', label: 'R$ 15.000 a R$ 20.000' },
  { value: 'acima_20000', label: 'Acima de R$ 20.000' },
  { value: 'a_combinar', label: 'A combinar' },
];

// Faixas salariais atuais (menos opções)
export const FAIXAS_SALARIAIS_ATUAL = [
  { value: 'ate_1500', label: 'Até R$ 1.500' },
  { value: '1500_2500', label: 'R$ 1.500 a R$ 2.500' },
  { value: '2500_4000', label: 'R$ 2.500 a R$ 4.000' },
  { value: '4000_6000', label: 'R$ 4.000 a R$ 6.000' },
  { value: '6000_10000', label: 'R$ 6.000 a R$ 10.000' },
  { value: 'acima_10000', label: 'Acima de R$ 10.000' },
];

// Motivos para buscar nova oportunidade
export const MOTIVOS_BUSCA = [
  { value: 'melhor_salario', label: 'Melhor salário' },
  { value: 'crescimento', label: 'Crescimento profissional' },
  { value: 'novo_desafio', label: 'Novo desafio' },
  { value: 'mudanca_area', label: 'Mudança de área' },
  { value: 'desempregado', label: 'Estou desempregado' },
  { value: 'ambiente', label: 'Ambiente de trabalho melhor' },
  { value: 'beneficios', label: 'Benefícios' },
  { value: 'localizacao', label: 'Localização' },
  { value: 'outro', label: 'Outro' },
];

// Disponibilidade para início
export const DISPONIBILIDADE_INICIO = [
  { value: 'imediata', label: 'Imediata' },
  { value: '15_dias', label: 'Em 15 dias' },
  { value: '30_dias', label: 'Em 30 dias' },
  { value: 'mais_30', label: 'Mais de 30 dias' },
];

// Regime de trabalho
export const REGIMES_TRABALHO = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'tanto_faz', label: 'Tanto faz' },
];

// Tempo de permanência
export const TEMPO_PERMANENCIA = [
  { value: 'menos_6m', label: 'Menos de 6 meses' },
  { value: '6m_1a', label: '6 meses a 1 ano' },
  { value: '1a_2a', label: '1 a 2 anos' },
  { value: '2a_3a', label: '2 a 3 anos' },
  { value: '3a_5a', label: '3 a 5 anos' },
  { value: 'mais_5a', label: 'Mais de 5 anos' },
];

// Motivo da saída
export const MOTIVOS_SAIDA = [
  { value: 'pedido_demissao', label: 'Pedido de demissão' },
  { value: 'demissao', label: 'Demissão sem justa causa' },
  { value: 'fim_contrato', label: 'Fim de contrato' },
  { value: 'mudanca_cidade', label: 'Mudança de cidade' },
  { value: 'proposta_melhor', label: 'Proposta melhor' },
  { value: 'fechamento', label: 'Fechamento da empresa' },
  { value: 'ainda_empregado', label: 'Ainda estou na empresa' },
];

// Áreas de experiência
export const AREAS_EXPERIENCIA = [
  { value: 'vendas', label: 'Vendas' },
  { value: 'atendimento', label: 'Atendimento ao cliente' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'logistica', label: 'Logística' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ti', label: 'TI/Tecnologia' },
  { value: 'rh', label: 'RH' },
  { value: 'producao', label: 'Produção' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'gerencia', label: 'Gerência' },
  { value: 'outros', label: 'Outros' },
];

// Escolaridade
export const ESCOLARIDADES = [
  { value: 'fundamental_incompleto', label: 'Fundamental incompleto' },
  { value: 'fundamental_completo', label: 'Fundamental completo' },
  { value: 'medio_incompleto', label: 'Médio incompleto' },
  { value: 'medio_completo', label: 'Médio completo' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'superior_incompleto', label: 'Superior incompleto' },
  { value: 'superior_completo', label: 'Superior completo' },
  { value: 'pos_graduacao', label: 'Pós-graduação' },
];

// Veículo
export const VEICULOS = [
  { value: 'carro', label: 'Carro', icon: '🚗' },
  { value: 'moto', label: 'Moto', icon: '🏍️' },
  { value: 'bicicleta', label: 'Bicicleta', icon: '🚲' },
  { value: 'nenhum', label: 'Não possuo', icon: '❌' },
];

// CNH
export const CNH_CATEGORIAS = [
  { value: 'a', label: 'Categoria A (moto)' },
  { value: 'b', label: 'Categoria B (carro)' },
  { value: 'ab', label: 'Categoria AB' },
  { value: 'nenhuma', label: 'Não possuo' },
];

// Disponibilidade de horário
export const DISPONIBILIDADE_HORARIO = [
  { value: 'comercial', label: 'Comercial (8h às 18h)' },
  { value: 'noturno', label: 'Noturno' },
  { value: 'escala_6x1', label: 'Escala 6x1' },
  { value: 'escala_12x36', label: 'Escala 12x36' },
  { value: 'flexivel', label: 'Flexível' },
];

// Aceita viajar/mudar
export const OPCOES_VIAGEM_MUDANCA = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'eventualmente', label: 'Eventualmente' },
];

export const OPCOES_MUDANCA = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'depende', label: 'Depende da proposta' },
];

// Estado civil
export const ESTADOS_CIVIS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'uniao_estavel', label: 'União estável' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
];

// Valores em empresa
export const VALORES_EMPRESA = [
  { value: 'salario', label: 'Salário competitivo', icon: '💰' },
  { value: 'carreira', label: 'Plano de carreira', icon: '📈' },
  { value: 'beneficios', label: 'Benefícios (VR, plano saúde)', icon: '🏥' },
  { value: 'ambiente', label: 'Bom ambiente de trabalho', icon: '🤝' },
  { value: 'flexibilidade', label: 'Flexibilidade de horário', icon: '⏰' },
  { value: 'proposito', label: 'Propósito da empresa', icon: '🎯' },
  { value: 'treinamentos', label: 'Treinamentos e desenvolvimento', icon: '📚' },
  { value: 'home_office', label: 'Home office', icon: '🏠' },
];

// Áreas de interesse
export const AREAS_INTERESSE = [
  { value: 'vendas_comercial', label: 'Vendas/Comercial' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ti', label: 'TI/Tecnologia' },
  { value: 'logistica', label: 'Logística' },
  { value: 'producao', label: 'Produção' },
  { value: 'rh', label: 'RH' },
  { value: 'qualquer', label: 'Qualquer área' },
];

// Sugestões de cargos
export const SUGESTOES_CARGOS = [
  'Vendedor',
  'Vendedor Externo',
  'Consultor de Vendas',
  'Gerente de Vendas',
  'Gerente Comercial',
  'Gerente de Loja',
  'Supervisor',
  'Coordenador',
  'Atendente',
  'Recepcionista',
  'Auxiliar Administrativo',
  'Assistente Administrativo',
  'Analista Administrativo',
  'Auxiliar Financeiro',
  'Analista Financeiro',
  'Contador',
  'Operador de Caixa',
  'Estoquista',
  'Motorista',
  'Entregador',
  'Técnico',
  'Eletricista',
  'Mecânico',
  'Operador de Máquinas',
  'Auxiliar de Produção',
  'Líder de Produção',
  'Analista de Marketing',
  'Designer',
  'Desenvolvedor',
  'Programador',
  'Analista de Sistemas',
  'Suporte Técnico',
  'Analista de RH',
  'Recrutador',
  'Outros',
];

// Estrutura das etapas
export const ETAPAS = [
  { id: 1, titulo: 'Dados Pessoais', icone: '👤', perguntas: 8 },
  { id: 2, titulo: 'Situação Atual', icone: '💼', perguntas: 6 },
  { id: 3, titulo: 'Experiência', icone: '📋', perguntas: 6 },
  { id: 4, titulo: 'Formação', icone: '🎓', perguntas: 3 },
  { id: 5, titulo: 'Logística', icone: '🚗', perguntas: 5 },
  { id: 6, titulo: 'Vida Pessoal', icone: '👨‍👩‍👧', perguntas: 5 },
  { id: 7, titulo: 'Expectativas', icone: '🎯', perguntas: 4 },
];

// Interface do formulário
export interface FormularioCandidato {
  // Etapa 1 - Dados Pessoais
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
  email: string;
  estado: string;
  cidade: string;
  bairro: string;

  // Etapa 2 - Situação Atual
  esta_trabalhando: boolean | null;
  salario_atual: string;
  regime_atual: string;
  motivos_busca: string[];
  disponibilidade_inicio: string;
  regime_preferido: string;

  // Etapa 3 - Experiência
  ultima_empresa: string;
  ultimo_cargo: string;
  tempo_permanencia: string;
  motivo_saida: string;
  areas_experiencia: string[];
  anos_experiencia: number;

  // Etapa 4 - Formação
  escolaridade: string;
  curso: string;
  certificacoes: string;

  // Etapa 5 - Logística
  veiculo: string;
  cnh: string;
  disponibilidade_horario: string[];
  aceita_viajar: string;
  aceita_mudanca: string;

  // Etapa 6 - Vida Pessoal
  estado_civil: string;
  tem_filhos: boolean | null;
  quantidade_filhos: number;
  idade_filhos: string;
  instagram: string;

  // Etapa 7 - Expectativas
  pretensao_salarial: string;
  valores_empresa: string[];
  areas_interesse: string[];
  objetivo_profissional: string;
}

// Valores iniciais do formulário
export const VALORES_INICIAIS: FormularioCandidato = {
  nome_completo: '',
  data_nascimento: '',
  cpf: '',
  telefone: '',
  email: '',
  estado: '',
  cidade: '',
  bairro: '',
  esta_trabalhando: null,
  salario_atual: '',
  regime_atual: '',
  motivos_busca: [],
  disponibilidade_inicio: '',
  regime_preferido: '',
  ultima_empresa: '',
  ultimo_cargo: '',
  tempo_permanencia: '',
  motivo_saida: '',
  areas_experiencia: [],
  anos_experiencia: 0,
  escolaridade: '',
  curso: '',
  certificacoes: '',
  veiculo: '',
  cnh: '',
  disponibilidade_horario: [],
  aceita_viajar: '',
  aceita_mudanca: '',
  estado_civil: '',
  tem_filhos: null,
  quantidade_filhos: 0,
  idade_filhos: '',
  instagram: '',
  pretensao_salarial: '',
  valores_empresa: [],
  areas_interesse: [],
  objetivo_profissional: '',
};
