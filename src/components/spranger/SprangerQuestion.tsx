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
  onAnswer: (muitoEu: string[], maisOuMenos: string[], poucoEu: string[]) => void;
  onBack?: () => void;
  initialAnswer?: {
    muitoEu: string[];
    maisOuMenos: string[];
    poucoEu: string[];
  };
  totalGlobalQuestions?: number;
  globalQuestionNumber?: number;
}

// Cores definidas
const COLORS = {
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
};

type SelectionStage = 'green' | 'yellow' | 'red' | 'complete';

interface Selection {
  id: string;
  stage: 'green' | 'yellow' | 'red';
}

export function SprangerQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  initialAnswer,
  totalGlobalQuestions = 39,
  globalQuestionNumber,
}: SprangerQuestionProps) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [currentStage, setCurrentStage] = useState<SelectionStage>('green');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Calculate global progress (DISC + Spranger)
  const actualGlobalQuestion = globalQuestionNumber || (25 + questionNumber);
  const globalProgress = ((actualGlobalQuestion - 1) / totalGlobalQuestions) * 100;

  // Initialize or reset when question changes
  useEffect(() => {
    if (initialAnswer) {
      const newSelections: Selection[] = [];
      initialAnswer.muitoEu.forEach(id => newSelections.push({ id, stage: 'green' }));
      initialAnswer.maisOuMenos.forEach(id => newSelections.push({ id, stage: 'yellow' }));
      initialAnswer.poucoEu.forEach(id => newSelections.push({ id, stage: 'red' }));
      setSelections(newSelections);

      // Determine current stage based on selections
      if (newSelections.length >= 6) {
        setCurrentStage('complete');
      } else if (newSelections.filter(s => s.stage === 'green').length >= 2) {
        if (newSelections.filter(s => s.stage === 'yellow').length >= 2) {
          setCurrentStage('red');
        } else {
          setCurrentStage('yellow');
        }
      } else {
        setCurrentStage('green');
      }
    } else {
      setSelections([]);
      setCurrentStage('green');
    }
    setIsTransitioning(false);
  }, [question.id, initialAnswer]);

  // Get stage info
  const getStageInfo = () => {
    switch (currentStage) {
      case 'green':
        return {
          title: 'SELECIONE O QUE MAIS COMBINA COM VOCÊ',
          subtitle: 'Escolha 2 opções',
          color: COLORS.green,
          needed: 2,
          current: selections.filter(s => s.stage === 'green').length,
        };
      case 'yellow':
        return {
          title: 'O QUE MAIS OU MENOS COMBINA COM VOCÊ',
          subtitle: 'Escolha 2 opções',
          color: COLORS.yellow,
          needed: 2,
          current: selections.filter(s => s.stage === 'yellow').length,
        };
      case 'red':
        return {
          title: 'O QUE MENOS COMBINA COM VOCÊ',
          subtitle: 'Escolha as 2 últimas opções',
          color: COLORS.red,
          needed: 2,
          current: selections.filter(s => s.stage === 'red').length,
        };
      default:
        return {
          title: 'COMPLETO',
          subtitle: '',
          color: COLORS.green,
          needed: 0,
          current: 0,
        };
    }
  };

  const stageInfo = getStageInfo();

  // Check if option is selected and get its stage
  const getOptionSelection = (optionId: string): Selection | undefined => {
    return selections.find(s => s.id === optionId);
  };

  // Handle option click
  const handleOptionClick = (option: SprangerOption) => {
    if (currentStage === 'complete' || isTransitioning) return;

    const existingSelection = getOptionSelection(option.id);

    // If already selected, ignore (can't unselect in this flow)
    if (existingSelection) return;

    const newSelection: Selection = { id: option.id, stage: currentStage as 'green' | 'yellow' | 'red' };
    const newSelections = [...selections, newSelection];
    setSelections(newSelections);

    // Check if we need to advance to next stage
    const currentStageCount = newSelections.filter(s => s.stage === currentStage).length;

    if (currentStageCount >= 2) {
      if (currentStage === 'green') {
        setCurrentStage('yellow');
      } else if (currentStage === 'yellow') {
        setCurrentStage('red');
      } else if (currentStage === 'red') {
        // All selections complete - auto advance
        setCurrentStage('complete');
        setIsTransitioning(true);

        const greenIds = newSelections.filter(s => s.stage === 'green').map(s => s.id);
        const yellowIds = newSelections.filter(s => s.stage === 'yellow').map(s => s.id);
        const redIds = newSelections.filter(s => s.stage === 'red').map(s => s.id);

        // Auto advance after short delay for visual feedback
        setTimeout(() => {
          onAnswer(greenIds, yellowIds, redIds);
        }, 400);
      }
    }
  };

  // Get border/background style for option
  const getOptionStyle = (option: SprangerOption) => {
    const selection = getOptionSelection(option.id);

    if (selection) {
      // Already selected - show with its color
      const color = selection.stage === 'green' ? COLORS.green :
                    selection.stage === 'yellow' ? COLORS.yellow : COLORS.red;
      return {
        borderColor: color,
        backgroundColor: `${color}20`,
        selected: true,
        color,
      };
    }

    // Not selected - show current stage color as border
    if (currentStage === 'complete') {
      return {
        borderColor: '#e5e7eb',
        backgroundColor: 'transparent',
        selected: false,
        color: '#9ca3af',
      };
    }

    return {
      borderColor: stageInfo.color,
      backgroundColor: 'transparent',
      selected: false,
      color: stageInfo.color,
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
            {stageInfo.subtitle} ({stageInfo.current}/{stageInfo.needed})
          </p>
        </div>

        {/* Question */}
        <div className="bg-card rounded-xl p-6 shadow-lg mb-6">
          <h3 className="text-xl font-display font-bold text-foreground">
            {question.pergunta}
          </h3>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {question.opcoes.map((option) => {
            const style = getOptionStyle(option);
            const isSelectable = !style.selected && currentStage !== 'complete';

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                disabled={!isSelectable || isTransitioning}
                className={cn(
                  "relative p-4 rounded-xl border-3 text-left transition-all duration-200",
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
                  style.selected ? "text-foreground" : "text-foreground"
                )}>
                  {option.texto}
                </span>

                {/* Selection indicator */}
                {style.selected && (
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-in zoom-in duration-200"
                    style={{ backgroundColor: style.color }}
                  >
                    {selections.findIndex(s => s.id === option.id) + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection summary */}
        <div className="bg-card rounded-xl p-4 shadow-lg mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selections.filter(s => s.stage === 'green').length >= 2 ? COLORS.green : '#e5e7eb' }}
              />
              <span className="text-xs text-muted-foreground">Mais combina</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selections.filter(s => s.stage === 'yellow').length >= 2 ? COLORS.yellow : '#e5e7eb' }}
              />
              <span className="text-xs text-muted-foreground">Neutro</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selections.filter(s => s.stage === 'red').length >= 2 ? COLORS.red : '#e5e7eb' }}
              />
              <span className="text-xs text-muted-foreground">Menos combina</span>
            </div>
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
