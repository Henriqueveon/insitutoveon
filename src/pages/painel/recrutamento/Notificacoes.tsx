// =====================================================
// CENTRAL DE NOTIFICAÇÕES - Painel do Gestor
// Envio de comunicados para empresas e candidatos
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Send,
  Building2,
  Users,
  Info,
  Megaphone,
  Sparkles,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
}

interface Candidato {
  id: string;
  nome_completo: string;
}

interface LoteNotificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo_notificacao: string;
  destinatario_tipo: string;
  total_enviadas: number;
  total_lidas: number;
  created_at: string;
}

const TIPOS_NOTIFICACAO = [
  { value: 'informativo', label: 'Informativo', icon: Info, color: 'bg-blue-500' },
  { value: 'promocao', label: 'Promoção', icon: Megaphone, color: 'bg-green-500' },
  { value: 'atualizacao', label: 'Atualização', icon: Sparkles, color: 'bg-purple-500' },
  { value: 'urgente', label: 'Urgente', icon: AlertTriangle, color: 'bg-red-500' },
];

export default function NotificacoesGestor() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lotes, setLotes] = useState<LoteNotificacao[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loteDetalhe, setLoteDetalhe] = useState<LoteNotificacao | null>(null);

  // Form state
  const [destinatarioTipo, setDestinatarioTipo] = useState('ambos');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoNotificacao, setTipoNotificacao] = useState('informativo');
  const [agendar, setAgendar] = useState(false);
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horaAgendamento, setHoraAgendamento] = useState('');
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([]);
  const [candidatosSelecionados, setCandidatosSelecionados] = useState<string[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar histórico de lotes
      const { data: lotesData, error: lotesError } = await supabase
        .from('notificacoes_lotes' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (lotesError) throw lotesError;
      setLotes((lotesData as unknown as LoteNotificacao[]) || []);

      // Carregar empresas para seleção
      const { data: empresasData } = await supabase
        .from('empresas_recrutamento')
        .select('id, razao_social, nome_fantasia')
        .eq('status', 'ativo')
        .order('razao_social');

      setEmpresas((empresasData as Empresa[]) || []);

      // Carregar candidatos para seleção
      const { data: candidatosData } = await supabase
        .from('candidatos_recrutamento')
        .select('id, nome_completo')
        .in('status', ['disponivel', 'em_processo', 'ativo'])
        .order('nome_completo');

      setCandidatos((candidatosData as Candidato[]) || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enviarNotificacao = async () => {
    if (!titulo.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha o título da notificação.',
        variant: 'destructive',
      });
      return;
    }

    if (!mensagem.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha a mensagem da notificação.',
        variant: 'destructive',
      });
      return;
    }

    if (destinatarioTipo === 'especificos_empresa' && empresasSelecionadas.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos uma empresa.',
        variant: 'destructive',
      });
      return;
    }

    if (destinatarioTipo === 'especificos_candidato' && candidatosSelecionados.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um candidato.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const destinatariosIds = destinatarioTipo === 'especificos_empresa'
        ? empresasSelecionadas
        : destinatarioTipo === 'especificos_candidato'
        ? candidatosSelecionados
        : null;

      const { data, error } = await supabase.rpc('enviar_notificacao_massa' as any, {
        p_titulo: titulo,
        p_mensagem: mensagem,
        p_tipo: tipoNotificacao,
        p_destinatario_tipo: destinatarioTipo,
        p_destinatarios_ids: destinatariosIds,
      });

      if (error) throw error;

      const resultado = data as { success: boolean; enviadas: number; error?: string };

      if (resultado.success) {
        toast({
          title: 'Notificação enviada!',
          description: `${resultado.enviadas} notificações enviadas com sucesso.`,
        });

        // Limpar formulário
        setTitulo('');
        setMensagem('');
        setTipoNotificacao('informativo');
        setDestinatarioTipo('ambos');
        setEmpresasSelecionadas([]);
        setCandidatosSelecionados([]);
        setAgendar(false);

        // Recarregar lotes
        carregarDados();
      } else {
        throw new Error(resultado.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Não foi possível enviar a notificação.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getTipoConfig = (tipo: string) => {
    return TIPOS_NOTIFICACAO.find(t => t.value === tipo) || TIPOS_NOTIFICACAO[0];
  };

  const getDestinatarioLabel = (tipo: string) => {
    switch (tipo) {
      case 'empresa': return 'Empresas';
      case 'candidato': return 'Candidatos';
      case 'ambos': return 'Empresas e Candidatos';
      case 'especificos_empresa': return 'Empresas Específicas';
      case 'especificos_candidato': return 'Candidatos Específicos';
      default: return tipo;
    }
  };

  const calcularTaxaLeitura = (lote: LoteNotificacao) => {
    if (lote.total_enviadas === 0) return 0;
    return Math.round((lote.total_lidas / lote.total_enviadas) * 100);
  };

  const tipoConfig = getTipoConfig(tipoNotificacao);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-amber-400" />
          Central de Notificações
        </h1>
        <p className="text-slate-400 mt-1">
          Envie comunicados para empresas e candidatos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Envio */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              Nova Notificação
            </CardTitle>
            <CardDescription className="text-slate-400">
              Preencha os campos para enviar uma notificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Destinatários */}
            <div className="space-y-3">
              <Label className="text-slate-300">Destinatários</Label>
              <RadioGroup
                value={destinatarioTipo}
                onValueChange={setDestinatarioTipo}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empresa" id="empresa" />
                  <Label htmlFor="empresa" className="text-slate-300 flex items-center gap-2 cursor-pointer">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Todas as Empresas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="candidato" id="candidato" />
                  <Label htmlFor="candidato" className="text-slate-300 flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4 text-green-400" />
                    Todos os Candidatos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ambos" id="ambos" />
                  <Label htmlFor="ambos" className="text-slate-300 cursor-pointer">
                    Empresas e Candidatos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="especificos_empresa" id="especificos_empresa" />
                  <Label htmlFor="especificos_empresa" className="text-slate-300 cursor-pointer">
                    Empresas específicas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="especificos_candidato" id="especificos_candidato" />
                  <Label htmlFor="especificos_candidato" className="text-slate-300 cursor-pointer">
                    Candidatos específicos
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Select de empresas específicas */}
            {destinatarioTipo === 'especificos_empresa' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Selecione as empresas</Label>
                <div className="max-h-40 overflow-y-auto bg-slate-700/50 rounded-lg p-3 space-y-2">
                  {empresas.map(empresa => (
                    <label key={empresa.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={empresasSelecionadas.includes(empresa.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEmpresasSelecionadas([...empresasSelecionadas, empresa.id]);
                          } else {
                            setEmpresasSelecionadas(empresasSelecionadas.filter(id => id !== empresa.id));
                          }
                        }}
                        className="rounded border-slate-500"
                      />
                      <span className="text-sm text-slate-300">
                        {empresa.nome_fantasia || empresa.razao_social}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {empresasSelecionadas.length} empresa(s) selecionada(s)
                </p>
              </div>
            )}

            {/* Select de candidatos específicos */}
            {destinatarioTipo === 'especificos_candidato' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Selecione os candidatos</Label>
                <div className="max-h-40 overflow-y-auto bg-slate-700/50 rounded-lg p-3 space-y-2">
                  {candidatos.map(candidato => (
                    <label key={candidato.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={candidatosSelecionados.includes(candidato.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCandidatosSelecionados([...candidatosSelecionados, candidato.id]);
                          } else {
                            setCandidatosSelecionados(candidatosSelecionados.filter(id => id !== candidato.id));
                          }
                        }}
                        className="rounded border-slate-500"
                      />
                      <span className="text-sm text-slate-300">{candidato.nome_completo}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {candidatosSelecionados.length} candidato(s) selecionado(s)
                </p>
              </div>
            )}

            {/* Título */}
            <div className="space-y-2">
              <Label className="text-slate-300">Título da Notificação</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value.slice(0, 100))}
                placeholder="Ex: Nova funcionalidade disponível!"
                className="bg-slate-700 border-slate-600 text-white"
                maxLength={100}
              />
              <p className="text-xs text-slate-500 text-right">{titulo.length}/100</p>
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label className="text-slate-300">Mensagem</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value.slice(0, 500))}
                placeholder="Escreva sua mensagem..."
                className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 text-right">{mensagem.length}/500</p>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label className="text-slate-300">Tipo</Label>
              <Select value={tipoNotificacao} onValueChange={setTipoNotificacao}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_NOTIFICACAO.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <span className="flex items-center gap-2">
                        <tipo.icon className="w-4 h-4" />
                        {tipo.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agendar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Agendar envio
                </Label>
                <Switch checked={agendar} onCheckedChange={setAgendar} />
              </div>
              {agendar && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    type="time"
                    value={horaAgendamento}
                    onChange={(e) => setHoraAgendamento(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              )}
            </div>

            {/* Botão Enviar */}
            <Button
              onClick={enviarNotificacao}
              disabled={isSending}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {agendar ? 'Agendar Notificação' : 'Enviar Notificação'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Preview
            </CardTitle>
            <CardDescription className="text-slate-400">
              Como a notificação vai aparecer para o usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              {/* Notificação preview */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${tipoConfig.color}`}>
                  <tipoConfig.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">
                    {titulo || 'Título da notificação...'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">
                    {mensagem || 'Mensagem da notificação aparecerá aqui...'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Agora mesmo
                  </p>
                </div>
              </div>

              {/* Info de destinatários */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  Será enviado para: <span className="text-slate-300">{getDestinatarioLabel(destinatarioTipo)}</span>
                </p>
                {destinatarioTipo === 'especificos_empresa' && empresasSelecionadas.length > 0 && (
                  <p className="text-xs text-blue-400 mt-1">
                    {empresasSelecionadas.length} empresa(s) selecionada(s)
                  </p>
                )}
                {destinatarioTipo === 'especificos_candidato' && candidatosSelecionados.length > 0 && (
                  <p className="text-xs text-green-400 mt-1">
                    {candidatosSelecionados.length} candidato(s) selecionado(s)
                  </p>
                )}
              </div>
            </div>

            {/* Info sobre tipos */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-slate-300">Tipos de notificação:</p>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_NOTIFICACAO.map(tipo => (
                  <div key={tipo.value} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className={`w-3 h-3 rounded-full ${tipo.color}`} />
                    <span>{tipo.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Histórico de Envios
          </CardTitle>
          <CardDescription className="text-slate-400">
            Últimas notificações enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : lotes.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="mt-4 text-slate-400">Nenhuma notificação enviada ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Data/Hora</TableHead>
                    <TableHead className="text-slate-400">Título</TableHead>
                    <TableHead className="text-slate-400">Tipo</TableHead>
                    <TableHead className="text-slate-400">Destinatários</TableHead>
                    <TableHead className="text-slate-400 text-center">Enviadas</TableHead>
                    <TableHead className="text-slate-400 text-center">Taxa Leitura</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotes.map(lote => {
                    const tipoConfig = getTipoConfig(lote.tipo_notificacao);
                    const taxaLeitura = calcularTaxaLeitura(lote);

                    return (
                      <TableRow key={lote.id} className="border-slate-700">
                        <TableCell className="text-slate-300">
                          {format(new Date(lote.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-white font-medium max-w-[200px] truncate">
                          {lote.titulo}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${tipoConfig.color} text-white`}>
                            {tipoConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {getDestinatarioLabel(lote.destinatario_tipo)}
                        </TableCell>
                        <TableCell className="text-center text-white font-medium">
                          {lote.total_enviadas}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${taxaLeitura >= 50 ? 'bg-green-500' : 'bg-amber-500'}`}
                                style={{ width: `${taxaLeitura}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">{taxaLeitura}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLoteDetalhe(lote)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!loteDetalhe} onOpenChange={() => setLoteDetalhe(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes da Notificação</DialogTitle>
            <DialogDescription className="text-slate-400">
              Informações completas do envio
            </DialogDescription>
          </DialogHeader>
          {loteDetalhe && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {(() => {
                  const config = getTipoConfig(loteDetalhe.tipo_notificacao);
                  return (
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <config.icon className="w-5 h-5 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <p className="font-medium text-white">{loteDetalhe.titulo}</p>
                  <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">
                    {loteDetalhe.mensagem}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500">Enviadas</p>
                  <p className="text-lg font-bold text-white">{loteDetalhe.total_enviadas}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Lidas</p>
                  <p className="text-lg font-bold text-green-400">{loteDetalhe.total_lidas}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Taxa de Leitura</p>
                  <p className="text-lg font-bold text-white">{calcularTaxaLeitura(loteDetalhe)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Destinatários</p>
                  <p className="text-sm font-medium text-white">
                    {getDestinatarioLabel(loteDetalhe.destinatario_tipo)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Enviado em {format(new Date(loteDetalhe.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
