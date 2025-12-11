import { Profile } from '@/context/AssessmentContext';
import { AlertTriangle, Check, Info } from 'lucide-react';

interface AmplitudeAnalysisProps {
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
  return Math.round(((score + 25) / 50) * 100);
};

const getAmplitudeInterpretation = (factor: string, natural: number, adapted: number): string => {
  const diff = adapted - natural;

  if (factor === 'D') {
    if (diff < -15) return "No trabalho, você está se contendo e sendo mais cauteloso do que normalmente é. Isso pode causar cansaço se mantido por muito tempo.";
    if (diff > 15) return "Você está forçando a barra para ser mais decisivo e firme no trabalho. Lembre-se de respeitar seu ritmo natural.";
  }
  if (factor === 'I') {
    if (diff < -15) return "Você está se segurando para falar menos e ser mais reservado. Sua energia social natural está sendo contida.";
    if (diff > 15) return "Você está fazendo esforço extra para ser mais comunicativo e sociável no trabalho.";
  }
  if (factor === 'S') {
    if (diff < -15) return "Você está correndo mais do que gostaria. Seu ritmo natural é mais calmo, mas o ambiente está te acelerando.";
    if (diff > 15) return "Você está buscando mais calma e estabilidade do que naturalmente tem. Pode estar evitando mudanças.";
  }
  if (factor === 'C') {
    if (diff < -15) return "Você está sendo menos detalhista do que gostaria. O ambiente não permite que você seja tão cuidadoso quanto quer.";
    if (diff > 15) return "Você está se esforçando para ser mais organizado e preciso do que naturalmente é.";
  }
  return "Tudo certo! Você está agindo no trabalho de forma parecida com seu jeito natural.";
};

export function AmplitudeAnalysis({ naturalProfile, adaptedProfile }: AmplitudeAnalysisProps) {
  const factors = [
    { key: 'D' as const, label: 'Dominância', color: DISC_COLORS.D, description: 'Firmeza e decisão' },
    { key: 'I' as const, label: 'Influência', color: DISC_COLORS.I, description: 'Comunicação e entusiasmo' },
    { key: 'S' as const, label: 'Estabilidade', color: DISC_COLORS.S, description: 'Calma e paciência' },
    { key: 'C' as const, label: 'Conformidade', color: DISC_COLORS.C, description: 'Precisão e organização' },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        Você está se adaptando muito?
      </h3>

      {/* Explicação didática */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">O que é isso?</strong> Aqui comparamos como você é naturalmente
              (em casa, com amigos) com como você age no trabalho.
            </p>
            <p>
              <strong className="text-foreground">Por que importa?</strong> Quando a diferença é muito grande,
              significa que você está fazendo muito esforço para se adaptar. Isso pode causar estresse e cansaço
              se durar muito tempo.
            </p>
          </div>
        </div>
      </div>

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
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-green-400 bg-green-50 dark:bg-green-950/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: factor.color }}
                >
                  {factor.key}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{factor.label}</h4>
                  <span className="text-xs text-muted-foreground">{factor.description}</span>
                </div>
                {isSignificant ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 ml-auto" />
                ) : (
                  <Check className="w-5 h-5 text-green-500 ml-auto" />
                )}
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Como você é:</span>
                  <span className="font-bold" style={{ color: factor.color }}>{natural}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">No trabalho:</span>
                  <span className="font-medium text-muted-foreground">{adapted}%</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Diferença:</span>
                  <span className={`font-bold ${isSignificant ? 'text-amber-600' : 'text-green-600'}`}>
                    {direction}{adapted - natural} pontos
                    {isSignificant ? ' ⚠️' : ' ✓'}
                  </span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isSignificant ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`}>
                {getAmplitudeInterpretation(factor.key, natural, adapted)}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        💡 <strong>Dica:</strong> Diferenças de até 15 pontos são normais. Acima disso, vale refletir se o ambiente está te exigindo demais.
      </p>
    </div>
  );
}
