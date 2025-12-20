// =====================================================
// VER CURRICULO CANDIDATO - Página dedicada para Empresa
// Usa o novo PerfilInstagramCandidato
// =====================================================

import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { PerfilInstagramCandidato } from '@/components/recrutamento/PerfilInstagramCandidato';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
}

export default function VerCurriculoCandidato() {
  const { candidatoId } = useParams<{ candidatoId: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<{ empresa: Empresa | null }>();
  const empresa = context?.empresa;

  if (!candidatoId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Candidato não encontrado</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      <PerfilInstagramCandidato
        candidatoId={candidatoId}
        modoVisualizacao="empresa"
        empresaId={empresa?.id}
        onClose={() => navigate(-1)}
        onAgendarEntrevista={(id) => {
          console.log('Agendar entrevista para:', id);
          // TODO: Integrar com sistema de agendamento
        }}
      />
    </div>
  );
}
