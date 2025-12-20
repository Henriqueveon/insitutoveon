// =====================================================
// MODAL PERFIL PROFISSIONAL - Design Instagram Style
// Visualização do profissional + envio de proposta
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
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
  Play,
  Eye,
  Calendar,
  Loader2,
  Shield,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Building2,
  User,
  Star,
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
  cidade?: string | null;
  estado?: string | null;
  bairro?: string | null;
  data_nascimento?: string | null;
  areas_experiencia?: string[] | null;
  anos_experiencia?: string | null;
  pretensao_salarial?: string | null;
  escolaridade?: string | null;
  curso?: string | null;
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
  headline?: string | null;
  bio?: string | null;
  total_visualizacoes?: number;
  total_propostas_recebidas?: number;
  total_candidaturas?: number;
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

// Cores DISC
const coresDISC: Record<string, { bg: string; text: string; gradient: string }> = {
  D: { bg: 'bg-red-500', text: 'text-white', gradient: 'from-red-500 to-red-600' },
  I: { bg: 'bg-yellow-500', text: 'text-black', gradient: 'from-yellow-400 to-yellow-500' },
  S: { bg: 'bg-green-500', text: 'text-white', gradient: 'from-green-500 to-green-600' },
  C: { bg: 'bg-blue-500', text: 'text-white', gradient: 'from-blue-500 to-blue-600' },
};

const nomesDISC: Record<string, string> = {
  D: 'Dominante',
  I: 'Influente',
  S: 'Estável',
  C: 'Conforme',
};

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
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen && candidato && empresa) {
      registrarVisualizacao();
    }
  }, [isOpen, candidato?.id, empresa?.id]);

  if (!candidato) return null;

  const getNomeCompleto = () => candidato.nome_completo || 'Profissional';
  const getPrimeiroNome = () => getNomeCompleto().split(' ')[0];
  const getInicialNome = () => getNomeCompleto().charAt(0).toUpperCase();

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

  const registrarVisualizacao = async () => {
    if (!empresa?.id || !candidato?.id) return;
    try {
      await supabase.rpc('registrar_visualizacao_perfil', {
        p_candidato_id: candidato.id,
        p_empresa_id: empresa.id,
      });
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  const getFaixaSalarialLabel = (faixa: string | null) => {
    if (!faixa) return 'Não informado';
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

  const getDisponibilidadeLabel = (disp: string | null) => {
    if (!disp) return 'Não informado';
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

    if ((empresa.creditos || 0) < 39.9) {
      toast({
        title: 'Créditos insuficientes',
        description: 'Você precisa de R$ 39,90 em créditos para agendar uma entrevista.',
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
      const { error } = await supabase
        .from('propostas_recrutamento')
        .insert({
          empresa_id: empresa.id,
          candidato_id: candidato.id,
          status: 'pendente',
          valor_cobrado: 39.9,
        });

      if (error) throw error;

      await supabase
        .from('empresas_recrutamento')
        .update({ creditos: (empresa.creditos || 0) - 39.9 })
        .eq('id', empresa.id);

      await supabase
        .from('notificacoes_recrutamento')
        .insert({
          tipo_destinatario: 'candidato',
          destinatario_id: candidato.id,
          titulo: 'Nova proposta de entrevista!',
          mensagem: `${empresa.nome_fantasia || empresa.razao_social} quer agendar uma entrevista com você.`,
          tipo_notificacao: 'entrevista',
        });

      setShowConfirmacaoEntrevista(false);

      toast({
        title: 'Entrevista solicitada!',
        description: 'O candidato receberá sua proposta e entrará em contato.',
      });

      onClose();
    } catch (error) {
      console.error('Erro ao solicitar entrevista:', error);
      toast({
        title: 'Erro ao solicitar',
        description: 'Não foi possível solicitar a entrevista. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSalvar = async () => {
    if (!empresa?.id || !candidato?.id) return;
    setSalvando(true);
    try {
      onToggleFavorito(candidato.id);
    } finally {
      setSalvando(false);
    }
  };

  const getPerfisDisc = () => {
    if (!candidato.perfil_disc) return [];
    return candidato.perfil_disc.split(/[\s,]+/).filter(Boolean).slice(0, 2);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden bg-black border-gray-800 p-0 gap-0">
          {/* ========== HEADER INSTAGRAM STYLE ========== */}
          <div className="bg-black text-white">
            {/* Botão Fechar */}
            <div className="flex justify-end p-2">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Foto + Stats */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-4 mb-4">
                {/* Foto com borda gradiente Instagram */}
                <div className="relative flex-shrink-0">
                  <div className="w-[80px] h-[80px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                      {candidato.foto_url ? (
                        <img
                          src={candidato.foto_url}
                          alt={getNomeCompleto()}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {getInicialNome()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="flex flex-1 justify-around text-center">
                  <div>
                    <p className="text-lg font-bold">{candidato.total_visualizacoes || 0}</p>
                    <p className="text-[10px] text-gray-400">visualizações</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{candidato.total_propostas_recebidas || 0}</p>
                    <p className="text-[10px] text-gray-400">propostas</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{candidato.total_candidaturas || 0}</p>
                    <p className="text-[10px] text-gray-400">candidaturas</p>
                  </div>
                </div>
              </div>

              {/* Nome e Bio */}
              <div className="mb-3">
                <h1 className="text-base font-semibold">
                  {getPrimeiroNome()}
                  {candidato.headline && (
                    <span className="font-normal text-gray-300"> - {candidato.headline}</span>
                  )}
                </h1>

                {candidato.objetivo_profissional && (
                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                    {candidato.objetivo_profissional}
                  </p>
                )}

                {candidato.anos_experiencia && (
                  <p className="text-gray-400 text-xs mt-1">
                    + de {candidato.anos_experiencia} anos de experiência
                  </p>
                )}

                {(candidato.cidade || candidato.estado) && (
                  <p className="text-white text-xs mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[candidato.cidade, candidato.estado].filter(Boolean).join(' - ')}
                  </p>
                )}
              </div>

              {/* Perfil DISC */}
              {candidato.perfil_disc && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {getPerfisDisc().map((perfil) => {
                    const cores = coresDISC[perfil] || { bg: 'bg-gray-500', text: 'text-white' };
                    const nome = nomesDISC[perfil] || perfil;
                    return (
                      <Badge
                        key={perfil}
                        className={`${cores.bg} ${cores.text} px-2 py-0.5 text-xs font-medium`}
                      >
                        {nome}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-white text-black hover:bg-gray-100 border-0 h-8 text-xs"
                  onClick={() => setTabAtiva('video')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver mais
                </Button>

                <Button
                  className="flex-[2] bg-gradient-to-r from-[#E31E24] to-[#C91920] hover:from-[#C91920] hover:to-[#A91519] h-8 text-xs font-semibold"
                  onClick={handleAgendarEntrevista}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Agendar Entrevista
                </Button>

                <Button
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 border-0 h-8 px-2"
                  onClick={toggleSalvar}
                  disabled={salvando}
                >
                  {salvando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFavorito ? (
                    <BookmarkCheck className="w-4 h-4 fill-black" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ========== TABS DE CONTEÚDO ========== */}
          <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="flex-1 bg-slate-900">
            <TabsList className="w-full bg-slate-800 rounded-none border-b border-slate-700 h-10">
              <TabsTrigger value="perfil" className="flex-1 data-[state=active]:bg-slate-700 text-xs">
                Perfil
              </TabsTrigger>
              <TabsTrigger value="experiencia" className="flex-1 data-[state=active]:bg-slate-700 text-xs">
                Experiência
              </TabsTrigger>
              <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-slate-700 text-xs">
                Vídeo
              </TabsTrigger>
            </TabsList>

            <div className="p-4 overflow-y-auto max-h-[35vh]">
              {/* Tab Perfil */}
              <TabsContent value="perfil" className="mt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {candidato.pretensao_salarial && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3">
                        <DollarSign className="w-4 h-4 text-green-400 mb-1" />
                        <p className="text-[10px] text-slate-400">Pretensão</p>
                        <p className="text-white text-xs font-medium">
                          {getFaixaSalarialLabel(candidato.pretensao_salarial)}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {candidato.disponibilidade_inicio && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3">
                        <Clock className="w-4 h-4 text-blue-400 mb-1" />
                        <p className="text-[10px] text-slate-400">Disponibilidade</p>
                        <p className="text-white text-xs font-medium">
                          {getDisponibilidadeLabel(candidato.disponibilidade_inicio)}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {candidato.regime_preferido && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3">
                        <Building2 className="w-4 h-4 text-purple-400 mb-1" />
                        <p className="text-[10px] text-slate-400">Regime</p>
                        <p className="text-white text-xs font-medium capitalize">
                          {candidato.regime_preferido}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {candidato.escolaridade && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3">
                        <GraduationCap className="w-4 h-4 text-amber-400 mb-1" />
                        <p className="text-[10px] text-slate-400">Escolaridade</p>
                        <p className="text-white text-xs font-medium capitalize">
                          {candidato.escolaridade.replace(/_/g, ' ')}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {candidato.possui_cnh && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3">
                        <Car className="w-4 h-4 text-cyan-400 mb-1" />
                        <p className="text-[10px] text-slate-400">CNH</p>
                        <p className="text-white text-xs font-medium">
                          {candidato.possui_cnh ? 'Sim' : 'Não'}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {candidato.aceita_viajar !== null && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3">
                        <Plane className="w-4 h-4 text-indigo-400 mb-1" />
                        <p className="text-[10px] text-slate-400">Viagem</p>
                        <p className="text-white text-xs font-medium">
                          {candidato.aceita_viajar ? 'Aceita' : 'Não aceita'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Áreas de interesse */}
                {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Áreas de interesse</p>
                    <div className="flex flex-wrap gap-1">
                      {candidato.areas_interesse.map((area) => (
                        <Badge key={area} variant="secondary" className="bg-slate-700 text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab Experiência */}
              <TabsContent value="experiencia" className="mt-0 space-y-3">
                {candidato.ultima_empresa && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-white text-sm font-medium">{candidato.ultimo_cargo || 'Cargo não informado'}</p>
                          <p className="text-slate-400 text-xs">{candidato.ultima_empresa}</p>
                          {candidato.tempo_ultima_empresa && (
                            <p className="text-slate-500 text-xs mt-1">{candidato.tempo_ultima_empresa}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Áreas de experiência</p>
                    <div className="flex flex-wrap gap-1">
                      {candidato.areas_experiencia.map((area) => (
                        <Badge key={area} variant="secondary" className="bg-slate-700 text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {candidato.curso && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-white text-sm font-medium">{candidato.curso}</p>
                          <p className="text-slate-400 text-xs">{candidato.escolaridade?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab Vídeo */}
              <TabsContent value="video" className="mt-0">
                {candidato.video_url ? (
                  <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                    <video
                      src={candidato.video_url}
                      controls
                      className="w-full h-full object-contain"
                      poster={candidato.foto_url || undefined}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Vídeo não disponível</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Entrevista */}
      <AlertDialog open={showConfirmacaoEntrevista} onOpenChange={setShowConfirmacaoEntrevista}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E31E24]" />
              Confirmar Entrevista
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Parece que você encontrou um ótimo profissional, {empresa?.socio_nome?.split(' ')[0] || 'Parceiro'}!
              <br /><br />
              Ao confirmar, você irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Enviar uma proposta de entrevista para <strong>{getPrimeiroNome()}</strong></li>
                <li>Utilizar <strong>R$ 39,90</strong> dos seus créditos</li>
                <li>Receber os dados de contato do candidato</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEntrevista}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#E31E24] to-[#C91920] hover:from-[#C91920] hover:to-[#A91519]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar (R$ 39,90)
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
