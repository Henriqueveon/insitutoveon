// =====================================================
// DASHBOARD - Área de Recrutamento (Painel do Gestor)
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  empresasAtivas: number;
  candidatosDisponiveis: number;
  vagasAtivas: number;
  entrevistasPendentes: number;
  receitaTotal: number;
  receitaEmpresas: number;
  receitaCandidatos: number;
}

interface RecentActivity {
  id: string;
  tipo: 'empresa' | 'candidato' | 'vaga' | 'entrevista' | 'pagamento';
  descricao: string;
  data: string;
}

export default function RecrutamentoDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Buscar empresas ativas
        const { count: empresasAtivas } = await supabase
          .from('empresas_recrutamento')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');

        // Buscar candidatos disponíveis
        const { count: candidatosDisponiveis } = await supabase
          .from('candidatos_recrutamento')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'disponivel');

        // Buscar vagas ativas
        const { count: vagasAtivas } = await supabase
          .from('vagas_recrutamento')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativa');

        // Buscar entrevistas pendentes
        const { count: entrevistasPendentes } = await supabase
          .from('solicitacoes_entrevista')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'aguardando_candidato');

        // Buscar receita total (transações aprovadas)
        const { data: transacoes } = await supabase
          .from('transacoes_recrutamento')
          .select('valor, tipo')
          .eq('status', 'aprovado');

        const receitaTotal = transacoes?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;
        const receitaEmpresas = transacoes
          ?.filter(t => t.tipo === 'compra_creditos')
          ?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;
        const receitaCandidatos = transacoes
          ?.filter(t => t.tipo === 'aceite_proposta')
          ?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;

        setStats({
          empresasAtivas: empresasAtivas || 0,
          candidatosDisponiveis: candidatosDisponiveis || 0,
          vagasAtivas: vagasAtivas || 0,
          entrevistasPendentes: entrevistasPendentes || 0,
          receitaTotal,
          receitaEmpresas,
          receitaCandidatos,
        });

        // Buscar atividades recentes (últimas 10)
        const activities: RecentActivity[] = [];

        // Últimas empresas cadastradas
        const { data: empresasRecentes } = await supabase
          .from('empresas_recrutamento')
          .select('id, razao_social, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        empresasRecentes?.forEach(e => {
          activities.push({
            id: `empresa-${e.id}`,
            tipo: 'empresa',
            descricao: `Nova empresa: ${e.razao_social}`,
            data: e.created_at,
          });
        });

        // Últimos candidatos cadastrados
        const { data: candidatosRecentes } = await supabase
          .from('candidatos_recrutamento')
          .select('id, nome_completo, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        candidatosRecentes?.forEach(c => {
          activities.push({
            id: `candidato-${c.id}`,
            tipo: 'candidato',
            descricao: `Novo candidato: ${c.nome_completo?.split(' ')[0] || 'Anônimo'}`,
            data: c.created_at,
          });
        });

        // Últimas vagas criadas
        const { data: vagasRecentes } = await supabase
          .from('vagas_recrutamento')
          .select('id, titulo, created_at')
          .order('created_at', { ascending: false })
          .limit(2);

        vagasRecentes?.forEach(v => {
          activities.push({
            id: `vaga-${v.id}`,
            tipo: 'vaga',
            descricao: `Nova vaga: ${v.titulo}`,
            data: v.created_at,
          });
        });

        // Últimas entrevistas
        const { data: entrevistasRecentes } = await supabase
          .from('solicitacoes_entrevista')
          .select('id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(2);

        entrevistasRecentes?.forEach(e => {
          const statusText = e.status === 'aceita' ? 'aceita' : e.status === 'recusada' ? 'recusada' : 'pendente';
          activities.push({
            id: `entrevista-${e.id}`,
            tipo: 'entrevista',
            descricao: `Solicitação de entrevista ${statusText}`,
            data: e.created_at,
          });
        });

        // Ordenar por data e pegar as 10 mais recentes
        activities.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        setRecentActivities(activities.slice(0, 10));

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Empresas Cadastradas',
      value: stats?.empresasAtivas || 0,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      description: 'Empresas ativas',
    },
    {
      title: 'Candidatos Disponíveis',
      value: stats?.candidatosDisponiveis || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      description: 'Prontos para contratação',
    },
    {
      title: 'Vagas Ativas',
      value: stats?.vagasAtivas || 0,
      icon: Briefcase,
      color: 'from-amber-500 to-amber-600',
      description: 'Em andamento',
    },
    {
      title: 'Entrevistas Pendentes',
      value: stats?.entrevistasPendentes || 0,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      description: 'Aguardando candidato',
    },
    {
      title: 'Receita Total',
      value: `R$ ${(stats?.receitaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Transações aprovadas',
      isValue: true,
    },
  ];

  const getActivityIcon = (tipo: RecentActivity['tipo']) => {
    switch (tipo) {
      case 'empresa':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'candidato':
        return <Users className="w-4 h-4 text-green-400" />;
      case 'vaga':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'entrevista':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'pagamento':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard - Recrutamento</h1>
        <p className="text-slate-400 mt-1">
          Visão geral da área de recrutamento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-white ${stat.isValue ? 'text-xl' : 'text-3xl'}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-white mt-0.5 truncate">{stat.title}</p>
                    <p className="text-xs text-slate-400">{stat.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  R$ {(stats?.receitaEmpresas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-slate-400">Receita de Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  R$ {(stats?.receitaCandidatos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-slate-400">Receita de Candidatos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  R$ {(stats?.receitaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-slate-400">Total Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Atividades Recentes
          </CardTitle>
          <CardDescription className="text-slate-400">
            Últimos cadastros, entrevistas e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64 bg-slate-700" />
                    <Skeleton className="h-3 w-24 bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="mt-4 text-slate-400">Nenhuma atividade recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    {getActivityIcon(activity.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.descricao}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(activity.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
