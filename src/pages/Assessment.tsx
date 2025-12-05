import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessment, Answer } from '@/context/AssessmentContext';
import { discQuestions } from '@/data/discQuestions';
import { ThumbsUp, ThumbsDown, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Assessment() {
  const navigate = useNavigate();
  const { candidate, addAnswer, answers, calculateProfiles, startTime } = useAssessment();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedMais, setSelectedMais] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [selectedMenos, setSelectedMenos] = useState<'D' | 'I' | 'S' | 'C' | null>(null);

  useEffect(() => {
    if (!candidate || !startTime) {
      navigate('/');
    }
  }, [candidate, startTime, navigate]);

  useEffect(() => {
    // Load existing answer for current question
    const existingAnswer = answers.find(
      (a) => a.questionId === discQuestions[currentQuestion].id
    );
    if (existingAnswer) {
      setSelectedMais(existingAnswer.mais);
      setSelectedMenos(existingAnswer.menos);
    } else {
      setSelectedMais(null);
      setSelectedMenos(null);
    }
  }, [currentQuestion, answers]);

  const question = discQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === discQuestions.length - 1;
  const canProceed = selectedMais && selectedMenos && selectedMais !== selectedMenos;

  const handleSelectMais = (fator: 'D' | 'I' | 'S' | 'C') => {
    if (fator === selectedMenos) {
      setSelectedMenos(null);
    }
    setSelectedMais(fator);
  };

  const handleSelectMenos = (fator: 'D' | 'I' | 'S' | 'C') => {
    if (fator === selectedMais) {
      setSelectedMais(null);
    }
    setSelectedMenos(fator);
  };

  const handleNext = () => {
    if (!canProceed) return;

    const answer: Answer = {
      questionId: question.id,
      mais: selectedMais!,
      menos: selectedMenos!,
      timestamp: Date.now(),
    };
    addAnswer(answer);

    if (isLastQuestion) {
      calculateProfiles();
      navigate('/resultado');
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Shuffle descriptors for each question (but consistently)
  const shuffledDescriptors = [...question.descritores].sort(
    (a, b) => a.texto.localeCompare(b.texto)
  );

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo showText={false} />
          <div className="flex-1 max-w-md mx-4">
            <ProgressBar current={currentQuestion + 1} total={discQuestions.length} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-2xl card-elevated animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-xl sm:text-2xl text-foreground">
              Questão {currentQuestion + 1}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Selecione o descritor que <strong className="text-disc-s">MAIS</strong> e o que{' '}
              <strong className="text-veon-red">MENOS</strong> combina com você
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Legend */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-disc-s" />
                <span className="text-muted-foreground">Mais me descreve</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-veon-red" />
                <span className="text-muted-foreground">Menos me descreve</span>
              </div>
            </div>

            {/* Descriptors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shuffledDescriptors.map((descriptor) => {
                const isMais = selectedMais === descriptor.fator;
                const isMenos = selectedMenos === descriptor.fator;

                return (
                  <div
                    key={descriptor.fator}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all duration-200',
                      isMais && 'border-disc-s bg-disc-s/10 shadow-md',
                      isMenos && 'border-veon-red bg-veon-red/10 shadow-md',
                      !isMais && !isMenos && 'border-border bg-card hover:border-muted-foreground'
                    )}
                  >
                    <div className="text-center mb-3">
                      <span className="font-semibold text-lg text-foreground">
                        {descriptor.texto}
                      </span>
                    </div>

                    <div className="flex justify-center gap-3">
                      <Button
                        variant={isMais ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectMais(descriptor.fator)}
                        className={cn(
                          'flex-1 max-w-[100px]',
                          isMais && 'bg-disc-s hover:bg-disc-s/90 border-disc-s'
                        )}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Mais
                      </Button>
                      <Button
                        variant={isMenos ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectMenos(descriptor.fator)}
                        className={cn(
                          'flex-1 max-w-[100px]',
                          isMenos && 'bg-veon-red hover:bg-veon-red/90 border-veon-red'
                        )}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Menos
                      </Button>
                    </div>

                    {/* Selection indicator */}
                    {(isMais || isMenos) && (
                      <div
                        className={cn(
                          'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center',
                          isMais && 'bg-disc-s',
                          isMenos && 'bg-veon-red'
                        )}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  'gap-2 min-w-[140px]',
                  canProceed && 'gradient-veon hover:opacity-90'
                )}
              >
                {isLastQuestion ? 'Finalizar' : 'Próxima'}
                {isLastQuestion ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>

            {!canProceed && (selectedMais || selectedMenos) && (
              <p className="text-center text-sm text-muted-foreground">
                Selecione um descritor diferente para "Mais" e "Menos"
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
