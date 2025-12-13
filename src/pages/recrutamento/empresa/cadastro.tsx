import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmpresaCadastro = () => {
  const navigate = useNavigate();
  const [cnpj, setCnpj] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            className="absolute left-4 top-4 text-slate-400"
            onClick={() => navigate('/recrutamento/empresa/login')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-white">Cadastro de Empresa</CardTitle>
          <CardDescription className="text-slate-400">
            Digite o CNPJ para buscar automaticamente os dados da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-center text-xl"
              />
            </div>
            <Button className="w-full">
              Buscar Dados do CNPJ
            </Button>
          </div>
          {/* TODO: Formulário completo após busca do CNPJ */}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmpresaCadastro;
