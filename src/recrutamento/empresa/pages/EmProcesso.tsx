// =====================================================
// EM PROCESSO - Área de Recrutamento VEON
// Propostas em andamento e agendamento de entrevistas
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
} from 'lucide-react';

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

const CUSTO_ENTREVISTA = 25; // R$ 25 para desbloquear contato

export default function EmProcesso() {
  const { toast } = useToast();
  const { empresa, recarregarEmpresa } = useOutletContext<{
    empresa: Empresa | null;
    recarregarEmpresa: () => void;
  }>();

  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tabAtiva, setTabAtiva] = useState('pendentes');

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

  // Modal de visualização de contato
  const [modalContato, setModalContato] = useState(false);
  const [contatoDesbloqueado, setContatoDesbloqueado] = useState<string[]>([]);

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
    const { data } = await supabase
      .from('contatos_desbloqueados')
      .select('candidato_id')
      .eq('empresa_id', empresa?.id);

    if (data) {
      setContatoDesbloqueado(data.map(c => c.candidato_id));
    }
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
      // Verificar se precisa cobrar pelo desbloqueio do contato
      const jaDesbloqueado = contatoDesbloqueado.includes(propostaSelecionada.candidato.id);

      if (!jaDesbloqueado) {
        if (empresa.creditos < CUSTO_ENTREVISTA) {
          toast({
            title: 'Créditos insuficientes',
            description: `Você precisa de R$ ${CUSTO_ENTREVISTA} para agendar a entrevista e desbloquear o contato.`,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        // Debitar créditos
        await supabase
          .from('empresas_recrutamento')
          .update({ creditos: empresa.creditos - CUSTO_ENTREVISTA })
          .eq('id', empresa.id);

        // Registrar desbloqueio
        await supabase
          .from('contatos_desbloqueados')
          .insert({
            empresa_id: empresa.id,
            candidato_id: propostaSelecionada.candidato.id,
          });

        setContatoDesbloqueado(prev => [...prev, propostaSelecionada.candidato.id]);
        recarregarEmpresa();
      }

      // Atualizar proposta
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

      // Notificar candidato
      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: propostaSelecionada.candidato.id,
          titulo: 'Entrevista agendada!',
          mensagem: `${empresa.nome_fantasia} agendou uma entrevista para ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.horario}.`,
          tipo: 'entrevista',
        });

      toast({
        title: 'Entrevista agendada!',
        description: 'O candidato foi notificado sobre a entrevista.',
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

      // Notificar candidato
      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: proposta.candidato.id,
          titulo: 'Proposta cancelada',
          mensagem: `${empresa?.nome_fantasia} cancelou a proposta para a vaga ${proposta.vaga.titulo}.`,
          tipo: 'proposta',
        });

      toast({
        title: 'Proposta cancelada',
        description: 'A proposta foi cancelada.',
      });

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

      // Atualizar status do candidato
      await supabase
        .from('candidatos_recrutamento')
        .update({ status: 'contratado' })
        .eq('id', proposta.candidato.id);

      // Notificar candidato
      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: proposta.candidato.id,
          titulo: 'Parabéns! Você foi contratado!',
          mensagem: `${empresa?.nome_fantasia} registrou sua contratação para a vaga ${proposta.vaga.titulo}.`,
          tipo: 'contratacao',
        });

      toast({
        title: 'Contratação registrada!',
        description: 'O candidato foi marcado como contratado.',
      });

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

  const getCorPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'bg-red-500';
      case 'I': return 'bg-yellow-500';
      case 'S': return 'bg-green-500';
      case 'C': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Aguardando resposta</Badge>;
      case 'aceita':
        return <Badge className="bg-green-500/20 text-green-400">Aceita - Agendar entrevista</Badge>;
      case 'entrevista_agendada':
        return <Badge className="bg-blue-500/20 text-blue-400">Entrevista agendada</Badge>;
      default:
        return null;
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Filtrar propostas
  const propostasFiltradas = propostas.filter(p => {
    const matchBusca = busca === '' ||
      p.candidato.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      p.vaga.titulo.toLowerCase().includes(busca.toLowerCase());

    const matchTab = tabAtiva === 'todas' ||
      (tabAtiva === 'pendentes' && p.status === 'pendente') ||
      (tabAtiva === 'aceitas' && p.status === 'aceita') ||
      (tabAtiva === 'agendadas' && p.status === 'entrevista_agendada');

    return matchBusca && matchTab;
  });

  const contagens = {
    todas: propostas.length,
    pendentes: propostas.filter(p => p.status === 'pendente').length,
    aceitas: propostas.filter(p => p.status === 'aceita').length,
    agendadas: propostas.filter(p => p.status === 'entrevista_agendada').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Em Processo</h1>
        <p className="text-slate-400">Acompanhe suas propostas e entrevistas</p>
      </div>

      {/* Tabs */}
      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="todas" className="data-[state=active]:bg-slate-700">
              Todas ({contagens.todas})
            </TabsTrigger>
            <TabsTrigger value="pendentes" className="data-[state=active]:bg-slate-700">
              Pendentes ({contagens.pendentes})
            </TabsTrigger>
            <TabsTrigger value="aceitas" className="data-[state=active]:bg-slate-700">
              Aceitas ({contagens.aceitas})
            </TabsTrigger>
            <TabsTrigger value="agendadas" className="data-[state=active]:bg-slate-700">
              Agendadas ({contagens.agendadas})
            </TabsTrigger>
          </TabsList>

          {/* Busca */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        <TabsContent value={tabAtiva} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
            </div>
          ) : propostasFiltradas.length > 0 ? (
            <div className="space-y-4">
              {propostasFiltradas.map((proposta) => (
                <Card key={proposta.id} className="bg-slate-800/60 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Info do candidato */}
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={proposta.candidato.foto_url || undefined} />
                            <AvatarFallback className="bg-slate-600 text-white">
                              {proposta.candidato.nome_completo.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {proposta.candidato.perfil_disc && (
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getCorPerfil(proposta.candidato.perfil_disc)} flex items-center justify-center text-xs font-bold text-white`}>
                              {proposta.candidato.perfil_disc}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">
                              {proposta.candidato.nome_completo}
                            </h3>
                            {getStatusBadge(proposta.status)}
                          </div>

                          <p className="text-sm text-slate-400 flex items-center mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {proposta.candidato.cidade}, {proposta.candidato.estado}
                          </p>

                          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                            <span className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {proposta.vaga.titulo}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatarMoeda(proposta.salario_oferecido)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Enviada em {formatarData(proposta.created_at)}
                            </span>
                          </div>

                          {/* Info da entrevista */}
                          {proposta.status === 'entrevista_agendada' && proposta.data_entrevista && (
                            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <p className="text-blue-400 font-medium flex items-center">
                                <CalendarDays className="w-4 h-4 mr-2" />
                                Entrevista: {formatarData(proposta.data_entrevista)} às {proposta.horario_entrevista}
                              </p>
                              <p className="text-sm text-blue-400/70 mt-1">
                                {proposta.tipo_entrevista === 'presencial' ? (
                                  <>Local: {proposta.local_entrevista}</>
                                ) : proposta.tipo_entrevista === 'video' ? (
                                  <>Vídeo chamada: {proposta.link_entrevista}</>
                                ) : (
                                  <>Ligação telefônica</>
                                )}
                              </p>
                            </div>
                          )}

                          {/* Contato desbloqueado */}
                          {contatoDesbloqueado.includes(proposta.candidato.id) && (
                            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <p className="text-green-400 font-medium text-sm mb-1">Contato desbloqueado:</p>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <span className="text-green-300 flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {proposta.candidato.telefone}
                                </span>
                                <span className="text-green-300 flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {proposta.candidato.email}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-wrap gap-2">
                        {proposta.status === 'aceita' && (
                          <Button
                            onClick={() => abrirModalAgendamento(proposta)}
                            className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Agendar Entrevista
                          </Button>
                        )}

                        {proposta.status === 'entrevista_agendada' && (
                          <>
                            <Button
                              onClick={() => abrirModalAgendamento(proposta)}
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Reagendar
                            </Button>
                            <Button
                              onClick={() => marcarComoContratado(proposta)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Contratar
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          onClick={() => cancelarProposta(proposta)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma proposta encontrada
                </h3>
                <p className="text-slate-400">
                  {busca
                    ? 'Tente ajustar sua busca'
                    : tabAtiva === 'pendentes'
                    ? 'Você não tem propostas aguardando resposta'
                    : tabAtiva === 'aceitas'
                    ? 'Nenhuma proposta aceita aguardando agendamento'
                    : tabAtiva === 'agendadas'
                    ? 'Nenhuma entrevista agendada'
                    : 'Envie propostas para candidatos para vê-los aqui'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Agendamento */}
      <Dialog open={modalAgendamento} onOpenChange={setModalAgendamento}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Agendar Entrevista
            </DialogTitle>
          </DialogHeader>

          {propostaSelecionada && (
            <div className="space-y-4 py-4">
              {/* Info do candidato */}
              <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                <Avatar>
                  <AvatarImage src={propostaSelecionada.candidato.foto_url || undefined} />
                  <AvatarFallback className="bg-slate-600">
                    {propostaSelecionada.candidato.nome_completo.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">
                    {propostaSelecionada.candidato.nome_completo}
                  </p>
                  <p className="text-sm text-slate-400">
                    {propostaSelecionada.vaga.titulo}
                  </p>
                </div>
              </div>

              {/* Aviso de custo */}
              {!contatoDesbloqueado.includes(propostaSelecionada.candidato.id) && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 font-medium">
                        Custo: R$ {CUSTO_ENTREVISTA},00
                      </p>
                      <p className="text-sm text-yellow-400/70">
                        Ao agendar, você desbloqueará o telefone e email do candidato.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Data *</Label>
                  <Input
                    type="date"
                    value={agendamento.data}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, data: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Horário *</Label>
                  <Input
                    type="time"
                    value={agendamento.horario}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, horario: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Tipo de entrevista */}
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de entrevista</Label>
                <Select
                  value={agendamento.tipo}
                  onValueChange={(v) => setAgendamento(prev => ({ ...prev, tipo: v }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <Label className="text-slate-300">Endereço</Label>
                  <Input
                    placeholder="Endereço da entrevista"
                    value={agendamento.local}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, local: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              )}

              {agendamento.tipo === 'video' && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Link da reunião</Label>
                  <Input
                    placeholder="https://meet.google.com/..."
                    value={agendamento.link}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, link: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalAgendamento(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarAgendamento}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
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
