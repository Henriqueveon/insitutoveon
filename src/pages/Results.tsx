import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAssessment } from '@/context/AssessmentContext';
import { getProfileDescription } from '@/data/discProfiles';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/pdf-styles.css';
import { toast } from 'sonner';

// Report Components
import { ReportCover } from '@/components/report/ReportCover';
import { ReportNavigation } from '@/components/report/ReportNavigation';
import { DISCHorizontalChart } from '@/components/report/DISCHorizontalChart';
import { AmplitudeAnalysis } from '@/components/report/AmplitudeAnalysis';
import { ProgressComparison } from '@/components/report/ProgressComparison';
import { CompetenciesRadar } from '@/components/report/CompetenciesRadar';
import { SprangerValuesChart } from '@/components/report/SprangerValuesChart';
import { LeadershipPieChart } from '@/components/report/LeadershipPieChart';

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
  BookOpen,
  Lightbulb,
  Save,
  Download,
  Loader2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Results() {
  const navigate = useNavigate();
  const { candidate, naturalProfile, adaptedProfile, resetAssessment } = useAssessment();
  const chartRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [notionSynced, setNotionSynced] = useState(false);
  const [actionPlan, setActionPlan] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

      const perfilResultado = `Perfil: ${profile.nome} | Natural: D${naturalProfile.D} I${naturalProfile.I} S${naturalProfile.S} C${naturalProfile.C} | Adaptado: D${adaptedProfile.D} I${adaptedProfile.I} S${adaptedProfile.S} C${adaptedProfile.C} | Teste: ${new Date().toLocaleString('pt-BR')}`;

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

  const handleSaveActionPlan = () => {
    localStorage.setItem('disc_action_plan', actionPlan);
    toast.success('Plano de ação salvo com sucesso!');
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !candidate) return;

    setIsGeneratingPDF(true);

    try {
      const element = reportRef.current;
      const fileName = `relatorio-disc-${candidate.nome_completo.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: fileName,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['.no-break', 'img', 'svg', 'canvas'],
        },
      };

      // Hide elements with .no-print class
      const elementosOcultar = element.querySelectorAll('.no-print');
      elementosOcultar.forEach(el => (el as HTMLElement).style.display = 'none');

      // Generate and download PDF
      await html2pdf().set(options).from(element).save();

      // Restore hidden elements
      elementosOcultar.forEach(el => (el as HTMLElement).style.display = '');

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div ref={reportRef} className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="gap-2 gradient-veon hover:opacity-90"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Gerando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Baixar Relatório em PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleNewAssessment} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Teste</span>
            </Button>
          </div>
        </div>
      </header>

        {/* Navigation */}
        <div className="no-print">
          <ReportNavigation />
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cover Section */}
        <section id="overview" className="animate-fade-in">
          <ReportCover candidate={candidate} />
        </section>

        {/* Methodology Card */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              Metodologia DISC
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              O modelo DISC foi desenvolvido por William Moulton Marston em 1928 e identifica quatro dimensões comportamentais principais:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 not-prose">
              <div className="p-3 rounded-lg bg-[#FF6B6B]/10 border border-[#FF6B6B]/30">
                <span className="text-2xl font-bold text-[#FF6B6B]">D</span>
                <p className="text-sm font-medium text-foreground">Dominância</p>
                <p className="text-xs text-muted-foreground">Resultados e desafios</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FFB84D]/10 border border-[#FFB84D]/30">
                <span className="text-2xl font-bold text-[#FFB84D]">I</span>
                <p className="text-sm font-medium text-foreground">Influência</p>
                <p className="text-xs text-muted-foreground">Pessoas e expressão</p>
              </div>
              <div className="p-3 rounded-lg bg-[#51CF66]/10 border border-[#51CF66]/30">
                <span className="text-2xl font-bold text-[#51CF66]">S</span>
                <p className="text-sm font-medium text-foreground">Estabilidade</p>
                <p className="text-xs text-muted-foreground">Ritmo e cooperação</p>
              </div>
              <div className="p-3 rounded-lg bg-[#4DABF7]/10 border border-[#4DABF7]/30">
                <span className="text-2xl font-bold text-[#4DABF7]">C</span>
                <p className="text-sm font-medium text-foreground">Conformidade</p>
                <p className="text-xs text-muted-foreground">Regras e precisão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card className="card-elevated animate-slide-up overflow-hidden" style={{ animationDelay: '150ms' }}>
          <div className="bg-gradient-to-r from-[#00CED1] to-[#0099CC] p-6 text-white">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" />
              <div>
                <h2 className="font-display text-2xl font-bold">{profile.nome}</h2>
                <p className="opacity-90">{profile.descricaoCurta}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{profile.descricaoCompleta}</p>
          </CardContent>
        </Card>

        {/* DISC Charts Section */}
        <section id="disc-chart" className="space-y-6">
          <div ref={chartRef}>
            <DISCHorizontalChart naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
          </div>
        </section>

        {/* Amplitude Analysis */}
        <section id="amplitude">
          <AmplitudeAnalysis naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
        </section>

        {/* Progress Comparison */}
        <section id="progress">
          <ProgressComparison naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
        </section>

        {/* Competencies Radar */}
        <section id="competencies">
          <CompetenciesRadar naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
        </section>

        {/* Spranger Values */}
        <section id="valores">
          <SprangerValuesChart naturalProfile={naturalProfile} />
        </section>

        {/* Leadership Pie Chart */}
        <section id="leadership">
          <LeadershipPieChart naturalProfile={naturalProfile} />
        </section>

        {/* Recommendations Section */}
        <section id="recommendations" className="space-y-6">
          {/* Grid of Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Potencialidades */}
            <Card className="card-elevated animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-[#51CF66]" />
                  Potencialidades
                </CardTitle>
                <CardDescription>Seus pontos fortes naturais</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.potencialidades.slice(0, 6).map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#51CF66] mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pontos a Desenvolver */}
            <Card className="card-elevated animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-[#FFB84D]" />
                  Pontos a Desenvolver
                </CardTitle>
                <CardDescription>Oportunidades de crescimento</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.pontosDesenvolver.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#FFB84D] mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Relações Interpessoais */}
            <Card className="card-elevated animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-[#4DABF7]" />
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
            <Card className="card-elevated animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-primary" />
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
            <Card className="card-elevated animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-[#FF6B6B]" />
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
            <Card className="card-elevated animate-slide-up">
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
          <Card className="card-elevated animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-primary" />
                Funções Ideais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">{profile.melhorAdequacao}</p>
              <div className="flex flex-wrap gap-2">
                {profile.cargosIdeais.map((cargo, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-[#00CED1]/10 text-[#00CED1] text-sm font-medium border border-[#00CED1]/30"
                  >
                    {cargo}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-[#FFB84D]" />
                Dicas de Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-[#00CED1]/5 border border-[#00CED1]/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  Como Comunicar com Este Perfil
                </h4>
                <p className="text-muted-foreground text-sm">{profile.comunicacao.comoComunicar}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#FF6B6B]/5 border border-[#FF6B6B]/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-lg">👂</span>
                  Como Este Perfil Recebe Comunicação
                </h4>
                <p className="text-muted-foreground text-sm">{profile.comunicacao.comoReceber}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Plan Section */}
        <section id="action-plan" className="space-y-6">
          <Card className="card-elevated animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-[#51CF66]" />
                Plano de Ação Sugerido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {profile.planoAcao.map((acao, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00CED1] to-[#0099CC] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{acao}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Editable Action Plan */}
          <Card className="bg-[#00CED1]/5 border-[#00CED1]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-[#FFB84D]" />
                Seu Plano de Ação Personalizado
              </CardTitle>
              <CardDescription>
                Com base no seu relatório, quais ações você pode tomar para seu desenvolvimento?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="Escreva aqui suas metas pessoais, ações de desenvolvimento e compromissos baseados nos insights do seu perfil DISC..."
                className="min-h-[150px] bg-card border-[#00CED1]/30 focus:border-[#00CED1]"
              />
              <Button
                onClick={handleSaveActionPlan}
                className="bg-gradient-to-r from-[#00CED1] to-[#0099CC] hover:opacity-90 gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Plano
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 space-y-4 border-t border-border">
          <Button
            onClick={handleNewAssessment}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Realizar Nova Avaliação
          </Button>
          <p className="text-sm text-muted-foreground">
            Instituto VEON • "A bússola que aponta para o sucesso!"
          </p>
        </div>
      </main>
    </div>
  );
}
