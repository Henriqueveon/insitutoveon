// =====================================================
// CARD VAGA - Área de Recrutamento VEON
// Exibe resumo da vaga para candidatos
// =====================================================

import { VagaRecrutamento } from '../types/recrutamento.types';

interface CardVagaProps {
  vaga: VagaRecrutamento;
  matchPercentual?: number;
  onVerDetalhes?: () => void;
}

export default function CardVaga({
  vaga,
  matchPercentual,
  onVerDetalhes,
}: CardVagaProps) {
  // TODO: Implementar na Fase 3
  return (
    <div>
      <h3>{vaga.titulo}</h3>
    </div>
  );
}
