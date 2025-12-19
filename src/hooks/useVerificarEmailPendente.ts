// =====================================================
// HOOK PARA VERIFICAR EMAIL PENDENTE
// Verifica se o email do usuário está pendente de verificação
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsuarioInfo {
  id: string;
  nome: string;
  email: string;
  email_verificado: boolean;
}

interface UseVerificarEmailPendenteResult {
  verificacaoPendente: boolean;
  usuarioInfo: UsuarioInfo | null;
  loading: boolean;
  marcarComoVerificado: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useVerificarEmailPendente(
  tipo: 'candidato' | 'empresa',
  userId?: string
): UseVerificarEmailPendenteResult {
  const [verificacaoPendente, setVerificacaoPendente] = useState(false);
  const [usuarioInfo, setUsuarioInfo] = useState<UsuarioInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const verificar = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const tabela = tipo === 'candidato' ? 'candidatos_recrutamento' : 'empresas_recrutamento';
      const campoNome = tipo === 'candidato' ? 'nome_completo' : 'nome_fantasia';

      const { data, error } = await supabase
        .from(tabela)
        .select(`id, ${campoNome}, email, email_verificado`)
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar email pendente:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const emailVerificado = data.email_verificado === true;
        setVerificacaoPendente(!emailVerificado);
        setUsuarioInfo({
          id: data.id,
          nome: data[campoNome] || '',
          email: data.email || '',
          email_verificado: emailVerificado,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar email pendente:', error);
    } finally {
      setLoading(false);
    }
  }, [tipo, userId]);

  useEffect(() => {
    verificar();
  }, [verificar]);

  const marcarComoVerificado = async () => {
    if (!usuarioInfo?.id) return;

    try {
      const tabela = tipo === 'candidato' ? 'candidatos_recrutamento' : 'empresas_recrutamento';

      await supabase
        .from(tabela)
        .update({
          email_verificado: true,
          email_verificado_em: new Date().toISOString(),
        })
        .eq('id', usuarioInfo.id);

      setVerificacaoPendente(false);
      setUsuarioInfo(prev => prev ? { ...prev, email_verificado: true } : null);
    } catch (error) {
      console.error('Erro ao marcar email como verificado:', error);
    }
  };

  return {
    verificacaoPendente,
    usuarioInfo,
    loading,
    marcarComoVerificado,
    recarregar: verificar,
  };
}

export default useVerificarEmailPendente;
