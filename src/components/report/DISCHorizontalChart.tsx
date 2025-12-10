import { Profile } from '@/context/AssessmentContext';

interface DISCHorizontalChartProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

export function DISCHorizontalChart({ naturalProfile, adaptedProfile }: DISCHorizontalChartProps) {
  const factors = [
    { key: 'D', label: 'D - Dominância', color: 'bg-[#FF6B6B]' },
    { key: 'I', label: 'I - Influência', color: 'bg-[#FFB84D]' },
    { key: 'S', label: 'S - Estabilidade', color: 'bg-[#51CF66]' },
    { key: 'C', label: 'C - Conformidade', color: 'bg-[#4DABF7]' },
  ] as const;

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-6">
        Gráfico DISC - Natural vs Adaptado
      </h3>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4 px-[140px]">
        <span>Crítico</span>
        <span>Baixo</span>
        <span>Satisfatório</span>
        <span>Desenvolvido</span>
        <span>Excelente</span>
      </div>

      <div className="space-y-6">
        {factors.map((factor) => {
          const naturalValue = normalizeScore(naturalProfile[factor.key]);
          const adaptedValue = normalizeScore(adaptedProfile[factor.key]);

          return (
            <div key={factor.key} className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="w-32 text-sm font-medium text-foreground">{factor.label}</span>
                <div className="flex-1 space-y-1">
                  {/* Natural Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00CED1] rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${naturalValue}%` }}
                      >
                        <span className="text-xs font-bold text-white drop-shadow">{naturalValue}</span>
                      </div>
                    </div>
                  </div>
                  {/* Adapted Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF6B6B] rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${adaptedValue}%` }}
                      >
                        <span className="text-xs font-bold text-white drop-shadow">{adaptedValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00CED1]" />
          <span className="text-sm text-muted-foreground">Natural</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#FF6B6B]" />
          <span className="text-sm text-muted-foreground">Adaptado</span>
        </div>
      </div>
    </div>
  );
}
