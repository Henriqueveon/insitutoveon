import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessment } from '@/context/AssessmentContext';
import { User, Phone, Briefcase, Building2, ArrowRight } from 'lucide-react';

export default function Identification() {
  const navigate = useNavigate();
  const { setCandidate } = useAssessment();
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cargoAtual: '',
    empresa: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.cargoAtual.trim()) newErrors.cargoAtual = 'Cargo é obrigatório';
    if (!formData.empresa.trim()) newErrors.empresa = 'Empresa é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setCandidate(formData);
      navigate('/instrucoes');
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-lg card-elevated animate-scale-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl sm:text-3xl text-foreground">
              Bem-vindo(a)!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Preencha seus dados para iniciar a análise de perfil comportamental
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  className={errors.telefone ? 'border-destructive' : ''}
                />
                {errors.telefone && (
                  <p className="text-sm text-destructive">{errors.telefone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargoAtual" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Cargo Atual
                </Label>
                <Input
                  id="cargoAtual"
                  name="cargoAtual"
                  placeholder="Ex: Gerente de Vendas"
                  value={formData.cargoAtual}
                  onChange={handleChange}
                  className={errors.cargoAtual ? 'border-destructive' : ''}
                />
                {errors.cargoAtual && (
                  <p className="text-sm text-destructive">{errors.cargoAtual}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  name="empresa"
                  placeholder="Nome da empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  className={errors.empresa ? 'border-destructive' : ''}
                />
                {errors.empresa && (
                  <p className="text-sm text-destructive">{errors.empresa}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gradient-veon hover:opacity-90 transition-opacity"
              >
                Próximo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>"Eu sou a bússola que aponta para o sucesso!"</p>
      </footer>
    </div>
  );
}
