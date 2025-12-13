import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecrutamentoIndex = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Área de Recrutamento VEON
          </h1>
          <p className="text-slate-300 text-lg">
            Conectando empresas aos melhores talentos do varejo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate('/recrutamento/empresa/login')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-white">Sou Empresa</CardTitle>
              <CardDescription className="text-slate-400">
                Encontre os melhores candidatos com perfil DISC compatível
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors">
                Acessar <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all cursor-pointer group"
                onClick={() => navigate('/recrutamento/candidato/bem-vindo')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-colors">
                <User className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-white">Sou Candidato</CardTitle>
              <CardDescription className="text-slate-400">
                Cadastre-se e seja encontrado por empresas do varejo
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="group-hover:bg-green-500 group-hover:text-white transition-colors border-green-500/50 text-green-500">
                Começar <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecrutamentoIndex;
