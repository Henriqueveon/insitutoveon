// =====================================================
// VAGAS - Área de Recrutamento (Painel do Gestor)
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Briefcase,
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  MapPin,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Vaga {
  id: string;
  created_at: string;
  empresa_id: string;
  titulo: string;
  cidade: string | null;
  estado: string | null;
  faixa_salarial_min: number | null;
  faixa_salarial_max: number | null;
  regime: string | null;
  perfil_disc_ideal: string | null;
  status: string;
  empresas_recrutamento?: {
    razao_social: string;
  };
}

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ativa: { label: 'Ativa', color: 'bg-green-500/20 text-green-400' },
  pausada: { label: 'Pausada', color: 'bg-yellow-500/20 text-yellow-400' },
  encerrada: { label: 'Encerrada', color: 'bg-slate-500/20 text-slate-400' },
  preenchida: { label: 'Preenchida', color: 'bg-blue-500/20 text-blue-400' },
};

const DISC_CONFIG: Record<string, { color: string }> = {
  D: { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  I: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  S: { color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  C: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export default function Vagas() {
  const { toast } = useToast();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatosCount, setCandidatosCount] = useState<Record<string, number>>({});

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [regimeFilter, setRegimeFilter] = useState('todos');

  // Buscar vagas
  const fetchVagas = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('vagas_recrutamento')
        .select(`
          *,
          empresas_recrutamento (razao_social)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('titulo', `%${searchTerm}%`);
      }

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      if (regimeFilter !== 'todos') {
        query = query.eq('regime', regimeFilter);
      }

      // Paginação
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setVagas(data || []);
      setTotalCount(count || 0);

      // Buscar contagem de candidatos compatíveis para cada vaga (por cidade/estado)
      if (data && data.length > 0) {
        const counts: Record<string, number> = {};
        for (const vaga of data) {
          let query = supabase
            .from('candidatos_recrutamento')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'disponivel')
            .eq('cadastro_completo', true);

          // Filtrar por estado se a vaga tem estado definido
          if (vaga.estado) {
            query = query.eq('estado', vaga.estado);
          }

          // Filtrar também por cidade se definida
          if (vaga.cidade) {
            query = query.eq('cidade', vaga.cidade);
          }

          const { count: candidatosCompativeis } = await query;
          counts[vaga.id] = candidatosCompativeis || 0;
        }
        setCandidatosCount(counts);
      }
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as vagas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVagas();
  }, [currentPage, searchTerm, statusFilter, regimeFilter]);

  // Formatar salário
  const formatSalario = (min: number | null, max: number | null) => {
    if (!min && !max) return '-';
    const formatValue = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;
    if (min && max) return `${formatValue(min)} - ${formatValue(max)}`;
    if (min) return `A partir de ${formatValue(min)}`;
    if (max) return `Até ${formatValue(max)}`;
    return '-';
  };

  // Renderizar badges DISC
  const renderDiscBadges = (perfil: string | null) => {
    if (!perfil) return '-';

    return (
      <div className="flex gap-1">
        {perfil.split('').map((letra, idx) => {
          const config = DISC_CONFIG[letra.toUpperCase()];
          if (!config) return null;
          return (
            <Badge
              key={idx}
              variant="outline"
              className={`${config.color} text-xs`}
            >
              {letra.toUpperCase()}
            </Badge>
          );
        })}
      </div>
    );
  };

  // Excluir vaga
  const excluirVaga = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;

    try {
      const { error } = await supabase
        .from('vagas_recrutamento')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Vaga excluída',
        description: 'A vaga foi excluída com sucesso.',
      });

      fetchVagas();
    } catch (error) {
      console.error('Erro ao excluir vaga:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a vaga.',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Vagas Cadastradas</h1>
        <p className="text-slate-400 mt-1">
          {totalCount} vagas cadastradas
        </p>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por título da vaga..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

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
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
                <SelectItem value="encerrada">Encerrada</SelectItem>
                <SelectItem value="preenchida">Preenchida</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={regimeFilter}
              onValueChange={(value) => {
                setRegimeFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Regime" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="todos">Todos os regimes</SelectItem>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="Estágio">Estágio</SelectItem>
                <SelectItem value="Temporário">Temporário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Data criação</TableHead>
                  <TableHead className="text-slate-400">Empresa</TableHead>
                  <TableHead className="text-slate-400">Título da vaga</TableHead>
                  <TableHead className="text-slate-400">Cidade/UF</TableHead>
                  <TableHead className="text-slate-400">Faixa salarial</TableHead>
                  <TableHead className="text-slate-400">Regime</TableHead>
                  <TableHead className="text-slate-400">Perfil DISC</TableHead>
                  <TableHead className="text-slate-400">Candidatos</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                      <TableCell colSpan={10}>
                        <Skeleton className="h-10 w-full bg-slate-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : vagas.length === 0 ? (
                  <TableRow className="border-slate-700">
                    <TableCell colSpan={10} className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Nenhuma vaga encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  vagas.map((vaga) => {
                    const statusConfig = STATUS_CONFIG[vaga.status] || STATUS_CONFIG.ativa;
                    return (
                      <TableRow key={vaga.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-slate-300 whitespace-nowrap">
                          {format(new Date(vaga.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-[150px] truncate">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="truncate">
                              {vaga.empresas_recrutamento?.razao_social || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium max-w-[200px] truncate">
                          {vaga.titulo}
                        </TableCell>
                        <TableCell className="text-slate-300 whitespace-nowrap">
                          {vaga.cidade && vaga.estado ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {vaga.cidade}/{vaga.estado}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-slate-300 whitespace-nowrap">
                          {formatSalario(vaga.faixa_salarial_min, vaga.faixa_salarial_max)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {vaga.regime || '-'}
                        </TableCell>
                        <TableCell>
                          {renderDiscBadges(vaga.perfil_disc_ideal)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-white font-medium">
                              {candidatosCount[vaga.id] || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                              title="Ver detalhes"
                              onClick={() => {
                                toast({
                                  title: vaga.titulo,
                                  description: `${vaga.cidade || '-'}/${vaga.estado || '-'} | ${vaga.regime || '-'} | ${formatSalario(vaga.faixa_salarial_min, vaga.faixa_salarial_max)}`,
                                });
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Excluir"
                              onClick={() => excluirVaga(vaga.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
