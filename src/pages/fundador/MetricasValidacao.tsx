import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3,
  Download,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Eye,
  Brain,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

interface MetricasEstatisticas {
  total_testes: number;
  testes_alta: number;
  testes_media: number;
  testes_baixa: number;
  testes_suspeita: number;
  score_medio: number;
  tempo_medio_segundos: number;
  tempo_medio_por_questao_ms: number;
  falhas_atencao: number;
  falhas_desejabilidade: number;
  falhas_consistencia: number;
  falhas_tempo: number;
  versao_teste: string;
}

interface MetricaDetalhada {
  id: string;
  candidato_id: string;
  confiabilidade_score: number;
  confiabilidade_nivel: string;
  tempo_total_segundos: number;
  ctrl_atencao_passou: boolean;
  ctrl_desejabilidade_passou: boolean;
  ctrl_consistencia_passou: boolean;
  ctrl_tempo_passou: boolean;
  flags_detectadas: string[];
  created_at: string;
  candidatos_disc?: {
    nome_completo: string;
    email: string;
  };
}

export default function MetricasValidacao() {
  const [estatisticas, setEstatisticas] = useState<MetricasEstatisticas | null>(null);
  const [metricas, setMetricas] = useState<MetricaDetalhada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch aggregated statistics
      const { data: statsData, error: statsError } = await supabase
        .from('estatisticas_validacao')
        .select('*')
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching stats:', statsError);
      }

      // Fetch detailed metrics with candidate info
      const { data: metricasData, error: metricasError } = await supabase
        .from('metricas_teste')
        .select(`
          *,
          candidatos_disc (
            nome_completo,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (metricasError) {
        console.error('Error fetching metrics:', metricasError);
      }

      // If view doesn't exist yet, calculate stats manually
      if (!statsData && metricasData) {
        const manual: MetricasEstatisticas = {
          total_testes: metricasData.length,
          testes_alta: metricasData.filter(m => m.confiabilidade_nivel === 'ALTA').length,
          testes_media: metricasData.filter(m => m.confiabilidade_nivel === 'MEDIA').length,
          testes_baixa: metricasData.filter(m => m.confiabilidade_nivel === 'BAIXA').length,
          testes_suspeita: metricasData.filter(m => m.confiabilidade_nivel === 'SUSPEITA').length,
          score_medio: metricasData.length > 0
            ? Math.round(metricasData.reduce((sum, m) => sum + (m.confiabilidade_score || 0), 0) / metricasData.length)
            : 0,
          tempo_medio_segundos: metricasData.length > 0
            ? Math.round(metricasData.reduce((sum, m) => sum + (m.tempo_total_segundos || 0), 0) / metricasData.length)
            : 0,
          tempo_medio_por_questao_ms: metricasData.length > 0
            ? Math.round(metricasData.reduce((sum, m) => sum + (m.tempo_medio_ms || 0), 0) / metricasData.length)
            : 0,
          falhas_atencao: metricasData.filter(m => !m.ctrl_atencao_passou).length,
          falhas_desejabilidade: metricasData.filter(m => !m.ctrl_desejabilidade_passou).length,
          falhas_consistencia: metricasData.filter(m => !m.ctrl_consistencia_passou).length,
          falhas_tempo: metricasData.filter(m => !m.ctrl_tempo_passou).length,
          versao_teste: '2.0',
        };
        setEstatisticas(manual);
      } else {
        setEstatisticas(statsData);
      }

      setMetricas(metricasData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all metrics with full data for export
      const { data, error } = await supabase
        .from('metricas_teste')
        .select(`
          *,
          candidatos_disc (
            nome_completo,
            email,
            cargo_atual,
            perfil_tipo,
            perfil_natural,
            perfil_adaptado
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      // Build CSV content
      const headers = [
        'ID',
        'Nome',
        'Email',
        'Cargo',
        'Perfil DISC',
        'D Score',
        'I Score',
        'S Score',
        'C Score',
        'Confiabilidade Score',
        'Confiabilidade Nivel',
        'Tempo Total (seg)',
        'Tempo Medio (ms)',
        'Atencao OK',
        'Desejabilidade OK',
        'Consistencia OK',
        'Tempo OK',
        'Perfil Flat',
        'Padrao Contraditorio',
        'Tempo Rapido',
        'Tempo Lento',
        'Flags',
        'Versao',
        'Data',
      ];

      const rows = data.map(m => {
        const candidate = m.candidatos_disc;
        const perfil = m.scores_disc_brutos as { D?: number; I?: number; S?: number; C?: number } | null;
        return [
          m.id,
          candidate?.nome_completo || '',
          candidate?.email || '',
          candidate?.cargo_atual || '',
          candidate?.perfil_tipo || '',
          perfil?.D || '',
          perfil?.I || '',
          perfil?.S || '',
          perfil?.C || '',
          m.confiabilidade_score,
          m.confiabilidade_nivel,
          m.tempo_total_segundos,
          m.tempo_medio_ms,
          m.ctrl_atencao_passou ? 'Sim' : 'Nao',
          m.ctrl_desejabilidade_passou ? 'Sim' : 'Nao',
          m.ctrl_consistencia_passou ? 'Sim' : 'Nao',
          m.ctrl_tempo_passou ? 'Sim' : 'Nao',
          m.padrao_flat_profile ? 'Sim' : 'Nao',
          m.padrao_contraditorio ? 'Sim' : 'Nao',
          m.padrao_tempo_rapido ? 'Sim' : 'Nao',
          m.padrao_tempo_lento ? 'Sim' : 'Nao',
          (m.flags_detectadas || []).join('; '),
          m.versao_teste,
          new Date(m.created_at).toLocaleString('pt-BR'),
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell =>
          typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
        ).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `veon_disc_validacao_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}seg`;
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = estatisticas || {
    total_testes: 0,
    testes_alta: 0,
    testes_media: 0,
    testes_baixa: 0,
    testes_suspeita: 0,
    score_medio: 0,
    tempo_medio_segundos: 0,
    tempo_medio_por_questao_ms: 0,
    falhas_atencao: 0,
    falhas_desejabilidade: 0,
    falhas_consistencia: 0,
    falhas_tempo: 0,
    versao_teste: '2.0',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#00D9FF]" />
            Metricas de Validacao
          </h1>
          <p className="text-slate-400 mt-1">
            Monitoramento da qualidade e confiabilidade dos testes DISC
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          <Button
            onClick={exportToCSV}
            disabled={isExporting || stats.total_testes === 0}
            className="gap-2 bg-[#00D9FF] hover:bg-[#00B8D9] text-slate-900"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total de Testes</p>
                <p className="text-3xl font-bold text-white">{stats.total_testes}</p>
              </div>
              <Users className="w-10 h-10 text-[#00D9FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Score Medio</p>
                <p className="text-3xl font-bold text-white">{stats.score_medio}/100</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tempo Medio</p>
                <p className="text-3xl font-bold text-white">{formatTime(stats.tempo_medio_segundos)}</p>
              </div>
              <Timer className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Testes Validos</p>
                <p className="text-3xl font-bold text-green-500">
                  {getPercentage(stats.testes_alta, stats.total_testes)}%
                </p>
              </div>
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reliability Distribution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00D9FF]" />
            Distribuicao de Confiabilidade
          </CardTitle>
          <CardDescription className="text-slate-400">
            Classificacao dos testes por nivel de confiabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ALTA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-white font-medium">ALTA</span>
              </div>
              <span className="text-slate-400">
                {stats.testes_alta} ({getPercentage(stats.testes_alta, stats.total_testes)}%)
              </span>
            </div>
            <Progress
              value={getPercentage(stats.testes_alta, stats.total_testes)}
              className="h-3 bg-slate-700"
            />
          </div>

          {/* MEDIA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-medium">MEDIA</span>
              </div>
              <span className="text-slate-400">
                {stats.testes_media} ({getPercentage(stats.testes_media, stats.total_testes)}%)
              </span>
            </div>
            <Progress
              value={getPercentage(stats.testes_media, stats.total_testes)}
              className="h-3 bg-slate-700"
            />
          </div>

          {/* BAIXA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                <span className="text-white font-medium">BAIXA</span>
              </div>
              <span className="text-slate-400">
                {stats.testes_baixa} ({getPercentage(stats.testes_baixa, stats.total_testes)}%)
              </span>
            </div>
            <Progress
              value={getPercentage(stats.testes_baixa, stats.total_testes)}
              className="h-3 bg-slate-700"
            />
          </div>

          {/* SUSPEITA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldX className="w-5 h-5 text-red-500" />
                <span className="text-white font-medium">SUSPEITA</span>
              </div>
              <span className="text-slate-400">
                {stats.testes_suspeita} ({getPercentage(stats.testes_suspeita, stats.total_testes)}%)
              </span>
            </div>
            <Progress
              value={getPercentage(stats.testes_suspeita, stats.total_testes)}
              className="h-3 bg-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Control Items Results */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00D9FF]" />
            Resultados dos Controles de Qualidade
          </CardTitle>
          <CardDescription className="text-slate-400">
            Taxa de sucesso em cada tipo de controle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Attention */}
            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Atencao</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-300">
                  {stats.total_testes - stats.falhas_atencao} aprovados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-slate-300">
                  {stats.falhas_atencao} falhas
                </span>
              </div>
            </div>

            {/* Social Desirability */}
            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">Desejabilidade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-300">
                  {stats.total_testes - stats.falhas_desejabilidade} aprovados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-slate-300">
                  {stats.falhas_desejabilidade} falhas
                </span>
              </div>
            </div>

            {/* Consistency */}
            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Consistencia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-300">
                  {stats.total_testes - stats.falhas_consistencia} aprovados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-slate-300">
                  {stats.falhas_consistencia} falhas
                </span>
              </div>
            </div>

            {/* Timing */}
            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-medium">Tempo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-300">
                  {stats.total_testes - stats.falhas_tempo} aprovados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-slate-300">
                  {stats.falhas_tempo} falhas
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tests Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Testes Recentes</CardTitle>
          <CardDescription className="text-slate-400">
            Ultimos 100 testes realizados com metricas de validacao
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Candidato</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Score</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Nivel</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Tempo</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Controles</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {metricas.slice(0, 20).map((m) => (
                  <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">
                          {m.candidatos_disc?.nome_completo || 'N/A'}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {m.candidatos_disc?.email || ''}
                        </p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${
                        m.confiabilidade_score >= 85 ? 'text-green-500' :
                        m.confiabilidade_score >= 70 ? 'text-yellow-500' :
                        m.confiabilidade_score >= 50 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {m.confiabilidade_score}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        m.confiabilidade_nivel === 'ALTA' ? 'bg-green-500/20 text-green-400' :
                        m.confiabilidade_nivel === 'MEDIA' ? 'bg-yellow-500/20 text-yellow-400' :
                        m.confiabilidade_nivel === 'BAIXA' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {m.confiabilidade_nivel}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-300">
                      {m.tempo_total_segundos ? formatTime(m.tempo_total_segundos) : 'N/A'}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {m.ctrl_atencao_passou ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {m.ctrl_desejabilidade_passou ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {m.ctrl_consistencia_passou ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {m.ctrl_tempo_passou ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-400 text-xs">
                      {new Date(m.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {metricas.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Nenhuma metrica registrada ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
