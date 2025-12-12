import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Download,
  RefreshCw,
  Users,
  Filter,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidato {
  id: string;
  nome_completo: string;
  email: string | null;
  telefone_whatsapp: string;
  cargo_atual: string;
  empresa_instagram: string;
  perfil_natural: Record<string, number> | null;
  perfil_adaptado: Record<string, number> | null;
  perfil_tipo: string | null;
  pdf_url: string | null;
  status: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'reprovado', label: 'Reprovado' },
];

// Cores DISC conforme especificação VEON
const DISC_COLORS: Record<string, { bg: string; text: string }> = {
  D: { bg: 'bg-[#E31E24]', text: 'text-white' },      // Vermelho VEON
  I: { bg: 'bg-[#FFD700]', text: 'text-slate-800' },  // Amarelo
  S: { bg: 'bg-[#28A745]', text: 'text-white' },      // Verde
  C: { bg: 'bg-[#003DA5]', text: 'text-white' },      // Azul VEON
};

export default function PainelCandidatos() {
  const { empresa } = useAuth();
  const { toast } = useToast();

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchCandidatos = async () => {
    if (!empresa) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidatos_disc')
        .select('*')
        .or(`empresa_id.eq.${empresa.id},empresa_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidatos((data as Candidato[]) || []);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os candidatos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatos();
  }, [empresa]);

  // Função para copiar texto para área de transferência
  const copiarTexto = async (texto: string, tipo: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      sonnerToast.success(`${tipo} copiado!`);
    } catch (err) {
      sonnerToast.error('Erro ao copiar');
    }
  };

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
          c.email?.toLowerCase().includes(term) ||
          c.cargo_atual.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (statusFilter !== 'todos') {
      result = result.filter((c) => {
        if (statusFilter === 'pendente') {
          return !c.perfil_tipo;
        }
        return c.status === statusFilter;
      });
    }

    return result;
  }, [candidatos, searchTerm, statusFilter]);

  // Paginação
  const totalPages = Math.ceil(filteredCandidatos.length / ITEMS_PER_PAGE);
  const paginatedCandidatos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCandidatos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCandidatos, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const updateStatus = async (candidatoId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('candidatos_disc')
        .update({ status: newStatus })
        .eq('id', candidatoId);

      if (error) throw error;

      setCandidatos((prev) =>
        prev.map((c) => (c.id === candidatoId ? { ...c, status: newStatus } : c))
      );

      if (selectedCandidato?.id === candidatoId) {
        setSelectedCandidato((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast({
        title: 'Status atualizado',
        description: 'O status do candidato foi atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Nome',
      'E-mail',
      'Telefone',
      'Cargo',
      'Empresa',
      'Perfil DISC',
      'Status',
      'Data',
    ];
    const rows = filteredCandidatos.map((c) => [
      c.nome_completo,
      c.email || '',
      c.telefone_whatsapp,
      c.cargo_atual,
      c.empresa_instagram,
      c.perfil_tipo || 'Pendente',
      c.status,
      format(new Date(c.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    ]);

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidatos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: 'Exportação concluída',
      description: `${filteredCandidatos.length} registros exportados.`,
    });
  };

  const getStatusBadge = (status: string, perfilTipo: string | null) => {
    if (!perfilTipo) {
      return (
        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10">
          Pendente
        </Badge>
      );
    }
    switch (status) {
      case 'aprovado':
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
            Aprovado
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
            Reprovado
          </Badge>
        );
      case 'em_analise':
        return (
          <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">
            Em análise
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
            Completo
          </Badge>
        );
    }
  };

  const renderDISCProfile = (perfilTipo: string | null) => {
    if (!perfilTipo) {
      return <span className="text-slate-500">-</span>;
    }

    return (
      <div className="flex items-center gap-1">
        {/* Bolinhas coloridas */}
        <div className="flex -space-x-1">
          {perfilTipo.split('').map((letter, index) => {
            const colors = DISC_COLORS[letter] || { bg: 'bg-slate-500', text: 'text-white' };
            return (
              <span
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${colors.bg} ${colors.text}`}
                style={{ zIndex: perfilTipo.length - index }}
              >
                {letter}
              </span>
            );
          })}
        </div>
        {/* Texto do perfil */}
        <span className="text-slate-300 font-medium ml-1">{perfilTipo}</span>
      </div>
    );
  };

  const openDetail = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsDetailOpen(true);
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
                placeholder="Buscar por nome, e-mail, telefone ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {STATUS_OPTIONS.map((option) => (
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
            {(searchTerm || statusFilter !== 'todos') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
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
                  <TableHead className="text-slate-400">Data/Hora</TableHead>
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Telefone</TableHead>
                  <TableHead className="text-slate-400">Cargo</TableHead>
                  <TableHead className="text-slate-400">Instagram</TableHead>
                  <TableHead className="text-slate-400 text-center">PDF</TableHead>
                  <TableHead className="text-slate-400">Perfil DISC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                      <TableCell>
                        <Skeleton className="h-5 w-28 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28 bg-slate-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 bg-slate-700 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 bg-slate-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedCandidatos.length === 0 ? (
                  <TableRow className="border-slate-700">
                    <TableCell colSpan={7} className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="mt-4 text-slate-400">Nenhum candidato encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCandidatos.map((candidato) => (
                    <TableRow
                      key={candidato.id}
                      className="border-slate-700 hover:bg-slate-700/30 cursor-pointer"
                      onClick={() => openDetail(candidato)}
                    >
                      {/* Data/Hora */}
                      <TableCell className="text-slate-400 whitespace-nowrap">
                        {format(new Date(candidato.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>

                      {/* Nome */}
                      <TableCell>
                        <p className="font-medium text-white">{candidato.nome_completo}</p>
                      </TableCell>

                      {/* Telefone com botão copiar */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">{candidato.telefone_whatsapp}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-500 hover:text-[#00D9FF] hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              copiarTexto(candidato.telefone_whatsapp, 'Telefone');
                            }}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Cargo */}
                      <TableCell className="text-slate-300">{candidato.cargo_atual}</TableCell>

                      {/* Instagram com botão copiar */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">{candidato.empresa_instagram}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-500 hover:text-[#00D9FF] hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              copiarTexto(candidato.empresa_instagram, 'Instagram');
                            }}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* PDF Download */}
                      <TableCell className="text-center">
                        {candidato.pdf_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[#00D9FF] hover:text-white hover:bg-[#00D9FF]/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(candidato.pdf_url!, '_blank');
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </TableCell>

                      {/* Perfil DISC */}
                      <TableCell>{renderDISCProfile(candidato.perfil_tipo)}</TableCell>
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Candidato</DialogTitle>
            <DialogDescription className="text-slate-400">
              Informações completas e perfil DISC
            </DialogDescription>
          </DialogHeader>

          {selectedCandidato && (
            <div className="space-y-6 mt-4">
              {/* Info básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Nome completo</p>
                  <p className="text-white font-medium">{selectedCandidato.nome_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Telefone/WhatsApp</p>
                  <p className="text-white">{selectedCandidato.telefone_whatsapp}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">E-mail</p>
                  <p className="text-white">{selectedCandidato.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Cargo Atual</p>
                  <p className="text-white">{selectedCandidato.cargo_atual}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Empresa/Instagram</p>
                  <p className="text-white">{selectedCandidato.empresa_instagram}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Data de Cadastro</p>
                  <p className="text-white">
                    {format(new Date(selectedCandidato.created_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              {/* Perfil DISC */}
              {selectedCandidato.perfil_tipo && (
                <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Perfil DISC</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex gap-1">
                      {selectedCandidato.perfil_tipo.split('').map((letter, index) => {
                        const colors = DISC_COLORS[letter] || { bg: 'bg-slate-500', text: 'text-white' };
                        return (
                          <span
                            key={index}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${colors.bg} ${colors.text}`}
                          >
                            {letter}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-xl font-bold text-white">
                      {selectedCandidato.perfil_tipo}
                    </span>
                  </div>

                  {/* Barras dos perfis */}
                  {selectedCandidato.perfil_natural && (
                    <div className="space-y-2">
                      {['D', 'I', 'S', 'C'].map((factor) => {
                        const naturalValue = selectedCandidato.perfil_natural?.[factor] || 0;
                        const normalizedValue = Math.round(((naturalValue + 50) / 100) * 100);
                        const colors = DISC_COLORS[factor] || { bg: 'bg-slate-500', text: 'text-white' };
                        return (
                          <div key={factor} className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.bg} ${colors.text}`}
                            >
                              {factor}
                            </span>
                            <div className="flex-1 h-4 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${colors.bg} transition-all duration-500`}
                                style={{ width: `${normalizedValue}%` }}
                              />
                            </div>
                            <span className="text-white text-sm w-12 text-right">
                              {normalizedValue}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Status e Ações */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Status:</span>
                  <Select
                    value={selectedCandidato.status}
                    onValueChange={(value) => updateStatus(selectedCandidato.id, value)}
                  >
                    <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="pendente" className="text-slate-300 hover:bg-slate-700">
                        Pendente
                      </SelectItem>
                      <SelectItem value="em_analise" className="text-slate-300 hover:bg-slate-700">
                        Em análise
                      </SelectItem>
                      <SelectItem value="aprovado" className="text-slate-300 hover:bg-slate-700">
                        Aprovado
                      </SelectItem>
                      <SelectItem value="reprovado" className="text-slate-300 hover:bg-slate-700">
                        Reprovado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedCandidato.pdf_url && (
                  <Button asChild className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC]">
                    <a
                      href={selectedCandidato.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Relatório PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
