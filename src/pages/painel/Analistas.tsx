import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  CreditCard,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Copy,
  Check,
  Filter,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Analista {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  email: string;
  telefone: string | null;
  empresa: string | null;
  tipo: string;
  licencas_total: number;
  licencas_usadas: number;
  link_unico: string;
  ativo: boolean;
  data_cadastro: string;
  ultimo_acesso: string | null;
}

const tiposAnalista = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'coach', label: 'Coach' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'rh', label: 'RH' },
  { value: 'escola', label: 'Escola' },
  { value: 'outro', label: 'Outro' },
];

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
];

export default function PainelAnalistas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analistas, setAnalistas] = useState<Analista[]>([]);
  const [filteredAnalistas, setFilteredAnalistas] = useState<Analista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalistas();
  }, []);

  useEffect(() => {
    let filtered = [...analistas];

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.nome.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          (a.empresa && a.empresa.toLowerCase().includes(term))
      );
    }

    // Filtro por tipo
    if (tipoFilter !== 'all') {
      filtered = filtered.filter((a) => a.tipo === tipoFilter);
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) =>
        statusFilter === 'ativo' ? a.ativo : !a.ativo
      );
    }

    setFilteredAnalistas(filtered);
  }, [searchTerm, tipoFilter, statusFilter, analistas]);

  const fetchAnalistas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analistas')
        .select('*')
        .order('data_cadastro', { ascending: false });

      if (error) throw error;
      
      // Map data to include cpf_cnpj as optional
      const mappedData: Analista[] = (data || []).map(item => ({
        ...item,
        cpf_cnpj: item.cpf_cnpj || null,
      }));
      
      setAnalistas(mappedData);
      setFilteredAnalistas(mappedData);
    } catch (error) {
      console.error('Erro ao buscar analistas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os analistas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, { label: string; color: string }> = {
      coach: { label: 'Coach', color: 'bg-blue-500/20 text-blue-400' },
      psicologo: { label: 'Psicólogo', color: 'bg-purple-500/20 text-purple-400' },
      empresa: { label: 'Empresa', color: 'bg-green-500/20 text-green-400' },
      rh: { label: 'RH', color: 'bg-orange-500/20 text-orange-400' },
      escola: { label: 'Escola', color: 'bg-cyan-500/20 text-cyan-400' },
      outro: { label: 'Outro', color: 'bg-slate-500/20 text-slate-400' },
    };
    return tipos[tipo] || tipos.outro;
  };

  const copyLink = async (analista: Analista) => {
    const link = `${window.location.origin}/teste/${analista.link_unico}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(analista.id);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const toggleAtivo = async (analista: Analista) => {
    try {
      const { error } = await supabase
        .from('analistas')
        .update({ ativo: !analista.ativo })
        .eq('id', analista.id);

      if (error) throw error;

      setAnalistas((prev) =>
        prev.map((a) => (a.id === analista.id ? { ...a, ativo: !a.ativo } : a))
      );

      toast({
        title: analista.ativo ? 'Analista desativado' : 'Analista ativado',
        description: `${analista.nome} foi ${analista.ativo ? 'desativado' : 'ativado'} com sucesso.`,
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

  const clearFilters = () => {
    setSearchTerm('');
    setTipoFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || tipoFilter !== 'all' || statusFilter !== 'all';

  const formatUltimoAcesso = (data: string | null) => {
    if (!data) return 'Nunca acessou';
    try {
      return formatDistanceToNow(new Date(data), { addSuffix: true, locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Analistas</h1>
          <p className="text-slate-400 mt-1">
            Gerencie seus analistas e distribua licenças
          </p>
        </div>
        <Button
          onClick={() => navigate('/painel/novo-analista')}
          className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC] hover:from-[#00C4E6] hover:to-[#0088B3]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Analista
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Busca */}
        <div className="md:col-span-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Filtro por Tipo */}
        <div className="md:col-span-3">
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {tiposAnalista.map((tipo) => (
                <SelectItem
                  key={tipo.value}
                  value={tipo.value}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Status */}
        <div className="md:col-span-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {statusOptions.map((status) => (
                <SelectItem
                  key={status.value}
                  value={status.value}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Limpar filtros */}
        <div className="md:col-span-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-[#00D9FF]" />
            <div>
              <p className="text-2xl font-bold text-white">{analistas.length}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-white">
                {analistas.filter(a => a.ativo).length}
              </p>
              <p className="text-xs text-slate-400">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-white">
                {analistas.reduce((acc, a) => acc + a.licencas_total, 0)}
              </p>
              <p className="text-xs text-slate-400">Licenças totais</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-white">
                {analistas.reduce((acc, a) => acc + (a.licencas_total - a.licencas_usadas), 0)}
              </p>
              <p className="text-xs text-slate-400">Disponíveis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
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
          ) : filteredAnalistas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="mt-4 text-slate-400">
                {hasActiveFilters ? 'Nenhum analista encontrado com esses filtros' : 'Nenhum analista cadastrado ainda'}
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => navigate('/painel/novo-analista')}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar primeiro analista
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Empresa</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Licenças</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Último Acesso</TableHead>
                  <TableHead className="text-slate-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalistas.map((analista) => {
                  const tipo = getTipoLabel(analista.tipo);
                  const licencasDisponiveis = analista.licencas_total - analista.licencas_usadas;
                  return (
                    <TableRow
                      key={analista.id}
                      className="border-slate-700 hover:bg-slate-700/30 cursor-pointer"
                      onClick={() => navigate(`/painel/analista/${analista.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-white font-bold text-sm">
                            {analista.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{analista.nome}</p>
                            <p className="text-sm text-slate-400">{analista.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {analista.empresa || <span className="text-slate-500">-</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={tipo.color}>{tipo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {analista.licencas_usadas}/{analista.licencas_total}
                          </span>
                          {licencasDisponiveis === 0 && (
                            <span className="text-xs text-red-400">(esgotado)</span>
                          )}
                          {licencasDisponiveis > 0 && licencasDisponiveis <= 5 && (
                            <span className="text-xs text-amber-400">(baixo)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {analista.ativo ? (
                          <Badge className="bg-green-500/20 text-green-400">Ativo</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatUltimoAcesso(analista.ultimo_acesso)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/painel/analista/${analista.id}`);
                              }}
                              className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                copyLink(analista);
                              }}
                              className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            >
                              {copiedId === analista.id ? (
                                <Check className="w-4 h-4 mr-2" />
                              ) : (
                                <Copy className="w-4 h-4 mr-2" />
                              )}
                              Copiar Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAtivo(analista);
                              }}
                              className={`cursor-pointer ${
                                analista.ativo
                                  ? 'text-red-400 hover:text-red-300 hover:bg-slate-700'
                                  : 'text-green-400 hover:text-green-300 hover:bg-slate-700'
                              }`}
                            >
                              {analista.ativo ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
