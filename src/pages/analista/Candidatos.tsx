import { useState, useEffect } from 'react';
import { useAuthAnalista, UsuarioAnalista } from '@/context/AuthAnalistaContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Search, Copy, FileText, Trash2, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidato {
  id: string;
  nome_completo: string;
  email: string | null;
  cargo_atual: string | null;
  created_at: string;
  perfil_tipo: string | null;
}

// Cores DISC conforme especificação VEON
const DISC_COLORS: Record<string, { bg: string; text: string }> = {
  D: { bg: 'bg-[#E31E24]', text: 'text-white' },
  I: { bg: 'bg-[#FFD700]', text: 'text-slate-800' },
  S: { bg: 'bg-[#28A745]', text: 'text-white' },
  C: { bg: 'bg-[#003DA5]', text: 'text-white' },
};

export default function AnalistaCandidatos() {
  const { usuario } = useAuthAnalista();
  const analista = usuario as UsuarioAnalista;
  const { toast } = useToast();

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [filteredCandidatos, setFilteredCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('all');

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidatoToDelete, setCandidatoToDelete] = useState<Candidato | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCandidatos = async () => {
      if (!analista?.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('candidatos_disc')
          .select('id, nome_completo, email, cargo_atual, created_at, perfil_tipo')
          .eq('analista_id', analista.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar candidatos:', error);
        } else {
          setCandidatos(data || []);
          setFilteredCandidatos(data || []);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidatos();
  }, [analista?.id]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...candidatos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nome_completo.toLowerCase().includes(term) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          (c.cargo_atual && c.cargo_atual.toLowerCase().includes(term))
      );
    }

    if (perfilFilter !== 'all') {
      filtered = filtered.filter((c) => {
        if (!c.perfil_tipo) return perfilFilter === 'none';
        return c.perfil_tipo.charAt(0).toUpperCase() === perfilFilter;
      });
    }

    setFilteredCandidatos(filtered);
  }, [searchTerm, perfilFilter, candidatos]);

  const copyReportLink = async (candidatoId: string) => {
    const reportLink = `${window.location.origin}/relatorio/${candidatoId}`;
    try {
      await navigator.clipboard.writeText(reportLink);
      toast({
        title: 'Link copiado!',
        description: 'O link do relatório foi copiado.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (candidato: Candidato) => {
    setCandidatoToDelete(candidato);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!candidatoToDelete) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase
        .rpc('delete_candidato', { p_candidato_id: candidatoToDelete.id });

      if (error) throw error;

      const result = data as { success: boolean; nome?: string; error?: string } | null;

      if (result?.success) {
        setCandidatos((prev) => prev.filter((c) => c.id !== candidatoToDelete.id));
        toast({
          title: 'Candidato excluído',
          description: `${result.nome} foi removido com sucesso.`,
        });
      } else {
        throw new Error(result?.error || 'Falha ao excluir candidato');
      }
    } catch (error) {
      console.error('Erro ao excluir candidato:', error);
      toast({
        title: 'Erro ao excluir',
        description: error instanceof Error ? error.message : 'Não foi possível excluir o candidato.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCandidatoToDelete(null);
    }
  };

  const renderDISCProfile = (perfilTipo: string | null) => {
    if (!perfilTipo) {
      return <span className="text-slate-500">-</span>;
    }

    return (
      <div className="flex items-center gap-1">
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
        <span className="text-slate-300 font-medium ml-1">{perfilTipo}</span>
      </div>
    );
  };

  const hasActiveFilters = searchTerm || perfilFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setPerfilFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Meus Candidatos</h1>
        <p className="text-slate-400 mt-1">
          Gerencie os candidatos que realizaram o teste através do seu link
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4">
            <p className="text-2xl font-bold text-[#00D9FF]">{candidatos.length}</p>
            <p className="text-xs text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4">
            <p className="text-2xl font-bold text-red-500">
              {candidatos.filter((c) => c.perfil_tipo?.charAt(0) === 'D').length}
            </p>
            <p className="text-xs text-slate-400">Dominância</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4">
            <p className="text-2xl font-bold text-yellow-500">
              {candidatos.filter((c) => c.perfil_tipo?.charAt(0) === 'I').length}
            </p>
            <p className="text-xs text-slate-400">Influência</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4">
            <p className="text-2xl font-bold text-green-500">
              {candidatos.filter((c) => c.perfil_tipo?.charAt(0) === 'S').length}
            </p>
            <p className="text-xs text-slate-400">Estabilidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
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
                placeholder="Buscar por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Filtrar por perfil" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Todos os perfis
                </SelectItem>
                <SelectItem value="D" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Dominância (D)
                </SelectItem>
                <SelectItem value="I" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Influência (I)
                </SelectItem>
                <SelectItem value="S" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Estabilidade (S)
                </SelectItem>
                <SelectItem value="C" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Conformidade (C)
                </SelectItem>
                <SelectItem value="none" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Sem perfil
                </SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
          <div className="mt-4 text-sm text-slate-400">
            {filteredCandidatos.length} candidato(s) encontrado(s)
          </div>
        </CardContent>
      </Card>

      {/* Tabela de candidatos */}
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
          ) : filteredCandidatos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="mt-4 text-slate-400">
                {candidatos.length === 0
                  ? 'Nenhum candidato ainda'
                  : 'Nenhum candidato encontrado com os filtros aplicados'}
              </p>
              {candidatos.length === 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  Compartilhe seu link para receber candidatos
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Cargo</TableHead>
                  <TableHead className="text-slate-400">Data do Teste</TableHead>
                  <TableHead className="text-slate-400">Perfil DISC</TableHead>
                  <TableHead className="text-slate-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidatos.map((candidato) => (
                  <TableRow key={candidato.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="font-medium text-white">
                      {candidato.nome_completo}
                    </TableCell>
                    <TableCell className="text-slate-300">{candidato.email || '-'}</TableCell>
                    <TableCell className="text-slate-300">
                      {candidato.cargo_atual || '-'}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(candidato.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{renderDISCProfile(candidato.perfil_tipo)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10"
                          onClick={() =>
                            window.open(`/relatorio/${candidato.id}`, '_blank')
                          }
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Relatório
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-[#00D9FF]"
                          onClick={() => copyReportLink(candidato.id)}
                          title="Copiar link do relatório"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          onClick={() => openDeleteDialog(candidato)}
                          title="Excluir candidato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Candidato</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir o candidato{' '}
              <strong className="text-white">{candidatoToDelete?.nome_completo}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
