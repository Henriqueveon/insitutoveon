import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CandidatoBemVindo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            className="absolute left-4 top-4 text-slate-400"
            onClick={() => navigate('/recrutamento')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-white text-2xl">Bem-vindo ao Recrutamento VEON!</CardTitle>
          <CardDescription className="text-slate-400 text-lg">
            Cadastre-se e seja encontrado por empresas do varejo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Cadastro gratuito</p>
                <p className="text-slate-400 text-sm">Preencha suas informações em poucos minutos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Teste DISC incluído</p>
                <p className="text-slate-400 text-sm">Descubra seu perfil comportamental</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Empresas te encontram</p>
                <p className="text-slate-400 text-sm">Receba propostas de empresas interessadas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Match inteligente</p>
                <p className="text-slate-400 text-sm">Conectamos você com vagas compatíveis</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={() => navigate('/recrutamento/candidato/cadastro')}
          >
            Começar Cadastro <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatoBemVindo;
