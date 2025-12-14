// =====================================================
// PROPOSTAS - Área de Recrutamento VEON
// Propostas recebidas de empresas
// =====================================================

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Sparkles } from "lucide-react";
import EmptyState from "@/components/recrutamento/EmptyState";
import { useNavigate } from "react-router-dom";

export default function Propostas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-[#E31E24]" />
            <h1 className="text-3xl font-bold text-white">Minhas propostas</h1>
          </div>
          <p className="text-slate-400">
            Acompanhe as propostas de emprego que você recebeu
          </p>
        </div>

        {/* Empty state */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <EmptyState
              tipo="propostas"
              acao={{
                texto: "Completar meu perfil",
                onClick: () => navigate('/recrutamento/candidato/meu-curriculo'),
              }}
            />
          </CardContent>
        </Card>

        {/* Dica motivacional */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-400 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Candidatos com vídeo recebem 3x mais propostas. Que tal gravar o seu?
          </p>
        </div>

        {/* Rodapé */}
        <div className="text-center pt-6 mt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Seus talentos naturais podem te levar longe. Continue brilhando!
            <Sparkles className="w-4 h-4 text-amber-400" />
          </p>
        </div>
      </div>
    </div>
  );
}
