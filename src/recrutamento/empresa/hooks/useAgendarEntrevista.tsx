import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  cidade: string;
  estado: string;
}

interface Empresa {
  id: string;
  creditos: number;
  socio_nome?: string | null;
}

interface UseAgendarEntrevistaProps {
  empresa: Empresa | null;
}

export function useAgendarEntrevista({ empresa }: UseAgendarEntrevistaProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null);
  const [loading, setLoading] = useState(false);

  const abrirModal = (candidato: Candidato) => {
    setCandidatoSelecionado(candidato);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setCandidatoSelecionado(null);
  };

  const confirmarEntrevista = async () => {
    if (!empresa || !candidatoSelecionado) return;

    // Verificar créditos
    if ((empresa.creditos || 0) < 39.9) {
      toast.error("Créditos insuficientes. Você precisa de R$ 39,90.");
      fecharModal();
      navigate("/recrutamento/empresa/creditos");
      return;
    }

    setLoading(true);
    try {
      // Criar proposta de entrevista
      const { error } = await supabase
        .from("propostas_entrevista")
        .insert({
          empresa_id: empresa.id,
          candidato_id: candidatoSelecionado.id,
          status: "pendente",
          valor_cobrado: 39.9,
        });

      if (error) throw error;

      // Debitar créditos
      await supabase
        .from("empresas_recrutamento")
        .update({ creditos: (empresa.creditos || 0) - 39.9 })
        .eq("id", empresa.id);

      fecharModal();
      toast.success("Entrevista solicitada! O candidato receberá sua proposta.");
      navigate("/recrutamento/empresa/em-processo");

    } catch (error) {
      console.error("Erro ao solicitar entrevista:", error);
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return {
    showModal,
    candidatoSelecionado,
    loading,
    socioNome: empresa?.socio_nome,
    abrirModal,
    fecharModal,
    confirmarEntrevista
  };
}
