// =====================================================
// MEU CURRÍCULO CANDIDATO - Design Instagram Style
// Visualização do perfil completo com DISC
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Share2,
  Copy,
  MapPin,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  Home,
  Clock,
  Play,
  Star,
  Target,
  CheckCircle,
  User,
  Brain,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Send,
} from 'lucide-react';
import CurriculoDISCReport from '../components/CurriculoDISCReport';

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
  headline: string | null;
  bio: string | null;
  total_visualizacoes: number;
  total_propostas_recebidas: number;
  total_candidaturas: number;

  // Experiência
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  ultima_empresa: string | null;
  ultimo_cargo: string | null;
  tempo_ultima_empresa: string | null;
  motivo_saida: string | null;

  // Formação
  escolaridade: string | null;
  curso: string | null;
  certificacoes: string | null;

  // Disponibilidade
  disponibilidade_inicio: string | null;
  disponibilidade_horario: string | null;
  regime_preferido: string | null;
  pretensao_salarial: string | null;

  // Logística
  possui_cnh: string | null;
  possui_veiculo: string | null;
  aceita_viajar: string | null;
  aceita_mudanca: string | null;

  // Pessoal
  estado_civil: string | null;
  tem_filhos: boolean | null;
  quantidade_filhos: number | null;
  instagram: string | null;

  // Valores
  valores_empresa: string[] | null;
  areas_interesse: string[] | null;
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

export default function MeuCurriculoCandidato() {
  const { toast } = useToast();
  const { candidato: candidatoContext } = useOutletContext<{ candidato: { id: string } | null }>();

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkCompartilhamento, setLinkCompartilhamento] = useState('');
  const [showDISCReport, setShowDISCReport] = useState(false);
  const [confiabilidade, setConfiabilidade] = useState<ConfiabilidadeData | null>(null);
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {
    if (candidatoContext?.id) {
      carregarCandidato();
    }
  }, [candidatoContext?.id]);

  const carregarCandidato = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidatos_recrutamento')
        .select('*')
        .eq('id', candidatoContext?.id)
        .single();

      if (error) throw error;

      // Converter perfil_natural para o tipo correto
      const candidatoFormatado: Candidato = {
        ...data,
        perfil_natural: data.perfil_natural as Record<string, number> | null,
        confiabilidade: data.confiabilidade ?? null,
        total_visualizacoes: data.total_visualizacoes ?? 0,
        total_propostas_recebidas: data.total_propostas_recebidas ?? 0,
        total_candidaturas: data.total_candidaturas ?? 0,
        headline: data.headline ?? null,
        bio: data.bio ?? null,
      };

      setCandidato(candidatoFormatado);

      // Gerar link de compartilhamento
      setLinkCompartilhamento(`${window.location.origin}/c/${data.id.substring(0, 8)}`);

      // Usar dados de confiabilidade
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
      console.error('Erro ao carregar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkCompartilhamento);
    toast({
      title: 'Link copiado!',
      description: 'Compartilhe com recrutadores.',
    });
  };

  const compartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Currículo - ${candidato?.nome_completo}`,
          text: 'Confira meu currículo profissional',
          url: linkCompartilhamento,
        });
      } catch (e) {
        copiarLink();
      }
    } else {
      copiarLink();
    }
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

  const getPrimeiroNome = (nomeCompleto: string) => {
    return nomeCompleto.split(' ')[0];
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E31E24]" />
      </div>
    );
  }

  if (!candidato) return null;

  // Gerar perfil DISC para o relatório
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

  const convertToProfile = (data: Record<string, number> | null): Profile | null => {
    if (!data) return null;
    return {
      D: data.D ?? data.d ?? 10,
      I: data.I ?? data.i ?? 10,
      S: data.S ?? data.s ?? 10,
      C: data.C ?? data.c ?? 10,
    };
  };

  const naturalProfile: Profile = convertToProfile(candidato.perfil_natural) ||
    (candidato.perfil_disc ? getProfileFromDisc(candidato.perfil_disc) : { D: 10, I: 10, S: 10, C: 10 });

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8">
      {/* Header Estilo Instagram */}
      <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
        <CardContent className="p-6">
          {/* Foto com borda gradiente estilo Instagram */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="p-1 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <div className="p-0.5 rounded-full bg-slate-800">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={candidato.foto_url || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-slate-600 text-white text-3xl">
                      {candidato.nome_completo.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            {/* Nome e Bio */}
            <h2 className="text-xl font-bold text-white text-center">
              {candidato.nome_completo}
            </h2>

            <p className="text-slate-400 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {candidato.cidade}, {candidato.estado} • {calcularIdade(candidato.data_nascimento)} anos
            </p>

            {/* Headline/Bio */}
            {candidato.headline && (
              <p className="text-white text-sm text-center mt-2 italic">
                "{candidato.headline}"
              </p>
            )}

            {candidato.objetivo_profissional && !candidato.headline && (
              <p className="text-slate-300 text-sm text-center mt-2 max-w-xs">
                {candidato.objetivo_profissional}
              </p>
            )}
          </div>

          {/* Estatísticas estilo Instagram */}
          <div className="flex justify-around mt-6 py-4 border-t border-b border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{candidato.total_visualizacoes}</p>
              <p className="text-xs text-slate-400">visualizações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{candidato.total_propostas_recebidas}</p>
              <p className="text-xs text-slate-400">propostas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{candidato.total_candidaturas}</p>
              <p className="text-xs text-slate-400">candidaturas</p>
            </div>
          </div>

          {/* Badges DISC */}
          {candidato.perfil_disc && (
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {candidato.perfil_disc.split('').slice(0, 2).map((letra, idx) => {
                const cores = coresDISC[letra] || { bg: 'bg-slate-500', text: 'text-white', gradient: 'from-slate-500 to-slate-600' };
                const nome = nomesDISC[letra] || letra;
                return (
                  <Badge
                    key={idx}
                    className={`${cores.bg} ${cores.text} px-3 py-1 text-sm font-medium`}
                  >
                    {letra} - {nome}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Botão Compartilhar */}
          <div className="mt-4">
            <Button
              onClick={compartilhar}
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar meu perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-slate-800/60 border-slate-700 grid grid-cols-3">
          <TabsTrigger value="perfil" className="data-[state=active]:bg-slate-700">
            <User className="w-4 h-4 mr-1" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="experiencia" className="data-[state=active]:bg-slate-700">
            <Briefcase className="w-4 h-4 mr-1" />
            Experiência
          </TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-slate-700">
            <Play className="w-4 h-4 mr-1" />
            Vídeo
          </TabsTrigger>
        </TabsList>

        {/* Tab Perfil */}
        <TabsContent value="perfil" className="space-y-4 mt-4">
          {/* Disponibilidade */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Disponibilidade
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Início</p>
                  <p className="text-white text-sm">
                    {getDisponibilidadeLabel(candidato.disponibilidade_inicio)}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Horário</p>
                  <p className="text-white text-sm">{candidato.disponibilidade_horario || 'Não informado'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Regime</p>
                  <p className="text-white text-sm capitalize">{candidato.regime_preferido || 'Não informado'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Pretensão</p>
                  <p className="text-white text-sm">
                    {getFaixaSalarialLabel(candidato.pretensao_salarial)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Características */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>

          {/* Áreas de interesse */}
          {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Áreas de Interesse
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidato.areas_interesse.map((area, i) => (
                    <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valores */}
          {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  O que busco em uma empresa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidato.valores_empresa.map((valor, i) => (
                    <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                      {valor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Experiência */}
        <TabsContent value="experiencia" className="space-y-4 mt-4">
          {/* Experiência */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Experiência Profissional
              </h3>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-white font-medium">{candidato.ultimo_cargo || 'Não informado'}</p>
                <p className="text-slate-400 text-sm">{candidato.ultima_empresa || 'Não informado'}</p>
                {candidato.tempo_ultima_empresa && (
                  <p className="text-slate-500 text-xs mt-1">
                    Período: {candidato.tempo_ultima_empresa}
                  </p>
                )}
              </div>
              {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidato.areas_experiencia.map((area, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formação */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Formação
              </h3>
              <p className="text-white">{candidato.escolaridade || 'Não informado'}</p>
              {candidato.curso && (
                <p className="text-slate-400 text-sm">{candidato.curso}</p>
              )}
              {candidato.certificacoes && (
                <p className="text-slate-500 text-xs mt-1">
                  Certificações: {candidato.certificacoes}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Vídeo */}
        <TabsContent value="video" className="space-y-4 mt-4">
          {candidato.video_url ? (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Meu Vídeo de Apresentação
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                  <video
                    src={candidato.video_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={candidato.foto_url || undefined}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-8 text-center">
                <Play className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">Você ainda não gravou um vídeo de apresentação</p>
                <p className="text-sm text-slate-500 mt-1">
                  Vá em Configurações para gravar seu vídeo
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Relatório DISC Completo */}
      {(candidato.perfil_natural || candidato.perfil_disc) && (
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
                <p className="text-slate-400 text-sm">Sua análise comportamental detalhada</p>
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
              nomeCompleto={candidato.nome_completo}
              confiabilidade={confiabilidade}
            />
          )}
        </div>
      )}

      {/* Link de compartilhamento */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-4">
          <p className="text-sm text-slate-400 mb-2">Link do seu currículo:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={linkCompartilhamento}
              readOnly
              className="flex-1 bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copiarLink}
              className="border-slate-600"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Empresas precisam estar cadastradas para ver seus dados de contato.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
