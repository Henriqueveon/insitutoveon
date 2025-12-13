import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmpresaLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar login
    console.log("Login:", { email, senha });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            className="absolute left-4 top-4 text-slate-400"
            onClick={() => navigate('/recrutamento')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-white">Login Empresa</CardTitle>
          <CardDescription className="text-slate-400">
            Acesse sua conta para gerenciar candidatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="E-mail do sócio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              Não tem conta?{" "}
              <Button 
                variant="link" 
                className="text-primary p-0"
                onClick={() => navigate('/recrutamento/empresa/cadastro')}
              >
                Cadastre-se
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmpresaLogin;
