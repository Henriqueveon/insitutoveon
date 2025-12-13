// =====================================================
// STATUS BADGE - Área de Recrutamento VEON
// Badge para exibir status de candidato/vaga/solicitação
// =====================================================

interface StatusBadgeProps {
  status: string;
  tipo: 'candidato' | 'vaga' | 'solicitacao';
}

export default function StatusBadge({ status, tipo }: StatusBadgeProps) {
  // TODO: Implementar na Fase 3
  return (
    <span>
      {status}
    </span>
  );
}
