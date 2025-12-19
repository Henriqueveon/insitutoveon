import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SolicitacaoExclusao {
  id: string;
  usuario_id: string;
  usuario_tipo: string;
  usuario_email: string;
  usuario_nome: string;
  motivo: string;
  motivo_texto: string;
  comentario_adicional: string | null;
  data_solicitacao: string;
  data_exclusao_prevista: string;
  status: string;
  data_reativacao: string | null;
  data_exclusao_efetiva: string | null;
}

interface Estatisticas {
  total_pendentes: number;
  total_reativadas: number;
  total_excluidas: number;
  exclusoes_proximos_7_dias: number;
  percentual_reativacao: number;
}

const MOTIVOS_LABELS: Record<string, string> = {
  encontrei_emprego_candidato: 'Encontrei emprego/Consegui contratar',
  nao_gostei_plataforma: 'Não gostei da plataforma',
  plataforma_nao_atende: 'A plataforma não atende minhas necessidades',
  nao_sei_usar: 'Não sei usar a plataforma',
  entrei_conhecer: 'Entrei apenas para conhecer',
  nao_informar: 'Prefiro não informar',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  reativada: { bg: 'bg-green-100', text: 'text-green-800' },
  excluida: { bg: 'bg-red-100', text: 'text-red-800' },
  cancelada: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const TIPO_LABELS: Record<string, string> = {
  candidato: 'Candidato',
  empresa: 'Empresa',
  analista: 'Analista',
};

export default function Exclusoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoExclusao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMotivo, setFiltroMotivo] = useState<string>('todos');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar solicitações via view
      const { data: monitoramento, error: monitoramentoError } = await supabase
        .from('vw_monitoramento_exclusoes')
        .select('*')
        .order('data_solicitacao', { ascending: false });

      if (monitoramentoError) {
        console.error('Erro ao carregar monitoramento:', monitoramentoError);
      } else {
        setSolicitacoes(monitoramento || []);
      }

      // Carregar estatísticas via view
      const { data: stats, error: statsError } = await supabase
        .from('vw_estatisticas_exclusoes')
        .select('*')
        .single();

      if (statsError) {
        console.error('Erro ao carregar estatísticas:', statsError);
      } else {
        setEstatisticas(stats);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  const solicitacoesFiltradas = solicitacoes.filter((s) => {
    if (filtroStatus !== 'todos' && s.status !== filtroStatus) return false;
    if (filtroTipo !== 'todos' && s.usuario_tipo !== filtroTipo) return false;
    if (filtroMotivo !== 'todos' && s.motivo !== filtroMotivo) return false;
    return true;
  });

  const calcularDiasRestantes = (dataExclusao: string) => {
    const hoje = new Date();
    const exclusao = new Date(dataExclusao);
    const diff = exclusao.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monitoramento de Exclusões</h1>
        <p className="text-gray-600">Acompanhe as solicitações de exclusão de contas</p>
      </div>

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{estatisticas.total_pendentes}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Reativadas</p>
            <p className="text-2xl font-bold text-green-600">{estatisticas.total_reativadas}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Excluídas</p>
            <p className="text-2xl font-bold text-red-600">{estatisticas.total_excluidas}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-500">
            <p className="text-sm text-gray-500">Próximos 7 dias</p>
            <p className="text-2xl font-bold text-orange-600">{estatisticas.exclusoes_proximos_7_dias}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Taxa de Reativação</p>
            <p className="text-2xl font-bold text-blue-600">
              {estatisticas.percentual_reativacao?.toFixed(1) || 0}%
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="reativada">Reativada</option>
              <option value="excluida">Excluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="candidato">Candidato</option>
              <option value="empresa">Empresa</option>
              <option value="analista">Analista</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <select
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              {Object.entries(MOTIVOS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={carregarDados}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Solicitação</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dias Restantes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma solicitação encontrada
                  </td>
                </tr>
              ) : (
                solicitacoesFiltradas.map((solicitacao) => {
                  const diasRestantes = calcularDiasRestantes(solicitacao.data_exclusao_prevista);
                  const statusColors = STATUS_COLORS[solicitacao.status] || STATUS_COLORS.pendente;

                  return (
                    <tr key={solicitacao.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{solicitacao.usuario_nome}</p>
                          <p className="text-sm text-gray-500">{solicitacao.usuario_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {TIPO_LABELS[solicitacao.usuario_tipo] || solicitacao.usuario_tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {MOTIVOS_LABELS[solicitacao.motivo] || solicitacao.motivo}
                          </p>
                          {solicitacao.comentario_adicional && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{solicitacao.comentario_adicional}"
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {format(new Date(solicitacao.data_solicitacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(solicitacao.data_solicitacao), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {solicitacao.status === 'pendente' ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              diasRestantes <= 7
                                ? 'bg-red-100 text-red-800'
                                : diasRestantes <= 14
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {diasRestantes} dias
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                        >
                          {solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1)}
                        </span>
                        {solicitacao.data_reativacao && (
                          <p className="text-xs text-gray-400 mt-1">
                            Reativada em {format(new Date(solicitacao.data_reativacao), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-4 text-sm text-gray-500">
        Exibindo {solicitacoesFiltradas.length} de {solicitacoes.length} solicitações
      </div>
    </div>
  );
}
