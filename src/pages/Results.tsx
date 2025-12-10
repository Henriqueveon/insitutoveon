import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { ProfileChart } from '@/components/ProfileChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAssessment } from '@/context/AssessmentContext';
import { getProfileDescription } from '@/data/discProfiles';
import { generatePDF } from '@/utils/generatePDF';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, 
  Users, 
  Brain, 
  Heart, 
  AlertTriangle, 
  Briefcase, 
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Star,
  TrendingUp,
  Download,
  Loader2
} from 'lucide-react';

export default function Results() {
  const navigate = useNavigate();
  const { candidate, naturalProfile, adaptedProfile, resetAssessment } = useAssessment();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [notionSynced, setNotionSynced] = useState(false);

  useEffect(() => {
    if (!candidate || !naturalProfile || !adaptedProfile) {
      navigate('/');
    }
  }, [candidate, naturalProfile, adaptedProfile, navigate]);

  // Sync DISC profile result to Notion
  useEffect(() => {
    const syncToNotion = async () => {
      if (notionSynced || !naturalProfile || !adaptedProfile) return;

      const notionPageId = localStorage.getItem('candidato_notion_id');
      if (!notionPageId) {
        console.log('No Notion page ID found, skipping sync');
        return;
      }

      const profile = getProfileDescription(
        naturalProfile.D,
        naturalProfile.I,
        naturalProfile.S,
        naturalProfile.C
      );

      const perfilResultado = `${profile.nome} | Natural: D${naturalProfile.D} I${naturalProfile.I} S${naturalProfile.S} C${naturalProfile.C} | Adaptado: D${adaptedProfile.D} I${adaptedProfile.I} S${adaptedProfile.S} C${adaptedProfile.C} | ${new Date().toLocaleString('pt-BR')}`;

      try {
        const response = await supabase.functions.invoke('notion-sync', {
          body: {
            action: 'update_profile',
            data: {
              notionPageId,
              perfilResultado,
            },
          },
        });

        if (response.data?.success) {
          console.log('✅ Perfil DISC enviado ao Notion com sucesso');
          setNotionSynced(true);
        } else {
          console.warn('Notion profile sync failed:', response.error || response.data?.error);
        }
      } catch (error) {
        console.warn('Notion profile sync error:', error);
      }
    };

    syncToNotion();
  }, [naturalProfile, adaptedProfile, notionSynced]);

  if (!candidate || !naturalProfile || !adaptedProfile) {
    return null;
  }

  const profile = getProfileDescription(
    naturalProfile.D,
    naturalProfile.I,
    naturalProfile.S,
    naturalProfile.C
  );

  const handleNewAssessment = () => {
    resetAssessment();
    localStorage.removeItem('candidato_notion_id');
    navigate('/');
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF(candidate, naturalProfile, adaptedProfile, profile, chartRef.current);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="gradient-veon hover:opacity-90 transition-opacity gap-2"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
            </Button>
            <Button variant="outline" onClick={handleNewAssessment} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Novo Teste
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <Card className="card-elevated animate-slide-up overflow-hidden">
          <div className="gradient-veon p-6 sm:p-8 text-white">
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Relatório de Perfil Comportamental
            </h1>
            <p className="opacity-90">
              {candidate.nome_completo} • {candidate.cargo_atual} • {candidate.empresa_instagram}
            </p>
            <p className="text-sm opacity-75 mt-1">
              Avaliação realizada em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-disc-i" />
                  {profile.nome}
                </h2>
                <p className="text-lg text-primary font-medium mb-4">{profile.descricaoCurta}</p>
                <p className="text-muted-foreground leading-relaxed">{profile.descricaoCompleta}</p>
              </div>
              <div className="lg:w-96" ref={chartRef}>
                <ProfileChart naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid of Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Potencialidades */}
          <Card className="card-elevated animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-disc-s" />
                Potencialidades
              </CardTitle>
              <CardDescription>Seus pontos fortes naturais</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profile.potencialidades.slice(0, 6).map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-disc-s mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pontos a Desenvolver */}
          <Card className="card-elevated animate-slide-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-disc-i" />
                Pontos a Desenvolver
              </CardTitle>
              <CardDescription>Oportunidades de crescimento</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profile.pontosDesenvolver.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-disc-i mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Relações Interpessoais */}
          <Card className="card-elevated animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-veon-blue" />
                Relações Interpessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-sm leading-relaxed">
                {profile.relacoesInterpessoais}
              </p>
            </CardContent>
          </Card>

          {/* Tomada de Decisão */}
          <Card className="card-elevated animate-slide-up" style={{ animationDelay: '250ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-5 h-5 text-disc-c" />
                Tomada de Decisão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-sm leading-relaxed">
                {profile.tomadaDecisao}
              </p>
            </CardContent>
          </Card>

          {/* Motivadores */}
          <Card className="card-elevated animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-veon-red" />
                Motivadores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Principal</span>
                <p className="text-foreground text-sm">{profile.motivadores.principal}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Secundário</span>
                <p className="text-foreground text-sm">{profile.motivadores.secundario}</p>
              </div>
            </CardContent>
          </Card>

          {/* Medos */}
          <Card className="card-elevated animate-slide-up" style={{ animationDelay: '350ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Medos e Receios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {profile.medos.map((medo, index) => (
                  <li key={index} className="text-foreground text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                    {medo}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Cards */}
        <Card className="card-elevated animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-primary" />
              Melhor Adequação Profissional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">{profile.melhorAdequacao}</p>
            <div className="flex flex-wrap gap-2">
              {profile.cargosIdeais.map((cargo, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {cargo}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated animate-slide-up" style={{ animationDelay: '450ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-disc-i" />
              Sugestões de Comunicação
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Como Comunicar com Este Perfil</h4>
              <p className="text-muted-foreground text-sm">{profile.comunicacao.comoComunicar}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Como Este Perfil Recebe Comunicação</h4>
              <p className="text-muted-foreground text-sm">{profile.comunicacao.comoReceber}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-disc-s" />
              Plano de Ação para Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {profile.planoAcao.map((acao, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full gradient-veon text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{acao}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 space-y-4">
          <Button
            onClick={handleNewAssessment}
            size="lg"
            className="gradient-veon hover:opacity-90 transition-opacity shadow-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Realizar Nova Avaliação
          </Button>
          <p className="text-sm text-muted-foreground">
            Instituto VEON • "Eu sou a bússola que aponta para o sucesso!"
          </p>
        </div>
      </main>
    </div>
  );
}
