import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CandidatoRecrutamento } from "@/types/recrutamento.types";

export const useCandidatosRecrutamento = () => {
  const [candidatos, setCandidatos] = useState<CandidatoRecrutamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidatos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("candidatos_recrutamento")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCandidatos((data as unknown as CandidatoRecrutamento[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar candidatos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatos();
  }, []);

  return { candidatos, loading, error, refetch: fetchCandidatos };
};
