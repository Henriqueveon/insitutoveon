import { useEffect, useRef, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAssessment } from '@/context/AssessmentContext';
import { getProfileDescription, getProfileType } from '@/data/discProfiles';
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
  Loader2,
  Copy,
  Check
} from 'lucide-react';

// Loading fallback component
const ChartLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Alert Box Component for copying link
const AlertCopyLink = ({ candidateId }: { candidateId: string }) => {
  const [copied, setCopied] = useState(false);

  const getReportUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/relatorio/${candidateId}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getReportUrl());
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar link');
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="w-6 h-6" />
          <span className="text-lg font-semibold">Importante!</span>
        </div>
        <p className="text-amber-800 font-medium max-w-lg">
          Copie e guarde o link desta pagina. Ao fechar, voce nao tera acesso novamente.
        </p>
        <Button
          onClick={handleCopyLink}
          className={`gap-2 px-6 py-3 text-base font-semibold transition-all ${
            copied
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-amber-500 hover:bg-amber-600'
          } text-white`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Link Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default function Results() {
  const navigate = useNavigate();
  const { candidate, naturalProfile, adaptedProfile, sprangerProfile, resetAssessment } = useAssessment();
  const chartRef = useRef<HTMLDivElement>(null);
  const [notionSynced, setNotionSynced] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);

  useEffect(() => {
    if (!candidate || !naturalProfile || !adaptedProfile || !sprangerProfile) {
      navigate('/');
    }
  }, [candidate, naturalProfile, adaptedProfile, sprangerProfile, navigate]);

  // Profile sync is now done in SprangerTest.tsx during candidate creation
  // This useEffect is kept as a backup fallback only
  useEffect(() => {
    const syncToDatabase = async () => {
      if (dbSynced || !naturalProfile || !adaptedProfile || !candidate?.id) return;

      // Check if profile is already saved (to avoid redundant updates)
      const candidatoId = candidate.id || localStorage.getItem('candidato_id');
      if (!candidatoId) return;

      try {
        // First check if profile already exists
        const { data: existingData } = await supabase
          .from('candidatos_disc')
          .select('perfil_tipo')
          .eq('id', candidatoId)
          .single();

        // If profile already saved, just mark as synced
        if (existingData?.perfil_tipo) {
          console.log('✅ Perfil DISC já estava salvo no banco');
          setDbSynced(true);
          return;
        }

        // If not saved, update now (fallback)
        const perfilTipo = getProfileType(
          naturalProfile.D,
          naturalProfile.I,
          naturalProfile.S,
          naturalProfile.C
        );

        const { error } = await supabase
          .from('candidatos_disc')
          .update({
            perfil_natural: { D: naturalProfile.D, I: naturalProfile.I, S: naturalProfile.S, C: naturalProfile.C },
            perfil_adaptado: { D: adaptedProfile.D, I: adaptedProfile.I, S: adaptedProfile.S, C: adaptedProfile.C },
            perfil_tipo: perfilTipo,
            status: 'completo',
          })
          .eq('id', candidatoId);

        if (error) {
          console.warn('Erro ao atualizar perfil no banco:', error);
        } else {
          console.log('✅ Perfil DISC salvo no banco de dados (fallback)');
          setDbSynced(true);
        }
      } catch (error) {
        console.warn('Database sync error:', error);
      }
    };

    syncToDatabase();
  }, [naturalProfile, adaptedProfile, candidate?.id, dbSynced]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <Button variant="outline" onClick={handleNewAssessment} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Teste</span>
          </Button>
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
        {/* Alert Box - Top */}
        <AlertCopyLink candidateId={candidate.id} />

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

        {/* Alert Box - Bottom */}
        <AlertCopyLink candidateId={candidate.id} />

        {/* Footer */}
        <div className="text-center py-8 space-y-4 border-t border-border">
          <Button
            onClick={handleNewAssessment}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Realizar Nova Avaliacao
          </Button>
          <p className="text-sm text-muted-foreground">
            Instituto VEON - "A bussola que aponta para o sucesso!"
          </p>
        </div>
      </main>
    </div>
  );
}
