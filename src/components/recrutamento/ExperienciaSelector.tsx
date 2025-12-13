// =====================================================
// EXPERIÊNCIA SELECTOR - Tempo de experiência profissional
// Botões de seleção visual com explicação
// =====================================================

import { Briefcase, Star } from 'lucide-react';

interface ExperienciaSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const FAIXAS_EXPERIENCIA = [
  { value: 0, label: 'Primeiro emprego', sublabel: 'Sem experiência', icon: '🌱' },
  { value: 1, label: 'Menos de 1 ano', sublabel: 'Iniciante', icon: '📚' },
  { value: 2, label: '1 a 2 anos', sublabel: 'Júnior', icon: '🎯' },
  { value: 4, label: '3 a 5 anos', sublabel: 'Pleno', icon: '💼' },
  { value: 8, label: '6 a 10 anos', sublabel: 'Sênior', icon: '⭐' },
  { value: 15, label: 'Mais de 10 anos', sublabel: 'Especialista', icon: '🏆' },
];

export default function ExperienciaSelector({ value, onChange }: ExperienciaSelectorProps) {
  // Encontrar a faixa atual baseada no value
  const getFaixaAtual = () => {
    if (value === 0) return 0;
    if (value < 1) return 1;
    if (value <= 2) return 2;
    if (value <= 5) return 4;
    if (value <= 10) return 8;
    return 15;
  };

  const faixaSelecionada = getFaixaAtual();

  return (
    <div className="space-y-4">
      {/* Título explicativo */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <span className="text-lg font-medium text-white">Tempo total de experiência profissional</span>
        </div>
        <p className="text-sm text-slate-400">
          Considere todos os empregos que você já teve (CLT, PJ, estágios, etc)
        </p>
      </div>

      {/* Botões de seleção */}
      <div className="grid grid-cols-2 gap-3">
        {FAIXAS_EXPERIENCIA.map((faixa) => {
          const isSelected = faixaSelecionada === faixa.value;
          return (
            <button
              key={faixa.value}
              type="button"
              onClick={() => onChange(faixa.value)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'bg-[#E31E24]/20 border-[#E31E24] text-white'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{faixa.icon}</span>
                <div>
                  <p className="font-medium">{faixa.label}</p>
                  <p className="text-xs text-slate-400">{faixa.sublabel}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Indicador visual */}
      {value > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-slate-700/30 rounded-lg">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-white">
            {value === 0 ? 'Buscando primeira oportunidade' : `${value}+ anos de experiência`}
          </span>
        </div>
      )}
    </div>
  );
}
