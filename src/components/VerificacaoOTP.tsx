// =====================================================
// COMPONENTE REUTILIZÁVEL DE VERIFICAÇÃO OTP
// Pode ser usado em modais, páginas, etc.
// =====================================================

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Mail,
  Loader2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface VerificacaoOTPProps {
  email: string;
  nome?: string;
  tipo?: 'candidato' | 'empresa';
  usuarioId?: string;
  onVerificado: () => void;
  onPular?: () => void;
  mostrarBotaoPular?: boolean;
  autoEnviar?: boolean;
}

export function VerificacaoOTP({
  email,
  nome,
  tipo = 'candidato',
  usuarioId,
  onVerificado,
  onPular,
  mostrarBotaoPular = true,
  autoEnviar = true,
}: VerificacaoOTPProps) {
  const { toast } = useToast();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown para reenviar código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto enviar OTP quando componente monta
  useEffect(() => {
    if (autoEnviar && !otpEnviado) {
      enviarCodigoOTP();
    }
  }, []);

  // Enviar código OTP
  const enviarCodigoOTP = async () => {
    setIsLoading(true);
    setErro('');

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email: email.toLowerCase().trim(),
          tipo: 'verificacao_email',
          nome: nome || '',
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao enviar código');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar código');
      }

      setOtpEnviado(true);
      setCountdown(60);
      toast({
        title: 'Código enviado!',
        description: `Verifique sua caixa de entrada: ${data.email_masked}`,
      });

      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);

    } catch (error: any) {
      console.error('Erro ao enviar OTP:', error);
      toast({
        title: 'Erro ao enviar código',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar código OTP
  const verificarCodigoOTP = async () => {
    const codigo = otpDigits.join('');

    if (codigo.length !== 6) {
      setErro('Digite o código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setErro('');

    try {
      const emailLower = email.toLowerCase().trim();

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          email: emailLower,
          codigo,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao verificar código');
      }

      if (!data.valid) {
        setErro(data.error || 'Código inválido');
        return;
      }

      // Marcar email como verificado na tabela correta
      if (usuarioId) {
        const tabela = tipo === 'candidato' ? 'candidatos_recrutamento' : 'empresas_recrutamento';
        await supabase
          .from(tabela)
          .update({
            email_verificado: true,
            email_verificado_em: new Date().toISOString(),
          })
          .eq('id', usuarioId);
      }

      toast({
        title: 'Email verificado!',
        description: 'Seu email foi verificado com sucesso.',
      });

      onVerificado();

    } catch (error: any) {
      console.error('Erro ao verificar OTP:', error);
      setErro(error.message || 'Código inválido ou expirado');
    } finally {
      setIsLoading(false);
    }
  };

  // Manipular input OTP
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);

    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5 && newDigits.every(d => d)) {
      setTimeout(() => verificarCodigoOTP(), 100);
    }
  };

  // Manipular backspace no OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Colar código OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length === 6) {
      const newDigits = pastedData.split('');
      setOtpDigits(newDigits);
      otpInputRefs.current[5]?.focus();
      setTimeout(() => verificarCodigoOTP(), 100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Aviso */}
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">Verifique seu email</p>
            <p className="text-yellow-700 dark:text-yellow-300/70 text-xs mt-1">
              A verificação ajuda a proteger sua conta e garante que você receba notificações importantes.
            </p>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">Código enviado para:</p>
        <p className="text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          {email}
        </p>
      </div>

      {/* Input OTP */}
      <div className="space-y-2">
        <label className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          Código de verificação
        </label>
        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
          {otpDigits.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (otpInputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold ${erro ? 'border-red-500' : ''}`}
            />
          ))}
        </div>
        {erro && (
          <p className="text-red-500 text-xs text-center">{erro}</p>
        )}
      </div>

      {/* Reenviar código */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-500">
            Reenviar código em <span className="font-mono font-medium">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={enviarCodigoOTP}
            disabled={isLoading}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Reenviar código
          </button>
        )}
      </div>

      {/* Botões */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={verificarCodigoOTP}
          disabled={isLoading || otpDigits.some(d => !d)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              Verificar email
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {mostrarBotaoPular && onPular && (
          <Button
            onClick={onPular}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Verificar depois
          </Button>
        )}
      </div>
    </div>
  );
}

export default VerificacaoOTP;
