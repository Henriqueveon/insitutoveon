// =====================================================
// MODAL DE INSTRUÇÕES - Exibido antes de iniciar o teste DISC
// Design persuasivo com aviso de 21 dias e botão "Fazer depois"
// =====================================================

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ModalInstrucoesDISCProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function ModalInstrucoesDISC({ isOpen, onClose, onStart }: ModalInstrucoesDISCProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 max-h-[75vh] overflow-y-auto p-0 bg-zinc-900 border-zinc-800 pb-20">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-center text-white">
            Prepare-se para sua Análise
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-6">
          {/* AVISO DOS 21 DIAS - Destaque visual */}
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-400">Atenção</p>
                <p className="text-amber-200/80 text-sm mt-1">
                  Após iniciar, você só poderá refazer este teste em <strong className="text-amber-300">21 dias</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* INSTRUÇÕES */}
          <div>
            <h3 className="font-semibold text-white mb-4">Para um resultado preciso:</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-white">Ao começar, termine</p>
                  <p className="text-sm text-gray-400">Reserve 10-15 minutos sem interrupções</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-white">Ambiente tranquilo</p>
                  <p className="text-sm text-gray-400">Evite distrações e barulhos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-white">Seja autêntico</p>
                  <p className="text-sm text-gray-400">Não existe certo ou errado, responda como você é</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <p className="font-medium text-white">Confie no instinto</p>
                  <p className="text-sm text-gray-400">Primeira resposta é geralmente a mais verdadeira</p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÕES - DOIS BOTÕES */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onStart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-xl"
            >
              Iniciar Teste Agora
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800 py-3 rounded-xl"
            >
              Fazer Depois
            </Button>
          </div>

          {/* Texto de segurança */}
          <p className="text-xs text-gray-500 text-center">
            🔒 Suas respostas são confidenciais e protegidas
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
