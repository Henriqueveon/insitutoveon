import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAssessment, Answer } from '@/context/AssessmentContext';
import { discQuestions } from '@/data/discQuestions';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cores definidas (mais fortes)
const COLORS = {
  green: '#16A34A',
  red: '#DC2626',
};

type SelectionStage = 'mais' | 'menos' | 'complete';

export default function Assessment() {
  const navigate = useNavigate();
  const { addAnswer, answers, calculateProfiles, setStartTime } = useAssessment();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedMais, setSelectedMais] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [selectedMenos, setSelectedMenos] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [currentStage, setCurrentStage] = useState<SelectionStage>('mais');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalGlobalQuestions = 46; // 25 DISC + 6 Situacionais + 15 Valores
  const globalProgress = (currentQuestion / totalGlobalQuestions) * 100;

  // Initialize start time when component mounts
  useEffect(() => {
    setStartTime(Date.now());
  }, [setStartTime]);

  // Load existing answer for current question
  useEffect(() => {
    const existingAnswer = answers.find(
      (a) => a.questionId === discQuestions[currentQuestion].id
    );
    if (existingAnswer) {
      setSelectedMais(existingAnswer.mais);
      setSelectedMenos(existingAnswer.menos);
      setCurrentStage('complete');
    } else {
      setSelectedMais(null);
      setSelectedMenos(null);
      setCurrentStage('mais');
    }
    setIsTransitioning(false);
  }, [currentQuestion, answers]);

  const question = discQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === discQuestions.length - 1;

  // Auto-advance when both selections are made
  const handleAutoAdvance = useCallback(() => {
    if (selectedMais && selectedMenos && selectedMais !== selectedMenos && !isTransitioning && currentStage !== 'complete') {
      setIsTransitioning(true);
      setCurrentStage('complete');

      const answer: Answer = {
        questionId: question.id,
        mais: selectedMais,
        menos: selectedMenos,
        timestamp: Date.now(),
      };
      addAnswer(answer);

      // Auto advance after short delay for visual feedback
      setTimeout(() => {
        try {
          if (isLastQuestion) {
            // Don't calculate profiles yet - go to situational test first
            navigate('/teste-situacional');
          } else {
            setCurrentQuestion((prev) => prev + 1);
          }
        } catch (error) {
          console.error('Error advancing to next question:', error);
          setIsTransitioning(false);
        }
      }, 400);
    }
  }, [selectedMais, selectedMenos, isTransitioning, currentStage, question.id, isLastQuestion, addAnswer, calculateProfiles, navigate]);

  // Watch for complete selection
  useEffect(() => {
    handleAutoAdvance();
  }, [handleAutoAdvance]);

  const handleSelect = (fator: 'D' | 'I' | 'S' | 'C') => {
    if (isTransitioning) return;

    if (currentStage === 'mais') {
      setSelectedMais(fator);
      setCurrentStage('menos');
    } else if (currentStage === 'menos') {
      if (fator === selectedMais) {
        // Can't select same as MAIS
        return;
      }
      setSelectedMenos(fator);
      // Auto-advance will trigger via useEffect
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // CORREÇÃO 1: Função para limpar respostas da pergunta atual
  const handleClearAnswers = () => {
    setSelectedMais(null);
    setSelectedMenos(null);
    setCurrentStage('mais');
    setIsTransitioning(false);
  };

  // Get stage info
  const getStageInfo = () => {
    switch (currentStage) {
      case 'mais':
        return {
          title: 'SELECIONE O QUE MAIS COMBINA COM VOCÊ',
          color: COLORS.green,
        };
      case 'menos':
        return {
          title: 'AGORA SELECIONE O QUE MENOS COMBINA',
          color: COLORS.red,
        };
      default:
        return {
          title: 'COMPLETO',
          color: COLORS.green,
        };
    }
  };

  const stageInfo = getStageInfo();

  // Shuffle descriptors for each question (but consistently)
  const shuffledDescriptors = [...question.descritores].sort(
    (a, b) => a.texto.localeCompare(b.texto)
  );

  return (
    <div
      className={cn(
        "min-h-screen transition-opacity duration-300",
        isTransitioning ? "opacity-50" : "opacity-100"
      )}
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
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Pergunta {currentQuestion + 1} de {totalGlobalQuestions}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(globalProgress)}% completo
            </span>
          </div>
          <Progress value={globalProgress} className="h-2" />
          <p className="text-xs text-slate-400 mt-1">
            Teste DISC • Pergunta {currentQuestion + 1} de {discQuestions.length}
          </p>
        </div>

        {/* Stage indicator */}
        <div
          className="rounded-xl p-4 mb-6 text-center transition-all duration-300"
          style={{
            backgroundColor: `${stageInfo.color}10`,
            borderLeft: `4px solid ${stageInfo.color}`,
          }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: stageInfo.color }}
          >
            {stageInfo.title}
          </h2>
        </div>

        {/* Descriptors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {shuffledDescriptors.map((descriptor) => {
            const isMais = selectedMais === descriptor.fator;
            const isMenos = selectedMenos === descriptor.fator;
            const isSelected = isMais || isMenos;
            const isDisabled = (currentStage === 'menos' && isMais) || currentStage === 'complete';

            // Determine border color
            let borderColor = '#E2E8F0';
            let backgroundColor = '#F8FAFC';
            let textColor = '#1E293B';

            if (isMais) {
              borderColor = COLORS.green;
              backgroundColor = COLORS.green;
              textColor = '#FFFFFF';
            } else if (isMenos) {
              borderColor = COLORS.red;
              backgroundColor = COLORS.red;
              textColor = '#FFFFFF';
            } else if (currentStage === 'complete') {
              borderColor = '#CBD5E1';
              backgroundColor = '#F1F5F9';
            } else {
              // Hover state color hint
              borderColor = stageInfo.color;
            }

            return (
              <button
                key={descriptor.fator}
                onClick={() => handleSelect(descriptor.fator)}
                disabled={isDisabled || isTransitioning}
                className={cn(
                  'relative p-5 rounded-xl text-center transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  !isDisabled && !isSelected && 'hover:scale-[1.02] hover:shadow-md cursor-pointer',
                  isDisabled && 'cursor-default opacity-60',
                  isSelected && 'shadow-lg transform scale-[1.02]'
                )}
                style={{
                  borderColor,
                  backgroundColor,
                  borderWidth: isSelected ? '3px' : '2px',
                  borderStyle: 'solid',
                  color: textColor,
                  boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                <span className="font-semibold text-lg">
                  {descriptor.texto}
                </span>

                {/* Selection indicator */}
                {isSelected && (
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md animate-in zoom-in duration-200"
                    style={{ backgroundColor: isMais ? '#15803D' : '#B91C1C' }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection summary */}
        <div className="bg-slate-50 rounded-xl p-4 shadow-sm mb-6 border border-slate-200">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedMais ? COLORS.green : '#E2E8F0' }}
              >
                {selectedMais && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-slate-600">Mais combina</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedMenos ? COLORS.red : '#E2E8F0' }}
              >
                {selectedMenos && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-slate-600">Menos combina</span>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Back button */}
          {currentQuestion > 0 ? (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {/* Clear button - CORREÇÃO 1 */}
          {(selectedMais || selectedMenos) && (
            <Button
              variant="ghost"
              onClick={handleClearAnswers}
              className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar Respostas
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
