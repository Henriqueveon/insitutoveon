import { useState, useEffect } from 'react';
import { SprangerQuestion as SprangerQuestionType, SprangerOption } from '@/data/sprangerQuestions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SprangerQuestionProps {
  question: SprangerQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (ranking: string[]) => void; // Array ordenado do 1º ao 4º lugar
  onBack?: () => void;
  initialAnswer?: string[]; // Array ordenado do 1º ao 4º lugar
  totalGlobalQuestions?: number;
  globalQuestionNumber?: number;
}

// Cores para cada posição do ranking
const RANKING_COLORS = {
  1: { bg: '#22C55E', label: '1º - Mais combina', short: '1º' },
  2: { bg: '#84CC16', label: '2º lugar', short: '2º' },
  3: { bg: '#EAB308', label: '3º lugar', short: '3º' },
  4: { bg: '#EF4444', label: '4º - Menos combina', short: '4º' },
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
    if (initialAnswer && initialAnswer.length === 4) {
      setRanking(initialAnswer);
    } else {
      setRanking([]);
    }
    setIsTransitioning(false);
  }, [question.id, initialAnswer]);

  // Get current stage info
  const getCurrentStageInfo = () => {
    const position = ranking.length + 1;
    if (position > 4) {
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
    if (ranking.length >= 4 || isTransitioning) return;
    if (ranking.includes(option.id)) return;

    const newRanking = [...ranking, option.id];
    setRanking(newRanking);

    // Check if complete (4 selections)
    if (newRanking.length === 4) {
      setIsTransitioning(true);
      // Auto advance after short delay for visual feedback
      setTimeout(() => {
        onAnswer(newRanking);
      }, 400);
    }
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
    if (ranking.length >= 4) {
      return {
        borderColor: '#e5e7eb',
        backgroundColor: 'transparent',
        selected: false,
        color: '#9ca3af',
        position: null,
      };
    }

    return {
      borderColor: stageInfo.color,
      backgroundColor: 'transparent',
      selected: false,
      color: stageInfo.color,
      position: null,
    };
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-6 px-4",
      "transition-opacity duration-300",
      isTransitioning ? "opacity-50" : "opacity-100"
    )}>
      <div className="max-w-2xl mx-auto">
        {/* Header with global progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Pergunta {actualGlobalQuestion} de {totalGlobalQuestions}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(globalProgress)}% completo
            </span>
          </div>
          <Progress value={globalProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
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
            {ranking.length}/4 selecionados
          </p>
        </div>

        {/* Question */}
        <div className="bg-card rounded-xl p-6 shadow-lg mb-6">
          <h3 className="text-xl font-display font-bold text-foreground">
            {question.pergunta}
          </h3>
        </div>

        {/* Options - 2x2 grid for 4 options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {question.opcoes.map((option) => {
            const style = getOptionStyle(option);
            const isSelectable = !style.selected && ranking.length < 4;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                disabled={!isSelectable || isTransitioning}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isSelectable && "hover:scale-[1.02] hover:shadow-lg cursor-pointer",
                  !isSelectable && "cursor-default",
                  style.selected && "shadow-md transform scale-[1.02]"
                )}
                style={{
                  borderColor: style.borderColor,
                  backgroundColor: style.backgroundColor,
                  borderWidth: style.selected ? '3px' : '2px',
                }}
              >
                <span className={cn(
                  "text-sm font-medium leading-tight block",
                  "text-foreground"
                )}>
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
        <div className="bg-card rounded-xl p-4 shadow-lg mb-6">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((pos) => {
              const color = RANKING_COLORS[pos as keyof typeof RANKING_COLORS];
              const isSelected = ranking.length >= pos;
              return (
                <div key={pos} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: isSelected ? color.bg : '#e5e7eb' }}
                  >
                    {pos}º
                  </div>
                  <span className="text-xs text-muted-foreground text-center">
                    {pos === 1 ? '+3' : pos === 2 ? '+2' : pos === 3 ? '+1' : '0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation - only back button */}
        {onBack && (
          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
