import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, ArrowRight, GripVertical } from 'lucide-react';

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
                Não existem respostas certas ou erradas - cada pessoa valoriza coisas diferentes, e isso é o que nos torna únicos!
              </p>
            </div>

            {/* Como funciona */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Como funciona?
              </h3>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Leia a pergunta</p>
                    <p className="text-sm text-muted-foreground">
                      Você verá uma situação ou pergunta com 6 opções de resposta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Arraste e organize</p>
                    <p className="text-sm text-muted-foreground">
                      Arraste cada opção para um dos três grupos abaixo:
                    </p>
                  </div>
                </div>
              </div>

              {/* Demonstração dos grupos */}
              <div className="grid gap-3 mt-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border-2 border-green-500/30">
                  <GripVertical className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-bold text-green-700 dark:text-green-400">MUITO EU</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      - Coloque aqui as 2 opções que mais têm a ver com você
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border-2 border-yellow-500/30">
                  <GripVertical className="w-5 h-5 text-yellow-600" />
                  <div>
                    <span className="font-bold text-yellow-700 dark:text-yellow-400">MAIS OU MENOS</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      - Coloque aqui as 2 opções que são mais ou menos você
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border-2 border-red-500/30">
                  <GripVertical className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-bold text-red-700 dark:text-red-400">POUCO EU</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      - Coloque aqui as 2 opções que menos têm a ver com você
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start mt-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Avance para a próxima</p>
                  <p className="text-sm text-muted-foreground">
                    Quando todos os grupos estiverem completos (2 opções em cada), clique em "Próxima" para continuar.
                  </p>
                </div>
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                <span>💡</span> Dicas importantes
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Responda de forma <strong className="text-foreground">sincera e espontânea</strong></li>
                <li>• Não pense demais - vá com sua primeira impressão</li>
                <li>• Lembre-se: não há respostas certas ou erradas!</li>
                <li>• O teste tem <strong className="text-foreground">14 perguntas</strong> e leva cerca de 10 minutos</li>
              </ul>
            </div>

            {/* Botão de início */}
            <Button
              onClick={onStart}
              size="lg"
              className="w-full text-lg py-6 mt-4"
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
