// =====================================================
// PERFIL INSTAGRAM CANDIDATO - Design estilo Instagram
// Visualização do perfil profissional
// =====================================================

import { useState, useEffect } from "react";
import {
  Bell,
  MoreVertical,
  Eye,
  Bookmark,
  BookmarkCheck,
  Plus,
  X,
  Play,
  Briefcase,
  GraduationCap,
  MapPin,
  Clock,
  Car,
  Plane,
  Home,
  Star,
  CheckCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface PerfilInstagramCandidatoProps {
  candidatoId: string;
  modoVisualizacao?: "candidato" | "empresa";
  empresaId?: string;
  onClose?: () => void;
  onAgendarEntrevista?: (candidatoId: string) => void;
}

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url: string | null;
  cidade: string | null;
  estado: string | null;
  perfil_disc: string | null;
  headline: string | null;
  bio: string | null;
  objetivo_profissional: string | null;
  total_visualizacoes: number;
  total_propostas_recebidas: number;
  total_candidaturas: number;
  anos_experiencia: number | null;
  ultimo_cargo: string | null;
  ultima_empresa: string | null;
  tempo_ultima_empresa: string | null;
  areas_experiencia: string[] | null;
  escolaridade: string | null;
  curso: string | null;
  disponibilidade_inicio: string | null;
  disponibilidade_horario: string | null;
  regime_preferido: string | null;
  pretensao_salarial: string | null;
  possui_cnh: string | null;
  possui_veiculo: string | null;
  aceita_viajar: string | null;
  aceita_mudanca: string | null;
  areas_interesse: string[] | null;
  valores_empresa: string[] | null;
  data_nascimento: string | null;
}

interface Destaque {
  id: string;
  titulo: string;
  icone: string;
  ordem: number;
  midias: { id: string; url: string; tipo: string }[];
}

export function PerfilInstagramCandidato({
  candidatoId,
  modoVisualizacao = "empresa",
  empresaId,
  onClose,
  onAgendarEntrevista,
}: PerfilInstagramCandidatoProps) {
  const { toast } = useToast();
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [destaques, setDestaques] = useState<Destaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [showCurriculo, setShowCurriculo] = useState(false);
  const [showAgendarDialog, setShowAgendarDialog] = useState(false);
  const [agendando, setAgendando] = useState(false);

  useEffect(() => {
    if (candidatoId) {
      carregarPerfil();
      carregarDestaques();
      if (modoVisualizacao === "empresa") {
        registrarVisualizacao();
        verificarSalvo();
      }
    }
  }, [candidatoId]);

  const carregarPerfil = async () => {
    const { data, error } = await supabase
      .from("candidatos_recrutamento")
      .select("*")
      .eq("id", candidatoId)
      .single();

    if (data) {
      setCandidato({
        ...data,
        total_visualizacoes: data.total_visualizacoes ?? 0,
        total_propostas_recebidas: data.total_propostas_recebidas ?? 0,
        total_candidaturas: data.total_candidaturas ?? 0,
      });
    }
    setLoading(false);
  };

  const carregarDestaques = async () => {
    const { data } = await supabase
      .from("destaques_candidato")
      .select(`*, midias:midias_destaque(*)`)
      .eq("candidato_id", candidatoId)
      .order("ordem");

    if (data) setDestaques(data as Destaque[]);
  };

  const registrarVisualizacao = async () => {
    if (!empresaId) return;
    try {
      await supabase.rpc("registrar_visualizacao_perfil", {
        p_candidato_id: candidatoId,
        p_empresa_id: empresaId,
      });
    } catch (error) {
      console.error("Erro ao registrar visualização:", error);
    }
  };

  const verificarSalvo = async () => {
    if (!empresaId) return;
    const { data } = await supabase
      .from("candidatos_salvos")
      .select("id")
      .eq("candidato_id", candidatoId)
      .eq("empresa_id", empresaId)
      .single();

    setSalvo(!!data);
  };

  const toggleSalvar = async () => {
    if (!empresaId) return;
    setSalvando(true);

    try {
      if (salvo) {
        await supabase
          .from("candidatos_salvos")
          .delete()
          .eq("candidato_id", candidatoId)
          .eq("empresa_id", empresaId);
        setSalvo(false);
        toast({ title: "Candidato removido dos salvos" });
      } else {
        await supabase
          .from("candidatos_salvos")
          .insert({ candidato_id: candidatoId, empresa_id: empresaId });
        setSalvo(true);
        toast({ title: "Candidato salvo!" });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSalvando(false);
    }
  };

  const handleAgendarEntrevista = async () => {
    setAgendando(true);
    try {
      if (onAgendarEntrevista) {
        onAgendarEntrevista(candidatoId);
      }
      toast({ title: "Solicitação de entrevista enviada!" });
      setShowAgendarDialog(false);
    } catch (error) {
      toast({ title: "Erro ao agendar", variant: "destructive" });
    } finally {
      setAgendando(false);
    }
  };

  // Cores do DISC - TEXTO COLORIDO SEM FUNDO
  const getCorDISC = (perfil: string) => {
    const letra = perfil.charAt(0).toUpperCase();
    const cores: Record<string, string> = {
      "D": "text-red-500",
      "I": "text-yellow-400",
      "S": "text-green-500",
      "C": "text-blue-500",
    };
    return cores[letra] || "text-gray-400";
  };

  const getNomeDISC = (letra: string) => {
    const nomes: Record<string, string> = {
      "D": "Dominante",
      "I": "Influente",
      "S": "Estável",
      "C": "Conforme",
    };
    return nomes[letra.toUpperCase()] || letra;
  };

  const extrairPerfisDISC = (perfilDisc: string | null) => {
    if (!perfilDisc) return [];
    return perfilDisc.split("").filter(l => ["D", "I", "S", "C"].includes(l.toUpperCase())).slice(0, 2);
  };

  const getFaixaSalarialLabel = (faixa: string | null) => {
    if (!faixa) return null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!candidato) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Candidato não encontrado</p>
      </div>
    );
  }

  const perfisDISC = extrairPerfisDISC(candidato.perfil_disc);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        {onClose && (
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
        )}
        <div className="flex-1" />
        <div className="flex gap-4">
          <Bell className="w-6 h-6 text-white" />
          <MoreVertical className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-6 pb-8">

        {/* Foto + Estatísticas - Layout horizontal */}
        <div className="flex items-start gap-6 mb-6">
          {/* Foto com borda gradiente estilo Instagram */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="w-full h-full rounded-full bg-black p-[2px]">
                <img
                  src={candidato.foto_url || "/placeholder-avatar.png"}
                  alt={candidato.nome_completo}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(candidato.nome_completo) + "&background=374151&color=fff";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Estatísticas ao lado da foto */}
          <div className="flex flex-1 justify-around pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold">{candidato.total_visualizacoes}</p>
              <p className="text-xs text-gray-400">visualizações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{candidato.total_propostas_recebidas}</p>
              <p className="text-xs text-gray-400">propostas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{candidato.total_candidaturas}</p>
              <p className="text-xs text-gray-400">se candidatou</p>
            </div>
          </div>
        </div>

        {/* Nome e Informações */}
        <div className="mb-4">
          {/* Nome + Headline na mesma linha */}
          <h1 className="text-lg font-semibold text-white">
            {candidato.nome_completo}
            {candidato.headline && (
              <span className="text-white font-normal"> - {candidato.headline}</span>
            )}
          </h1>

          {/* Bio */}
          {(candidato.bio || candidato.objetivo_profissional) && (
            <p className="text-gray-300 text-sm mt-1">
              {candidato.bio || candidato.objetivo_profissional}
            </p>
          )}

          {/* Anos de experiência */}
          {candidato.anos_experiencia && candidato.anos_experiencia > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              + de {candidato.anos_experiencia} anos de experiência
            </p>
          )}

          {/* Localização - NEGRITO */}
          {(candidato.cidade || candidato.estado) && (
            <p className="text-white font-semibold text-sm mt-1">
              {candidato.cidade}{candidato.cidade && candidato.estado && " - "}{candidato.estado}
            </p>
          )}
        </div>

        {/* Perfil DISC - TEXTO COLORIDO SEM FUNDO */}
        {perfisDISC.length > 0 && (
          <div className="flex gap-4 mb-6">
            {perfisDISC.map((letra, index) => (
              <span
                key={index}
                className={`text-lg font-semibold ${getCorDISC(letra)}`}
              >
                {getNomeDISC(letra)}
              </span>
            ))}
          </div>
        )}

        {/* Botões de Ação - Fundo branco, ícone/texto preto */}
        {modoVisualizacao === "empresa" && (
          <div className="flex gap-3 mb-8">
            {/* Botão Olho - Ver Currículo */}
            <Button
              variant="outline"
              className="flex-1 h-12 bg-white hover:bg-gray-100 text-black border-0 rounded-lg"
              onClick={() => setShowCurriculo(true)}
            >
              <Eye className="w-6 h-6 text-black" />
            </Button>

            {/* Botão Agendar Entrevista */}
            <Button
              variant="outline"
              className="flex-[2] h-12 bg-white hover:bg-gray-100 text-black border-0 rounded-lg font-medium"
              onClick={() => setShowAgendarDialog(true)}
            >
              Agendar Entrevista
            </Button>

            {/* Botão Salvar/Favoritar */}
            <Button
              variant="outline"
              className="h-12 w-12 bg-white hover:bg-gray-100 text-black border-0 rounded-lg p-0"
              onClick={toggleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <Loader2 className="w-6 h-6 text-black animate-spin" />
              ) : salvo ? (
                <BookmarkCheck className="w-6 h-6 text-black fill-black" />
              ) : (
                <Bookmark className="w-6 h-6 text-black" />
              )}
            </Button>
          </div>
        )}

        {/* Destaques (Stories) - Círculos com fundo azul escuro */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {/* Botão Adicionar - só para candidato */}
          {modoVisualizacao === "candidato" && (
            <div className="flex flex-col items-center gap-2 min-w-[70px]">
              <button className="w-16 h-16 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center hover:border-gray-400 transition-colors">
                <Plus className="w-6 h-6 text-gray-500" />
              </button>
              <span className="text-xs text-gray-400">Adicionar</span>
            </div>
          )}

          {/* Destaques existentes */}
          {destaques.map((destaque) => (
            <DestaqueCirculo
              key={destaque.id}
              destaque={destaque}
              onClick={() => {/* TODO: Abrir visualizador */}}
            />
          ))}

          {/* Destaques padrão se não houver */}
          {destaques.length === 0 && (
            <>
              <DestaqueCirculoPadrao icone="📋" titulo="Projetos" />
              <DestaqueCirculoPadrao icone="🎬" titulo="Trabalhos" />
              <DestaqueCirculoPadrao icone="💡" titulo="Ideias" />
            </>
          )}
        </div>
      </div>

      {/* Modal Currículo Completo */}
      {showCurriculo && (
        <ModalCurriculoCompleto
          candidato={candidato}
          onClose={() => setShowCurriculo(false)}
        />
      )}

      {/* Dialog Agendar Entrevista */}
      <AlertDialog open={showAgendarDialog} onOpenChange={setShowAgendarDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E31E24]" />
              Agendar Entrevista
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Deseja enviar uma solicitação de entrevista para{" "}
              <span className="text-white font-medium">{candidato.nome_completo}</span>?
              <br />
              O candidato receberá uma notificação e poderá confirmar ou sugerir outro horário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAgendarEntrevista}
              disabled={agendando}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C41920] hover:to-[#9B1818]"
            >
              {agendando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitação"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente do círculo de destaque
function DestaqueCirculo({ destaque, onClick }: { destaque: Destaque; onClick: () => void }) {
  const thumbnail = destaque.midias?.[0]?.url;

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 min-w-[70px]">
      {/* Círculo com fundo azul escuro */}
      <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{destaque.icone || "📌"}</span>
        )}
      </div>
      <span className="text-xs text-gray-300 truncate max-w-[70px]">{destaque.titulo}</span>
    </button>
  );
}

// Círculo padrão quando não tem destaques
function DestaqueCirculoPadrao({ icone, titulo }: { icone: string; titulo: string }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[70px]">
      <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center">
        <span className="text-2xl">{icone}</span>
      </div>
      <span className="text-xs text-gray-300">{titulo}</span>
    </div>
  );
}

// Modal do Currículo Completo
function ModalCurriculoCompleto({ candidato, onClose }: { candidato: Candidato; onClose: () => void }) {
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

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="max-w-2xl mx-auto pt-16 pb-8 space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Currículo Completo</h2>

          {/* Vídeo de Apresentação */}
          {candidato.video_url && (
            <div className="bg-slate-800/60 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Vídeo de Apresentação
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  src={candidato.video_url}
                  controls
                  className="w-full h-full object-contain"
                  poster={candidato.foto_url || undefined}
                />
              </div>
            </div>
          )}

          {/* Experiência */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Experiência Profissional
            </h3>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-white font-medium">{candidato.ultimo_cargo || 'Não informado'}</p>
              <p className="text-gray-400 text-sm">{candidato.ultima_empresa || 'Não informado'}</p>
              {candidato.tempo_ultima_empresa && (
                <p className="text-gray-500 text-xs mt-1">
                  Período: {candidato.tempo_ultima_empresa}
                </p>
              )}
            </div>
            {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {candidato.areas_experiencia.map((area, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-700 text-gray-300">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Formação */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Formação
            </h3>
            <p className="text-white">{candidato.escolaridade || 'Não informado'}</p>
            {candidato.curso && (
              <p className="text-gray-400 text-sm">{candidato.curso}</p>
            )}
          </div>

          {/* Disponibilidade */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Disponibilidade
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Início</p>
                <p className="text-white text-sm">
                  {getDisponibilidadeLabel(candidato.disponibilidade_inicio)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Horário</p>
                <p className="text-white text-sm">{candidato.disponibilidade_horario || 'Não informado'}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Regime</p>
                <p className="text-white text-sm capitalize">{candidato.regime_preferido || 'Não informado'}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Pretensão</p>
                <p className="text-white text-sm">
                  {getFaixaSalarialLabel(candidato.pretensao_salarial)}
                </p>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-slate-800/60 rounded-xl p-4">
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
                  Veículo
                </Badge>
              )}
              {candidato.aceita_viajar && (
                <Badge className="bg-purple-500/20 text-purple-400">
                  <Plane className="w-3 h-3 mr-1" />
                  Aceita viajar
                </Badge>
              )}
              {candidato.aceita_mudanca && (
                <Badge className="bg-orange-500/20 text-orange-400">
                  <Home className="w-3 h-3 mr-1" />
                  Aceita mudança
                </Badge>
              )}
            </div>
          </div>

          {/* Áreas de interesse */}
          {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
            <div className="bg-slate-800/60 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Áreas de Interesse
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidato.areas_interesse.map((area, i) => (
                  <Badge key={i} variant="outline" className="border-slate-600 text-gray-300">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Valores */}
          {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
            <div className="bg-slate-800/60 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                O que busca em uma empresa
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidato.valores_empresa.map((valor, i) => (
                  <Badge key={i} variant="outline" className="border-slate-600 text-gray-300">
                    {valor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PerfilInstagramCandidato;
