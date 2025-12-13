// =====================================================
// MINHAS VAGAS - Área de Recrutamento VEON
// CRUD de vagas da empresa
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  FileText,
  Loader2,
  Building2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
}

interface Vaga {
  id: string;
  titulo: string;
  descricao: string;
  requisitos: string;
  beneficios: string;
  faixa_salarial: string;
  regime: string;
  cidade: string;
  estado: string;
  modalidade: string;
  status: 'ativa' | 'pausada' | 'encerrada';
  created_at: string;
  _count?: {
    propostas: number;
  };
}

interface FormVaga {
  titulo: string;
  descricao: string;
  requisitos: string;
  beneficios: string;
  faixa_salarial: string;
  regime: string;
  cidade: string;
  estado: string;
  modalidade: string;
}

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const FAIXAS_SALARIAIS = [
  { value: 'ate_1500', label: 'Até R$ 1.500' },
  { value: '1500_2500', label: 'R$ 1.500 - R$ 2.500' },
  { value: '2500_4000', label: 'R$ 2.500 - R$ 4.000' },
  { value: '4000_6000', label: 'R$ 4.000 - R$ 6.000' },
  { value: '6000_10000', label: 'R$ 6.000 - R$ 10.000' },
  { value: 'acima_10000', label: 'Acima de R$ 10.000' },
  { value: 'a_combinar', label: 'A combinar' },
];

const REGIMES = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'temporario', label: 'Temporário' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'freelancer', label: 'Freelancer' },
];

const MODALIDADES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'remoto', label: 'Remoto' },
];

const initialForm: FormVaga = {
  titulo: '',
  descricao: '',
  requisitos: '',
  beneficios: '',
  faixa_salarial: '',
  regime: '',
  cidade: '',
  estado: '',
  modalidade: '',
};

export default function MinhasVagas() {
  const { toast } = useToast();
  const { empresa } = useOutletContext<{ empresa: Empresa | null }>();

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');

  // Modal de criação/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [vagaEditando, setVagaEditando] = useState<Vaga | null>(null);
  const [form, setForm] = useState<FormVaga>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [cidades, setCidades] = useState<string[]>([]);

  // Dialog de exclusão
  const [vagaParaExcluir, setVagaParaExcluir] = useState<Vaga | null>(null);

  useEffect(() => {
    if (empresa?.id) {
      carregarVagas();
    }
  }, [empresa?.id]);

  useEffect(() => {
    if (form.estado) {
      carregarCidades(form.estado);
    }
  }, [form.estado]);

  const carregarVagas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vagas_recrutamento')
        .select('*')
        .eq('empresa_id', empresa?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Contar propostas por vaga
      const vagasComContagem = await Promise.all(
        (data || []).map(async (vaga) => {
          const { count } = await supabase
            .from('propostas_recrutamento')
            .select('*', { count: 'exact', head: true })
            .eq('vaga_id', vaga.id);

          return {
            ...vaga,
            _count: { propostas: count || 0 },
          };
        })
      );

      setVagas(vagasComContagem);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar suas vagas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const carregarCidades = async (uf: string) => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      );
      const data = await response.json();
      setCidades(data.map((c: any) => c.nome).sort());
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  const abrirModalCriacao = () => {
    setVagaEditando(null);
    setForm(initialForm);
    setModalAberto(true);
  };

  const abrirModalEdicao = (vaga: Vaga) => {
    setVagaEditando(vaga);
    setForm({
      titulo: vaga.titulo,
      descricao: vaga.descricao,
      requisitos: vaga.requisitos,
      beneficios: vaga.beneficios,
      faixa_salarial: vaga.faixa_salarial,
      regime: vaga.regime,
      cidade: vaga.cidade,
      estado: vaga.estado,
      modalidade: vaga.modalidade,
    });
    setModalAberto(true);
  };

  const salvarVaga = async () => {
    if (!empresa?.id) return;

    if (!form.titulo || !form.descricao || !form.faixa_salarial || !form.regime) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (vagaEditando) {
        // Atualizar vaga existente
        const { error } = await supabase
          .from('vagas_recrutamento')
          .update(form)
          .eq('id', vagaEditando.id);

        if (error) throw error;

        toast({
          title: 'Vaga atualizada!',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        // Criar nova vaga
        const { error } = await supabase
          .from('vagas_recrutamento')
          .insert({
            ...form,
            empresa_id: empresa.id,
            status: 'ativa',
          });

        if (error) throw error;

        toast({
          title: 'Vaga criada!',
          description: 'Sua nova vaga está ativa e visível para candidatos.',
        });
      }

      setModalAberto(false);
      carregarVagas();
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a vaga.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const alterarStatusVaga = async (vaga: Vaga, novoStatus: 'ativa' | 'pausada' | 'encerrada') => {
    try {
      const { error } = await supabase
        .from('vagas_recrutamento')
        .update({ status: novoStatus })
        .eq('id', vaga.id);

      if (error) throw error;

      toast({
        title: 'Status alterado',
        description: `A vaga foi ${novoStatus === 'ativa' ? 'ativada' : novoStatus === 'pausada' ? 'pausada' : 'encerrada'}.`,
      });

      carregarVagas();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status da vaga.',
        variant: 'destructive',
      });
    }
  };

  const excluirVaga = async () => {
    if (!vagaParaExcluir) return;

    try {
      const { error } = await supabase
        .from('vagas_recrutamento')
        .delete()
        .eq('id', vagaParaExcluir.id);

      if (error) throw error;

      toast({
        title: 'Vaga excluída',
        description: 'A vaga foi removida com sucesso.',
      });

      setVagaParaExcluir(null);
      carregarVagas();
    } catch (error) {
      console.error('Erro ao excluir vaga:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a vaga.',
        variant: 'destructive',
      });
    }
  };

  const getFaixaSalarialLabel = (faixa: string) => {
    return FAIXAS_SALARIAIS.find(f => f.value === faixa)?.label || faixa;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-500/20 text-green-400">Ativa</Badge>;
      case 'pausada':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pausada</Badge>;
      case 'encerrada':
        return <Badge className="bg-slate-500/20 text-slate-400">Encerrada</Badge>;
      default:
        return null;
    }
  };

  // Filtrar vagas
  const vagasFiltradas = vagas.filter(vaga => {
    const matchBusca = busca === '' ||
      vaga.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      vaga.descricao.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todas' || vaga.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Minhas Vagas</h1>
          <p className="text-slate-400">Gerencie as vagas da sua empresa</p>
        </div>
        <Button
          onClick={abrirModalCriacao}
          className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar vagas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="ativa">Ativas</SelectItem>
            <SelectItem value="pausada">Pausadas</SelectItem>
            <SelectItem value="encerrada">Encerradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Vagas */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
        </div>
      ) : vagasFiltradas.length > 0 ? (
        <div className="grid gap-4">
          {vagasFiltradas.map((vaga) => (
            <Card key={vaga.id} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {vaga.titulo}
                      </h3>
                      {getStatusBadge(vaga.status)}
                    </div>

                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {vaga.descricao}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vaga.cidade}, {vaga.estado}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {getFaixaSalarialLabel(vaga.faixa_salarial)}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {vaga.regime.toUpperCase()}
                      </span>
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {vaga.modalidade}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {vaga._count?.propostas || 0} proposta(s)
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModalEdicao(vaga)}
                      className="border-slate-600 text-slate-300"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        {vaga.status !== 'ativa' && (
                          <DropdownMenuItem
                            onClick={() => alterarStatusVaga(vaga, 'ativa')}
                            className="text-green-400 hover:text-green-300 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Ativar
                          </DropdownMenuItem>
                        )}
                        {vaga.status === 'ativa' && (
                          <DropdownMenuItem
                            onClick={() => alterarStatusVaga(vaga, 'pausada')}
                            className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                          >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        {vaga.status !== 'encerrada' && (
                          <DropdownMenuItem
                            onClick={() => alterarStatusVaga(vaga, 'encerrada')}
                            className="text-slate-400 hover:text-slate-300 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Encerrar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setVagaParaExcluir(vaga)}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {busca || filtroStatus !== 'todas'
                ? 'Nenhuma vaga encontrada'
                : 'Você ainda não tem vagas'}
            </h3>
            <p className="text-slate-400 mb-4">
              {busca || filtroStatus !== 'todas'
                ? 'Tente ajustar os filtros'
                : 'Crie sua primeira vaga para começar a receber candidatos'}
            </p>
            {!busca && filtroStatus === 'todas' && (
              <Button
                onClick={abrirModalCriacao}
                className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira vaga
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {vagaEditando ? 'Editar Vaga' : 'Nova Vaga'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Título */}
            <div className="space-y-2">
              <Label className="text-slate-300">Título da vaga *</Label>
              <Input
                placeholder="Ex: Vendedor(a) Externo"
                value={form.titulo}
                onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-slate-300">Descrição *</Label>
              <Textarea
                placeholder="Descreva as atividades e responsabilidades..."
                value={form.descricao}
                onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                rows={4}
                className="bg-slate-700 border-slate-600 text-white resize-none"
              />
            </div>

            {/* Requisitos */}
            <div className="space-y-2">
              <Label className="text-slate-300">Requisitos</Label>
              <Textarea
                placeholder="Liste os requisitos necessários..."
                value={form.requisitos}
                onChange={(e) => setForm(prev => ({ ...prev, requisitos: e.target.value }))}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white resize-none"
              />
            </div>

            {/* Benefícios */}
            <div className="space-y-2">
              <Label className="text-slate-300">Benefícios</Label>
              <Textarea
                placeholder="Liste os benefícios oferecidos..."
                value={form.beneficios}
                onChange={(e) => setForm(prev => ({ ...prev, beneficios: e.target.value }))}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white resize-none"
              />
            </div>

            {/* Grid de selects */}
            <div className="grid grid-cols-2 gap-4">
              {/* Faixa Salarial */}
              <div className="space-y-2">
                <Label className="text-slate-300">Faixa Salarial *</Label>
                <Select
                  value={form.faixa_salarial}
                  onValueChange={(v) => setForm(prev => ({ ...prev, faixa_salarial: v }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAIXAS_SALARIAIS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Regime */}
              <div className="space-y-2">
                <Label className="text-slate-300">Regime de Contratação *</Label>
                <Select
                  value={form.regime}
                  onValueChange={(v) => setForm(prev => ({ ...prev, regime: v }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIMES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modalidade */}
              <div className="space-y-2">
                <Label className="text-slate-300">Modalidade</Label>
                <Select
                  value={form.modalidade}
                  onValueChange={(v) => setForm(prev => ({ ...prev, modalidade: v }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODALIDADES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label className="text-slate-300">Estado</Label>
                <Select
                  value={form.estado}
                  onValueChange={(v) => setForm(prev => ({ ...prev, estado: v, cidade: '' }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cidade */}
            {form.estado && cidades.length > 0 && (
              <div className="space-y-2">
                <Label className="text-slate-300">Cidade</Label>
                <Select
                  value={form.cidade}
                  onValueChange={(v) => setForm(prev => ({ ...prev, cidade: v }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarVaga}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : vagaEditando ? (
                'Salvar alterações'
              ) : (
                'Criar vaga'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!vagaParaExcluir} onOpenChange={() => setVagaParaExcluir(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir vaga?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. A vaga "{vagaParaExcluir?.titulo}" será
              permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirVaga}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
