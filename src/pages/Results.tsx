import { useEffect, useRef, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAssessment } from '@/context/AssessmentContext';
import { getProfileDescription } from '@/data/discProfiles';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/pdf-styles.css';
import { toast } from 'sonner';

// Lazy load heavy report components for better initial load
const ReportCover = lazy(() => import('@/components/report/ReportCover').then(m => ({ default: m.ReportCover })));
const ReportNavigation = lazy(() => import('@/components/report/ReportNavigation').then(m => ({ default: m.ReportNavigation })));
const DISCHorizontalChart = lazy(() => import('@/components/report/DISCHorizontalChart').then(m => ({ default: m.DISCHorizontalChart })));
const AmplitudeAnalysis = lazy(() => import('@/components/report/AmplitudeAnalysis').then(m => ({ default: m.AmplitudeAnalysis })));
const ProgressComparison = lazy(() => import('@/components/report/ProgressComparison').then(m => ({ default: m.ProgressComparison })));
const CompetenciesRadar = lazy(() => import('@/components/report/CompetenciesRadar').then(m => ({ default: m.CompetenciesRadar })));
const SprangerValuesChart = lazy(() => import('@/components/report/SprangerValuesChart').then(m => ({ default: m.SprangerValuesChart })));
const SprangerValuesReport = lazy(() => import('@/components/report/SprangerValuesReport').then(m => ({ default: m.SprangerValuesReport })));
const LeadershipPieChart = lazy(() => import('@/components/report/LeadershipPieChart').then(m => ({ default: m.LeadershipPieChart })));

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
  Download,
  Loader2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Loading fallback component
const ChartLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export default function Results() {
  const navigate = useNavigate();
  const { candidate, naturalProfile, adaptedProfile, sprangerProfile, resetAssessment } = useAssessment();
  const chartRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [notionSynced, setNotionSynced] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!candidate || !naturalProfile || !adaptedProfile || !sprangerProfile) {
      navigate('/');
    }
  }, [candidate, naturalProfile, adaptedProfile, sprangerProfile, navigate]);

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

  // Memoize profile description to avoid recalculation on every render
  const profile = useMemo(() => {
    if (!naturalProfile) return null;
    return getProfileDescription(
      naturalProfile.D,
      naturalProfile.I,
      naturalProfile.S,
      naturalProfile.C
    );
  }, [naturalProfile?.D, naturalProfile?.I, naturalProfile?.S, naturalProfile?.C]);

  // Memoize handlers to prevent unnecessary re-renders of child components
  const handleNewAssessment = useCallback(() => {
    resetAssessment();
    localStorage.removeItem('candidato_notion_id');
    navigate('/');
  }, [resetAssessment, navigate]);

  if (!candidate || !naturalProfile || !adaptedProfile || !sprangerProfile || !profile) {
    return null;
  }

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

      // Generate PDF as blob
      const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');

      // Restore hidden elements
      elementosOcultar.forEach(el => (el as HTMLElement).style.display = '');

      // Upload to Supabase Storage and update Notion
      try {
        const { error: uploadError } = await supabase.storage
          .from('teste')
          .upload(`pdfs/${fileName}`, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('teste')
            .getPublicUrl(`pdfs/${fileName}`);

          const pdfUrl = urlData.publicUrl;
          console.log('📤 PDF uploaded to:', pdfUrl);

          // Update Notion with PDF URL
          const notionPageId = localStorage.getItem('candidato_notion_id');
          if (notionPageId && pdfUrl) {
            const notionResponse = await supabase.functions.invoke('notion-sync', {
              body: {
                action: 'update_pdf',
                data: { notionPageId, pdfUrl },
              },
            });

            if (notionResponse.data?.success) {
              console.log('✅ PDF URL enviado ao Notion com sucesso');
            } else {
              console.warn('Notion PDF sync failed:', notionResponse.error || notionResponse.data?.error);
            }
          }
        } else {
          console.warn('Upload error:', uploadError);
        }
      } catch (uploadErr) {
        console.warn('Upload error (non-blocking):', uploadErr);
      }

      // Trigger download
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

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
          <Suspense fallback={<ChartLoader />}>
            <ReportNavigation />
          </Suspense>
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cover Section */}
        <section id="overview" className="animate-fade-in">
          <Suspense fallback={<ChartLoader />}>
            <ReportCover candidate={candidate} />
          </Suspense>
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
            <Suspense fallback={<ChartLoader />}>
              <DISCHorizontalChart naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
            </Suspense>
          </div>
        </section>

        {/* Amplitude Analysis */}
        <section id="amplitude">
          <Suspense fallback={<ChartLoader />}>
            <AmplitudeAnalysis naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
          </Suspense>
        </section>

        {/* Progress Comparison */}
        <section id="progress">
          <Suspense fallback={<ChartLoader />}>
            <ProgressComparison naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
          </Suspense>
        </section>

        {/* Competencies Radar */}
        <section id="competencies">
          <Suspense fallback={<ChartLoader />}>
            <CompetenciesRadar naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
          </Suspense>
        </section>

        {/* Spranger Values */}
        <section id="valores">
          <Suspense fallback={<ChartLoader />}>
            {sprangerProfile ? (
              <SprangerValuesReport sprangerProfile={sprangerProfile} />
            ) : (
              <SprangerValuesChart naturalProfile={naturalProfile} />
            )}
          </Suspense>
        </section>

        {/* Leadership Pie Chart */}
        <section id="leadership">
          <Suspense fallback={<ChartLoader />}>
            <LeadershipPieChart naturalProfile={naturalProfile} />
          </Suspense>
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
