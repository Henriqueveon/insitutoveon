import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAssessment, Answer } from '@/context/AssessmentContext';
import { discQuestions } from '@/data/discQuestions';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUp, ThumbsDown, ArrowRight, ArrowLeft, Check, User, Phone, Mail, Briefcase, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Assessment() {
  const navigate = useNavigate();
  const { setCandidate, addAnswer, answers, calculateProfiles, setStartTime } = useAssessment();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedMais, setSelectedMais] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [selectedMenos, setSelectedMenos] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone_whatsapp: '',
    email: '',
    cargo_atual: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize start time when component mounts
  useEffect(() => {
    setStartTime(Date.now());
  }, [setStartTime]);

  useEffect(() => {
    // Load existing answer for current question
    const existingAnswer = answers.find(
      (a) => a.questionId === discQuestions[currentQuestion].id
    );
    if (existingAnswer) {
      setSelectedMais(existingAnswer.mais);
      setSelectedMenos(existingAnswer.menos);
    } else {
      setSelectedMais(null);
      setSelectedMenos(null);
    }
  }, [currentQuestion, answers]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'telefone_whatsapp') {
      formattedValue = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.cargo_atual.trim()) {
      newErrors.cargo_atual = 'Cargo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('candidatos_disc')
        .insert({
          nome_completo: formData.nome_completo.trim(),
          telefone_whatsapp: formData.telefone_whatsapp,
          cargo_atual: formData.cargo_atual.trim(),
          empresa_instagram: formData.email, // Using email field
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
              telefoneWhatsApp: formData.telefone_whatsapp,
              cargoAtual: formData.cargo_atual.trim(),
              instagram: formData.email,
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
        telefone_whatsapp: formData.telefone_whatsapp,
        cargo_atual: formData.cargo_atual.trim(),
        empresa_instagram: formData.email,
      });

      localStorage.setItem('candidato_id', data.id);

      // Calculate profiles and navigate to results
      calculateProfiles();
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

  const question = discQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === discQuestions.length - 1;
  const canProceed = selectedMais && selectedMenos && selectedMais !== selectedMenos;

  const handleSelectMais = (fator: 'D' | 'I' | 'S' | 'C') => {
    if (fator === selectedMenos) {
      setSelectedMenos(null);
    }
    setSelectedMais(fator);
  };

  const handleSelectMenos = (fator: 'D' | 'I' | 'S' | 'C') => {
    if (fator === selectedMais) {
      setSelectedMais(null);
    }
    setSelectedMenos(fator);
  };

  const handleNext = () => {
    if (!canProceed) return;

    const answer: Answer = {
      questionId: question.id,
      mais: selectedMais!,
      menos: selectedMenos!,
      timestamp: Date.now(),
    };
    addAnswer(answer);

    if (isLastQuestion) {
      // Show modal to collect user data before showing results
      setShowModal(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Shuffle descriptors for each question (but consistently)
  const shuffledDescriptors = [...question.descritores].sort(
    (a, b) => a.texto.localeCompare(b.texto)
  );

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo showText={false} />
          <div className="flex-1 max-w-md mx-4">
            <ProgressBar current={currentQuestion + 1} total={discQuestions.length} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-2xl card-elevated animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-xl sm:text-2xl text-foreground">
              Questão {currentQuestion + 1}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Selecione o descritor que <strong className="text-disc-s">MAIS</strong> e o que{' '}
              <strong className="text-veon-red">MENOS</strong> combina com você
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Legend */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-disc-s" />
                <span className="text-muted-foreground">Mais me descreve</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-veon-red" />
                <span className="text-muted-foreground">Menos me descreve</span>
              </div>
            </div>

            {/* Descriptors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shuffledDescriptors.map((descriptor) => {
                const isMais = selectedMais === descriptor.fator;
                const isMenos = selectedMenos === descriptor.fator;

                return (
                  <div
                    key={descriptor.fator}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all duration-200',
                      isMais && 'border-disc-s bg-disc-s/10 shadow-md',
                      isMenos && 'border-veon-red bg-veon-red/10 shadow-md',
                      !isMais && !isMenos && 'border-border bg-card hover:border-muted-foreground'
                    )}
                  >
                    <div className="text-center mb-3">
                      <span className="font-semibold text-lg text-foreground">
                        {descriptor.texto}
                      </span>
                    </div>

                    <div className="flex justify-center gap-3">
                      <Button
                        variant={isMais ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectMais(descriptor.fator)}
                        className={cn(
                          'flex-1 max-w-[100px]',
                          isMais && 'bg-disc-s hover:bg-disc-s/90 border-disc-s'
                        )}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Mais
                      </Button>
                      <Button
                        variant={isMenos ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectMenos(descriptor.fator)}
                        className={cn(
                          'flex-1 max-w-[100px]',
                          isMenos && 'bg-veon-red hover:bg-veon-red/90 border-veon-red'
                        )}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Menos
                      </Button>
                    </div>

                    {/* Selection indicator */}
                    {(isMais || isMenos) && (
                      <div
                        className={cn(
                          'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center',
                          isMais && 'bg-disc-s',
                          isMenos && 'bg-veon-red'
                        )}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  'gap-2 min-w-[140px]',
                  canProceed && 'gradient-veon hover:opacity-90'
                )}
              >
                {isLastQuestion ? 'Finalizar' : 'Próxima'}
                {isLastQuestion ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>

            {!canProceed && (selectedMais || selectedMenos) && (
              <p className="text-center text-sm text-muted-foreground">
                Selecione um descritor diferente para "Mais" e "Menos"
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal for collecting user data after test completion */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-2xl">
              Parabéns! Teste Concluído
            </DialogTitle>
            <DialogDescription className="text-center">
              Preencha seus dados para visualizar seu relatório de perfil comportamental DISC
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
                className={getInputClass('telefone_whatsapp')}
                disabled={isLoading}
              />
              {errors.telefone_whatsapp && (
                <p className="text-sm text-destructive">{errors.telefone_whatsapp}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleFormChange}
                className={getInputClass('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo_atual" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Cargo Atual
              </Label>
              <Input
                id="cargo_atual"
                name="cargo_atual"
                placeholder="Ex: Gerente, Vendedor, Analista..."
                value={formData.cargo_atual}
                onChange={handleFormChange}
                className={getInputClass('cargo_atual')}
                disabled={isLoading}
              />
              {errors.cargo_atual && (
                <p className="text-sm text-destructive">{errors.cargo_atual}</p>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
