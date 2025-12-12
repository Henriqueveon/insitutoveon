import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Link2, CheckCircle2, Clock, TrendingUp, Calendar } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  totalCandidatos: number;
  totalLinks: number;
  completados: number;
  pendentes: number;
  candidatosHoje: number;
  candidatosSemana: number;
}

interface RecentCandidate {
  id: string;
  nome_completo: string;
  cargo_atual: string;
  perfil_tipo: string | null;
  created_at: string;
  status: string;
}

export default function PainelDashboard() {
  const { empresa } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!empresa) return;

      setIsLoading(true);

      try {
        const today = new Date();
        const weekAgo = subDays(today, 7);

        // Buscar candidatos da empresa
        const { data: candidatos, error: candidatosError } = await supabase
          .from('candidatos_disc')
          .select('id, nome_completo, cargo_atual, perfil_tipo, created_at, status')
          .or(`empresa_id.eq.${empresa.id},empresa_id.is.null`)
          .order('created_at', { ascending: false });

        if (candidatosError) throw candidatosError;

        // Buscar links da empresa
        const { data: links, error: linksError } = await supabase
          .from('links_avaliacao')
          .select('id')
          .eq('empresa_id', empresa.id);

        if (linksError) throw linksError;

        // Calcular estatísticas
        const allCandidatos = candidatos || [];
        const totalCandidatos = allCandidatos.length;
        const completados = allCandidatos.filter(c => c.perfil_tipo).length;
        const pendentes = allCandidatos.filter(c => !c.perfil_tipo).length;

        const candidatosHoje = allCandidatos.filter(c => {
          const createdAt = new Date(c.created_at);
          return createdAt >= startOfDay(today) && createdAt <= endOfDay(today);
        }).length;

        const candidatosSemana = allCandidatos.filter(c => {
          const createdAt = new Date(c.created_at);
          return createdAt >= weekAgo;
        }).length;

        setStats({
          totalCandidatos,
          totalLinks: links?.length || 0,
          completados,
          pendentes,
          candidatosHoje,
          candidatosSemana,
        });

        // Candidatos recentes (últimos 5)
        setRecentCandidates(allCandidatos.slice(0, 5) as RecentCandidate[]);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [empresa]);

  const statCards = [
    {
      title: 'Total de Candidatos',
      value: stats?.totalCandidatos || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Cadastrados no sistema',
    },
    {
      title: 'Links Ativos',
      value: stats?.totalLinks || 0,
      icon: Link2,
      color: 'from-purple-500 to-purple-600',
      description: 'Links de avaliação',
    },
    {
      title: 'Testes Completos',
      value: stats?.completados || 0,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      description: 'Avaliações finalizadas',
    },
    {
      title: 'Pendentes',
      value: stats?.pendentes || 0,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Aguardando conclusão',
    },
  ];

  const getStatusBadge = (status: string, perfilTipo: string | null) => {
    if (perfilTipo) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
          Completo
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
        Pendente
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Visão geral das avaliações DISC
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-10 rounded-lg bg-slate-700" />
                  <Skeleton className="h-8 w-20 bg-slate-700" />
                  <Skeleton className="h-4 w-32 bg-slate-700" />
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm font-medium text-white mt-0.5">{stat.title}</p>
                    <p className="text-xs text-slate-400">{stat.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00D9FF]" />
              Atividade Recente
            </CardTitle>
            <CardDescription className="text-slate-400">
              Candidatos cadastrados nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full bg-slate-700" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Hoje</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{stats?.candidatosHoje || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center gap-2 text-slate-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Esta semana</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{stats?.candidatosSemana || 0}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Taxa de Conclusão
            </CardTitle>
            <CardDescription className="text-slate-400">
              Porcentagem de testes finalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full bg-slate-700" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">
                    {stats && stats.totalCandidatos > 0
                      ? Math.round((stats.completados / stats.totalCandidatos) * 100)
                      : 0}%
                  </span>
                  <span className="text-slate-400 text-sm mb-1">de conclusão</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${
                        stats && stats.totalCandidatos > 0
                          ? (stats.completados / stats.totalCandidatos) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">{stats?.completados || 0} completos</span>
                  <span className="text-yellow-400">{stats?.pendentes || 0} pendentes</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Candidates */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00D9FF]" />
            Candidatos Recentes
          </CardTitle>
          <CardDescription className="text-slate-400">
            Últimos 5 candidatos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 bg-slate-700" />
                    <Skeleton className="h-3 w-24 bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentCandidates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="mt-4 text-slate-400">Nenhum candidato cadastrado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-white font-bold text-sm">
                    {candidate.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{candidate.nome_completo}</p>
                    <p className="text-sm text-slate-400 truncate">{candidate.cargo_atual}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(candidate.status, candidate.perfil_tipo)}
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(candidate.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
