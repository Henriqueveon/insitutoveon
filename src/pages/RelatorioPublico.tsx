import { useEffect, useRef, useState, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getProfileDescription, getProfileType } from '@/data/discProfiles';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/pdf-styles.css';
import { toast } from 'sonner';

// Lazy load heavy report components for better initial load
const ReportCover = lazy(() => import('@/components/report/ReportCover').then(m => ({ default: m.ReportCover })));
const DISCHorizontalChart = lazy(() => import('@/components/report/DISCHorizontalChart').then(m => ({ default: m.DISCHorizontalChart })));
const AmplitudeAnalysis = lazy(() => import('@/components/report/AmplitudeAnalysis').then(m => ({ default: m.AmplitudeAnalysis })));
const ProgressComparison = lazy(() => import('@/components/report/ProgressComparison').then(m => ({ default: m.ProgressComparison })));
const CompetenciesRadar = lazy(() => import('@/components/report/CompetenciesRadar').then(m => ({ default: m.CompetenciesRadar })));
const SprangerValuesChart = lazy(() => import('@/components/report/SprangerValuesChart').then(m => ({ default: m.SprangerValuesChart })));
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
  Star,
  TrendingUp,
  BookOpen,
  Download,
  Loader2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface DISCProfile {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface CandidatoData {
  id: string;
  nome_completo: string;
  email: string | null;
  telefone_whatsapp: string;
  cargo_atual: string;
  empresa_instagram: string;
  perfil_natural: DISCProfile | null;
  perfil_adaptado: DISCProfile | null;
  perfil_tipo: string | null;
  created_at: string;
}

// Loading fallback component
const ChartLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export default function RelatorioPublico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [candidato, setCandidato] = useState<CandidatoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidato = async () => {
      if (!id) {
        setError('ID do candidato nao fornecido');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('candidatos_disc')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar candidato:', fetchError);
          setError('Relatorio nao encontrado');
          setIsLoading(false);
          return;
        }

        if (!data) {
          setError('Candidato nao encontrado');
          setIsLoading(false);
          return;
        }

        // Verificar se o teste foi completado
        if (!data.perfil_natural || !data.perfil_adaptado) {
          setError('Este candidato ainda nao completou a avaliacao');
          setIsLoading(false);
          return;
        }

        setCandidato(data as CandidatoData);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro ao carregar relatorio');
        setIsLoading(false);
      }
    };

    fetchCandidato();
  }, [id]);

  // Memoize profile description
  const profile = useMemo(() => {
    if (!candidato?.perfil_natural) return null;
    const natural = candidato.perfil_natural;
    return getProfileDescription(natural.D, natural.I, natural.S, natural.C);
  }, [candidato?.perfil_natural]);

  const naturalProfile = candidato?.perfil_natural || null;
  const adaptedProfile = candidato?.perfil_adaptado || null;

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !candidato) return;

    setIsGeneratingPDF(true);

    try {
      const element = reportRef.current;
      const fileName = `relatorio-disc-${candidato.nome_completo.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando relatorio...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !candidato || !naturalProfile || !adaptedProfile || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            {error || 'Relatorio nao encontrado'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            O relatorio solicitado nao esta disponivel ou o candidato ainda nao completou a avaliacao.
          </p>
          <Button className="mt-6" onClick={() => navigate('/')}>
            Voltar ao inicio
          </Button>
        </div>
      </div>
    );
  }

  // Preparar dados do candidato para os componentes
  const candidateForReport = {
    id: candidato.id,
    nome_completo: candidato.nome_completo,
    email: candidato.email || '',
    telefone_whatsapp: candidato.telefone_whatsapp,
    cargo_atual: candidato.cargo_atual,
    empresa_instagram: candidato.empresa_instagram,
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
                  <span className="hidden sm:inline">Baixar Relatorio em PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cover Section */}
        <section id="overview" className="animate-fade-in">
          <Suspense fallback={<ChartLoader />}>
            <ReportCover candidate={candidateForReport} />
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
              O modelo DISC foi desenvolvido por William Moulton Marston em 1928 e identifica quatro dimensoes comportamentais principais:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 not-prose">
              <div className="p-3 rounded-lg bg-[#FF6B6B]/10 border border-[#FF6B6B]/30">
                <span className="text-2xl font-bold text-[#FF6B6B]">D</span>
                <p className="text-sm font-medium text-foreground">Dominancia</p>
                <p className="text-xs text-muted-foreground">Resultados e desafios</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FFB84D]/10 border border-[#FFB84D]/30">
                <span className="text-2xl font-bold text-[#FFB84D]">I</span>
                <p className="text-sm font-medium text-foreground">Influencia</p>
                <p className="text-xs text-muted-foreground">Pessoas e expressao</p>
              </div>
              <div className="p-3 rounded-lg bg-[#51CF66]/10 border border-[#51CF66]/30">
                <span className="text-2xl font-bold text-[#51CF66]">S</span>
                <p className="text-sm font-medium text-foreground">Estabilidade</p>
                <p className="text-xs text-muted-foreground">Ritmo e cooperacao</p>
              </div>
              <div className="p-3 rounded-lg bg-[#4DABF7]/10 border border-[#4DABF7]/30">
                <span className="text-2xl font-bold text-[#4DABF7]">C</span>
                <p className="text-sm font-medium text-foreground">Conformidade</p>
                <p className="text-xs text-muted-foreground">Regras e precisao</p>
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
          <Suspense fallback={<ChartLoader />}>
            <DISCHorizontalChart naturalProfile={naturalProfile} adaptedProfile={adaptedProfile} />
          </Suspense>
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
            <SprangerValuesChart naturalProfile={naturalProfile} />
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

            {/* Relacoes Interpessoais */}
            <Card className="card-elevated animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-[#4DABF7]" />
                  Relacoes Interpessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-sm leading-relaxed">
                  {profile.relacoesInterpessoais}
                </p>
              </CardContent>
            </Card>

            {/* Tomada de Decisao */}
            <Card className="card-elevated animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-primary" />
                  Tomada de Decisao
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Secundario</span>
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
                Funcoes Ideais
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
                Dicas de Comunicacao
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-[#00CED1]/5 border border-[#00CED1]/20">
                <h4 className="font-semibold text-foreground mb-2">
                  Como Comunicar com Este Perfil
                </h4>
                <p className="text-muted-foreground text-sm">{profile.comunicacao.comoComunicar}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#FF6B6B]/5 border border-[#FF6B6B]/20">
                <h4 className="font-semibold text-foreground mb-2">
                  Como Este Perfil Recebe Comunicacao
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
                Plano de Acao Sugerido
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
          <p className="text-sm text-muted-foreground">
            Instituto VEON - "A bussola que aponta para o sucesso!"
          </p>
        </div>
      </main>
    </div>
  );
}
