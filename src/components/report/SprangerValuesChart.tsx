import { Profile } from '@/context/AssessmentContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SprangerValuesChartProps {
  naturalProfile: Profile;
}

interface ValueData {
  nome: string;
  codigo: string;
  valor: number;
  cor: string;
  icone: string;
  descricao: string;
  exemplos: string[];
  pontosFortes: string[];
  desafios: string[];
}

const normalizeScore = (score: number): number => {
  return Math.round(((score + 50) / 100) * 100);
};

export function SprangerValuesChart({ naturalProfile }: SprangerValuesChartProps) {
  // Normalizar scores DISC para calcular valores
  const nD = normalizeScore(naturalProfile.D);
  const nI = normalizeScore(naturalProfile.I);
  const nS = normalizeScore(naturalProfile.S);
  const nC = normalizeScore(naturalProfile.C);

  // Calcular valores baseado em correlacoes comportamentais DISC
  const valoresData: ValueData[] = [
    {
      nome: 'Conhecimento',
      codigo: 'teoretico',
      valor: Math.min(100, Math.round(nC * 0.5 + nD * 0.2 + 25)),
      cor: '#7C3AED',
      icone: '🧠',
      descricao: 'Voce valoriza aprender coisas novas e entender como as coisas funcionam.',
      exemplos: ['Gosta de estudar', 'Busca informacoes', 'Questiona tudo'],
      pontosFortes: [
        'Capacidade analitica excepcional',
        'Busca constante por aprendizado',
        'Pensamento critico desenvolvido',
        'Habilidade de resolver problemas complexos'
      ],
      desafios: [
        'Pode ser visto como "sabe-tudo" arrogante',
        'Tendencia a menosprezar conhecimento pratico',
        'Dificuldade em agir sem ter todas as informacoes',
        'Pode paralisar por excesso de analise'
      ]
    },
    {
      nome: 'Resultados',
      codigo: 'economico',
      valor: Math.min(100, Math.round(nD * 0.5 + nC * 0.25 + 20)),
      cor: '#059669',
      icone: '💰',
      descricao: 'Voce foca no que e pratico e traz retorno. Nao gosta de perder tempo.',
      exemplos: ['Foco em eficiencia', 'Quer ver resultados', 'Pensa no ROI'],
      pontosFortes: [
        'Foco em resultados e eficiencia',
        'Pragmatismo nas decisoes',
        'Boa gestao de recursos',
        'Capacidade de priorizar o que importa'
      ],
      desafios: [
        'Pode parecer materialista ou "interesseiro"',
        'Risco de valorizar apenas o que da retorno financeiro',
        'Pode negligenciar relacionamentos em prol de resultados',
        'Dificuldade em investir tempo em coisas "sem retorno"'
      ]
    },
    {
      nome: 'Harmonia',
      codigo: 'estetico',
      valor: Math.min(100, Math.round(nI * 0.35 + nS * 0.35 + 15)),
      cor: '#F59E0B',
      icone: '🎨',
      descricao: 'Voce aprecia ambientes agradaveis, coisas bonitas e bem organizadas.',
      exemplos: ['Gosta de beleza', 'Valoriza equilibrio', 'Sensivel ao ambiente'],
      pontosFortes: [
        'Sensibilidade e criatividade',
        'Capacidade de ver beleza onde outros nao veem',
        'Atencao a detalhes e qualidade',
        'Cria ambientes agradaveis'
      ],
      desafios: [
        'Pode ser visto como "fora da realidade"',
        'Dificuldade com ambientes caoticos ou feios',
        'Pode priorizar forma sobre funcao',
        'Sensibilidade emocional excessiva'
      ]
    },
    {
      nome: 'Pessoas',
      codigo: 'social',
      valor: Math.min(100, Math.round(nI * 0.4 + nS * 0.35 + 15)),
      cor: '#EC4899',
      icone: '❤️',
      descricao: 'Voce se preocupa com o bem-estar dos outros e gosta de ajudar.',
      exemplos: ['Gosta de ajudar', 'Pensa nos outros', 'Empatia natural'],
      pontosFortes: [
        'Empatia genuina',
        'Capacidade de construir relacionamentos',
        'Motivacao por causas maiores',
        'Cria ambientes acolhedores'
      ],
      desafios: [
        'Pode se anular para agradar outros',
        'Risco de ser explorado por sua bondade',
        'Dificuldade em dizer "nao"',
        'Pode negligenciar proprias necessidades'
      ]
    },
    {
      nome: 'Influencia',
      codigo: 'politico',
      valor: Math.min(100, Math.round(nD * 0.45 + nI * 0.3 + 15)),
      cor: '#E53935',
      icone: '👑',
      descricao: 'Voce gosta de liderar, influenciar decisoes e ter voz ativa.',
      exemplos: ['Quer liderar', 'Busca reconhecimento', 'Gosta de decidir'],
      pontosFortes: [
        'Lideranca natural',
        'Capacidade de mobilizar pessoas',
        'Visao estrategica',
        'Consegue fazer as coisas acontecerem'
      ],
      desafios: [
        'Pode ser visto como manipulador',
        'Risco de atropelar pessoas para conseguir o que quer',
        'Dificuldade em aceitar posicoes subordinadas',
        'Pode criar conflitos por disputa de poder'
      ]
    },
    {
      nome: 'Tradicao',
      codigo: 'religioso',
      valor: Math.min(100, Math.round(nS * 0.45 + nC * 0.3 + 10)),
      cor: '#78716C',
      icone: '🏛️',
      descricao: 'Voce valoriza principios, consistencia e o que ja foi comprovado.',
      exemplos: ['Respeita regras', 'Valoriza lealdade', 'Prefere o seguro'],
      pontosFortes: [
        'Senso de proposito forte',
        'Valores e principios solidos',
        'Resiliencia em momentos dificeis',
        'Consistencia e confiabilidade'
      ],
      desafios: [
        'Pode ser visto como inflexivel ou "careta"',
        'Dificuldade em aceitar visoes diferentes',
        'Risco de julgar quem pensa diferente',
        'Pode ter dificuldade com mudancas de paradigma'
      ]
    },
  ];

  // Ordenar por valor (maior primeiro)
  const sortedValues = [...valoresData].sort((a, b) => b.valor - a.valor);
  const topValues = sortedValues.slice(0, 3); // Top 3 para analise detalhada

  const getIntensityLabel = (valor: number): { label: string; color: string } => {
    if (valor >= 70) return { label: 'Muito importante', color: 'text-green-600' };
    if (valor >= 50) return { label: 'Importante', color: 'text-blue-600' };
    if (valor >= 30) return { label: 'Moderado', color: 'text-amber-600' };
    return { label: 'Menos prioritario', color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      <Card className="card-elevated animate-slide-up no-break">
        <CardHeader>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            O que te motiva?
          </h3>

          {/* Explicacao didatica */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong className="text-foreground">Todos temos valores diferentes.</strong> O que motiva uma pessoa
                  pode nao motivar outra. Conhecer seus valores ajuda a escolher atividades e carreiras mais satisfatorias.
                </p>
                <p>
                  <strong className="text-foreground">Como interpretar:</strong> Valores com pontuacao alta sao mais
                  importantes para voce. Os mais baixos nao sao "ruins", apenas menos prioritarios na sua vida.
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* All values grid */}
          <div className="space-y-3">
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
        </CardContent>
      </Card>

      {/* Analise detalhada dos top valores */}
      <Card className="card-elevated animate-slide-up">
        <CardHeader>
          <h3 className="font-display text-xl font-bold text-foreground">
            Analise dos seus valores principais
          </h3>
          <p className="text-sm text-muted-foreground">
            Pontos fortes e desafios dos seus 3 valores mais importantes
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {topValues.map((valor, index) => (
            <div key={valor.codigo} className="space-y-4">
              {/* Header do valor */}
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: `${valor.cor}15` }}
              >
                <span className="text-2xl">{valor.icone}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-muted-foreground">
                      #{index + 1}
                    </span>
                    <h4 className="font-bold text-lg" style={{ color: valor.cor }}>
                      {valor.nome}
                    </h4>
                    <span className="ml-auto font-bold text-lg" style={{ color: valor.cor }}>
                      {valor.valor}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{valor.descricao}</p>
                </div>
              </div>

              {/* Grid de pontos fortes e desafios */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Pontos Fortes */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h5 className="font-semibold text-emerald-800">Pontos Fortes</h5>
                  </div>
                  <ul className="space-y-2">
                    {valor.pontosFortes.map((ponto, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                        <span className="text-emerald-500 mt-1">✓</span>
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desafios */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h5 className="font-semibold text-amber-800">Pontos de Atencao</h5>
                  </div>
                  <ul className="space-y-2">
                    {valor.desafios.map((desafio, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                        <span className="text-amber-500 mt-1">⚠</span>
                        {desafio}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Separador entre valores (exceto o ultimo) */}
              {index < topValues.length - 1 && (
                <div className="border-b border-border/50 pt-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Note about methodology */}
      <div className="text-xs text-center text-muted-foreground p-4 bg-muted/30 rounded-lg">
        <p>
          💡 <strong>Nota:</strong> Esta analise e uma estimativa baseada no seu perfil comportamental DISC.
          Para uma avaliacao mais precisa de valores, existem testes especificos como o Inventario de Valores de Spranger.
        </p>
      </div>
    </div>
  );
}
