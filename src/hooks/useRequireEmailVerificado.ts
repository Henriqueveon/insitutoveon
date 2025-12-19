// =====================================================
// HOOK PARA EXIGIR EMAIL VERIFICADO
// Use este hook em qualquer página que precise de email verificado
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseRequireEmailVerificadoOptions {
  candidatoId?: string;
  empresaId?: string;
  tipo?: 'candidato' | 'empresa';
}

interface UseRequireEmailVerificadoReturn {
  isLoading: boolean;
  emailVerificado: boolean;
  email: string;
  nome: string;
  usuarioId: string;
  recarregar: () => Promise<void>;
  marcarComoVerificado: () => void;
}

export function useRequireEmailVerificado({
  candidatoId,
  empresaId,
  tipo = 'candidato',
}: UseRequireEmailVerificadoOptions): UseRequireEmailVerificadoReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');

  const usuarioId = candidatoId || empresaId || '';
  const tabela = tipo === 'candidato' ? 'candidatos_recrutamento' : 'empresas_recrutamento';
  const campoNome = tipo === 'candidato' ? 'nome_completo' : 'nome_fantasia';

  const carregarDados = async () => {
    if (!usuarioId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from(tabela)
        .select(`email, email_verificado, ${campoNome}`)
        .eq('id', usuarioId)
        .single();

      if (error) {
        console.error('Erro ao verificar email:', error);
        setEmailVerificado(false);
        return;
      }

      setEmail(data?.email || '');
      setNome(data?.[campoNome] || '');
      setEmailVerificado(data?.email_verificado === true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setEmailVerificado(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [usuarioId]);

  const marcarComoVerificado = () => {
    setEmailVerificado(true);
  };

  return {
    isLoading,
    emailVerificado,
    email,
    nome,
    usuarioId,
    recarregar: carregarDados,
    marcarComoVerificado,
  };
}

export default useRequireEmailVerificado;
