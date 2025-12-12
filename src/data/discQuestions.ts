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

// 6 Perguntas situacionais para medir PERFIL ADAPTADO (comportamento no trabalho)
// Estas perguntas medem como a pessoa AGE no ambiente profissional
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
      { texto: "Aceito calado e reflito sobre o que posso melhorar", fator: "S" },
      { texto: "Peço exemplos específicos e um plano claro de melhoria", fator: "C" },
    ],
  },
];

export const discQuestions: QuestionSet[] = [
  { id: 1, descritores: [
    { texto: "Decidido", fator: "D" },
    { texto: "Entusiasmado", fator: "I" },
    { texto: "Paciente", fator: "S" },
    { texto: "Preciso", fator: "C" }
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
    { texto: "Aventureiro", fator: "D" },
    { texto: "Convincente", fator: "I" },
    { texto: "Agradável", fator: "S" },
    { texto: "Meticuloso", fator: "C" }
  ]},
  { id: 6, descritores: [
    { texto: "Forte", fator: "D" },
    { texto: "Inspirador", fator: "I" },
    { texto: "Estável", fator: "S" },
    { texto: "Organizado", fator: "C" }
  ]},
  { id: 7, descritores: [
    { texto: "Desafiador", fator: "D" },
    { texto: "Expressivo", fator: "I" },
    { texto: "Metódico", fator: "S" },
    { texto: "Exigente", fator: "C" }
  ]},
  { id: 8, descritores: [
    { texto: "Determinado", fator: "D" },
    { texto: "Amigável", fator: "I" },
    { texto: "Tranquilo", fator: "S" },
    { texto: "Observador", fator: "C" }
  ]},
  { id: 9, descritores: [
    { texto: "Independente", fator: "D" },
    { texto: "Popular", fator: "I" },
    { texto: "Previsível", fator: "S" },
    { texto: "Analítico", fator: "C" }
  ]},
  { id: 10, descritores: [
    { texto: "Ousado", fator: "D" },
    { texto: "Persuasivo", fator: "I" },
    { texto: "Tolerante", fator: "S" },
    { texto: "Sistemático", fator: "C" }
  ]},
  { id: 11, descritores: [
    { texto: "Vigoroso", fator: "D" },
    { texto: "Extrovertido", fator: "I" },
    { texto: "Constante", fator: "S" },
    { texto: "Cuidadoso", fator: "C" }
  ]},
  { id: 12, descritores: [
    { texto: "Impulsionador", fator: "D" },
    { texto: "Falante", fator: "I" },
    { texto: "Reservado", fator: "S" },
    { texto: "Perfeccionista", fator: "C" }
  ]},
  { id: 13, descritores: [
    { texto: "Focado", fator: "D" },
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
    { texto: "Relaxado", fator: "S" },
    { texto: "Formal", fator: "C" }
  ]},
  { id: 17, descritores: [
    { texto: "Decisivo", fator: "D" },
    { texto: "Entusiasta", fator: "I" },
    { texto: "Gentil", fator: "S" },
    { texto: "Correto", fator: "C" }
  ]},
  { id: 18, descritores: [
    { texto: "Franco", fator: "D" },
    { texto: "Aberto", fator: "I" },
    { texto: "Sincero", fator: "S" },
    { texto: "Diplomático", fator: "C" }
  ]},
  { id: 19, descritores: [
    { texto: "Dominante", fator: "D" },
    { texto: "Confiante", fator: "I" },
    { texto: "Humilde", fator: "S" },
    { texto: "Convencional", fator: "C" }
  ]},
  { id: 20, descritores: [
    { texto: "Enérgico", fator: "D" },
    { texto: "Gosta de grupos", fator: "I" },
    { texto: "Ritmo lento", fator: "S" },
    { texto: "Busca qualidade", fator: "C" }
  ]},
  { id: 21, descritores: [
    { texto: "Autoconfiante", fator: "D" },
    { texto: "Espontâneo", fator: "I" },
    { texto: "Equilibrado", fator: "S" },
    { texto: "Racional", fator: "C" }
  ]},
  { id: 22, descritores: [
    { texto: "Controlado", fator: "D" },
    { texto: "Influente", fator: "I" },
    { texto: "Evita conflito", fator: "S" },
    { texto: "Busca precisão", fator: "C" }
  ]},
  { id: 23, descritores: [
    { texto: "Corajoso", fator: "D" },
    { texto: "Bem-humorado", fator: "I" },
    { texto: "Amável", fator: "S" },
    { texto: "Minucioso", fator: "C" }
  ]},
  { id: 24, descritores: [
    { texto: "Produtivo", fator: "D" },
    { texto: "Gosta de variedade", fator: "I" },
    { texto: "Persistente", fator: "S" },
    { texto: "Rigoroso", fator: "C" }
  ]},
  { id: 25, descritores: [
    { texto: "Orientado a resultados", fator: "D" },
    { texto: "Carismático", fator: "I" },
    { texto: "Estável", fator: "S" },
    { texto: "Consciencioso", fator: "C" }
  ]},
];
