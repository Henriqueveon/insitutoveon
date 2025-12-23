import { Profile } from '@/context/AssessmentContext';
import { Info } from 'lucide-react';

interface LeadershipPieChartProps {
  naturalProfile: Profile;
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

export function LeadershipPieChart({ naturalProfile }: LeadershipPieChartProps) {
  const nD = normalizeScore(naturalProfile.D);
  const nI = normalizeScore(naturalProfile.I);
  const nS = normalizeScore(naturalProfile.S);
  const nC = normalizeScore(naturalProfile.C);

  const total = nD + nI + nS + nC;

  const liderancaData = [
    {
      name: 'Líder Executor',
      profile: 'D',
      value: Math.round((nD / total) * 100),
      color: DISC_COLORS.D,
      emoji: '🎯',
      description: 'Você lidera pelo exemplo, vai direto ao ponto e foca em resultados. Não tem medo de tomar decisões difíceis.',
      traits: ['Direto', 'Decisivo', 'Focado em metas']
    },
    {
      name: 'Líder Motivador',
      profile: 'I',
      value: Math.round((nI / total) * 100),
      color: DISC_COLORS.I,
      emoji: '💬',
      description: 'Você lidera inspirando pessoas, com entusiasmo e otimismo. Cria um ambiente leve e motivador.',
      traits: ['Comunicativo', 'Entusiasta', 'Inspirador']
    },
    {
      name: 'Líder Apoiador',
      profile: 'S',
      value: Math.round((nS / total) * 100),
      color: DISC_COLORS.S,
      emoji: '🤝',
      description: 'Você lidera ouvindo e apoiando a equipe. Cria um ambiente seguro onde todos se sentem valorizados.',
      traits: ['Paciente', 'Cooperativo', 'Confiável']
    },
    {
      name: 'Líder Analítico',
      profile: 'C',
      value: Math.round((nC / total) * 100),
      color: DISC_COLORS.C,
      emoji: '📊',
      description: 'Você lidera com planejamento e organização. Valoriza qualidade e processos bem definidos.',
      traits: ['Organizado', 'Preciso', 'Estratégico']
    },
  ];

  // Find dominant style
  const dominantStyle = liderancaData.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev
  );

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        Seu Estilo de Liderança
      </h3>

      {/* Explicação didática */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">Todo mundo pode liderar!</strong> Não existe um único jeito certo de liderar.
              Cada perfil DISC tem seu próprio estilo de liderança, com pontos fortes diferentes.
            </p>
            <p>
              <strong className="text-foreground">O importante é:</strong> conhecer seu estilo natural e saber quando
              adaptar para cada situação.
            </p>
          </div>
        </div>
      </div>

      {/* Estilo dominante em destaque */}
      <div
        className="p-5 rounded-xl mb-6 border-2"
        style={{ backgroundColor: `${dominantStyle.color}15`, borderColor: `${dominantStyle.color}50` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: dominantStyle.color }}
          >
            {dominantStyle.profile}
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Seu estilo principal:</span>
            <h4 className="text-xl font-bold text-foreground">{dominantStyle.emoji} {dominantStyle.name}</h4>
          </div>
          <span
            className="ml-auto text-3xl font-bold"
            style={{ color: dominantStyle.color }}
          >
            {dominantStyle.value}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{dominantStyle.description}</p>
        <div className="flex flex-wrap gap-2">
          {dominantStyle.traits.map((trait) => (
            <span
              key={trait}
              className="text-xs px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: dominantStyle.color }}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Todos os estilos */}
      <h4 className="font-semibold text-foreground mb-4">Composição do seu estilo:</h4>
      <div className="grid sm:grid-cols-2 gap-4">
        {liderancaData.map((style) => (
          <div
            key={style.name}
            className={`p-4 rounded-lg border transition-all ${
              style.name === dominantStyle.name
                ? 'border-2'
                : 'border-border hover:shadow-md'
            }`}
            style={style.name === dominantStyle.name ? { borderColor: style.color } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: style.color }}
              >
                {style.profile}
              </div>
              <span className="font-medium text-foreground">{style.name}</span>
              <span className="ml-auto font-bold" style={{ color: style.color }}>{style.value}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${style.value}%`, backgroundColor: style.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-6">
        💡 <strong>Dica:</strong> Bons líderes conhecem seu estilo natural, mas também desenvolvem flexibilidade
        para adaptar a liderança conforme a situação e as necessidades da equipe.
      </p>
    </div>
  );
}
