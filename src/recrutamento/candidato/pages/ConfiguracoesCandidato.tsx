// =====================================================
// PERFIL CANDIDATO - Área de Recrutamento VEON
// Design Instagram com edição de perfil e configurações
// =====================================================

import { useOutletContext } from 'react-router-dom';
import { PerfilInstagramCandidato } from '@/components/recrutamento/PerfilInstagramCandidato';
import { Loader2 } from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  foto_url: string | null;
  video_url: string | null;
  status: string;
  objetivo_profissional: string | null;
  instagram: string | null;
}

export default function ConfiguracoesCandidato() {
  const { candidato, recarregarCandidato } = useOutletContext<{
    candidato: Candidato | null;
    recarregarCandidato: () => void;
  }>();

  if (!candidato?.id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <PerfilInstagramCandidato
        candidatoId={candidato.id}
        modoVisualizacao="candidato"
        onPerfilAtualizado={recarregarCandidato}
      />
    </div>
  );
}
