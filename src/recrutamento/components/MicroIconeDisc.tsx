// =====================================================
// COMPONENTE: Micro Ícone DISC (14x14px)
// Quadrado com 4 cores do DISC em quadrantes
// =====================================================

import React from 'react';

interface MicroIconeDiscProps {
  size?: number;
  className?: string;
}

export function MicroIconeDisc({ size = 14, className = '' }: MicroIconeDiscProps) {
  const halfSize = size / 2;

  return (
    <div
      className={`inline-flex flex-wrap rounded-sm overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* D - Vermelho (top-left) */}
      <div
        className="bg-red-500"
        style={{ width: halfSize, height: halfSize }}
      />
      {/* I - Amarelo (top-right) */}
      <div
        className="bg-yellow-400"
        style={{ width: halfSize, height: halfSize }}
      />
      {/* C - Azul (bottom-left) */}
      <div
        className="bg-blue-600"
        style={{ width: halfSize, height: halfSize }}
      />
      {/* S - Verde (bottom-right) */}
      <div
        className="bg-green-500"
        style={{ width: halfSize, height: halfSize }}
      />
    </div>
  );
}

export default MicroIconeDisc;
