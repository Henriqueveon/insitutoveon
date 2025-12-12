import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ControlItem, ControlOption } from '@/data/discQuestions';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface ControlQuestionProps {
  controlItem: ControlItem;
  questionNumber: number;
  totalQuestions: number;
  globalProgress: number;
  onAnswer: (controlId: number, selectedFlag: string) => void;
  onBack?: () => void;
}

export function ControlQuestion({
  controlItem,
  questionNumber,
  totalQuestions,
  globalProgress,
  onAnswer,
  onBack,
}: ControlQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (option: ControlOption) => {
    if (isTransitioning) return;

    setSelectedOption(option.flag);
    setIsTransitioning(true);

    // Auto advance after selection
    setTimeout(() => {
      onAnswer(controlItem.id, option.flag);
    }, 400);
  };

  // Determine visual style based on control type
  const getControlStyle = () => {
    switch (controlItem.tipo) {
      case 'atencao':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-400',
          accentColor: '#3B82F6',
          title: 'Verificação',
        };
      case 'desejabilidade':
        return {
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          accentColor: '#64748B',
          title: 'Autoconhecimento',
        };
      case 'consistencia':
        return {
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          accentColor: '#64748B',
          title: 'Comportamento',
        };
      default:
        return {
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          accentColor: '#64748B',
          title: 'Pergunta',
        };
    }
  };

  const style = getControlStyle();

  return (
    <div
      className={cn(
        'min-h-screen transition-opacity duration-300',
        isTransitioning ? 'opacity-50' : 'opacity-100'
      )}
      style={{ backgroundColor: '#FFFFFF' }}
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
              Pergunta {questionNumber} de {totalQuestions}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(globalProgress)}% completo
            </span>
          </div>
          <Progress value={globalProgress} className="h-2" />
        </div>

        {/* Question Card */}
        <div
          className={cn(
            'rounded-xl p-6 mb-6 border-2',
            style.bgColor,
            style.borderColor
          )}
        >
          {/* Instruction for attention check */}
          {controlItem.instrucao && (
            <div className="flex items-start gap-3 mb-4 p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 text-sm font-medium">
                {controlItem.instrucao}
              </p>
            </div>
          )}

          {/* Question */}
          {controlItem.pergunta && (
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              {controlItem.pergunta}
            </h2>
          )}

          {/* Options */}
          <div className="space-y-3">
            {controlItem.opcoes?.map((option, index) => {
              const isSelected = selectedOption === option.flag;

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  disabled={isTransitioning}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all duration-200',
                    'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    !isSelected && !isTransitioning && 'hover:scale-[1.01] hover:shadow-md cursor-pointer',
                    isSelected && 'shadow-lg transform scale-[1.01]',
                    isTransitioning && !isSelected && 'opacity-60'
                  )}
                  style={{
                    borderColor: isSelected ? style.accentColor : '#E2E8F0',
                    backgroundColor: isSelected ? style.accentColor : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : '#1E293B',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.texto}</span>
                    {isSelected && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20"
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {onBack ? (
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              disabled={isTransitioning}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
}
