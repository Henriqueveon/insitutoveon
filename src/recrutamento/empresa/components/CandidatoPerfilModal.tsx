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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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
  Shield,
  CheckCircle2,
} from 'lucide-react';
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

interface Candidato {
  id: string;
  nome_completo?: string | null;
  foto_url?: string | null;
  video_url?: string | null;
  documento_url?: string | null;
  cidade?: string | null;
  estado?: string | null;
  bairro?: string | null;
  data_nascimento?: string | null;
  areas_experiencia?: string[] | null;
  anos_experiencia?: string | null;
  pretensao_salarial?: string | null;
  escolaridade?: string | null;
  curso?: string | null;
  certificacoes?: string | null;
  perfil_disc?: string | null;
  disponibilidade_inicio?: string | null;
  disponibilidade_horario?: string | null;
  possui_cnh?: boolean | null;
  possui_veiculo?: boolean | null;
  regime_preferido?: string | null;
  objetivo_profissional?: string | null;
  ultima_empresa?: string | null;
  ultimo_cargo?: string | null;
  tempo_ultima_empresa?: string | null;
  motivo_saida?: string | null;
  aceita_viajar?: boolean | null;
  aceita_mudanca?: boolean | null;
  estado_civil?: string | null;
  tem_filhos?: boolean | null;
  quantidade_filhos?: number | null;
  instagram?: string | null;
  valores_empresa?: string[] | null;
  areas_interesse?: string[] | null;
}

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
  socio_nome?: string | null;
}

interface Props {
  candidato: Candidato | null;
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa | null;
  isFavorito: boolean;
  onToggleFavorito: (id: string) => void;
}

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
  const [showConfirmacaoEntrevista, setShowConfirmacaoEntrevista] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!candidato) return null;

  // Funções auxiliares para nome seguro
  const getNomeCompleto = () => candidato.nome_completo || 'Profissional';
  const getPrimeiroNome = () => {
    const nome = getNomeCompleto();
    return nome.split(' ')[0];
  };
  const getInicialNome = () => {
    const nome = getNomeCompleto();
    return nome.charAt(0).toUpperCase();
  };

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

  const handleAgendarEntrevista = () => {
    if (!empresa) return;

    // Verificar creditos
    if ((empresa.creditos || 0) < 39.9) {
      toast({
        title: 'Creditos insuficientes',
        description: 'Voce precisa de R$ 39,90 em creditos para agendar uma entrevista.',
        variant: 'destructive',
      });
      return;
    }

    setShowConfirmacaoEntrevista(true);
  };

  const confirmarEntrevista = async () => {
    if (!empresa || !candidato) return;

    setIsLoading(true);

    try {
      // Criar proposta de entrevista
      const { error } = await supabase
        .from('propostas_entrevista')
        .insert({
          empresa_id: empresa.id,
          candidato_id: candidato.id,
          status: 'pendente',
          valor_cobrado: 39.9,
        });

      if (error) throw error;

      // Debitar creditos
      await supabase
        .from('empresas_recrutamento')
        .update({ creditos: (empresa.creditos || 0) - 39.9 })
        .eq('id', empresa.id);

      // Criar notificacao para o candidato
      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: candidato.id,
          titulo: 'Nova proposta de entrevista!',
          mensagem: `${empresa.nome_fantasia || empresa.razao_social} quer agendar uma entrevista com voce.`,
          tipo_notificacao: 'entrevista',
        });

      setShowConfirmacaoEntrevista(false);

      toast({
        title: 'Entrevista solicitada!',
        description: 'O candidato recebera sua proposta e entrara em contato.',
      });

      onClose();
    } catch (error) {
      console.error('Erro ao solicitar entrevista:', error);
      toast({
        title: 'Erro ao solicitar',
        description: 'Nao foi possivel solicitar a entrevista. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-800 border-slate-700 p-0">
        {/* Perfil do Candidato */}
            {/* Header com foto e info básica */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={candidato.foto_url || undefined} />
                    <AvatarFallback className="bg-slate-600 text-white text-2xl">
                      {getInicialNome()}
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
                    {getPrimeiroNome()}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-slate-400 text-sm">
                    {(candidato.cidade || candidato.estado) && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {candidato.cidade}{candidato.cidade && candidato.estado && ', '}{candidato.estado}
                      </span>
                    )}
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
                    onClick={handleAgendarEntrevista}
                    className="bg-gradient-to-r from-[#E31E24] to-[#1E3A8A] hover:from-[#E31E24]/90 hover:to-[#1E3A8A]/90"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Entrevista
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
                    {candidato.pretensao_salarial && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4">
                          <DollarSign className="w-5 h-5 text-green-400 mb-2" />
                          <p className="text-xs text-slate-400">Pretensão</p>
                          <p className="text-white font-medium">
                            {getFaixaSalarialLabel(candidato.pretensao_salarial)}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {candidato.disponibilidade_inicio && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4">
                          <Clock className="w-5 h-5 text-blue-400 mb-2" />
                          <p className="text-xs text-slate-400">Disponibilidade</p>
                          <p className="text-white font-medium">
                            {getDisponibilidadeLabel(candidato.disponibilidade_inicio)}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {candidato.regime_preferido && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4">
                          <Building2 className="w-5 h-5 text-purple-400 mb-2" />
                          <p className="text-xs text-slate-400">Regime</p>
                          <p className="text-white font-medium capitalize">
                            {candidato.regime_preferido}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {candidato.escolaridade && (
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
                    )}

                    {candidato.disponibilidade_horario && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4">
                          <Calendar className="w-5 h-5 text-orange-400 mb-2" />
                          <p className="text-xs text-slate-400">Horários</p>
                          <p className="text-white font-medium text-sm">
                            {candidato.disponibilidade_horario}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {candidato.estado_civil && (
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
                    )}
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
                  {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-slate-400" />
                        Áreas de Interesse
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {candidato.areas_interesse.map((area, i) => (
                          <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Valores */}
                  {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-slate-400" />
                        Valores que Busca
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {candidato.valores_empresa.map((valor, i) => (
                          <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                            {valor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Tab Experiência */}
                <TabsContent value="experiencia" className="mt-0 space-y-6">
                  {/* Última experiência */}
                  {(candidato.ultimo_cargo || candidato.ultima_empresa) && (
                    <div>
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                        Última Experiência
                      </h4>
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4">
                          {candidato.ultimo_cargo && (
                            <p className="text-white font-medium">{candidato.ultimo_cargo}</p>
                          )}
                          {candidato.ultima_empresa && (
                            <p className="text-slate-400 text-sm">{candidato.ultima_empresa}</p>
                          )}
                          {candidato.tempo_ultima_empresa && (
                            <p className="text-slate-500 text-sm mt-1">
                              Período: {candidato.tempo_ultima_empresa}
                            </p>
                          )}
                          {candidato.motivo_saida && (
                            <p className="text-slate-400 text-sm mt-2">
                              <span className="text-slate-500">Motivo da saída:</span> {candidato.motivo_saida}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Áreas de experiência */}
                  {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Áreas de Experiência</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidato.areas_experiencia.map((area, i) => (
                          <Badge key={i} className="bg-[#E31E24]/20 text-[#E31E24]">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anos de experiência */}
                  {candidato.anos_experiencia && (
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
                  )}

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
      </DialogContent>
    </Dialog>

    {/* Modal de Confirmacao de Entrevista */}
    <AlertDialog open={showConfirmacaoEntrevista} onOpenChange={setShowConfirmacaoEntrevista}>
      <AlertDialogContent className="bg-gray-900 border-gray-700 max-w-md mx-4">
        <AlertDialogHeader className="text-center">
          {/* Icone com gradiente */}
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-[#E31E24]/20 to-[#1E3A8A]/20 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>

          <AlertDialogTitle className="text-xl text-white text-center">
            Parece que voce encontrou um otimo profissional, {empresa?.socio_nome?.split(' ')[0] || 'Parceiro'}!
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="text-center space-y-4 pt-4">
              {/* Card do candidato */}
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
                {candidato.foto_url ? (
                  <img
                    src={candidato.foto_url}
                    alt={getNomeCompleto()}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-400">
                      {getInicialNome()}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="font-medium text-white">{getPrimeiroNome()}</p>
                  <p className="text-sm text-gray-400">{candidato.cidade}, {candidato.estado}</p>
                </div>
              </div>

              {/* Card de protecao */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Investimento protegido</p>
                    <p className="text-gray-300 text-sm">
                      Ao confirmar, voce investe <span className="text-white font-semibold">R$ 39,90</span> para
                      agendar esta entrevista. <span className="text-green-400 font-medium">Voce so paga se o
                      candidato aceitar!</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Beneficios */}
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Candidato demonstra compromisso pagando R$ 9,90</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Evite perda de tempo com profissionais sem interesse</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Reembolso automatico se nao houver aceite</span>
                </div>
              </div>

              {/* Texto pequeno */}
              <p className="text-xs text-gray-500 pt-2">
                Ao aceitar, o candidato paga R$ 9,90 demonstrando absoluto compromisso com sua empresa.
                Assim voce evita perda de tempo com profissionais que nao tem comprometimento real.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white">
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmarEntrevista}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#E31E24] to-[#1E3A8A] hover:from-[#E31E24]/90 hover:to-[#1E3A8A]/90 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Confirmar Entrevista
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
