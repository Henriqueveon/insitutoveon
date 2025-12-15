import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Users, Shield, CheckCircle2, Loader2 } from "lucide-react";

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  cidade: string;
  estado: string;
}

interface ModalConfirmacaoEntrevistaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidato: Candidato | null;
  socioNome?: string | null;
  loading: boolean;
  onConfirmar: () => void;
}

export function ModalConfirmacaoEntrevista({
  open,
  onOpenChange,
  candidato,
  socioNome,
  loading,
  onConfirmar
}: ModalConfirmacaoEntrevistaProps) {
  if (!candidato) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-gray-700 max-w-md mx-4">
        <AlertDialogHeader className="text-center">
          {/* Icone com gradiente */}
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-[#E31E24]/20 to-[#1E3A8A]/20 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>

          <AlertDialogTitle className="text-xl text-white text-center">
            Parece que voce encontrou um otimo profissional, {socioNome?.split(' ')[0] || 'Parceiro'}!
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="text-center space-y-4 pt-4">
              {/* Card do candidato */}
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
                {candidato.foto_url ? (
                  <img
                    src={candidato.foto_url}
                    alt={candidato.nome_completo}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-400">
                      {candidato.nome_completo?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="font-medium text-white">{candidato.nome_completo}</p>
                  <p className="text-sm text-gray-400">{candidato.cidade}, {candidato.estado}</p>
                </div>
              </div>

              {/* Card de protecao */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Investimento protegido</p>
                    <p className="text-gray-300 text-sm">
                      Ao confirmar, voce investe <span className="text-white font-semibold">R$ 39,90</span> para
                      agendar esta entrevista. <span className="text-green-400 font-medium">Voce so paga se o
                      candidato aceitar!</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Beneficios */}
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Candidato demonstra compromisso pagando R$ 9,90</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Evite perda de tempo com profissionais sem interesse</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Reembolso automatico se nao houver aceite</span>
                </div>
              </div>

              {/* Texto pequeno */}
              <p className="text-xs text-gray-500 pt-2">
                Ao aceitar, o candidato paga R$ 9,90 demonstrando absoluto compromisso com sua empresa.
                Assim voce evita perda de tempo com profissionais que nao tem comprometimento real.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white">
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmar}
            disabled={loading}
            className="bg-gradient-to-r from-[#E31E24] to-[#1E3A8A] hover:from-[#E31E24]/90 hover:to-[#1E3A8A]/90 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Confirmar Entrevista
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
