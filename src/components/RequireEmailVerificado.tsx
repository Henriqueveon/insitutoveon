// =====================================================
// COMPONENTE WRAPPER PARA EXIGIR EMAIL VERIFICADO
// Envolva qualquer componente que precisa de email verificado
// =====================================================

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { VerificacaoOTP } from '@/components/VerificacaoOTP';
import { Mail, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useRequireEmailVerificado } from '@/hooks/useRequireEmailVerificado';

interface RequireEmailVerificadoProps {
  children: ReactNode;
  candidatoId?: string;
  empresaId?: string;
  tipo?: 'candidato' | 'empresa';
  onVerificado?: () => void;
  rotaRetorno?: string;
  titulo?: string;
  descricao?: string;
}

export function RequireEmailVerificado({
  children,
  candidatoId,
  empresaId,
  tipo = 'candidato',
  onVerificado,
  rotaRetorno,
  titulo = 'Confirme seu Email',
  descricao = 'Para continuar, precisamos verificar seu email',
}: RequireEmailVerificadoProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    isLoading,
    emailVerificado,
    email,
    nome,
    usuarioId,
    recarregar,
    marcarComoVerificado,
  } = useRequireEmailVerificado({
    candidatoId,
    empresaId,
    tipo,
  });

  // Sem ID de usuário - mostrar loading ou retornar children
  if (!candidatoId && !empresaId) {
    // Retorna children se não há ID (deixa o componente pai lidar)
    return <>{children}</>;
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
      </div>
    );
  }

  // Email não encontrado
  if (!email && usuarioId) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Email não encontrado</h2>
            <p className="text-slate-400 text-sm mb-4">
              Não foi possível carregar seu email. Tente novamente.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#E31E24] hover:bg-[#C91920]"
            >
              Recarregar página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email verificado - mostrar conteúdo
  if (emailVerificado) {
    return <>{children}</>;
  }

  // Email não verificado - mostrar verificação
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">
              {titulo}
            </CardTitle>
            <p className="text-slate-400 mt-2 text-sm">
              {descricao}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Aviso de segurança */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 text-sm font-medium">Por que verificar?</p>
                <p className="text-amber-300/70 text-xs mt-1">
                  A verificação protege sua conta e garante que empresas entrem em contato pelo email correto.
                </p>
              </div>
            </div>
          </div>

          {/* Componente de verificação OTP */}
          <VerificacaoOTP
            email={email}
            nome={nome}
            tipo={tipo}
            usuarioId={usuarioId}
            onVerificado={() => {
              marcarComoVerificado();
              toast({
                title: 'Email verificado!',
                description: 'Agora você pode continuar.',
              });
              onVerificado?.();
              recarregar();
            }}
            onPular={() => {
              if (rotaRetorno) {
                navigate(rotaRetorno);
              } else {
                navigate(-1);
              }
              toast({
                title: 'Verificação pendente',
                description: 'Você precisa verificar seu email para continuar.',
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

export default RequireEmailVerificado;
