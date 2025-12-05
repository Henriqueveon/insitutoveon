import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessment } from '@/context/AssessmentContext';
import { CheckCircle2, ArrowRight, Target, Users, BarChart3, Shield } from 'lucide-react';

export default function Instructions() {
  const navigate = useNavigate();
  const { candidate, setStartTime } = useAssessment();

  useEffect(() => {
    if (!candidate) {
      navigate('/');
    }
  }, [candidate, navigate]);

  const handleStart = () => {
    setStartTime(Date.now());
    navigate('/teste');
  };

  const discFactors = [
    { letter: 'D', name: 'Dominância', color: 'bg-disc-d', description: 'Foco em resultados e desafios' },
    { letter: 'I', name: 'Influência', color: 'bg-disc-i', description: 'Foco em pessoas e comunicação' },
    { letter: 'S', name: 'Estabilidade', color: 'bg-disc-s', description: 'Foco em cooperação e harmonia' },
    { letter: 'C', name: 'Conformidade', color: 'bg-disc-c', description: 'Foco em qualidade e precisão' },
  ];

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Card */}
          <Card className="card-elevated animate-slide-up">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl sm:text-3xl text-foreground">
                Bem-vindo(a) à sua Análise de Perfil Comportamental
                <span className="text-gradient-veon"> DISC</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                A metodologia DISC é uma ferramenta de autoconhecimento que identifica padrões de comportamento. 
                Não existem respostas certas ou erradas — o objetivo é conhecer melhor seu estilo comportamental 
                no ambiente profissional.
              </p>

              {/* DISC Factors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {discFactors.map((factor, index) => (
                  <div
                    key={factor.letter}
                    className="text-center p-4 rounded-xl bg-accent/50 border border-border hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-12 h-12 ${factor.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-md`}>
                      <span className="text-white font-bold text-xl">{factor.letter}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{factor.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{factor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="card-elevated animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Instruções do Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <CheckCircle2 className="w-5 h-5 text-disc-s mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">
                    O teste consiste em <strong>25 conjuntos</strong> de 4 descritores cada.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <CheckCircle2 className="w-5 h-5 text-disc-s mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">
                    Para cada conjunto, escolha <strong>apenas um</strong> descritor que <strong>MAIS</strong> combina com você.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <CheckCircle2 className="w-5 h-5 text-disc-s mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">
                    E escolha <strong>apenas um</strong> descritor que <strong>MENOS</strong> combina com você.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <CheckCircle2 className="w-5 h-5 text-disc-s mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">
                    Responda pensando no seu comportamento no <strong>ambiente de trabalho</strong>.
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Dicas Importantes
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Responda de forma <strong>sincera e espontânea</strong></li>
                  <li>• Não existe certo ou errado — seja autêntico</li>
                  <li>• O tempo médio é de <strong>10-15 minutos</strong></li>
                  <li>• Seus dados são confidenciais e protegidos</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Button
              onClick={handleStart}
              size="lg"
              className="h-14 px-10 text-lg font-semibold gradient-veon hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
            >
              Iniciar Teste
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
