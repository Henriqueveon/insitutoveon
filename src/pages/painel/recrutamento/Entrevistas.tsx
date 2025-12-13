// =====================================================
// ENTREVISTAS - Área de Recrutamento (Painel do Gestor)
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Briefcase,
  Check,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Solicitacao {
  id: string;
  created_at: string;
  empresa_id: string;
  candidato_id: string;
  vaga_id: string;
  status: string;
  match_percentual: number | null;
  empresa_pagou: boolean;
  candidato_pagou: boolean;
  motivo_recusa: string | null;
  empresas_recrutamento?: {
    razao_social: string;
  };
  candidatos_recrutamento?: {
    nome_completo: string;
  };
  vagas_recrutamento?: {
    titulo: string;
  };
}

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  aguardando_candidato: { label: 'Aguardando', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  aceita: { label: 'Aceita', color: 'bg-green-500/20 text-green-400', icon: Check },
  recusada: { label: 'Recusada', color: 'bg-red-500/20 text-red-400', icon: X },
  expirada: { label: 'Expirada', color: 'bg-slate-500/20 text-slate-400', icon: AlertCircle },
  em_processo: { label: 'Em processo', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  contratado: { label: 'Contratado', color: 'bg-emerald-500/20 text-emerald-400', icon: Check },
};

export default function Entrevistas() {
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('todas');
  const [counts, setCounts] = useState({
    todas: 0,
    aguardando_candidato: 0,
    aceita: 0,
    recusada: 0,
  });

  // Buscar contagens
  const fetchCounts = async () => {
    const { count: todas } = await supabase
      .from('solicitacoes_entrevista')
      .select('*', { count: 'exact', head: true });

    const { count: aguardando } = await supabase
      .from('solicitacoes_entrevista')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aguardando_candidato');

    const { count: aceitas } = await supabase
      .from('solicitacoes_entrevista')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aceita');

    const { count: recusadas } = await supabase
      .from('solicitacoes_entrevista')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'recusada');

    setCounts({
      todas: todas || 0,
      aguardando_candidato: aguardando || 0,
      aceita: aceitas || 0,
      recusada: recusadas || 0,
    });
  };

  // Buscar solicitações
  const fetchSolicitacoes = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('solicitacoes_entrevista')
        .select(`
          *,
          empresas_recrutamento (razao_social),
          candidatos_recrutamento (nome_completo),
          vagas_recrutamento (titulo)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Filtrar por status
      if (activeTab !== 'todas') {
        query = query.eq('status', activeTab);
      }

      // Paginação
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setSolicitacoes(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as solicitações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchSolicitacoes();
  }, [activeTab]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [currentPage]);

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
        <h1 className="text-2xl font-bold text-white">Solicitações de Entrevista</h1>
        <p className="text-slate-400 mt-1">
          Acompanhe todas as solicitações de entrevista
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger
            value="todas"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            Todas ({counts.todas})
          </TabsTrigger>
          <TabsTrigger
            value="aguardando_candidato"
            className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
          >
            Aguardando ({counts.aguardando_candidato})
          </TabsTrigger>
          <TabsTrigger
            value="aceita"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            Aceitas ({counts.aceita})
          </TabsTrigger>
          <TabsTrigger
            value="recusada"
            className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
          >
            Recusadas ({counts.recusada})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* Tabela */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-400">Data</TableHead>
                      <TableHead className="text-slate-400">Empresa</TableHead>
                      <TableHead className="text-slate-400">Candidato</TableHead>
                      <TableHead className="text-slate-400">Vaga</TableHead>
                      <TableHead className="text-slate-400">Match %</TableHead>
                      <TableHead className="text-slate-400 text-center">Empresa pagou?</TableHead>
                      <TableHead className="text-slate-400 text-center">Candidato pagou?</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Motivo recusa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-slate-700">
                          <TableCell colSpan={9}>
                            <Skeleton className="h-10 w-full bg-slate-700" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : solicitacoes.length === 0 ? (
                      <TableRow className="border-slate-700">
                        <TableCell colSpan={9} className="text-center py-8">
                          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">Nenhuma solicitação encontrada</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      solicitacoes.map((sol) => {
                        const statusConfig = STATUS_CONFIG[sol.status] || STATUS_CONFIG.aguardando_candidato;
                        const StatusIcon = statusConfig.icon;

                        return (
                          <TableRow key={sol.id} className="border-slate-700 hover:bg-slate-700/30">
                            <TableCell className="text-slate-300 whitespace-nowrap">
                              {format(new Date(sol.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-slate-300 max-w-[150px] truncate">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span className="truncate">
                                  {sol.empresas_recrutamento?.razao_social || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span>
                                  {getNomeAbreviado(sol.candidatos_recrutamento?.nome_completo || null)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300 max-w-[150px] truncate">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span className="truncate">
                                  {sol.vagas_recrutamento?.titulo || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {sol.match_percentual !== null ? (
                                <Badge
                                  className={
                                    sol.match_percentual >= 80
                                      ? 'bg-green-500/20 text-green-400'
                                      : sol.match_percentual >= 60
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-slate-500/20 text-slate-400'
                                  }
                                >
                                  {sol.match_percentual}%
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {sol.empresa_pagou ? (
                                <Check className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-red-400 mx-auto" />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {sol.candidato_pagou ? (
                                <Check className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-red-400 mx-auto" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-400 max-w-[150px] truncate">
                              {sol.motivo_recusa || '-'}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
