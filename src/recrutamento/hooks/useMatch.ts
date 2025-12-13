// =====================================================
// HOOK: useMatch - Área de Recrutamento VEON
// Cálculo de compatibilidade candidato/vaga
// =====================================================

import { useState } from 'react';
import { MatchResult } from '../types/recrutamento.types';

export function useMatch() {
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar funções

  return {
    matchResults,
    loading,
    error,
  };
}
