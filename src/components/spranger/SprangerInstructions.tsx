import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, ArrowRight, MousePointer } from 'lucide-react';

interface SprangerInstructionsProps {
  onStart: () => void;
}

export function SprangerInstructions({ onStart }: SprangerInstructionsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-2">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💎</span>
            </div>
            <CardTitle className="text-2xl font-display">
              Teste de Valores Motivacionais
            </CardTitle>
            <CardDescription className="text-base">
              Descubra o que realmente te motiva na vida
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Introdução */}
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Este teste vai te ajudar a entender <strong className="text-foreground">quais valores são mais importantes para você</strong>.
                Não existem respostas certas ou erradas - cada pessoa valoriza coisas diferentes!
              </p>
            </div>

            {/* Como funciona */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Como funciona? É simples!
              </h3>

              <div className="space-y-4">
                {/* Etapa 1 - Verde */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: '#22C55E' }}
                  >
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground" style={{ color: '#22C55E' }}>
                      Clique nas 2 que MAIS combinam com você
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Opções com borda verde - escolha as 2 que mais têm a ver com você
                    </p>
                  </div>
                </div>

                {/* Etapa 2 - Amarelo */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: '#EAB308' }}
                  >
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: '#EAB308' }}>
                      Clique nas 2 que são MAIS OU MENOS você
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Opções restantes ficam amarelas - escolha 2 neutras
                    </p>
                  </div>
                </div>

                {/* Etapa 3 - Vermelho */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: '#EF4444' }}>
                      As 2 últimas são as que MENOS combinam
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Clique nas últimas opções e avança automaticamente!
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual demo */}
              <div className="bg-muted/30 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MousePointer className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Só clicar nas opções!</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg text-center text-xs" style={{ backgroundColor: '#22C55E20', border: '2px solid #22C55E' }}>
                    <span style={{ color: '#22C55E' }}>Mais combina</span>
                  </div>
                  <div className="p-2 rounded-lg text-center text-xs" style={{ backgroundColor: '#EAB30820', border: '2px solid #EAB308' }}>
                    <span style={{ color: '#EAB308' }}>Neutro</span>
                  </div>
                  <div className="p-2 rounded-lg text-center text-xs" style={{ backgroundColor: '#EF444420', border: '2px solid #EF4444' }}>
                    <span style={{ color: '#EF4444' }}>Menos combina</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                <span>💡</span> Dicas importantes
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Responda de forma <strong className="text-foreground">sincera e espontânea</strong></li>
                <li>• Vá com sua primeira impressão - não pense demais!</li>
                <li>• <strong className="text-foreground">14 perguntas</strong> • Avança automático ao completar</li>
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
    </div>
  );
}
