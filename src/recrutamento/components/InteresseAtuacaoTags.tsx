// =====================================================
// COMPONENTE: Tags de Interesse de Atuação Profissional
// Permite adicionar de 1 a 5 áreas de interesse
// =====================================================

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InteresseAtuacaoTagsProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxCharsPerTag?: number;
  minCharsToAdd?: number;
}

export function InteresseAtuacaoTags({
  value = [],
  onChange,
  maxTags = 5,
  maxCharsPerTag = 25,
  minCharsToAdd = 5
}: InteresseAtuacaoTagsProps) {
  const [inputValue, setInputValue] = useState('');

  const canAddTag = inputValue.trim().length >= minCharsToAdd && value.length < maxTags;
  const isMaxTagsReached = value.length >= maxTags;

  const handleAddTag = () => {
    if (!canAddTag) return;

    const newTag = inputValue.trim().slice(0, maxCharsPerTag);

    // Evitar duplicatas
    if (value.includes(newTag)) {
      setInputValue('');
      return;
    }

    onChange([...value, newTag]);
    setInputValue('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, maxCharsPerTag);
    setInputValue(newValue);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-sm font-medium text-gray-300">
        Interesse de Atuação Profissional
      </label>

      {/* Tags Container */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          {value.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="p-0.5 hover:bg-red-500/20 rounded-full transition-colors"
                aria-label={`Remover ${tag}`}
              >
                <X className="w-3.5 h-3.5 text-red-400 hover:text-red-300" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input + Botão Adicionar */}
      {!isMaxTagsReached && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Vendedor de varejo, Pizzaiolo..."
              maxLength={maxCharsPerTag}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          {canAddTag && (
            <Button
              type="button"
              onClick={handleAddTag}
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          )}
        </div>
      )}

      {/* Texto auxiliar e contadores */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {isMaxTagsReached
            ? "Máximo de áreas atingido"
            : "Adicione até 5 áreas de atuação"
          }
        </span>
        <div className="flex gap-3">
          <span className={value.length >= maxTags ? 'text-yellow-500' : ''}>
            {value.length}/{maxTags}
          </span>
          {inputValue.length > 0 && (
            <span className={inputValue.length >= maxCharsPerTag ? 'text-red-500' : ''}>
              {inputValue.length}/{maxCharsPerTag}
            </span>
          )}
        </div>
      </div>

      {/* Mensagem quando atingir máximo */}
      {isMaxTagsReached && (
        <p className="text-xs text-yellow-500/80">
          Para adicionar outra área, remova uma existente clicando no X
        </p>
      )}
    </div>
  );
}

export default InteresseAtuacaoTags;
