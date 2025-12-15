// =====================================================
// CURRÍCULO PÚBLICO VEON - O Melhor Currículo do Mundo
// Integra DISC completo + Dados pessoais + Recomendações
// Empresas precisam fazer login/cadastro para ver contato
// =====================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { discProfiles, ProfileData } from '@/data/discProfiles';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  Home,
  Clock,
  Play,
  Star,
  Target,
  CheckCircle,
  Lock,
  Building2,
  Calendar,
  LogIn,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Award,
  TrendingUp,
  Users,
  Brain,
  Zap,
  Heart,
  AlertTriangle,
  Sparkles,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

// Cores oficiais DISC
const DISC_COLORS = {
  D: '#E53935',
  I: '#FBC02D',
  S: '#43A047',
  C: '#1E88E5',
};

const DISC_LABELS = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

const DISC_EMOJIS = {
  D: '🎯',
  I: '💬',
  S: '🤝',
  C: '📊',
};

interface Candidato {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  foto_url: string | null;
  video_url: string | null;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  sexo: string | null;
  perfil_disc: string | null;
  teste_disc_id: string | null;
  objetivo_profissional: string | null;
  status: string;
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  ultima_empresa: string | null;
  ultimo_cargo: string | null;
  tempo_ultima_empresa: string | null;
  escolaridade: string | null;
  curso: string | null;
  certificacoes: string | null;
  disponibilidade_inicio: string | null;
  disponibilidade_horario: string | null;
  regime_preferido: string | null;
  pretensao_salarial: string | null;
  possui_cnh: string | null;
  possui_veiculo: string | null;
  aceita_viajar: string | null;
  aceita_mudanca: string | null;
  valores_empresa: string[] | null;
  areas_interesse: string[] | null;
  estado_civil: string | null;
  tem_filhos: boolean | null;
}

interface DadosDISC {
  perfil_natural: { D: number; I: number; S: number; C: number } | null;
  perfil_adaptado: { D: number; I: number; S: number; C: number } | null;
  perfil_tipo: string | null;
  confiabilidade_score: number | null;
  confiabilidade_nivel: string | null;
  flags_detectadas: string[] | null;
}

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
}

// Mapeamento das flags para descrições em português
const FLAG_DESCRIPTIONS: Record<string, string> = {
  'Detectadas respostas socialmente desejáveis': 'Algumas respostas parecem socialmente desejáveis',
  'Item de atenção respondido incorretamente': 'Falha no item de verificação de atenção',
  'Padrão de respostas inconsistente detectado': 'Padrão de respostas inconsistente',
  'Tempo de resposta muito rápido - possível aleatoriedade': 'Tempo de resposta muito rápido',
  'Tempo de resposta acima do esperado': 'Tempo de resposta acima do esperado',
  'Perfil muito homogêneo - pode indicar respostas aleatórias': 'Perfil muito homogêneo',
  'Padrão contraditório nas escolhas': 'Padrão contraditório nas escolhas',
  'fake_responses': 'Algumas respostas parecem socialmente desejáveis',
  'attention_failed': 'Falha no item de verificação de atenção',
  'inconsistent': 'Padrão de respostas inconsistente',
  'rushed': 'Tempo de resposta muito rápido',
  'slow': 'Tempo de resposta acima do esperado',
  'flat_profile': 'Perfil muito homogêneo',
  'contradictory': 'Padrão contraditório nas escolhas',
};

// Função de normalização
const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

// Calcular competências
const calcularCompetencias = (nD: number, nI: number, nS: number, nC: number) => [
  { name: 'Ousadia', value: Math.round(nD * 0.9 + nI * 0.1), profile: 'D' as const },
  { name: 'Comando', value: Math.round(nD * 0.85 + nC * 0.15), profile: 'D' as const },
  { name: 'Assertividade', value: Math.round(nD * 0.7 + nI * 0.3), profile: 'D' as const },
  { name: 'Objetividade', value: Math.round(nD * 0.6 + nC * 0.4), profile: 'D' as const },
  { name: 'Persuasão', value: Math.round(nI * 0.8 + nD * 0.2), profile: 'I' as const },
  { name: 'Entusiasmo', value: Math.round(nI * 0.9 + nD * 0.1), profile: 'I' as const },
  { name: 'Sociabilidade', value: Math.round(nI * 0.7 + nS * 0.3), profile: 'I' as const },
  { name: 'Comunicação', value: Math.round(nI * 0.85 + nS * 0.15), profile: 'I' as const },
  { name: 'Paciência', value: Math.round(nS * 0.9 + nC * 0.1), profile: 'S' as const },
  { name: 'Persistência', value: Math.round(nS * 0.7 + nD * 0.3), profile: 'S' as const },
  { name: 'Empatia', value: Math.round(nS * 0.8 + nI * 0.2), profile: 'S' as const },
  { name: 'Cooperação', value: Math.round(nS * 0.85 + nI * 0.15), profile: 'S' as const },
  { name: 'Precisão', value: Math.round(nC * 0.9 + nD * 0.1), profile: 'C' as const },
  { name: 'Organização', value: Math.round(nC * 0.7 + nS * 0.3), profile: 'C' as const },
  { name: 'Análise', value: Math.round(nC * 0.85 + nS * 0.15), profile: 'C' as const },
  { name: 'Planejamento', value: Math.round(nC * 0.75 + nD * 0.25), profile: 'C' as const },
];

// Calcular estilos de liderança
const calcularLideranca = (nD: number, nI: number, nS: number, nC: number) => {
  const total = nD + nI + nS + nC;
  return [
    { name: 'Executor', profile: 'D', value: Math.round((nD / total) * 100), color: DISC_COLORS.D },
    { name: 'Motivador', profile: 'I', value: Math.round((nI / total) * 100), color: DISC_COLORS.I },
    { name: 'Apoiador', profile: 'S', value: Math.round((nS / total) * 100), color: DISC_COLORS.S },
    { name: 'Analítico', profile: 'C', value: Math.round((nC / total) * 100), color: DISC_COLORS.C },
  ];
};

export default function CurriculoPublico() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [dadosDISC, setDadosDISC] = useState<DadosDISC | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarModalAcesso, setMostrarModalAcesso] = useState(false);
  const [secaoExpandida, setSecaoExpandida] = useState<string | null>('perfil');

  useEffect(() => {
    if (shortId) {
      carregarDados();
    }
  }, [shortId]);

  const carregarDados = async () => {
    setIsLoading(true);
    setErro(null);

    try {
      // 1. Buscar candidato
      const { data: candidatos, error: candidatoError } = await supabase
        .from('candidatos_recrutamento')
        .select('*')
        .ilike('id', `${shortId}%`)
        .limit(1);

      if (candidatoError) throw candidatoError;
      if (!candidatos || candidatos.length === 0) {
        setErro('Currículo não encontrado');
        setIsLoading(false);
        return;
      }

      const candidatoData = candidatos[0];
      if (candidatoData.status === 'contratado') {
        setErro('Este profissional já foi contratado');
        setIsLoading(false);
        return;
      }

      setCandidato(candidatoData);

      // 2. Buscar dados DISC completos
      if (candidatoData.teste_disc_id) {
        const { data: discData } = await supabase
          .from('candidatos_disc')
          .select('perfil_natural, perfil_adaptado, perfil_tipo, confiabilidade_score, confiabilidade_nivel, flags_detectadas')
          .eq('id', candidatoData.teste_disc_id)
          .single();

        if (discData) {
          setDadosDISC(discData as any);
        }
      }

      // 3. Verificar empresa logada
      const { data: { user } } = await supabase.auth.getUser();
      let empresaEncontrada = false;

      if (user) {
        // Tentar vincular auth_user_id se ainda não estiver vinculado
        try {
          await supabase.rpc('vincular_auth_empresa');
        } catch (e) {
          // Ignora - função pode não existir ainda
        }

        // Primeiro, tentar buscar por auth_user_id
        const { data: empresaByAuth } = await supabase
          .from('empresas_recrutamento')
          .select('id, razao_social, nome_fantasia')
          .eq('auth_user_id', user.id)
          .single();

        if (empresaByAuth) {
          setEmpresa(empresaByAuth);
          empresaEncontrada = true;
        } else {
          // Fallback: buscar por email
          const { data: empresaByEmail } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia')
            .eq('socio_email', user.email?.toLowerCase())
            .single();

          if (empresaByEmail) {
            setEmpresa(empresaByEmail);
            empresaEncontrada = true;
          }
        }
      }

      // Fallback localStorage
      if (!empresaEncontrada) {
        const empresaId = localStorage.getItem('veon_empresa_id');
        if (empresaId) {
          const { data: empresaData } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia')
            .eq('id', empresaId)
            .single();
          if (empresaData) setEmpresa(empresaData);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao carregar currículo');
    } finally {
      setIsLoading(false);
    }
  };

  // Dados calculados
  const perfilData = useMemo(() => {
    if (!dadosDISC?.perfil_natural || !candidato?.perfil_disc) return null;
    const tipo = dadosDISC.perfil_tipo || candidato.perfil_disc;
    return discProfiles[tipo] || discProfiles[candidato.perfil_disc] || null;
  }, [dadosDISC, candidato]);

  const scoresNormalizados = useMemo(() => {
    if (!dadosDISC?.perfil_natural) return null;
    return {
      D: normalizeScore(dadosDISC.perfil_natural.D),
      I: normalizeScore(dadosDISC.perfil_natural.I),
      S: normalizeScore(dadosDISC.perfil_natural.S),
      C: normalizeScore(dadosDISC.perfil_natural.C),
    };
  }, [dadosDISC]);

  const competencias = useMemo(() => {
    if (!scoresNormalizados) return [];
    return calcularCompetencias(
      scoresNormalizados.D,
      scoresNormalizados.I,
      scoresNormalizados.S,
      scoresNormalizados.C
    );
  }, [scoresNormalizados]);

  const lideranca = useMemo(() => {
    if (!scoresNormalizados) return [];
    return calcularLideranca(
      scoresNormalizados.D,
      scoresNormalizados.I,
      scoresNormalizados.S,
      scoresNormalizados.C
    );
  }, [scoresNormalizados]);

  const topCompetencias = useMemo(() => {
    return [...competencias].sort((a, b) => b.value - a.value).slice(0, 6);
  }, [competencias]);

  const liderancaDominante = useMemo(() => {
    if (lideranca.length === 0) return null;
    return lideranca.reduce((prev, curr) => curr.value > prev.value ? curr : prev);
  }, [lideranca]);

  // Helpers
  const calcularIdade = (data: string) => {
    const hoje = new Date();
    const nasc = new Date(data);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const getConfiabilidadeConfig = (nivel: string | null) => {
    switch (nivel) {
      case 'ALTA': return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: ShieldCheck,
        label: 'Alta Confiabilidade',
        description: 'As respostas apresentam alto grau de consistência e autenticidade.'
      };
      case 'MEDIA': return {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: ShieldAlert,
        label: 'Confiabilidade Moderada',
        description: 'Algumas respostas apresentam variações que merecem atenção.'
      };
      case 'BAIXA': return {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        icon: ShieldAlert,
        label: 'Confiabilidade Reduzida',
        description: 'Recomenda-se cautela na interpretação dos resultados.'
      };
      case 'SUSPEITA': return {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: ShieldX,
        label: 'Confiabilidade Comprometida',
        description: 'Os resultados podem não refletir o perfil real. Considere reaplicar o teste.'
      };
      default: return {
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        icon: Shield,
        label: 'Não avaliado',
        description: 'Confiabilidade não calculada.'
      };
    }
  };

  const handleEnviarProposta = () => {
    if (!empresa) {
      setMostrarModalAcesso(true);
      return;
    }
    navigate(`/recrutamento/empresa/buscar-candidatos?candidato=${candidato?.id}`);
  };

  const handleLogin = () => {
    localStorage.setItem('veon_redirect_after_login', window.location.pathname);
    navigate('/recrutamento/empresa/login');
  };

  const handleCadastro = () => {
    localStorage.setItem('veon_redirect_after_login', window.location.pathname);
    navigate('/recrutamento/empresa/bem-vindo');
  };

  const toggleSecao = (secao: string) => {
    setSecaoExpandida(secaoExpandida === secao ? null : secao);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E31E24] mx-auto mb-4" />
          <p className="text-slate-400">Carregando currículo...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (erro || !candidato) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/80 border-slate-700 max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{erro || 'Currículo não encontrado'}</h2>
            <Button onClick={() => navigate('/recrutamento/empresa/bem-vindo')} className="mt-4 bg-gradient-to-r from-[#E31E24] to-[#B91C1C]">
              Ir para área de empresas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const perfilPrincipal = candidato.perfil_disc || 'D';
  const confiabilidadeConfig = getConfiabilidadeConfig(dadosDISC?.confiabilidade_nivel || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#003DA5]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00D9FF]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center">
              <span className="text-lg font-black text-white">V</span>
            </div>
            <div>
              <span className="text-white font-semibold">VEON Recrutamento</span>
              <p className="text-xs text-slate-400">Currículo Verificado</p>
            </div>
          </div>
          {empresa ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Building2 className="w-3 h-3 mr-1" />
              {empresa.nome_fantasia || empresa.razao_social}
            </Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLogin} className="border-slate-600 text-slate-300">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar como Empresa
            </Button>
          )}
        </div>

        {/* ========== HERO CARD - PERFIL PRINCIPAL ========== */}
        <Card className="bg-slate-800/80 border-slate-700 overflow-hidden mb-6">
          {/* Barra de cores DISC no topo */}
          {scoresNormalizados && (
            <div className="h-2 flex">
              <div style={{ width: `${scoresNormalizados.D}%`, backgroundColor: DISC_COLORS.D }} />
              <div style={{ width: `${scoresNormalizados.I}%`, backgroundColor: DISC_COLORS.I }} />
              <div style={{ width: `${scoresNormalizados.S}%`, backgroundColor: DISC_COLORS.S }} />
              <div style={{ width: `${scoresNormalizados.C}%`, backgroundColor: DISC_COLORS.C }} />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Foto e dados básicos */}
              <div className="flex-shrink-0 text-center md:text-left">
                <Avatar className="h-32 w-32 mx-auto md:mx-0 border-4 border-white/10 shadow-2xl">
                  <AvatarImage src={candidato.foto_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-4xl font-bold">
                    {(candidato.nome_completo || 'P').charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Badge DISC grande */}
                <div
                  className="mt-4 w-20 h-20 mx-auto md:mx-0 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: DISC_COLORS[perfilPrincipal as keyof typeof DISC_COLORS] }}
                >
                  <span className="text-3xl font-black">{perfilPrincipal}</span>
                  <span className="text-xs opacity-80">{DISC_LABELS[perfilPrincipal as keyof typeof DISC_LABELS]}</span>
                </div>
              </div>

              {/* Info principal */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{candidato.nome_completo}</h1>
                    <p className="text-slate-300 flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      {candidato.cidade}, {candidato.estado} • {calcularIdade(candidato.data_nascimento)} anos
                      {candidato.sexo && ` • ${candidato.sexo === 'M' ? 'Masculino' : candidato.sexo === 'F' ? 'Feminino' : candidato.sexo}`}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Disponível
                  </Badge>
                </div>

                {/* Título do perfil */}
                {perfilData && (
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <span>{DISC_EMOJIS[perfilPrincipal as keyof typeof DISC_EMOJIS]}</span>
                      {perfilData.nome}
                    </h2>
                    <p className="text-slate-400 mt-1">{perfilData.descricaoCurta}</p>
                  </div>
                )}

                {/* Confiabilidade Expandida */}
                {dadosDISC?.confiabilidade_score !== null && dadosDISC?.confiabilidade_score !== undefined && (
                  <div className={`mt-4 p-4 rounded-xl border ${confiabilidadeConfig.bg} ${confiabilidadeConfig.border}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${confiabilidadeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                        <confiabilidadeConfig.icon className={`w-5 h-5 ${confiabilidadeConfig.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold ${confiabilidadeConfig.color}`}>
                            {confiabilidadeConfig.label}
                          </span>
                          <span className={`text-xl font-bold ${confiabilidadeConfig.color}`}>
                            {dadosDISC.confiabilidade_score}/100
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{confiabilidadeConfig.description}</p>

                        {/* Barra de progresso */}
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full rounded-full transition-all ${
                              dadosDISC.confiabilidade_nivel === 'ALTA' ? 'bg-emerald-500' :
                              dadosDISC.confiabilidade_nivel === 'MEDIA' ? 'bg-amber-500' :
                              dadosDISC.confiabilidade_nivel === 'BAIXA' ? 'bg-orange-500' :
                              dadosDISC.confiabilidade_nivel === 'SUSPEITA' ? 'bg-red-500' : 'bg-slate-500'
                            }`}
                            style={{ width: `${dadosDISC.confiabilidade_score}%` }}
                          />
                        </div>

                        {/* Observações Detectadas */}
                        {dadosDISC.flags_detectadas && dadosDISC.flags_detectadas.length > 0 && (
                          <div className="pt-3 border-t border-slate-700/50">
                            <p className={`text-xs font-semibold ${confiabilidadeConfig.color} uppercase tracking-wide mb-2`}>
                              Observações Detectadas:
                            </p>
                            <ul className="space-y-1.5">
                              {dadosDISC.flags_detectadas.map((flag, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertTriangle className={`w-3.5 h-3.5 ${confiabilidadeConfig.color} mt-0.5 flex-shrink-0`} />
                                  <span className="text-sm text-slate-300">
                                    {FLAG_DESCRIPTIONS[flag] || flag}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Objetivo */}
                {candidato.objetivo_profissional && (
                  <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400 flex items-start gap-2">
                      <Target className="w-4 h-4 mt-0.5 text-[#E31E24]" />
                      <span className="text-white">{candidato.objetivo_profissional}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ========== RECOMENDAÇÃO PARA EMPRESA ========== */}
        {perfilData && (
          <Card className="bg-gradient-to-r from-[#E31E24]/10 to-[#003DA5]/10 border-[#E31E24]/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Recomendação para sua Empresa
                  </h3>
                  <p className="text-slate-300 mb-4">{perfilData.melhorAdequacao}</p>

                  {/* Cargos ideais */}
                  <div className="flex flex-wrap gap-2">
                    {perfilData.cargosIdeais.map((cargo, i) => (
                      <Badge key={i} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                        <Award className="w-3 h-3 mr-1" />
                        {cargo}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== GRÁFICO DISC ========== */}
        {scoresNormalizados && (
          <Card className="bg-slate-800/60 border-slate-700 mb-6">
            <CardContent className="p-6">
              <button
                onClick={() => toggleSecao('disc')}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#E31E24]" />
                  Perfil Comportamental DISC
                </h3>
                {secaoExpandida === 'disc' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {secaoExpandida === 'disc' && (
                <div className="mt-6 space-y-4">
                  {(['D', 'I', 'S', 'C'] as const).map((key) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: DISC_COLORS[key] }}
                          >
                            {key}
                          </div>
                          <div>
                            <span className="text-white font-medium">{DISC_LABELS[key]}</span>
                            <p className="text-xs text-slate-400">
                              {key === 'D' && 'Como enfrenta desafios e toma decisões'}
                              {key === 'I' && 'Como se comunica e influencia pessoas'}
                              {key === 'S' && 'Como lida com mudanças e ritmo'}
                              {key === 'C' && 'Como segue regras e analisa dados'}
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold" style={{ color: DISC_COLORS[key] }}>
                          {scoresNormalizados[key]}%
                        </span>
                      </div>
                      <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${scoresNormalizados[key]}%`, backgroundColor: DISC_COLORS[key] }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Descrição completa */}
                  {perfilData && (
                    <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {perfilData.descricaoCompleta}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========== COMPETÊNCIAS TOP 6 ========== */}
        {topCompetencias.length > 0 && (
          <Card className="bg-slate-800/60 border-slate-700 mb-6">
            <CardContent className="p-6">
              <button
                onClick={() => toggleSecao('competencias')}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Competências Principais
                </h3>
                {secaoExpandida === 'competencias' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {secaoExpandida === 'competencias' && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {topCompetencias.map((comp, i) => (
                    <div
                      key={comp.name}
                      className="p-4 rounded-xl border-2 transition-all hover:scale-105"
                      style={{
                        backgroundColor: `${DISC_COLORS[comp.profile]}10`,
                        borderColor: `${DISC_COLORS[comp.profile]}30`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{comp.name}</span>
                        <span
                          className="text-sm font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: DISC_COLORS[comp.profile] }}
                        >
                          {comp.value}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${comp.value}%`, backgroundColor: DISC_COLORS[comp.profile] }}
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {i < 3 && <Star className="w-3 h-3 text-yellow-400" />}
                        <span className="text-xs text-slate-400">
                          {comp.value >= 70 ? 'Muito forte' : comp.value >= 50 ? 'Forte' : 'Moderado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========== ESTILO DE LIDERANÇA ========== */}
        {liderancaDominante && (
          <Card className="bg-slate-800/60 border-slate-700 mb-6">
            <CardContent className="p-6">
              <button
                onClick={() => toggleSecao('lideranca')}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Estilo de Liderança
                </h3>
                {secaoExpandida === 'lideranca' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {secaoExpandida === 'lideranca' && (
                <div className="mt-6">
                  {/* Estilo dominante */}
                  <div
                    className="p-5 rounded-xl border-2 mb-4"
                    style={{ backgroundColor: `${liderancaDominante.color}15`, borderColor: `${liderancaDominante.color}50` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                        style={{ backgroundColor: liderancaDominante.color }}
                      >
                        {liderancaDominante.profile}
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Estilo principal:</span>
                        <h4 className="text-xl font-bold text-white">Líder {liderancaDominante.name}</h4>
                      </div>
                      <span className="ml-auto text-4xl font-bold" style={{ color: liderancaDominante.color }}>
                        {liderancaDominante.value}%
                      </span>
                    </div>
                  </div>

                  {/* Todos os estilos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {lideranca.map((style) => (
                      <div key={style.name} className="p-3 bg-slate-700/50 rounded-lg text-center">
                        <div
                          className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-bold mb-2"
                          style={{ backgroundColor: style.color }}
                        >
                          {style.profile}
                        </div>
                        <p className="text-white text-sm font-medium">{style.name}</p>
                        <p className="text-lg font-bold" style={{ color: style.color }}>{style.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========== POTENCIALIDADES E DESENVOLVIMENTO ========== */}
        {perfilData && (
          <Card className="bg-slate-800/60 border-slate-700 mb-6">
            <CardContent className="p-6">
              <button
                onClick={() => toggleSecao('potencial')}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Potencialidades & Desenvolvimento
                </h3>
                {secaoExpandida === 'potencial' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {secaoExpandida === 'potencial' && (
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  {/* Potencialidades */}
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Pontos Fortes
                    </h4>
                    <ul className="space-y-2">
                      {perfilData.potencialidades.slice(0, 5).map((item, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-green-400">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desenvolvimento */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Oportunidades de Crescimento
                    </h4>
                    <ul className="space-y-2">
                      {perfilData.pontosDesenvolver.slice(0, 5).map((item, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========== EXPERIÊNCIA E FORMAÇÃO ========== */}
        <Card className="bg-slate-800/60 border-slate-700 mb-6">
          <CardContent className="p-6">
            <button
              onClick={() => toggleSecao('experiencia')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-400" />
                Experiência & Formação
              </h3>
              {secaoExpandida === 'experiencia' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {secaoExpandida === 'experiencia' && (
              <div className="mt-6 space-y-6">
                {/* Última experiência */}
                {candidato.ultima_empresa && (
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{candidato.ultimo_cargo}</h4>
                        <p className="text-slate-400">{candidato.ultima_empresa}</p>
                        <p className="text-slate-500 text-sm mt-1">Período: {candidato.tempo_ultima_empresa}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Áreas de experiência */}
                {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Áreas de atuação:</p>
                    <div className="flex flex-wrap gap-2">
                      {candidato.areas_experiencia.map((area, i) => (
                        <Badge key={i} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formação */}
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{candidato.escolaridade || 'Não informado'}</h4>
                      {candidato.curso && <p className="text-slate-400">{candidato.curso}</p>}
                      {candidato.certificacoes && <p className="text-slate-500 text-sm mt-1">Certificações: {candidato.certificacoes}</p>}
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div className="flex flex-wrap gap-2">
                  {candidato.possui_cnh && candidato.possui_cnh !== 'Não' && (
                    <Badge className="bg-blue-500/20 text-blue-400"><Car className="w-3 h-3 mr-1" />CNH {candidato.possui_cnh}</Badge>
                  )}
                  {candidato.possui_veiculo && candidato.possui_veiculo !== 'Não' && (
                    <Badge className="bg-green-500/20 text-green-400"><Car className="w-3 h-3 mr-1" />{candidato.possui_veiculo}</Badge>
                  )}
                  {candidato.aceita_viajar === 'sim' && (
                    <Badge className="bg-purple-500/20 text-purple-400"><Plane className="w-3 h-3 mr-1" />Aceita viajar</Badge>
                  )}
                  {candidato.aceita_mudanca === 'sim' && (
                    <Badge className="bg-orange-500/20 text-orange-400"><Home className="w-3 h-3 mr-1" />Aceita mudança</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========== VÍDEO DE APRESENTAÇÃO ========== */}
        {candidato.video_url && (
          <Card className="bg-slate-800/60 border-slate-700 mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-red-400" />
                Vídeo de Apresentação
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                <video
                  src={candidato.video_url}
                  controls
                  className="w-full h-full object-contain"
                  poster={candidato.foto_url || undefined}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== CONTATO BLOQUEADO OU CTA ========== */}
        <Card className="bg-slate-800/60 border-slate-700 mb-6">
          <CardContent className="p-6">
            {empresa ? (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium">Dados de contato bloqueados</p>
                      <p className="text-slate-400 text-sm">
                        Para ver email e telefone, envie uma proposta de entrevista.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleEnviarProposta}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#1E3A8A] hover:from-[#E31E24]/90 hover:to-[#1E3A8A]/90 text-white font-semibold py-6 text-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Entrevista
                </Button>
                <p className="text-center text-slate-500 text-xs mt-3">
                  Após o candidato aceitar, você terá acesso aos dados de contato
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gostou deste profissional?</h3>
                  <p className="text-slate-400">
                    Cadastre sua empresa para enviar propostas e ver os dados de contato
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleLogin} variant="outline" className="border-slate-600 text-white py-5">
                    <LogIn className="w-4 h-4 mr-2" />
                    Fazer Login
                  </Button>
                  <Button onClick={handleCadastro} className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] py-5">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar Empresa
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                  <Button
                    onClick={() => navigate('/recrutamento/candidato/bem-vindo')}
                    variant="ghost"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Não sou empresa, quero cadastrar meu currículo
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <BadgeCheck className="w-4 h-4" />
            <span>Currículo verificado por VEON Recrutamento</span>
          </div>
          <p className="text-slate-600 text-xs mt-2">
            Metodologia DISC validada cientificamente
          </p>
        </div>
      </div>

      {/* Modal de Acesso */}
      {mostrarModalAcesso && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#E31E24]/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#E31E24]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Acesso exclusivo para empresas</h2>
                <p className="text-slate-400">
                  Para enviar propostas, você precisa estar cadastrado como empresa.
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={handleCadastro} className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] py-5">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar minha empresa
                </Button>
                <Button onClick={handleLogin} variant="outline" className="w-full border-slate-600 text-white py-5">
                  <LogIn className="w-4 h-4 mr-2" />
                  Já tenho cadastro
                </Button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
                  <div className="relative flex justify-center text-xs"><span className="px-2 bg-slate-800 text-slate-500">ou</span></div>
                </div>
                <Button
                  onClick={() => { setMostrarModalAcesso(false); navigate('/recrutamento/candidato/bem-vindo'); }}
                  variant="ghost"
                  className="w-full text-purple-400 hover:text-purple-300"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Não sou empresa, quero cadastrar meu currículo
                </Button>
                <Button onClick={() => setMostrarModalAcesso(false)} variant="ghost" className="w-full text-slate-400">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
