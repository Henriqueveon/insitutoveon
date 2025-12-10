import { Profile } from '@/context/AssessmentContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LeadershipPieChartProps {
  naturalProfile: Profile;
}

const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

export function LeadershipPieChart({ naturalProfile }: LeadershipPieChartProps) {
  const nD = normalizeScore(naturalProfile.D);
  const nI = normalizeScore(naturalProfile.I);
  const nS = normalizeScore(naturalProfile.S);
  const nC = normalizeScore(naturalProfile.C);
  
  const total = nD + nI + nS + nC;

  const liderancaData = [
    { 
      name: 'Executivo', 
      value: Math.round((nD / total) * 100), 
      color: '#FF6B6B',
      description: 'Foco em resultados e ação direta'
    },
    { 
      name: 'Motivador', 
      value: Math.round((nI / total) * 100), 
      color: '#FFB84D',
      description: 'Inspira e engaja a equipe'
    },
    { 
      name: 'Facilitador', 
      value: Math.round((nS / total) * 100), 
      color: '#51CF66',
      description: 'Cria harmonia e colaboração'
    },
    { 
      name: 'Metódico', 
      value: Math.round((nC / total) * 100), 
      color: '#4DABF7',
      description: 'Foco em qualidade e processos'
    },
  ];

  // Find dominant style
  const dominantStyle = liderancaData.reduce((prev, curr) => 
    curr.value > prev.value ? curr : prev
  );

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        👔 Estilo de Liderança
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Distribuição dos estilos de liderança baseados no seu perfil
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={liderancaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={false}
              >
                {liderancaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Peso']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-semibold text-foreground mb-1">Estilo Dominante</h4>
            <p className="text-2xl font-bold text-primary">{dominantStyle.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{dominantStyle.description}</p>
          </div>

          <div className="space-y-3">
            {liderancaData.map((style) => (
              <div key={style.name} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: style.color }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{style.name}</span>
                    <span className="text-sm font-bold" style={{ color: style.color }}>
                      {style.value}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${style.value}%`, backgroundColor: style.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
