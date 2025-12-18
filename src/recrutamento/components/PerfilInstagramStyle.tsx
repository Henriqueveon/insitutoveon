// =====================================================
// PERFIL INSTAGRAM STYLE - Layout social estilo Instagram
// Visualização de perfil de candidato com estatísticas
// =====================================================

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Eye,
  Bookmark,
  BookmarkCheck,
  Share2,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Grid3X3,
  Video,
  Brain,
  ExternalLink,
  Clock,
  DollarSign,
  Car,
  Plane,
  Home,
  Star,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CurriculoDISCReport from '../candidato/components/CurriculoDISCReport';
import VideoPlayerModal from './VideoPlayerModal';

// Cores DISC
const DISC_COLORS = {
  D: '#E53935',
  I: '#FBC02D',
  S: '#43A047',
  C: '#1E88E5',
};

const DISC_NAMES = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

interface Profile {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface ConfiabilidadeData {
  score: number | null;
  nivel: string | null;
  flags: string[] | null;
}

interface VideoDestaque {
  id: string;
  thumbnail_url: string | null;
  video_url: string;
  titulo: string;
  duracao: number | null;
  visualizacoes: number;
}

interface PerfilStats {
  visualizacoes: number;
  salvamentos: number;
  entrevistas: number;
}

interface Candidato {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  foto_url: string | null;
  video_url: string | null;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  perfil_disc: string | null;
  perfil_natural: Record<string, number> | null;
  objetivo_profissional: string | null;
  confiabilidade: number | null;
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  ultima_empresa: string | null;
  ultimo_cargo: string | null;
  tempo_ultima_empresa: string | null;
  motivo_saida: string | null;
  escolaridade: string | null;
  curso: string | null;
  certificacoes: string | null;
  disponibilidade_inicio: string | null;
  disponibilidade_horario: string | null;
  regime_preferido: string | null;
  pretensao_salarial: string | null;
  possui_cnh: string | null;
  possui_veiculo: string | null;
  aceita_viajar: string | null;
  aceita_mudanca: string | null;
  estado_civil: string | null;
  tem_filhos: boolean | null;
  quantidade_filhos: number | null;
  instagram: string | null;
  valores_empresa: string[] | null;
  areas_interesse: string[] | null;
}

interface PerfilInstagramStyleProps {
  candidato: Candidato;
  stats?: PerfilStats;
  videosDestaque?: VideoDestaque[];
  isSalvo?: boolean;
  isOwnProfile?: boolean;
  onSalvar?: () => void;
  onAgendarEntrevista?: () => void;
  onCompartilhar?: () => void;
  confiabilidade?: ConfiabilidadeData | null;
}

type TabType = 'info' | 'disc' | 'videos';

export default function PerfilInstagramStyle({
  candidato,
  stats = { visualizacoes: 0, salvamentos: 0, entrevistas: 0 },
  videosDestaque = [],
  isSalvo = false,
  isOwnProfile = false,
  onSalvar,
  onAgendarEntrevista,
  onCompartilhar,
  confiabilidade,
}: PerfilInstagramStyleProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [expandedBio, setExpandedBio] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoDestaque | null>(null);
  const [showDISCReport, setShowDISCReport] = useState(true);

  const primeiroNome = candidato.nome_completo?.split(' ')[0] || 'Profissional';

  // Calcular idade
  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // Gerar perfil DISC
  const discProfile = useMemo(() => {
    const getProfileFromDisc = (disc: string): Profile => {
      const primary = disc.charAt(0) as 'D' | 'I' | 'S' | 'C';
      const secondary = disc.charAt(1) as 'D' | 'I' | 'S' | 'C' | undefined;
      const profile: Profile = { D: 5, I: 5, S: 5, C: 5 };
      profile[primary] = 20;
      if (secondary && ['D', 'I', 'S', 'C'].includes(secondary)) {
        profile[secondary] = 12;
      }
      return profile;
    };

    const convertToProfile = (data: any): Profile | null => {
      if (!data) return null;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return null;
        }
      }
      if (typeof data !== 'object') return null;
      return {
        D: data.D ?? data.d ?? 10,
        I: data.I ?? data.i ?? 10,
        S: data.S ?? data.s ?? 10,
        C: data.C ?? data.c ?? 10,
      };
    };

    return convertToProfile(candidato.perfil_natural) ||
      (candidato.perfil_disc ? getProfileFromDisc(candidato.perfil_disc) : { D: 10, I: 10, S: 10, C: 10 });
  }, [candidato.perfil_natural, candidato.perfil_disc]);

  const discColor = candidato.perfil_disc
    ? DISC_COLORS[candidato.perfil_disc.charAt(0) as keyof typeof DISC_COLORS]
    : '#6B7280';

  const discName = candidato.perfil_disc
    ? DISC_NAMES[candidato.perfil_disc.charAt(0) as keyof typeof DISC_NAMES]
    : 'Não avaliado';

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

  const handleCompartilhar = async () => {
    if (onCompartilhar) {
      onCompartilhar();
      return;
    }

    const url = `${window.location.origin}/c/${candidato.id.substring(0, 8)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil - ${candidato.nome_completo}`,
          text: 'Confira este perfil profissional',
          url,
        });
      } catch (e) {
        navigator.clipboard.writeText(url);
        toast({ title: 'Link copiado!', description: 'Compartilhe com recrutadores.' });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado!', description: 'Compartilhe com recrutadores.' });
    }
  };

  const openVideoModal = (video: VideoDestaque) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <div className="bg-zinc-900 min-h-screen">
      {/* ============================================= */}
      {/* HEADER - Perfil estilo Instagram */}
      {/* ============================================= */}
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 px-4 pt-4 pb-6">
        {/* Foto + Estatísticas */}
        <div className="flex items-start gap-4">
          {/* Avatar com anel DISC */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full p-[3px]"
              style={{ background: `linear-gradient(135deg, ${discColor}, ${discColor}80)` }}
            >
              <Avatar className="w-full h-full border-2 border-zinc-900">
                <AvatarImage src={candidato.foto_url || undefined} />
                <AvatarFallback className="bg-zinc-700 text-white text-2xl">
                  {primeiroNome.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Badge DISC */}
            {candidato.perfil_disc && (
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-zinc-900"
                style={{ backgroundColor: discColor }}
              >
                {candidato.perfil_disc.charAt(0)}
              </div>
            )}
          </div>

          {/* Estatísticas estilo Instagram */}
          <div className="flex-1 grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{stats.visualizacoes}</p>
              <p className="text-xs text-zinc-400">visualizações</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{stats.salvamentos}</p>
              <p className="text-xs text-zinc-400">salvaram</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{stats.entrevistas}</p>
              <p className="text-xs text-zinc-400">entrevistas</p>
            </div>
          </div>
        </div>

        {/* Nome + Bio */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">{primeiroNome}</h1>
            {candidato.perfil_disc && (
              <Badge
                className="text-white text-xs px-2 py-0.5"
                style={{ backgroundColor: discColor }}
              >
                {discName}
              </Badge>
            )}
          </div>

          <p className="text-zinc-400 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {candidato.cidade || 'Não informado'}, {candidato.estado || ''}
            {candidato.data_nascimento && ` • ${calcularIdade(candidato.data_nascimento)} anos`}
          </p>

          {/* Objetivo / Bio com expand */}
          {candidato.objetivo_profissional && (
            <div className="mt-2">
              <p className={`text-white text-sm ${!expandedBio && 'line-clamp-2'}`}>
                {candidato.objetivo_profissional}
              </p>
              {candidato.objetivo_profissional.length > 100 && (
                <button
                  onClick={() => setExpandedBio(!expandedBio)}
                  className="text-zinc-400 text-xs mt-1 hover:text-white transition-colors"
                >
                  {expandedBio ? 'menos' : 'mais'}
                </button>
              )}
            </div>
          )}

          {/* Último cargo */}
          {candidato.ultimo_cargo && (
            <p className="text-zinc-300 text-sm mt-2 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-zinc-400" />
              {candidato.ultimo_cargo}
              {candidato.ultima_empresa && <span className="text-zinc-500">@ {candidato.ultima_empresa}</span>}
            </p>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 mt-4">
          {!isOwnProfile && onAgendarEntrevista && (
            <Button
              onClick={onAgendarEntrevista}
              className="flex-1 bg-gradient-to-r from-[#E31E24] to-[#1E3A8A] hover:opacity-90 text-white font-semibold"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Entrevista
            </Button>
          )}

          {!isOwnProfile && onSalvar && (
            <Button
              onClick={onSalvar}
              variant="outline"
              className={`px-4 ${isSalvo ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-zinc-600 text-white'}`}
            >
              {isSalvo ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          )}

          <Button
            onClick={handleCompartilhar}
            variant="outline"
            className="px-4 border-zinc-600 text-white"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Stories de vídeo (se houver) */}
        {candidato.video_url && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => openVideoModal({
                id: 'main',
                thumbnail_url: candidato.foto_url,
                video_url: candidato.video_url!,
                titulo: 'Apresentação',
                duracao: null,
                visualizacoes: 0,
              })}
              className="flex-shrink-0"
            >
              <div
                className="w-16 h-16 rounded-full p-[2px]"
                style={{ background: `linear-gradient(135deg, #E31E24, #FBC02D)` }}
              >
                <div className="w-full h-full rounded-full bg-zinc-900 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    {candidato.foto_url ? (
                      <img src={candidato.foto_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 text-center mt-1 w-16 truncate">Apresentação</p>
            </button>

            {videosDestaque.map((video) => (
              <button
                key={video.id}
                onClick={() => openVideoModal(video)}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-purple-500 to-pink-500">
                  <div className="w-full h-full rounded-full bg-zinc-900 p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                          <Video className="w-6 h-6 text-zinc-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 text-center mt-1 w-16 truncate">{video.titulo}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================= */}
      {/* TABS - Navegação */}
      {/* ============================================= */}
      <div className="border-t border-zinc-800 sticky top-0 bg-zinc-900 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="text-sm font-medium">Info</span>
          </button>
          <button
            onClick={() => setActiveTab('disc')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'disc'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="text-sm font-medium">DISC</span>
          </button>
          {videosDestaque.length > 0 && (
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'videos'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Video className="w-5 h-5" />
              <span className="text-sm font-medium">Vídeos</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* CONTEÚDO DAS TABS */}
      {/* ============================================= */}
      <div className="px-4 py-4 space-y-4 pb-20">
        {/* TAB: INFO */}
        {activeTab === 'info' && (
          <>
            {/* Experiência */}
            {(candidato.ultimo_cargo || candidato.ultima_empresa) && (
              <div className="bg-zinc-800/60 rounded-xl p-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Experiência Profissional
                </h4>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  {candidato.ultimo_cargo && <p className="text-white font-medium">{candidato.ultimo_cargo}</p>}
                  {candidato.ultima_empresa && <p className="text-zinc-400 text-sm">{candidato.ultima_empresa}</p>}
                  {candidato.tempo_ultima_empresa && (
                    <p className="text-zinc-500 text-xs mt-1">Período: {candidato.tempo_ultima_empresa}</p>
                  )}
                </div>
                {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidato.areas_experiencia.map((area, i) => (
                      <Badge key={i} className="bg-zinc-700 text-zinc-300">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Formação */}
            {candidato.escolaridade && (
              <div className="bg-zinc-800/60 rounded-xl p-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Formação
                </h4>
                <p className="text-white">{candidato.escolaridade}</p>
                {candidato.curso && <p className="text-zinc-400 text-sm">{candidato.curso}</p>}
                {candidato.certificacoes && (
                  <p className="text-zinc-500 text-xs mt-1">Certificações: {candidato.certificacoes}</p>
                )}
              </div>
            )}

            {/* Disponibilidade */}
            <div className="bg-zinc-800/60 rounded-xl p-4">
              <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Disponibilidade
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Início</p>
                  <p className="text-white text-sm">{getDisponibilidadeLabel(candidato.disponibilidade_inicio)}</p>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Horário</p>
                  <p className="text-white text-sm">{candidato.disponibilidade_horario || 'Não informado'}</p>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Regime</p>
                  <p className="text-white text-sm capitalize">{candidato.regime_preferido || 'Não informado'}</p>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Pretensão</p>
                  <p className="text-white text-sm">{getFaixaSalarialLabel(candidato.pretensao_salarial)}</p>
                </div>
              </div>
            </div>

            {/* Características / Tags */}
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

            {/* Áreas de interesse */}
            {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
              <div className="bg-zinc-800/60 rounded-xl p-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Áreas de Interesse
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidato.areas_interesse.map((area, i) => (
                    <Badge key={i} variant="outline" className="border-zinc-600 text-zinc-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Valores */}
            {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
              <div className="bg-zinc-800/60 rounded-xl p-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  O que busca em uma empresa
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidato.valores_empresa.map((valor, i) => (
                    <Badge key={i} variant="outline" className="border-zinc-600 text-zinc-300">
                      {valor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB: DISC */}
        {activeTab === 'disc' && (
          <CurriculoDISCReport
            naturalProfile={discProfile}
            nomeCompleto={candidato.nome_completo}
            confiabilidade={confiabilidade || (candidato.confiabilidade !== null ? {
              score: candidato.confiabilidade,
              nivel: candidato.confiabilidade >= 80 ? 'ALTA' : candidato.confiabilidade >= 50 ? 'MEDIA' : 'BAIXA',
              flags: null,
            } : null)}
            onAgendarEntrevista={isOwnProfile ? undefined : onAgendarEntrevista}
          />
        )}

        {/* TAB: VIDEOS */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-3 gap-1">
            {videosDestaque.map((video) => (
              <button
                key={video.id}
                onClick={() => openVideoModal(video)}
                className="aspect-square relative overflow-hidden rounded-lg bg-zinc-800 group"
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                    <Video className="w-8 h-8 text-zinc-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
                <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs">
                  <Eye className="w-3 h-3" />
                  {video.visualizacoes}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setSelectedVideo(null);
        }}
        video={selectedVideo}
        candidatoNome={primeiroNome}
        candidatoFoto={candidato.foto_url}
      />
    </div>
  );
}
