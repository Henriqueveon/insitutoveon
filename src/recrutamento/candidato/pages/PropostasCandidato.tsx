// =====================================================
// PROPOSTAS CANDIDATO - Área de Recrutamento VEON
// Visualização e aceite/recusa de propostas
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  PartyPopper,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  ExternalLink,
  QrCode,
  Copy,
  Loader2,
  AlertCircle,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  status: string;
}

interface Proposta {
  id: string;
  status: string;
  salario_oferecido: number | null;
  mensagem: string | null;
  created_at: string;
  data_entrevista: string | null;
  horario_entrevista: string | null;
  tipo_entrevista: string | null;
  local_entrevista: string | null;
  link_entrevista: string | null;
  empresa: {
    id: string;
    nome_fantasia: string | null;
    razao_social: string;
    socio_telefone: string;
    socio_email: string;
    cidade: string | null;
    estado: string | null;
  } | null;
  vaga: {
    id: string;
    titulo: string;
    faixa_salarial: string | null;
    regime: string | null;
    modalidade: string | null;
    cidade: string | null;
    estado: string | null;
  } | null;
}

const CUSTO_ACEITE = 9.90;

const MOTIVOS_RECUSA = [
  { value: 'sem_interesse', label: 'Não tenho interesse nessa vaga' },
  { value: 'salario_baixo', label: 'Salário abaixo da minha expectativa' },
  { value: 'local_longe', label: 'Local muito longe' },
  { value: 'sem_dinheiro', label: 'Estou sem dinheiro no momento' },
  { value: 'indisponivel', label: 'Não estou disponível para o mercado agora' },
  { value: 'outro', label: 'Outro motivo' },
];

export default function PropostasCandidato() {
  const { toast } = useToast();
  const { candidato, recarregarCandidato } = useOutletContext<{
    candidato: Candidato | null;
    recarregarCandidato: () => void;
  }>();

  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState('novas');

  // Modal de pagamento
  const [modalPagamento, setModalPagamento] = useState(false);
  const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [pagamentoAprovado, setPagamentoAprovado] = useState(false);

  // Modal de recusa
  const [modalRecusa, setModalRecusa] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [outroMotivo, setOutroMotivo] = useState('');

  // Dialog de contratação
  const [dialogContratacao, setDialogContratacao] = useState(false);
  const [propostaContratacao, setPropostaContratacao] = useState<Proposta | null>(null);

  useEffect(() => {
    if (candidato?.id) {
      carregarPropostas();
    }
  }, [candidato?.id]);

  const carregarPropostas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('propostas_recrutamento')
        .select(`
          *,
          empresa:empresas_recrutamento (
            id, nome_fantasia, razao_social, socio_telefone, socio_email, cidade, estado
          ),
          vaga:vagas_recrutamento (
            id, titulo, faixa_salarial, regime, modalidade, cidade, estado
          )
        `)
        .eq('candidato_id', candidato?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPropostas((data as unknown as Proposta[]) || []);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar suas propostas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const iniciarAceite = (proposta: Proposta) => {
    setPropostaSelecionada(proposta);
    setPagamentoAprovado(false);
    setProcessandoPagamento(false);

    // Gerar código PIX válido (EMV format)
    // NOTA: Em produção, usar API de gateway de pagamento (Mercado Pago, PagSeguro, etc.)
    const chavePix = 'pagamentos@institutoveon.com.br'; // Chave PIX da empresa
    const valor = CUSTO_ACEITE.toFixed(2);
    const txid = `VEON${Date.now().toString(36).toUpperCase()}`;

    // Formato EMV simplificado para PIX Copia e Cola
    const pixPayload = [
      '00020126', // Payload Format Indicator
      `58${String(chavePix.length).padStart(2, '0')}0014BR.GOV.BCB.PIX01${String(chavePix.length).padStart(2, '0')}${chavePix}`,
      '52040000', // Merchant Category Code
      '5303986', // Transaction Currency (986 = BRL)
      `54${String(valor.length).padStart(2, '0')}${valor}`, // Transaction Amount
      '5802BR', // Country Code
      '5925INSTITUTO VEON LTDA', // Merchant Name
      '6009SAO PAULO', // Merchant City
      `62${String(txid.length + 4).padStart(2, '0')}05${String(txid.length).padStart(2, '0')}${txid}`, // Additional Data (TXID)
      '6304', // CRC placeholder
    ].join('');

    // Calcular CRC16-CCITT (simplificado - em produção usar biblioteca)
    const crc = 'A1B2'; // CRC placeholder - em produção calcular corretamente
    const codigoPix = pixPayload + crc;

    setPixCopiaECola(codigoPix);
    setModalPagamento(true);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    toast({
      title: 'Copiado!',
      description: 'Código PIX copiado.',
    });
  };

  const confirmarPagamento = async () => {
    if (!propostaSelecionada || !candidato) return;

    setProcessandoPagamento(true);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // Atualizar proposta para aceita
      const { error } = await supabase
        .from('propostas_recrutamento')
        .update({ status: 'aceita' })
        .eq('id', propostaSelecionada.id);

      if (error) throw error;

      // Registrar transação
      await supabase
        .from('transacoes_recrutamento')
        .insert({
          usuario_id: candidato.id,
          tipo: 'candidato',
          valor: CUSTO_ACEITE,
          tipo_transacao: 'pagamento',
          status: 'aprovado',
        });

      // Notificar empresa
      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'empresa',
          destinatario_id: propostaSelecionada.empresa?.id || '',
          titulo: `${candidato.nome_completo} aceitou sua proposta!`,
          mensagem: `O candidato aceitou a proposta para a vaga ${propostaSelecionada.vaga?.titulo || 'N/A'}. Seus dados de contato foram liberados.`,
          tipo_notificacao: 'proposta_aceita',
        });

      setPagamentoAprovado(true);
      carregarPropostas();

      toast({
        title: 'Proposta aceita!',
        description: 'Seus dados foram liberados para a empresa.',
      });

      setTimeout(() => {
        setModalPagamento(false);
        setPropostaSelecionada(null);
      }, 3000);
    } catch (error) {
      console.error('Erro ao aceitar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar a proposta.',
        variant: 'destructive',
      });
    } finally {
      setProcessandoPagamento(false);
    }
  };

  const iniciarRecusa = (proposta: Proposta) => {
    setPropostaSelecionada(proposta);
    setMotivoRecusa('');
    setOutroMotivo('');
    setModalRecusa(true);
  };

  const confirmarRecusa = async () => {
    if (!propostaSelecionada || !motivoRecusa) return;

    const motivo = motivoRecusa === 'outro' ? outroMotivo :
      MOTIVOS_RECUSA.find(m => m.value === motivoRecusa)?.label;

    try {
      // Atualizar proposta
      const { error } = await supabase
        .from('propostas_recrutamento')
        .update({
          status: 'recusada',
          motivo_recusa: motivo,
        })
        .eq('id', propostaSelecionada.id);

      if (error) throw error;

      // Devolver crédito da empresa (apenas se empresa existir)
      if (propostaSelecionada.empresa?.id) {
        const { data: empresaData } = await supabase
          .from('empresas_recrutamento')
          .select('creditos')
          .eq('id', propostaSelecionada.empresa.id)
          .single();

        if (empresaData) {
          const creditosAtuais = Number(empresaData.creditos) || 0;
          await supabase
            .from('empresas_recrutamento')
            .update({ creditos: creditosAtuais + 50 })
            .eq('id', propostaSelecionada.empresa.id);
        }

        // Notificar empresa
        await supabase
          .from('notificacoes_recrutamento')
          .insert({
            tipo_destinatario: 'empresa',
            destinatario_id: propostaSelecionada.empresa.id,
            titulo: 'Proposta recusada',
            mensagem: `${candidato?.nome_completo} recusou a proposta. Motivo: ${motivo}. Seu crédito foi devolvido.`,
            tipo_notificacao: 'proposta_recusada',
          });
      }

      // Se o motivo for "indisponível", oferecer pausar perfil via dialog
      if (motivoRecusa === 'indisponivel' && candidato) {
        // Mostrar toast perguntando se quer pausar
        toast({
          title: 'Deseja pausar seu perfil?',
          description: 'Você pode pausar para não receber mais propostas.',
          action: (
            <Button
              size="sm"
              onClick={async () => {
                await supabase
                  .from('candidatos_recrutamento')
                  .update({ status: 'pausado' })
                  .eq('id', candidato.id);
                recarregarCandidato();
                toast({ title: 'Perfil pausado', description: 'Você não receberá mais propostas.' });
              }}
            >
              Pausar
            </Button>
          ),
        });
      }

      toast({
        title: 'Proposta recusada',
        description: 'A empresa foi notificada.',
      });

      setModalRecusa(false);
      setPropostaSelecionada(null);
      carregarPropostas();
    } catch (error) {
      console.error('Erro ao recusar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível recusar a proposta.',
        variant: 'destructive',
      });
    }
  };

  const confirmarContratacao = async () => {
    if (!propostaContratacao || !candidato || !propostaContratacao.empresa?.id) return;

    try {
      // Atualizar proposta
      await supabase
        .from('propostas_recrutamento')
        .update({ status: 'contratado' })
        .eq('id', propostaContratacao.id);

      // Atualizar status do candidato
      await supabase
        .from('candidatos_recrutamento')
        .update({
          status: 'contratado',
          recrutado_por_empresa_id: propostaContratacao.empresa.id,
          recrutado_data: new Date().toISOString(),
        })
        .eq('id', candidato.id);

      // Notificar empresa
      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'empresa',
          destinatario_id: propostaContratacao.empresa.id,
          titulo: 'Contratação confirmada!',
          mensagem: `${candidato.nome_completo} confirmou a contratação para a vaga ${propostaContratacao.vaga?.titulo || 'N/A'}.`,
          tipo_notificacao: 'contratacao',
        });

      toast({
        title: 'Parabéns!',
        description: 'Sua contratação foi registrada.',
      });

      setDialogContratacao(false);
      setPropostaContratacao(null);
      recarregarCandidato();
      carregarPropostas();
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar a contratação.',
        variant: 'destructive',
      });
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

  const calcularExpiracao = (data: string) => {
    const criacao = new Date(data);
    const expiracao = new Date(criacao.getTime() + 48 * 60 * 60 * 1000);
    const agora = new Date();
    const diff = expiracao.getTime() - agora.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    return horas > 0 ? `${horas}h` : 'Expirada';
  };

  const getFaixaSalarialLabel = (faixa: string) => {
    const faixas: Record<string, string> = {
      'ate_1500': 'Até R$ 1.500',
      '1500_2500': 'R$ 1.500 - R$ 2.500',
      '2500_4000': 'R$ 2.500 - R$ 4.000',
      '4000_6000': 'R$ 4.000 - R$ 6.000',
      '6000_10000': 'R$ 6.000 - R$ 10.000',
      'acima_10000': 'Acima de R$ 10.000',
    };
    return faixas[faixa] || faixa;
  };

  const abrirWhatsApp = (telefone: string) => {
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  };

  // Filtrar propostas por tab
  const propostasFiltradas = propostas.filter(p => {
    if (tabAtiva === 'novas') return p.status === 'pendente';
    if (tabAtiva === 'aceitas') return ['aceita', 'entrevista_agendada'].includes(p.status);
    if (tabAtiva === 'recusadas') return p.status === 'recusada';
    return true;
  });

  const contagens = {
    novas: propostas.filter(p => p.status === 'pendente').length,
    aceitas: propostas.filter(p => ['aceita', 'entrevista_agendada'].includes(p.status)).length,
    recusadas: propostas.filter(p => p.status === 'recusada').length,
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white">Minhas Propostas</h1>

      {/* Tabs */}
      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList className="w-full bg-slate-800 border border-slate-700">
          <TabsTrigger value="novas" className="flex-1 data-[state=active]:bg-slate-700">
            Novas ({contagens.novas})
          </TabsTrigger>
          <TabsTrigger value="aceitas" className="flex-1 data-[state=active]:bg-slate-700">
            Aceitas ({contagens.aceitas})
          </TabsTrigger>
          <TabsTrigger value="recusadas" className="flex-1 data-[state=active]:bg-slate-700">
            Recusadas ({contagens.recusadas})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tabAtiva} className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
            </div>
          ) : propostasFiltradas.length > 0 ? (
            propostasFiltradas.map((proposta) => (
              <Card
                key={proposta.id}
                className={`border ${
                  proposta.status === 'pendente'
                    ? 'bg-gradient-to-br from-[#E31E24]/10 to-slate-800 border-[#E31E24]/30'
                    : proposta.status === 'aceita' || proposta.status === 'entrevista_agendada'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  {proposta.status === 'pendente' && (
                    <div className="flex items-center space-x-2 mb-4">
                      <PartyPopper className="w-5 h-5 text-[#E31E24]" />
                      <span className="font-bold text-white">NOVA PROPOSTA DE ENTREVISTA!</span>
                    </div>
                  )}

                  {proposta.status === 'aceita' && (
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-bold text-white">ENTREVISTA CONFIRMADA</span>
                    </div>
                  )}

                  {proposta.status === 'entrevista_agendada' && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-white">ENTREVISTA AGENDADA</span>
                    </div>
                  )}

                  {/* Info da vaga */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-300">
                      <Briefcase className="w-4 h-4 mr-2 text-slate-500" />
                      <span className="font-medium">{proposta.vaga?.titulo || 'Vaga não especificada'}</span>
                    </div>
                    <div className="flex items-center text-slate-400 text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-slate-500" />
                      {getFaixaSalarialLabel(proposta.vaga?.faixa_salarial || '')}
                    </div>
                    <div className="flex items-center text-slate-400 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                      {proposta.vaga?.cidade || 'N/A'}/{proposta.vaga?.estado || 'N/A'}
                    </div>
                    <div className="flex items-center text-slate-400 text-sm">
                      <Building2 className="w-4 h-4 mr-2 text-slate-500" />
                      {(proposta.vaga?.regime || 'N/A').toUpperCase()} • {proposta.vaga?.modalidade || 'N/A'}
                    </div>
                  </div>

                  {/* Dados da empresa (se aceita) */}
                  {(proposta.status === 'aceita' || proposta.status === 'entrevista_agendada') && proposta.empresa && (
                    <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                      <p className="text-white font-medium mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        {proposta.empresa.nome_fantasia || proposta.empresa.razao_social}
                      </p>
                      <div className="space-y-1 text-sm text-slate-300">
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-slate-500" />
                          {proposta.empresa.socio_telefone || 'N/A'}
                        </p>
                        <p className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-slate-500" />
                          {proposta.empresa.socio_email || 'N/A'}
                        </p>
                        <p className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                          {proposta.empresa.cidade || 'N/A'}/{proposta.empresa.estado || 'N/A'}
                        </p>
                      </div>

                      {proposta.empresa.socio_telefone && (
                        <Button
                          onClick={() => abrirWhatsApp(proposta.empresa!.socio_telefone)}
                          className="w-full mt-3 bg-green-600 hover:bg-green-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Abrir WhatsApp
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Info da entrevista agendada */}
                  {proposta.status === 'entrevista_agendada' && proposta.data_entrevista && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                      <p className="text-blue-400 font-medium">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatarData(proposta.data_entrevista)} às {proposta.horario_entrevista}
                      </p>
                      <p className="text-sm text-blue-400/70 mt-1">
                        {proposta.tipo_entrevista === 'presencial' && `Local: ${proposta.local_entrevista}`}
                        {proposta.tipo_entrevista === 'video' && `Link: ${proposta.link_entrevista}`}
                        {proposta.tipo_entrevista === 'telefone' && 'Entrevista por telefone'}
                      </p>
                    </div>
                  )}

                  {/* Footer com data e ações */}
                  {proposta.status === 'pendente' && (
                    <>
                      <p className="text-xs text-slate-500 mb-4">
                        Recebida há {formatarData(proposta.created_at)} • Expira em {calcularExpiracao(proposta.created_at)}
                      </p>

                      <p className="text-sm text-slate-400 mb-4">
                        Para aceitar e liberar seus dados de contato:
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => iniciarAceite(proposta)}
                          className="bg-gradient-to-r from-green-500 to-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aceitar - R$ {CUSTO_ACEITE.toFixed(2).replace('.', ',')}
                        </Button>
                        <Button
                          onClick={() => iniciarRecusa(proposta)}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </>
                  )}

                  {(proposta.status === 'aceita' || proposta.status === 'entrevista_agendada') && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <p className="text-xs text-slate-500">
                        Aceita em {formatarData(proposta.created_at)}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setPropostaContratacao(proposta);
                          setDialogContratacao(true);
                        }}
                        className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
                      >
                        <PartyPopper className="w-4 h-4 mr-1" />
                        Fui contratado!
                      </Button>
                    </div>
                  )}

                  {proposta.status === 'recusada' && (
                    <p className="text-xs text-slate-500">
                      Recusada em {formatarData(proposta.created_at)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="py-12 text-center">
                <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma proposta
                </h3>
                <p className="text-slate-400 text-sm">
                  {tabAtiva === 'novas'
                    ? 'Você não tem novas propostas no momento'
                    : tabAtiva === 'aceitas'
                    ? 'Você ainda não aceitou nenhuma proposta'
                    : 'Você ainda não recusou nenhuma proposta'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Pagamento */}
      <Dialog open={modalPagamento} onOpenChange={setModalPagamento}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {pagamentoAprovado ? 'Proposta Aceita!' : 'Aceitar Proposta'}
            </DialogTitle>
          </DialogHeader>

          {pagamentoAprovado ? (
            <div className="py-8 text-center">
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <p className="text-white text-lg font-medium mb-2">
                Parabéns!
              </p>
              <p className="text-slate-400">
                Seus dados foram liberados para a empresa. Aguarde o contato!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                {/* Resumo */}
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm mb-1">Taxa de aceite</p>
                  <p className="text-3xl font-bold text-white">
                    R$ {CUSTO_ACEITE.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <div className="w-40 h-40 mx-auto bg-white rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="w-32 h-32 text-slate-800" />
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Escaneie o QR Code ou copie o código PIX
                  </p>
                </div>

                {/* Código PIX */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pixCopiaECola}
                    readOnly
                    className="flex-1 bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300 truncate"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copiarPix}
                    className="border-slate-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Ao confirmar o pagamento, seus dados de contato serão liberados para a empresa.
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setModalPagamento(false)}
                  disabled={processandoPagamento}
                  className="border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarPagamento}
                  disabled={processandoPagamento}
                  className="bg-gradient-to-r from-green-500 to-green-600"
                >
                  {processandoPagamento ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Já fiz o pagamento'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Recusa */}
      <Dialog open={modalRecusa} onOpenChange={setModalRecusa}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Por que está recusando?</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={motivoRecusa} onValueChange={setMotivoRecusa}>
              {MOTIVOS_RECUSA.map((motivo) => (
                <div key={motivo.value} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem
                    value={motivo.value}
                    id={motivo.value}
                    className="border-slate-500"
                  />
                  <Label
                    htmlFor={motivo.value}
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {motivo.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {motivoRecusa === 'outro' && (
              <Textarea
                placeholder="Descreva o motivo..."
                value={outroMotivo}
                onChange={(e) => setOutroMotivo(e.target.value)}
                className="mt-3 bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            )}

            {motivoRecusa === 'indisponivel' && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Ao confirmar, ofereceremos a opção de pausar seu perfil.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalRecusa(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarRecusa}
              disabled={!motivoRecusa || (motivoRecusa === 'outro' && !outroMotivo)}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Contratação */}
      <AlertDialog open={dialogContratacao} onOpenChange={setDialogContratacao}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <PartyPopper className="w-5 h-5 mr-2 text-yellow-400" />
              Parabéns pela conquista!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Ao confirmar, seu perfil será marcado como "Recrutado por {propostaContratacao?.empresa.nome_fantasia}"
              e você deixará de receber novas propostas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarContratacao}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              Confirmar Contratação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
