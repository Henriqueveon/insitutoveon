// =====================================================
// SERVICE: Match - Área de Recrutamento VEON
// Algoritmo de compatibilidade candidato/vaga
// =====================================================

import {
  CandidatoRecrutamento,
  VagaRecrutamento,
  MatchResult,
} from '../types/recrutamento.types';

// =====================================================
// DICIONÁRIO DE PALAVRAS PARA PERFIL DISC
// =====================================================

const DICIONARIO_DISC: Record<string, string> = {
  // DOMINANTE (D)
  competitivo: 'D', líder: 'D', decidido: 'D', direto: 'D', assertivo: 'D',
  determinado: 'D', ambicioso: 'D', focado: 'D', resultados: 'D', desafiador: 'D',
  rápido: 'D', prático: 'D', objetivo: 'D', independente: 'D', audacioso: 'D',
  empreendedor: 'D', proativo: 'D', dinâmico: 'D',

  // INFLUENTE (I)
  comunicativo: 'I', entusiasta: 'I', carismático: 'I', social: 'I', otimista: 'I',
  persuasivo: 'I', criativo: 'I', espontâneo: 'I', animado: 'I', inspirador: 'I',
  expressivo: 'I', popular: 'I', extrovertido: 'I', motivador: 'I', entusiasmado: 'I',
  alegre: 'I', empolgado: 'I', sociável: 'I',

  // ESTÁVEL (S)
  calmo: 'S', paciente: 'S', confiável: 'S', leal: 'S', cooperativo: 'S',
  estável: 'S', consistente: 'S', tranquilo: 'S', ouvinte: 'S', harmonioso: 'S',
  persistente: 'S', dedicado: 'S', equilibrado: 'S', compreensivo: 'S', acolhedor: 'S',
  gentil: 'S', sereno: 'S', conciliador: 'S',

  // CONFORME (C)
  analítico: 'C', preciso: 'C', organizado: 'C', detalhista: 'C', cuidadoso: 'C',
  metódico: 'C', sistemático: 'C', perfeccionista: 'C', lógico: 'C', criterioso: 'C',
  qualidade: 'C', correto: 'C', técnico: 'C', minucioso: 'C', cauteloso: 'C',
  disciplinado: 'C', rigoroso: 'C', meticuloso: 'C',
};

/**
 * Converte palavras-chave para perfil DISC
 */
export function palavrasParaDISC(palavras: string[]): string {
  const contagem: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };

  palavras.forEach(palavra => {
    const palavraLower = palavra.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    Object.entries(DICIONARIO_DISC).forEach(([key, perfil]) => {
      const keyNormalized = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (palavraLower.includes(keyNormalized) || keyNormalized.includes(palavraLower)) {
        contagem[perfil]++;
      }
    });
  });

  const maxPontos = Math.max(...Object.values(contagem));
  const perfisPredominantes = Object.entries(contagem)
    .filter(([_, pontos]) => pontos === maxPontos && pontos > 0)
    .map(([perfil]) => perfil);

  if (perfisPredominantes.length === 0) return 'S';
  if (perfisPredominantes.length === 1) return perfisPredominantes[0];
  return perfisPredominantes.slice(0, 2).join('');
}

/**
 * Matriz de compatibilidade DISC
 */
function getCompatibilidadeDISC(perfil1: string, perfil2: string): number {
  const compatibilidade: Record<string, Record<string, number>> = {
    D: { D: 100, I: 70, S: 40, C: 50 },
    I: { D: 70, I: 100, S: 60, C: 40 },
    S: { D: 40, I: 60, S: 100, C: 70 },
    C: { D: 50, I: 40, S: 70, C: 100 },
  };
  return compatibilidade[perfil1]?.[perfil2] ?? 50;
}

/**
 * Calcula compatibilidade DISC entre candidato e vaga
 */
function calcularMatchDISC(
  perfilCandidato: string | null,
  perfilVaga: string | null
): number {
  if (!perfilCandidato || !perfilVaga) return 50;

  const candidato = perfilCandidato.toUpperCase();
  const vaga = perfilVaga.toUpperCase();

  // Match perfeito
  if (candidato === vaga) return 100;

  // Match parcial (compartilha uma letra)
  const candidatoLetras = candidato.split('');
  const vagaLetras = vaga.split('');
  const compartilhadas = candidatoLetras.filter(l => vagaLetras.includes(l)).length;

  if (compartilhadas > 0) {
    return 70 + (compartilhadas * 10);
  }

  // Usar matriz de compatibilidade
  return getCompatibilidadeDISC(candidato[0], vaga[0]);
}

/**
 * Calcula compatibilidade de localização
 */
function calcularMatchLocalizacao(
  candidato: CandidatoRecrutamento,
  vaga: VagaRecrutamento
): number {
  if (vaga.modalidade === 'Remoto') return 100;

  if (candidato.estado === vaga.estado) {
    if (candidato.cidade === vaga.cidade) {
      return 100;
    }
    return 70;
  }

  // Verifica se aceita mudança
  if (candidato.aceita_mudanca === 'Sim') return 60;
  if (candidato.aceita_mudanca === 'Negociável') return 40;

  return 20;
}

/**
 * Calcula compatibilidade de salário
 */
function calcularMatchSalario(
  pretensao: string | null,
  faixaMin: number | null,
  faixaMax: number | null
): number {
  if (!pretensao || (!faixaMin && !faixaMax)) return 50;

  // TODO: Implementar lógica de faixas salariais
  return 70;
}

/**
 * Calcula match completo entre candidato e vaga
 */
export function calcularMatch(
  candidato: CandidatoRecrutamento,
  vaga: VagaRecrutamento
): MatchResult {
  const fatores = {
    disc: calcularMatchDISC(candidato.perfil_disc, vaga.perfil_disc_ideal),
    valores: 50, // TODO: Implementar com perfil de valores
    localizacao: calcularMatchLocalizacao(candidato, vaga),
    salario: calcularMatchSalario(
      candidato.pretensao_salarial,
      vaga.faixa_salarial_min,
      vaga.faixa_salarial_max
    ),
    experiencia: candidato.anos_experiencia
      ? Math.min(candidato.anos_experiencia * 10, 100)
      : 50,
  };

  // Pesos dos fatores
  const pesos = {
    disc: 0.35,
    valores: 0.25,
    localizacao: 0.15,
    salario: 0.15,
    experiencia: 0.10,
  };

  const percentual = Math.round(
    fatores.disc * pesos.disc +
    fatores.valores * pesos.valores +
    fatores.localizacao * pesos.localizacao +
    fatores.salario * pesos.salario +
    fatores.experiencia * pesos.experiencia
  );

  return {
    candidato_id: candidato.id,
    vaga_id: vaga.id,
    percentual,
    fatores,
  };
}

/**
 * Ordena candidatos por match com uma vaga
 */
export function ordenarPorMatch(
  candidatos: CandidatoRecrutamento[],
  vaga: VagaRecrutamento
): Array<CandidatoRecrutamento & { match: MatchResult }> {
  return candidatos
    .map((candidato) => ({
      ...candidato,
      match: calcularMatch(candidato, vaga),
    }))
    .sort((a, b) => b.match.percentual - a.match.percentual);
}
