// =====================================================
// PERFIL CANDIDATO - Design Moderno com Carrosséis
// Visualização do perfil profissional
// Suporta modo empresa e modo candidato (com edição)
// Integração com Cloudflare R2 para uploads
// =====================================================

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Menu,
  Eye,
  Bookmark,
  BookmarkCheck,
  Plus,
  X,
  Play,
  Briefcase,
  GraduationCap,
  Clock,
  Car,
  Plane,
  Home,
  Star,
  CheckCircle,
  Calendar,
  Loader2,
  Settings,
  Edit3,
  Share2,
  Camera,
  Check,
  Video,
  Pencil,
  Trash2,
  User,
  Target,
  Shield,
  HelpCircle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUploadMidia } from "@/hooks/useUploadMidia";
import { ModalAdicionarDestaque } from "./ModalAdicionarDestaque";
import { InteresseAtuacaoTags } from "@/recrutamento/components/InteresseAtuacaoTags";
import { MicroIconeDisc } from "@/recrutamento/components/MicroIconeDisc";
import { UsernameInput } from "@/recrutamento/components/UsernameInput";
import { RelatorioDiscModal } from "@/recrutamento/candidato/components/RelatorioDiscModal";
import { useNavigate } from "react-router-dom";

interface PerfilInstagramCandidatoProps {
  candidatoId: string;
  modoVisualizacao?: "candidato" | "empresa";
  empresaId?: string;
  onClose?: () => void;
  onAgendarEntrevista?: (candidatoId: string) => void;
  onPerfilAtualizado?: () => void;
}

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url: string | null;
  cidade: string | null;
  estado: string | null;
  bairro: string | null;
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
  disponibilidade_tipo: string | null;
  disponibilidade_data: string | null;
  regime_preferido: string | null;
  pretensao_salarial: string | null;
  possui_cnh: string | null;
  possui_veiculo: string | null;
  aceita_viajar: string | null;
  aceita_mudanca: string | null;
  areas_interesse: string[] | null;
  valores_empresa: string[] | null;
  data_nascimento: string | null;
  status: string | null;
  email: string | null;
  telefone: string | null;
  created_at: string | null;
  username: string | null;
  // Campos DISC
  perfil_natural?: Record<string, number> | null;
  confiabilidade_score?: number | null;
  confiabilidade_nivel?: string | null;
  disc_realizado_em?: string | null;
}

interface Destaque {
  id: string;
  titulo: string;
  icone: string;
  ordem: number;
  capa_url?: string | null;
  midias: { id: string; url: string; tipo: string }[];
}

export function PerfilInstagramCandidato({
  candidatoId,
  modoVisualizacao = "empresa",
  empresaId,
  onClose,
  onAgendarEntrevista,
  onPerfilAtualizado,
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

  // Estados para modo candidato
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);
  const [showAdicionarDestaque, setShowAdicionarDestaque] = useState(false);
  const [showVisualizarDestaque, setShowVisualizarDestaque] = useState<Destaque | null>(null);

  // Novos estados para o redesign
  const [showMenu, setShowMenu] = useState(false);
  const [abaAberta, setAbaAberta] = useState<string | null>(null);
  const [showRelatorioDisc, setShowRelatorioDisc] = useState(false);

  const navigate = useNavigate();

  // Ref para input de foto
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const { uploadMidia, uploading: uploadingFoto } = useUploadMidia();

  useEffect(() => {
    if (candidatoId) {
      carregarPerfil();
      carregarDestaques();
      if (modoVisualizacao === "empresa" && empresaId) {
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

  const compartilharPerfil = async () => {
    const url = `${window.location.origin}/c/${candidatoId.substring(0, 8)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Currículo - ${candidato?.nome_completo}`,
          text: "Confira meu currículo profissional",
          url,
        });
      } catch (e) {
        navigator.clipboard.writeText(url);
        toast({ title: "Link copiado!" });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copiado!" });
    }
  };

  // Handler para trocar foto de perfil
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Selecione uma imagem (JPG, PNG, WebP ou GIF).",
        variant: "destructive",
      });
      return;
    }

    const result = await uploadMidia(file, candidatoId, "fotos-perfil");
    if (result) {
      await supabase
        .from("candidatos_recrutamento")
        .update({ foto_url: result.url })
        .eq("id", candidatoId);

      carregarPerfil();
      toast({ title: "Foto atualizada!" });
    }
  };

  // Formatar data
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  // Parse interesses de atuação (JSONB pode vir como string ou array)
  const parseInteresses = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) return [value];
    return [];
  };

  // Calcular idade a partir da data de nascimento
  const calcularIdade = (dataNascimento: string | null): number | null => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // Formatar disponibilidade para exibição
  const formatarDisponibilidade = (tipo: string | null, data?: string | null) => {
    if (!tipo) return "Imediato";
    switch (tipo) {
      case "imediata":
        return "Imediato";
      case "em_30_dias":
        return "Em 30 dias";
      case "a_combinar":
        return "A combinar";
      case "a_partir_de":
        if (data) {
          return new Date(data).toLocaleDateString("pt-BR");
        }
        return "A definir";
      case "indisponivel":
        return "Indisponível";
      default:
        return "Imediato";
    }
  };

  // Descrição do DISC
  const getDescricaoDISC = (perfil: string | null) => {
    if (!perfil) return "Realize o teste DISC para descobrir seu perfil comportamental.";
    const letra = perfil.charAt(0).toUpperCase();
    const descricoes: Record<string, string> = {
      D: "Pessoas com perfil Dominante são diretas, decididas e focadas em resultados. Gostam de desafios e de assumir o controle.",
      I: "Pessoas com perfil Influente são comunicativas, entusiastas e otimistas. Gostam de interagir e motivar os outros.",
      S: "Pessoas com perfil Estável são pacientes, leais e boas ouvintes. Valorizam harmonia e trabalho em equipe.",
      C: "Pessoas com perfil Conforme são analíticas, precisas e focadas em qualidade. Valorizam dados e procedimentos.",
    };
    return descricoes[letra] || "Perfil comportamental identificado.";
  };

  // Cores do DISC - TEXTO COLORIDO SEM FUNDO
  const getCorDISC = (perfil: string) => {
    const letra = perfil.charAt(0).toUpperCase();
    const cores: Record<string, string> = {
      D: "text-red-500",
      I: "text-yellow-400",
      S: "text-green-500",
      C: "text-blue-500",
    };
    return cores[letra] || "text-gray-400";
  };

  const getNomeDISC = (letra: string) => {
    const nomes: Record<string, string> = {
      D: "Dominante",
      I: "Influente",
      S: "Estável",
      C: "Conforme",
    };
    return nomes[letra.toUpperCase()] || letra;
  };

  const extrairPerfisDISC = (perfilDisc: string | null) => {
    if (!perfilDisc) return [];
    return perfilDisc
      .split("")
      .filter((l) => ["D", "I", "S", "C"].includes(l.toUpperCase()))
      .slice(0, 2);
  };

  // Função para calcular dias restantes para refazer o teste DISC (21 dias)
  const calcularDiasParaRefazer = (discRealizadoEm: string | null | undefined): number => {
    if (!discRealizadoEm) return 0;
    const dataRealizacao = new Date(discRealizadoEm);
    const dataLiberacao = new Date(dataRealizacao);
    dataLiberacao.setDate(dataLiberacao.getDate() + 21);
    const hoje = new Date();
    const diffTime = dataLiberacao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const diasParaRefazer = calcularDiasParaRefazer(candidato?.disc_realizado_em);
  const podeRefazerDisc = diasParaRefazer === 0;

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

  // Abas do carrossel de informações
  const ABAS_INFO = [
    { id: "disc", label: "DISC", icon: Target },
    { id: "experiencias", label: "EXPERIÊNCIAS", icon: Briefcase },
    { id: "formacoes", label: "FORMAÇÕES", icon: GraduationCap },
    { id: "info_pessoais", label: "INFO PESSOAIS", icon: User },
    { id: "disponibilidade", label: "DISPONIBILIDADE", icon: Clock },
    { id: "extracurriculares", label: "EXTRAS", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-6 pb-20">
      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="text-white p-2 -ml-2">
              <X className="w-6 h-6" />
            </button>
          )}
          <span className="text-gray-500 text-xs">
            Na plataforma desde: {candidato.created_at
              ? new Date(candidato.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
              : '-'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2">
            <Bell className="w-6 h-6 text-white" />
          </button>
          {modoVisualizacao === "candidato" && (
            <button onClick={() => setShowMenu(true)} className="p-2">
              <Menu className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Username */}
      {candidato.username && (
        <p className="text-xs text-gray-500">@{candidato.username}</p>
      )}

      {/* Nome do usuário */}
      <h1 className="text-2xl font-bold text-white">{candidato.nome_completo}</h1>

      {/* Idade */}
      {candidato.data_nascimento && calcularIdade(candidato.data_nascimento) && (
        <p className="text-sm text-gray-500">
          {calcularIdade(candidato.data_nascimento)} anos
        </p>
      )}

      {/* Título Profissional + Disponibilidade */}
      <div className="flex justify-between items-center w-full mt-1 mb-4">
        {/* Título - Esquerda */}
        {candidato.headline ? (
          <p className="text-sm font-semibold text-gray-400">
            {candidato.headline}
          </p>
        ) : (
          <div />
        )}

        {/* Disponibilidade - Direita */}
        <span className={`text-xs px-2 py-0.5 rounded ${
          candidato.disponibilidade_tipo === "indisponivel"
            ? "bg-red-500/20 text-red-400 border border-red-500/40"
            : "bg-gray-800 text-gray-400"
        }`}>
          {candidato.disponibilidade_tipo === "indisponivel" ? "" : "Disponível: "}
          {formatarDisponibilidade(candidato.disponibilidade_tipo, candidato.disponibilidade_data)}
        </span>
      </div>

      {/* ============================================= */}
      {/* FOTO + BIO + ESTATÍSTICAS */}
      {/* ============================================= */}
      <div className="flex gap-4 mb-6">
        {/* Foto de perfil - Clicável para trocar (apenas para o próprio candidato) */}
        <div className="relative flex-shrink-0">
          {modoVisualizacao === "candidato" ? (
            <label className="cursor-pointer block">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 hover:border-blue-500 hover:opacity-90 transition-all">
                {candidato.foto_url ? (
                  <img
                    src={candidato.foto_url}
                    alt={candidato.nome_completo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(candidato.nome_completo) +
                        "&background=374151&color=fff&size=200";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-zinc-600" />
                  </div>
                )}
              </div>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </label>
          ) : (
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700">
              {candidato.foto_url ? (
                <img
                  src={candidato.foto_url}
                  alt={candidato.nome_completo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(candidato.nome_completo) +
                      "&background=374151&color=fff&size=200";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-zinc-600" />
                </div>
              )}
            </div>
          )}

          {/* Tags de Interesse de Atuação Profissional */}
          {parseInteresses(candidato.objetivo_profissional).length > 0 && (
            <div className="flex flex-col gap-1.5 mt-3">
              {parseInteresses(candidato.objetivo_profissional).slice(0, 3).map((interesse, index) => (
                <span
                  key={index}
                  className="inline-block px-2.5 py-0.5 bg-gray-700/50 border border-gray-600 rounded-md text-[11px] text-gray-300 truncate max-w-[112px]"
                >
                  {interesse}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bio + Localização + DISC + Estatísticas */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Biografia */}
          <p className="text-gray-300 text-sm leading-relaxed">
            {candidato.bio || candidato.objetivo_profissional || "Adicione uma bio..."}
          </p>

          {/* Localização */}
          <div className="mt-1">
            {candidato.bairro && (
              <p className="text-sm text-gray-400">{candidato.bairro}</p>
            )}
            {(candidato.cidade || candidato.estado) && (
              <p className="text-white font-semibold text-sm">
                {candidato.cidade}
                {candidato.cidade && candidato.estado && " - "}
                {candidato.estado}
              </p>
            )}
          </div>

          {/* Perfil DISC */}
          {perfisDISC.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <MicroIconeDisc size={14} />
              {perfisDISC.map((letra, index) => (
                <span key={index} className={`text-sm font-semibold ${getCorDISC(letra)}`}>
                  {getNomeDISC(letra)}
                </span>
              ))}
            </div>
          )}

          {/* Estatísticas */}
          <div className="flex justify-center items-center gap-8 mt-3 w-full">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">{candidato.total_visualizacoes || 0}</span>
              <span className="text-xs text-gray-500">visualizações</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">{candidato.total_propostas_recebidas || 0}</span>
              <span className="text-xs text-gray-500">propostas</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">{candidato.total_candidaturas || 0}</span>
              <span className="text-xs text-gray-500">candidatou</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* BOTÕES DE AÇÃO - MODO EMPRESA */}
      {/* ============================================= */}
      {modoVisualizacao === "empresa" && (
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            className="flex-1 h-11 bg-white hover:bg-gray-100 text-black border-0 rounded-xl"
            onClick={() => setShowCurriculo(true)}
          >
            <Eye className="w-5 h-5 mr-2" />
            Ver Currículo
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl"
            onClick={() => setShowAgendarDialog(true)}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Entrevista
          </Button>
          <Button
            variant="outline"
            className="h-11 w-11 bg-zinc-800 hover:bg-zinc-700 text-white border-0 rounded-xl p-0"
            onClick={toggleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : salvo ? (
              <BookmarkCheck className="w-5 h-5 text-blue-500" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>
        </div>
      )}

      {/* ============================================= */}
      {/* CARROSSEL DE ABAS - INFORMAÇÕES */}
      {/* ============================================= */}
      <div className="mb-6 -mx-4">
        <div
          className="flex gap-2 px-4 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ABAS_INFO.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAberta(aba.id)}
              className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-blue-900 transition flex items-center gap-2"
              style={{ scrollSnapAlign: "start" }}
            >
              <aba.icon className="w-4 h-4 text-red-500" />
              <span className="text-white text-sm font-medium whitespace-nowrap">{aba.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================= */}
      {/* CARROSSEL DE DESTAQUES (QUADRADOS) */}
      {/* ============================================= */}
      <div className="pb-8">
        <h3 className="text-white font-semibold mb-3">Destaques</h3>

        <div className="-mx-4">
          <div
            className="flex gap-3 px-4 overflow-x-auto pb-4"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
          {/* Botão Adicionar (só para o próprio candidato) */}
          {modoVisualizacao === "candidato" && destaques.length < 7 && (
            <button
              onClick={() => setShowAdicionarDestaque(true)}
              className="flex-shrink-0 w-28 h-36 rounded-xl border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center gap-2 hover:border-zinc-500 transition"
              style={{ scrollSnapAlign: "start" }}
            >
              <Plus className="w-8 h-8 text-zinc-500" />
              <span className="text-zinc-500 text-xs text-center">
                Adicionar
                <br />
                destaque
              </span>
            </button>
          )}

          {/* Destaques existentes */}
          {destaques.map((destaque) => (
            <DestaqueCard
              key={destaque.id}
              destaque={destaque}
              onClick={() => setShowVisualizarDestaque(destaque)}
            />
          ))}

          {/* Placeholder se não houver destaques (modo empresa) */}
          {destaques.length === 0 && modoVisualizacao === "empresa" && (
            <p className="text-gray-500 text-sm">Nenhum destaque cadastrado</p>
          )}
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* MENU HAMBÚRGUER (CONFIGURAÇÕES) */}
      {/* ============================================= */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setShowMenu(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-zinc-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Configurações</h3>
              <button onClick={() => setShowMenu(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2">
              <MenuButton icon={User} label="Editar Perfil" onClick={() => { setShowMenu(false); setShowEditarPerfil(true); }} />
              <MenuButton icon={Settings} label="Configurações" onClick={() => { setShowMenu(false); setShowConfiguracoes(true); }} />
              <MenuButton icon={Share2} label="Compartilhar Perfil" onClick={() => { setShowMenu(false); compartilharPerfil(); }} />
              <MenuButton icon={Bell} label="Notificações" onClick={() => {}} />
              <MenuButton icon={Shield} label="Privacidade" onClick={() => {}} />
              <MenuButton icon={HelpCircle} label="Ajuda" onClick={() => {}} />
            </div>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* MODAIS DAS ABAS DE INFORMAÇÃO */}
      {/* ============================================= */}

      {/* Modal DISC */}
      {abaAberta === "disc" && (
        <ModalInfoCandidato titulo="Perfil DISC" onClose={() => setAbaAberta(null)}>
          <div className="space-y-4">
            <div className="text-center">
              <span className={`text-4xl font-bold ${candidato.perfil_disc ? getCorDISC(candidato.perfil_disc) : "text-gray-400"}`}>
                {candidato.perfil_disc || "?"}
              </span>
              <p className="text-gray-400 mt-3 text-sm">{getDescricaoDISC(candidato.perfil_disc)}</p>
            </div>
            {perfisDISC.length > 0 && (
              <div className="flex justify-center gap-4 mt-4">
                {perfisDISC.map((letra, i) => (
                  <div key={i} className="text-center">
                    <span className={`text-2xl font-bold ${getCorDISC(letra)}`}>{letra}</span>
                    <p className="text-gray-500 text-xs mt-1">{getNomeDISC(letra)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Botões de ação */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              {candidato.perfil_disc ? (
                <>
                  {/* Tem perfil - Mostrar botão para ver relatório completo */}
                  <Button
                    onClick={() => {
                      setAbaAberta(null);
                      setShowRelatorioDisc(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Ver Relatório Completo
                  </Button>

                  {/* Botão refazer (apenas para candidato) */}
                  {modoVisualizacao === "candidato" && (
                    podeRefazerDisc ? (
                      <Button
                        onClick={() => {
                          setAbaAberta(null);
                          navigate("/recrutamento/candidato/teste-disc");
                        }}
                        variant="outline"
                        className="w-full border-blue-500/40 text-blue-400 hover:bg-blue-500/20"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refazer Teste
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
                        <Clock className="w-4 h-4" />
                        Você poderá refazer em {diasParaRefazer} dias
                      </div>
                    )
                  )}
                </>
              ) : (
                /* Não tem perfil - Mostrar botão para fazer teste */
                modoVisualizacao === "candidato" ? (
                  <Button
                    onClick={() => {
                      setAbaAberta(null);
                      navigate("/recrutamento/candidato/teste-disc");
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Fazer Teste DISC
                  </Button>
                ) : (
                  <p className="text-center text-gray-500 text-sm">
                    Este candidato ainda não realizou o teste DISC
                  </p>
                )
              )}
            </div>
          </div>
        </ModalInfoCandidato>
      )}

      {/* Modal Experiências */}
      {abaAberta === "experiencias" && (
        <ModalInfoCandidato titulo="Experiências Profissionais" onClose={() => setAbaAberta(null)}>
          <div className="space-y-4">
            {candidato.ultimo_cargo || candidato.ultima_empresa ? (
              <div className="border-l-2 border-blue-900 pl-4">
                <h4 className="text-white font-semibold">{candidato.ultimo_cargo || "Cargo não informado"}</h4>
                <p className="text-gray-400">{candidato.ultima_empresa || "Empresa não informada"}</p>
                {candidato.tempo_ultima_empresa && (
                  <p className="text-gray-500 text-sm">{candidato.tempo_ultima_empresa}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center">Nenhuma experiência cadastrada</p>
            )}
            {candidato.anos_experiencia && candidato.anos_experiencia > 0 && (
              <p className="text-gray-400 text-sm text-center mt-4">
                Total: {candidato.anos_experiencia} anos de experiência
              </p>
            )}
            {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-500 text-xs mb-2">Áreas de experiência:</p>
                <div className="flex flex-wrap gap-2">
                  {candidato.areas_experiencia.map((area, i) => (
                    <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs text-gray-300">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModalInfoCandidato>
      )}

      {/* Modal Formações */}
      {abaAberta === "formacoes" && (
        <ModalInfoCandidato titulo="Formação Acadêmica" onClose={() => setAbaAberta(null)}>
          <div className="space-y-4">
            <div className="border-l-2 border-red-600 pl-4">
              <h4 className="text-white font-semibold">{candidato.escolaridade || "Não informado"}</h4>
              {candidato.curso && <p className="text-gray-400">{candidato.curso}</p>}
            </div>
          </div>
        </ModalInfoCandidato>
      )}

      {/* Modal Info Pessoais */}
      {abaAberta === "info_pessoais" && (
        <ModalInfoCandidato titulo="Informações Pessoais" onClose={() => setAbaAberta(null)}>
          <div className="space-y-1">
            <InfoRow label="Email" value={candidato.email} />
            <InfoRow label="Telefone" value={candidato.telefone} />
            <InfoRow label="Data de Nascimento" value={formatDate(candidato.data_nascimento)} />
            <InfoRow label="CNH" value={candidato.possui_cnh || "Não possui"} />
            <InfoRow label="Veículo Próprio" value={candidato.possui_veiculo === "sim" ? "Sim" : "Não"} />
          </div>
        </ModalInfoCandidato>
      )}

      {/* Modal Disponibilidade */}
      {abaAberta === "disponibilidade" && (
        <ModalInfoCandidato titulo="Disponibilidade" onClose={() => setAbaAberta(null)}>
          <div className="space-y-1">
            <InfoRow label="Horário" value={candidato.disponibilidade_horario} />
            <InfoRow label="Início" value={candidato.disponibilidade_inicio} />
            <InfoRow label="Regime Preferido" value={candidato.regime_preferido} />
            <InfoRow label="Pretensão Salarial" value={candidato.pretensao_salarial} />
            <InfoRow label="Aceita Viajar" value={candidato.aceita_viajar === "sim" ? "Sim" : "Não"} />
            <InfoRow label="Aceita Mudança" value={candidato.aceita_mudanca === "sim" ? "Sim" : "Não"} />
          </div>
        </ModalInfoCandidato>
      )}

      {/* Modal Extracurriculares */}
      {abaAberta === "extracurriculares" && (
        <ModalInfoCandidato titulo="Informações Extras" onClose={() => setAbaAberta(null)}>
          <div className="space-y-4">
            {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs mb-2">Áreas de Interesse:</p>
                <div className="flex flex-wrap gap-2">
                  {candidato.areas_interesse.map((area, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-900/30 rounded text-xs text-blue-400">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs mb-2">O que busca em uma empresa:</p>
                <div className="flex flex-wrap gap-2">
                  {candidato.valores_empresa.map((valor, i) => (
                    <span key={i} className="px-2 py-1 bg-green-900/30 rounded text-xs text-green-400">
                      {valor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(!candidato.areas_interesse || candidato.areas_interesse.length === 0) &&
              (!candidato.valores_empresa || candidato.valores_empresa.length === 0) && (
                <p className="text-gray-400 text-center">Nenhuma informação extra cadastrada</p>
              )}
          </div>
        </ModalInfoCandidato>
      )}

      {/* Modal Currículo Completo */}
      {showCurriculo && (
        <ModalCurriculoCompleto candidato={candidato} onClose={() => setShowCurriculo(false)} />
      )}

      {/* Modal Editar Perfil - MODO CANDIDATO */}
      {showEditarPerfil && (
        <ModalEditarPerfil
          candidato={candidato}
          onClose={() => setShowEditarPerfil(false)}
          onSalvo={() => {
            carregarPerfil();
            onPerfilAtualizado?.();
          }}
        />
      )}

      {/* Modal Configurações - MODO CANDIDATO */}
      {showConfiguracoes && (
        <ModalConfiguracoesCandidato
          candidato={candidato}
          onClose={() => setShowConfiguracoes(false)}
          onSalvo={() => {
            carregarPerfil();
            onPerfilAtualizado?.();
          }}
        />
      )}

      {/* Modal Adicionar Destaque */}
      <ModalAdicionarDestaque
        candidatoId={candidatoId}
        isOpen={showAdicionarDestaque}
        onClose={() => setShowAdicionarDestaque(false)}
        onDestaqueAdicionado={() => {
          carregarDestaques();
          onPerfilAtualizado?.();
        }}
      />

      {/* Modal Visualizar Destaque */}
      {showVisualizarDestaque && (
        <ModalVisualizarDestaque
          destaque={showVisualizarDestaque}
          onClose={() => setShowVisualizarDestaque(null)}
          modoVisualizacao={modoVisualizacao}
          candidatoId={candidatoId}
          onExcluir={() => {
            carregarDestaques();
            onPerfilAtualizado?.();
          }}
          onAtualizar={() => {
            carregarDestaques();
            onPerfilAtualizado?.();
          }}
        />
      )}

      {/* Modal Relatório DISC Completo */}
      {showRelatorioDisc && candidato && (
        <RelatorioDiscModal
          isOpen={showRelatorioDisc}
          onClose={() => setShowRelatorioDisc(false)}
          candidato={candidato}
          isProprioPeril={modoVisualizacao === "candidato"}
          diasParaRefazer={diasParaRefazer}
          podeRefazer={podeRefazerDisc}
          onRefazerTeste={() => {
            setShowRelatorioDisc(false);
            navigate("/recrutamento/candidato/teste-disc");
          }}
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
              <br />O candidato receberá uma notificação e poderá confirmar ou sugerir outro
              horário.
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

// =====================================================
// MODAL EDITAR PERFIL - COM UPLOAD DE FOTO
// =====================================================
function ModalEditarPerfil({
  candidato,
  onClose,
  onSalvo,
}: {
  candidato: Candidato;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const { toast } = useToast();
  const { uploadMidia, uploading, progress } = useUploadMidia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(candidato.foto_url);

  // Converter objetivo_profissional para array se for string
  const parseInteresses = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
  };

  const [form, setForm] = useState({
    nome_completo: candidato.nome_completo || "",
    headline: candidato.headline || "",
    bio: candidato.bio || "",
    bairro: candidato.bairro || "",
    cidade: candidato.cidade || "",
    estado: candidato.estado || "",
  });

  const [interessesAtuacao, setInteressesAtuacao] = useState<string[]>(
    parseInteresses(candidato.objetivo_profissional)
  );

  const [disponibilidadeTipo, setDisponibilidadeTipo] = useState(
    candidato.disponibilidade_tipo || "imediata"
  );
  const [disponibilidadeData, setDisponibilidadeData] = useState(
    candidato.disponibilidade_data || ""
  );

  const [username, setUsername] = useState(candidato.username || "");

  const handleFotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Selecione uma imagem (JPG, PNG, WebP ou GIF).",
        variant: "destructive",
      });
      return;
    }

    const result = await uploadMidia(file, candidato.id, "fotos-perfil");
    if (result) {
      setFotoUrl(result.url);
      toast({ title: "Foto enviada!" });
    }
  };

  const handleSalvar = async () => {
    // Validar mínimo de 1 área de interesse
    if (interessesAtuacao.length === 0) {
      toast({
        title: "Campo obrigatório",
        description: "Adicione pelo menos 1 área de interesse de atuação.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("candidatos_recrutamento")
      .update({
        nome_completo: form.nome_completo,
        headline: form.headline,
        bio: form.bio,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        objetivo_profissional: interessesAtuacao,
        foto_url: fotoUrl,
        disponibilidade_tipo: disponibilidadeTipo,
        disponibilidade_data: disponibilidadeTipo === "a_partir_de" ? disponibilidadeData : null,
        username: username || null,
      })
      .eq("id", candidato.id);

    if (error) {
      toast({ title: "Erro ao salvar perfil", variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
      onSalvo();
      onClose();
    }

    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Foto */}
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden">
                  {fotoUrl ? (
                    <img src={fotoUrl} className="w-full h-full object-cover" alt="Perfil" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                      {candidato.nome_completo?.[0] || "?"}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  {uploading ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 text-white" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Foto</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mb-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-gray-400 mt-1">Enviando... {progress}%</p>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
            <Input
              value={form.nome_completo}
              onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Username */}
          <UsernameInput
            value={username}
            onChange={setUsername}
            tipo="candidato"
            idAtual={candidato.id}
          />

          {/* Headline */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título Profissional</label>
            <Input
              value={form.headline}
              onChange={(e) => {
                if (e.target.value.length <= 24) {
                  setForm({ ...form, headline: e.target.value });
                }
              }}
              maxLength={24}
              placeholder="Ex: Vendedor, Pizzaiolo, Pintor"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className={`text-xs mt-1 text-right ${
              form.headline.length >= 24 ? 'text-red-500' :
              form.headline.length >= 20 ? 'text-yellow-500' :
              'text-gray-500'
            }`}>
              {form.headline.length}/24
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <Textarea
              value={form.bio}
              onChange={(e) => {
                if (e.target.value.length <= 180) {
                  setForm({ ...form, bio: e.target.value });
                }
              }}
              maxLength={180}
              placeholder="Conte um pouco sobre você..."
              className="bg-gray-800 border-gray-700 text-white resize-none"
              rows={3}
            />
            <p className={`text-xs mt-1 text-right ${
              form.bio.length >= 180 ? 'text-red-500' :
              form.bio.length >= 160 ? 'text-yellow-500' :
              'text-gray-500'
            }`}>
              {form.bio.length}/180
            </p>
          </div>

          {/* Interesse de Atuação Profissional */}
          <InteresseAtuacaoTags
            value={interessesAtuacao}
            onChange={setInteressesAtuacao}
            maxTags={3}
            maxCharsPerTag={19}
            minCharsToAdd={5}
          />

          {/* Disponibilidade de Início */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Disponibilidade de Início
            </Label>

            <RadioGroup
              value={disponibilidadeTipo}
              onValueChange={(value) => {
                setDisponibilidadeTipo(value);
                if (value !== "a_partir_de") {
                  setDisponibilidadeData("");
                }
              }}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="imediata"
                  id="disp_imediata"
                  className="border-gray-600 text-blue-500"
                />
                <Label htmlFor="disp_imediata" className="text-sm text-gray-300 cursor-pointer">
                  Imediata
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="em_30_dias"
                  id="disp_30_dias"
                  className="border-gray-600 text-blue-500"
                />
                <Label htmlFor="disp_30_dias" className="text-sm text-gray-300 cursor-pointer">
                  Em 30 dias
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="a_combinar"
                  id="disp_combinar"
                  className="border-gray-600 text-blue-500"
                />
                <Label htmlFor="disp_combinar" className="text-sm text-gray-300 cursor-pointer">
                  A combinar
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="a_partir_de"
                  id="disp_a_partir"
                  className="border-gray-600 text-blue-500"
                />
                <Label htmlFor="disp_a_partir" className="text-sm text-gray-300 cursor-pointer">
                  A partir de:
                </Label>
                {disponibilidadeTipo === "a_partir_de" && (
                  <Input
                    type="date"
                    value={disponibilidadeData}
                    onChange={(e) => setDisponibilidadeData(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-40 bg-gray-700 border-gray-600 text-white text-sm"
                  />
                )}
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="indisponivel"
                  id="disp_indisponivel"
                  className="border-gray-600 text-red-500"
                />
                <Label htmlFor="disp_indisponivel" className="text-sm text-red-400 cursor-pointer">
                  Indisponível
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bairro</label>
            <Input
              value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              placeholder="Ex: Jardim Santa Fé"
              maxLength={100}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cidade</label>
              <Input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estado</label>
              <Input
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                className="bg-gray-800 border-gray-700 text-white"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600">
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={loading || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// MODAL CONFIGURAÇÕES
// =====================================================
function ModalConfiguracoesCandidato({
  candidato,
  onClose,
  onSalvo,
}: {
  candidato: Candidato;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState(candidato.status || "disponivel");
  const [loading, setLoading] = useState(false);

  const STATUS_OPTIONS = [
    {
      value: "disponivel",
      label: "Disponível para o mercado",
      desc: "Empresas podem ver seu perfil e enviar propostas",
      cor: "text-green-500",
    },
    {
      value: "pausado",
      label: "Pausado",
      desc: "Você não aparece para empresas",
      cor: "text-gray-400",
    },
    {
      value: "contratado",
      label: "Fui recrutado",
      desc: "Marque se você foi contratado",
      cor: "text-blue-500",
    },
  ];

  const handleSalvar = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("candidatos_recrutamento")
      .update({
        status,
        visivel_empresas: status === "disponivel",
      })
      .eq("id", candidato.id);

    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: "Configurações atualizadas!" });
      onSalvo();
      onClose();
    }

    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Configurações</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Status do Perfil</h3>

          <div className="space-y-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatus(option.value)}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  status === option.value
                    ? "bg-gray-800 border border-gray-600"
                    : "bg-gray-800/50 border border-transparent hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${option.cor}`}>● {option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                  {status === option.value && <Check className="w-5 h-5 text-green-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-white">
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// MODAL VISUALIZAR DESTAQUE
// =====================================================
function ModalVisualizarDestaque({
  destaque,
  onClose,
  modoVisualizacao = "empresa",
  onExcluir,
  onAtualizar,
  candidatoId,
}: {
  destaque: Destaque;
  onClose: () => void;
  modoVisualizacao?: "candidato" | "empresa";
  onExcluir?: () => void;
  onAtualizar?: () => void;
  candidatoId?: string;
}) {
  const { toast } = useToast();
  const { uploadMidia, uploading } = useUploadMidia();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirmarExclusao, setShowConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Estados para edição
  const [showEditarDestaque, setShowEditarDestaque] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState(destaque.titulo);
  const [novoIcone, setNovoIcone] = useState(destaque.icone);
  const [novaCapa, setNovaCapa] = useState<File | null>(null);
  const [previewCapa, setPreviewCapa] = useState<string | null>(destaque.capa_url || null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const capaInputRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const midias = destaque.midias || [];
  const FOTO_DURACAO = 5000; // 5 segundos para fotos

  // Limpar interval ao desmontar
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Gerenciar progresso para fotos
  useEffect(() => {
    if (midias.length === 0) return;

    const midiaAtual = midias[currentIndex];
    const isFoto = midiaAtual?.tipo === "foto" || midiaAtual?.tipo === "imagem";

    // Resetar progresso ao mudar de mídia
    setProgress(0);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (isFoto && !isPaused) {
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / FOTO_DURACAO) * 100;

        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current!);
          proximo();
        } else {
          setProgress(newProgress);
        }
      }, 50);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, isPaused]);

  // Pausar/continuar foto quando isPaused muda
  useEffect(() => {
    if (isPaused && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, [isPaused]);

  const proximo = () => {
    if (currentIndex < midias.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const anterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const newProgress = (video.currentTime / video.duration) * 100;
      setProgress(newProgress);
    }
  };

  const handleVideoEnded = () => {
    proximo();
  };

  const handleExcluir = async () => {
    setExcluindo(true);
    try {
      // Excluir mídias primeiro
      await supabase
        .from("midias_destaque")
        .delete()
        .eq("destaque_id", destaque.id);

      // Excluir destaque
      await supabase
        .from("destaques_candidato")
        .delete()
        .eq("id", destaque.id);

      toast({
        title: "Destaque excluído!",
        description: `"${destaque.titulo}" foi removido.`,
      });

      setShowConfirmarExclusao(false);
      onClose();
      onExcluir?.();
    } catch (error) {
      console.error("Erro ao excluir destaque:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o destaque.",
        variant: "destructive",
      });
    } finally {
      setExcluindo(false);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!novoTitulo.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Digite um título para o destaque.",
        variant: "destructive",
      });
      return;
    }

    setSalvandoEdicao(true);
    try {
      let capaUrl = destaque.capa_url;

      // Se tem nova capa, fazer upload
      if (novaCapa && candidatoId) {
        const result = await uploadMidia(novaCapa, candidatoId, "capas-destaques");
        if (result) {
          capaUrl = result.url;
        }
      }

      // Atualizar destaque no banco
      const { error } = await supabase
        .from("destaques_candidato")
        .update({
          titulo: novoTitulo.trim(),
          icone: novoIcone,
          capa_url: capaUrl,
        })
        .eq("id", destaque.id);

      if (error) throw error;

      toast({
        title: "Destaque atualizado!",
        description: `"${novoTitulo}" foi salvo com sucesso.`,
      });

      setShowEditarDestaque(false);
      setNovaCapa(null);
      onClose();
      onAtualizar?.();
    } catch (error) {
      console.error("Erro ao salvar destaque:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleCapaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Formato inválido",
          description: "Selecione uma imagem (JPG, PNG, WebP ou GIF).",
          variant: "destructive",
        });
        return;
      }
      setNovaCapa(file);
      setPreviewCapa(URL.createObjectURL(file));
    }
  };

  const ICONES_EDICAO = [
    "📋", "💼", "💡", "🎬", "📸", "🎯",
    "🔧", "📷", "⏰", "⭐", "🎨", "🚀",
  ];

  if (midias.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-50">
          <X className="w-8 h-8" />
        </button>
        <p className="text-white text-lg">Nenhuma mídia neste destaque</p>
      </div>
    );
  }

  const midiaAtual = midias[currentIndex];
  const isFoto = midiaAtual?.tipo === "foto" || midiaAtual?.tipo === "imagem";

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
      {/* Container 9:16 centralizado */}
      <div className="relative w-full h-full max-w-[500px] mx-auto flex flex-col">

        {/* Progress bars no TOPO */}
        <div className="absolute top-0 left-0 right-0 z-50 p-3 pt-4">
          <div className="flex gap-1">
            {midias.map((_, index) => (
              <div key={index} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width: index < currentIndex
                      ? "100%"
                      : index === currentIndex
                        ? `${progress}%`
                        : "0%"
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header com info do destaque */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg">
                  {destaque.icone}
                </div>
              </div>
              <span className="text-white font-medium text-sm">{destaque.titulo}</span>
              <span className="text-gray-400 text-xs">
                {currentIndex + 1}/{midias.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Botões só aparecem se for o próprio candidato */}
              {modoVisualizacao === "candidato" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditarDestaque(true);
                    }}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Editar destaque"
                  >
                    <Pencil className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmarExclusao(true);
                    }}
                    className="p-2 rounded-full bg-white/20 hover:bg-red-500/50 transition-colors"
                    title="Excluir destaque"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal - Mídia */}
        <div className="flex-1 flex items-center justify-center relative">

          {/* Área de clique ESQUERDA (anterior) */}
          <button
            onClick={anterior}
            className="absolute left-0 top-0 bottom-0 w-1/4 z-40"
            aria-label="Anterior"
          />

          {/* Área de clique CENTRO (pausar/continuar) */}
          <button
            onClick={togglePause}
            className="absolute left-1/4 right-1/4 top-0 bottom-0 z-40"
            aria-label={isPaused ? "Continuar" : "Pausar"}
          />

          {/* Área de clique DIREITA (próximo) */}
          <button
            onClick={proximo}
            className="absolute right-0 top-0 bottom-0 w-1/4 z-40"
            aria-label="Próximo"
          />

          {/* Indicador de pausa */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Mídia atual */}
          <div className="w-full h-full flex items-center justify-center">
            {isFoto ? (
              <img
                src={midiaAtual.url}
                alt=""
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                src={midiaAtual.url}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted={false}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
              />
            )}
          </div>
        </div>

        {/* Indicadores de navegação nas bordas */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
          {currentIndex > 0 && <span className="text-2xl">‹</span>}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
          {currentIndex < midias.length - 1 && <span className="text-2xl">›</span>}
        </div>

        {/* Modal de confirmação de exclusão */}
        {showConfirmarExclusao && (
          <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white text-lg font-semibold mb-2">Excluir destaque?</h3>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja excluir "{destaque.titulo}"? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmarExclusao(false)}
                  disabled={excluindo}
                  className="flex-1 py-2 px-4 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExcluir}
                  disabled={excluindo}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {excluindo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Excluir"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição do Destaque */}
        {showEditarDestaque && (
          <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl font-semibold">Editar Destaque</h3>
                <button
                  onClick={() => {
                    setShowEditarDestaque(false);
                    setNovaCapa(null);
                    setPreviewCapa(destaque.capa_url || null);
                    setNovoTitulo(destaque.titulo);
                    setNovoIcone(destaque.icone);
                  }}
                  className="p-2 rounded-full hover:bg-zinc-800"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Preview da Capa */}
              <div className="flex flex-col items-center mb-6">
                <p className="text-gray-400 text-sm mb-3">Capa do Destaque</p>
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-600 flex items-center justify-center bg-zinc-800">
                    {previewCapa ? (
                      <img
                        src={previewCapa}
                        alt="Capa"
                        className="w-full h-full object-cover"
                      />
                    ) : destaque.midias?.[0]?.url ? (
                      <img
                        src={destaque.midias[0].url}
                        alt="Primeira mídia"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{novoIcone}</span>
                    )}
                  </div>
                  <button
                    onClick={() => capaInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input
                    ref={capaInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCapaSelect}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">Toque para alterar a capa</p>
              </div>

              {/* Nome do Destaque */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Nome do Destaque</label>
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  maxLength={20}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Projetos, Trabalhos..."
                />
                <p className="text-gray-500 text-xs mt-1 text-right">{novoTitulo.length}/20</p>
              </div>

              {/* Ícone do Destaque */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Ícone</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONES_EDICAO.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNovoIcone(emoji)}
                      className={`p-3 rounded-xl text-2xl transition ${
                        novoIcone === emoji
                          ? "bg-blue-600"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress de upload */}
              {uploading && (
                <div className="mb-4">
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse w-full" />
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-1">Enviando capa...</p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditarDestaque(false);
                    setNovaCapa(null);
                    setPreviewCapa(destaque.capa_url || null);
                    setNovoTitulo(destaque.titulo);
                    setNovoIcone(destaque.icone);
                  }}
                  disabled={salvandoEdicao}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-700 text-white hover:bg-zinc-600 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarEdicao}
                  disabled={salvandoEdicao || uploading || !novoTitulo.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {salvandoEdicao ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente do círculo de destaque
function DestaqueCirculo({ destaque, onClick }: { destaque: Destaque; onClick: () => void }) {
  // Prioridade: capa_url > primeira mídia (foto) > primeira mídia (video) > ícone
  const capa = destaque.capa_url;
  const primeiraMidia = destaque.midias?.[0];

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 min-w-[70px]">
      <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center overflow-hidden">
        {capa ? (
          <img src={capa} alt={destaque.titulo} className="w-full h-full object-cover" />
        ) : primeiraMidia?.url && (primeiraMidia.tipo === "foto" || primeiraMidia.tipo === "imagem") ? (
          <img src={primeiraMidia.url} alt={destaque.titulo} className="w-full h-full object-cover" />
        ) : primeiraMidia?.url && primeiraMidia.tipo === "video" ? (
          <video src={primeiraMidia.url} className="w-full h-full object-cover" muted />
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
function ModalCurriculoCompleto({
  candidato,
  onClose,
}: {
  candidato: Candidato;
  onClose: () => void;
}) {
  const getFaixaSalarialLabel = (faixa: string | null) => {
    if (!faixa) return "Não informado";
    const faixas: Record<string, string> = {
      ate_1500: "Até R$ 1.500",
      "1500_2500": "R$ 1.500 - R$ 2.500",
      "2500_4000": "R$ 2.500 - R$ 4.000",
      "4000_6000": "R$ 4.000 - R$ 6.000",
      "6000_10000": "R$ 6.000 - R$ 10.000",
      acima_10000: "Acima de R$ 10.000",
    };
    return faixas[faixa] || faixa;
  };

  const getDisponibilidadeLabel = (disp: string | null) => {
    if (!disp) return "Não informado";
    const disps: Record<string, string> = {
      imediata: "Imediata",
      "15_dias": "Em 15 dias",
      "30_dias": "Em 30 dias",
      a_combinar: "A combinar",
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
              <p className="text-white font-medium">
                {candidato.ultimo_cargo || "Não informado"}
              </p>
              <p className="text-gray-400 text-sm">
                {candidato.ultima_empresa || "Não informado"}
              </p>
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
            <p className="text-white">{candidato.escolaridade || "Não informado"}</p>
            {candidato.curso && <p className="text-gray-400 text-sm">{candidato.curso}</p>}
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
                <p className="text-white text-sm">
                  {candidato.disponibilidade_horario || "Não informado"}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Regime</p>
                <p className="text-white text-sm capitalize">
                  {candidato.regime_preferido || "Não informado"}
                </p>
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
                <CheckCircle className="w-4 h-4 mr-2" />O que busca em uma empresa
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

// =====================================================
// COMPONENTES AUXILIARES - NOVO LAYOUT
// =====================================================

// Modal genérico para informações do candidato
function ModalInfoCandidato({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-white font-semibold text-lg">{titulo}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">{children}</div>
      </div>
    </div>
  );
}

// Linha de informação (label + value)
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-zinc-800">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value || "-"}</span>
    </div>
  );
}

// Botão do menu lateral
function MenuButton({
  icon: Icon,
  label,
  onClick,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition ${className}`}
    >
      <Icon className={`w-5 h-5 ${className || "text-white"}`} />
      <span className={className || "text-white"}>{label}</span>
    </button>
  );
}

// Card de destaque (quadrado)
function DestaqueCard({ destaque, onClick }: { destaque: Destaque; onClick: () => void }) {
  const capa = destaque.capa_url;
  const primeiraMidia = destaque.midias?.[0];

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-28 flex flex-col items-center gap-2"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Capa do destaque - Quadrada */}
      <div className="w-28 h-36 rounded-xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 hover:border-blue-900 transition">
        {capa ? (
          <img src={capa} alt={destaque.titulo} className="w-full h-full object-cover" />
        ) : primeiraMidia?.url && (primeiraMidia.tipo === "foto" || primeiraMidia.tipo === "imagem") ? (
          <img src={primeiraMidia.url} alt={destaque.titulo} className="w-full h-full object-cover" />
        ) : primeiraMidia?.url && primeiraMidia.tipo === "video" ? (
          <video src={primeiraMidia.url} className="w-full h-full object-cover" muted />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">{destaque.icone || "📌"}</span>
          </div>
        )}
      </div>
      {/* Nome do destaque */}
      <span className="text-white text-xs text-center truncate w-full">{destaque.titulo}</span>
    </button>
  );
}

export default PerfilInstagramCandidato;
