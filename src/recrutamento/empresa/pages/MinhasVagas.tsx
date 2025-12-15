// =====================================================
// MINHAS VAGAS - Estilo Rede Social Mobile-First
// Feed de vagas com cards estilo post + Quick actions
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
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
  Play,
  Pause,
  ChevronRight,
  Filter,
  X,
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
  descricao: string | null;
  requisitos: string[] | null;
  beneficios: string[] | null;
  faixa_salarial: string | null;
  regime: string | null;
  cidade: string | null;
  estado: string | null;
  modalidade: string | null;
  status: string | null;
  created_at: string | null;
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
  const navigate = useNavigate();
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

  // Sheet de ações
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [sheetAcoesAberto, setSheetAcoesAberto] = useState(false);

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

      setVagas(vagasComContagem as Vaga[]);
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
      descricao: vaga.descricao || '',
      requisitos: Array.isArray(vaga.requisitos) ? vaga.requisitos.join(', ') : (vaga.requisitos || ''),
      beneficios: Array.isArray(vaga.beneficios) ? vaga.beneficios.join(', ') : (vaga.beneficios || ''),
      faixa_salarial: vaga.faixa_salarial || '',
      regime: vaga.regime || '',
      cidade: vaga.cidade || '',
      estado: vaga.estado || '',
      modalidade: vaga.modalidade || '',
    });
    setSheetAcoesAberto(false);
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
      const vagaData = {
        titulo: form.titulo,
        descricao: form.descricao,
        faixa_salarial: form.faixa_salarial,
        regime: form.regime,
        cidade: form.cidade,
        estado: form.estado,
        modalidade: form.modalidade,
      };

      if (vagaEditando) {
        // Atualizar vaga existente
        const { error } = await supabase
          .from('vagas_recrutamento')
          .update(vagaData)
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
            ...vagaData,
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

      setSheetAcoesAberto(false);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ativa':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Ativa', icon: CheckCircle };
      case 'pausada':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pausada', icon: Pause };
      case 'encerrada':
        return { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Encerrada', icon: XCircle };
      default:
        return { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: status, icon: FileText };
    }
  };

  const formatarData = (data: string) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Filtrar vagas
  const vagasFiltradas = vagas.filter(vaga => {
    const matchBusca = busca === '' ||
      vaga.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (vaga.descricao?.toLowerCase() || '').includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todas' || vaga.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  // Stats
  const stats = {
    total: vagas.length,
    ativas: vagas.filter(v => v.status === 'ativa').length,
    pausadas: vagas.filter(v => v.status === 'pausada').length,
    propostas: vagas.reduce((acc, v) => acc + (v._count?.propostas || 0), 0),
  };

  return (
    <div className="max-w-lg mx-auto -mx-4 sm:mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Minhas Vagas</h1>
            <p className="text-sm text-zinc-500">Gerencie suas oportunidades</p>
          </div>
          <Button
            onClick={abrirModalCriacao}
            className="h-10 bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova
          </Button>
        </div>

        {/* Stats compactos */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setFiltroStatus('todas')}
            className={`p-2.5 rounded-xl text-center transition-all ${
              filtroStatus === 'todas' ? 'bg-white text-black' : 'bg-zinc-900 text-white'
            }`}
          >
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-[10px] opacity-70">Total</p>
          </button>
          <button
            onClick={() => setFiltroStatus('ativa')}
            className={`p-2.5 rounded-xl text-center transition-all ${
              filtroStatus === 'ativa' ? 'bg-emerald-500 text-white' : 'bg-zinc-900'
            }`}
          >
            <p className={`text-lg font-bold ${filtroStatus === 'ativa' ? 'text-white' : 'text-emerald-400'}`}>{stats.ativas}</p>
            <p className={`text-[10px] ${filtroStatus === 'ativa' ? 'text-white/70' : 'text-zinc-500'}`}>Ativas</p>
          </button>
          <button
            onClick={() => setFiltroStatus('pausada')}
            className={`p-2.5 rounded-xl text-center transition-all ${
              filtroStatus === 'pausada' ? 'bg-yellow-500 text-black' : 'bg-zinc-900'
            }`}
          >
            <p className={`text-lg font-bold ${filtroStatus === 'pausada' ? 'text-black' : 'text-yellow-400'}`}>{stats.pausadas}</p>
            <p className={`text-[10px] ${filtroStatus === 'pausada' ? 'text-black/70' : 'text-zinc-500'}`}>Pausadas</p>
          </button>
          <div className="bg-zinc-900 p-2.5 rounded-xl text-center">
            <p className="text-lg font-bold text-blue-400">{stats.propostas}</p>
            <p className="text-[10px] text-zinc-500">Propostas</p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar vagas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 h-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl text-sm"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Vagas */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
        </div>
      ) : vagasFiltradas.length > 0 ? (
        <div className="px-4 py-4 space-y-3">
          {vagasFiltradas.map((vaga) => {
            const statusConfig = getStatusConfig(vaga.status || 'ativa');
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={vaga.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Header do Card */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {vaga.titulo}
                        </h3>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} text-[10px] px-2 py-0.5`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      {vaga.cidade && vaga.estado && (
                        <div className="flex items-center gap-1 text-zinc-500 text-xs">
                          <MapPin className="w-3 h-3" />
                          {vaga.cidade}, {vaga.estado}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setVagaSelecionada(vaga);
                        setSheetAcoesAberto(true);
                      }}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>

                  {vaga.descricao && (
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                      {vaga.descricao}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {vaga.faixa_salarial && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                        <DollarSign className="w-3 h-3" />
                        {getFaixaSalarialLabel(vaga.faixa_salarial)}
                      </span>
                    )}
                    {vaga.regime && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-medium">
                        <Briefcase className="w-3 h-3" />
                        {vaga.regime.toUpperCase()}
                      </span>
                    )}
                    {vaga.modalidade && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[11px]">
                        <Building2 className="w-3 h-3 mr-1" />
                        {vaga.modalidade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {vaga._count?.propostas || 0} proposta{(vaga._count?.propostas || 0) !== 1 ? 's' : ''}
                    </span>
                    {vaga.created_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatarData(vaga.created_at)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => abrirModalEdicao(vaga)}
                    className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
            <FileText className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            {busca || filtroStatus !== 'todas'
              ? 'Nenhuma vaga encontrada'
              : 'Você ainda não tem vagas'}
          </h3>
          <p className="text-zinc-400 text-sm mb-6">
            {busca || filtroStatus !== 'todas'
              ? 'Tente ajustar os filtros'
              : 'Crie sua primeira vaga para começar a receber candidatos'}
          </p>
          {!busca && filtroStatus === 'todas' && (
            <Button
              onClick={abrirModalCriacao}
              className="bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Criar primeira vaga
            </Button>
          )}
        </div>
      )}

      {/* Sheet de Ações */}
      <Sheet open={sheetAcoesAberto} onOpenChange={setSheetAcoesAberto}>
        <SheetContent side="bottom" className="bg-black border-t border-zinc-800 rounded-t-3xl p-0">
          {vagaSelecionada && (
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#003DA5] flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{vagaSelecionada.titulo}</h3>
                  <p className="text-zinc-500 text-sm">
                    {vagaSelecionada._count?.propostas || 0} proposta{(vagaSelecionada._count?.propostas || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="py-4 space-y-2">
                <button
                  onClick={() => abrirModalEdicao(vagaSelecionada)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Edit className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Editar vaga</p>
                    <p className="text-zinc-500 text-sm">Alterar informações</p>
                  </div>
                </button>

                {vagaSelecionada.status !== 'ativa' && (
                  <button
                    onClick={() => alterarStatusVaga(vagaSelecionada, 'ativa')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Play className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Ativar vaga</p>
                      <p className="text-zinc-500 text-sm">Tornar visível para candidatos</p>
                    </div>
                  </button>
                )}

                {vagaSelecionada.status === 'ativa' && (
                  <button
                    onClick={() => alterarStatusVaga(vagaSelecionada, 'pausada')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Pause className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Pausar vaga</p>
                      <p className="text-zinc-500 text-sm">Ocultar temporariamente</p>
                    </div>
                  </button>
                )}

                {vagaSelecionada.status !== 'encerrada' && (
                  <button
                    onClick={() => alterarStatusVaga(vagaSelecionada, 'encerrada')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Encerrar vaga</p>
                      <p className="text-zinc-500 text-sm">Finalizar processo seletivo</p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setVagaParaExcluir(vagaSelecionada);
                    setSheetAcoesAberto(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-400 font-medium">Excluir vaga</p>
                    <p className="text-zinc-500 text-sm">Remover permanentemente</p>
                  </div>
                </button>
              </div>

              {/* Cancelar */}
              <Button
                variant="outline"
                onClick={() => setSheetAcoesAberto(false)}
                className="w-full h-12 border-zinc-800 text-white rounded-xl"
              >
                Cancelar
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Criação/Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-black border-zinc-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {vagaEditando ? 'Editar Vaga' : 'Nova Vaga'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Título */}
            <div className="space-y-2">
              <Label className="text-white">Título da vaga *</Label>
              <Input
                placeholder="Ex: Vendedor(a) Externo"
                value={form.titulo}
                onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-white">Descrição *</Label>
              <Textarea
                placeholder="Descreva as atividades e responsabilidades..."
                value={form.descricao}
                onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                rows={4}
                className="bg-zinc-900 border-zinc-800 text-white resize-none rounded-xl"
              />
            </div>

            {/* Grid de selects */}
            <div className="grid grid-cols-2 gap-3">
              {/* Faixa Salarial */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Salário *</Label>
                <Select
                  value={form.faixa_salarial}
                  onValueChange={(v) => setForm(prev => ({ ...prev, faixa_salarial: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {FAIXAS_SALARIAIS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Regime */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Regime *</Label>
                <Select
                  value={form.regime}
                  onValueChange={(v) => setForm(prev => ({ ...prev, regime: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {REGIMES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modalidade */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Modalidade</Label>
                <Select
                  value={form.modalidade}
                  onValueChange={(v) => setForm(prev => ({ ...prev, modalidade: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {MODALIDADES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Estado</Label>
                <Select
                  value={form.estado}
                  onValueChange={(v) => setForm(prev => ({ ...prev, estado: v, cidade: '' }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
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
                <Label className="text-white text-sm">Cidade</Label>
                <Select
                  value={form.cidade}
                  onValueChange={(v) => setForm(prev => ({ ...prev, cidade: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              className="border-zinc-800 text-white rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarVaga}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-xl"
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
        <AlertDialogContent className="bg-black border-zinc-800 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir vaga?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta ação não pode ser desfeita. A vaga "{vagaParaExcluir?.titulo}" será
              permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirVaga}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
