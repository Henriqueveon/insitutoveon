import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VagaRecrutamento } from "@/types/recrutamento.types";

export const useVagas = (empresaId?: string) => {
  const [vagas, setVagas] = useState<VagaRecrutamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVagas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("vagas_recrutamento")
        .select("*")
        .order("created_at", { ascending: false });

      if (empresaId) {
        query = query.eq("empresa_id", empresaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVagas((data as unknown as VagaRecrutamento[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar vagas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVagas();
  }, [empresaId]);

  return { vagas, loading, error, refetch: fetchVagas };
};
