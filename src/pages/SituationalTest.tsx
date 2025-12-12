import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAssessment, SituationalAnswer } from '@/context/AssessmentContext';
import { discSituationalQuestions } from '@/data/discQuestions';
import { ArrowLeft, Briefcase, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SituationalTest() {
  const navigate = useNavigate();
  const {
    naturalProfile,
    situationalAnswers,
    addSituationalAnswer,
    calculateProfiles
  } = useAssessment();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Total: 25 DISC + 6 Situacionais + 15 Spranger = 46 perguntas
  const totalGlobalQuestions = 46;
  const globalProgress = ((25 + currentQuestion) / totalGlobalQuestions) * 100;

  // Redirect if DISC test not completed
  useEffect(() => {
    if (!naturalProfile) {
      navigate('/teste');
    }
  }, [naturalProfile, navigate]);

  // Load existing answer for current question
  useEffect(() => {
    const existingAnswer = situationalAnswers.find(
      (a) => a.questionId === discSituationalQuestions[currentQuestion].id
    );
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selected);
    } else {
      setSelectedOption(null);
    }
    setIsTransitioning(false);
  }, [currentQuestion, situationalAnswers]);

  const question = discSituationalQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === discSituationalQuestions.length - 1;

  const handleSelect = (fator: 'D' | 'I' | 'S' | 'C') => {
    if (isTransitioning) return;

    setSelectedOption(fator);
    setIsTransitioning(true);

    const answer: SituationalAnswer = {
      questionId: question.id,
      selected: fator,
      timestamp: Date.now(),
    };
    addSituationalAnswer(answer);

    // Auto advance after short delay
    setTimeout(() => {
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
