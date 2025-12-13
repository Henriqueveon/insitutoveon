import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmpresaRecrutamento } from "@/types/recrutamento.types";

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<EmpresaRecrutamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("empresas_recrutamento")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmpresas((data as unknown as EmpresaRecrutamento[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return { empresas, loading, error, refetch: fetchEmpresas };
};
