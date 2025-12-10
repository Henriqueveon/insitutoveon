import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssessment } from '@/context/AssessmentContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Briefcase, Instagram, ArrowRight, Loader2 } from 'lucide-react';

const CARGO_OPTIONS = [
  'Sócio/Empresário',
  'Executivo/C-level',
  'Gerente Comercial',
  'Consultor/Vendedor',
  'Auxiliar de Escritório',
  'SDR',
  'Closer',
];

export default function Identification() {
  const navigate = useNavigate();
  const { setCandidate } = useAssessment();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone_whatsapp: '',
    cargo_atual: '',
    empresa_instagram: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatInstagram = (value: string) => {
    const cleaned = value.replace(/^@+/, '').trim();
    return cleaned ? `@${cleaned}` : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'telefone_whatsapp') {
      formattedValue = formatPhone(value);
    } else if (name === 'empresa_instagram') {
      formattedValue = formatInstagram(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCargoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, cargo_atual: value }));
    if (errors.cargo_atual) {
      setErrors((prev) => ({ ...prev, cargo_atual: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = 'Nome é obrigatório';
    } else if (formData.nome_completo.trim().length < 3) {
      newErrors.nome_completo = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    const phoneNumbers = formData.telefone_whatsapp.replace(/\D/g, '');
    if (!phoneNumbers) {
      newErrors.telefone_whatsapp = 'Telefone é obrigatório';
    } else if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      newErrors.telefone_whatsapp = 'Telefone inválido';
    }
    
    if (!formData.cargo_atual) {
      newErrors.cargo_atual = 'Cargo é obrigatório';
    }
    
    if (!formData.empresa_instagram.trim()) {
      newErrors.empresa_instagram = '@ da empresa é obrigatório';
    } else if (!formData.empresa_instagram.startsWith('@')) {
      newErrors.empresa_instagram = 'Deve começar com @';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('candidatos_disc')
        .insert({
          nome_completo: formData.nome_completo.trim(),
          telefone_whatsapp: formData.telefone_whatsapp,
          cargo_atual: formData.cargo_atual,
          empresa_instagram: formData.empresa_instagram,
        })
        .select('id')
        .single();

      if (error) throw error;

      setCandidate({
        id: data.id,
        ...formData,
      });

      localStorage.setItem('candidato_id', data.id);

      toast({
        title: 'Cadastro realizado!',
        description: 'Seus dados foram salvos com sucesso.',
      });

      navigate('/instrucoes');
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar seus dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    if (errors[fieldName]) return 'border-destructive focus:ring-destructive';
    if (formData[fieldName as keyof typeof formData]) return 'border-green-500 focus:ring-green-500';
    return '';
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
                <Label htmlFor="nome_completo" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Nome Completo
                </Label>
                <Input
                  id="nome_completo"
                  name="nome_completo"
                  placeholder="Digite seu nome completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  className={getInputClass('nome_completo')}
                  disabled={isLoading}
                />
                {errors.nome_completo && (
                  <p className="text-sm text-destructive">{errors.nome_completo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone_whatsapp" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="telefone_whatsapp"
                  name="telefone_whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone_whatsapp}
                  onChange={handleChange}
                  className={getInputClass('telefone_whatsapp')}
                  disabled={isLoading}
                />
                {errors.telefone_whatsapp && (
                  <p className="text-sm text-destructive">{errors.telefone_whatsapp}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo_atual" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Cargo Atual
                </Label>
                <Select 
                  value={formData.cargo_atual} 
                  onValueChange={handleCargoChange}
                  disabled={isLoading}
                >
                  <SelectTrigger 
                    id="cargo_atual"
                    className={getInputClass('cargo_atual')}
                  >
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {CARGO_OPTIONS.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>
                        {cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cargo_atual && (
                  <p className="text-sm text-destructive">{errors.cargo_atual}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa_instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-muted-foreground" />
                  Coloque o @exato da empresa/loja que trabalha
                </Label>
                <Input
                  id="empresa_instagram"
                  name="empresa_instagram"
                  placeholder="@nomedaempresa"
                  value={formData.empresa_instagram}
                  onChange={handleChange}
                  className={getInputClass('empresa_instagram')}
                  disabled={isLoading}
                />
                {errors.empresa_instagram && (
                  <p className="text-sm text-destructive">{errors.empresa_instagram}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gradient-veon hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
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
