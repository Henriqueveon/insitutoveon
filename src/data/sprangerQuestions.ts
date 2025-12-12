// Teste de Valores de Spranger - 14 perguntas com 6 opções cada
// Cada opção representa um dos 6 valores de Spranger

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
// IND = Individualista (Poder/Influência)
// TRA = Tradicional (Princípios/Regras)

export const sprangerQuestions: SprangerQuestion[] = [
  {
    id: 1,
    pergunta: "Quando você precisa tomar uma decisão importante na vida, o que mais pesa para você?",
    opcoes: [
      { id: "1a", texto: "Analisar todos os dados e informações disponíveis", valor: "TEO" },
      { id: "1b", texto: "Pensar no retorno prático e financeiro", valor: "ECO" },
      { id: "1c", texto: "Considerar se vai trazer harmonia e beleza para minha vida", valor: "EST" },
      { id: "1d", texto: "Avaliar como isso vai impactar as pessoas ao meu redor", valor: "SOC" },
      { id: "1e", texto: "Ver se vai aumentar minha influência e reconhecimento", valor: "IND" },
      { id: "1f", texto: "Verificar se está de acordo com meus princípios e valores", valor: "TRA" },
    ],
  },
  {
    id: 2,
    pergunta: "O que te dá mais satisfação no trabalho?",
    opcoes: [
      { id: "2a", texto: "Aprender coisas novas e resolver problemas complexos", valor: "TEO" },
      { id: "2b", texto: "Ver resultados concretos e retorno financeiro", valor: "ECO" },
      { id: "2c", texto: "Trabalhar em um ambiente agradável e bem organizado", valor: "EST" },
      { id: "2d", texto: "Ajudar colegas e contribuir para o bem-estar da equipe", valor: "SOC" },
      { id: "2e", texto: "Liderar projetos e ter reconhecimento pelo meu trabalho", valor: "IND" },
      { id: "2f", texto: "Seguir processos bem definidos e fazer o que é certo", valor: "TRA" },
    ],
  },
  {
    id: 3,
    pergunta: "Como você prefere passar seu tempo livre?",
    opcoes: [
      { id: "3a", texto: "Lendo, estudando ou assistindo documentários", valor: "TEO" },
      { id: "3b", texto: "Trabalhando em projetos que podem gerar renda extra", valor: "ECO" },
      { id: "3c", texto: "Apreciando arte, música, natureza ou decorando ambientes", valor: "EST" },
      { id: "3d", texto: "Passando tempo com família e amigos ou fazendo voluntariado", valor: "SOC" },
      { id: "3e", texto: "Fazendo networking ou atividades que aumentem minha visibilidade", valor: "IND" },
      { id: "3f", texto: "Participando de atividades religiosas ou comunitárias tradicionais", valor: "TRA" },
    ],
  },
  {
    id: 4,
    pergunta: "O que você mais admira em uma pessoa?",
    opcoes: [
      { id: "4a", texto: "Inteligência e conhecimento profundo sobre diversos assuntos", valor: "TEO" },
      { id: "4b", texto: "Capacidade de gerar riqueza e ser bem-sucedido financeiramente", valor: "ECO" },
      { id: "4c", texto: "Bom gosto, criatividade e sensibilidade artística", valor: "EST" },
      { id: "4d", texto: "Generosidade e dedicação em ajudar os outros", valor: "SOC" },
      { id: "4e", texto: "Liderança, carisma e capacidade de influenciar pessoas", valor: "IND" },
      { id: "4f", texto: "Integridade, lealdade e respeito às tradições", valor: "TRA" },
    ],
  },
  {
    id: 5,
    pergunta: "Se você ganhasse na loteria, qual seria sua prioridade?",
    opcoes: [
      { id: "5a", texto: "Investir em educação e cursos para mim e minha família", valor: "TEO" },
      { id: "5b", texto: "Fazer investimentos para multiplicar o dinheiro", valor: "ECO" },
      { id: "5c", texto: "Viajar para lugares bonitos e decorar minha casa dos sonhos", valor: "EST" },
      { id: "5d", texto: "Ajudar pessoas necessitadas e apoiar causas sociais", valor: "SOC" },
      { id: "5e", texto: "Abrir um negócio próprio e construir um império", valor: "IND" },
      { id: "5f", texto: "Garantir segurança para minha família e apoiar minha comunidade religiosa", valor: "TRA" },
    ],
  },
  {
    id: 6,
    pergunta: "Em uma discussão ou debate, o que é mais importante para você?",
    opcoes: [
      { id: "6a", texto: "Descobrir a verdade, mesmo que seja desconfortável", valor: "TEO" },
      { id: "6b", texto: "Chegar em uma solução prática que funcione", valor: "ECO" },
      { id: "6c", texto: "Manter a harmonia e evitar conflitos desnecessários", valor: "EST" },
      { id: "6d", texto: "Garantir que todos se sintam ouvidos e respeitados", valor: "SOC" },
      { id: "6e", texto: "Convencer os outros do meu ponto de vista", valor: "IND" },
      { id: "6f", texto: "Defender o que é moralmente correto", valor: "TRA" },
    ],
  },
  {
    id: 7,
    pergunta: "O que te motiva a acordar cedo pela manhã?",
    opcoes: [
      { id: "7a", texto: "A oportunidade de aprender algo novo", valor: "TEO" },
      { id: "7b", texto: "A chance de produzir e gerar resultados", valor: "ECO" },
      { id: "7c", texto: "Desfrutar de um dia bonito e bem planejado", valor: "EST" },
      { id: "7d", texto: "Encontrar e ajudar pessoas que precisam de mim", valor: "SOC" },
      { id: "7e", texto: "Avançar nos meus objetivos de carreira e reconhecimento", valor: "IND" },
      { id: "7f", texto: "Cumprir minhas responsabilidades e compromissos", valor: "TRA" },
    ],
  },
  {
    id: 8,
    pergunta: "Qual tipo de presente você mais gostaria de receber?",
    opcoes: [
      { id: "8a", texto: "Um livro raro ou curso exclusivo", valor: "TEO" },
      { id: "8b", texto: "Dinheiro ou algo de alto valor comercial", valor: "ECO" },
      { id: "8c", texto: "Uma obra de arte ou experiência cultural", valor: "EST" },
      { id: "8d", texto: "Uma doação feita em meu nome para uma causa social", valor: "SOC" },
      { id: "8e", texto: "Algo que demonstre meu status ou conquistas", valor: "IND" },
      { id: "8f", texto: "Algo com valor sentimental ou tradicional da família", valor: "TRA" },
    ],
  },
  {
    id: 9,
    pergunta: "Como você prefere resolver um problema no trabalho?",
    opcoes: [
      { id: "9a", texto: "Pesquisando profundamente e entendendo as causas", valor: "TEO" },
      { id: "9b", texto: "Buscando a solução mais rápida e custo-efetiva", valor: "ECO" },
      { id: "9c", texto: "Encontrando uma solução elegante e bem elaborada", valor: "EST" },
      { id: "9d", texto: "Consultando a equipe e chegando em um consenso", valor: "SOC" },
      { id: "9e", texto: "Tomando a liderança e decidindo o caminho a seguir", valor: "IND" },
      { id: "9f", texto: "Seguindo os procedimentos estabelecidos pela empresa", valor: "TRA" },
    ],
  },
  {
    id: 10,
    pergunta: "O que você considera um dia perfeito?",
    opcoes: [
      { id: "10a", texto: "Um dia em que aprendi algo que mudou minha perspectiva", valor: "TEO" },
      { id: "10b", texto: "Um dia produtivo com resultados tangíveis", valor: "ECO" },
      { id: "10c", texto: "Um dia em harmonia, cercado de beleza e tranquilidade", valor: "EST" },
      { id: "10d", texto: "Um dia em que fiz diferença na vida de alguém", valor: "SOC" },
      { id: "10e", texto: "Um dia em que alcancei uma conquista importante", valor: "IND" },
      { id: "10f", texto: "Um dia em que cumpri todos os meus deveres", valor: "TRA" },
    ],
  },
  {
    id: 11,
    pergunta: "O que te deixa mais frustrado?",
    opcoes: [
      { id: "11a", texto: "Não conseguir entender algo ou ter informações incompletas", valor: "TEO" },
      { id: "11b", texto: "Desperdiçar tempo ou dinheiro com coisas inúteis", valor: "ECO" },
      { id: "11c", texto: "Ambientes desorganizados, feios ou desarmoniosos", valor: "EST" },
      { id: "11d", texto: "Ver pessoas sendo tratadas injustamente", valor: "SOC" },
      { id: "11e", texto: "Não ser reconhecido pelo meu trabalho", valor: "IND" },
      { id: "11f", texto: "Pessoas que não respeitam regras e compromissos", valor: "TRA" },
    ],
  },
  {
    id: 12,
    pergunta: "Qual tipo de líder você mais respeita?",
    opcoes: [
      { id: "12a", texto: "O especialista que sabe tudo sobre o assunto", valor: "TEO" },
      { id: "12b", texto: "O empreendedor que gera resultados impressionantes", valor: "ECO" },
      { id: "12c", texto: "O visionário que cria ambientes inspiradores", valor: "EST" },
      { id: "12d", texto: "O líder servidor que cuida da sua equipe", valor: "SOC" },
      { id: "12e", texto: "O líder carismático que inspira e motiva", valor: "IND" },
      { id: "12f", texto: "O líder íntegro que lidera pelo exemplo", valor: "TRA" },
    ],
  },
  {
    id: 13,
    pergunta: "Em um projeto de grupo, qual papel você naturalmente assume?",
    opcoes: [
      { id: "13a", texto: "O pesquisador que traz dados e informações", valor: "TEO" },
      { id: "13b", texto: "O pragmático que foca no que precisa ser feito", valor: "ECO" },
      { id: "13c", texto: "O criativo que traz ideias originais e cuida da apresentação", valor: "EST" },
      { id: "13d", texto: "O mediador que mantém o grupo unido e motivado", valor: "SOC" },
      { id: "13e", texto: "O líder que organiza e delega as tarefas", valor: "IND" },
      { id: "13f", texto: "O responsável que garante que prazos sejam cumpridos", valor: "TRA" },
    ],
  },
  {
    id: 14,
    pergunta: "O que você gostaria que as pessoas dissessem sobre você no futuro?",
    opcoes: [
      { id: "14a", texto: "Que era uma pessoa extremamente inteligente e sábia", valor: "TEO" },
      { id: "14b", texto: "Que foi bem-sucedido e deixou um patrimônio sólido", valor: "ECO" },
      { id: "14c", texto: "Que tinha bom gosto e deixou o mundo mais bonito", valor: "EST" },
      { id: "14d", texto: "Que era bondoso e ajudou muitas pessoas", valor: "SOC" },
      { id: "14e", texto: "Que foi um líder influente e deixou sua marca", valor: "IND" },
      { id: "14f", texto: "Que era íntegro e fiel aos seus princípios", valor: "TRA" },
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
    nome: 'Individualista',
    nomeCompleto: 'Influência',
    cor: '#E53935', // Vermelho
    icone: '👑',
    descricao: 'Você valoriza poder, influência e reconhecimento. Gosta de liderar, ter autonomia e deixar sua marca no mundo. Busca posições de destaque.',
    caracteristicas: ['Ambicioso', 'Líder', 'Competitivo', 'Autônomo'],
    carreiras: ['Executivo', 'Político', 'Empresário', 'Diretor', 'Advogado', 'Líder de equipe'],
  },
  {
    codigo: 'TRA',
    nome: 'Tradicional',
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
  IND: { D: 0.9, I: 0.5, S: 0.1, C: 0.2 }, // Individualista correlaciona forte com D
  TRA: { D: 0.2, I: 0.2, S: 0.6, C: 0.6 }, // Tradicional correlaciona com S e C
};
