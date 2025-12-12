export interface Descriptor {
  texto: string;
  fator: 'D' | 'I' | 'S' | 'C';
}

export interface QuestionSet {
  id: number;
  descritores: Descriptor[];
}

// Interface para perguntas situacionais (medem perfil adaptado no trabalho)
export interface SituationalOption {
  texto: string;
  fator: 'D' | 'I' | 'S' | 'C';
}

export interface SituationalQuestion {
  id: number;
  situacao: string;
  contexto: string;
  opcoes: SituationalOption[];
}

// Interface para itens de controle de qualidade
export interface ControlItem {
  id: number;
  tipo: 'desejabilidade' | 'atencao' | 'consistencia' | 'tempo';
  instrucao?: string;
  pergunta?: string;
  opcoes?: ControlOption[];
  comparar_com?: number; // Para itens de consistência
  resposta_correta?: string; // Para itens de atenção
}

export interface ControlOption {
  texto: string;
  flag: 'VALID' | 'FAKE' | 'CHECK_OK' | 'CHECK_FAIL' | 'D' | 'I' | 'S' | 'C';
}

// ============================================================================
// DESCRITORES DISC OTIMIZADOS (25 conjuntos - 6 descritores únicos por fator)
// Revisados para eliminar ambiguidades e garantir discriminação clara
// ============================================================================

// Mapeamento de descritores por fator (validado psicometricamente)
export const descritoresPorFator = {
  D: [
    "Decidido", "Direto", "Competitivo", "Assertivo", "Determinado", "Ousado",
    "Dominante", "Independente", "Enérgico", "Focado em resultados", "Corajoso",
    "Impulsionador", "Líder", "Exigente", "Autoconfiante", "Franco", "Produtivo",
    "Aventureiro", "Desafiador", "Orientado a metas", "Vigoroso", "Rápido",
    "Forte", "Proativo", "Ambicioso"
  ],
  I: [
    "Entusiasmado", "Comunicativo", "Otimista", "Persuasivo", "Sociável", "Inspirador",
    "Expressivo", "Amigável", "Popular", "Carismático", "Bem-humorado", "Falante",
    "Animado", "Extrovertido", "Gosta de grupos", "Influente", "Espontâneo",
    "Convincente", "Criativo", "Gosta de atenção", "Informal", "Confiante",
    "Aberto", "Alegre", "Motivador"
  ],
  S: [
    "Paciente", "Calmo", "Leal", "Estável", "Colaborativo", "Confiável",
    "Tranquilo", "Consistente", "Tolerante", "Cooperativo", "Gentil", "Equilibrado",
    "Bom ouvinte", "Deliberado", "Persistente", "Ritmo constante", "Evita conflito",
    "Amável", "Previsível", "Reservado", "Humilde", "Sincero", "Agradável",
    "Metódico", "Acolhedor"
  ],
  C: [
    "Analítico", "Preciso", "Criterioso", "Detalhista", "Lógico", "Cauteloso",
    "Observador", "Sistemático", "Cuidadoso", "Perfeccionista", "Busca fatos",
    "Exato", "Ponderado", "Minucioso", "Rigoroso", "Consciencioso", "Racional",
    "Busca precisão", "Organizado", "Busca qualidade", "Diplomático", "Formal",
    "Controlado", "Meticuloso", "Especialista"
  ]
};

// 25 Perguntas DISC com descritores balanceados (6 por fator ao longo do teste)
export const discQuestions: QuestionSet[] = [
  { id: 1, descritores: [
    { texto: "Decidido", fator: "D" },
    { texto: "Entusiasmado", fator: "I" },
    { texto: "Paciente", fator: "S" },
    { texto: "Analítico", fator: "C" }
  ]},
  { id: 2, descritores: [
    { texto: "Competitivo", fator: "D" },
    { texto: "Comunicativo", fator: "I" },
    { texto: "Consistente", fator: "S" },
    { texto: "Detalhista", fator: "C" }
  ]},
  { id: 3, descritores: [
    { texto: "Assertivo", fator: "D" },
    { texto: "Otimista", fator: "I" },
    { texto: "Calmo", fator: "S" },
    { texto: "Lógico", fator: "C" }
  ]},
  { id: 4, descritores: [
    { texto: "Direto", fator: "D" },
    { texto: "Sociável", fator: "I" },
    { texto: "Leal", fator: "S" },
    { texto: "Cauteloso", fator: "C" }
  ]},
  { id: 5, descritores: [
    { texto: "Ousado", fator: "D" },
    { texto: "Persuasivo", fator: "I" },
    { texto: "Colaborativo", fator: "S" },
    { texto: "Criterioso", fator: "C" }
  ]},
  { id: 6, descritores: [
    { texto: "Determinado", fator: "D" },
    { texto: "Inspirador", fator: "I" },
    { texto: "Estável", fator: "S" },
    { texto: "Organizado", fator: "C" }
  ]},
  { id: 7, descritores: [
    { texto: "Desafiador", fator: "D" },
    { texto: "Expressivo", fator: "I" },
    { texto: "Metódico", fator: "S" },
    { texto: "Preciso", fator: "C" }
  ]},
  { id: 8, descritores: [
    { texto: "Independente", fator: "D" },
    { texto: "Amigável", fator: "I" },
    { texto: "Tranquilo", fator: "S" },
    { texto: "Observador", fator: "C" }
  ]},
  { id: 9, descritores: [
    { texto: "Dominante", fator: "D" },
    { texto: "Popular", fator: "I" },
    { texto: "Previsível", fator: "S" },
    { texto: "Sistemático", fator: "C" }
  ]},
  { id: 10, descritores: [
    { texto: "Vigoroso", fator: "D" },
    { texto: "Convincente", fator: "I" },
    { texto: "Tolerante", fator: "S" },
    { texto: "Cuidadoso", fator: "C" }
  ]},
  { id: 11, descritores: [
    { texto: "Enérgico", fator: "D" },
    { texto: "Extrovertido", fator: "I" },
    { texto: "Constante", fator: "S" },
    { texto: "Perfeccionista", fator: "C" }
  ]},
  { id: 12, descritores: [
    { texto: "Impulsionador", fator: "D" },
    { texto: "Falante", fator: "I" },
    { texto: "Reservado", fator: "S" },
    { texto: "Minucioso", fator: "C" }
  ]},
  { id: 13, descritores: [
    { texto: "Focado em resultados", fator: "D" },
    { texto: "Gosta de atenção", fator: "I" },
    { texto: "Bom ouvinte", fator: "S" },
    { texto: "Busca fatos", fator: "C" }
  ]},
  { id: 14, descritores: [
    { texto: "Rápido", fator: "D" },
    { texto: "Criativo", fator: "I" },
    { texto: "Deliberado", fator: "S" },
    { texto: "Exato", fator: "C" }
  ]},
  { id: 15, descritores: [
    { texto: "Líder", fator: "D" },
    { texto: "Animado", fator: "I" },
    { texto: "Cooperativo", fator: "S" },
    { texto: "Ponderado", fator: "C" }
  ]},
  { id: 16, descritores: [
    { texto: "Exigente", fator: "D" },
    { texto: "Informal", fator: "I" },
    { texto: "Acolhedor", fator: "S" },
    { texto: "Formal", fator: "C" }
  ]},
  { id: 17, descritores: [
    { texto: "Proativo", fator: "D" },
    { texto: "Carismático", fator: "I" },
    { texto: "Gentil", fator: "S" },
    { texto: "Rigoroso", fator: "C" }
  ]},
  { id: 18, descritores: [
    { texto: "Franco", fator: "D" },
    { texto: "Alegre", fator: "I" },
    { texto: "Sincero", fator: "S" },
    { texto: "Diplomático", fator: "C" }
  ]},
  { id: 19, descritores: [
    { texto: "Ambicioso", fator: "D" },
    { texto: "Confiante", fator: "I" },
    { texto: "Humilde", fator: "S" },
    { texto: "Racional", fator: "C" }
  ]},
  { id: 20, descritores: [
    { texto: "Forte", fator: "D" },
    { texto: "Gosta de grupos", fator: "I" },
    { texto: "Ritmo constante", fator: "S" },
    { texto: "Busca qualidade", fator: "C" }
  ]},
  { id: 21, descritores: [
    { texto: "Autoconfiante", fator: "D" },
    { texto: "Espontâneo", fator: "I" },
    { texto: "Equilibrado", fator: "S" },
    { texto: "Consciencioso", fator: "C" }
  ]},
  { id: 22, descritores: [
    { texto: "Corajoso", fator: "D" },
    { texto: "Influente", fator: "I" },
    { texto: "Evita conflito", fator: "S" },
    { texto: "Busca precisão", fator: "C" }
  ]},
  { id: 23, descritores: [
    { texto: "Aventureiro", fator: "D" },
    { texto: "Bem-humorado", fator: "I" },
    { texto: "Amável", fator: "S" },
    { texto: "Meticuloso", fator: "C" }
  ]},
  { id: 24, descritores: [
    { texto: "Produtivo", fator: "D" },
    { texto: "Motivador", fator: "I" },
    { texto: "Persistente", fator: "S" },
    { texto: "Especialista", fator: "C" }
  ]},
  { id: 25, descritores: [
    { texto: "Orientado a metas", fator: "D" },
    { texto: "Aberto", fator: "I" },
    { texto: "Confiável", fator: "S" },
    { texto: "Controlado", fator: "C" }
  ]},
];

// ============================================================================
// QUESTÕES SITUACIONAIS OTIMIZADAS (10 questões - medem perfil adaptado)
// Cada cenário tem 4 opções CLARAS, uma para cada fator DISC
// ============================================================================

export const discSituationalQuestions: SituationalQuestion[] = [
  {
    id: 101,
    contexto: "Liderança sob pressão",
    situacao: "Você precisa entregar um projeto urgente e a equipe está desmotivada. O que você faz primeiro?",
    opcoes: [
      { texto: "Defino prazos claros, atribuo responsabilidades e cobro resultados", fator: "D" },
      { texto: "Reúno a equipe para motivar, celebrar pequenas vitórias e energizar", fator: "I" },
      { texto: "Converso individualmente para entender as dificuldades de cada um", fator: "S" },
      { texto: "Analiso o que causou o atraso e crio um plano detalhado de recuperação", fator: "C" },
    ],
  },
  {
    id: 102,
    contexto: "Conflito na equipe",
    situacao: "Dois colegas estão em conflito e isso está afetando o trabalho. Como você age?",
    opcoes: [
      { texto: "Chamo os dois, exponho o problema e exijo que resolvam imediatamente", fator: "D" },
      { texto: "Tento aproximar os dois informalmente e criar um clima mais leve", fator: "I" },
      { texto: "Ouço cada um separadamente e busco entender os dois lados antes de agir", fator: "S" },
      { texto: "Documento o impacto do conflito e proponho regras claras de convivência", fator: "C" },
    ],
  },
  {
    id: 103,
    contexto: "Decisão de risco",
    situacao: "Surge uma oportunidade de negócio com alto potencial, mas também alto risco. Qual sua postura?",
    opcoes: [
      { texto: "Decido rápido - oportunidades não esperam, assumo o risco", fator: "D" },
      { texto: "Consulto pessoas de confiança e vou pelo feeling coletivo", fator: "I" },
      { texto: "Prefiro esperar mais informações e não me precipitar", fator: "S" },
      { texto: "Faço análise detalhada de cenários antes de qualquer decisão", fator: "C" },
    ],
  },
  {
    id: 104,
    contexto: "Apresentação importante",
    situacao: "Você precisa apresentar resultados para a diretoria. Como se prepara?",
    opcoes: [
      { texto: "Foco nos resultados principais e vou direto ao ponto", fator: "D" },
      { texto: "Preparo uma apresentação envolvente com histórias e exemplos", fator: "I" },
      { texto: "Ensaio várias vezes e peço feedback de colegas de confiança", fator: "S" },
      { texto: "Preparo dados detalhados e antecipo todas as perguntas possíveis", fator: "C" },
    ],
  },
  {
    id: 105,
    contexto: "Mudança organizacional",
    situacao: "A empresa anuncia uma grande reestruturação que afeta seu setor. Qual sua reação?",
    opcoes: [
      { texto: "Vejo como oportunidade para assumir mais responsabilidades", fator: "D" },
      { texto: "Converso com todos para entender o clima e manter a moral", fator: "I" },
      { texto: "Fico preocupado com a estabilidade mas espero mais informações", fator: "S" },
      { texto: "Analiso os detalhes do comunicado e planejo minha adaptação", fator: "C" },
    ],
  },
  {
    id: 106,
    contexto: "Feedback negativo",
    situacao: "Seu chefe dá um feedback negativo sobre seu último trabalho. Como você reage?",
    opcoes: [
      { texto: "Defendo meu ponto de vista e questiono os critérios usados", fator: "D" },
      { texto: "Fico chateado mas busco manter a relação positiva", fator: "I" },
      { texto: "Aceito e reflito sobre o que posso melhorar", fator: "S" },
      { texto: "Peço exemplos específicos e um plano claro de melhoria", fator: "C" },
    ],
  },
  // NOVAS QUESTÕES SITUACIONAIS (107-110)
  {
    id: 107,
    contexto: "Novo projeto desafiador",
    situacao: "Você é designado para liderar um projeto completamente novo, fora da sua zona de conforto. O que você faz?",
    opcoes: [
      { texto: "Aceito o desafio de imediato e já começo a planejar a execução", fator: "D" },
      { texto: "Fico empolgado e já penso em quem convidar para a equipe", fator: "I" },
      { texto: "Peço mais tempo para entender o escopo antes de me comprometer", fator: "S" },
      { texto: "Solicito documentação detalhada e estudo o projeto antes de aceitar", fator: "C" },
    ],
  },
  {
    id: 108,
    contexto: "Cliente insatisfeito",
    situacao: "Um cliente importante liga reclamando de um problema grave com seu produto/serviço. Como você age?",
    opcoes: [
      { texto: "Assumo a responsabilidade e prometo resolver rapidamente", fator: "D" },
      { texto: "Ouço com atenção, me desculpo e busco reconquistar a confiança", fator: "I" },
      { texto: "Mantenho a calma, ouço tudo e asseguro que vou cuidar pessoalmente", fator: "S" },
      { texto: "Faço perguntas detalhadas para entender exatamente o que aconteceu", fator: "C" },
    ],
  },
  {
    id: 109,
    contexto: "Erro descoberto",
    situacao: "Você descobre que cometeu um erro significativo no trabalho que ainda ninguém percebeu. O que faz?",
    opcoes: [
      { texto: "Corrijo imediatamente e informo apenas se necessário", fator: "D" },
      { texto: "Conto para um colega de confiança e peço ajuda para resolver", fator: "I" },
      { texto: "Fico preocupado, mas corrijo discretamente sem alarmar ninguém", fator: "S" },
      { texto: "Documento o erro, a causa e a correção para evitar recorrência", fator: "C" },
    ],
  },
  {
    id: 110,
    contexto: "Decisão em grupo",
    situacao: "Sua equipe precisa tomar uma decisão importante e há opiniões divididas. Como você contribui?",
    opcoes: [
      { texto: "Defendo minha posição com firmeza e tento convencer os outros", fator: "D" },
      { texto: "Facilito a discussão e busco uma solução que anime a todos", fator: "I" },
      { texto: "Ouço todos os lados e busco um consenso que agrade a maioria", fator: "S" },
      { texto: "Apresento dados e análises para embasar a melhor decisão", fator: "C" },
    ],
  },
];

// ============================================================================
// ITENS DE CONTROLE DE QUALIDADE (4 itens - detectam fraudes e desatenção)
// Distribuídos de forma camuflada ao longo do teste
// ============================================================================

export const controlItems: ControlItem[] = [
  // 1. Item de Desejabilidade Social - detecta respostas socialmente desejáveis
  {
    id: 201,
    tipo: 'desejabilidade',
    pergunta: "Qual afirmação melhor descreve sua experiência profissional?",
    opcoes: [
      { texto: "Já cometi erros no trabalho, como qualquer profissional", flag: "VALID" },
      { texto: "Nunca cometi nenhum erro significativo em minha carreira", flag: "FAKE" },
    ],
  },
  // 2. Item de Atenção - verifica se o candidato está lendo as questões
  {
    id: 202,
    tipo: 'atencao',
    instrucao: "Para verificar sua atenção, selecione a palavra 'CALMO' abaixo:",
    pergunta: "Selecione a opção correta conforme a instrução acima:",
    opcoes: [
      { texto: "Decidido", flag: "CHECK_FAIL" },
      { texto: "Calmo", flag: "CHECK_OK" },
      { texto: "Analítico", flag: "CHECK_FAIL" },
      { texto: "Sociável", flag: "CHECK_FAIL" },
    ],
    resposta_correta: "Calmo",
  },
  // 3. Item de Consistência - compara com questão similar anterior
  {
    id: 203,
    tipo: 'consistencia',
    pergunta: "Em situações de pressão no trabalho, você geralmente:",
    opcoes: [
      { texto: "Age rapidamente para resolver o problema", flag: "D" },
      { texto: "Busca apoio e opiniões de colegas", flag: "I" },
      { texto: "Mantém a calma e segue o processo estabelecido", flag: "S" },
      { texto: "Analisa todas as variáveis antes de agir", flag: "C" },
    ],
    comparar_com: 103, // Compara com questão situacional 103 (Decisão de risco)
  },
  // 4. Item de Desejabilidade Social 2 - reforço de detecção
  {
    id: 204,
    tipo: 'desejabilidade',
    pergunta: "Como você descreveria sua relação com prazos?",
    opcoes: [
      { texto: "Às vezes preciso de mais tempo do que o planejado", flag: "VALID" },
      { texto: "Sempre entrego tudo antes do prazo, sem exceção", flag: "FAKE" },
    ],
  },
];

// ============================================================================
// SISTEMA DE FLAGS E CONFIABILIDADE
// ============================================================================

export interface ReliabilityFlags {
  fake_responses: boolean;        // Marcou opções de desejabilidade social
  attention_failed: boolean;      // Errou item de atenção
  inconsistent: boolean;          // Respostas contraditórias
  too_fast: boolean;              // Respondeu muito rápido (< 3s média)
  too_slow: boolean;              // Respondeu muito lento (> 2min média)
  flat_profile: boolean;          // Perfil muito homogêneo (possível aleatoriedade)
  contradictory_pattern: boolean; // Mesmo fator como "mais" e "menos" frequentemente
}

export interface ReliabilityResult {
  score: number;           // 0-100
  nivel: 'ALTA' | 'MEDIA' | 'BAIXA' | 'SUSPEITA';
  cor: string;
  icone: string;
  flags: ReliabilityFlags;
  warnings: string[];
}

export function calculateReliability(
  flags: ReliabilityFlags,
  avgTimePerQuestion: number,
  profileSpread: number
): ReliabilityResult {
  let score = 100;
  const warnings: string[] = [];

  // Penalizações
  if (flags.fake_responses) {
    score -= 20;
    warnings.push("Detectadas respostas socialmente desejáveis");
  }
  if (flags.attention_failed) {
    score -= 25;
    warnings.push("Item de atenção respondido incorretamente");
  }
  if (flags.inconsistent) {
    score -= 20;
    warnings.push("Padrão de respostas inconsistente detectado");
  }
  if (flags.too_fast) {
    score -= 30;
    warnings.push("Tempo de resposta muito rápido - possível aleatoriedade");
  }
  if (flags.too_slow) {
    score -= 5;
    warnings.push("Tempo de resposta acima do esperado");
  }
  if (flags.flat_profile) {
    score -= 15;
    warnings.push("Perfil muito homogêneo - pode indicar respostas aleatórias");
  }
  if (flags.contradictory_pattern) {
    score -= 15;
    warnings.push("Padrão contraditório nas escolhas");
  }

  // Garantir score mínimo de 0
  score = Math.max(0, score);

  // Classificação
  let nivel: 'ALTA' | 'MEDIA' | 'BAIXA' | 'SUSPEITA';
  let cor: string;
  let icone: string;

  if (score >= 85) {
    nivel = 'ALTA';
    cor = '#22C55E'; // Verde
    icone = '✅';
  } else if (score >= 70) {
    nivel = 'MEDIA';
    cor = '#EAB308'; // Amarelo
    icone = '⚠️';
  } else if (score >= 50) {
    nivel = 'BAIXA';
    cor = '#F97316'; // Laranja
    icone = '⚠️';
  } else {
    nivel = 'SUSPEITA';
    cor = '#EF4444'; // Vermelho
    icone = '❌';
  }

  return {
    score,
    nivel,
    cor,
    icone,
    flags,
    warnings,
  };
}

// Função para verificar consistência entre respostas
export function checkConsistency(
  controlAnswer: 'D' | 'I' | 'S' | 'C',
  relatedAnswer: 'D' | 'I' | 'S' | 'C'
): boolean {
  // Considera consistente se a resposta for a mesma ou do mesmo "eixo"
  // Eixo 1: D-I (extrovertido, ativo)
  // Eixo 2: S-C (introvertido, passivo)
  const axis1 = ['D', 'I'];
  const axis2 = ['S', 'C'];

  if (controlAnswer === relatedAnswer) return true;
  if (axis1.includes(controlAnswer) && axis1.includes(relatedAnswer)) return true;
  if (axis2.includes(controlAnswer) && axis2.includes(relatedAnswer)) return true;

  return false;
}

// Função para detectar perfil muito homogêneo (flat)
export function isFlatProfile(d: number, i: number, s: number, c: number): boolean {
  const values = [d, i, s, c];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;

  // Se a diferença entre maior e menor for < 10, considera flat
  return spread < 10;
}

// Função para detectar padrão contraditório
export function hasContradictoryPattern(
  factorChoices: Record<string, { mais: number; menos: number }>
): boolean {
  const factors: Array<'D' | 'I' | 'S' | 'C'> = ['D', 'I', 'S', 'C'];

  for (const factor of factors) {
    const choice = factorChoices[factor];
    const total = choice.mais + choice.menos;

    if (total >= 6) {
      const ratio = Math.min(choice.mais, choice.menos) / Math.max(choice.mais, choice.menos);
      if (ratio > 0.6) {
        return true;
      }
    }
  }

  return false;
}

// ============================================================================
// ORDEM DAS QUESTÕES NO TESTE (distribuição camuflada dos controles)
// ============================================================================

export interface TestQuestion {
  type: 'disc' | 'situational' | 'control' | 'spranger';
  id: number;
  order: number;
}

export function getTestOrder(): TestQuestion[] {
  const order: TestQuestion[] = [];
  let orderNum = 1;

  // Questões 1-10: DISC Descritores (parte 1)
  for (let i = 1; i <= 10; i++) {
    order.push({ type: 'disc', id: i, order: orderNum++ });
  }

  // Questão 11: CONTROLE - Atenção (camuflado)
  order.push({ type: 'control', id: 202, order: orderNum++ });

  // Questões 12-17: DISC Descritores (parte 2)
  for (let i = 11; i <= 16; i++) {
    order.push({ type: 'disc', id: i, order: orderNum++ });
  }

  // Questões 18-21: Situacionais (parte 1)
  for (let i = 101; i <= 104; i++) {
    order.push({ type: 'situational', id: i, order: orderNum++ });
  }

  // Questão 22: CONTROLE - Desejabilidade (camuflado)
  order.push({ type: 'control', id: 201, order: orderNum++ });

  // Questões 23-27: DISC Descritores (parte 3)
  for (let i = 17; i <= 21; i++) {
    order.push({ type: 'disc', id: i, order: orderNum++ });
  }

  // Questões 28-31: Situacionais (parte 2)
  for (let i = 105; i <= 108; i++) {
    order.push({ type: 'situational', id: i, order: orderNum++ });
  }

  // Questão 32: CONTROLE - Consistência (camuflado)
  order.push({ type: 'control', id: 203, order: orderNum++ });

  // Questões 33-36: DISC Descritores (parte 4)
  for (let i = 22; i <= 25; i++) {
    order.push({ type: 'disc', id: i, order: orderNum++ });
  }

  // Questões 37-38: Situacionais (parte 3)
  for (let i = 109; i <= 110; i++) {
    order.push({ type: 'situational', id: i, order: orderNum++ });
  }

  // Questão 39: CONTROLE - Desejabilidade 2 (camuflado)
  order.push({ type: 'control', id: 204, order: orderNum++ });

  // Questões 40-47: Spranger (8 questões reduzidas)
  for (let i = 1; i <= 8; i++) {
    order.push({ type: 'spranger', id: i, order: orderNum++ });
  }

  return order;
}

// Total: 47 questões
// - 25 DISC Descritores
// - 10 Situacionais
// - 4 Controles
// - 8 Spranger
