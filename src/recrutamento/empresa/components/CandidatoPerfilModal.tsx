// =====================================================
// MODAL PERFIL PROFISSIONAL - Área de Recrutamento VEON
// Visualização do profissional + envio de proposta
// IMPORTANTE: Oculta informações de contato (nome completo, telefone, email)
// =====================================================

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  DollarSign,
  Car,
  Plane,
  Home,
  Users,
  Instagram,
  Play,
  FileText,
  Send,
  Heart,
  Download,
  Eye,
  Target,
  Star,
  CheckCircle,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url: string | null;
  documento_url: string | null;
  cidade: string;
  estado: string;
  bairro: string;
  data_nascimento: string;
  areas_experiencia: string[];
  anos_experiencia: string;
  pretensao_salarial: string;
  escolaridade: string;
  curso: string | null;
  certificacoes: string | null;
  perfil_disc: string | null;
  disponibilidade_inicio: string;
  disponibilidade_horario: string;
  possui_cnh: boolean;
  possui_veiculo: boolean;
  regime_preferido: string;
  objetivo_profissional: string;
  ultima_empresa: string;
  ultimo_cargo: string;
  tempo_ultima_empresa: string;
  motivo_saida: string;
  aceita_viajar: boolean;
  aceita_mudanca: boolean;
  estado_civil: string;
  tem_filhos: boolean;
  quantidade_filhos: number | null;
  instagram: string | null;
  valores_empresa: string[];
  areas_interesse: string[];
}

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
}

interface Vaga {
  id: string;
  titulo: string;
  faixa_salarial: string;
}

interface Props {
  candidato: Candidato | null;
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa | null;
  isFavorito: boolean;
  onToggleFavorito: (id: string) => void;
}

const CUSTO_PROPOSTA = 50; // R$ 50 por proposta

export default function CandidatoPerfilModal({
  candidato,
  isOpen,
  onClose,
  empresa,
  isFavorito,
  onToggleFavorito,
}: Props) {
  const { toast } = useToast();
  const [tabAtiva, setTabAtiva] = useState('perfil');
  const [mostrarEnviarProposta, setMostrarEnviarProposta] = useState(false);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dados da proposta
  const [vagaSelecionada, setVagaSelecionada] = useState('');
  const [salarioOferecido, setSalarioOferecido] = useState('');
  const [mensagem, setMensagem] = useState('');

  if (!candidato) return null;

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
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

  const getNomePerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'Dominância';
      case 'I': return 'Influência';
      case 'S': return 'Estabilidade';
      case 'C': return 'Conformidade';
      default: return 'Não avaliado';
    }
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

  const getDisponibilidadeLabel = (disp: string) => {
    const disps: Record<string, string> = {
      'imediata': 'Imediata',
      '15_dias': 'Em 15 dias',
      '30_dias': 'Em 30 dias',
      'a_combinar': 'A combinar',
    };
    return disps[disp] || disp;
  };

  const carregarVagas = async () => {
    if (!empresa?.id) return;

    const { data } = await supabase
      .from('vagas_recrutamento')
      .select('id, titulo, faixa_salarial')
      .eq('empresa_id', empresa.id)
      .eq('status', 'ativa');

    if (data) {
      setVagas(data);
    }
  };

  const iniciarProposta = async () => {
    if (!empresa) return;

    // Verificar créditos
    if (empresa.creditos < CUSTO_PROPOSTA) {
      toast({
        title: 'Créditos insuficientes',
        description: `Você precisa de R$ ${CUSTO_PROPOSTA} em créditos para enviar uma proposta.`,
        variant: 'destructive',
      });
      return;
    }

    await carregarVagas();
    setMostrarEnviarProposta(true);
  };

  const enviarProposta = async () => {
    if (!empresa || !candidato) return;

    if (!vagaSelecionada || !salarioOferecido || !mensagem) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Selecione uma vaga, informe o salário e escreva uma mensagem.',
        variant: 'destructive',
      });
      return;
    }

    // Converter salário corretamente (valor está em centavos como string de dígitos)
    const salarioEmCentavos = parseInt(salarioOferecido, 10) || 0;
    const salarioEmReais = salarioEmCentavos / 100;

    if (salarioEmReais <= 0) {
      toast({
        title: 'Salário inválido',
        description: 'Informe um valor de salário válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar créditos novamente (pode ter mudado)
      const { data: empresaAtual } = await supabase
        .from('empresas_recrutamento')
        .select('creditos')
        .eq('id', empresa.id)
        .single();

      const creditosAtuais = Number(empresaAtual?.creditos) || 0;

      if (creditosAtuais < CUSTO_PROPOSTA) {
        toast({
          title: 'Créditos insuficientes',
          description: `Você precisa de R$ ${CUSTO_PROPOSTA} em créditos.`,
          variant: 'destructive',
        });
        return;
      }

      // Primeiro debitar créditos (mais importante)
      const { error: creditoError } = await supabase
        .from('empresas_recrutamento')
        .update({ creditos: creditosAtuais - CUSTO_PROPOSTA })
        .eq('id', empresa.id);

      if (creditoError) throw creditoError;

      // Criar proposta
      const { data: propostaData, error: propostaError } = await supabase
        .from('propostas_recrutamento')
        .insert({
          empresa_id: empresa.id,
          candidato_id: candidato.id,
          vaga_id: vagaSelecionada,
          salario_oferecido: salarioEmReais,
          mensagem: mensagem,
          status: 'pendente',
        })
        .select('id')
        .single();

      if (propostaError) {
        // Reverter créditos se proposta falhar
        await supabase
          .from('empresas_recrutamento')
          .update({ creditos: creditosAtuais })
          .eq('id', empresa.id);
        throw propostaError;
      }

      // Criar notificação para o candidato
      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: candidato.id,
          titulo: 'Nova proposta recebida!',
          mensagem: `${empresa.nome_fantasia || empresa.razao_social} enviou uma proposta para você.`,
          tipo_notificacao: 'proposta',
        });

      toast({
        title: 'Proposta enviada!',
        description: 'O profissional receberá uma notificação sobre sua proposta.',
      });

      setMostrarEnviarProposta(false);
      setVagaSelecionada('');
      setSalarioOferecido('');
      setMensagem('');
      onClose();
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar a proposta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: string) => {
    const numero = valor.replace(/\D/g, '');
    const formatado = (parseInt(numero) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    return formatado;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-800 border-slate-700 p-0">
        {mostrarEnviarProposta ? (
          /* Formulário de Proposta */
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-[#E31E24]" />
                Enviar Proposta para {candidato.nome_completo.split(' ')[0]}
              </DialogTitle>
              <p className="text-sm text-slate-400 mt-1">
                As informações de contato serão reveladas após o profissional aceitar sua proposta
              </p>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              {/* Info do custo */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 font-medium">Custo da proposta</p>
                  <p className="text-sm text-yellow-400/70">
                    Será debitado do seu saldo ao enviar
                  </p>
                </div>
                <p className="text-xl font-bold text-yellow-400">
                  R$ {CUSTO_PROPOSTA},00
                </p>
              </div>

              {/* Vaga */}
              <div className="space-y-2">
                <Label className="text-slate-300">Vaga</Label>
                <Select value={vagaSelecionada} onValueChange={setVagaSelecionada}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione a vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {vagas.length > 0 ? (
                      vagas.map((vaga) => (
                        <SelectItem key={vaga.id} value={vaga.id}>
                          {vaga.titulo}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="sem-vaga" disabled>
                        Nenhuma vaga ativa
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Salário */}
              <div className="space-y-2">
                <Label className="text-slate-300">Salário Oferecido</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={salarioOferecido ? formatarMoeda(salarioOferecido) : ''}
                  onChange={(e) => setSalarioOferecido(e.target.value.replace(/\D/g, ''))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <Label className="text-slate-300">Mensagem para o candidato</Label>
                <Textarea
                  placeholder="Descreva a oportunidade, benefícios e por que essa pessoa seria ideal..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setMostrarEnviarProposta(false)}
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={enviarProposta}
                  disabled={isLoading || !vagaSelecionada}
                  className="flex-1 bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Proposta
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Perfil do Candidato */
          <>
            {/* Header com foto e info básica */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={candidato.foto_url || undefined} />
                    <AvatarFallback className="bg-slate-600 text-white text-2xl">
                      {candidato.nome_completo.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {candidato.perfil_disc && (
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${getCorPerfil(candidato.perfil_disc)} flex items-center justify-center text-sm font-bold text-white border-2 border-slate-800`}>
                      {candidato.perfil_disc}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {/* Mostra apenas PRIMEIRO NOME - contato oculto */}
                  <h2 className="text-xl font-bold text-white">
                    {candidato.nome_completo.split(' ')[0]}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-slate-400 text-sm">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {candidato.cidade}, {candidato.estado}
                    </span>
                    {candidato.data_nascimento && (
                      <>
                        <span>•</span>
                        <span>{calcularIdade(candidato.data_nascimento)} anos</span>
                      </>
                    )}
                    {candidato.perfil_disc && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getCorPerfil(candidato.perfil_disc)}`}>
                          {getNomePerfil(candidato.perfil_disc)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 mt-2 line-clamp-2">
                    {candidato.objetivo_profissional}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleFavorito(candidato.id)}
                    className={`${isFavorito ? 'text-red-500' : 'text-slate-400'}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    onClick={iniciarProposta}
                    className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Proposta
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="flex-1">
              <TabsList className="w-full bg-slate-700/50 rounded-none border-b border-slate-700">
                <TabsTrigger value="perfil" className="flex-1 data-[state=active]:bg-slate-600">
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="experiencia" className="flex-1 data-[state=active]:bg-slate-600">
                  Experiência
                </TabsTrigger>
                <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-slate-600">
                  Vídeo
                </TabsTrigger>
              </TabsList>

              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {/* Tab Perfil */}
                <TabsContent value="perfil" className="mt-0 space-y-6">
                  {/* Grid de informações */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <DollarSign className="w-5 h-5 text-green-400 mb-2" />
                        <p className="text-xs text-slate-400">Pretensão</p>
                        <p className="text-white font-medium">
                          {getFaixaSalarialLabel(candidato.pretensao_salarial)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <Clock className="w-5 h-5 text-blue-400 mb-2" />
                        <p className="text-xs text-slate-400">Disponibilidade</p>
                        <p className="text-white font-medium">
                          {getDisponibilidadeLabel(candidato.disponibilidade_inicio)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <Building2 className="w-5 h-5 text-purple-400 mb-2" />
                        <p className="text-xs text-slate-400">Regime</p>
                        <p className="text-white font-medium capitalize">
                          {candidato.regime_preferido}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <GraduationCap className="w-5 h-5 text-yellow-400 mb-2" />
                        <p className="text-xs text-slate-400">Escolaridade</p>
                        <p className="text-white font-medium text-sm">
                          {candidato.escolaridade}
                        </p>
                        {candidato.curso && (
                          <p className="text-xs text-slate-400 mt-1">
                            {candidato.curso}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <Calendar className="w-5 h-5 text-orange-400 mb-2" />
                        <p className="text-xs text-slate-400">Horários</p>
                        <p className="text-white font-medium text-sm">
                          {candidato.disponibilidade_horario}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <Users className="w-5 h-5 text-pink-400 mb-2" />
                        <p className="text-xs text-slate-400">Estado Civil</p>
                        <p className="text-white font-medium">
                          {candidato.estado_civil}
                          {candidato.tem_filhos && ` • ${candidato.quantidade_filhos} filho(s)`}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {candidato.possui_cnh && (
                      <Badge className="bg-blue-500/20 text-blue-400">
                        <Car className="w-3 h-3 mr-1" />
                        CNH
                      </Badge>
                    )}
                    {candidato.possui_veiculo && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <Car className="w-3 h-3 mr-1" />
                        Veículo Próprio
                      </Badge>
                    )}
                    {candidato.aceita_viajar && (
                      <Badge className="bg-purple-500/20 text-purple-400">
                        <Plane className="w-3 h-3 mr-1" />
                        Aceita Viajar
                      </Badge>
                    )}
                    {candidato.aceita_mudanca && (
                      <Badge className="bg-orange-500/20 text-orange-400">
                        <Home className="w-3 h-3 mr-1" />
                        Aceita Mudança
                      </Badge>
                    )}
                    {/* Instagram removido - informação de contato oculta */}
                  </div>

                  {/* Áreas de interesse */}
                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-slate-400" />
                      Áreas de Interesse
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidato.areas_interesse?.map((area, i) => (
                        <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Valores */}
                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-slate-400" />
                      Valores que Busca
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidato.valores_empresa?.map((valor, i) => (
                        <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                          {valor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Experiência */}
                <TabsContent value="experiencia" className="mt-0 space-y-6">
                  {/* Última experiência */}
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                      Última Experiência
                    </h4>
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <p className="text-white font-medium">{candidato.ultimo_cargo}</p>
                        <p className="text-slate-400 text-sm">{candidato.ultima_empresa}</p>
                        <p className="text-slate-500 text-sm mt-1">
                          Período: {candidato.tempo_ultima_empresa}
                        </p>
                        <p className="text-slate-400 text-sm mt-2">
                          <span className="text-slate-500">Motivo da saída:</span> {candidato.motivo_saida}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Áreas de experiência */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Áreas de Experiência</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidato.areas_experiencia?.map((area, i) => (
                        <Badge key={i} className="bg-[#E31E24]/20 text-[#E31E24]">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Anos de experiência */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Tempo Total de Experiência</h4>
                    <p className="text-slate-300">
                      {candidato.anos_experiencia === 'primeiro_emprego'
                        ? 'Primeiro emprego'
                        : candidato.anos_experiencia === 'menos_1'
                        ? 'Menos de 1 ano'
                        : candidato.anos_experiencia === '1_2'
                        ? '1 a 2 anos'
                        : candidato.anos_experiencia === '3_5'
                        ? '3 a 5 anos'
                        : candidato.anos_experiencia === '5_10'
                        ? '5 a 10 anos'
                        : 'Mais de 10 anos'}
                    </p>
                  </div>

                  {/* Certificações */}
                  {candidato.certificacoes && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Certificações</h4>
                      <p className="text-slate-300">{candidato.certificacoes}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab Vídeo */}
                <TabsContent value="video" className="mt-0">
                  {candidato.video_url ? (
                    <div className="space-y-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                        <video
                          src={candidato.video_url}
                          controls
                          className="w-full h-full object-contain"
                          poster={candidato.foto_url || undefined}
                        />
                      </div>
                      <p className="text-slate-400 text-sm text-center">
                        Vídeo de apresentação do profissional
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">
                        Este profissional não enviou um vídeo de apresentação
                      </p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
