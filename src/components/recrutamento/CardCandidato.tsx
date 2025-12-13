import { Card, CardContent } from "@/components/ui/card";
import { CandidatoRecrutamento } from "@/types/recrutamento.types";

interface CardCandidatoProps {
  candidato: CandidatoRecrutamento;
  onClick?: () => void;
}

const CardCandidato = ({ candidato, onClick }: CardCandidatoProps) => {
  return (
    <Card 
      className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
            {candidato.foto_url ? (
              <img src={candidato.foto_url} alt={candidato.nome_completo} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold">{candidato.nome_completo.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">{candidato.nome_completo}</h3>
            <p className="text-slate-400 text-sm">{candidato.cidade}, {candidato.estado}</p>
          </div>
          {candidato.perfil_disc && (
            <div className="px-3 py-1 bg-primary/20 rounded-full">
              <span className="text-primary font-bold text-sm">{candidato.perfil_disc}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardCandidato;
