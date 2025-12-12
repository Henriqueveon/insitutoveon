import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search,
  Download,
  RefreshCw,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidato {
  id: string;
  nome_completo: string;
  telefone_whatsapp: string;
  cargo_atual: string;
  empresa_instagram: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const CARGO_OPTIONS = [
  { value: 'todos', label: 'Todos os cargos' },
  { value: 'Sócio/Empresário', label: 'Sócio/Empresário' },
  { value: 'Executivo/C-level', label: 'Executivo/C-level' },
  { value: 'Gerente Comercial', label: 'Gerente Comercial' },
  { value: 'Consultor/Vendedor', label: 'Consultor/Vendedor' },
  { value: 'Auxiliar de Escritório', label: 'Auxiliar de Escritório' },
  { value: 'SDR', label: 'SDR' },
  { value: 'Closer', label: 'Closer' },
];

export default function PainelCandidatos() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCandidatos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidatos_disc')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidatos((data as Candidato[]) || []);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      toast.error('Não foi possível carregar os candidatos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatos();
  }, []);

  // Filtrar candidatos
  const filteredCandidatos = useMemo(() => {
    let result = candidatos;

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.nome_completo.toLowerCase().includes(term) ||
          c.telefone_whatsapp.includes(term) ||
          c.empresa_instagram.toLowerCase().includes(term) ||
          c.cargo_atual.toLowerCase().includes(term)
      );
    }

    // Filtro de cargo
    if (cargoFilter !== 'todos') {
      result = result.filter((c) => c.cargo_atual === cargoFilter);
    }

    return result;
  }, [candidatos, searchTerm, cargoFilter]);

  // Paginação
  const totalPages = Math.ceil(filteredCandidatos.length / ITEMS_PER_PAGE);
  const paginatedCandidatos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCandidatos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCandidatos, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cargoFilter]);

  const exportToCSV = () => {
    const headers = [
      'Nome',
      'Telefone',
      'Cargo',
      'Empresa (Instagram)',
      'Data',
    ];
    const rows = filteredCandidatos.map((c) => [
      c.nome_completo,
      c.telefone_whatsapp,
      c.cargo_atual,
      c.empresa_instagram,
      format(new Date(c.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    ]);

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidatos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success(`${filteredCandidatos.length} registros exportados.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Candidatos</h1>
          <p className="text-slate-400 mt-1">
            Gerencie os candidatos que realizaram a avaliação DISC
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCandidatos}
            disabled={isLoading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={exportToCSV}
            disabled={filteredCandidatos.length === 0}
            className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC] hover:from-[#00C4E6] hover:to-[#0088B3]"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#00D9FF]" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar por nome, telefone ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={cargoFilter} onValueChange={setCargoFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {CARGO_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
            <span>{filteredCandidatos.length} candidato(s) encontrado(s)</span>
            {(searchTerm || cargoFilter !== 'todos') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCargoFilter('todos');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Telefone</TableHead>
                  <TableHead className="text-slate-400">Cargo</TableHead>
                  <TableHead className="text-slate-400">Empresa</TableHead>
                  <TableHead className="text-slate-400">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                      <TableCell>
                        <Skeleton className="h-5 w-40 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 bg-slate-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedCandidatos.length === 0 ? (
                  <TableRow className="border-slate-700">
                    <TableCell colSpan={5} className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="mt-4 text-slate-400">Nenhum candidato encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCandidatos.map((candidato) => (
                    <TableRow
                      key={candidato.id}
                      className="border-slate-700 hover:bg-slate-700/30"
                    >
                      <TableCell>
                        <p className="font-medium text-white">{candidato.nome_completo}</p>
                      </TableCell>
                      <TableCell className="text-slate-300">{candidato.telefone_whatsapp}</TableCell>
                      <TableCell className="text-slate-300">{candidato.cargo_atual}</TableCell>
                      <TableCell className="text-slate-300">{candidato.empresa_instagram}</TableCell>
                      <TableCell className="text-slate-400">
                        {format(new Date(candidato.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
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
