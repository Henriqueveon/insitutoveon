import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResultadoReativacao {
  verificado: boolean;
  foiReativado: boolean;
  mensagem: string | null;
  loading: boolean;
}

export function useVerificarReativacao(
  usuarioId: string | null,
  usuarioTipo: 'candidato' | 'empresa' | 'analista' | null
): ResultadoReativacao {
  const [resultado, setResultado] = useState<ResultadoReativacao>({
    verificado: false,
    foiReativado: false,
    mensagem: null,
    loading: true,
  });

  useEffect(() => {
    async function verificar() {
      if (!usuarioId || !usuarioTipo) {
        setResultado({
          verificado: true,
          foiReativado: false,
          mensagem: null,
          loading: false,
        });
        return;
      }

      try {
        const { data, error } = await supabase.rpc('reativar_conta_se_pendente', {
          p_usuario_id: usuarioId,
          p_usuario_tipo: usuarioTipo,
        });

        if (error) {
          console.error('Erro ao verificar reativação:', error);
          setResultado({
            verificado: true,
            foiReativado: false,
            mensagem: null,
            loading: false,
          });
          return;
        }

        if (data?.reativada) {
          setResultado({
            verificado: true,
            foiReativado: true,
            mensagem: 'Sua conta foi reativada com sucesso! Bem-vindo de volta.',
            loading: false,
          });
        } else {
          setResultado({
            verificado: true,
            foiReativado: false,
            mensagem: null,
            loading: false,
          });
        }
      } catch (err) {
        console.error('Erro inesperado ao verificar reativação:', err);
        setResultado({
          verificado: true,
          foiReativado: false,
          mensagem: null,
          loading: false,
        });
      }
    }

    verificar();
  }, [usuarioId, usuarioTipo]);

  return resultado;
}

export default useVerificarReativacao;
