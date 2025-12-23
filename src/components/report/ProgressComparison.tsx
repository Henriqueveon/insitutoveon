import { Profile } from '@/context/AssessmentContext';
import { Info } from 'lucide-react';

interface ProgressComparisonProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

// Cores oficiais DISC
const DISC_COLORS = {
  D: '#E53935', // Vermelho
  I: '#FBC02D', // Amarelo
  S: '#43A047', // Verde
  C: '#1E88E5', // Azul
};

const normalizeScore = (score: number): number => {
  return Math.round(((score + 50) / 100) * 100);
};

const getInterpretation = (factor: string, value: number): string => {
  if (factor === 'D') {
    if (value < 40) return "Você prefere analisar bem antes de agir. Não gosta de decisões precipitadas.";
    if (value > 60) return "Você é direto, gosta de resolver problemas rápido e não tem medo de tomar decisões difíceis.";
    return "Você equilibra bem ação e reflexão na hora de resolver problemas.";
  }
  if (factor === 'I') {
    if (value < 40) return "Você prefere conversar com poucas pessoas e ser mais reservado.";
    if (value > 60) return "Você é comunicativo, gosta de conhecer pessoas e animar o ambiente.";
    return "Você se comunica bem, mas também sabe a hora de ouvir.";
  }
  if (factor === 'S') {
    if (value < 40) return "Você gosta de variedade e mudanças. Rotina demais te cansa.";
    if (value > 60) return "Você prefere estabilidade e não gosta de mudanças repentinas.";
    return "Você se adapta bem tanto a mudanças quanto a rotinas.";
  }
  if (factor === 'C') {
    if (value < 40) return "Você é mais flexível com regras e prefere ir pelo instinto.";
    if (value > 60) return "Você é detalhista, organizado e gosta de fazer as coisas com precisão.";
    return "Você sabe quando ser detalhista e quando ser mais prático.";
  }
  return "";
};

export function ProgressComparison({ naturalProfile, adaptedProfile }: ProgressComparisonProps) {
  const analyses = [
    {
      title: 'Como você enfrenta problemas?',
      factor: 'D' as const,
      color: DISC_COLORS.D,
      icon: '🎯',
      lowLabel: 'Cauteloso',
      highLabel: 'Decisivo',
    },
    {
      title: 'Como você se relaciona com pessoas?',
      factor: 'I' as const,
      color: DISC_COLORS.I,
      icon: '💬',
      lowLabel: 'Reservado',
      highLabel: 'Comunicativo',
    },
    {
      title: 'Como você lida com mudanças?',
      factor: 'S' as const,
      color: DISC_COLORS.S,
      icon: '🔄',
      lowLabel: 'Dinâmico',
      highLabel: 'Estável',
    },
    {
      title: 'Como você lida com regras?',
      factor: 'C' as const,
      color: DISC_COLORS.C,
      icon: '📋',
      lowLabel: 'Flexível',
      highLabel: 'Metódico',
    },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        Entenda cada característica sua
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Veja em detalhes como você age em diferentes situações do dia a dia
      </p>

      <div className="space-y-6">
        {analyses.map((analysis) => {
          const natural = normalizeScore(naturalProfile[analysis.factor]);
          const adapted = normalizeScore(adaptedProfile[analysis.factor]);

          return (
            <div key={analysis.factor} className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{analysis.icon}</span>
                <h4 className="font-semibold text-foreground text-lg">{analysis.title}</h4>
              </div>

              {/* Scale labels */}
              <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
                <span>{analysis.lowLabel}</span>
                <span>{analysis.highLabel}</span>
              </div>

              <div className="space-y-2">
                {/* Natural */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Seu jeito natural:</span>
                    <span className="font-bold" style={{ color: analysis.color }}>{natural}%</span>
                  </div>
                  <div className="h-7 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                      style={{ width: `${natural}%`, backgroundColor: analysis.color }}
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
                    <span className="text-muted-foreground">No trabalho:</span>
                    <span className="font-medium text-muted-foreground">{adapted}%</span>
                  </div>
                  <div className="h-7 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700 opacity-60"
                      style={{ width: `${adapted}%`, backgroundColor: analysis.color }}
                    >
                      {adapted > 15 && (
                        <span className="text-xs font-bold text-white">{adapted}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interpretation */}
              <div className="mt-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {getInterpretation(analysis.factor, natural)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
