import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SolicitacaoEntrevista } from "@/types/recrutamento.types";

export const useSolicitacoes = (empresaId?: string, candidatoId?: string) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoEntrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("solicitacoes_entrevista")
        .select("*")
        .order("created_at", { ascending: false });

      if (empresaId) {
        query = query.eq("empresa_id", empresaId);
      }

      if (candidatoId) {
        query = query.eq("candidato_id", candidatoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSolicitacoes((data as unknown as SolicitacaoEntrevista[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar solicitações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, [empresaId, candidatoId]);

  return { solicitacoes, loading, error, refetch: fetchSolicitacoes };
};
