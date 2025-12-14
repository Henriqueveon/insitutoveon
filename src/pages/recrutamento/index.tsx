// =====================================================
// PÁGINA INICIAL - Área de Recrutamento VEON
// Com slogans e frases motivacionais
// =====================================================

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecrutamentoIndex = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-black text-white">V</span>
          </div>
        </div>

        {/* Slogan Principal */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Recrutamento inteligente para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#00D9FF]">
              empresas inteligentes
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Conheça 90% do comportamento de quem vai trabalhar na sua empresa
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate('/recrutamento/empresa/login')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-white">Sou Empresa</CardTitle>
              <CardDescription className="text-slate-400">
                Os candidatos que você precisa estão aqui, na Recruta Veon
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors">
                Acessar <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all cursor-pointer group"
                onClick={() => navigate('/recrutamento/candidato/bem-vindo')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-colors">
                <User className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-white">Sou Candidato</CardTitle>
              <CardDescription className="text-slate-400">
                Descubra seus talentos naturais e encontre a vaga perfeita
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="group-hover:bg-green-500 group-hover:text-white transition-colors border-green-500/50 text-green-500">
                Começar <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Rodapé motivacional */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Recruta Veon - Conectando talentos às melhores oportunidades</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecrutamentoIndex;
