// =====================================================
// EMPRESAS - Área de Recrutamento (Painel do Gestor)
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Empresa {
  id: string;
  created_at: string;
  razao_social: string;
  cnpj: string;
  nome_fantasia: string | null;
  socio_nome: string | null;
  socio_telefone: string | null;
  socio_email: string | null;
  cidade: string | null;
  estado: string | null;
  creditos: number;
  status: string;
}

interface NovaEmpresa {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  socio_nome: string;
  socio_cpf: string;
  socio_email: string;
  socio_telefone: string;
  senha: string;
  creditos: number;
}

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ITEMS_PER_PAGE = 20;

export default function Empresas() {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  // Modal de cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBuscandoCNPJ, setIsBuscandoCNPJ] = useState(false);
  const [isBuscandoCEP, setIsBuscandoCEP] = useState(false);
  const [novaEmpresa, setNovaEmpresa] = useState<NovaEmpresa>({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    situacao_cadastral: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    socio_nome: '',
    socio_cpf: '',
    socio_email: '',
    socio_telefone: '',
    senha: '',
    creditos: 0,
  });

  // Buscar empresas
  const fetchEmpresas = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('empresas_recrutamento')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`razao_social.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%,nome_fantasia.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
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

      setEmpresas(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [currentPage, searchTerm, statusFilter, estadoFilter]);

  // Formatar CNPJ
  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  // Formatar CPF
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  // Formatar telefone
  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  // Formatar CEP
  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d)/, '$1-$2');
  };

  // Buscar CNPJ
  const buscarCNPJ = async () => {
    const cnpjLimpo = novaEmpresa.cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      toast({
        title: 'CNPJ inválido',
        description: 'Digite um CNPJ com 14 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsBuscandoCNPJ(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');

      const data = await response.json();

      setNovaEmpresa(prev => ({
        ...prev,
        razao_social: data.razao_social || '',
        nome_fantasia: data.nome_fantasia || '',
        situacao_cadastral: data.descricao_situacao_cadastral || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.municipio || '',
        estado: data.uf || '',
        cep: formatCEP(data.cep || ''),
      }));

      toast({
        title: 'CNPJ encontrado',
        description: 'Dados preenchidos automaticamente.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao buscar CNPJ',
        description: 'Não foi possível encontrar o CNPJ informado.',
        variant: 'destructive',
      });
    } finally {
      setIsBuscandoCNPJ(false);
    }
  };

  // Buscar CEP
  const buscarCEP = async () => {
    const cepLimpo = novaEmpresa.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      toast({
        title: 'CEP inválido',
        description: 'Digite um CEP com 8 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsBuscandoCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) throw new Error('CEP não encontrado');

      setNovaEmpresa(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));

      toast({
        title: 'CEP encontrado',
        description: 'Endereço preenchido automaticamente.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Não foi possível encontrar o CEP informado.',
        variant: 'destructive',
      });
    } finally {
      setIsBuscandoCEP(false);
    }
  };

  // Gerar senha aleatória
  const gerarSenha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
      senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNovaEmpresa(prev => ({ ...prev, senha }));
  };

  // Salvar empresa
  const salvarEmpresa = async () => {
    // Validações
    if (!novaEmpresa.cnpj || !novaEmpresa.razao_social || !novaEmpresa.socio_nome ||
        !novaEmpresa.socio_cpf || !novaEmpresa.socio_email || !novaEmpresa.socio_telefone ||
        !novaEmpresa.senha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios (*)',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('empresas_recrutamento').insert({
        cnpj: novaEmpresa.cnpj.replace(/\D/g, ''),
        razao_social: novaEmpresa.razao_social,
        nome_fantasia: novaEmpresa.nome_fantasia || null,
        situacao_cadastral: novaEmpresa.situacao_cadastral || null,
        cep: novaEmpresa.cep.replace(/\D/g, '') || null,
        logradouro: novaEmpresa.logradouro || null,
        numero: novaEmpresa.numero || null,
        complemento: novaEmpresa.complemento || null,
        bairro: novaEmpresa.bairro || null,
        cidade: novaEmpresa.cidade || null,
        estado: novaEmpresa.estado || null,
        socio_nome: novaEmpresa.socio_nome,
        socio_cpf: novaEmpresa.socio_cpf.replace(/\D/g, ''),
        socio_email: novaEmpresa.socio_email,
        socio_telefone: novaEmpresa.socio_telefone.replace(/\D/g, ''),
        senha_hash: novaEmpresa.senha, // Em produção, usar hash
        creditos: novaEmpresa.creditos || 0,
        status: 'ativo',
      });

      if (error) throw error;

      toast({
        title: 'Empresa cadastrada',
        description: 'A empresa foi cadastrada com sucesso.',
      });

      setIsModalOpen(false);
      setNovaEmpresa({
        cnpj: '', razao_social: '', nome_fantasia: '', situacao_cadastral: '',
        cep: '', logradouro: '', numero: '', complemento: '', bairro: '',
        cidade: '', estado: '', socio_nome: '', socio_cpf: '', socio_email: '',
        socio_telefone: '', senha: '', creditos: 0,
      });
      fetchEmpresas();
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível cadastrar a empresa.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copiar para clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    });
  };

  // Excluir empresa
  const excluirEmpresa = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      const { error } = await supabase
        .from('empresas_recrutamento')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Empresa excluída',
        description: 'A empresa foi excluída com sucesso.',
      });

      fetchEmpresas();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a empresa.',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Empresas Recrutadoras</h1>
          <p className="text-slate-400 mt-1">
            {totalCount} empresas cadastradas
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Empresa
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
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
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
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

            <Button
              variant="outline"
              onClick={fetchEmpresas}
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
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
                  <TableHead className="text-slate-400">Razão Social</TableHead>
                  <TableHead className="text-slate-400">CNPJ</TableHead>
                  <TableHead className="text-slate-400">Nome Fantasia</TableHead>
                  <TableHead className="text-slate-400">Sócio</TableHead>
                  <TableHead className="text-slate-400">Telefone</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Cidade/UF</TableHead>
                  <TableHead className="text-slate-400">Créditos</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                      <TableCell colSpan={11}>
                        <Skeleton className="h-10 w-full bg-slate-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : empresas.length === 0 ? (
                  <TableRow className="border-slate-700">
                    <TableCell colSpan={11} className="text-center py-8">
                      <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Nenhuma empresa encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  empresas.map((empresa) => (
                    <TableRow key={empresa.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="text-slate-300 whitespace-nowrap">
                        {format(new Date(empresa.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-white font-medium max-w-[200px] truncate">
                        {empresa.razao_social}
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono">
                        {formatCNPJ(empresa.cnpj)}
                      </TableCell>
                      <TableCell className="text-slate-300 max-w-[150px] truncate">
                        {empresa.nome_fantasia || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300 max-w-[150px] truncate">
                        {empresa.socio_nome || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {empresa.socio_telefone ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono">{formatTelefone(empresa.socio_telefone)}</span>
                            <button
                              onClick={() => copyToClipboard(empresa.socio_telefone!, 'Telefone')}
                              className="p-1 hover:bg-slate-600 rounded"
                            >
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {empresa.socio_email ? (
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[150px]">{empresa.socio_email}</span>
                            <button
                              onClick={() => copyToClipboard(empresa.socio_email!, 'Email')}
                              className="p-1 hover:bg-slate-600 rounded"
                            >
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-slate-300 whitespace-nowrap">
                        {empresa.cidade && empresa.estado
                          ? `${empresa.cidade}/${empresa.estado}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        R$ {(empresa.creditos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={empresa.status === 'ativo' ? 'default' : 'destructive'}
                          className={empresa.status === 'ativo'
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }
                        >
                          {empresa.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Excluir"
                            onClick={() => excluirEmpresa(empresa.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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

      {/* Modal de Cadastro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Cadastrar Nova Empresa
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Preencha os dados da empresa. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seção 1 - Dados da Empresa */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Dados da Empresa
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">CNPJ *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={novaEmpresa.cnpj}
                      onChange={(e) => setNovaEmpresa(prev => ({
                        ...prev,
                        cnpj: formatCNPJ(e.target.value)
                      }))}
                      placeholder="00.000.000/0000-00"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={buscarCNPJ}
                      disabled={isBuscandoCNPJ}
                      className="border-slate-600 text-slate-300 hover:text-white whitespace-nowrap"
                    >
                      {isBuscandoCNPJ ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Buscar'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Situação Cadastral</Label>
                  <Input
                    value={novaEmpresa.situacao_cadastral}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      situacao_cadastral: e.target.value
                    }))}
                    placeholder="Preenchido automaticamente"
                    className="bg-slate-700 border-slate-600 text-white"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Razão Social *</Label>
                <Input
                  value={novaEmpresa.razao_social}
                  onChange={(e) => setNovaEmpresa(prev => ({
                    ...prev,
                    razao_social: e.target.value
                  }))}
                  placeholder="Razão social da empresa"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Nome Fantasia</Label>
                <Input
                  value={novaEmpresa.nome_fantasia}
                  onChange={(e) => setNovaEmpresa(prev => ({
                    ...prev,
                    nome_fantasia: e.target.value
                  }))}
                  placeholder="Nome fantasia"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Seção 2 - Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Endereço
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      value={novaEmpresa.cep}
                      onChange={(e) => setNovaEmpresa(prev => ({
                        ...prev,
                        cep: formatCEP(e.target.value)
                      }))}
                      placeholder="00000-000"
                      className="bg-slate-700 border-slate-600 text-white"
                      onBlur={buscarCEP}
                    />
                    {isBuscandoCEP && <Loader2 className="w-4 h-4 animate-spin text-slate-400 self-center" />}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-slate-300">Logradouro</Label>
                  <Input
                    value={novaEmpresa.logradouro}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      logradouro: e.target.value
                    }))}
                    placeholder="Rua, Avenida..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Número</Label>
                  <Input
                    value={novaEmpresa.numero}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      numero: e.target.value
                    }))}
                    placeholder="Nº"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Complemento</Label>
                  <Input
                    value={novaEmpresa.complemento}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      complemento: e.target.value
                    }))}
                    placeholder="Sala, Apto..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Bairro</Label>
                  <Input
                    value={novaEmpresa.bairro}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      bairro: e.target.value
                    }))}
                    placeholder="Bairro"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Estado</Label>
                  <Select
                    value={novaEmpresa.estado}
                    onValueChange={(value) => setNovaEmpresa(prev => ({
                      ...prev,
                      estado: value
                    }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {ESTADOS_BR.map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Cidade</Label>
                <Input
                  value={novaEmpresa.cidade}
                  onChange={(e) => setNovaEmpresa(prev => ({
                    ...prev,
                    cidade: e.target.value
                  }))}
                  placeholder="Cidade"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Seção 3 - Dados do Sócio */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Dados do Sócio Responsável
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome Completo *</Label>
                  <Input
                    value={novaEmpresa.socio_nome}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      socio_nome: e.target.value
                    }))}
                    placeholder="Nome do sócio"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">CPF *</Label>
                  <Input
                    value={novaEmpresa.socio_cpf}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      socio_cpf: formatCPF(e.target.value)
                    }))}
                    placeholder="000.000.000-00"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Email *</Label>
                  <Input
                    type="email"
                    value={novaEmpresa.socio_email}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      socio_email: e.target.value
                    }))}
                    placeholder="email@empresa.com"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Telefone/WhatsApp *</Label>
                  <Input
                    value={novaEmpresa.socio_telefone}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      socio_telefone: formatTelefone(e.target.value)
                    }))}
                    placeholder="(00) 00000-0000"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4 - Acesso */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Acesso
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Senha *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={novaEmpresa.senha}
                      onChange={(e) => setNovaEmpresa(prev => ({
                        ...prev,
                        senha: e.target.value
                      }))}
                      placeholder="Senha de acesso"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={gerarSenha}
                      className="border-slate-600 text-slate-300 hover:text-white whitespace-nowrap"
                    >
                      Gerar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Créditos Iniciais (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={novaEmpresa.creditos}
                    onChange={(e) => setNovaEmpresa(prev => ({
                      ...prev,
                      creditos: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="0.00"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarEmpresa}
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Empresa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
