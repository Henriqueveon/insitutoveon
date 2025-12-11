import { Profile } from '@/context/AssessmentContext';

interface DISCHorizontalChartProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

// Cores oficiais DISC
const DISC_COLORS = {
  D: '#E53935', // Vermelho - Dominância
  I: '#FBC02D', // Amarelo - Influência
  S: '#43A047', // Verde - Estabilidade
  C: '#1E88E5', // Azul - Conformidade
};

const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

export function DISCHorizontalChart({ naturalProfile, adaptedProfile }: DISCHorizontalChartProps) {
  const factors = [
    { key: 'D' as const, label: 'D - Dominância', color: DISC_COLORS.D, description: 'Como você enfrenta desafios e toma decisões' },
    { key: 'I' as const, label: 'I - Influência', color: DISC_COLORS.I, description: 'Como você se comunica e influencia pessoas' },
    { key: 'S' as const, label: 'S - Estabilidade', color: DISC_COLORS.S, description: 'Como você lida com mudanças e ritmo de trabalho' },
    { key: 'C' as const, label: 'C - Conformidade', color: DISC_COLORS.C, description: 'Como você segue regras e analisa informações' },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        Seu Perfil DISC
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Compare como você age naturalmente (barra superior) com como você se adapta no trabalho (barra inferior).
        <strong className="text-foreground"> Quanto maior a barra, mais forte é essa característica em você.</strong>
      </p>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4 ml-[140px]">
        <span>Baixo</span>
        <span>Médio</span>
        <span>Alto</span>
      </div>

      <div className="space-y-6">
        {factors.map((factor) => {
          const naturalValue = normalizeScore(naturalProfile[factor.key]);
          const adaptedValue = normalizeScore(adaptedProfile[factor.key]);

          return (
            <div key={factor.key} className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: factor.color }}
                    >
                      {factor.key}
                    </div>
                    <span className="text-sm font-medium text-foreground">{factor.label.split(' - ')[1]}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {/* Natural Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Natural</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${naturalValue}%`, backgroundColor: factor.color }}
                      >
                        <span className="text-xs font-bold text-white drop-shadow">{naturalValue}%</span>
                      </div>
                    </div>
                  </div>
                  {/* Adapted Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Adaptado</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500 opacity-70"
                        style={{ width: `${adaptedValue}%`, backgroundColor: factor.color }}
                      >
                        <span className="text-xs font-bold text-white drop-shadow">{adaptedValue}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground ml-[140px] italic">{factor.description}</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-6 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-current opacity-100" />
            <span className="text-sm text-muted-foreground">Natural (como você é)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-current opacity-70" />
            <span className="text-sm text-muted-foreground">Adaptado (no trabalho)</span>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          <strong>Natural:</strong> Seu comportamento espontâneo, em ambientes confortáveis.
          <strong className="ml-2">Adaptado:</strong> Como você se ajusta às exigências do ambiente profissional.
        </p>
      </div>
    </div>
  );
}
