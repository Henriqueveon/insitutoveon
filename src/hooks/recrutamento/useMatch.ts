import { CandidatoRecrutamento, VagaRecrutamento } from "@/types/recrutamento.types";

interface MatchResult {
  percentual: number;
  detalhes: {
    disc: number;
    localizacao: number;
    salario: number;
    disponibilidade: number;
  };
}

export const useMatch = () => {
  const calcularMatch = (candidato: CandidatoRecrutamento, vaga: VagaRecrutamento): MatchResult => {
    let pontuacao = 0;
    const detalhes = {
      disc: 0,
      localizacao: 0,
      salario: 0,
      disponibilidade: 0
    };

    // Match de perfil DISC (40%)
    if (candidato.perfil_disc && vaga.perfil_disc_ideal) {
      if (candidato.perfil_disc === vaga.perfil_disc_ideal) {
        detalhes.disc = 40;
      } else if (candidato.perfil_disc.includes(vaga.perfil_disc_ideal) || 
                 vaga.perfil_disc_ideal.includes(candidato.perfil_disc)) {
        detalhes.disc = 25;
      } else {
        detalhes.disc = 10;
      }
    }

    // Match de localização (30%)
    if (candidato.estado === vaga.estado) {
      if (candidato.cidade === vaga.cidade) {
        detalhes.localizacao = 30;
      } else {
        detalhes.localizacao = 15;
      }
    }

    // Match de salário (20%)
    if (candidato.pretensao_salarial && vaga.faixa_salarial_max) {
      const pretensao = parseFloat(candidato.pretensao_salarial.replace(/\D/g, ""));
      if (pretensao <= vaga.faixa_salarial_max) {
        detalhes.salario = 20;
      } else if (pretensao <= vaga.faixa_salarial_max * 1.2) {
        detalhes.salario = 10;
      }
    }

    // Match de disponibilidade (10%)
    if (candidato.disponibilidade_horario && vaga.horario) {
      if (candidato.disponibilidade_horario.toLowerCase().includes("integral") ||
          candidato.disponibilidade_horario.toLowerCase().includes(vaga.horario.toLowerCase())) {
        detalhes.disponibilidade = 10;
      }
    }

    pontuacao = detalhes.disc + detalhes.localizacao + detalhes.salario + detalhes.disponibilidade;

    return {
      percentual: Math.min(100, pontuacao),
      detalhes
    };
  };

  return { calcularMatch };
};
