// =====================================================
// LOGIN EMPRESA - Área de Recrutamento VEON
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Building2, User, ArrowRight } from 'lucide-react';

export default function EmpresaLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Verificar se há URL para redirect após login
  useEffect(() => {
    const savedRedirect = localStorage.getItem('veon_redirect_after_login');
    if (savedRedirect) {
      setRedirectUrl(savedRedirect);
    }
  }, []);

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
      // 1. Primeiro verificar se a empresa existe na tabela
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas_recrutamento')
        .select('id, razao_social, status, senha_hash')
        .eq('socio_email', email.toLowerCase().trim())
        .single();

      if (empresaError || !empresa) {
        throw new Error('E-mail não encontrado. Verifique ou cadastre sua empresa.');
      }

      if (empresa.status !== 'ativo') {
        throw new Error('Sua conta está suspensa. Entre em contato com o suporte.');
      }

      // 2. Tentar login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: senha,
      });

      if (authError) {
        // Se o erro for de credenciais inválidas, verificar se a empresa foi cadastrada antes do Auth
        if (authError.message.includes('Invalid login credentials')) {
          // Verificar se senha_hash não é AUTH_SUPABASE (empresa cadastrada sem Auth)
          if (empresa.senha_hash && empresa.senha_hash !== 'AUTH_SUPABASE') {
            // Empresa foi cadastrada antes do sistema usar Auth
            // Tentar verificar senha diretamente (apenas para migração)
            if (empresa.senha_hash === senha) {
              // Senha correta! Criar usuário no Auth para próximos logins
              const { error: signUpError } = await supabase.auth.signUp({
                email: email.toLowerCase().trim(),
                password: senha,
                options: {
                  data: { tipo: 'empresa' },
                },
              });

              if (!signUpError) {
                // Atualizar senha_hash para indicar que agora usa Auth
                await supabase
                  .from('empresas_recrutamento')
                  .update({ senha_hash: 'AUTH_SUPABASE' })
                  .eq('id', empresa.id);

                // Fazer login novamente com Auth
                const { error: loginError } = await supabase.auth.signInWithPassword({
                  email: email.toLowerCase().trim(),
                  password: senha,
                });

                if (!loginError) {
                  toast({
                    title: 'Bem-vindo!',
                    description: `Olá, ${empresa.razao_social}. Sua conta foi atualizada.`,
                  });
                  // Limpar redirect e navegar
                  localStorage.removeItem('veon_redirect_after_login');
                  navigate(redirectUrl || '/recrutamento/empresa/dashboard');
                  return;
                }
              }
            }
          }
          throw new Error('Senha incorreta. Verifique e tente novamente.');
        }

        // Outros erros do Auth
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('E-mail não confirmado. Verifique sua caixa de entrada.');
        }

        throw authError;
      }

      // 3. Login bem-sucedido - vincular auth_user_id se necessário
      try {
        await supabase.rpc('vincular_auth_empresa');
      } catch (e) {
        // Ignora erro - pode não existir a função ainda
        console.log('Vinculação auth:', e);
      }

      toast({
        title: 'Bem-vindo!',
        description: `Olá, ${empresa.razao_social}`,
      });

      // Limpar redirect e navegar
      localStorage.removeItem('veon_redirect_after_login');
      navigate(redirectUrl || '/recrutamento/empresa/dashboard');
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
            Os candidatos que você precisa{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#00D9FF]">
              estão aqui
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Conheça 90% do comportamento de quem vai trabalhar na sua empresa antes mesmo da entrevista.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="w-5 h-5 text-[#E31E24]" />
            <span>Recruta Veon - Recrutamento Inteligente</span>
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
              Acesse sua conta e encontre talentos
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
                placeholder="empresa@exemplo.com"
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

          {/* Opção para pessoa física */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">Não é uma empresa?</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Se você é um profissional buscando oportunidades, cadastre seu currículo gratuitamente.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/recrutamento/candidato/bem-vindo')}
                    className="mt-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 p-0 h-auto"
                  >
                    Cadastrar meu currículo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
