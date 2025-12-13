// =====================================================
// HOOK: useVagas - Área de Recrutamento VEON
// =====================================================

import { useState } from 'react';
import { VagaRecrutamento } from '../types/recrutamento.types';

export function useVagas() {
  const [vagas, setVagas] = useState<VagaRecrutamento[]>([]);
  const [vaga, setVaga] = useState<VagaRecrutamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar funções

  return {
    vagas,
    vaga,
    loading,
    error,
  };
}
