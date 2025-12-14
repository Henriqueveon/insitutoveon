// =====================================================
// DASHBOARD EMPRESA - Área de Recrutamento VEON
// Com frases de boas-vindas e slogans
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, MessageSquare, CreditCard, Sparkles, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmpresaDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Card de boas-vindas */}
        <Card className="bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">Bem-vindo(a) ao recrutamento inteligente!</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Encontre o candidato perfeito para sua vaga
                </h1>
                <p className="text-slate-300">
                  Conheça 90% do comportamento de quem vai trabalhar na sua empresa
                </p>
              </div>
              <Button
                onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
                className="hidden md:flex bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B]"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar candidatos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de métricas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm hover:bg-slate-800/80 transition-colors cursor-pointer"
                onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Candidatos encontrados</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">Clique para buscar</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm hover:bg-slate-800/80 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Vagas ativas</CardTitle>
              <Briefcase className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">Criar nova vaga</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm hover:bg-slate-800/80 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Em processo</CardTitle>
              <MessageSquare className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">Candidaturas ativas</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm hover:bg-slate-800/80 transition-colors cursor-pointer"
                onClick={() => navigate('/recrutamento/empresa/creditos')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Créditos disponíveis</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ 0,00</div>
              <p className="text-xs text-slate-500 mt-1">Clique para recarregar</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ações rápidas</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
                >
                  Buscar candidatos
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Criar nova vaga
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Compartilhar link de recrutamento
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Dicas para recrutar melhor</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Use filtros de perfil DISC para encontrar candidatos compatíveis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Candidatos com vídeo têm maior engajamento
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Compartilhe seu link de recrutamento nas redes sociais
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Rodapé */}
        <div className="text-center pt-6 border-t border-slate-800">
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

export default EmpresaDashboard;
