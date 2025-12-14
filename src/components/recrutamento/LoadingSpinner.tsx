// =====================================================
// LOADING SPINNER - Com frases rotativas motivacionais
// Área de Recrutamento VEON
// =====================================================

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const frasesLoading = [
  "Buscando os melhores talentos...",
  "Analisando perfis comportamentais...",
  "Encontrando matches perfeitos...",
  "Preparando resultados...",
  "Quase lá...",
];

interface LoadingSpinnerProps {
  texto?: string;
  mostrarFrases?: boolean;
  tamanho?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  texto,
  mostrarFrases = true,
  tamanho = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const [fraseAtual, setFraseAtual] = useState(0);

  useEffect(() => {
    if (!mostrarFrases || texto) return;

    const interval = setInterval(() => {
      setFraseAtual((prev) => (prev + 1) % frasesLoading.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [mostrarFrases, texto]);

  const tamanhos = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textoTamanhos = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <Loader2 className={`${tamanhos[tamanho]} text-[#E31E24] animate-spin`} />
      {(mostrarFrases || texto) && (
        <p className={`${textoTamanhos[tamanho]} text-slate-400 text-center animate-pulse`}>
          {texto || frasesLoading[fraseAtual]}
        </p>
      )}
    </div>
  );
}

// Componente de loading para página inteira
export function LoadingPage({ texto }: { texto?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <LoadingSpinner texto={texto} tamanho="lg" mostrarFrases />
    </div>
  );
}

// Componente de loading para cards/seções
export function LoadingCard({ texto }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner texto={texto} tamanho="md" mostrarFrases={false} />
    </div>
  );
}
