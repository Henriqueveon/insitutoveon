// =====================================================
// SEÇÃO FORMULÁRIO - Divisor visual com título e ícone
// Para organizar formulários longos em grupos
// =====================================================

import { LucideIcon } from 'lucide-react';

interface SecaoFormularioProps {
  titulo: string;
  subtitulo?: string;
  icon: LucideIcon;
  iconColor?: string;
  children?: React.ReactNode;
}

export default function SecaoFormulario({
  titulo,
  subtitulo,
  icon: Icon,
  iconColor = 'text-[#E31E24]',
  children,
}: SecaoFormularioProps) {
  return (
    <div className="space-y-4">
      {/* Header da seção */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
        <div className={`p-2 rounded-lg bg-slate-700/50 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{titulo}</h3>
          {subtitulo && (
            <p className="text-sm text-slate-400">{subtitulo}</p>
          )}
        </div>
      </div>

      {/* Conteúdo da seção */}
      {children}
    </div>
  );
}
