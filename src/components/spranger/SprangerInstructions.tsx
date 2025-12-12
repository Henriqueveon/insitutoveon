import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, ArrowRight, MousePointer } from 'lucide-react';

interface SprangerInstructionsProps {
  onStart: () => void;
}

export function SprangerInstructions({ onStart }: SprangerInstructionsProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo showText={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border border-slate-200 bg-white">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💎</span>
            </div>
            <CardTitle className="text-2xl font-display text-slate-800">
              Teste de Valores Motivacionais
            </CardTitle>
            <CardDescription className="text-base text-slate-500">
              Descubra o que realmente te motiva na vida
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Introdução */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 leading-relaxed">
                Este teste vai te ajudar a entender <strong className="text-slate-800">quais valores são mais importantes para você</strong>.
                Não existem respostas certas ou erradas - cada pessoa valoriza coisas diferentes!
              </p>
            </div>

            {/* Como funciona */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Como funciona? Ordene as 6 opções!
              </h3>

              <div className="space-y-3">
                {/* Etapa 1 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#16A34A' }}
                  >
                    1º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#16A34A' }}>
                      O que MAIS combina com você (+5 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 2 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#22C55E' }}
                  >
                    2º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#22C55E' }}>
                      Segunda opção (+4 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 3 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#CA8A04' }}
                  >
                    3º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#CA8A04' }}>
                      Terceira opção (+3 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 4 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#FACC15', color: '#1E293B' }}
                  >
                    4º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#CA8A04' }}>
                      Quarta opção (+2 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 5 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#EA580C' }}
                  >
                    5º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#EA580C' }}>
                      Quinta opção (+1 pt)
                    </p>
                  </div>
                </div>

                {/* Etapa 6 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#DC2626' }}
                  >
                    6º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#DC2626' }}>
                      O que MENOS combina (0 pts) - Avança automático!
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual demo */}
              <div className="bg-slate-50 rounded-xl p-4 mt-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <MousePointer className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-slate-700">Só clicar nas opções em ordem!</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#16A34A10', border: '2px solid #16A34A' }}>
                    <span style={{ color: '#16A34A' }}>+5</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#22C55E10', border: '2px solid #22C55E' }}>
                    <span style={{ color: '#22C55E' }}>+4</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#CA8A0410', border: '2px solid #CA8A04' }}>
                    <span style={{ color: '#CA8A04' }}>+3</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#FACC1510', border: '2px solid #FACC15' }}>
                    <span style={{ color: '#CA8A04' }}>+2</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#EA580C10', border: '2px solid #EA580C' }}>
                    <span style={{ color: '#EA580C' }}>+1</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#DC262610', border: '2px solid #DC2626' }}>
                    <span style={{ color: '#DC2626' }}>0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                <span>💡</span> Dicas importantes
              </h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Responda de forma <strong className="text-slate-800">sincera e espontânea</strong></li>
                <li>• Vá com sua primeira impressão - não pense demais!</li>
                <li>• <strong className="text-slate-800">10 perguntas</strong> • Avança automático ao completar</li>
              </ul>
            </div>

            {/* Botão de início */}
            <Button
              onClick={onStart}
              size="lg"
              className="w-full text-lg py-6 mt-4 gradient-veon hover:opacity-90"
            >
              Começar o Teste
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
