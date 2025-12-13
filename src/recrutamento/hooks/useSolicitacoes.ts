// =====================================================
// HOOK: useSolicitacoes - Área de Recrutamento VEON
// =====================================================

import { useState } from 'react';
import { SolicitacaoEntrevista } from '../types/recrutamento.types';

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoEntrevista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar funções

  return {
    solicitacoes,
    loading,
    error,
  };
}
