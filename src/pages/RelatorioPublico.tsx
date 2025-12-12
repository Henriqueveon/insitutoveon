import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getProfileDescription } from '@/data/discProfiles';
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
const DISCProfileHeader = lazy(() => import('@/components/report/DISCProfileHeader').then(m => ({ default: m.DISCProfileHeader })));
const DISCChallenges = lazy(() => import('@/components/report/DISCChallenges').then(m => ({ default: m.DISCChallenges })));

import {
  Target,
  Users,
  Brain,
  Heart,
  AlertTriangle,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Info
} from 'lucide-react';

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
  // Reliability fields
  confiabilidade_score: number | null;
  confiabilidade_nivel: string | null;
  flags_detectadas: string[] | null;
}

// Loading fallback component
const ChartLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Alert Box Component
const AlertCopyLink = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
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

// Reliability Card Component
interface ReliabilityCardProps {
  score: number | null;
  nivel: string | null;
  flags: string[] | null;
}

const ReliabilityCard = ({ score, nivel, flags }: ReliabilityCardProps) => {
  // If no reliability data, don't show the card
  if (score === null || nivel === null) return null;

  // Get visual styling based on level
  const getReliabilityStyle = () => {
    switch (nivel) {
      case 'ALTA':
        return {
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          borderColor: 'border-green-400',
          textColor: 'text-green-700',
          iconBg: 'bg-green-500',
          icon: ShieldCheck,
          label: 'Alta Confiabilidade',
          description: 'As respostas deste teste apresentam alto grau de consistência e autenticidade.',
        };
      case 'MEDIA':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-700',
          iconBg: 'bg-yellow-500',
          icon: ShieldAlert,
          label: 'Confiabilidade Moderada',
          description: 'Algumas respostas apresentam variações que merecem atenção na interpretação.',
        };
      case 'BAIXA':
        return {
          bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
          borderColor: 'border-orange-400',
          textColor: 'text-orange-700',
          iconBg: 'bg-orange-500',
          icon: ShieldAlert,
          label: 'Confiabilidade Reduzida',
          description: 'Recomenda-se cautela na interpretação dos resultados.',
        };
      case 'SUSPEITA':
        return {
          bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
          borderColor: 'border-red-400',
          textColor: 'text-red-700',
          iconBg: 'bg-red-500',
          icon: ShieldX,
          label: 'Confiabilidade Comprometida',
          description: 'Os resultados podem nao refletir o perfil real. Considere reaplicar o teste.',
        };
      default:
        return {
          bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
          borderColor: 'border-gray-400',
          textColor: 'text-gray-700',
          iconBg: 'bg-gray-500',
          icon: Info,
          label: 'Confiabilidade',
          description: 'Informacoes de confiabilidade do teste.',
        };
    }
  };

  const style = getReliabilityStyle();
  const IconComponent = style.icon;

  // Map flag keys to readable Portuguese descriptions
  const flagDescriptions: Record<string, string> = {
    'Detectadas respostas socialmente desejáveis': 'Algumas respostas parecem socialmente desejáveis',
    'Item de atenção respondido incorretamente': 'Falha no item de verificação de atenção',
    'Padrão de respostas inconsistente detectado': 'Padrão de respostas inconsistente',
    'Tempo de resposta muito rápido - possível aleatoriedade': 'Tempo de resposta muito rápido',
    'Tempo de resposta acima do esperado': 'Tempo de resposta acima do esperado',
    'Perfil muito homogêneo - pode indicar respostas aleatórias': 'Perfil muito homogêneo',
    'Padrão contraditório nas escolhas': 'Padrão contraditório nas escolhas',
  };

  return (
    <Card className={`${style.bgColor} border-2 ${style.borderColor} animate-slide-up`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className={`${style.iconBg} p-2 rounded-full`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className={style.textColor}>{style.label}</span>
            <span className="text-2xl font-bold">{score}/100</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`${style.textColor} text-sm`}>
          {style.description}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 85 ? 'bg-green-500' :
              score >= 70 ? 'bg-yellow-500' :
              score >= 50 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Flags/Warnings */}
        {flags && flags.length > 0 && (
          <div className="mt-4 pt-3 border-t border-current/10">
            <p className={`${style.textColor} text-xs font-semibold mb-2 uppercase tracking-wide`}>
              Observacoes Detectadas:
            </p>
            <ul className="space-y-1">
              {flags.map((flag, index) => (
                <li key={index} className={`${style.textColor} text-xs flex items-start gap-2`}>
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{flagDescriptions[flag] || flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function RelatorioPublico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
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

        // Cast with proper type handling for JSON fields
        const candidatoData: CandidatoData = {
          id: data.id,
          nome_completo: data.nome_completo,
          email: data.email,
          telefone_whatsapp: data.telefone_whatsapp,
          cargo_atual: data.cargo_atual,
          empresa_instagram: data.empresa_instagram,
          perfil_natural: data.perfil_natural as unknown as DISCProfile | null,
          perfil_adaptado: data.perfil_adaptado as unknown as DISCProfile | null,
          perfil_tipo: data.perfil_tipo,
          created_at: data.created_at || '',
          // Reliability fields
          confiabilidade_score: data.confiabilidade_score ?? null,
          confiabilidade_nivel: data.confiabilidade_nivel ?? null,
          flags_detectadas: data.flags_detectadas as unknown as string[] | null,
        };
        setCandidato(candidatoData);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Alert Box - Top */}
        <AlertCopyLink />

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

        {/* Profile Summary with Dynamic DISC Colors */}
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <Suspense fallback={<ChartLoader />}>
            <DISCProfileHeader naturalProfile={naturalProfile} profile={profile} />
          </Suspense>
        </div>

        {/* Reliability Score */}
        <section id="confiabilidade" className="animate-slide-up" style={{ animationDelay: '175ms' }}>
          <ReliabilityCard
            score={candidato.confiabilidade_score}
            nivel={candidato.confiabilidade_nivel}
            flags={candidato.flags_detectadas}
          />
        </section>

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

          {/* Desafios e Pontos de Atencao */}
          <Suspense fallback={<ChartLoader />}>
            <DISCChallenges
              alertasCriticos={profile.alertasCriticos}
              medos={profile.medos}
              perfilNome={profile.nome}
            />
          </Suspense>

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

        {/* Alert Box - Bottom */}
        <AlertCopyLink />

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
