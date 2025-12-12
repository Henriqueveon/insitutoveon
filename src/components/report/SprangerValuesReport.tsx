import { SprangerProfile } from '@/context/AssessmentContext';
import { sprangerValuesInfo, SprangerValueInfo } from '@/data/sprangerQuestions';
import { Info } from 'lucide-react';

interface SprangerValuesReportProps {
  sprangerProfile: SprangerProfile;
}

interface ValueWithScore extends SprangerValueInfo {
  score: number;
  percentage: number;
}

export function SprangerValuesReport({ sprangerProfile }: SprangerValuesReportProps) {
  // Calculate max possible score: 14 questions * 3 points max per value = 42
  // But since each question only contributes to one value, max is actually:
  // 14 questions * 2 "MUITO EU" slots * 3 points = 84 total points distributed among 6 values
  // Average max per value would be 84/6 = 14, but can be higher if concentrated
  // Max theoretical per value: 14 * 3 = 42 (if all questions favored one value)

  // Calculate total points to normalize
  const totalPoints = Object.values(sprangerProfile).reduce((sum, val) => sum + val, 0);
  const maxPossiblePerValue = 42; // Theoretical max

  // Map values with their scores and create sorted list
  const valuesWithScores: ValueWithScore[] = sprangerValuesInfo.map((info) => {
    const score = sprangerProfile[info.codigo];
    // Calculate percentage relative to total (for pie visualization)
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    return {
      ...info,
      score,
      percentage,
    };
  });

  // Sort by score (highest first)
  const sortedValues = [...valuesWithScores].sort((a, b) => b.score - a.score);
  const topValue = sortedValues[0];
  const secondValue = sortedValues[1];

  const getIntensityLabel = (percentage: number): { label: string; color: string } => {
    if (percentage >= 25) return { label: 'Muito importante para você', color: 'text-green-600' };
    if (percentage >= 18) return { label: 'Importante', color: 'text-blue-600' };
    if (percentage >= 12) return { label: 'Moderado', color: 'text-amber-600' };
    return { label: 'Menos prioritário', color: 'text-muted-foreground' };
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        O que te motiva?
      </h3>

      {/* Explicação didática */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">Seus valores motivacionais</strong> revelam o que realmente
              te move e dá significado às suas escolhas. Estes resultados são baseados nas suas respostas
              ao teste de valores.
            </p>
            <p>
              <strong className="text-foreground">Como interpretar:</strong> Valores com pontuação mais alta são
              os que mais influenciam suas decisões e comportamentos no dia a dia.
            </p>
          </div>
        </div>
      </div>

      {/* Top 2 values highlight */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div
          className="p-4 rounded-xl border-2"
          style={{ backgroundColor: `${topValue.cor}10`, borderColor: `${topValue.cor}50` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{topValue.icone}</span>
            <div>
              <span className="text-xs text-muted-foreground">Seu valor principal:</span>
              <h4 className="font-bold text-lg text-foreground">{topValue.nomeCompleto}</h4>
            </div>
            <span className="ml-auto text-2xl font-bold" style={{ color: topValue.cor }}>
              {topValue.percentage}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{topValue.descricao}</p>
          <div className="flex flex-wrap gap-1">
            {topValue.caracteristicas.map((trait) => (
              <span
                key={trait}
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: topValue.cor }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div
          className="p-4 rounded-xl border-2"
          style={{ backgroundColor: `${secondValue.cor}10`, borderColor: `${secondValue.cor}50` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{secondValue.icone}</span>
            <div>
              <span className="text-xs text-muted-foreground">Segundo mais importante:</span>
              <h4 className="font-bold text-lg text-foreground">{secondValue.nomeCompleto}</h4>
            </div>
            <span className="ml-auto text-2xl font-bold" style={{ color: secondValue.cor }}>
              {secondValue.percentage}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{secondValue.descricao}</p>
          <div className="flex flex-wrap gap-1">
            {secondValue.caracteristicas.map((trait) => (
              <span
                key={trait}
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: secondValue.cor }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Career suggestions for top value */}
      <div className="bg-primary/5 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <span>💼</span> Carreiras que combinam com você
        </h4>
        <p className="text-sm text-muted-foreground mb-2">
          Com base no seu valor principal ({topValue.nomeCompleto}), você pode se destacar em:
        </p>
        <div className="flex flex-wrap gap-2">
          {topValue.carreiras.map((carreira) => (
            <span
              key={carreira}
              className="text-sm px-3 py-1 rounded-full bg-card border border-border"
            >
              {carreira}
            </span>
          ))}
        </div>
      </div>

      {/* All values grid */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Todos os seus valores:</h4>
        {sortedValues.map((valor, index) => {
          const intensity = getIntensityLabel(valor.percentage);
          return (
            <div key={valor.codigo} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{valor.icone}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">
                      {index + 1}. {valor.nomeCompleto}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{valor.score} pts</span>
                      <span className="font-bold" style={{ color: valor.cor }}>
                        {valor.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${valor.percentage}%`, backgroundColor: valor.cor }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{valor.descricao}</p>
                <span className={`text-xs font-medium ${intensity.color}`}>{intensity.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology note */}
      <div className="text-xs text-center text-muted-foreground pt-4 mt-4 border-t border-border">
        <p>
          💎 Esta análise é baseada no <strong>Inventário de Valores de Spranger</strong>,
          que identifica 6 tipos de motivação fundamentais. Seus resultados refletem
          suas respostas ao teste de valores.
        </p>
      </div>
    </div>
  );
}
