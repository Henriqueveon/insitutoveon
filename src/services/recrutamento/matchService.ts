import { CandidatoRecrutamento, VagaRecrutamento } from "@/types/recrutamento.types";

interface MatchDetalhado {
  percentual: number;
  categorias: {
    perfil_disc: {
      pontuacao: number;
      maximo: number;
      match: boolean;
    };
    localizacao: {
      pontuacao: number;
      maximo: number;
      mesma_cidade: boolean;
      mesmo_estado: boolean;
    };
    salario: {
      pontuacao: number;
      maximo: number;
      dentro_faixa: boolean;
    };
    experiencia: {
      pontuacao: number;
      maximo: number;
      anos: number;
    };
    disponibilidade: {
      pontuacao: number;
      maximo: number;
      compativel: boolean;
    };
  };
  recomendacao: string;
}

export const calcularMatchDetalhado = (
  candidato: CandidatoRecrutamento,
  vaga: VagaRecrutamento
): MatchDetalhado => {
  const categorias = {
    perfil_disc: { pontuacao: 0, maximo: 40, match: false },
    localizacao: { pontuacao: 0, maximo: 25, mesma_cidade: false, mesmo_estado: false },
    salario: { pontuacao: 0, maximo: 20, dentro_faixa: false },
    experiencia: { pontuacao: 0, maximo: 10, anos: candidato.anos_experiencia || 0 },
    disponibilidade: { pontuacao: 0, maximo: 5, compativel: false }
  };

  // 1. Perfil DISC (40 pontos)
  if (candidato.perfil_disc && vaga.perfil_disc_ideal) {
    if (candidato.perfil_disc === vaga.perfil_disc_ideal) {
      categorias.perfil_disc.pontuacao = 40;
      categorias.perfil_disc.match = true;
    } else if (
      candidato.perfil_disc.includes(vaga.perfil_disc_ideal.charAt(0)) ||
      vaga.perfil_disc_ideal.includes(candidato.perfil_disc.charAt(0))
    ) {
      categorias.perfil_disc.pontuacao = 25;
    } else {
      categorias.perfil_disc.pontuacao = 10;
    }
  }

  // 2. Localização (25 pontos)
  if (candidato.estado === vaga.estado) {
    categorias.localizacao.mesmo_estado = true;
    if (candidato.cidade?.toLowerCase() === vaga.cidade?.toLowerCase()) {
      categorias.localizacao.mesma_cidade = true;
      categorias.localizacao.pontuacao = 25;
    } else {
      categorias.localizacao.pontuacao = 15;
    }
  } else if (candidato.aceita_mudanca === "sim") {
    categorias.localizacao.pontuacao = 10;
  }

  // 3. Salário (20 pontos)
  if (candidato.pretensao_salarial && vaga.faixa_salarial_max) {
    const pretensao = parseFloat(candidato.pretensao_salarial.replace(/\D/g, "")) || 0;
    if (pretensao <= vaga.faixa_salarial_max) {
      categorias.salario.dentro_faixa = true;
      if (pretensao >= (vaga.faixa_salarial_min || 0)) {
        categorias.salario.pontuacao = 20;
      } else {
        categorias.salario.pontuacao = 15;
      }
    } else if (pretensao <= vaga.faixa_salarial_max * 1.1) {
      categorias.salario.pontuacao = 10;
    }
  }

  // 4. Experiência (10 pontos)
  const anosExperiencia = candidato.anos_experiencia || 0;
  if (anosExperiencia >= 5) {
    categorias.experiencia.pontuacao = 10;
  } else if (anosExperiencia >= 3) {
    categorias.experiencia.pontuacao = 7;
  } else if (anosExperiencia >= 1) {
    categorias.experiencia.pontuacao = 4;
  }

  // 5. Disponibilidade (5 pontos)
  if (candidato.disponibilidade_horario) {
    const disponibilidade = candidato.disponibilidade_horario.toLowerCase();
    if (
      disponibilidade.includes("integral") ||
      disponibilidade.includes("qualquer") ||
      (vaga.horario && disponibilidade.includes(vaga.horario.toLowerCase()))
    ) {
      categorias.disponibilidade.compativel = true;
      categorias.disponibilidade.pontuacao = 5;
    }
  }

  // Calcular percentual total
  const totalPontos = Object.values(categorias).reduce((acc, cat) => acc + cat.pontuacao, 0);
  const percentual = Math.min(100, totalPontos);

  // Gerar recomendação
  let recomendacao = "";
  if (percentual >= 80) {
    recomendacao = "Excelente match! Este candidato atende muito bem aos requisitos da vaga.";
  } else if (percentual >= 60) {
    recomendacao = "Bom match! Vale a pena conhecer este candidato.";
  } else if (percentual >= 40) {
    recomendacao = "Match moderado. Avalie se os pontos fortes compensam as diferenças.";
  } else {
    recomendacao = "Match baixo. Considere outros candidatos antes.";
  }

  return {
    percentual,
    categorias,
    recomendacao
  };
};
