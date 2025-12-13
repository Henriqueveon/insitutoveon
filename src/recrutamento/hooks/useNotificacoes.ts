// =====================================================
// HOOK: useNotificacoes - Área de Recrutamento VEON
// =====================================================

import { useState } from 'react';
import { NotificacaoRecrutamento } from '../types/recrutamento.types';

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoRecrutamento[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar funções

  return {
    notificacoes,
    naoLidas,
    loading,
    error,
  };
}
