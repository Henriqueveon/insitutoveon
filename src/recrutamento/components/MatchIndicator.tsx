// =====================================================
// MATCH INDICATOR - Área de Recrutamento VEON
// Exibe porcentagem de match entre candidato e vaga
// =====================================================

interface MatchIndicatorProps {
  percentual: number;
  tamanho?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function MatchIndicator({
  percentual,
  tamanho = 'md',
  showLabel = true,
}: MatchIndicatorProps) {
  // TODO: Implementar na Fase 3
  return (
    <div>
      <span>{percentual}%</span>
    </div>
  );
}
