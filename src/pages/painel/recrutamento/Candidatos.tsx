// =====================================================
// CANDIDATOS - Área de Recrutamento (Painel do Gestor)
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  Eye,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  DollarSign,
  Video,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidato {
  id: string;
  created_at: string;
  nome_completo: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  perfil_disc: string | null;
  status: string;
  foto_url: string | null;
  video_url: string | null;
  documento_url: string | null;
  anos_experiencia: number | null;
  escolaridade: string | null;
  pretensao_salarial: string | null;
  disponibilidade_inicio: string | null;
  aceita_mudanca: string | null;
}

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  disponivel: { label: 'Disponível', color: 'bg-green-500/20 text-green-400', emoji: '🟢' },
  em_processo: { label: 'Em processo', color: 'bg-yellow-500/20 text-yellow-400', emoji: '🟡' },
  contratado: { label: 'Contratado', color: 'bg-red-500/20 text-red-400', emoji: '🔴' },
  pausado: { label: 'Pausado', color: 'bg-slate-500/20 text-slate-400', emoji: '⚫' },
};

const DISC_CONFIG: Record<string, { label: string; color: string }> = {
  D: { label: 'Dominante', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  I: { label: 'Influente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  S: { label: 'Estável', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  C: { label: 'Conforme', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export default function Candidatos() {
  const { toast } = useToast();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [discFilter, setDiscFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  // Modal de detalhes
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscar candidatos
  const fetchCandidatos = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('candidatos_recrutamento')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nome_completo.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      if (discFilter !== 'todos') {
        query = query.ilike('perfil_disc', `%${discFilter}%`);
      }

      if (estadoFilter !== 'todos') {
        query = query.eq('estado', estadoFilter);
      }

      // Paginação
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setCandidatos(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os candidatos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatos();
  }, [currentPage, searchTerm, statusFilter, discFilter, estadoFilter]);

  // Formatar telefone
  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  // Copiar para clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    });
  };

  // Excluir candidato usando RPC para garantir exclusão de dependências
  const excluirCandidato = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este candidato? Esta ação não pode ser desfeita.')) return;

    try {
      // Usar função RPC que deleta candidato e todas as dependências
      const { data, error } = await supabase.rpc('delete_candidato_completo', {
        p_candidato_id: id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; candidato_nome?: string } | null;

      if (result && !result.success) {
        throw new Error(result.error || 'Erro ao excluir candidato');
      }

      toast({
        title: 'Candidato excluído',
        description: result?.candidato_nome 
          ? `${result.candidato_nome} foi excluído com sucesso.`
          : 'O candidato foi excluído com sucesso.',
      });

      fetchCandidatos();
    } catch (error: any) {
      console.error('Erro ao excluir candidato:', error);
      toast({
        title: 'Erro ao excluir',
        description: error?.message || 'Não foi possível excluir o candidato.',
        variant: 'destructive',
      });
    }
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

  // Abrir modal de detalhes
  const openDetails = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsModalOpen(true);
  };

  // Obter nome abreviado
  const getNomeAbreviado = (nomeCompleto: string | null) => {
    if (!nomeCompleto) return 'Anônimo';
    const partes = nomeCompleto.trim().split(' ');
    if (partes.length === 1) return partes[0];
    return `${partes[0]} ${partes[partes.length - 1].charAt(0)}.`;
  };

  // Obter iniciais
  const getInitials = (nome: string | null) => {
    if (!nome) return '?';
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Candidatos - Área de Recrutamento</h1>
        <p className="text-slate-400 mt-1">
          {totalCount} candidatos cadastrados
        </p>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou email..."
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
                <SelectItem value="disponivel">🟢 Disponível</SelectItem>
                <SelectItem value="em_processo">🟡 Em processo</SelectItem>
                <SelectItem value="contratado">🔴 Contratado</SelectItem>
                <SelectItem value="pausado">⚫ Pausado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={discFilter}
              onValueChange={(value) => {
                setDiscFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Perfil DISC" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="todos">Todos os perfis</SelectItem>
                <SelectItem value="D">🔴 Dominante (D)</SelectItem>
                <SelectItem value="I">🟡 Influente (I)</SelectItem>
                <SelectItem value="S">🟢 Estável (S)</SelectItem>
                <SelectItem value="C">🔵 Conforme (C)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={estadoFilter}
              onValueChange={(value) => {
                setEstadoFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="todos">Todos os estados</SelectItem>
                {ESTADOS_BR.map(uf => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
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
                  <TableHead className="text-slate-400">Data/Hora</TableHead>
                  <TableHead className="text-slate-400">Foto</TableHead>
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Telefone</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Cidade/UF</TableHead>
                  <TableHead className="text-slate-400">Perfil DISC</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                      <TableCell colSpan={9}>
                        <Skeleton className="h-12 w-full bg-slate-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : candidatos.length === 0 ? (
                  <TableRow className="border-slate-700">
                    <TableCell colSpan={9} className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Nenhum candidato encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  candidatos.map((candidato) => {
                    const statusConfig = STATUS_CONFIG[candidato.status] || STATUS_CONFIG.disponivel;
                    return (
                      <TableRow key={candidato.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-slate-300 whitespace-nowrap">
                          {format(new Date(candidato.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={candidato.foto_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-sm">
                              {getInitials(candidato.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {getNomeAbreviado(candidato.nome_completo)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {candidato.telefone ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{formatTelefone(candidato.telefone)}</span>
                              <button
                                onClick={() => copyToClipboard(candidato.telefone!, 'Telefone')}
                                className="p-1 hover:bg-slate-600 rounded"
                              >
                                <Copy className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {candidato.email ? (
                            <div className="flex items-center gap-1">
                              <span className="truncate max-w-[150px]">{candidato.email}</span>
                              <button
                                onClick={() => copyToClipboard(candidato.email!, 'Email')}
                                className="p-1 hover:bg-slate-600 rounded"
                              >
                                <Copy className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-slate-300 whitespace-nowrap">
                          {candidato.cidade && candidato.estado
                            ? `${candidato.cidade}/${candidato.estado}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {renderDiscBadges(candidato.perfil_disc)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.emoji} {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                              title="Ver perfil completo"
                              onClick={() => openDetails(candidato)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Excluir"
                              onClick={() => excluirCandidato(candidato.id)}
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

      {/* Modal de Detalhes do Candidato */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedCandidato?.foto_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  {getInitials(selectedCandidato?.nome_completo || null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{selectedCandidato?.nome_completo || 'Candidato'}</p>
                <p className="text-sm font-normal text-slate-400">
                  {selectedCandidato?.escolaridade || 'Cargo não informado'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCandidato && (
            <div className="space-y-6 py-4">
              {/* Status e DISC */}
              <div className="flex flex-wrap gap-2">
                <Badge className={STATUS_CONFIG[selectedCandidato.status]?.color || ''}>
                  {STATUS_CONFIG[selectedCandidato.status]?.emoji} {STATUS_CONFIG[selectedCandidato.status]?.label}
                </Badge>
                {renderDiscBadges(selectedCandidato.perfil_disc)}
              </div>

              {/* Contato */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                  Contato
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCandidato.telefone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{formatTelefone(selectedCandidato.telefone)}</span>
                      <button
                        onClick={() => copyToClipboard(selectedCandidato.telefone!, 'Telefone')}
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  )}
                  {selectedCandidato.email && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="truncate">{selectedCandidato.email}</span>
                      <button
                        onClick={() => copyToClipboard(selectedCandidato.email!, 'Email')}
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  )}
                  {selectedCandidato.cidade && selectedCandidato.estado && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{selectedCandidato.cidade}/{selectedCandidato.estado}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profissional */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                  Informações Profissionais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCandidato.escolaridade && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                      <span>{selectedCandidato.escolaridade}</span>
                    </div>
                  )}
                  {selectedCandidato.anos_experiencia !== null && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span>{selectedCandidato.anos_experiencia} anos de experiência</span>
                    </div>
                  )}
                  {selectedCandidato.pretensao_salarial && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span>{selectedCandidato.pretensao_salarial}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Disponibilidade */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                  Disponibilidade
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCandidato.disponibilidade_inicio && (
                    <div className="text-slate-300">
                      <span className="text-slate-500">Início:</span> {selectedCandidato.disponibilidade_inicio}
                    </div>
                  )}
                  {selectedCandidato.aceita_mudanca && (
                    <div className="text-slate-300">
                      <span className="text-slate-500">Aceita mudança:</span> {selectedCandidato.aceita_mudanca}
                    </div>
                  )}
                </div>
              </div>

              {/* Arquivos */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                  Arquivos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidato.video_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                      onClick={() => window.open(selectedCandidato.video_url!, '_blank')}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Ver Vídeo
                    </Button>
                  )}
                  {selectedCandidato.documento_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                      onClick={() => window.open(selectedCandidato.documento_url!, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Documento
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
