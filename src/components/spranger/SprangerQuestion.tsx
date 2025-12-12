import { useState, useEffect, DragEvent } from 'react';
import { SprangerQuestion as SprangerQuestionType, SprangerOption } from '@/data/sprangerQuestions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, GripVertical, Check, AlertCircle } from 'lucide-react';

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
}

type DropZone = 'available' | 'muitoEu' | 'maisOuMenos' | 'poucoEu';

interface DragItem {
  option: SprangerOption;
  fromZone: DropZone;
}

export function SprangerQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  initialAnswer,
}: SprangerQuestionProps) {
  const [available, setAvailable] = useState<SprangerOption[]>([]);
  const [muitoEu, setMuitoEu] = useState<SprangerOption[]>([]);
  const [maisOuMenos, setMaisOuMenos] = useState<SprangerOption[]>([]);
  const [poucoEu, setPoucoEu] = useState<SprangerOption[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverZone, setDragOverZone] = useState<DropZone | null>(null);

  // Initialize or reset when question changes
  useEffect(() => {
    if (initialAnswer) {
      const muitoEuOptions = question.opcoes.filter((o) =>
        initialAnswer.muitoEu.includes(o.id)
      );
      const maisOuMenosOptions = question.opcoes.filter((o) =>
        initialAnswer.maisOuMenos.includes(o.id)
      );
      const poucoEuOptions = question.opcoes.filter((o) =>
        initialAnswer.poucoEu.includes(o.id)
      );
      const usedIds = [
        ...initialAnswer.muitoEu,
        ...initialAnswer.maisOuMenos,
        ...initialAnswer.poucoEu,
      ];
      const availableOptions = question.opcoes.filter(
        (o) => !usedIds.includes(o.id)
      );

      setMuitoEu(muitoEuOptions);
      setMaisOuMenos(maisOuMenosOptions);
      setPoucoEu(poucoEuOptions);
      setAvailable(availableOptions);
    } else {
      setAvailable([...question.opcoes]);
      setMuitoEu([]);
      setMaisOuMenos([]);
      setPoucoEu([]);
    }
  }, [question, initialAnswer]);

  const isComplete =
    muitoEu.length === 2 && maisOuMenos.length === 2 && poucoEu.length === 2;
  const progress = ((questionNumber - 1) / totalQuestions) * 100;

  const handleDragStart = (e: DragEvent, option: SprangerOption, fromZone: DropZone) => {
    setDraggedItem({ option, fromZone });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', option.id);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverZone(null);
  };

  const handleDragOver = (e: DragEvent, zone: DropZone) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zone);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const getZoneState = (zone: DropZone) => {
    switch (zone) {
      case 'available':
        return { items: available, setItems: setAvailable, maxItems: 6 };
      case 'muitoEu':
        return { items: muitoEu, setItems: setMuitoEu, maxItems: 2 };
      case 'maisOuMenos':
        return { items: maisOuMenos, setItems: setMaisOuMenos, maxItems: 2 };
      case 'poucoEu':
        return { items: poucoEu, setItems: setPoucoEu, maxItems: 2 };
    }
  };

  const handleDrop = (e: DragEvent, toZone: DropZone) => {
    e.preventDefault();
    setDragOverZone(null);

    if (!draggedItem) return;
    const { option, fromZone } = draggedItem;

    if (fromZone === toZone) return;

    const toZoneState = getZoneState(toZone);
    const fromZoneState = getZoneState(fromZone);

    // Check if destination zone is full (except for 'available' zone)
    if (toZone !== 'available' && toZoneState.items.length >= toZoneState.maxItems) {
      return;
    }

    // Remove from source
    fromZoneState.setItems(fromZoneState.items.filter((o) => o.id !== option.id));

    // Add to destination
    toZoneState.setItems([...toZoneState.items, option]);

    setDraggedItem(null);
  };

  const handleClickToMove = (option: SprangerOption, fromZone: DropZone) => {
    // On mobile or for accessibility, click to cycle through zones
    const zones: DropZone[] = ['muitoEu', 'maisOuMenos', 'poucoEu', 'available'];
    const currentIndex = zones.indexOf(fromZone);

    // Find next zone that has space
    for (let i = 1; i <= zones.length; i++) {
      const nextZone = zones[(currentIndex + i) % zones.length];
      const zoneState = getZoneState(nextZone);

      if (nextZone === 'available' || zoneState.items.length < zoneState.maxItems) {
        const fromState = getZoneState(fromZone);
        fromState.setItems(fromState.items.filter((o) => o.id !== option.id));
        zoneState.setItems([...zoneState.items, option]);
        break;
      }
    }
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    onAnswer(
      muitoEu.map((o) => o.id),
      maisOuMenos.map((o) => o.id),
      poucoEu.map((o) => o.id)
    );
  };

  const renderOption = (option: SprangerOption, zone: DropZone) => {
    const isDragging = draggedItem?.option.id === option.id;

    return (
      <div
        key={option.id}
        draggable
        onDragStart={(e) => handleDragStart(e, option, zone)}
        onDragEnd={handleDragEnd}
        onClick={() => handleClickToMove(option, zone)}
        className={`
          flex items-center gap-2 p-3 bg-card rounded-lg border-2 cursor-grab active:cursor-grabbing
          transition-all duration-200 select-none
          ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
          ${zone === 'available' ? 'border-border hover:border-primary/50 hover:shadow-md' : 'border-transparent'}
        `}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-foreground leading-tight">{option.texto}</span>
      </div>
    );
  };

  const renderDropZone = (
    zone: DropZone,
    title: string,
    color: string,
    bgColor: string,
    borderColor: string
  ) => {
    const zoneState = getZoneState(zone);
    const items = zoneState.items;
    const isFull = items.length >= 2;
    const isOver = dragOverZone === zone;
    const canDrop = !isFull || zone === 'available';

    return (
      <div
        onDragOver={(e) => handleDragOver(e, zone)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, zone)}
        className={`
          rounded-xl p-4 border-2 transition-all duration-200 min-h-[140px]
          ${bgColor}
          ${isOver && canDrop ? borderColor + ' scale-[1.02] shadow-lg' : 'border-transparent'}
          ${!canDrop && isOver ? 'border-red-400' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className={`font-bold text-sm ${color}`}>{title}</h4>
          <div className="flex items-center gap-1">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  items.length > i
                    ? color.replace('text-', 'bg-').replace('-700', '-500').replace('-600', '-500')
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {items.map((option) => renderOption(option, zone))}
          {items.length < 2 && (
            <div className="text-xs text-muted-foreground text-center py-4 border-2 border-dashed border-muted rounded-lg">
              {items.length === 0 ? 'Arraste 2 opções aqui' : 'Arraste mais 1 opção'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Pergunta {questionNumber} de {totalQuestions}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% completo
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="bg-card rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            {question.pergunta}
          </h2>
          <p className="text-sm text-muted-foreground">
            Arraste cada opção para o grupo que melhor representa você
          </p>
        </div>

        {/* Available options */}
        {available.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Opções disponíveis
              <span className="text-xs text-muted-foreground font-normal">
                ({available.length} restantes)
              </span>
            </h3>
            <div className="grid gap-2">
              {available.map((option) => renderOption(option, 'available'))}
            </div>
          </div>
        )}

        {/* Drop zones */}
        <div className="grid gap-4 mb-6">
          {renderDropZone(
            'muitoEu',
            'MUITO EU',
            'text-green-700 dark:text-green-400',
            'bg-green-500/10',
            'border-green-500'
          )}
          {renderDropZone(
            'maisOuMenos',
            'MAIS OU MENOS',
            'text-yellow-700 dark:text-yellow-400',
            'bg-yellow-500/10',
            'border-yellow-500'
          )}
          {renderDropZone(
            'poucoEu',
            'POUCO EU',
            'text-red-700 dark:text-red-400',
            'bg-red-500/10',
            'border-red-500'
          )}
        </div>

        {/* Status and navigation */}
        <div className="bg-card rounded-xl p-4 shadow-lg">
          {/* Completion status */}
          <div className="flex items-center gap-2 mb-4">
            {isComplete ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  Tudo certo! Você pode avançar para a próxima pergunta.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-muted-foreground">
                  Coloque 2 opções em cada grupo para continuar.
                </span>
              </>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!isComplete}
              className="flex-1"
            >
              {questionNumber === totalQuestions ? 'Finalizar' : 'Próxima'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
