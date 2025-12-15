// =====================================================
// BEM-VINDO CANDIDATO - Área de Recrutamento VEON
// Com slogans e frases motivacionais
// =====================================================

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const CandidatoBemVindo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      {/* Botão voltar */}
      <Button
        variant="ghost"
        className="absolute left-4 top-4 text-slate-400 hover:text-white z-20"
        onClick={() => navigate('/recrutamento')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Lado esquerdo - Slogan */}
        <div className="hidden md:flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Descubra seus talentos naturais e encontre a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#00D9FF]">
              vaga perfeita
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Seu próximo emprego está mais perto do que você imagina. Cadastre-se e seja encontrado pelas melhores empresas.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Recruta Veon - Sua carreira começa aqui</span>
          </div>
        </div>

        {/* Lado direito - Card */}
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-white text-2xl">Área do Profissional</CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Cadastre-se grátis e seja encontrado por empresas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Benefícios compactos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-white text-sm">100% gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-white text-sm">Teste DISC</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-white text-sm">Match inteligente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-white text-sm">Propostas diretas</span>
              </div>
            </div>

            {/* Botão principal - Login */}
            <Button
              className="w-full bg-green-500 hover:bg-green-600 py-6 font-semibold text-base"
              onClick={() => navigate('/recrutamento/candidato/login')}
            >
              Entrar na minha conta <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-500">ou</span>
              </div>
            </div>

            {/* Link cadastro - Destacado */}
            <div className="text-center p-4 bg-gradient-to-r from-[#E31E24]/10 to-[#003DA5]/10 rounded-xl border border-[#E31E24]/30">
              <p className="text-white font-medium mb-2">
                Ainda não tem conta?
              </p>
              <Link
                to="/recrutamento/candidato/cadastro-rapido"
                className="inline-flex items-center gap-2 text-[#00D9FF] hover:text-[#00D9FF]/80 font-semibold text-lg transition-colors"
              >
                Faça seu cadastro aqui
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-slate-500 text-xs mt-2">
                Cadastro rápido em 30 segundos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé motivacional */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Seus talentos naturais podem te levar longe. Continue brilhando!
          <Sparkles className="w-4 h-4 text-amber-400" />
        </p>
      </div>
    </div>
  );
};

export default CandidatoBemVindo;
