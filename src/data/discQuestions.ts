export interface Descriptor {
  texto: string;
  fator: 'D' | 'I' | 'S' | 'C';
}

export interface QuestionSet {
  id: number;
  descritores: Descriptor[];
}

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
