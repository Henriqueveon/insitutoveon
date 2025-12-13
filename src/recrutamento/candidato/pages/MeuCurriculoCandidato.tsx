// =====================================================
// MEU CURRÍCULO CANDIDATO - Área de Recrutamento VEON
// Visualização do perfil completo com DISC
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Share2,
  Copy,
  Download,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  Home,
  Clock,
  DollarSign,
  Calendar,
  Instagram,
  Play,
  Star,
  Target,
  CheckCircle,
  User,
  Building2,
} from 'lucide-react';

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
  bairro: string;
  perfil_disc: string | null;
  objetivo_profissional: string;

  // Experiência
  areas_experiencia: string[];
  anos_experiencia: string;
  ultima_empresa: string;
  ultimo_cargo: string;
  tempo_ultima_empresa: string;
  motivo_saida: string;

  // Formação
  escolaridade: string;
  curso: string | null;
  certificacoes: string | null;

  // Disponibilidade
  disponibilidade_inicio: string;
  disponibilidade_horario: string;
  regime_preferido: string;
  pretensao_salarial: string;

  // Logística
  possui_cnh: boolean;
  possui_veiculo: boolean;
  aceita_viajar: boolean;
  aceita_mudanca: boolean;

  // Pessoal
  estado_civil: string;
  tem_filhos: boolean;
  quantidade_filhos: number | null;
  instagram: string | null;

  // Valores
  valores_empresa: string[];
  areas_interesse: string[];
}

export default function MeuCurriculoCandidato() {
  const { toast } = useToast();
  const { candidato: candidatoContext } = useOutletContext<{ candidato: { id: string } | null }>();

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkCompartilhamento, setLinkCompartilhamento] = useState('');

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

      setCandidato(data);

      // Gerar link de compartilhamento
      setLinkCompartilhamento(`${window.location.origin}/c/${data.id.substring(0, 8)}`);
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
      case 'D': return 'Direto, decisivo, orientado a resultados. Gosta de desafios e de assumir o controle das situações.';
      case 'I': return 'Comunicativo, entusiasta, otimista. Adora interagir com pessoas e criar conexões.';
      case 'S': return 'Calmo, paciente, leal. Valoriza estabilidade e trabalha bem em equipe.';
      case 'C': return 'Analítico, preciso, detalhista. Preza pela qualidade e segue procedimentos.';
      default: return '';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E31E24]" />
      </div>
    );
  }

  if (!candidato) return null;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Meu Currículo</h1>
        <Button
          onClick={compartilhar}
          size="sm"
          className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
      </div>

      {/* Card Principal */}
      <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
        {/* Header com foto */}
        <div className="bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-white/20">
              <AvatarImage src={candidato.foto_url || undefined} />
              <AvatarFallback className="bg-slate-600 text-white text-2xl">
                {candidato.nome_completo.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {candidato.nome_completo}
              </h2>
              <p className="text-slate-400 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {candidato.cidade}, {candidato.estado}
              </p>
              <p className="text-slate-400 text-sm">
                {calcularIdade(candidato.data_nascimento)} anos
              </p>
            </div>
          </div>

          {/* Perfil DISC */}
          {candidato.perfil_disc && (
            <div className="mt-4 flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full ${getCorPerfil(candidato.perfil_disc)} flex items-center justify-center text-xl font-bold text-white`}>
                {candidato.perfil_disc}
              </div>
              <div>
                <p className="text-white font-medium">
                  Perfil {getNomePerfil(candidato.perfil_disc)}
                </p>
                <p className="text-xs text-slate-400">
                  {getDescricaoPerfil(candidato.perfil_disc)}
                </p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-6">
          {/* Objetivo */}
          {candidato.objetivo_profissional && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Objetivo Profissional
              </h3>
              <p className="text-white">{candidato.objetivo_profissional}</p>
            </div>
          )}

          {/* Vídeo */}
          {candidato.video_url && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Vídeo de Apresentação
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
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
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Experiência Profissional
            </h3>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-white font-medium">{candidato.ultimo_cargo}</p>
              <p className="text-slate-400 text-sm">{candidato.ultima_empresa}</p>
              <p className="text-slate-500 text-xs mt-1">
                Período: {candidato.tempo_ultima_empresa}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidato.areas_experiencia?.map((area, i) => (
                <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-300">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Formação */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Formação
            </h3>
            <p className="text-white">{candidato.escolaridade}</p>
            {candidato.curso && (
              <p className="text-slate-400 text-sm">{candidato.curso}</p>
            )}
            {candidato.certificacoes && (
              <p className="text-slate-500 text-xs mt-1">
                Certificações: {candidato.certificacoes}
              </p>
            )}
          </div>

          {/* Disponibilidade */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
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
                <p className="text-white text-sm">{candidato.disponibilidade_horario}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Regime</p>
                <p className="text-white text-sm capitalize">{candidato.regime_preferido}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Pretensão</p>
                <p className="text-white text-sm">
                  {getFaixaSalarialLabel(candidato.pretensao_salarial)}
                </p>
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
            <div>
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
            </div>
          )}

          {/* Valores */}
          {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                O que busca em uma empresa
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidato.valores_empresa.map((valor, i) => (
                  <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                    {valor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
