// =====================================================
// PROPOSTAS - Área de Recrutamento VEON
// Design moderno com alto contraste
// =====================================================

import { Mail, Video, Zap, ChevronRight } from "lucide-react";
import EmptyState from "@/components/recrutamento/EmptyState";
import { useNavigate } from "react-router-dom";

export default function Propostas() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header simples */}
      <div>
        <h1 className="text-2xl font-bold text-white">Propostas</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Empresas interessadas no seu perfil
        </p>
      </div>

      {/* Empty state moderno */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
          <Mail className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Nenhuma proposta ainda
        </h3>
        <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
          Complete seu perfil para receber propostas de empresas interessadas
        </p>
        <button
          onClick={() => navigate('/recrutamento/candidato/configuracoes')}
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all active:scale-95"
        >
          Completar perfil
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dica para aumentar propostas */}
      <button
        onClick={() => navigate('/recrutamento/candidato/configuracoes')}
        className="w-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-4 text-left hover:border-purple-500/50 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Grave seu vídeo</p>
            <p className="text-purple-300 text-sm">
              3x mais chances de receber propostas
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </div>
      </button>

      {/* Info box */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Como funciona?</p>
            <p className="text-zinc-400 text-sm mt-1">
              Empresas visualizam seu perfil e enviam propostas diretamente. Você decide se aceita ou não.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
