// =====================================================
// LOGIN CANDIDATO - Área de Recrutamento VEON
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, User, CheckCircle, Mail } from 'lucide-react';
import { obterMensagemErro } from '../utils/traduzirErro';
import { VerificacaoOTP } from '@/components/VerificacaoOTP';

export default function CandidatoLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  // Estado para verificação de email pendente
  const [mostrarVerificacaoEmail, setMostrarVerificacaoEmail] = useState(false);
  const [emailPendente, setEmailPendente] = useState('');
  const [senhaPendente, setSenhaPendente] = useState('');

  // Verificar se veio de verificação de email ou já tem sessão
  useEffect(() => {
    const verificarSessaoECallback = async () => {
      try {
        // Verificar se há fragmento de hash (callback do Supabase)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        // Limpar o hash da URL
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        // Se veio do callback de verificação de email
        if (type === 'signup' || type === 'email_change') {
          setEmailVerificado(true);
          toast({
            title: 'E-mail verificado!',
            description: 'Sua conta foi confirmada. Faça login para continuar.',
          });
        }

        // Verificar se já tem sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Já está logado, redirecionar
          navigate('/recrutamento/candidato/vagas');
          return;
        }

        // Verificar se veio do cadastro com mensagem
        const state = location.state as { email?: string; mensagem?: string } | null;
        if (state?.email) {
          setEmail(state.email);
        }
        if (state?.mensagem) {
          toast({
            title: 'Atenção',
            description: state.mensagem,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setVerificandoSessao(false);
      }
    };

    verificarSessaoECallback();
  }, [navigate, location.state, toast]);

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
      const emailLower = email.toLowerCase().trim();

      // 1. Tentar login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: senha,
      });

      if (authError) {
        // Verificar se é erro de email não confirmado
        if (authError.message.includes('Email not confirmed')) {
          console.log('Email não confirmado - mostrando verificação OTP');

          // Verificar se o candidato existe na nossa tabela
          const { data: candidatoExiste } = await supabase
            .from('candidatos_recrutamento')
            .select('id, nome_completo')
            .eq('email', emailLower)
            .single();

          if (!candidatoExiste) {
            throw new Error('Cadastro não encontrado. Por favor, faça seu cadastro primeiro.');
          }

          // Guardar email e senha para tentar login após verificação
          setEmailPendente(emailLower);
          setSenhaPendente(senha);
          setMostrarVerificacaoEmail(true);

          toast({
            title: 'Verificação necessária',
            description: 'Por favor, verifique seu email para continuar.',
          });

          setIsLoading(false);
          return;
        }

        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('E-mail ou senha incorretos. Verifique e tente novamente.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao autenticar. Tente novamente.');
      }

      // 2. Buscar candidato pelo auth_user_id ou email
      let { data: candidato } = await supabase
        .from('candidatos_recrutamento')
        .select('id, nome_completo, auth_user_id, email, email_verificado')
        .eq('auth_user_id', authData.user.id)
        .single();

      // Se não encontrou por auth_user_id, tentar por email
      if (!candidato) {
        const { data: candidatoByEmail } = await supabase
          .from('candidatos_recrutamento')
          .select('id, nome_completo, auth_user_id, email, email_verificado')
          .eq('email', email.toLowerCase().trim())
          .single();

        candidato = candidatoByEmail;

        // Vincular auth_user_id se encontrou por email
        if (candidato && !candidato.auth_user_id) {
          await supabase.rpc('vincular_auth_candidato', {
            p_candidato_id: candidato.id,
            p_auth_user_id: authData.user.id,
          });
        }
      }

      if (!candidato) {
        // Usuário Auth existe mas não tem cadastro de candidato
        await supabase.auth.signOut();
        throw new Error('Cadastro de candidato não encontrado. Por favor, faça seu cadastro.');
      }

      // 3. Login bem-sucedido - redirecionar para o painel
      // A verificação de email pendente será feita no painel (Inicio.tsx)
      toast({
        title: 'Bem-vindo!',
        description: `Olá, ${candidato.nome_completo?.split(' ')[0]}!`,
      });

      navigate('/recrutamento/candidato/vagas');
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro ao entrar',
        description: obterMensagemErro(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Callback quando email é verificado via OTP
  const handleEmailVerificado = async () => {
    setIsLoading(true);

    try {
      // Confirmar email no auth.users via função administrativa
      // Primeiro, buscar o candidato para obter o auth_user_id
      const { data: candidato } = await supabase
        .from('candidatos_recrutamento')
        .select('id, auth_user_id, nome_completo')
        .eq('email', emailPendente)
        .single();

      if (candidato?.auth_user_id) {
        // Chamar função RPC para confirmar email no Supabase Auth
        await supabase.rpc('confirmar_email_usuario', {
          p_auth_user_id: candidato.auth_user_id,
        });
      }

      // Marcar email como verificado na nossa tabela
      if (candidato?.id) {
        await supabase
          .from('candidatos_recrutamento')
          .update({
            email_verificado: true,
            email_verificado_em: new Date().toISOString(),
          })
          .eq('id', candidato.id);
      }

      // Tentar login novamente
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailPendente,
        password: senhaPendente,
      });

      if (authError) {
        // Se ainda der erro, redirecionar para login
        toast({
          title: 'Email verificado!',
          description: 'Por favor, faça login novamente.',
        });
        setMostrarVerificacaoEmail(false);
        setEmail(emailPendente);
        setSenha('');
        return;
      }

      // Login bem-sucedido após verificação
      toast({
        title: 'Bem-vindo!',
        description: `Email verificado e login realizado com sucesso!`,
      });

      navigate('/recrutamento/candidato/vagas');
    } catch (error) {
      console.error('Erro após verificação:', error);
      toast({
        title: 'Email verificado!',
        description: 'Por favor, faça login novamente.',
      });
      setMostrarVerificacaoEmail(false);
      setEmail(emailPendente);
      setSenha('');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading enquanto verifica sessão
  if (verificandoSessao) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
      </div>
    );
  }

  // Tela de verificação de email
  if (mostrarVerificacaoEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Verificar Email
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Para sua segurança, precisamos verificar seu email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <VerificacaoOTP
              email={emailPendente}
              tipo="candidato"
              onVerificado={handleEmailVerificado}
              onPular={() => {
                setMostrarVerificacaoEmail(false);
                toast({
                  title: 'Verificação cancelada',
                  description: 'Você pode tentar verificar seu email novamente.',
                  variant: 'destructive',
                });
              }}
              mostrarBotaoPular={true}
              autoEnviar={true}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {/* Banner de email verificado */}
            {emailVerificado && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-400">
                  E-mail verificado com sucesso! Faça login para continuar.
                </p>
              </div>
            )}

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
