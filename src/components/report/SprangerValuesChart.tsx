import { Profile } from '@/context/AssessmentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface SprangerValuesChartProps {
  naturalProfile: Profile;
}

interface ValueData {
  nome: string;
  valor: number;
  cor: string;
  icone: string;
  descricao: string;
  exemplos: string[];
}

const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

export function SprangerValuesChart({ naturalProfile }: SprangerValuesChartProps) {
  // Normalizar scores DISC para calcular valores
  const nD = normalizeScore(naturalProfile.D);
  const nI = normalizeScore(naturalProfile.I);
  const nS = normalizeScore(naturalProfile.S);
  const nC = normalizeScore(naturalProfile.C);

  // Calcular valores baseado em correlações comportamentais DISC
  // Nota: Esta é uma estimativa baseada em comportamento, não uma medição direta de valores
  const valoresData: ValueData[] = [
    {
      nome: 'Conhecimento',
      valor: Math.min(100, Math.round(nC * 0.5 + nD * 0.2 + 25)),
      cor: '#7C3AED', // Roxo
      icone: '🧠',
      descricao: 'Você valoriza aprender coisas novas e entender como as coisas funcionam.',
      exemplos: ['Gosta de estudar', 'Busca informações', 'Questiona tudo']
    },
    {
      nome: 'Resultados',
      valor: Math.min(100, Math.round(nD * 0.5 + nC * 0.25 + 20)),
      cor: '#059669', // Verde escuro
      icone: '💰',
      descricao: 'Você foca no que é prático e traz retorno. Não gosta de perder tempo.',
      exemplos: ['Foco em eficiência', 'Quer ver resultados', 'Pensa no ROI']
    },
    {
      nome: 'Harmonia',
      valor: Math.min(100, Math.round(nI * 0.35 + nS * 0.35 + 15)),
      cor: '#F59E0B', // Laranja
      icone: '🎨',
      descricao: 'Você aprecia ambientes agradáveis, coisas bonitas e bem organizadas.',
      exemplos: ['Gosta de beleza', 'Valoriza equilíbrio', 'Sensível ao ambiente']
    },
    {
      nome: 'Pessoas',
      valor: Math.min(100, Math.round(nI * 0.4 + nS * 0.35 + 15)),
      cor: '#EC4899', // Rosa
      icone: '❤️',
      descricao: 'Você se preocupa com o bem-estar dos outros e gosta de ajudar.',
      exemplos: ['Gosta de ajudar', 'Pensa nos outros', 'Empatia natural']
    },
    {
      nome: 'Influência',
      valor: Math.min(100, Math.round(nD * 0.45 + nI * 0.3 + 15)),
      cor: '#E53935', // Vermelho
      icone: '👑',
      descricao: 'Você gosta de liderar, influenciar decisões e ter voz ativa.',
      exemplos: ['Quer liderar', 'Busca reconhecimento', 'Gosta de decidir']
    },
    {
      nome: 'Tradição',
      valor: Math.min(100, Math.round(nS * 0.45 + nC * 0.3 + 10)),
      cor: '#78716C', // Marrom
      icone: '🏛️',
      descricao: 'Você valoriza princípios, consistência e o que já foi comprovado.',
      exemplos: ['Respeita regras', 'Valoriza lealdade', 'Prefere o seguro']
    },
  ];

  // Ordenar por valor (maior primeiro)
  const sortedValues = [...valoresData].sort((a, b) => b.valor - a.valor);
  const topValue = sortedValues[0];
  const secondValue = sortedValues[1];

  const getIntensityLabel = (valor: number): { label: string; color: string } => {
    if (valor >= 70) return { label: 'Muito importante para você', color: 'text-green-600' };
    if (valor >= 50) return { label: 'Importante', color: 'text-blue-600' };
    if (valor >= 30) return { label: 'Moderado', color: 'text-amber-600' };
    return { label: 'Menos prioritário', color: 'text-muted-foreground' };
  };

  return (
    <Card className="card-elevated animate-slide-up no-break">
      <CardHeader>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          O que te motiva?
        </h3>

        {/* Explicação didática */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong className="text-foreground">Todos temos valores diferentes.</strong> O que motiva uma pessoa
                pode não motivar outra. Conhecer seus valores ajuda a escolher atividades e carreiras mais satisfatórias.
              </p>
              <p>
                <strong className="text-foreground">Como interpretar:</strong> Valores com pontuação alta são mais
                importantes para você. Os mais baixos não são "ruins", apenas menos prioritários na sua vida.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Top 2 values highlight */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl border-2"
            style={{ backgroundColor: `${topValue.cor}10`, borderColor: `${topValue.cor}50` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{topValue.icone}</span>
              <div>
                <span className="text-xs text-muted-foreground">Seu valor principal:</span>
                <h4 className="font-bold text-lg text-foreground">{topValue.nome}</h4>
              </div>
              <span className="ml-auto text-2xl font-bold" style={{ color: topValue.cor }}>
                {topValue.valor}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{topValue.descricao}</p>
          </div>

          <div
            className="p-4 rounded-xl border-2"
            style={{ backgroundColor: `${secondValue.cor}10`, borderColor: `${secondValue.cor}50` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{secondValue.icone}</span>
              <div>
                <span className="text-xs text-muted-foreground">Segundo mais importante:</span>
                <h4 className="font-bold text-lg text-foreground">{secondValue.nome}</h4>
              </div>
              <span className="ml-auto text-2xl font-bold" style={{ color: secondValue.cor }}>
                {secondValue.valor}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{secondValue.descricao}</p>
          </div>
        </div>

        {/* All values grid */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Todos os seus valores:</h4>
          {sortedValues.map((valor, index) => {
            const intensity = getIntensityLabel(valor.valor);
            return (
              <div key={valor.nome} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{valor.icone}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">
                        {index + 1}. {valor.nome}
                      </span>
                      <span className="font-bold" style={{ color: valor.cor }}>{valor.valor}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${valor.valor}%`, backgroundColor: valor.cor }}
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

        {/* Note about methodology */}
        <div className="text-xs text-center text-muted-foreground pt-4 border-t border-border">
          <p>
            💡 <strong>Nota:</strong> Esta análise é uma estimativa baseada no seu perfil comportamental DISC.
            Para uma avaliação mais precisa de valores, existem testes específicos como o Inventário de Valores de Spranger.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
