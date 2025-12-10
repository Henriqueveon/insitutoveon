import { Profile } from '@/context/AssessmentContext';
import { AlertTriangle, Check } from 'lucide-react';

interface AmplitudeAnalysisProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

const getAmplitudeInterpretation = (factor: string, natural: number, adapted: number): string => {
  const diff = adapted - natural;
  
  if (factor === 'D') {
    if (diff < -15) return "Você percebe que precisa ser menos enérgico e exigente, indicando pressão do ambiente para mais ponderação e cautela.";
    if (diff > 15) return "Você está se adaptando para ser mais assertivo e direto no ambiente de trabalho do que naturalmente seria.";
  }
  if (factor === 'I') {
    if (diff < -15) return "No ambiente de trabalho, você contém sua expressividade natural, adotando postura mais reservada.";
    if (diff > 15) return "Você está se esforçando para ser mais comunicativo e sociável do que seu perfil natural.";
  }
  if (factor === 'S') {
    if (diff < -15) return "Você está acelerando seu ritmo natural, adaptando-se a um ambiente mais dinâmico.";
    if (diff > 15) return "Você busca mais estabilidade e paciência no trabalho do que naturalmente possui.";
  }
  if (factor === 'C') {
    if (diff < -15) return "Você está sendo menos detalhista e metódico do que seu perfil natural indica.";
    if (diff > 15) return "Você está se adaptando para ser mais analítico e preciso do que naturalmente seria.";
  }
  return "Seu comportamento natural está alinhado com as demandas do ambiente.";
};

export function AmplitudeAnalysis({ naturalProfile, adaptedProfile }: AmplitudeAnalysisProps) {
  const factors = [
    { key: 'D' as const, label: 'Dominância', icon: '🎯' },
    { key: 'I' as const, label: 'Influência', icon: '💬' },
    { key: 'S' as const, label: 'Estabilidade', icon: '🤝' },
    { key: 'C' as const, label: 'Conformidade', icon: '📊' },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        📈 Análise de Amplitude
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Diferenças significativas entre seu perfil Natural e Adaptado indicam esforço de adaptação ao ambiente.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {factors.map((factor) => {
          const natural = normalizeScore(naturalProfile[factor.key]);
          const adapted = normalizeScore(adaptedProfile[factor.key]);
          const diff = Math.abs(natural - adapted);
          const isSignificant = diff > 15;
          const direction = adapted > natural ? '+' : '';

          return (
            <div
              key={factor.key}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSignificant
                  ? 'border-destructive/50 bg-destructive/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isSignificant ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (
                  <Check className="w-5 h-5 text-disc-s" />
                )}
                <span className="text-lg">{factor.icon}</span>
                <h4 className="font-semibold text-foreground">{factor.label}</h4>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Natural:</span>
                  <span className="font-medium text-[#00CED1]">{natural}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Adaptado:</span>
                  <span className="font-medium text-[#FF6B6B]">{adapted}%</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-border">
                  <span className="text-muted-foreground">Diferença:</span>
                  <span className={`font-bold ${isSignificant ? 'text-destructive' : 'text-disc-s'}`}>
                    {direction}{adapted - natural} pontos
                  </span>
                </div>
              </div>

              {isSignificant && (
                <p className="text-xs italic text-muted-foreground leading-relaxed">
                  {getAmplitudeInterpretation(factor.key, natural, adapted)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
