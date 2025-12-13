import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "disponivel":
        return { label: "Disponível", className: "bg-green-500/20 text-green-500 border-green-500/50" };
      case "em_processo":
        return { label: "Em Processo", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" };
      case "contratado":
        return { label: "Contratado", className: "bg-blue-500/20 text-blue-500 border-blue-500/50" };
      case "aguardando_candidato":
        return { label: "Aguardando Candidato", className: "bg-orange-500/20 text-orange-500 border-orange-500/50" };
      case "aceito":
        return { label: "Aceito", className: "bg-green-500/20 text-green-500 border-green-500/50" };
      case "recusado":
        return { label: "Recusado", className: "bg-red-500/20 text-red-500 border-red-500/50" };
      case "ativa":
        return { label: "Ativa", className: "bg-green-500/20 text-green-500 border-green-500/50" };
      case "inativa":
        return { label: "Inativa", className: "bg-slate-500/20 text-slate-500 border-slate-500/50" };
      default:
        return { label: status, className: "bg-slate-500/20 text-slate-500 border-slate-500/50" };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
