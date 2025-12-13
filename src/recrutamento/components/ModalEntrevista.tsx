// =====================================================
// MODAL ENTREVISTA - Área de Recrutamento VEON
// Modal para solicitar/aceitar entrevista
// =====================================================

import { SolicitacaoEntrevista } from '../types/recrutamento.types';

interface ModalEntrevistaProps {
  isOpen: boolean;
  onClose: () => void;
  solicitacao?: SolicitacaoEntrevista;
  tipo: 'solicitar' | 'responder';
  onConfirmar: () => void;
}

export default function ModalEntrevista({
  isOpen,
  onClose,
  solicitacao,
  tipo,
  onConfirmar,
}: ModalEntrevistaProps) {
  // TODO: Implementar na Fase 4
  if (!isOpen) return null;

  return (
    <div>
      <h3>Modal Entrevista</h3>
    </div>
  );
}
