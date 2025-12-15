// =====================================================
// EM PROCESSO - Estilo Rede Social Mobile-First
// Feed de propostas + Agendamento de entrevistas
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  MessageSquare,
  Video,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Briefcase,
  AlertCircle,
  Eye,
  CalendarDays,
  MoreVertical,
  X,
  Play,
  Mail,
} from 'lucide-react';
// CurriculoCompletoModal removido - agora usa página dedicada

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
}

interface Proposta {
  id: string;
  status: string;
  salario_oferecido: number;
  mensagem: string;
  created_at: string;
  data_entrevista: string | null;
  horario_entrevista: string | null;
  tipo_entrevista: string | null;
  local_entrevista: string | null;
  link_entrevista: string | null;
  candidato: {
    id: string;
    nome_completo: string;
    foto_url: string | null;
    cidade: string;
    estado: string;
    telefone: string;
    email: string;
    perfil_disc: string | null;
  };
  vaga: {
    id: string;
    titulo: string;
  };
}

const CUSTO_ENTREVISTA = 25;

// Cores DISC
const DISC_COLORS: Record<string, { bg: string; text: string }> = {
  D: { bg: 'bg-red-500', text: 'text-red-400' },
  I: { bg: 'bg-yellow-500', text: 'text-yellow-400' },
  S: { bg: 'bg-green-500', text: 'text-green-400' },
  C: { bg: 'bg-blue-500', text: 'text-blue-400' },
};

export default function EmProcesso() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { empresa, recarregarEmpresa } = useOutletContext<{
    empresa: Empresa | null;
    recarregarEmpresa: () => void;
  }>();

  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');

  // Modal de agendamento
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(null);
  const [agendamento, setAgendamento] = useState({
    data: '',
    horario: '',
    tipo: 'presencial',
    local: '',
    link: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sheet de ações
  const [sheetAcoesAberto, setSheetAcoesAberto] = useState(false);

  // Contatos desbloqueados
  const [contatoDesbloqueado, setContatoDesbloqueado] = useState<string[]>([]);

  // Função para abrir currículo - agora navega para página dedicada
  const abrirCurriculo = (candidatoId: string) => {
    navigate(`/recrutamento/empresa/candidato/${candidatoId}`);
  };

  useEffect(() => {
    if (empresa?.id) {
      carregarPropostas();
      carregarContatosDesbloqueados();
    }
  }, [empresa?.id]);

  const carregarPropostas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('propostas_recrutamento')
        .select(`
          *,
          candidato:candidatos_recrutamento (
            id, nome_completo, foto_url, cidade, estado, telefone, email, perfil_disc
          ),
          vaga:vagas_recrutamento (id, titulo)
        `)
        .eq('empresa_id', empresa?.id)
        .in('status', ['pendente', 'aceita', 'entrevista_agendada'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPropostas(data || []);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as propostas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const carregarContatosDesbloqueados = async () => {
    setContatoDesbloqueado([]);
  };

  const abrirModalAgendamento = (proposta: Proposta) => {
    setPropostaSelecionada(proposta);
    setAgendamento({
      data: proposta.data_entrevista || '',
      horario: proposta.horario_entrevista || '',
      tipo: proposta.tipo_entrevista || 'presencial',
      local: proposta.local_entrevista || '',
      link: proposta.link_entrevista || '',
    });
    setSheetAcoesAberto(false);
    setModalAgendamento(true);
  };

  const salvarAgendamento = async () => {
    if (!propostaSelecionada || !empresa) return;

    if (!agendamento.data || !agendamento.horario) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe a data e horário da entrevista.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const jaDesbloqueado = contatoDesbloqueado.includes(propostaSelecionada.candidato.id);

      if (!jaDesbloqueado) {
        if (empresa.creditos < CUSTO_ENTREVISTA) {
          toast({
            title: 'Créditos insuficientes',
            description: `Você precisa de R$ ${CUSTO_ENTREVISTA} para agendar a entrevista.`,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        await supabase
          .from('empresas_recrutamento')
          .update({ creditos: empresa.creditos - CUSTO_ENTREVISTA })
          .eq('id', empresa.id);

        setContatoDesbloqueado(prev => [...prev, propostaSelecionada.candidato.id]);
        recarregarEmpresa();
      }

      const { error } = await supabase
        .from('propostas_recrutamento')
        .update({
          status: 'entrevista_agendada',
          data_entrevista: agendamento.data,
          horario_entrevista: agendamento.horario,
          tipo_entrevista: agendamento.tipo,
          local_entrevista: agendamento.local || null,
          link_entrevista: agendamento.link || null,
        })
        .eq('id', propostaSelecionada.id);

      if (error) throw error;

      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: propostaSelecionada.candidato.id,
          titulo: 'Entrevista agendada!',
          mensagem: `${empresa.nome_fantasia} agendou uma entrevista para ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.horario}.`,
          tipo_notificacao: 'entrevista',
        });

      toast({
        title: 'Entrevista agendada!',
        description: 'O candidato foi notificado.',
      });

      setModalAgendamento(false);
      carregarPropostas();
    } catch (error) {
      console.error('Erro ao agendar:', error);
      toast({
        title: 'Erro ao agendar',
        description: 'Não foi possível agendar a entrevista.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelarProposta = async (proposta: Proposta) => {
    try {
      const { error } = await supabase
        .from('propostas_recrutamento')
        .update({ status: 'cancelada' })
        .eq('id', proposta.id);

      if (error) throw error;

      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: proposta.candidato.id,
          titulo: 'Proposta cancelada',
          mensagem: `${empresa?.nome_fantasia} cancelou a proposta para a vaga ${proposta.vaga.titulo}.`,
          tipo_notificacao: 'proposta',
        });

      toast({
        title: 'Proposta cancelada',
        description: 'A proposta foi cancelada.',
      });

      setSheetAcoesAberto(false);
      carregarPropostas();
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a proposta.',
        variant: 'destructive',
      });
    }
  };

  const marcarComoContratado = async (proposta: Proposta) => {
    try {
      const { error } = await supabase
        .from('propostas_recrutamento')
        .update({ status: 'contratado' })
        .eq('id', proposta.id);

      if (error) throw error;

      await supabase
        .from('candidatos_recrutamento')
        .update({ status: 'contratado' })
        .eq('id', proposta.candidato.id);

      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: proposta.candidato.id,
          titulo: 'Parabéns! Você foi contratado!',
          mensagem: `${empresa?.nome_fantasia} registrou sua contratação para a vaga ${proposta.vaga.titulo}.`,
          tipo_notificacao: 'contratacao',
        });

      toast({
        title: 'Contratação registrada!',
        description: 'O profissional foi marcado como contratado.',
      });

      setSheetAcoesAberto(false);
      carregarPropostas();
    } catch (error) {
      console.error('Erro ao contratar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a contratação.',
        variant: 'destructive',
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Aguardando', icon: Clock };
      case 'aceita':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Aceita', icon: CheckCircle };
      case 'entrevista_agendada':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Entrevista', icon: CalendarDays };
      default:
        return { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: status, icon: Clock };
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Filtrar propostas
  const propostasFiltradas = propostas.filter(p => {
    const matchBusca = busca === '' ||
      p.candidato.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      p.vaga.titulo.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todas' ||
      (filtroStatus === 'pendentes' && p.status === 'pendente') ||
      (filtroStatus === 'aceitas' && p.status === 'aceita') ||
      (filtroStatus === 'agendadas' && p.status === 'entrevista_agendada');

    return matchBusca && matchStatus;
  });

  const stats = {
    total: propostas.length,
    pendentes: propostas.filter(p => p.status === 'pendente').length,
    aceitas: propostas.filter(p => p.status === 'aceita').length,
    agendadas: propostas.filter(p => p.status === 'entrevista_agendada').length,
  };

  return (
    <div className="max-w-lg mx-auto -mx-4 sm:mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">Em Processo</h1>
          <p className="text-sm text-zinc-500">Propostas e entrevistas</p>
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
            onClick={() => setFiltroStatus('pendentes')}
            className={`p-2.5 rounded-xl text-center transition-all ${
              filtroStatus === 'pendentes' ? 'bg-yellow-500 text-black' : 'bg-zinc-900'
            }`}
          >
            <p className={`text-lg font-bold ${filtroStatus === 'pendentes' ? 'text-black' : 'text-yellow-400'}`}>{stats.pendentes}</p>
            <p className={`text-[10px] ${filtroStatus === 'pendentes' ? 'text-black/70' : 'text-zinc-500'}`}>Aguard.</p>
          </button>
          <button
            onClick={() => setFiltroStatus('aceitas')}
            className={`p-2.5 rounded-xl text-center transition-all ${
              filtroStatus === 'aceitas' ? 'bg-emerald-500 text-white' : 'bg-zinc-900'
            }`}
          >
            <p className={`text-lg font-bold ${filtroStatus === 'aceitas' ? 'text-white' : 'text-emerald-400'}`}>{stats.aceitas}</p>
            <p className={`text-[10px] ${filtroStatus === 'aceitas' ? 'text-white/70' : 'text-zinc-500'}`}>Aceitas</p>
          </button>
          <button
            onClick={() => setFiltroStatus('agendadas')}
            className={`p-2.5 rounded-xl text-center transition-all ${
              filtroStatus === 'agendadas' ? 'bg-blue-500 text-white' : 'bg-zinc-900'
            }`}
          >
            <p className={`text-lg font-bold ${filtroStatus === 'agendadas' ? 'text-white' : 'text-blue-400'}`}>{stats.agendadas}</p>
            <p className={`text-[10px] ${filtroStatus === 'agendadas' ? 'text-white/70' : 'text-zinc-500'}`}>Entrev.</p>
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar candidato ou vaga..."
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

      {/* Lista de Propostas */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
        </div>
      ) : propostasFiltradas.length > 0 ? (
        <div className="px-4 py-4 space-y-3">
          {propostasFiltradas.map((proposta) => {
            const statusConfig = getStatusConfig(proposta.status);
            const StatusIcon = statusConfig.icon;
            const discColor = proposta.candidato.perfil_disc ? DISC_COLORS[proposta.candidato.perfil_disc] : null;

            return (
              <div
                key={proposta.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Header do Card */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-white/10">
                        <AvatarImage src={proposta.candidato.foto_url || undefined} />
                        <AvatarFallback className="bg-zinc-700 text-white font-bold">
                          {(proposta.candidato.nome_completo || 'P').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {proposta.candidato.perfil_disc && discColor && (
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${discColor.bg} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-zinc-900`}>
                          {proposta.candidato.perfil_disc}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {proposta.candidato.nome_completo}
                        </h3>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} text-[10px] px-2 py-0.5`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        {proposta.candidato.cidade}, {proposta.candidato.estado}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirCurriculo(proposta.candidato.id)}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Ver currículo completo"
                      >
                        <Eye className="w-5 h-5 text-zinc-400 hover:text-white" />
                      </button>
                      <button
                        onClick={() => {
                          setPropostaSelecionada(proposta);
                          setSheetAcoesAberto(true);
                        }}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-zinc-400" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[11px]">
                      <Briefcase className="w-3 h-3" />
                      {proposta.vaga.titulo}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                      <DollarSign className="w-3 h-3" />
                      {formatarMoeda(proposta.salario_oferecido)}
                    </span>
                  </div>

                  {/* Info da entrevista */}
                  {proposta.status === 'entrevista_agendada' && proposta.data_entrevista && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-3">
                      <p className="text-blue-400 font-medium text-sm flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {formatarData(proposta.data_entrevista)} às {proposta.horario_entrevista}
                      </p>
                      <p className="text-xs text-blue-400/70 mt-1 ml-6">
                        {proposta.tipo_entrevista === 'presencial' ? (
                          <>Local: {proposta.local_entrevista}</>
                        ) : proposta.tipo_entrevista === 'video' ? (
                          <>Vídeo chamada</>
                        ) : (
                          <>Ligação telefônica</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Contato desbloqueado */}
                  {contatoDesbloqueado.includes(proposta.candidato.id) && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <p className="text-emerald-400 font-medium text-xs mb-2">Contato:</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <a href={`tel:${proposta.candidato.telefone}`} className="text-emerald-300 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {proposta.candidato.telefone}
                        </a>
                        <a href={`mailto:${proposta.candidato.email}`} className="text-emerald-300 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {proposta.candidato.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer do Card */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatarData(proposta.created_at)}
                  </span>
                  {proposta.status === 'aceita' && (
                    <Button
                      size="sm"
                      onClick={() => abrirModalAgendamento(proposta)}
                      className="h-8 bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-lg text-xs"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Agendar
                    </Button>
                  )}
                  {proposta.status === 'entrevista_agendada' && (
                    <Button
                      size="sm"
                      onClick={() => marcarComoContratado(proposta)}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Contratar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
            <Users className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Nenhuma proposta encontrada
          </h3>
          <p className="text-zinc-400 text-sm">
            {busca
              ? 'Tente ajustar sua busca'
              : 'Envie propostas para profissionais para vê-los aqui'}
          </p>
        </div>
      )}

      {/* Sheet de Ações */}
      <Sheet open={sheetAcoesAberto} onOpenChange={setSheetAcoesAberto}>
        <SheetContent side="bottom" className="bg-black border-t border-zinc-800 rounded-t-3xl p-0">
          {propostaSelecionada && (
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={propostaSelecionada.candidato.foto_url || undefined} />
                  <AvatarFallback className="bg-zinc-700 text-white font-bold">
                    {(propostaSelecionada.candidato.nome_completo || 'P').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{propostaSelecionada.candidato.nome_completo || 'Profissional'}</h3>
                  <p className="text-zinc-500 text-sm">{propostaSelecionada.vaga.titulo}</p>
                </div>
              </div>

              {/* Ações */}
              <div className="py-4 space-y-2">
                {propostaSelecionada.status === 'aceita' && (
                  <button
                    onClick={() => abrirModalAgendamento(propostaSelecionada)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Agendar entrevista</p>
                      <p className="text-zinc-500 text-sm">R$ {CUSTO_ENTREVISTA} para desbloquear contato</p>
                    </div>
                  </button>
                )}

                {propostaSelecionada.status === 'entrevista_agendada' && (
                  <>
                    <button
                      onClick={() => abrirModalAgendamento(propostaSelecionada)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Reagendar entrevista</p>
                        <p className="text-zinc-500 text-sm">Alterar data e horário</p>
                      </div>
                    </button>

                    <button
                      onClick={() => marcarComoContratado(propostaSelecionada)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Marcar como contratado</p>
                        <p className="text-zinc-500 text-sm">Registrar contratação</p>
                      </div>
                    </button>
                  </>
                )}

                <button
                  onClick={() => cancelarProposta(propostaSelecionada)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-400 font-medium">Cancelar proposta</p>
                    <p className="text-zinc-500 text-sm">Encerrar processo</p>
                  </div>
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setSheetAcoesAberto(false)}
                className="w-full h-12 border-zinc-800 text-white rounded-xl"
              >
                Fechar
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Agendamento */}
      <Dialog open={modalAgendamento} onOpenChange={setModalAgendamento}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-black border-zinc-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Agendar Entrevista</DialogTitle>
          </DialogHeader>

          {propostaSelecionada && (
            <div className="space-y-4 py-4">
              {/* Info do candidato */}
              <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={propostaSelecionada.candidato.foto_url || undefined} />
                  <AvatarFallback className="bg-zinc-700 text-white">
                    {(propostaSelecionada.candidato.nome_completo || 'P').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium text-sm">
                    {propostaSelecionada.candidato.nome_completo || 'Profissional'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {propostaSelecionada.vaga.titulo}
                  </p>
                </div>
              </div>

              {/* Aviso de custo */}
              {!contatoDesbloqueado.includes(propostaSelecionada.candidato.id) && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 font-medium text-sm">
                        Custo: R$ {CUSTO_ENTREVISTA},00
                      </p>
                      <p className="text-xs text-yellow-400/70">
                        Você desbloqueará o telefone e email do profissional.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Data *</Label>
                  <Input
                    type="date"
                    value={agendamento.data}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, data: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-sm">Horário *</Label>
                  <Input
                    type="time"
                    value={agendamento.horario}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, horario: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Tipo de entrevista */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Tipo de entrevista</Label>
                <Select
                  value={agendamento.tipo}
                  onValueChange={(v) => setAgendamento(prev => ({ ...prev, tipo: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="presencial">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Presencial
                      </span>
                    </SelectItem>
                    <SelectItem value="video">
                      <span className="flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Vídeo chamada
                      </span>
                    </SelectItem>
                    <SelectItem value="telefone">
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Telefone
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Local ou Link */}
              {agendamento.tipo === 'presencial' && (
                <div className="space-y-2">
                  <Label className="text-white text-sm">Endereço</Label>
                  <Input
                    placeholder="Endereço da entrevista"
                    value={agendamento.local}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, local: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                  />
                </div>
              )}

              {agendamento.tipo === 'video' && (
                <div className="space-y-2">
                  <Label className="text-white text-sm">Link da reunião</Label>
                  <Input
                    placeholder="https://meet.google.com/..."
                    value={agendamento.link}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, link: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalAgendamento(false)}
              className="border-zinc-800 text-white rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarAgendamento}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-xl"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
