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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo showText={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💎</span>
            </div>
            <CardTitle className="text-2xl font-display text-white">
              Teste de Valores Motivacionais
            </CardTitle>
            <CardDescription className="text-base text-slate-400">
              Descubra o que realmente te motiva na vida
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Introdução */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/80 leading-relaxed">
                Este teste vai te ajudar a entender <strong className="text-white">quais valores são mais importantes para você</strong>.
                Não existem respostas certas ou erradas - cada pessoa valoriza coisas diferentes!
              </p>
            </div>

            {/* Como funciona */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Como funciona? Ordene as 6 opções!
              </h3>

              <div className="space-y-3">
                {/* Etapa 1 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#22C55E' }}
                  >
                    1º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#22C55E' }}>
                      O que MAIS combina com você (+5 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 2 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#4ADE80' }}
                  >
                    2º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#4ADE80' }}>
                      Segunda opção (+4 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 3 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#84CC16' }}
                  >
                    3º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#84CC16' }}>
                      Terceira opção (+3 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 4 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#EAB308' }}
                  >
                    4º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#EAB308' }}>
                      Quarta opção (+2 pts)
                    </p>
                  </div>
                </div>

                {/* Etapa 5 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#F97316' }}
                  >
                    5º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#F97316' }}>
                      Quinta opção (+1 pt)
                    </p>
                  </div>
                </div>

                {/* Etapa 6 */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    6º
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#EF4444' }}>
                      O que MENOS combina (0 pts) - Avança automático!
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual demo */}
              <div className="bg-white/10 rounded-xl p-4 mt-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <MousePointer className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-white">Só clicar nas opções em ordem!</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#22C55E20', border: '2px solid #22C55E' }}>
                    <span style={{ color: '#22C55E' }}>+5</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#4ADE8020', border: '2px solid #4ADE80' }}>
                    <span style={{ color: '#4ADE80' }}>+4</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#84CC1620', border: '2px solid #84CC16' }}>
                    <span style={{ color: '#84CC16' }}>+3</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#EAB30820', border: '2px solid #EAB308' }}>
                    <span style={{ color: '#EAB308' }}>+2</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#F9731620', border: '2px solid #F97316' }}>
                    <span style={{ color: '#F97316' }}>+1</span>
                  </div>
                  <div className="p-1.5 rounded-lg text-center text-xs" style={{ backgroundColor: '#EF444420', border: '2px solid #EF4444' }}>
                    <span style={{ color: '#EF4444' }}>0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-amber-500/15 rounded-xl p-4 border border-amber-500/30">
              <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <span>💡</span> Dicas importantes
              </h4>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Responda de forma <strong className="text-white">sincera e espontânea</strong></li>
                <li>• Vá com sua primeira impressão - não pense demais!</li>
                <li>• <strong className="text-white">10 perguntas</strong> • Avança automático ao completar</li>
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
