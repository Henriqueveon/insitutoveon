import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '@/context/AssessmentContext';
import { sprangerQuestions } from '@/data/sprangerQuestions';
import { discQuestions, discSituationalQuestions } from '@/data/discQuestions';
import { SprangerInstructions } from '@/components/spranger/SprangerInstructions';
import { SprangerQuestion } from '@/components/spranger/SprangerQuestion';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, Briefcase, Instagram, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type Phase = 'instructions' | 'test' | 'form';

// Lista de cargos em ordem alfabética
const CARGO_OPTIONS = [
  'Advogado(a)',
  'Arquiteto(a)',
  'Auxiliar Administrativo',
  'Closer',
  'Consultor(a)/Vendedor(a)',
  'Designer',
  'Executivo(a)/C-level',
  'Gerente Comercial',
  'Médico(a)/Profissional de Saúde',
  'Prestador(a) de Serviços Digitais',
  'Professor(a)/Educador(a)',
  'SDR',
  'Sócio(a)/Empresário(a)',
  'Treinador(a)/Coach',
  'Outro',
];

export default function SprangerTest() {
  const navigate = useNavigate();
  const {
    answers,
    situationalAnswers,
    naturalProfile,
    sprangerAnswers,
    addSprangerAnswer,
    calculateSprangerProfile,
    setSprangerStartTime,
    setCandidate,
  } = useAssessment();

  const [phase, setPhase] = useState<Phase>('instructions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone_whatsapp: '',
    cargo_atual: '',
    empresa_instagram: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if previous tests not completed
  useEffect(() => {
    // Check if DISC test completed (25 questions)
    if (answers.length < discQuestions.length) {
      navigate('/teste');
      return;
    }
    // Check if situational test completed (6 questions)
    if (situationalAnswers.length < discSituationalQuestions.length) {
      navigate('/teste-situacional');
      return;
    }
  }, [answers, situationalAnswers, navigate]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatInstagram = (value: string) => {
    // Remove @ if user types it, we'll add it automatically
    let formatted = value.replace('@', '').trim();
    if (formatted && !formatted.startsWith('@')) {
      formatted = '@' + formatted;
    }
    return formatted || '';
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = 'Nome é obrigatório';
    } else if (formData.nome_completo.trim().length < 3) {
      newErrors.nome_completo = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
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
      newErrors.empresa_instagram = 'Instagram é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Calculate Spranger profile
      calculateSprangerProfile();

      // Save to Supabase
      const { data, error } = await supabase
        .from('candidatos_disc')
        .insert({
          nome_completo: formData.nome_completo.trim(),
          email: formData.email.trim(),
          telefone_whatsapp: formData.telefone_whatsapp,
          cargo_atual: formData.cargo_atual,
          empresa_instagram: formData.empresa_instagram,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Save to Notion via edge function
      try {
        const notionResponse = await supabase.functions.invoke('notion-sync', {
          body: {
            action: 'create_candidate',
            data: {
              nomeCompleto: formData.nome_completo.trim(),
              email: formData.email.trim(),
              telefoneWhatsApp: formData.telefone_whatsapp,
              cargoAtual: formData.cargo_atual,
              instagram: formData.empresa_instagram,
              candidatoId: data.id,
            },
          },
        });

        if (notionResponse.data?.notionPageId) {
          localStorage.setItem('candidato_notion_id', notionResponse.data.notionPageId);
        }
      } catch (notionError) {
        console.warn('Notion sync error (não crítico):', notionError);
      }

      // Set candidate in context
      setCandidate({
        id: data.id,
        nome_completo: formData.nome_completo.trim(),
        email: formData.email.trim(),
        telefone_whatsapp: formData.telefone_whatsapp,
        cargo_atual: formData.cargo_atual,
        empresa_instagram: formData.empresa_instagram,
      });

      localStorage.setItem('candidato_id', data.id);

      // Navigate to results
      navigate('/resultado');

    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Erro ao salvar seus dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    if (errors[fieldName]) return 'border-destructive focus:ring-destructive';
    if (formData[fieldName as keyof typeof formData]) return 'border-green-500 focus:ring-green-500';
    return '';
  };

  const handleStart = () => {
    setSprangerStartTime(Date.now());
    setPhase('test');
  };

  const handleAnswer = (ranking: string[]) => {
    const currentQuestion = sprangerQuestions[currentQuestionIndex];

    // Convert ranking array to the format expected by context
    // ranking[0] = 1st place (+3 pts), ranking[1] = 2nd (+2 pts), ranking[2] = 3rd (+1 pt), ranking[3] = 4th (0 pts)
    addSprangerAnswer({
      questionId: currentQuestion.id,
      ranking,
      timestamp: Date.now(),
    });

    // Check if this is the last question
    if (currentQuestionIndex === sprangerQuestions.length - 1) {
      // Show form after completing all questions
      setPhase('form');
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Get existing answer for current question if navigating back
  const getCurrentAnswer = () => {
    const currentQuestion = sprangerQuestions[currentQuestionIndex];
    const existingAnswer = sprangerAnswers.find(
      (a) => a.questionId === currentQuestion.id
    );
    return existingAnswer?.ranking;
  };

  if (phase === 'instructions') {
    return <SprangerInstructions onStart={handleStart} />;
  }

  if (phase === 'form') {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Header */}
        <header className="w-full py-4 px-4 sm:px-8 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo showText={false} />
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8 px-4">
          <div className="max-w-lg mx-auto">
            <Card className="shadow-lg border border-slate-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-display text-slate-800">
                  Parabéns! Teste Concluído
                </CardTitle>
                <CardDescription className="text-base text-slate-500">
                  Você respondeu todas as 46 perguntas! Agora preencha seus dados para ver seu resultado completo.
                </CardDescription>
              </CardHeader>

            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="nome_completo" className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-slate-500" />
                    Nome Completo
                  </Label>
                  <Input
                    id="nome_completo"
                    name="nome_completo"
                    placeholder="Digite seu nome completo"
                    value={formData.nome_completo}
                    onChange={handleFormChange}
                    className={`bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-primary ${getInputClass('nome_completo')}`}
                    disabled={isLoading}
                  />
                  {errors.nome_completo && (
                    <p className="text-sm text-red-600">{errors.nome_completo}</p>
                  )}
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-500" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={`bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-primary ${getInputClass('email')}`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Telefone/WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="telefone_whatsapp" className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-500" />
                    Telefone / WhatsApp
                  </Label>
                  <Input
                    id="telefone_whatsapp"
                    name="telefone_whatsapp"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone_whatsapp}
                    onChange={handleFormChange}
                    className={`bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-primary ${getInputClass('telefone_whatsapp')}`}
                    disabled={isLoading}
                  />
                  {errors.telefone_whatsapp && (
                    <p className="text-sm text-red-600">{errors.telefone_whatsapp}</p>
                  )}
                </div>

                {/* Cargo Atual - Select com 15 opções */}
                <div className="space-y-2">
                  <Label htmlFor="cargo_atual" className="flex items-center gap-2 text-slate-700">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    Cargo Atual
                  </Label>
                  <Select
                    value={formData.cargo_atual}
                    onValueChange={handleCargoChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={`bg-white border-slate-300 text-slate-800 ${getInputClass('cargo_atual')}`}>
                      <SelectValue placeholder="Selecione seu cargo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {CARGO_OPTIONS.map((cargo) => (
                        <SelectItem key={cargo} value={cargo} className="text-slate-800 hover:bg-slate-100">
                          {cargo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cargo_atual && (
                    <p className="text-sm text-red-600">{errors.cargo_atual}</p>
                  )}
                </div>

                {/* Instagram da Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="empresa_instagram" className="flex items-center gap-2 text-slate-700">
                    <Instagram className="w-4 h-4 text-slate-500" />
                    Instagram da Empresa
                  </Label>
                  <Input
                    id="empresa_instagram"
                    name="empresa_instagram"
                    placeholder="@suaempresa"
                    value={formData.empresa_instagram}
                    onChange={handleFormChange}
                    className={`bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-primary ${getInputClass('empresa_instagram')}`}
                    disabled={isLoading}
                  />
                  {errors.empresa_instagram && (
                    <p className="text-sm text-red-600">{errors.empresa_instagram}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold gradient-veon hover:opacity-90 transition-opacity mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Ver Meu Resultado
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = sprangerQuestions[currentQuestionIndex];

  return (
    <SprangerQuestion
      question={currentQuestion}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={sprangerQuestions.length}
      onAnswer={handleAnswer}
      onBack={currentQuestionIndex > 0 ? handleBack : undefined}
      initialAnswer={getCurrentAnswer()}
    />
  );
}
