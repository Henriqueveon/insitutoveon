import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CandidatoCadastro = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const totalEtapas = 7;

  const etapas = [
    "Dados Pessoais",
    "Situação Atual",
    "Experiência Profissional",
    "Formação",
    "Logística",
    "Vida Pessoal",
    "Expectativas"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="text-slate-400 mb-4"
          onClick={() => navigate('/recrutamento/candidato/bem-vindo')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-white">
                Etapa {etapa} de {totalEtapas}: {etapas[etapa - 1]}
              </CardTitle>
            </div>
            <Progress value={(etapa / totalEtapas) * 100} className="h-2" />
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-center py-12">
              Formulário de {etapas[etapa - 1]} em construção...
            </p>

            <div className="flex justify-between mt-6">
              <Button 
                variant="outline"
                onClick={() => setEtapa(Math.max(1, etapa - 1))}
                disabled={etapa === 1}
              >
                Anterior
              </Button>
              <Button 
                onClick={() => setEtapa(Math.min(totalEtapas, etapa + 1))}
                disabled={etapa === totalEtapas}
              >
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidatoCadastro;
