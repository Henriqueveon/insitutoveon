// =====================================================
// CARD CANDIDATO - Área de Recrutamento VEON
// Exibe resumo do candidato para empresas
// =====================================================

import { CandidatoRecrutamento } from '../types/recrutamento.types';

interface CardCandidatoProps {
  candidato: CandidatoRecrutamento;
  matchPercentual?: number;
  onVerPerfil?: () => void;
  onSolicitarEntrevista?: () => void;
}

export default function CardCandidato({
  candidato,
  matchPercentual,
  onVerPerfil,
  onSolicitarEntrevista,
}: CardCandidatoProps) {
  // TODO: Implementar na Fase 3
  return (
    <div>
      <h3>{candidato.nome_completo}</h3>
    </div>
  );
}
