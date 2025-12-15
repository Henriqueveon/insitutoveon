// =====================================================
// CURRÍCULO COMPLETO MODAL - Visualização igual ao candidato
// Mostra todos os dados + Relatório DISC completo
// Para empresas visualizarem o perfil profissional
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  Home,
  Clock,
  DollarSign,
  Play,
  Star,
  Target,
  CheckCircle,
  Send,
  Heart,
  Loader2,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CurriculoDISCReport from '../../candidato/components/CurriculoDISCReport';

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

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
}

interface Props {
  candidatoId: string | null;
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa | null;
  onEnviarProposta?: (candidatoId: string) => void;
}

export default function CurriculoCompletoModal({
  candidatoId,
  isOpen,
  onClose,
  empresa,
  onEnviarProposta,
}: Props) {
  const [candidato, setCandidato] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDISCReport, setShowDISCReport] = useState(true);
  const [confiabilidade, setConfiabilidade] = useState<ConfiabilidadeData | null>(null);
  const [isFavorito, setIsFavorito] = useState(false);

  useEffect(() => {
    if (isOpen && candidatoId) {
      carregarCandidato();
    }
  }, [isOpen, candidatoId]);

  const carregarCandidato = async () => {
    if (!candidatoId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidatos_recrutamento')
        .select('*')
        .eq('id', candidatoId)
        .single();

      if (error) throw error;

      setCandidato(data);

      // Configurar confiabilidade
      if (data.confiabilidade !== null) {
        const nivel = data.confiabilidade >= 80 ? 'ALTA' :
                      data.confiabilidade >= 50 ? 'MEDIA' : 'BAIXA';
        setConfiabilidade({
          score: data.confiabilidade,
          nivel: nivel,
          flags: null,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar candidato:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getDescricaoPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'Direto, decisivo, orientado a resultados.';
      case 'I': return 'Comunicativo, entusiasta, otimista.';
      case 'S': return 'Calmo, paciente, leal.';
      case 'C': return 'Analítico, preciso, detalhista.';
      default: return '';
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

  // Gerar perfil DISC a partir dos dados
  const getNaturalProfile = (): Profile | null => {
    if (!candidato) return null;

    // Se tem perfil_natural no banco
    if (candidato.perfil_natural) {
      const pn = candidato.perfil_natural;
      return {
        D: pn.D ?? pn.d ?? 10,
        I: pn.I ?? pn.i ?? 10,
        S: pn.S ?? pn.s ?? 10,
        C: pn.C ?? pn.c ?? 10,
      };
    }

    // Gerar a partir do perfil_disc
    if (candidato.perfil_disc) {
      const primary = candidato.perfil_disc.charAt(0) as 'D' | 'I' | 'S' | 'C';
      const secondary = candidato.perfil_disc.charAt(1) as 'D' | 'I' | 'S' | 'C' | undefined;

      const profile: Profile = { D: 5, I: 5, S: 5, C: 5 };
      profile[primary] = 20;

      if (secondary && ['D', 'I', 'S', 'C'].includes(secondary)) {
        profile[secondary] = 12;
      }

      return profile;
    }

    return null;
  };

  const naturalProfile = getNaturalProfile();
  const primeiroNome = candidato?.nome_completo?.split(' ')[0] || 'Profissional';

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden bg-zinc-900 border-zinc-700 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
          </div>
        ) : candidato ? (
          <div className="flex flex-col max-h-[95vh]">
            {/* Header fixo */}
            <div className="bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 p-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Currículo Profissional</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFavorito(!isFavorito)}
                    className={`p-2 rounded-full transition-colors ${isFavorito ? 'text-red-500' : 'text-zinc-400 hover:text-red-400'}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white/20">
                  <AvatarImage src={candidato.foto_url || undefined} />
                  <AvatarFallback className="bg-zinc-700 text-white text-xl">
                    {primeiroNome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{primeiroNome}</h3>
                  <p className="text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {candidato.cidade || 'Não informado'}, {candidato.estado || ''}
                    {candidato.data_nascimento && ` • ${calcularIdade(candidato.data_nascimento)} anos`}
                  </p>
                </div>
                {candidato.perfil_disc && (
                  <div className={`w-14 h-14 rounded-xl ${getCorPerfil(candidato.perfil_disc)} flex flex-col items-center justify-center`}>
                    <span className="text-xl font-bold text-white">{candidato.perfil_disc}</span>
                    <span className="text-[10px] text-white/80">{getNomePerfil(candidato.perfil_disc)?.slice(0, 3)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Objetivo */}
              {candidato.objetivo_profissional && (
                <div className="bg-zinc-800/60 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivo Profissional
                  </h4>
                  <p className="text-white">{candidato.objetivo_profissional}</p>
                </div>
              )}

              {/* Vídeo */}
              {candidato.video_url && (
                <div className="bg-zinc-800/60 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Vídeo de Apresentação
                  </h4>
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
              {(candidato.ultimo_cargo || candidato.ultima_empresa) && (
                <div className="bg-zinc-800/60 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
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
                      {candidato.areas_experiencia.map((area: string, i: number) => (
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
                  <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
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

              {/* Características */}
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
                    {candidato.areas_interesse.map((area: string, i: number) => (
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
                    {candidato.valores_empresa.map((valor: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-zinc-600 text-zinc-300">
                        {valor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Relatório DISC Completo */}
              {naturalProfile && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowDISCReport(!showDISCReport)}
                    className="w-full flex items-center justify-between bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 border border-[#E31E24]/30 rounded-2xl p-4 text-left hover:border-[#E31E24]/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#003DA5] flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Relatório DISC Completo</h3>
                        <p className="text-zinc-400 text-sm">Análise comportamental detalhada</p>
                      </div>
                    </div>
                    {showDISCReport ? (
                      <ChevronUp className="w-6 h-6 text-white/70" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-white/70" />
                    )}
                  </button>

                  {showDISCReport && (
                    <CurriculoDISCReport
                      naturalProfile={naturalProfile}
                      nomeCompleto={candidato.nome_completo || 'Profissional'}
                      confiabilidade={confiabilidade}
                      onAgendarEntrevista={onEnviarProposta ? () => onEnviarProposta(candidato.id) : undefined}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer fixo com botão de proposta */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex-shrink-0">
              <Button
                onClick={() => onEnviarProposta?.(candidato.id)}
                className="w-full h-12 bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-bold rounded-xl hover:opacity-90"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Proposta para {primeiroNome}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 text-zinc-400">
            Candidato não encontrado
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
