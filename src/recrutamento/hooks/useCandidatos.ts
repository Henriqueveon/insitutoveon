// =====================================================
// HOOK: useCandidatos - Área de Recrutamento VEON
// =====================================================

import { useState } from 'react';
import { CandidatoRecrutamento } from '../types/recrutamento.types';

export function useCandidatos() {
  const [candidatos, setCandidatos] = useState<CandidatoRecrutamento[]>([]);
  const [candidato, setCandidato] = useState<CandidatoRecrutamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar funções

  return {
    candidatos,
    candidato,
    loading,
    error,
  };
}
