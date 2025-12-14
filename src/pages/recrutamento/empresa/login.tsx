// =====================================================
// LOGIN EMPRESA - Área de Recrutamento VEON
// Com slogan motivacional
// =====================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const EmpresaLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implementar login com Supabase
    console.log("Login:", { email, senha });
    setTimeout(() => {
      setIsLoading(false);
      navigate('/recrutamento/empresa/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
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
            Os candidatos que você precisa{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#00D9FF]">
              estão aqui
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Conheça 90% do comportamento de quem vai trabalhar na sua empresa antes de contratar.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Recruta Veon - Recrutamento inteligente</span>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Área da Empresa
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Acesse sua conta para gerenciar candidatos
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  E-mail do responsável
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="empresa@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#E31E24] focus:ring-[#E31E24]/20"
                  disabled={isLoading}
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-slate-300">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#E31E24] focus:ring-[#E31E24]/20 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Link esqueci senha */}
              <div className="text-right">
                <Link
                  to="/recrutamento/empresa/recuperar-senha"
                  className="text-sm text-[#00D9FF] hover:text-[#00D9FF]/80 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão entrar */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] text-white font-semibold py-5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-500">ou</span>
              </div>
            </div>

            {/* Link cadastro */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Não tem conta?{' '}
                <Link
                  to="/recrutamento/empresa/cadastro"
                  className="text-[#00D9FF] hover:text-[#00D9FF]/80 font-medium transition-colors"
                >
                  Cadastre sua empresa
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmpresaLogin;
