// =====================================================
// DASHBOARD EMPRESA - Área de Recrutamento VEON
// Visão geral com stats e atividades
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
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
}

interface Atividade {
  id: string;
  tipo: 'proposta' | 'entrevista' | 'contratacao' | 'visualizacao';
  descricao: string;
  candidato_nome: string;
  data: string;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo_notificacao: string;
  lida: boolean;
  created_at: string;
}

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
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        carregarNotificacoes(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarStats = async () => {
    // Candidatos disponíveis
    const { count: candidatos } = await supabase
      .from('candidatos_recrutamento')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'disponivel');

    // Vagas ativas da empresa
    const { count: vagas } = await supabase
      .from('vagas_recrutamento')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa?.id)
      .eq('status', 'ativa');

    // Propostas em andamento
    const { count: propostas } = await supabase
      .from('propostas_recrutamento')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa?.id)
      .in('status', ['pendente', 'aceita', 'entrevista_agendada']);

    // Contratados
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
    // Buscar candidatos disponíveis com perfil completo
    const { data } = await supabase
      .from('candidatos_recrutamento')
      .select('id, nome_completo, foto_url, cidade, estado, areas_experiencia, anos_experiencia, perfil_disc')
      .eq('status', 'disponivel')
      .not('perfil_disc', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      // Simular score de match (em produção seria calculado baseado nas vagas da empresa)
      const candidatosComMatch = data.map((c: any) => ({
        ...c,
        match_score: Math.floor(Math.random() * 30) + 70, // 70-100%
      }));
      setCandidatosMatch(candidatosComMatch as CandidatoMatch[]);
    }
  };

  const carregarAtividades = async () => {
    // Buscar últimas propostas/atividades
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
      case 'contratado': return 'Candidato contratado';
      case 'recusada': return 'Proposta recusada';
      default: return 'Atividade';
    }
  };

  const carregarNotificacoes = async () => {
    const { data } = await supabase
      .from('notificacoes_recrutamento')
      .select('*')
      .eq('tipo_destinatario', 'empresa')
      .eq('destinatario_id', empresa?.id)
      .eq('lida', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setNotificacoes(data as Notificacao[]);
    }
  };

  const formatarData = (data: string) => {
    const d = new Date(data);
    const agora = new Date();
    const diff = agora.getTime() - d.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 60) return `${minutos}min atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias < 7) return `${dias}d atrás`;
    return d.toLocaleDateString('pt-BR');
  };

  const getIconeAtividade = (tipo: string) => {
    switch (tipo) {
      case 'proposta': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'entrevista': return <Calendar className="w-4 h-4 text-yellow-400" />;
      case 'contratacao': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Eye className="w-4 h-4 text-slate-400" />;
    }
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

  const statsCards = [
    {
      label: 'Candidatos Disponíveis',
      value: stats.candidatosDisponiveis,
      icon: Search,
      color: 'from-blue-500 to-blue-600',
      link: '/recrutamento/empresa/buscar-candidatos',
    },
    {
      label: 'Vagas Ativas',
      value: stats.vagasAtivas,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      link: '/recrutamento/empresa/minhas-vagas',
    },
    {
      label: 'Em Processo',
      value: stats.emProcesso,
      icon: Briefcase,
      color: 'from-orange-500 to-orange-600',
      link: '/recrutamento/empresa/em-processo',
    },
    {
      label: 'Contratados',
      value: stats.contratados,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      link: '/recrutamento/empresa/contratados',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá, {empresa?.nome_fantasia || empresa?.razao_social}!
          </h1>
          <p className="text-slate-400">
            Confira o resumo da sua área de recrutamento
          </p>
        </div>
        <Button
          onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
          className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
        >
          <Search className="w-4 h-4 mr-2" />
          Buscar Candidatos
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.label}
            className="bg-slate-800/60 border-slate-700 cursor-pointer hover:bg-slate-800/80 transition-all"
            onClick={() => navigate(stat.link)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid de conteúdo */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Candidatos com melhor match */}
        <Card className="lg:col-span-2 bg-slate-800/60 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
              Candidatos com melhor match
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidatosMatch.length > 0 ? (
              candidatosMatch.map((candidato) => (
                <div
                  key={candidato.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-all"
                  onClick={() => navigate(`/recrutamento/empresa/buscar-candidatos?candidato=${candidato.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={candidato.foto_url || undefined} />
                        <AvatarFallback className="bg-slate-600 text-white">
                          {candidato.nome_completo.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {candidato.perfil_disc && (
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getCorPerfil(candidato.perfil_disc)} flex items-center justify-center text-xs font-bold text-white`}>
                          {candidato.perfil_disc}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {candidato.nome_completo}
                      </p>
                      <p className="text-xs text-slate-400">
                        {candidato.cidade}, {candidato.estado} • {candidato.anos_experiencia || 0} anos exp.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={`${
                        candidato.match_score >= 90
                          ? 'bg-green-500/20 text-green-400'
                          : candidato.match_score >= 80
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {candidato.match_score}% match
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum candidato disponível no momento</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Atividade recente */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-base">
                <Clock className="w-5 h-5 mr-2 text-slate-400" />
                Atividade recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {atividades.length > 0 ? (
                atividades.map((atividade) => (
                  <div
                    key={atividade.id}
                    className="flex items-start space-x-3 text-sm"
                  >
                    <div className="mt-0.5">
                      {getIconeAtividade(atividade.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 truncate">
                        {atividade.descricao}
                      </p>
                      <p className="text-xs text-slate-500">
                        {atividade.candidato_nome} • {formatarData(atividade.data)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center text-base">
                <Bell className="w-5 h-5 mr-2 text-slate-400" />
                Notificações
              </CardTitle>
              {notificacoes.length > 0 && (
                <Badge className="bg-[#E31E24] text-white">
                  {notificacoes.length}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {notificacoes.length > 0 ? (
                notificacoes.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2 bg-slate-700/30 rounded-lg"
                  >
                    <p className="text-sm text-white font-medium">
                      {notif.titulo}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {notif.mensagem}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatarData(notif.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Nenhuma notificação
                </p>
              )}
            </CardContent>
          </Card>

          {/* CTA Créditos */}
          <Card className="bg-gradient-to-br from-[#E31E24]/20 to-[#003DA5]/20 border-[#E31E24]/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-10 h-10 text-[#E31E24] mx-auto mb-2" />
              <p className="text-white font-medium mb-1">
                Aumente suas contratações
              </p>
              <p className="text-sm text-slate-400 mb-3">
                Adicione créditos para desbloquear mais candidatos
              </p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
                onClick={() => navigate('/recrutamento/empresa/creditos')}
              >
                Adicionar Créditos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
