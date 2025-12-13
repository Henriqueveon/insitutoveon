// =====================================================
// FINANCEIRO - Área de Recrutamento (Painel do Gestor)
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  Building2,
  Users,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transacao {
  id: string;
  created_at: string;
  tipo: string;
  descricao: string | null;
  valor: number;
  metodo_pagamento: string | null;
  status: string;
  empresa_id: string | null;
  candidato_id: string | null;
  empresas_recrutamento?: {
    razao_social: string;
  };
  candidatos_recrutamento?: {
    nome_completo: string;
  };
}

interface FinanceiroStats {
  receitaEmpresas: number;
  receitaCandidatos: number;
  totalGeral: number;
  transacoesPendentes: number;
}

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  aprovado: { label: 'Aprovado', color: 'bg-green-500/20 text-green-400' },
  pendente: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' },
  estornado: { label: 'Estornado', color: 'bg-slate-500/20 text-slate-400' },
};

const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  compra_creditos: { label: 'Empresa', color: 'text-blue-400' },
  aceite_proposta: { label: 'Candidato', color: 'text-green-400' },
};

const METODO_CONFIG: Record<string, { label: string; icon: any }> = {
  pix: { label: 'PIX', icon: Smartphone },
  cartao: { label: 'Cartão', icon: CreditCard },
  boleto: { label: 'Boleto', icon: DollarSign },
};

export default function Financeiro() {
  const { toast } = useToast();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [stats, setStats] = useState<FinanceiroStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Buscar estatísticas
  const fetchStats = async () => {
    try {
      // Receita de empresas (compra de créditos aprovada)
      const { data: transacoesEmpresas } = await supabase
        .from('transacoes_recrutamento')
        .select('valor')
        .eq('tipo', 'compra_creditos')
        .eq('status', 'aprovado');

      const receitaEmpresas = transacoesEmpresas?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;

      // Receita de candidatos (aceite de proposta aprovado)
      const { data: transacoesCandidatos } = await supabase
        .from('transacoes_recrutamento')
        .select('valor')
        .eq('tipo', 'aceite_proposta')
        .eq('status', 'aprovado');

      const receitaCandidatos = transacoesCandidatos?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;

      // Transações pendentes
      const { count: transacoesPendentes } = await supabase
        .from('transacoes_recrutamento')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente');

      setStats({
        receitaEmpresas,
        receitaCandidatos,
        totalGeral: receitaEmpresas + receitaCandidatos,
        transacoesPendentes: transacoesPendentes || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Buscar transações
  const fetchTransacoes = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('transacoes_recrutamento')
        .select(`
          *,
          empresas_recrutamento (razao_social),
          candidatos_recrutamento (nome_completo)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (tipoFilter !== 'todos') {
        query = query.eq('tipo', tipoFilter);
      }

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      // Paginação
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setTransacoes(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as transações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTransacoes();
  }, [currentPage, tipoFilter, statusFilter]);

  // Formatar valor
  const formatValor = (valor: number) => {
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Obter nome abreviado
  const getNomeAbreviado = (nomeCompleto: string | null) => {
    if (!nomeCompleto) return 'Anônimo';
    const partes = nomeCompleto.trim().split(' ');
    if (partes.length === 1) return partes[0];
    return `${partes[0]} ${partes[partes.length - 1].charAt(0)}.`;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Financeiro - Recrutamento</h1>
        <p className="text-slate-400 mt-1">
          Acompanhe as transações financeiras do módulo de recrutamento
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            {!stats ? (
              <Skeleton className="h-20 w-full bg-slate-700" />
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatValor(stats.receitaEmpresas)}
                  </p>
                  <p className="text-sm font-medium text-white mt-0.5">Receita Empresas</p>
                  <p className="text-xs text-slate-400">Compra de créditos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            {!stats ? (
              <Skeleton className="h-20 w-full bg-slate-700" />
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatValor(stats.receitaCandidatos)}
                  </p>
                  <p className="text-sm font-medium text-white mt-0.5">Receita Candidatos</p>
                  <p className="text-xs text-slate-400">Aceite de propostas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            {!stats ? (
              <Skeleton className="h-20 w-full bg-slate-700" />
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatValor(stats.totalGeral)}
                  </p>
                  <p className="text-sm font-medium text-white mt-0.5">Total Geral</p>
                  <p className="text-xs text-slate-400">Todas as receitas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            {!stats ? (
              <Skeleton className="h-20 w-full bg-slate-700" />
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats.transacoesPendentes}
                  </p>
                  <p className="text-sm font-medium text-white mt-0.5">Pendentes</p>
                  <p className="text-xs text-slate-400">Aguardando aprovação</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={tipoFilter}
              onValueChange={(value) => {
                setTipoFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="compra_creditos">Empresa (Créditos)</SelectItem>
                <SelectItem value="aceite_proposta">Candidato (Aceite)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="estornado">Estornado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Transações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Data/Hora</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Descrição</TableHead>
                  <TableHead className="text-slate-400">Valor</TableHead>
                  <TableHead className="text-slate-400">Método</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                      <TableCell colSpan={7}>
                        <Skeleton className="h-10 w-full bg-slate-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : transacoes.length === 0 ? (
                  <TableRow className="border-slate-700">
                    <TableCell colSpan={7} className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Nenhuma transação encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  transacoes.map((transacao) => {
                    const tipoConfig = TIPO_CONFIG[transacao.tipo] || { label: 'Outro', color: 'text-slate-400' };
                    const statusConfig = STATUS_CONFIG[transacao.status] || STATUS_CONFIG.pendente;
                    const metodoConfig = METODO_CONFIG[transacao.metodo_pagamento || 'pix'];
                    const MetodoIcon = metodoConfig?.icon || DollarSign;

                    const nome = transacao.tipo === 'compra_creditos'
                      ? transacao.empresas_recrutamento?.razao_social
                      : getNomeAbreviado(transacao.candidatos_recrutamento?.nome_completo || null);

                    return (
                      <TableRow key={transacao.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-slate-300 whitespace-nowrap">
                          {format(new Date(transacao.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${tipoConfig.color}`}>
                            {tipoConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-white font-medium max-w-[150px] truncate">
                          {nome || '-'}
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-[200px] truncate">
                          {transacao.descricao || '-'}
                        </TableCell>
                        <TableCell className="text-white font-medium whitespace-nowrap">
                          {formatValor(transacao.valor)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <MetodoIcon className="w-4 h-4 text-slate-500" />
                            <span>{metodoConfig?.label || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-600 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-600 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
