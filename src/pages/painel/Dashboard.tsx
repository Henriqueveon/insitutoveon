import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CheckCircle2, CreditCard, TrendingUp, Calendar, ClipboardList, UserCheck } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  totalAnalistas: number;
  analistasAtivos: number;
  totalLicencas: number;
  licencasUsadas: number;
  totalCandidatos: number;
  candidatosHoje: number;
  candidatosSemana: number;
  candidatosMes: number;
}

interface RecentCandidate {
  id: string;
  nome_completo: string;
  cargo_atual: string;
  created_at: string;
}

interface RecentAnalista {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  licencas_total: number;
  licencas_usadas: number;
  data_cadastro: string;
}

export default function PainelDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);
  const [recentAnalistas, setRecentAnalistas] = useState<RecentAnalista[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        const today = new Date();
        const weekAgo = subDays(today, 7);
        const monthStart = startOfMonth(today);

        // Buscar analistas
        const { data: analistas, error: analistasError } = await supabase
          .from('analistas')
          .select('id, nome, email, tipo, licencas_total, licencas_usadas, ativo, data_cadastro')
          .order('data_cadastro', { ascending: false });

        if (analistasError) {
          console.error('Erro ao buscar analistas:', analistasError);
        }

        const allAnalistas = analistas || [];
        const totalAnalistas = allAnalistas.length;
        const analistasAtivos = allAnalistas.filter(a => a.ativo).length;
        const totalLicencas = allAnalistas.reduce((acc, a) => acc + (a.licencas_total || 0), 0);
        const licencasUsadas = allAnalistas.reduce((acc, a) => acc + (a.licencas_usadas || 0), 0);

        // Buscar candidatos
        const { data: candidatos, error: candidatosError } = await supabase
          .from('candidatos_disc')
          .select('id, nome_completo, cargo_atual, created_at')
          .order('created_at', { ascending: false });

        if (candidatosError) {
          console.error('Erro ao buscar candidatos:', candidatosError);
        }

        const allCandidatos = candidatos || [];
        const totalCandidatos = allCandidatos.length;

        const candidatosHoje = allCandidatos.filter(c => {
          const createdAt = new Date(c.created_at);
          return createdAt >= startOfDay(today) && createdAt <= endOfDay(today);
        }).length;

        const candidatosSemana = allCandidatos.filter(c => {
          const createdAt = new Date(c.created_at);
          return createdAt >= weekAgo;
        }).length;

        const candidatosMes = allCandidatos.filter(c => {
          const createdAt = new Date(c.created_at);
          return createdAt >= monthStart;
        }).length;

        setStats({
          totalAnalistas,
          analistasAtivos,
          totalLicencas,
          licencasUsadas,
          totalCandidatos,
          candidatosHoje,
          candidatosSemana,
          candidatosMes,
        });

        // Candidatos recentes (últimos 5)
        setRecentCandidates(allCandidatos.slice(0, 5) as RecentCandidate[]);

        // Analistas recentes (últimos 5)
        setRecentAnalistas(allAnalistas.slice(0, 5) as RecentAnalista[]);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const mainStatCards = [
    {
      title: 'Total de Analistas',
      value: stats?.totalAnalistas || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: `${stats?.analistasAtivos || 0} ativos`,
    },
    {
      title: 'Licenças Distribuídas',
      value: stats?.totalLicencas || 0,
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      description: 'Total no sistema',
    },
    {
      title: 'Licenças Utilizadas',
      value: stats?.licencasUsadas || 0,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      description: `${stats?.totalLicencas ? Math.round((stats.licencasUsadas / stats.totalLicencas) * 100) : 0}% utilizado`,
    },
    {
      title: 'Total de Candidatos',
      value: stats?.totalCandidatos || 0,
      icon: ClipboardList,
      color: 'from-orange-500 to-orange-600',
      description: 'Avaliações realizadas',
    },
  ];

  const timeStatCards = [
    {
      title: 'Hoje',
      value: stats?.candidatosHoje || 0,
      icon: Calendar,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Testes hoje',
    },
    {
      title: 'Esta Semana',
      value: stats?.candidatosSemana || 0,
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600',
      description: 'Últimos 7 dias',
    },
    {
      title: 'Este Mês',
      value: stats?.candidatosMes || 0,
      icon: UserCheck,
      color: 'from-indigo-500 to-indigo-600',
      description: format(new Date(), 'MMMM', { locale: ptBR }),
    },
  ];

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      coach: 'Coach',
      psicologo: 'Psicólogo',
      empresa: 'Empresa',
      rh: 'RH',
      escola: 'Escola',
      outro: 'Outro',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Bem-vindo, {profile?.nome_completo || 'Gestor'}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStatCards.map((stat, index) => (
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

      {/* Time-based Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Testes Realizados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {timeStatCards.map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-slate-700" />
                    <Skeleton className="h-8 w-20 bg-slate-700" />
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
      </div>

      {/* Two columns: Recent Analysts and Recent Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analysts */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00D9FF]" />
              Analistas Recentes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Últimos analistas cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 bg-slate-700" />
                      <Skeleton className="h-3 w-24 bg-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentAnalistas.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="mt-4 text-slate-400">Nenhum analista cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalistas.map((analista) => (
                  <div
                    key={analista.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-white font-bold text-sm">
                      {analista.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{analista.nome}</p>
                      <p className="text-sm text-slate-400 truncate">{analista.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                        {getTipoLabel(analista.tipo)}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {analista.licencas_usadas}/{analista.licencas_total} lic.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-green-500" />
              Candidatos Recentes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Últimas avaliações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="mt-4 text-slate-400">Nenhum candidato cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                      {candidate.nome_completo.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{candidate.nome_completo}</p>
                      <p className="text-sm text-slate-400 truncate">{candidate.cargo_atual}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                        Completo
                      </span>
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
    </div>
  );
}
