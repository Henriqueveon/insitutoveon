// =====================================================
// DASHBOARD EMPRESA - Estilo Rede Social Mobile-First
// Feed de candidatos + Stats compactos + Ações rápidas
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  FileText,
  Briefcase,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
  Eye,
  MessageSquare,
  Calendar,
  ArrowRight,
  Sparkles,
  Bell,
  ChevronRight,
  Star,
  Heart,
  Send,
  MapPin,
  Building2,
  Zap,
  Plus,
  UserPlus,
  CreditCard,
} from 'lucide-react';
import SecaoIndicacao from '../components/SecaoIndicacao';
import LinkRecrutamento from '../components/LinkRecrutamento';
// CurriculoCompletoModal removido - agora usa página dedicada

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
  socio_nome?: string;
}

interface CandidatoMatch {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  cidade: string;
  estado: string;
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  perfil_disc: string | null;
  match_score: number;
  objetivo_profissional?: string | null;
}

interface Atividade {
  id: string;
  tipo: 'proposta' | 'entrevista' | 'contratacao' | 'visualizacao';
  descricao: string;
  candidato_nome: string;
  data: string;
}

// Cores DISC
const DISC_COLORS = {
  D: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' },
  I: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  S: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' },
  C: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' },
};

export default function EmpresaDashboard() {
  const navigate = useNavigate();
  const { empresa } = useOutletContext<{ empresa: Empresa | null }>();

  const [stats, setStats] = useState({
    candidatosDisponiveis: 0,
    vagasAtivas: 0,
    emProcesso: 0,
    contratados: 0,
  });
  const [candidatosMatch, setCandidatosMatch] = useState<CandidatoMatch[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado de favoritos
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    if (empresa?.id) {
      carregarDados();
    }
  }, [empresa?.id]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        carregarStats(),
        carregarCandidatosMatch(),
        carregarAtividades(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarStats = async () => {
    // Conta candidatos com perfil DISC preenchido
    const { count: candidatos } = await supabase
      .from('candidatos_recrutamento')
      .select('*', { count: 'exact', head: true })
      .not('perfil_disc', 'is', null)
      .neq('perfil_disc', '');

    const { count: vagas } = await supabase
      .from('vagas_recrutamento')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa?.id)
      .eq('status', 'ativa');

    const { count: propostas } = await supabase
      .from('propostas_recrutamento')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa?.id)
      .in('status', ['pendente', 'aceita', 'entrevista_agendada']);

    const { count: contratados } = await supabase
      .from('propostas_recrutamento')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa?.id)
      .eq('status', 'contratado');

    setStats({
      candidatosDisponiveis: candidatos || 0,
      vagasAtivas: vagas || 0,
      emProcesso: propostas || 0,
      contratados: contratados || 0,
    });
  };

  const carregarCandidatosMatch = async () => {
    // Busca candidatos com perfil DISC preenchido (independente do status)
    const { data } = await supabase
      .from('candidatos_recrutamento')
      .select('id, nome_completo, foto_url, cidade, estado, areas_experiencia, anos_experiencia, perfil_disc, objetivo_profissional')
      .not('perfil_disc', 'is', null)
      .neq('perfil_disc', '')
      .order('created_at', { ascending: false })
      .limit(6);

    if (data) {
      const candidatosComMatch = data.map((c: any) => ({
        ...c,
        match_score: Math.floor(Math.random() * 30) + 70,
      }));
      setCandidatosMatch(candidatosComMatch as CandidatoMatch[]);
    }
  };

  const carregarAtividades = async () => {
    const { data } = await supabase
      .from('propostas_recrutamento')
      .select(`
        id,
        status,
        created_at,
        candidatos_recrutamento (nome_completo)
      `)
      .eq('empresa_id', empresa?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      const atividadesFormatadas: Atividade[] = data.map((p: any) => ({
        id: p.id,
        tipo: p.status === 'contratado' ? 'contratacao' :
              p.status === 'entrevista_agendada' ? 'entrevista' : 'proposta',
        descricao: getDescricaoAtividade(p.status),
        candidato_nome: p.candidatos_recrutamento?.nome_completo || 'Candidato',
        data: p.created_at,
      }));
      setAtividades(atividadesFormatadas);
    }
  };

  const getDescricaoAtividade = (status: string) => {
    switch (status) {
      case 'pendente': return 'Proposta enviada';
      case 'aceita': return 'Proposta aceita';
      case 'entrevista_agendada': return 'Entrevista agendada';
      case 'contratado': return 'Contratado!';
      case 'recusada': return 'Recusada';
      default: return 'Atividade';
    }
  };

  const formatarData = (data: string) => {
    const d = new Date(data);
    const agora = new Date();
    const diff = agora.getTime() - d.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 60) return `${minutos}min`;
    if (horas < 24) return `${horas}h`;
    if (dias < 7) return `${dias}d`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const primeiroNome = empresa?.socio_nome?.split(' ')[0] || empresa?.nome_fantasia || 'Empresa';

  // Função para abrir o currículo completo do candidato
  // Função para abrir currículo - agora navega para página dedicada
  const abrirCurriculo = (candidatoId: string) => {
    navigate(`/recrutamento/empresa/candidato/${candidatoId}`);
  };

  const toggleFavorito = (id: string) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 -mx-4 sm:mx-auto">
      {/* Stories / Ações Rápidas */}
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {/* Story: Buscar */}
          <button
            onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E31E24] to-[#003DA5] p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-white/70">Buscar</span>
          </button>

          {/* Story: Nova Vaga */}
          <button
            onClick={() => navigate('/recrutamento/empresa/minhas-vagas')}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-white/70">Nova Vaga</span>
          </button>

          {/* Story: Em Processo */}
          <button
            onClick={() => navigate('/recrutamento/empresa/em-processo')}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-white/70">Processo</span>
          </button>

          {/* Story: Créditos */}
          <button
            onClick={() => navigate('/recrutamento/empresa/creditos')}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-white/70">Créditos</span>
          </button>

          {/* Story: Indicar */}
          <button
            onClick={() => navigate('/recrutamento/empresa/indicacao')}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-white/70">Indicar</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Stats Cards Compactos */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <p className="text-xl font-bold text-white">{stats.candidatosDisponiveis}</p>
            <p className="text-[10px] text-zinc-500">Disponíveis</p>
          </button>
          <button
            onClick={() => navigate('/recrutamento/empresa/minhas-vagas')}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <p className="text-xl font-bold text-purple-400">{stats.vagasAtivas}</p>
            <p className="text-[10px] text-zinc-500">Vagas</p>
          </button>
          <button
            onClick={() => navigate('/recrutamento/empresa/em-processo')}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <p className="text-xl font-bold text-orange-400">{stats.emProcesso}</p>
            <p className="text-[10px] text-zinc-500">Processo</p>
          </button>
          <button
            onClick={() => navigate('/recrutamento/empresa/contratados')}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <p className="text-xl font-bold text-emerald-400">{stats.contratados}</p>
            <p className="text-[10px] text-zinc-500">Contratados</p>
          </button>
        </div>
      </div>

      {/* Header Feed */}
      <div className="px-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Profissionais para você
        </h2>
        <button
          onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feed de Candidatos */}
      {candidatosMatch.length > 0 ? (
        <div className="space-y-4 px-4">
          {candidatosMatch.map((candidato) => {
            const discColor = candidato.perfil_disc ? DISC_COLORS[candidato.perfil_disc as keyof typeof DISC_COLORS] : null;

            return (
              <div
                key={candidato.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Header do Card */}
                <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                  <div className="relative">
                    <Avatar className="h-11 w-11 ring-2 ring-white/10">
                      <AvatarImage src={candidato.foto_url || undefined} />
                      <AvatarFallback className="bg-zinc-700 text-white font-bold">
                        {(candidato.nome_completo || 'P').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {candidato.perfil_disc && discColor && (
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${discColor.bg} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-zinc-900`}>
                        {candidato.perfil_disc}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {candidato.nome_completo}
                    </p>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{candidato.cidade}, {candidato.estado}</span>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      candidato.match_score >= 90
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        : candidato.match_score >= 80
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-r from-zinc-600 to-zinc-700'
                    } text-white text-xs font-bold px-2.5 py-1 rounded-full`}
                  >
                    {candidato.match_score}%
                  </Badge>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  {candidato.objetivo_profissional && (
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                      {candidato.objetivo_profissional}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {candidato.anos_experiencia && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                        <Briefcase className="w-3 h-3" />
                        {candidato.anos_experiencia} anos exp.
                      </span>
                    )}
                    {candidato.perfil_disc && discColor && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-opacity-20 ${discColor.text} text-xs font-medium ${discColor.border} border`}>
                        <Star className="w-3 h-3" />
                        Perfil {candidato.perfil_disc}
                      </span>
                    )}
                    {candidato.areas_experiencia?.slice(0, 1).map((area, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleFavorito(candidato.id)}
                      className={`flex items-center gap-1.5 transition-colors active:scale-95 ${
                        favoritos.includes(candidato.id) ? 'text-red-500' : 'text-white/70 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favoritos.includes(candidato.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => abrirCurriculo(candidato.id)}
                      className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors active:scale-95"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  <Button
                    onClick={() => navigate(`/recrutamento/empresa/buscar-candidatos?candidato=${candidato.id}`)}
                    className="h-9 bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-xl text-sm active:scale-95"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Enviar Proposta
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <Users className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Nenhum profissional disponível
            </h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              Cadastre suas vagas para encontrar os melhores profissionais.
            </p>
            <Button
              onClick={() => navigate('/recrutamento/empresa/minhas-vagas')}
              className="bg-white text-black font-semibold rounded-xl hover:bg-white/90"
            >
              Criar Vaga
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Atividade Recente */}
      {atividades.length > 0 && (
        <>
          <div className="px-4 pt-2">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Atividade Recente
            </h3>
          </div>
          <div className="px-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
              {atividades.slice(0, 4).map((atividade) => (
                <div key={atividade.id} className="flex items-center gap-3 p-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    atividade.tipo === 'contratacao' ? 'bg-emerald-500/20' :
                    atividade.tipo === 'entrevista' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                  }`}>
                    {atividade.tipo === 'contratacao' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : atividade.tipo === 'entrevista' ? (
                      <Calendar className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{atividade.candidato_nome}</p>
                    <p className="text-xs text-zinc-500">{atividade.descricao}</p>
                  </div>
                  <span className="text-xs text-zinc-600">{formatarData(atividade.data)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CTA Créditos */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Desbloqueie mais talentos</p>
              <p className="text-emerald-400/70 text-xs mt-1">
                Adicione créditos para enviar propostas ilimitadas
              </p>
              <Button
                onClick={() => navigate('/recrutamento/empresa/creditos')}
                size="sm"
                className="mt-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 h-8 text-xs"
              >
                Adicionar Créditos
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
