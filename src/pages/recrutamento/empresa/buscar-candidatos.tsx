// =====================================================
// BUSCAR CANDIDATOS - Área de Recrutamento VEON
// Com slogans e empty states motivacionais
// =====================================================

import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles } from "lucide-react";
import EmptyState from "@/components/recrutamento/EmptyState";

const BuscarCandidatos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header com slogan */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-6 h-6 text-[#E31E24]" />
            <h1 className="text-3xl font-bold text-white">Buscar candidatos</h1>
          </div>
          <p className="text-slate-400">
            Encontre o candidato perfeito para sua vaga
          </p>
        </div>

        {/* Área de filtros (placeholder) */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <p className="text-slate-400 text-center">
              Filtros em construção...
            </p>
          </CardContent>
        </Card>

        {/* Empty state quando não há candidatos */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <EmptyState
              tipo="candidatos"
              acao={{
                texto: "Compartilhar link de recrutamento",
                onClick: () => {},
              }}
            />
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-center pt-6 mt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Recruta Veon - Conectando talentos às melhores oportunidades
            <Sparkles className="w-4 h-4 text-amber-400" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuscarCandidatos;
