import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthAnalista } from '@/context/AuthAnalistaContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, isAuthenticated, tipoUsuario } = useAuthAnalista();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated && tipoUsuario) {
      if (tipoUsuario === 'fundador') {
        navigate('/fundador/dashboard');
      } else {
        navigate('/analista/dashboard');
      }
    }
  }, [isAuthenticated, tipoUsuario, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha e-mail e senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const resultado = await login(email, password);

      if (!resultado.success) {
        toast({
          title: 'Erro ao entrar',
          description: resultado.error || 'E-mail ou senha incorretos.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });

      // O redirecionamento será feito pelo useEffect acima
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#003366]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#E31E24]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <Logo />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Painel do Analista</h1>
          <p className="text-slate-400 mt-2">Acesse sua conta para gerenciar avaliações</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">Entrar</CardTitle>
            <CardDescription className="text-slate-400">
              Use suas credenciais de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#004488] hover:to-[#003366] text-white font-semibold"
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

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Problemas para acessar?{' '}
                <a
                  href="mailto:suporte@institutoveon.com.br"
                  className="text-[#00D9FF] hover:underline"
                >
                  Contate o suporte
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Instituto VEON - Escola do Varejo
        </p>
      </div>
    </div>
  );
}
