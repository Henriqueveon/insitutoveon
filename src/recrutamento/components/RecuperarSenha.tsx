// =====================================================
// RECUPERAR SENHA - Componente reutilizável
// Para empresa e candidato
// =====================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft, CheckCircle, Building2, User } from 'lucide-react';

interface RecuperarSenhaProps {
  tipo: 'empresa' | 'candidato';
}

export default function RecuperarSenha({ tipo }: RecuperarSenhaProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const tabela = tipo === 'empresa' ? 'empresas_recrutamento' : 'candidatos_recrutamento';
  const campoEmail = tipo === 'empresa' ? 'socio_email' : 'email';
  const loginUrl = tipo === 'empresa' ? '/recrutamento/empresa/login' : '/recrutamento/candidato/login';
  const titulo = tipo === 'empresa' ? 'Área da Empresa' : 'Área do Profissional';
  const Icon = tipo === 'empresa' ? Building2 : User;

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Campo obrigatório',
        description: 'Digite seu e-mail.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificar se o email existe na tabela
      const { data: registro, error: registroError } = await supabase
        .from(tabela)
        .select('id')
        .eq(campoEmail, email.toLowerCase().trim())
        .single();

      if (registroError || !registro) {
        throw new Error('E-mail não encontrado. Verifique ou faça seu cadastro.');
      }

      // 2. Enviar email de recuperação via Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/recrutamento/${tipo}/redefinir-senha`,
      });

      if (error) {
        // Se o usuário não existe no Auth, informar que precisa completar cadastro
        if (error.message.includes('User not found')) {
          throw new Error('Você ainda não criou uma senha. Complete seu cadastro primeiro.');
        }
        throw error;
      }

      setEnviado(true);
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada.',
      });
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">E-mail enviado!</h2>
            <p className="text-slate-400 mb-6">
              Enviamos um link para <strong className="text-white">{email}</strong>.
              <br />
              Verifique sua caixa de entrada e spam.
            </p>
            <Button
              onClick={() => navigate(loginUrl)}
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              Voltar para o login
            </Button>
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

      <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm max-w-md w-full relative z-10">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              {titulo}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRecuperar} className="space-y-4">
            <p className="text-slate-300 text-sm text-center mb-4">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#E31E24] focus:ring-[#E31E24]/20 pl-10"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Botão enviar */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] text-white font-semibold py-5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
              )}
            </Button>
          </form>

          {/* Voltar */}
          <div className="mt-6 text-center">
            <Link
              to={loginUrl}
              className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
