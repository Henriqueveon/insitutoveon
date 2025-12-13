// =====================================================
// SERVICE: Match - Área de Recrutamento VEON
// Algoritmo de compatibilidade candidato/vaga
// =====================================================

import {
  CandidatoRecrutamento,
  VagaRecrutamento,
  MatchResult,
} from '../types/recrutamento.types';

/**
 * Calcula compatibilidade DISC entre candidato e vaga
 */
function calcularMatchDISC(
  perfilCandidato: string | null,
  perfilVaga: string | null
): number {
  if (!perfilCandidato || !perfilVaga) return 50;

  // Conta quantas letras coincidem na ordem
  let match = 0;
  const minLen = Math.min(perfilCandidato.length, perfilVaga.length);

  for (let i = 0; i < minLen; i++) {
    if (perfilCandidato[i] === perfilVaga[i]) {
      match += 25; // 25% por letra na mesma posição
    } else if (perfilVaga.includes(perfilCandidato[i])) {
      match += 10; // 10% se a letra existe em outra posição
    }
  }

  return Math.min(match, 100);
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
