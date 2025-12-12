import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAssessment, SituationalAnswer } from '@/context/AssessmentContext';
import { discSituationalQuestions, discQuestions, controlItems, ControlItem } from '@/data/discQuestions';
import { ControlQuestion } from '@/components/test/ControlQuestion';
import { ArrowLeft, Briefcase, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Control questions inserted at specific positions in situational test
const CONTROL_POSITIONS: { afterSituationalQuestion: number; controlId: number }[] = [
  { afterSituationalQuestion: 5, controlId: 203 }, // Consistency check after Q5
  { afterSituationalQuestion: 8, controlId: 204 }, // Social desirability 2 after Q8
];

export default function SituationalTest() {
  const navigate = useNavigate();
  const {
    answers,
    situationalAnswers,
    addSituationalAnswer,
    calculateProfiles,
    addControlAnswer,
    addQuestionTime,
  } = useAssessment();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Control question state
  const [showControlQuestion, setShowControlQuestion] = useState(false);
  const [currentControlItem, setCurrentControlItem] = useState<ControlItem | null>(null);

  // Time tracking
  const questionStartTime = useRef<number>(Date.now());

  // Total: 25 DISC + 10 Situacionais + 8 Spranger + 4 Controles = 47 perguntas
  const totalGlobalQuestions = 47;
  // 25 DISC + 2 controls in DISC = 27 questions before situational
  const baseProgress = 27;
  const controlsShownSoFar = CONTROL_POSITIONS.filter(cp => currentQuestion >= cp.afterSituationalQuestion).length;
  const globalProgress = ((baseProgress + currentQuestion + controlsShownSoFar) / totalGlobalQuestions) * 100;

  // Redirect if DISC test not completed (check if all 25 DISC questions answered)
  useEffect(() => {
    if (answers.length < discQuestions.length) {
      navigate('/teste');
    }
  }, [answers, navigate]);

  // Reset question start time when question changes
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentQuestion, showControlQuestion]);

  // Load existing answer for current question
  useEffect(() => {
    if (showControlQuestion) return;

    const existingAnswer = situationalAnswers.find(
      (a) => a.questionId === discSituationalQuestions[currentQuestion].id
    );
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selected);
    } else {
      setSelectedOption(null);
    }
    setIsTransitioning(false);
  }, [currentQuestion, situationalAnswers, showControlQuestion]);

  // Check if we need to show a control question after current question
  const checkForControlQuestion = useCallback((nextQuestionIndex: number) => {
    const controlPosition = CONTROL_POSITIONS.find(
      cp => cp.afterSituationalQuestion === nextQuestionIndex
    );

    if (controlPosition) {
      const control = controlItems.find(c => c.id === controlPosition.controlId);
      if (control) {
        setCurrentControlItem(control);
        setShowControlQuestion(true);
        return true;
      }
    }
    return false;
  }, []);

  // Handle control question answer
  const handleControlAnswer = useCallback((controlId: number, selectedFlag: string) => {
    // Track time spent on control question
    const timeSpent = Date.now() - questionStartTime.current;
    addQuestionTime({
      questionId: controlId,
      questionType: 'control',
      timeSpentMs: timeSpent,
    });

    // Save control answer
    addControlAnswer({
      controlId,
      selectedFlag,
      timestamp: Date.now(),
    });

    // Hide control question and continue
    setShowControlQuestion(false);
    setCurrentControlItem(null);

    // Check if this was the last situational question
    if (currentQuestion === discSituationalQuestions.length - 1) {
      calculateProfiles();
      navigate('/teste-valores');
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [addControlAnswer, addQuestionTime, currentQuestion, calculateProfiles, navigate]);

  const question = discSituationalQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === discSituationalQuestions.length - 1;

  const handleSelect = (fator: 'D' | 'I' | 'S' | 'C') => {
    if (isTransitioning) return;

    setSelectedOption(fator);
    setIsTransitioning(true);

    // Track time spent on this question
    const timeSpent = Date.now() - questionStartTime.current;
    addQuestionTime({
      questionId: question.id,
      questionType: 'situational',
      timeSpentMs: timeSpent,
    });

    const answer: SituationalAnswer = {
      questionId: question.id,
      selected: fator,
      timestamp: Date.now(),
    };
    addSituationalAnswer(answer);

    // Auto advance after short delay
    setTimeout(() => {
      // Check if we need to show a control question before advancing
      const shouldShowControl = checkForControlQuestion(currentQuestion + 1);

      if (shouldShowControl) {
        setIsTransitioning(false);
        return;
      }

      if (isLastQuestion) {
        calculateProfiles();
        navigate('/teste-valores');
      } else {
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 400);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      // Go back to DISC test
      navigate('/teste');
    }
  };

  // Shuffle options for each question (but consistently)
  const shuffledOptions = [...question.opcoes].sort(
    (a, b) => a.texto.localeCompare(b.texto)
  );

  // Render control question if active
  if (showControlQuestion && currentControlItem) {
    return (
      <ControlQuestion
        controlItem={currentControlItem}
        questionNumber={baseProgress + currentQuestion + controlsShownSoFar + 1}
        totalQuestions={totalGlobalQuestions}
        globalProgress={globalProgress}
        onAnswer={handleControlAnswer}
      />
    );
  }

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
              Pergunta {25 + currentQuestion + 1} de {totalGlobalQuestions}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(globalProgress)}% completo
            </span>
          </div>
          <Progress value={globalProgress} className="h-2" />
          <p className="text-xs text-slate-400 mt-1">
            Teste Situacional • Pergunta {currentQuestion + 1} de {discSituationalQuestions.length}
          </p>
        </div>

        {/* Context indicator */}
        <div
          className="rounded-xl p-4 mb-4 text-center"
          style={{
            backgroundColor: '#EFF6FF',
            borderLeft: '4px solid #3B82F6',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {question.contexto}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            {question.situacao}
          </h2>
        </div>

        {/* Instruction */}
        <p className="text-center text-slate-500 text-sm mb-6">
          Escolha a opção que melhor descreve como você agiria no trabalho
        </p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {shuffledOptions.map((opcao) => {
            const isSelected = selectedOption === opcao.fator;

            return (
              <button
                key={opcao.fator}
                onClick={() => handleSelect(opcao.fator)}
                disabled={isTransitioning}
                className={cn(
                  'relative w-full p-4 rounded-xl text-left transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  !isSelected && 'hover:scale-[1.01] hover:shadow-md cursor-pointer',
                  isSelected && 'shadow-lg transform scale-[1.01]'
                )}
                style={{
                  borderColor: isSelected ? '#3B82F6' : '#E2E8F0',
                  backgroundColor: isSelected ? '#3B82F6' : '#F8FAFC',
                  borderWidth: isSelected ? '3px' : '2px',
                  borderStyle: 'solid',
                  color: isSelected ? '#FFFFFF' : '#1E293B',
                }}
              >
                <span className="font-medium text-base">
                  {opcao.texto}
                </span>

                {/* Selection indicator */}
                {isSelected && (
                  <div
                    className="absolute top-1/2 right-4 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md animate-in zoom-in duration-200"
                    style={{ backgroundColor: '#1D4ED8' }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div />
        </div>
      </main>
    </div>
  );
}
