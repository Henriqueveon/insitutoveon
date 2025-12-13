import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VagaRecrutamento } from "@/types/recrutamento.types";
import { MapPin, Clock, Briefcase } from "lucide-react";

interface CardVagaProps {
  vaga: VagaRecrutamento;
  onClick?: () => void;
}

const CardVaga = ({ vaga, onClick }: CardVagaProps) => {
  return (
    <Card 
      className="bg-slate-800 border-slate-700 hover:border-green-500/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{vaga.titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {vaga.cidade}, {vaga.estado}
          </div>
          {vaga.regime && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {vaga.regime}
            </div>
          )}
          {vaga.horario && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {vaga.horario}
            </div>
          )}
        </div>
        
        {vaga.faixa_salarial_min && vaga.faixa_salarial_max && (
          <p className="text-green-500 font-medium">
            R$ {vaga.faixa_salarial_min.toLocaleString()} - R$ {vaga.faixa_salarial_max.toLocaleString()}
          </p>
        )}

        {vaga.perfil_disc_ideal && (
          <Badge variant="outline" className="border-primary text-primary">
            Perfil ideal: {vaga.perfil_disc_ideal}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default CardVaga;
