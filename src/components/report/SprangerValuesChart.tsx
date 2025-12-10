import { Profile } from '@/context/AssessmentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Diamond } from 'lucide-react';

interface SprangerValuesChartProps {
  naturalProfile: Profile;
}

interface ValueData {
  nome: string;
  valor: number;
  cor: string;
  icone: string;
  descricao: string;
}

export function SprangerValuesChart({ naturalProfile }: SprangerValuesChartProps) {
  // Calculate values based on DISC profile
  const calculateValues = (): ValueData[] => {
    const { D, I, S, C } = naturalProfile;
    
    return [
      { 
        nome: 'Teórico', 
        valor: Math.round((C * 0.6 + D * 0.2 + 20) * 0.8), 
        cor: '#9C27B0', 
        icone: '🧠',
        descricao: 'Busca conhecimento e verdade'
      },
      { 
        nome: 'Econômico', 
        valor: Math.round((D * 0.5 + C * 0.3 + 25) * 0.85), 
        cor: '#4CAF50', 
        icone: '💰',
        descricao: 'Foco em resultados práticos e ROI'
      },
      { 
        nome: 'Estético', 
        valor: Math.round((I * 0.4 + S * 0.3 + 15) * 0.7), 
        cor: '#FF9800', 
        icone: '🎨',
        descricao: 'Valoriza harmonia e beleza'
      },
      { 
        nome: 'Social', 
        valor: Math.round((I * 0.5 + S * 0.4 + 20) * 0.75), 
        cor: '#2196F3', 
        icone: '❤️',
        descricao: 'Ajudar e servir aos outros'
      },
      { 
        nome: 'Político', 
        valor: Math.round((D * 0.6 + I * 0.3 + 20) * 0.8), 
        cor: '#F44336', 
        icone: '⚖️',
        descricao: 'Influência e liderança'
      },
      { 
        nome: 'Tradicional', 
        valor: Math.round((S * 0.5 + C * 0.4 + 10) * 0.65), 
        cor: '#795548', 
        icone: '🙏',
        descricao: 'Valores e princípios sólidos'
      },
    ];
  };

  const valoresData = calculateValues();

  const getClassificacao = (valor: number) => {
    if (valor < 33) return { label: 'Indiferente', cor: 'text-muted-foreground', emoji: '⚪', bg: 'bg-muted' };
    if (valor < 67) return { label: 'Circunstancial', cor: 'text-amber-600', emoji: '🟡', bg: 'bg-amber-50' };
    return { label: 'Significativo', cor: 'text-emerald-600', emoji: '🟢', bg: 'bg-emerald-50' };
  };

  // Find top value
  const topValue = valoresData.reduce((prev, current) => 
    prev.valor > current.valor ? prev : current
  );

  return (
    <Card className="card-elevated animate-slide-up no-break">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Diamond className="w-5 h-5 text-[#FFB84D]" />
          Teoria de Valores (Spranger)
        </CardTitle>
        <CardDescription>
          Identifica seus motivadores e sistemas de valores predominantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={valoresData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="nome" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value}%`, 'Intensidade']}
              />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                {valoresData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top value highlight */}
        <div className="p-4 bg-gradient-to-r from-[#FFB84D]/10 to-[#FF9800]/10 rounded-xl border border-[#FFB84D]/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{topValue.icone}</span>
            <div>
              <h4 className="font-bold text-foreground">
                Valor Predominante: <span style={{ color: topValue.cor }}>{topValue.nome}</span>
              </h4>
              <p className="text-sm text-muted-foreground">{topValue.descricao}</p>
            </div>
            <span className="ml-auto text-2xl font-bold" style={{ color: topValue.cor }}>
              {topValue.valor}%
            </span>
          </div>
        </div>

        {/* Classification grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {valoresData.map((valor) => {
            const classificacao = getClassificacao(valor.valor);
            return (
              <div 
                key={valor.nome}
                className={`p-3 rounded-lg border border-border ${classificacao.bg} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{valor.icone}</span>
                  <h4 className="font-semibold text-sm text-foreground">{valor.nome}</h4>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: valor.cor }}>
                  {valor.valor}%
                </p>
                <p className={`text-xs font-medium ${classificacao.cor}`}>
                  {classificacao.emoji} {classificacao.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <span>⚪</span> Indiferente (0-32%)
          </div>
          <div className="flex items-center gap-1">
            <span>🟡</span> Circunstancial (33-66%)
          </div>
          <div className="flex items-center gap-1">
            <span>🟢</span> Significativo (67-100%)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
