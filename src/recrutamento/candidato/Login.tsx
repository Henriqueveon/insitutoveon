// =====================================================
// LOGIN CANDIDATO - Área de Recrutamento VEON
// =====================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, User } from 'lucide-react';

export default function CandidatoLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha e-mail e senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificar se o candidato existe
      const { data: candidato, error: candidatoError } = await supabase
        .from('candidatos_recrutamento')
        .select('id, nome_completo, status')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (candidatoError || !candidato) {
        throw new Error('E-mail não encontrado. Verifique ou faça seu cadastro.');
      }

      // 2. Tentar login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: senha,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Senha incorreta. Verifique e tente novamente.');
        }
        if (authError.message.includes('Email not confirmed')) {
          // Mesmo sem confirmar, podemos permitir login
          localStorage.setItem('veon_candidato_id', candidato.id);
          toast({
            title: 'Bem-vindo!',
            description: `Olá, ${candidato.nome_completo?.split(' ')[0]}!`,
          });
          navigate('/recrutamento/candidato/inicio');
          return;
        }
        throw authError;
      }

      // 3. Login bem-sucedido
      localStorage.setItem('veon_candidato_id', candidato.id);

      toast({
        title: 'Bem-vindo!',
        description: `Olá, ${candidato.nome_completo?.split(' ')[0]}!`,
      });

      navigate('/recrutamento/candidato/inicio');
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro ao entrar',
        description: error instanceof Error ? error.message : 'Verifique suas credenciais.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Lado esquerdo - Slogan */}
        <div className="hidden md:flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Uma empresa quer{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#00D9FF]">
              te contratar
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Acesse sua conta para ver propostas de empresas e oportunidades exclusivas.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <User className="w-5 h-5 text-[#E31E24]" />
            <span>Recruta Veon - Sua carreira começa aqui</span>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Área do Profissional
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Acesse sua conta e veja suas propostas
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
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
                  to="/recrutamento/candidato/recuperar-senha"
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
                  to="/recrutamento/candidato/cadastro-rapido"
                  className="text-[#00D9FF] hover:text-[#00D9FF]/80 font-medium transition-colors"
                >
                  Cadastre-se grátis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
