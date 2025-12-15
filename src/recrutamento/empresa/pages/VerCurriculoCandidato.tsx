// =====================================================
// VER CURRICULO CANDIDATO - Página dedicada para Empresa
// IGUAL ao MeuCurriculoCandidato + CurriculoDISCReport
// Com botões de ação: Salvar e Solicitar Entrevista
// =====================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  Home,
  Clock,
  DollarSign,
  Play,
  Target,
  CheckCircle,
  CheckCircle2,
  Building2,
  Brain,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Heart,
  Loader2,
  Send,
  Star,
  Calendar,
  Shield,
  Users,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

// IMPORTA O COMPONENTE DE RELATÓRIO DISC QUE JÁ FUNCIONA (35KB, 20+ seções)
import CurriculoDISCReport from '@/recrutamento/candidato/components/CurriculoDISCReport';

interface Profile {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface ConfiabilidadeData {
  score: number | null;
  nivel: string | null;
  flags: string[] | null;
}

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
  bairro: string | null;
  perfil_disc: string | null;
  perfil_natural: Record<string, number> | null;
  objetivo_profissional: string | null;
  confiabilidade: number | null;
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  ultima_empresa: string | null;
  ultimo_cargo: string | null;
  tempo_ultima_empresa: string | null;
  motivo_saida: string | null;
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
  estado_civil: string | null;
  tem_filhos: boolean | null;
  valores_empresa: string[] | null;
  areas_interesse: string[] | null;
  status: string;
}

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  creditos: number;
  cadastro_completo?: boolean;
  socio_nome?: string | null;
}

export default function VerCurriculoCandidato() {
  const { candidatoId } = useParams<{ candidatoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showDISCReport, setShowDISCReport] = useState(true);
  const [confiabilidade, setConfiabilidade] = useState<ConfiabilidadeData | null>(null);
  const [isSalvando, setIsSalvando] = useState(false);
  const [isSolicitando, setIsSolicitando] = useState(false);
  const [jaSalvo, setJaSalvo] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);

  useEffect(() => {
    if (candidatoId) {
      carregarDados();
    }
  }, [candidatoId]);

  const carregarDados = async () => {
    setIsLoading(true);
    setErro(null);

    try {
      // 1. Verificar empresa logada
      const empresaId = localStorage.getItem('veon_empresa_id');
      if (!empresaId) {
        navigate('/recrutamento/empresa/login');
        return;
      }

      // Buscar dados da empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas_recrutamento')
        .select('id, razao_social, nome_fantasia, creditos, cadastro_completo, socio_nome')
        .eq('id', empresaId)
        .single();

      if (empresaError || !empresaData) {
        navigate('/recrutamento/empresa/login');
        return;
      }

      setEmpresa(empresaData as any);

      // 2. Buscar candidato COMPLETO
      const { data: candidatoData, error: candidatoError } = await supabase
        .from('candidatos_recrutamento')
        .select('*')
        .eq('id', candidatoId)
        .single();

      if (candidatoError || !candidatoData) {
        setErro('Candidato não encontrado');
        setIsLoading(false);
        return;
      }

      if (candidatoData.status === 'contratado') {
        setErro('Este profissional já foi contratado');
        setIsLoading(false);
        return;
      }

      // Converter para o tipo correto
      const candidatoFormatado: Candidato = {
        ...candidatoData,
        perfil_natural: candidatoData.perfil_natural as Record<string, number> | null,
        confiabilidade: candidatoData.confiabilidade ?? null,
      };

      setCandidato(candidatoFormatado);

      // 3. Montar dados de confiabilidade
      if (candidatoData.confiabilidade !== null) {
        const nivel = candidatoData.confiabilidade >= 80 ? 'ALTA' :
          candidatoData.confiabilidade >= 50 ? 'MEDIA' : 'BAIXA';
        setConfiabilidade({
          score: candidatoData.confiabilidade,
          nivel,
          flags: null,
        });
      }

      // 4. Verificar se já está salvo
      const { data: favoritoExiste } = await supabase
        .from('candidatos_favoritos')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('candidato_id', candidatoId)
        .single();

      if (favoritoExiste) {
        setJaSalvo(true);
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao carregar currículo');
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const calcularIdade = (data: string) => {
    const hoje = new Date();
    const nasc = new Date(data);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const getCorPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'bg-red-500';
      case 'I': return 'bg-yellow-500';
      case 'S': return 'bg-green-500';
      case 'C': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getNomePerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'Dominância';
      case 'I': return 'Influência';
      case 'S': return 'Estabilidade';
      case 'C': return 'Conformidade';
      default: return 'Não avaliado';
    }
  };

  const getDescricaoPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'Direto, decisivo, orientado a resultados. Gosta de desafios e de assumir o controle das situações.';
      case 'I': return 'Comunicativo, entusiasta, otimista. Adora interagir com pessoas e criar conexões.';
      case 'S': return 'Calmo, paciente, leal. Valoriza estabilidade e trabalha bem em equipe.';
      case 'C': return 'Analítico, preciso, detalhista. Preza pela qualidade e segue procedimentos.';
      default: return '';
    }
  };

  const getFaixaSalarialLabel = (faixa: string) => {
    const faixas: Record<string, string> = {
      'ate_1500': 'Até R$ 1.500',
      '1500_2500': 'R$ 1.500 - R$ 2.500',
      '2500_4000': 'R$ 2.500 - R$ 4.000',
      '4000_6000': 'R$ 4.000 - R$ 6.000',
      '6000_10000': 'R$ 6.000 - R$ 10.000',
      'acima_10000': 'Acima de R$ 10.000',
    };
    return faixas[faixa] || faixa;
  };

  const getDisponibilidadeLabel = (disp: string) => {
    const disps: Record<string, string> = {
      'imediata': 'Imediata',
      '15_dias': 'Em 15 dias',
      '30_dias': 'Em 30 dias',
      'a_combinar': 'A combinar',
    };
    return disps[disp] || disp;
  };

  // Converte perfil_natural para o formato do CurriculoDISCReport
  const getProfileFromDisc = (disc: string): Profile => {
    const base = { D: 10, I: 10, S: 10, C: 10 };
    if (disc === 'D') return { ...base, D: 20 };
    if (disc === 'I') return { ...base, I: 20 };
    if (disc === 'S') return { ...base, S: 20 };
    if (disc === 'C') return { ...base, C: 20 };
    return base;
  };

  const convertToProfile = (data: Record<string, number> | null): Profile | null => {
    if (!data) return null;
    return {
      D: data.D ?? data.d ?? 10,
      I: data.I ?? data.i ?? 10,
      S: data.S ?? data.s ?? 10,
      C: data.C ?? data.c ?? 10,
    };
  };

  // Ações
  const handleVoltar = () => {
    navigate(-1);
  };

  const handleSalvarCandidato = async () => {
    if (!empresa || !candidato) return;

    setIsSalvando(true);
    try {
      if (jaSalvo) {
        await supabase
          .from('candidatos_favoritos')
          .delete()
          .eq('empresa_id', empresa.id)
          .eq('candidato_id', candidato.id);

        setJaSalvo(false);
        toast({
          title: 'Candidato removido',
          description: 'O candidato foi removido dos seus salvos.',
        });
      } else {
        await supabase
          .from('candidatos_favoritos')
          .insert({
            empresa_id: empresa.id,
            candidato_id: candidato.id,
          });

        setJaSalvo(true);
        toast({
          title: 'Candidato salvo!',
          description: 'Você pode encontrá-lo na aba "Em Processo".',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o candidato.',
        variant: 'destructive',
      });
    } finally {
      setIsSalvando(false);
    }
  };

  const handleSolicitarEntrevista = async () => {
    if (!empresa || !candidato) return;

    if ((empresa.creditos || 0) < 39.9) {
      toast({
        title: 'Créditos insuficientes',
        description: 'Você precisa de R$ 39,90 para solicitar uma entrevista.',
        variant: 'destructive',
      });
      navigate('/recrutamento/empresa/creditos');
      return;
    }

    setIsSolicitando(true);
    try {
      const { error } = await supabase
        .from('propostas_entrevista')
        .insert({
          empresa_id: empresa.id,
          candidato_id: candidato.id,
          status: 'pendente',
          valor_cobrado: 39.9,
        });

      if (error) throw error;

      await supabase
        .from('empresas_recrutamento')
        .update({ creditos: (empresa.creditos || 0) - 39.9 })
        .eq('id', empresa.id);

      setShowConfirmacao(false);

      toast({
        title: 'Entrevista solicitada!',
        description: 'O candidato receberá sua proposta e entrará em contato.',
      });

      navigate('/recrutamento/empresa/em-processo');
    } catch (error) {
      console.error('Erro ao solicitar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível solicitar a entrevista.',
        variant: 'destructive',
      });
    } finally {
      setIsSolicitando(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-slate-800/60 border-slate-700 max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{erro || 'Currículo não encontrado'}</h2>
            <Button onClick={handleVoltar} className="mt-4 bg-gradient-to-r from-[#E31E24] to-[#B91C1C]">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Montar naturalProfile para o CurriculoDISCReport
  const naturalProfile: Profile = convertToProfile(candidato.perfil_natural) ||
    (candidato.perfil_disc ? getProfileFromDisc(candidato.perfil_disc) : { D: 10, I: 10, S: 10, C: 10 });

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={handleVoltar}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          {empresa && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Building2 className="w-3 h-3 mr-1" />
              {empresa.nome_fantasia || empresa.razao_social}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* ========== CARD PRINCIPAL - IGUAL MeuCurriculoCandidato ========== */}
        <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
          {/* Header com foto */}
          <div className="bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-white/20">
                <AvatarImage src={candidato.foto_url || undefined} />
                <AvatarFallback className="bg-slate-600 text-white text-2xl">
                  {candidato.nome_completo.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">
                  {candidato.nome_completo}
                </h2>
                <p className="text-slate-400 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {candidato.cidade}, {candidato.estado}
                </p>
                <p className="text-slate-400 text-sm">
                  {calcularIdade(candidato.data_nascimento)} anos
                </p>
              </div>
            </div>

            {/* Perfil DISC */}
            {candidato.perfil_disc && (
              <div className="mt-4 flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full ${getCorPerfil(candidato.perfil_disc)} flex items-center justify-center text-xl font-bold text-white`}>
                  {candidato.perfil_disc}
                </div>
                <div>
                  <p className="text-white font-medium">
                    Perfil {getNomePerfil(candidato.perfil_disc)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {getDescricaoPerfil(candidato.perfil_disc)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-4 space-y-6">
            {/* Objetivo */}
            {candidato.objetivo_profissional && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Objetivo Profissional
                </h3>
                <p className="text-white">{candidato.objetivo_profissional}</p>
              </div>
            )}

            {/* Vídeo */}
            {candidato.video_url && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Vídeo de Apresentação
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                  <video
                    src={candidato.video_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={candidato.foto_url || undefined}
                  />
                </div>
              </div>
            )}

            {/* Experiência */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Experiência Profissional
              </h3>
              {candidato.ultima_empresa ? (
                <div className="space-y-2">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-white font-medium">{candidato.ultimo_cargo}</p>
                    <p className="text-slate-400 text-sm">{candidato.ultima_empresa}</p>
                    {candidato.tempo_ultima_empresa && (
                      <p className="text-slate-500 text-xs mt-1">
                        Período: {candidato.tempo_ultima_empresa}
                      </p>
                    )}
                  </div>
                  {candidato.anos_experiencia && (
                    <p className="text-slate-400 text-sm">
                      {candidato.anos_experiencia} {candidato.anos_experiencia === 1 ? 'ano' : 'anos'} de experiência total
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">Primeiro emprego</p>
              )}

              {/* Áreas de experiência */}
              {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidato.areas_experiencia.map((area, i) => (
                    <Badge key={i} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      {area}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Formação */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Formação e Certificações
              </h3>
              <div className="space-y-2">
                <p className="text-white">{candidato.escolaridade || 'Não informado'}</p>
                {candidato.curso && (
                  <p className="text-slate-400 text-sm">{candidato.curso}</p>
                )}
                {candidato.certificacoes && (
                  <p className="text-slate-500 text-sm">
                    Certificações: {candidato.certificacoes}
                  </p>
                )}
              </div>
            </div>

            {/* Disponibilidade */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Disponibilidade
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {candidato.disponibilidade_inicio && (
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Início</p>
                    <p className="text-white text-sm">{getDisponibilidadeLabel(candidato.disponibilidade_inicio)}</p>
                  </div>
                )}
                {candidato.disponibilidade_horario && (
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Horário</p>
                    <p className="text-white text-sm">{candidato.disponibilidade_horario}</p>
                  </div>
                )}
                {candidato.regime_preferido && (
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Regime</p>
                    <p className="text-white text-sm">{candidato.regime_preferido.toUpperCase()}</p>
                  </div>
                )}
                {candidato.pretensao_salarial && (
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Pretensão</p>
                    <p className="text-white text-sm">{getFaixaSalarialLabel(candidato.pretensao_salarial)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Badges extras */}
            <div className="flex flex-wrap gap-2">
              {candidato.possui_cnh && candidato.possui_cnh !== 'Não' && (
                <Badge className="bg-blue-500/20 text-blue-400">
                  <Car className="w-3 h-3 mr-1" />
                  CNH {candidato.possui_cnh}
                </Badge>
              )}
              {candidato.possui_veiculo && candidato.possui_veiculo !== 'Não' && (
                <Badge className="bg-green-500/20 text-green-400">
                  <Car className="w-3 h-3 mr-1" />
                  {candidato.possui_veiculo}
                </Badge>
              )}
              {candidato.aceita_viajar === 'sim' && (
                <Badge className="bg-purple-500/20 text-purple-400">
                  <Plane className="w-3 h-3 mr-1" />
                  Aceita viajar
                </Badge>
              )}
              {candidato.aceita_mudanca === 'sim' && (
                <Badge className="bg-orange-500/20 text-orange-400">
                  <Home className="w-3 h-3 mr-1" />
                  Aceita mudança
                </Badge>
              )}
            </div>

            {/* Áreas de interesse */}
            {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Áreas de Interesse
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidato.areas_interesse.map((area, i) => (
                    <Badge key={i} className="bg-slate-700 text-slate-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Valores que busca */}
            {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  O que busca em uma empresa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidato.valores_empresa.map((valor, i) => (
                    <Badge key={i} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {valor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========== RELATÓRIO DISC COMPLETO ========== */}
        {candidato.perfil_disc && (
          <div className="space-y-4">
            <button
              onClick={() => setShowDISCReport(!showDISCReport)}
              className="w-full flex items-center justify-between bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 border border-[#E31E24]/30 rounded-2xl p-4 text-left hover:border-[#E31E24]/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#003DA5] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Relatório DISC Completo</h3>
                  <p className="text-slate-400 text-sm">Análise comportamental detalhada</p>
                </div>
              </div>
              {showDISCReport ? (
                <ChevronUp className="w-6 h-6 text-white/70" />
              ) : (
                <ChevronDown className="w-6 h-6 text-white/70" />
              )}
            </button>

            {/* COMPONENTE DISC REPORT - 20+ SEÇÕES */}
            {showDISCReport && (
              <CurriculoDISCReport
                naturalProfile={naturalProfile}
                nomeCompleto={candidato.nome_completo}
                confiabilidade={confiabilidade}
              />
            )}
          </div>
        )}
      </div>

      {/* ========== BOTÕES DE AÇÃO FIXOS ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Botão Voltar */}
          <Button
            variant="outline"
            onClick={handleVoltar}
            className="border-gray-600 bg-gray-800 text-white hover:bg-gray-700 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Botão Salvar */}
          <Button
            variant="outline"
            onClick={handleSalvarCandidato}
            disabled={isSalvando}
            className={`border-gray-600 bg-gray-800 text-white hover:bg-gray-700 hover:text-white ${
              jaSalvo ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30' : ''
            }`}
          >
            {isSalvando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : jaSalvo ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>

          {/* Botão Agendar Entrevista */}
          <Button
            onClick={() => setShowConfirmacao(true)}
            className="flex-1 bg-[#E31E24] hover:bg-[#E31E24]/90 text-white font-semibold py-6"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Entrevista
          </Button>
        </div>
      </div>

      {/* ========== MODAL DE CONFIRMAÇÃO DE ENTREVISTA ========== */}
      <AlertDialog open={showConfirmacao} onOpenChange={setShowConfirmacao}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 max-w-md mx-4">
          <AlertDialogHeader className="text-center">
            {/* Ícone de sucesso */}
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-green-400" />
            </div>

            <AlertDialogTitle className="text-xl text-white text-center">
              Parece que você encontrou um ótimo profissional, {empresa?.socio_nome?.split(' ')[0] || 'Parceiro'}!
            </AlertDialogTitle>

            <AlertDialogDescription className="text-center space-y-4 pt-4">
              {/* Card do candidato mini */}
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
                {candidato?.foto_url ? (
                  <img
                    src={candidato.foto_url}
                    alt={candidato.nome_completo}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-400">
                      {candidato?.nome_completo?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="font-medium text-white">{candidato?.nome_completo}</p>
                  <p className="text-sm text-gray-400">{candidato?.cidade}, {candidato?.estado}</p>
                </div>
              </div>

              {/* Mensagem principal */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">
                      Investimento protegido
                    </p>
                    <p className="text-gray-300 text-sm">
                      Ao confirmar, você investe <span className="text-white font-semibold">R$ 39,90</span> para
                      agendar esta entrevista. <span className="text-green-400 font-medium">Você só paga se o
                      candidato aceitar!</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Candidato demonstra compromisso pagando R$ 9,90</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Evite perda de tempo com profissionais sem interesse</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Reembolso automático se não houver aceite</span>
                </div>
              </div>

              {/* Texto pequeno */}
              <p className="text-xs text-gray-500 pt-2">
                Ao aceitar, o candidato paga R$ 9,90 demonstrando absoluto compromisso com sua empresa.
                Assim você evita perda de tempo com profissionais que não têm comprometimento real.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSolicitarEntrevista}
              disabled={isSolicitando}
              className="bg-[#E31E24] hover:bg-[#E31E24]/90 text-white font-semibold"
            >
              {isSolicitando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Confirmar Entrevista
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
