import { useState, useEffect } from 'react';
import { SprangerQuestion as SprangerQuestionType, SprangerOption } from '@/data/sprangerQuestions';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SprangerQuestionProps {
  question: SprangerQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (ranking: string[]) => void; // Array ordenado do 1º ao 6º lugar
  onBack?: () => void;
  initialAnswer?: string[]; // Array ordenado do 1º ao 6º lugar
  totalGlobalQuestions?: number;
  globalQuestionNumber?: number;
}

// Cores para cada posição do ranking (6 posições)
const RANKING_COLORS = {
  1: { bg: '#22C55E', label: '1º - Mais combina', short: '1º', points: '+5' },
  2: { bg: '#4ADE80', label: '2º lugar', short: '2º', points: '+4' },
  3: { bg: '#84CC16', label: '3º lugar', short: '3º', points: '+3' },
  4: { bg: '#EAB308', label: '4º lugar', short: '4º', points: '+2' },
  5: { bg: '#F97316', label: '5º lugar', short: '5º', points: '+1' },
  6: { bg: '#EF4444', label: '6º - Menos combina', short: '6º', points: '0' },
};

export function SprangerQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  initialAnswer,
  totalGlobalQuestions = 35,
  globalQuestionNumber,
}: SprangerQuestionProps) {
  const [ranking, setRanking] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Calculate global progress (DISC + Spranger)
  const actualGlobalQuestion = globalQuestionNumber || (25 + questionNumber);
  const globalProgress = ((actualGlobalQuestion - 1) / totalGlobalQuestions) * 100;

  // Initialize or reset when question changes
  useEffect(() => {
    // Reset transitioning state first
    setIsTransitioning(false);

    if (initialAnswer && initialAnswer.length === 6) {
      setRanking(initialAnswer);
    } else {
      setRanking([]);
    }
  }, [question.id]);

  // Get current stage info
  const getCurrentStageInfo = () => {
    const position = ranking.length + 1;
    if (position > 6) {
      return { title: 'COMPLETO', color: '#22C55E', position: 0 };
    }
    const info = RANKING_COLORS[position as keyof typeof RANKING_COLORS];
    return {
      title: `SELECIONE O ${info.label.toUpperCase()}`,
      color: info.bg,
      position,
    };
  };

  const stageInfo = getCurrentStageInfo();

  // Check if option is already selected
  const getOptionRanking = (optionId: string): number | null => {
    const index = ranking.indexOf(optionId);
    return index >= 0 ? index + 1 : null;
  };

  // Handle option click
  const handleOptionClick = (option: SprangerOption) => {
    if (ranking.length >= 6 || isTransitioning) return;
    if (ranking.includes(option.id)) return;

    const newRanking = [...ranking, option.id];
    setRanking(newRanking);

    // Check if complete (6 selections)
    if (newRanking.length === 6) {
      setIsTransitioning(true);
      // Auto advance after short delay for visual feedback
      setTimeout(() => {
        try {
          onAnswer(newRanking);
        } catch (error) {
          console.error('Error advancing to next question:', error);
          setIsTransitioning(false);
        }
      }, 400);
    }
  };

  // Function to clear answers
  const handleClearAnswers = () => {
    setRanking([]);
    setIsTransitioning(false);
  };

  // Get style for option
  const getOptionStyle = (option: SprangerOption) => {
    const position = getOptionRanking(option.id);

    if (position) {
      const color = RANKING_COLORS[position as keyof typeof RANKING_COLORS];
      return {
        borderColor: color.bg,
        backgroundColor: `${color.bg}20`,
        selected: true,
        color: color.bg,
        position,
      };
    }

    // Not selected - show current stage color
    if (ranking.length >= 6) {
      return {
        borderColor: '#475569',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        selected: false,
        color: '#9ca3af',
        position: null,
      };
    }

    return {
      borderColor: stageInfo.color,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      selected: false,
      color: stageInfo.color,
      position: null,
    };
  };

  // Sort options: selected ones first by ranking position, then unselected
  const sortedOptions = [...question.opcoes].sort((a, b) => {
    const posA = getOptionRanking(a.id);
    const posB = getOptionRanking(b.id);

    if (posA && posB) return posA - posB;
    if (posA) return -1;
    if (posB) return 1;
    return 0;
  });

  return (
    <div
      className={cn(
        "min-h-screen transition-opacity duration-300",
        isTransitioning ? "opacity-50" : "opacity-100"
      )}
      style={{
        backgroundColor: '#0F172A',
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 35px,
          rgba(30, 41, 59, 0.3) 35px,
          rgba(30, 41, 59, 0.3) 36px
        )`,
      }}
    >
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo showText={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Pergunta {actualGlobalQuestion} de {totalGlobalQuestions}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(globalProgress)}% completo
            </span>
          </div>
          <Progress value={globalProgress} className="h-2" />
          <p className="text-xs text-slate-500 mt-1">
            Teste de Valores • Pergunta {questionNumber} de {totalQuestions}
          </p>
        </div>

        {/* Stage indicator */}
        <div
          className="rounded-xl p-4 mb-6 text-center transition-all duration-300"
          style={{
            backgroundColor: `${stageInfo.color}15`,
            borderLeft: `4px solid ${stageInfo.color}`,
          }}
        >
          <h2
            className="text-lg font-bold mb-1"
            style={{ color: stageInfo.color }}
          >
            {stageInfo.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {ranking.length}/6 selecionados
          </p>
        </div>

        {/* Question */}
        <div className="bg-slate-800/80 rounded-xl p-6 shadow-lg mb-6 backdrop-blur-sm">
          <h3 className="text-xl font-display font-bold text-white">
            {question.pergunta}
          </h3>
        </div>

        {/* Options with auto-reorganization - selected ones move to top */}
        <div className="flex flex-col gap-3 mb-6">
          {sortedOptions.map((option) => {
            const style = getOptionStyle(option);
            const isSelectable = !style.selected && ranking.length < 6;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                disabled={!isSelectable || isTransitioning}
                className={cn(
                  "relative p-4 rounded-xl text-left transition-all duration-300 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isSelectable && "hover:scale-[1.02] hover:shadow-lg cursor-pointer",
                  !isSelectable && "cursor-default",
                  style.selected && "shadow-md"
                )}
                style={{
                  borderColor: style.borderColor,
                  backgroundColor: style.backgroundColor,
                  borderWidth: style.selected ? '3px' : '2px',
                  borderStyle: 'solid',
                  color: '#0F172A',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                }}
              >
                <span className="text-sm font-medium leading-tight block">
                  {option.texto}
                </span>

                {/* Selection indicator with position */}
                {style.selected && style.position && (
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-in zoom-in duration-200"
                    style={{ backgroundColor: style.color }}
                  >
                    {style.position}º
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection summary - ranking legend */}
        <div className="bg-slate-800/80 rounded-xl p-4 shadow-lg mb-6 backdrop-blur-sm">
          <div className="grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, 6].map((pos) => {
              const color = RANKING_COLORS[pos as keyof typeof RANKING_COLORS];
              const isSelected = ranking.length >= pos;
              return (
                <div key={pos} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: isSelected ? color.bg : '#475569' }}
                  >
                    {pos}º
                  </div>
                  <span className="text-xs text-slate-400 text-center">
                    {color.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Back button */}
          {onBack ? (
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {/* Clear button */}
          {ranking.length > 0 && (
            <Button
              variant="ghost"
              onClick={handleClearAnswers}
              className="gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
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
