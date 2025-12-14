// =====================================================
// MODAL CADASTRO INCOMPLETO - Bloqueia visualização
// Aparece quando empresa tenta ver perfil sem completar cadastro
// =====================================================

import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ArrowRight,
  Shield,
  Users,
  Eye,
} from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CadastroIncompletoModal({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  const handleCompletarCadastro = () => {
    onOpenChange(false);
    navigate('/recrutamento/empresa/completar-cadastro');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-white text-xl text-center">
            Cadastro Incompleto
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-center">
            Complete seu cadastro para visualizar o perfil completo deste profissional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefícios de completar */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Ver perfis completos</p>
                <p className="text-slate-400 text-xs">Acesse foto, vídeo e informações detalhadas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <Users className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Enviar propostas</p>
                <p className="text-slate-400 text-xs">Entre em contato com profissionais</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Dados protegidos</p>
                <p className="text-slate-400 text-xs">Suas informações estão seguras</p>
              </div>
            </div>
          </div>

          {/* O que falta */}
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-400 text-sm font-medium mb-1">
              O que falta preencher:
            </p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>• Nome do responsável pela empresa</li>
              <li>• Função na empresa</li>
              <li>• CPF do responsável</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleCompletarCadastro}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Completar Cadastro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            Continuar navegando
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500">
          Leva menos de 1 minuto para completar
        </p>
      </DialogContent>
    </Dialog>
  );
}
