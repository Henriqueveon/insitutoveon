import { Profile } from '@/context/AssessmentContext';

interface ProgressComparisonProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

export function ProgressComparison({ naturalProfile, adaptedProfile }: ProgressComparisonProps) {
  const analyses = [
    {
      title: 'Como lida com Problemas e Desafios',
      factor: 'D' as const,
      description: 'Mede assertividade, tomada de decisão e enfrentamento de obstáculos',
    },
    {
      title: 'Como influencia pessoas',
      factor: 'I' as const,
      description: 'Mede capacidade de persuasão, comunicação e relacionamentos',
    },
    {
      title: 'Como responde ao ritmo do ambiente',
      factor: 'S' as const,
      description: 'Mede paciência, consistência e adaptação a mudanças',
    },
    {
      title: 'Como lida com regras e procedimentos',
      factor: 'C' as const,
      description: 'Mede atenção a detalhes, precisão e conformidade',
    },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        📊 Análises Específicas
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Comparativo detalhado Natural vs Adaptado por dimensão comportamental
      </p>

      <div className="space-y-8">
        {analyses.map((analysis) => {
          const natural = normalizeScore(naturalProfile[analysis.factor]);
          const adapted = normalizeScore(adaptedProfile[analysis.factor]);

          return (
            <div key={analysis.factor} className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">{analysis.title}</h4>
                <p className="text-xs text-muted-foreground">{analysis.description}</p>
              </div>

              <div className="space-y-2">
                {/* Natural */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Natural</span>
                    <span className="font-bold text-[#00CED1]">{natural}%</span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00CED1] to-[#00B4B4] rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                      style={{ width: `${natural}%` }}
                    >
                      {natural > 15 && (
                        <span className="text-xs font-bold text-white">{natural}%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adapted */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Adaptado</span>
                    <span className="font-bold text-[#FF6B6B]">{adapted}%</span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                      style={{ width: `${adapted}%` }}
                    >
                      {adapted > 15 && (
                        <span className="text-xs font-bold text-white">{adapted}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
