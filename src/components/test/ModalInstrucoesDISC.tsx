// =====================================================
// MODAL DE INSTRUÇÕES - Exibido antes de iniciar o teste DISC
// Avisa sobre os 21 dias e dá dicas para melhor resultado
// =====================================================

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Brain, Volume2, CheckCircle } from "lucide-react";

interface ModalInstrucoesDISCProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function ModalInstrucoesDISC({ isOpen, onClose, onStart }: ModalInstrucoesDISCProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0 bg-zinc-900 border-zinc-800">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-center text-white">
            Teste de Perfil Comportamental DISC
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-6">
          {/* AVISO IMPORTANTE */}
          <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-400">IMPORTANTE</p>
                <p className="text-amber-200/80 text-sm mt-1">
                  Ao começar este teste, você só poderá refazê-lo após <strong className="text-amber-300">21 dias</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* INSTRUÇÕES */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="text-lg">📋</span> Instruções:
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-3">
                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Ao começar, termine.</strong> Reserve cerca de 10-15 minutos para completar o teste sem interrupções.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-3">
                <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Não se distraia.</strong> Mantenha o foco durante todo o teste para resultados mais precisos.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-3">
                <Volume2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Ambiente tranquilo.</strong> Evite barulhos e interrupções.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Sem respostas certas ou erradas.</strong> Responda com sinceridade, baseado em como você realmente age.
                </p>
              </div>
            </div>
          </div>

          {/* BOTÃO COMEÇAR */}
          <div className="pt-2">
            <Button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl"
            >
              Começar Teste
            </Button>
          </div>

          {/* TEXTO LEGAL */}
          <p className="text-xs text-gray-500 text-center">
            Ao clicar em "Começar Teste", você concorda em responder todas as questões com sinceridade.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
