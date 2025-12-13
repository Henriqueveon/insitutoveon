// =====================================================
// CNH SELECTOR - Todas as categorias de habilitação
// Com múltipla seleção e indicador de processo
// =====================================================

import { useState, useEffect } from 'react';
import { Car, Bike, Truck, Bus, AlertCircle, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface CNHSelectorProps {
  value: string[]; // Array de categorias selecionadas
  onChange: (value: string[]) => void;
  emProcesso?: boolean;
  onEmProcessoChange?: (value: boolean) => void;
}

const CATEGORIAS_CNH = [
  {
    value: 'A',
    label: 'Categoria A',
    descricao: 'Motos e triciclos',
    icon: Bike,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  {
    value: 'B',
    label: 'Categoria B',
    descricao: 'Carros e utilitários',
    icon: Car,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    value: 'C',
    label: 'Categoria C',
    descricao: 'Caminhões e tratores',
    icon: Truck,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  {
    value: 'D',
    label: 'Categoria D',
    descricao: 'Ônibus e micro-ônibus',
    icon: Bus,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    value: 'E',
    label: 'Categoria E',
    descricao: 'Carretas e articulados',
    icon: Truck,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
];

export default function CNHSelector({
  value = [],
  onChange,
  emProcesso = false,
  onEmProcessoChange,
}: CNHSelectorProps) {
  const [naoPossuo, setNaoPossuo] = useState(value.includes('nenhuma') || value.length === 0);

  // Sincronizar estado
  useEffect(() => {
    if (value.includes('nenhuma') || value.length === 0) {
      setNaoPossuo(true);
    } else {
      setNaoPossuo(false);
    }
  }, [value]);

  const toggleCategoria = (categoria: string) => {
    if (naoPossuo) {
      // Se não possuía, agora vai possuir
      setNaoPossuo(false);
      onChange([categoria]);
    } else if (value.includes(categoria)) {
      const newValue = value.filter((v) => v !== categoria);
      if (newValue.length === 0) {
        setNaoPossuo(true);
        onChange(['nenhuma']);
      } else {
        onChange(newValue);
      }
    } else {
      // Adicionar categoria
      const newValue = value.filter((v) => v !== 'nenhuma');
      onChange([...newValue, categoria]);
    }
  };

  const toggleNaoPossuo = () => {
    if (naoPossuo) {
      // Estava marcado, desmarcar
      setNaoPossuo(false);
      onChange([]);
    } else {
      // Marcar como não possui
      setNaoPossuo(true);
      onChange(['nenhuma']);
    }
  };

  return (
    <div className="space-y-4">
      {/* Categorias */}
      <div className="space-y-2">
        {CATEGORIAS_CNH.map((cat) => {
          const isSelected = value.includes(cat.value);
          const IconComponent = cat.icon;

          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggleCategoria(cat.value)}
              disabled={naoPossuo}
              className={`
                w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4
                ${isSelected
                  ? 'bg-[#E31E24]/20 border-[#E31E24]'
                  : naoPossuo
                  ? 'bg-slate-800/50 border-slate-700 opacity-50'
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <div className={`p-2 rounded-lg ${cat.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${cat.color}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {cat.label}
                </p>
                <p className="text-xs text-slate-400">{cat.descricao}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'bg-[#E31E24] border-[#E31E24]' : 'border-slate-500'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Não possuo CNH */}
      <button
        type="button"
        onClick={toggleNaoPossuo}
        className={`
          w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4
          ${naoPossuo
            ? 'bg-slate-600/50 border-slate-500'
            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
          }
        `}
      >
        <div className="p-2 rounded-lg bg-slate-600/50">
          <AlertCircle className="w-6 h-6 text-slate-400" />
        </div>
        <div className="flex-1 text-left">
          <p className={`font-medium ${naoPossuo ? 'text-white' : 'text-slate-300'}`}>
            Não possuo CNH
          </p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          naoPossuo ? 'bg-slate-500 border-slate-500' : 'border-slate-500'
        }`}>
          {naoPossuo && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </button>

      {/* CNH em processo */}
      {onEmProcessoChange && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <Checkbox
            id="cnh-processo"
            checked={emProcesso}
            onCheckedChange={(checked) => onEmProcessoChange(checked as boolean)}
            className="border-yellow-500 data-[state=checked]:bg-yellow-500"
          />
          <label htmlFor="cnh-processo" className="flex items-center gap-2 text-yellow-400 cursor-pointer">
            <Clock className="w-4 h-4" />
            Estou tirando CNH (em processo)
          </label>
        </div>
      )}

      {/* Resumo das categorias selecionadas */}
      {!naoPossuo && value.length > 0 && !value.includes('nenhuma') && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            <strong>Categorias:</strong> {value.join(', ')}
            {emProcesso && ' (+ em processo)'}
          </p>
        </div>
      )}
    </div>
  );
}
