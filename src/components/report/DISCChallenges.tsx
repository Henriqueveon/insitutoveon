import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, UserX, Lock, Brain } from 'lucide-react';

interface AlertasCriticos {
  malInterpretado: string[];
  perdaColaboradores: string[];
  medosTravas: string[];
}

interface DISCChallengesProps {
  alertasCriticos: AlertasCriticos;
  medos: string[];
  perfilNome: string;
}

export function DISCChallenges({ alertasCriticos, medos, perfilNome }: DISCChallengesProps) {
  return (
    <section id="challenges" className="space-y-6">
      {/* Header da secao */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Atencao ao Desenvolvimento</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Desafios e Pontos de Atencao</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Aspectos comportamentais que merecem sua atencao para desenvolvimento pessoal e profissional.
          Reconhecer esses pontos e o primeiro passo para evolucao.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card: Como voce pode ser mal interpretado */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
              <div className="p-2 bg-amber-200 rounded-lg">
                <Brain className="w-5 h-5 text-amber-700" />
              </div>
              Como voce pode ser mal interpretado
            </CardTitle>
            <CardDescription className="text-amber-700">
              Comportamentos que podem gerar percepcoes negativas sobre voce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {alertasCriticos.malInterpretado.map((item, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-amber-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-amber-900 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Card: Risco de perder colaboradores */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-900">
              <div className="p-2 bg-red-200 rounded-lg">
                <UserX className="w-5 h-5 text-red-700" />
              </div>
              Risco de perder colaboradores e talentos
            </CardTitle>
            <CardDescription className="text-red-700">
              Comportamentos que podem afastar pessoas importantes da sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {alertasCriticos.perdaColaboradores.map((item, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-red-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    !
                  </span>
                  <span className="text-red-900 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Card: Medos e travas */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Lock className="w-5 h-5 text-purple-700" />
              </div>
              Medos e travas que limitam seu potencial
            </CardTitle>
            <CardDescription className="text-purple-700">
              Padroes internos que podem estar impedindo seu crescimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {alertasCriticos.medosTravas.map((item, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-purple-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    <Lock className="w-3 h-3" />
                  </span>
                  <span className="text-purple-900 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Card: Medos centrais */}
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <div className="p-2 bg-slate-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-slate-700" />
              </div>
              Seus medos centrais
            </CardTitle>
            <CardDescription className="text-slate-600">
              Receios profundos que influenciam suas decisoes e comportamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {medos.map((medo, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0" />
                  <span className="text-slate-800 text-sm">{medo}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem motivacional */}
      <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
        <p className="text-emerald-800 font-medium">
          Reconhecer esses desafios nao e fraqueza - e inteligencia emocional.
          <br />
          <span className="text-emerald-600 text-sm">Use essa consciencia para evoluir e construir melhores relacionamentos.</span>
        </p>
      </div>
    </section>
  );
}
