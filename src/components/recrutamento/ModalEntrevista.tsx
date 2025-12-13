import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalEntrevistaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalEntrevista = ({ open, onOpenChange }: ModalEntrevistaProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Solicitar Entrevista</DialogTitle>
          <DialogDescription className="text-slate-400">
            Componente em construção...
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-400 text-center">Modal de entrevista em construção...</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEntrevista;
