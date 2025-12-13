import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificacaoRecrutamento } from "@/types/recrutamento.types";

export const useNotificacoesRecrutamento = (tipoDestinatario: string, destinatarioId: string) => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoRecrutamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notificacoes_recrutamento")
        .select("*")
        .eq("tipo_destinatario", tipoDestinatario)
        .eq("destinatario_id", destinatarioId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotificacoes((data as unknown as NotificacaoRecrutamento[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar notificações");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (notificacaoId: string) => {
    const { error } = await supabase
      .from("notificacoes_recrutamento")
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq("id", notificacaoId);

    if (!error) {
      fetchNotificacoes();
    }
  };

  useEffect(() => {
    if (destinatarioId) {
      fetchNotificacoes();
    }
  }, [tipoDestinatario, destinatarioId]);

  return { notificacoes, loading, error, refetch: fetchNotificacoes, marcarComoLida };
};
