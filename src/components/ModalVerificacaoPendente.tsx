// =====================================================
// MODAL DE VERIFICAÇÃO PENDENTE
// Exibido no login quando email não está verificado
// =====================================================

import { useState } from 'react';
import { VerificacaoOTP } from './VerificacaoOTP';
import { Mail, Shield, X } from 'lucide-react';

interface ModalVerificacaoPendenteProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  nome?: string;
  tipo: 'candidato' | 'empresa';
  usuarioId: string;
  onVerificado: () => void;
}

export function ModalVerificacaoPendente({
  isOpen,
  onClose,
  email,
  nome,
  tipo,
  usuarioId,
  onVerificado,
}: ModalVerificacaoPendenteProps) {
  const [verificando, setVerificando] = useState(false);

  const handlePular = () => {
    onClose();
  };

  const handleVerificado = () => {
    onVerificado();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Verificar Email
          </h2>
          <button
            onClick={handlePular}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Mensagem */}
          <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verificação Pendente
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Seu email ainda não foi verificado. Verifique agora para garantir a segurança da sua conta e receber notificações importantes.
            </p>
          </div>

          {/* Componente de verificação */}
          <VerificacaoOTP
            email={email}
            nome={nome}
            tipo={tipo}
            usuarioId={usuarioId}
            onVerificado={handleVerificado}
            onPular={handlePular}
            mostrarBotaoPular={true}
            autoEnviar={true}
          />
        </div>
      </div>
    </div>
  );
}

export default ModalVerificacaoPendente;
