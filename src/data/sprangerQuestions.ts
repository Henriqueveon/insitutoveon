// Teste de Valores de Spranger - 10 perguntas com 6 opções cada
// Cada opção representa um dos 6 valores de Spranger
// Pontuação: 1º lugar = 5pts, 2º = 4pts, 3º = 3pts, 4º = 2pts, 5º = 1pt, 6º = 0pts

export interface SprangerOption {
  id: string;
  texto: string;
  valor: 'TEO' | 'ECO' | 'EST' | 'SOC' | 'IND' | 'TRA';
}

export interface SprangerQuestion {
  id: number;
  pergunta: string;
  contexto: string;
  opcoes: SprangerOption[];
}

// Valores de Spranger:
// TEO = Teórico (Conhecimento)
// ECO = Econômico (Utilidade/Resultados)
// EST = Estético (Harmonia/Beleza)
// SOC = Social (Ajudar pessoas)
// IND = Político (Poder/Influência)
// TRA = Religioso (Princípios/Regras)

// 8 QUESTÕES SPRANGER OTIMIZADAS (reduzidas de 15 para melhorar engajamento)
// Mantidas as questões com maior poder discriminativo
export const sprangerQuestions: SprangerQuestion[] = [
  {
    id: 1,
    contexto: "O que te dá mais satisfação?",
    pergunta: "O que te dá mais satisfação?",
    opcoes: [
      { id: "1a", texto: "Descobrir como algo funciona e dominar um assunto complexo", valor: "TEO" },
      { id: "1b", texto: "Ver meu dinheiro rendendo e meus investimentos crescendo", valor: "ECO" },
      { id: "1c", texto: "Estar em um ambiente bonito, organizado e harmonioso", valor: "EST" },
      { id: "1d", texto: "Saber que ajudei alguém a superar uma dificuldade", valor: "SOC" },
      { id: "1e", texto: "Ser reconhecido como líder e referência no que faço", valor: "IND" },
      { id: "1f", texto: "Viver de acordo com meus princípios, sem abrir mão deles", valor: "TRA" },
    ],
  },
  {
    id: 2,
    contexto: "Se você ganhasse 1 milhão de reais, qual seria sua prioridade?",
    pergunta: "Se você ganhasse 1 milhão de reais, qual seria sua prioridade?",
    opcoes: [
      { id: "2a", texto: "Investir em cursos, livros e experiências de aprendizado", valor: "TEO" },
      { id: "2b", texto: "Multiplicar o dinheiro com investimentos inteligentes", valor: "ECO" },
      { id: "2c", texto: "Viajar para lugares belos e viver experiências culturais", valor: "EST" },
      { id: "2d", texto: "Doar parte significativa para causas e pessoas necessitadas", valor: "SOC" },
      { id: "2e", texto: "Abrir um negócio próprio onde eu seja o líder", valor: "IND" },
      { id: "2f", texto: "Garantir o futuro da minha família seguindo valores sólidos", valor: "TRA" },
    ],
  },
  {
    id: 3,
    contexto: "Qual frase mais representa você?",
    pergunta: "Qual frase mais representa você?",
    opcoes: [
      { id: "3a", texto: "Conhecimento é o maior patrimônio que alguém pode ter", valor: "TEO" },
      { id: "3b", texto: "Tempo é dinheiro e dinheiro é liberdade", valor: "ECO" },
      { id: "3c", texto: "A vida sem beleza e arte não vale a pena ser vivida", valor: "EST" },
      { id: "3d", texto: "O sentido da vida está em servir e ajudar os outros", valor: "SOC" },
      { id: "3e", texto: "Quem não lidera é liderado por outros", valor: "IND" },
      { id: "3f", texto: "Meus valores e princípios não estão à venda", valor: "TRA" },
    ],
  },
  {
    id: 4,
    contexto: "O que você mais admira em uma pessoa?",
    pergunta: "O que você mais admira em uma pessoa?",
    opcoes: [
      { id: "4a", texto: "Inteligência, cultura e capacidade de análise", valor: "TEO" },
      { id: "4b", texto: "Visão de negócios e capacidade de gerar resultados", valor: "ECO" },
      { id: "4c", texto: "Bom gosto, elegância e sensibilidade artística", valor: "EST" },
      { id: "4d", texto: "Generosidade, empatia e espírito de servir", valor: "SOC" },
      { id: "4e", texto: "Carisma, poder de influência e liderança natural", valor: "IND" },
      { id: "4f", texto: "Integridade, caráter e fidelidade aos princípios", valor: "TRA" },
    ],
  },
  {
    id: 5,
    contexto: "Qual legado você gostaria de deixar?",
    pergunta: "Qual legado você gostaria de deixar?",
    opcoes: [
      { id: "5a", texto: "Ser lembrado como alguém que contribuiu para o conhecimento", valor: "TEO" },
      { id: "5b", texto: "Construir um patrimônio sólido para as próximas gerações", valor: "ECO" },
      { id: "5c", texto: "Criar algo belo que inspire e emocione as pessoas", valor: "EST" },
      { id: "5d", texto: "Ter transformado positivamente a vida de muitas pessoas", valor: "SOC" },
      { id: "5e", texto: "Ser reconhecido como alguém que fez história e liderou mudanças", valor: "IND" },
      { id: "5f", texto: "Transmitir valores e princípios para quem vem depois de mim", valor: "TRA" },
    ],
  },
  {
    id: 6,
    contexto: "O que te motiva a acordar todos os dias?",
    pergunta: "O que te motiva a acordar todos os dias?",
    opcoes: [
      { id: "6a", texto: "A oportunidade de aprender algo novo", valor: "TEO" },
      { id: "6b", texto: "A possibilidade de progredir financeiramente", valor: "ECO" },
      { id: "6c", texto: "Viver momentos de beleza e harmonia", valor: "EST" },
      { id: "6d", texto: "A chance de fazer a diferença na vida de alguém", valor: "SOC" },
      { id: "6e", texto: "Conquistar novos objetivos e superar desafios", valor: "IND" },
      { id: "6f", texto: "Cumprir meu propósito de vida com integridade", valor: "TRA" },
    ],
  },
  {
    id: 7,
    contexto: "Em uma decisão difícil, o que pesa mais?",
    pergunta: "Em uma decisão difícil, o que pesa mais?",
    opcoes: [
      { id: "7a", texto: "Os dados, fatos e análises racionais disponíveis", valor: "TEO" },
      { id: "7b", texto: "O impacto financeiro e o retorno sobre o investimento", valor: "ECO" },
      { id: "7c", texto: "Se a escolha traz equilíbrio e harmonia para minha vida", valor: "EST" },
      { id: "7d", texto: "Como minha decisão afetará as pessoas ao meu redor", valor: "SOC" },
      { id: "7e", texto: "Se isso me coloca em posição de vantagem ou liderança", valor: "IND" },
      { id: "7f", texto: "Se está alinhado com meus valores e convicções pessoais", valor: "TRA" },
    ],
  },
  {
    id: 8,
    contexto: "O que você considera seu maior ativo pessoal?",
    pergunta: "O que você considera seu maior ativo pessoal?",
    opcoes: [
      { id: "8a", texto: "Meu conhecimento e capacidade de aprender", valor: "TEO" },
      { id: "8b", texto: "Minha capacidade de gerar riqueza e prosperidade", valor: "ECO" },
      { id: "8c", texto: "Minha sensibilidade e percepção estética", valor: "EST" },
      { id: "8d", texto: "Minha empatia e capacidade de ajudar os outros", valor: "SOC" },
      { id: "8e", texto: "Minha capacidade de influenciar e liderar pessoas", valor: "IND" },
      { id: "8f", texto: "Minha integridade e valores sólidos", valor: "TRA" },
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

// Classificação dos valores baseada na pontuação
// Ajustado para 8 questões (max 40 pontos por valor)
export type SprangerClassification = 'SIGNIFICATIVO' | 'CIRCUNSTANCIAL' | 'INDIFERENTE';

export function getSprangerClassification(score: number): SprangerClassification {
  // Com 8 questões: máximo 40 pontos, mínimo 0
  // Média esperada por valor: ~20 pontos (se distribuição uniforme)
  if (score >= 28) return 'SIGNIFICATIVO';  // Acima de 70% do max
  if (score >= 16) return 'CIRCUNSTANCIAL'; // Entre 40-70% do max
  return 'INDIFERENTE';                      // Abaixo de 40%
}

export function getClassificationLabel(classification: SprangerClassification): string {
  switch (classification) {
    case 'SIGNIFICATIVO': return 'Valor Dominante';
    case 'CIRCUNSTANCIAL': return 'Valor Moderado';
    case 'INDIFERENTE': return 'Valor Baixo';
  }
}

export function getClassificationColor(classification: SprangerClassification): string {
  switch (classification) {
    case 'SIGNIFICATIVO': return '#22C55E'; // Verde
    case 'CIRCUNSTANCIAL': return '#EAB308'; // Amarelo
    case 'INDIFERENTE': return '#EF4444'; // Vermelho
  }
}

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
