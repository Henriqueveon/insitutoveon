// =====================================================
// HOOK: useEmpresas - Área de Recrutamento VEON
// =====================================================

import { useState } from 'react';
import { EmpresaRecrutamento } from '../types/recrutamento.types';

export function useEmpresas() {
  const [empresa, setEmpresa] = useState<EmpresaRecrutamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar funções

  return {
    empresa,
    loading,
    error,
  };
}
