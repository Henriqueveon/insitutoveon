import { Profile } from '@/context/AssessmentContext';
import { Info } from 'lucide-react';

interface CompetenciesRadarProps {
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

interface CompetencyData {
  name: string;
  value: number;
  profile: 'D' | 'I' | 'S' | 'C';
  description: string;
}

export function CompetenciesRadar({ naturalProfile, adaptedProfile }: CompetenciesRadarProps) {
  const nD = normalizeScore(naturalProfile.D);
  const nI = normalizeScore(naturalProfile.I);
  const nS = normalizeScore(naturalProfile.S);
  const nC = normalizeScore(naturalProfile.C);

  // Competências organizadas por quadrante DISC
  const competencies: CompetencyData[] = [
    // Quadrante D - Dominância (Vermelho)
    { name: 'Ousadia', value: Math.round(nD * 0.9 + nI * 0.1), profile: 'D', description: 'Capacidade de assumir riscos e enfrentar desafios' },
    { name: 'Comando', value: Math.round(nD * 0.85 + nC * 0.15), profile: 'D', description: 'Habilidade de liderar e tomar a frente' },
    { name: 'Assertividade', value: Math.round(nD * 0.7 + nI * 0.3), profile: 'D', description: 'Expressar opiniões com firmeza e respeito' },
    { name: 'Objetividade', value: Math.round(nD * 0.6 + nC * 0.4), profile: 'D', description: 'Foco em resultados concretos' },

    // Quadrante I - Influência (Amarelo)
    { name: 'Persuasão', value: Math.round(nI * 0.8 + nD * 0.2), profile: 'I', description: 'Convencer e influenciar outras pessoas' },
    { name: 'Entusiasmo', value: Math.round(nI * 0.9 + nD * 0.1), profile: 'I', description: 'Transmitir energia positiva ao ambiente' },
    { name: 'Sociabilidade', value: Math.round(nI * 0.7 + nS * 0.3), profile: 'I', description: 'Facilidade em criar conexões sociais' },
    { name: 'Comunicação', value: Math.round(nI * 0.85 + nS * 0.15), profile: 'I', description: 'Expressar ideias de forma clara e envolvente' },

    // Quadrante S - Estabilidade (Verde)
    { name: 'Paciência', value: Math.round(nS * 0.9 + nC * 0.1), profile: 'S', description: 'Manter a calma em situações difíceis' },
    { name: 'Persistência', value: Math.round(nS * 0.7 + nD * 0.3), profile: 'S', description: 'Não desistir diante de obstáculos' },
    { name: 'Empatia', value: Math.round(nS * 0.8 + nI * 0.2), profile: 'S', description: 'Entender e se colocar no lugar do outro' },
    { name: 'Cooperação', value: Math.round(nS * 0.85 + nI * 0.15), profile: 'S', description: 'Trabalhar bem em equipe' },

    // Quadrante C - Conformidade (Azul)
    { name: 'Precisão', value: Math.round(nC * 0.9 + nD * 0.1), profile: 'C', description: 'Atenção aos detalhes e qualidade' },
    { name: 'Organização', value: Math.round(nC * 0.7 + nS * 0.3), profile: 'C', description: 'Manter ordem e estrutura nas atividades' },
    { name: 'Análise', value: Math.round(nC * 0.85 + nS * 0.15), profile: 'C', description: 'Examinar informações de forma crítica' },
    { name: 'Planejamento', value: Math.round(nC * 0.75 + nD * 0.25), profile: 'C', description: 'Pensar antes de agir, criar estratégias' },
  ];

  const quadrants = [
    { profile: 'D' as const, label: 'Dominância', color: DISC_COLORS.D, emoji: '🎯', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-200 dark:border-red-900' },
    { profile: 'I' as const, label: 'Influência', color: DISC_COLORS.I, emoji: '💬', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-200 dark:border-yellow-900' },
    { profile: 'S' as const, label: 'Estabilidade', color: DISC_COLORS.S, emoji: '🤝', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-200 dark:border-green-900' },
    { profile: 'C' as const, label: 'Conformidade', color: DISC_COLORS.C, emoji: '📊', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-200 dark:border-blue-900' },
  ];

  const getStrengthLabel = (value: number): string => {
    if (value >= 70) return 'Muito forte';
    if (value >= 50) return 'Forte';
    if (value >= 30) return 'Moderado';
    return 'A desenvolver';
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        Suas Competências
      </h3>

      {/* Explicação didática */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">O que são competências?</strong> São habilidades que você demonstra
              naturalmente no dia a dia. Cada pessoa tem um conjunto único de competências mais desenvolvidas.
            </p>
            <p>
              <strong className="text-foreground">Como ler:</strong> Quanto maior a barra, mais forte é essa
              competência em você. As cores indicam a qual perfil DISC cada competência pertence.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de 4 quadrantes */}
      <div className="grid md:grid-cols-2 gap-6">
        {quadrants.map((quadrant) => {
          const quadrantCompetencies = competencies.filter(c => c.profile === quadrant.profile);
          const avgValue = Math.round(quadrantCompetencies.reduce((sum, c) => sum + c.value, 0) / quadrantCompetencies.length);

          return (
            <div
              key={quadrant.profile}
              className={`rounded-xl p-4 border-2 ${quadrant.bgColor} ${quadrant.borderColor}`}
            >
              {/* Header do quadrante */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: quadrant.color }}
                  >
                    {quadrant.profile}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{quadrant.label}</h4>
                    <span className="text-xs text-muted-foreground">{quadrant.emoji} Média: {avgValue}%</span>
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: quadrant.color }}
                >
                  {getStrengthLabel(avgValue)}
                </span>
              </div>

              {/* Competências do quadrante */}
              <div className="space-y-3">
                {quadrantCompetencies.map((comp) => (
                  <div key={comp.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-foreground">{comp.name}</span>
                      <span className="text-sm font-bold" style={{ color: quadrant.color }}>{comp.value}%</span>
                    </div>
                    <div className="h-3 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${comp.value}%`, backgroundColor: quadrant.color }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <span><strong>0-29%:</strong> A desenvolver</span>
          <span><strong>30-49%:</strong> Moderado</span>
          <span><strong>50-69%:</strong> Forte</span>
          <span><strong>70-100%:</strong> Muito forte</span>
        </div>
      </div>
    </div>
  );
}
