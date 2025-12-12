// Teste de Valores de Spranger - 10 perguntas com 4 opções cada
// Cada opção representa um dos 6 valores de Spranger
// Pontuação: 1º lugar = 3pts, 2º = 2pts, 3º = 1pt, 4º = 0pts

export interface SprangerOption {
  id: string;
  texto: string;
  valor: 'TEO' | 'ECO' | 'EST' | 'SOC' | 'IND' | 'TRA';
}

export interface SprangerQuestion {
  id: number;
  pergunta: string;
  opcoes: SprangerOption[];
}

// Valores de Spranger:
// TEO = Teórico (Conhecimento)
// ECO = Econômico (Utilidade/Resultados)
// EST = Estético (Harmonia/Beleza)
// SOC = Social (Ajudar pessoas)
// IND = Individualista/Político (Poder/Influência)
// TRA = Tradicional/Religioso (Princípios/Regras)

export const sprangerQuestions: SprangerQuestion[] = [
  {
    id: 1,
    pergunta: "O que mais te motiva no dia a dia?",
    opcoes: [
      { id: "1a", texto: "Buscar conhecimento e entender como as coisas funcionam", valor: "TEO" },
      { id: "1b", texto: "Alcançar resultados financeiros e retorno sobre investimento", valor: "ECO" },
      { id: "1c", texto: "Ajudar pessoas e contribuir para causas sociais", valor: "SOC" },
      { id: "1d", texto: "Conquistar posições de liderança e influência", valor: "IND" },
    ],
  },
  {
    id: 2,
    pergunta: "Como você prefere ocupar seu tempo?",
    opcoes: [
      { id: "2a", texto: "Viver de acordo com princípios e tradições bem definidas", valor: "TRA" },
      { id: "2b", texto: "Apreciar beleza, arte e harmonia no ambiente", valor: "EST" },
      { id: "2c", texto: "Estudar, pesquisar e descobrir a verdade", valor: "TEO" },
      { id: "2d", texto: "Maximizar lucros e otimizar recursos", valor: "ECO" },
    ],
  },
  {
    id: 3,
    pergunta: "O que você considera mais importante?",
    opcoes: [
      { id: "3a", texto: "Ter poder de decisão e controle sobre situações", valor: "IND" },
      { id: "3b", texto: "Dedicar tempo para ajudar o próximo", valor: "SOC" },
      { id: "3c", texto: "Seguir crenças e valores morais sólidos", valor: "TRA" },
      { id: "3d", texto: "Criar ambientes bonitos e agradáveis", valor: "EST" },
    ],
  },
  {
    id: 4,
    pergunta: "O que te dá mais satisfação?",
    opcoes: [
      { id: "4a", texto: "Aprender coisas novas constantemente", valor: "TEO" },
      { id: "4b", texto: "Gerar riqueza e prosperidade material", valor: "ECO" },
      { id: "4c", texto: "Liderar equipes e projetos importantes", valor: "IND" },
      { id: "4d", texto: "Fazer a diferença na vida das pessoas", valor: "SOC" },
    ],
  },
  {
    id: 5,
    pergunta: "Como você toma decisões importantes?",
    opcoes: [
      { id: "5a", texto: "Manter tradições e princípios familiares", valor: "TRA" },
      { id: "5b", texto: "Valorizar a estética e o design das coisas", valor: "EST" },
      { id: "5c", texto: "Analisar dados e buscar explicações lógicas", valor: "TEO" },
      { id: "5d", texto: "Investir tempo onde há retorno garantido", valor: "ECO" },
    ],
  },
  {
    id: 6,
    pergunta: "O que você mais valoriza em sua carreira?",
    opcoes: [
      { id: "6a", texto: "Ser reconhecido como autoridade no assunto", valor: "IND" },
      { id: "6b", texto: "Contribuir para um mundo melhor e mais justo", valor: "SOC" },
      { id: "6c", texto: "Viver segundo uma filosofia de vida clara", valor: "TRA" },
      { id: "6d", texto: "Buscar equilíbrio e harmonia em tudo", valor: "EST" },
    ],
  },
  {
    id: 7,
    pergunta: "Como você prefere passar seu tempo livre?",
    opcoes: [
      { id: "7a", texto: "Expandir conhecimentos intelectuais", valor: "TEO" },
      { id: "7b", texto: "Focar em atividades rentáveis e práticas", valor: "ECO" },
      { id: "7c", texto: "Assumir o comando das situações", valor: "IND" },
      { id: "7d", texto: "Doar tempo e energia para ajudar outros", valor: "SOC" },
    ],
  },
  {
    id: 8,
    pergunta: "O que te inspira no dia a dia?",
    opcoes: [
      { id: "8a", texto: "Preservar valores e crenças tradicionais", valor: "TRA" },
      { id: "8b", texto: "Cultivar sensibilidade artística e cultural", valor: "EST" },
      { id: "8c", texto: "Questionar e investigar até encontrar respostas", valor: "TEO" },
      { id: "8d", texto: "Priorizar eficiência e resultados mensuráveis", valor: "ECO" },
    ],
  },
  {
    id: 9,
    pergunta: "O que te realiza profissionalmente?",
    opcoes: [
      { id: "9a", texto: "Ocupar posições de destaque e prestígio", valor: "IND" },
      { id: "9b", texto: "Servir e apoiar quem precisa de ajuda", valor: "SOC" },
      { id: "9c", texto: "Seguir convicções morais e espirituais", valor: "TRA" },
      { id: "9d", texto: "Apreciar experiências estéticas e sensoriais", valor: "EST" },
    ],
  },
  {
    id: 10,
    pergunta: "O que você gostaria que dissessem sobre você no futuro?",
    opcoes: [
      { id: "10a", texto: "Dominar teorias e conceitos complexos", valor: "TEO" },
      { id: "10b", texto: "Construir patrimônio e segurança financeira", valor: "ECO" },
      { id: "10c", texto: "Influenciar decisões e direcionar pessoas", valor: "IND" },
      { id: "10d", texto: "Promover o bem-estar coletivo acima do individual", valor: "SOC" },
    ],
  },
];

// Informações sobre cada valor de Spranger para o relatório
export interface SprangerValueInfo {
  codigo: 'TEO' | 'ECO' | 'EST' | 'SOC' | 'IND' | 'TRA';
  nome: string;
  nomeCompleto: string;
  cor: string;
  icone: string;
  descricao: string;
  caracteristicas: string[];
  carreiras: string[];
}

export const sprangerValuesInfo: SprangerValueInfo[] = [
  {
    codigo: 'TEO',
    nome: 'Teórico',
    nomeCompleto: 'Conhecimento',
    cor: '#7C3AED', // Roxo
    icone: '🧠',
    descricao: 'Você valoriza o conhecimento e a busca pela verdade. Gosta de aprender, entender como as coisas funcionam e está sempre em busca de novas informações.',
    caracteristicas: ['Curioso', 'Analítico', 'Questionador', 'Estudioso'],
    carreiras: ['Pesquisador', 'Professor', 'Cientista', 'Analista', 'Consultor técnico'],
  },
  {
    codigo: 'ECO',
    nome: 'Econômico',
    nomeCompleto: 'Resultados',
    cor: '#059669', // Verde escuro
    icone: '💰',
    descricao: 'Você valoriza o que é útil e traz retorno. Foca em eficiência, praticidade e resultados concretos. Não gosta de perder tempo com o que não gera valor.',
    caracteristicas: ['Prático', 'Eficiente', 'Focado em ROI', 'Empreendedor'],
    carreiras: ['Empresário', 'Vendedor', 'Gerente de negócios', 'Investidor', 'Consultor de gestão'],
  },
  {
    codigo: 'EST',
    nome: 'Estético',
    nomeCompleto: 'Harmonia',
    cor: '#F59E0B', // Laranja
    icone: '🎨',
    descricao: 'Você valoriza a beleza, harmonia e experiências sensoriais. Aprecia ambientes agradáveis, arte, criatividade e tudo que é esteticamente prazeroso.',
    caracteristicas: ['Criativo', 'Sensível', 'Artístico', 'Refinado'],
    carreiras: ['Designer', 'Artista', 'Arquiteto', 'Decorador', 'Fotógrafo', 'Chef'],
  },
  {
    codigo: 'SOC',
    nome: 'Social',
    nomeCompleto: 'Pessoas',
    cor: '#EC4899', // Rosa
    icone: '❤️',
    descricao: 'Você valoriza ajudar os outros e fazer diferença na vida das pessoas. É empático, generoso e se realiza contribuindo para o bem-estar coletivo.',
    caracteristicas: ['Empático', 'Generoso', 'Altruísta', 'Cooperativo'],
    carreiras: ['Psicólogo', 'Assistente social', 'Professor', 'Médico', 'Enfermeiro', 'ONG'],
  },
  {
    codigo: 'IND',
    nome: 'Político',
    nomeCompleto: 'Influência',
    cor: '#E53935', // Vermelho
    icone: '👑',
    descricao: 'Você valoriza poder, influência e reconhecimento. Gosta de liderar, ter autonomia e deixar sua marca no mundo. Busca posições de destaque.',
    caracteristicas: ['Ambicioso', 'Líder', 'Competitivo', 'Autônomo'],
    carreiras: ['Executivo', 'Político', 'Empresário', 'Diretor', 'Advogado', 'Líder de equipe'],
  },
  {
    codigo: 'TRA',
    nome: 'Religioso',
    nomeCompleto: 'Tradição',
    cor: '#78716C', // Marrom/Cinza
    icone: '🏛️',
    descricao: 'Você valoriza princípios, tradições e o que é moralmente correto. Respeita regras, hierarquias e busca viver de acordo com seus valores.',
    caracteristicas: ['Íntegro', 'Leal', 'Confiável', 'Respeitador'],
    carreiras: ['Religioso', 'Militar', 'Servidor público', 'Juiz', 'Historiador', 'Líder comunitário'],
  },
];

// Matriz de correlação DISC-Spranger
// Valores de 0 a 1 indicando a força da correlação
export const discSprangerCorrelation: Record<string, Record<string, number>> = {
  TEO: { D: 0.2, I: 0.1, S: 0.3, C: 0.8 }, // Teórico correlaciona forte com C
  ECO: { D: 0.7, I: 0.3, S: 0.2, C: 0.5 }, // Econômico correlaciona forte com D
  EST: { D: 0.1, I: 0.5, S: 0.6, C: 0.4 }, // Estético correlaciona com S e I
  SOC: { D: 0.1, I: 0.6, S: 0.7, C: 0.2 }, // Social correlaciona forte com S e I
  IND: { D: 0.9, I: 0.5, S: 0.1, C: 0.2 }, // Político correlaciona forte com D
  TRA: { D: 0.2, I: 0.2, S: 0.6, C: 0.6 }, // Religioso correlaciona com S e C
};
