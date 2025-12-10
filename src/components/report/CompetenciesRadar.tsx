import { Profile } from '@/context/AssessmentContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CompetenciesRadarProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

export function CompetenciesRadar({ naturalProfile, adaptedProfile }: CompetenciesRadarProps) {
  // Generate competencies based on DISC scores
  const generateCompetencies = () => {
    const nD = normalizeScore(naturalProfile.D);
    const nI = normalizeScore(naturalProfile.I);
    const nS = normalizeScore(naturalProfile.S);
    const nC = normalizeScore(naturalProfile.C);
    
    const aD = normalizeScore(adaptedProfile.D);
    const aI = normalizeScore(adaptedProfile.I);
    const aS = normalizeScore(adaptedProfile.S);
    const aC = normalizeScore(adaptedProfile.C);

    return [
      { competencia: 'Ousadia', natural: nD * 0.9 + nI * 0.1, adaptado: aD * 0.9 + aI * 0.1 },
      { competencia: 'Comando', natural: nD * 0.85 + nC * 0.15, adaptado: aD * 0.85 + aC * 0.15 },
      { competencia: 'Assertividade', natural: nD * 0.7 + nI * 0.3, adaptado: aD * 0.7 + aI * 0.3 },
      { competencia: 'Persuasão', natural: nI * 0.8 + nD * 0.2, adaptado: aI * 0.8 + aD * 0.2 },
      { competencia: 'Extroversão', natural: nI * 0.85 + nS * 0.15, adaptado: aI * 0.85 + aS * 0.15 },
      { competencia: 'Entusiasmo', natural: nI * 0.9 + nD * 0.1, adaptado: aI * 0.9 + aD * 0.1 },
      { competencia: 'Sociabilidade', natural: nI * 0.7 + nS * 0.3, adaptado: aI * 0.7 + aS * 0.3 },
      { competencia: 'Paciência', natural: nS * 0.9 + nC * 0.1, adaptado: aS * 0.9 + aC * 0.1 },
      { competencia: 'Persistência', natural: nS * 0.7 + nD * 0.3, adaptado: aS * 0.7 + aD * 0.3 },
      { competencia: 'Empatia', natural: nS * 0.8 + nI * 0.2, adaptado: aS * 0.8 + aI * 0.2 },
      { competencia: 'Concentração', natural: nC * 0.8 + nS * 0.2, adaptado: aC * 0.8 + aS * 0.2 },
      { competencia: 'Prudência', natural: nC * 0.85 + nS * 0.15, adaptado: aC * 0.85 + aS * 0.15 },
      { competencia: 'Detalhismo', natural: nC * 0.9 + nD * 0.1, adaptado: aC * 0.9 + aD * 0.1 },
      { competencia: 'Organização', natural: nC * 0.7 + nS * 0.3, adaptado: aC * 0.7 + aS * 0.3 },
      { competencia: 'Planejamento', natural: nC * 0.75 + nD * 0.25, adaptado: aC * 0.75 + aD * 0.25 },
      { competencia: 'Objetividade', natural: nD * 0.6 + nC * 0.4, adaptado: aD * 0.6 + aC * 0.4 },
    ].map(item => ({
      ...item,
      natural: Math.round(item.natural),
      adaptado: Math.round(item.adaptado),
    }));
  };

  const competenciasData = generateCompetencies();

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        🎯 Mapa de Competências
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Visualização completa das 16 competências comportamentais
      </p>

      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={competenciasData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="competencia"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name="Natural"
              dataKey="natural"
              stroke="#00CED1"
              fill="#00CED1"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Adaptado"
              dataKey="adaptado"
              stroke="#FF6B6B"
              fill="#FF6B6B"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
