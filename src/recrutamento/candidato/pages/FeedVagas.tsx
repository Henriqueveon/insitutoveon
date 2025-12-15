// =====================================================
// FEED DE VAGAS - Estilo Instagram/TikTok
// Stories de empresas + Cards de vagas
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronRight,
  Sparkles,
  Star,
  Briefcase,
  Users,
  TrendingUp,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  perfil_disc: string | null;
  status: string;
}

interface Vaga {
  id: string;
  titulo: string;
  empresa_nome: string;
  empresa_logo: string | null;
  cidade: string;
  estado: string;
  salario_min: number | null;
  salario_max: number | null;
  regime: string;
  perfil_disc_ideal: string | null;
  descricao: string;
  modalidade: string | null;
  created_at: string;
  match_score?: number;
}

interface Empresa {
  id: string;
  nome_fantasia: string;
  logo_url: string | null;
  vagas_count: number;
}

export default function FeedVagas() {
  const navigate = useNavigate();
  const { candidato } = useOutletContext<{ candidato: Candidato | null }>();

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [empresasDestaque, setEmpresasDestaque] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vagasCurtidas, setVagasCurtidas] = useState<Set<string>>(new Set());
  const [vagasSalvas, setVagasSalvas] = useState<Set<string>>(new Set());

  useEffect(() => {
    carregarDados();
  }, [candidato?.id]);

  const carregarDados = async () => {
    setIsLoading(true);

    try {
      // Carregar vagas disponíveis
      const { data: vagasData } = await supabase
        .from('vagas_recrutamento')
        .select(`
          id,
          titulo,
          cidade,
          estado,
          faixa_salarial_min,
          faixa_salarial_max,
          regime,
          perfil_disc_ideal,
          descricao,
          modalidade,
          created_at,
          empresa:empresas_recrutamento(nome_fantasia, logo_url)
        `)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false })
        .limit(20);

      if (vagasData) {
        const vagasFormatadas = vagasData.map((v: any) => ({
          id: v.id,
          titulo: v.titulo,
          empresa_nome: v.empresa?.nome_fantasia || 'Empresa',
          empresa_logo: v.empresa?.logo_url,
          cidade: v.cidade,
          estado: v.estado,
          salario_min: v.faixa_salarial_min,
          salario_max: v.faixa_salarial_max,
          regime: v.regime,
          perfil_disc_ideal: v.perfil_disc_ideal,
          descricao: v.descricao,
          modalidade: v.modalidade,
          created_at: v.created_at,
          // Calcular match score se candidato tem perfil DISC
          match_score: candidato?.perfil_disc && v.perfil_disc_ideal
            ? calcularMatch(candidato.perfil_disc, v.perfil_disc_ideal)
            : undefined,
        }));
        setVagas(vagasFormatadas);
      }

      // Carregar empresas em destaque (com mais vagas)
      const { data: empresasData } = await supabase
        .from('empresas_recrutamento')
        .select('id, nome_fantasia, logo_url')
        .limit(10);

      if (empresasData) {
        setEmpresasDestaque(empresasData.map((e: any) => ({
          ...e,
          vagas_count: Math.floor(Math.random() * 5) + 1, // Simulado
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularMatch = (perfilCandidato: string, perfilVaga: string): number => {
    // Se perfis coincidem exatamente
    if (perfilCandidato === perfilVaga) return 100;
    // Se perfis são complementares
    const complementares: Record<string, string[]> = {
      D: ['I', 'C'],
      I: ['D', 'S'],
      S: ['I', 'C'],
      C: ['D', 'S'],
    };
    if (complementares[perfilCandidato]?.includes(perfilVaga)) return 75;
    return 50;
  };

  const formatarSalario = (min: number | null, max: number | null) => {
    if (!min && !max) return 'A combinar';
    if (min && max) {
      return `R$ ${(min / 1000).toFixed(1)}k - ${(max / 1000).toFixed(1)}k`;
    }
    if (min) return `A partir de R$ ${(min / 1000).toFixed(1)}k`;
    return `Até R$ ${(max! / 1000).toFixed(1)}k`;
  };

  const formatarData = (data: string) => {
    const diff = Date.now() - new Date(data).getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `${dias}d`;
    return `${Math.floor(dias / 7)}sem`;
  };

  const toggleCurtir = (vagaId: string) => {
    setVagasCurtidas((prev) => {
      const novoSet = new Set(prev);
      if (novoSet.has(vagaId)) {
        novoSet.delete(vagaId);
      } else {
        novoSet.add(vagaId);
      }
      return novoSet;
    });
  };

  const toggleSalvar = (vagaId: string) => {
    setVagasSalvas((prev) => {
      const novoSet = new Set(prev);
      if (novoSet.has(vagaId)) {
        novoSet.delete(vagaId);
      } else {
        novoSet.add(vagaId);
      }
      return novoSet;
    });
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-600';
    if (score >= 70) return 'from-amber-500 to-orange-600';
    return 'from-blue-500 to-indigo-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 -mx-4 sm:mx-auto">
      {/* Stories de Empresas */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Empresas contratando</h2>
          <button className="text-xs text-zinc-400 hover:text-white">Ver todas</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {/* Story "Para você" especial */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E31E24] to-[#003DA5] p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-white/70 text-center w-16 truncate">Para você</span>
          </div>

          {empresasDestaque.map((empresa) => (
            <button
              key={empresa.id}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {empresa.logo_url ? (
                    <img
                      src={empresa.logo_url}
                      alt={empresa.nome_fantasia}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-white/70 text-center w-16 truncate">
                {empresa.nome_fantasia}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Header do Feed */}
      <div className="px-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Vagas para você</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{vagas.length} vagas</span>
        </div>
      </div>

      {/* Feed de Vagas */}
      {vagas.length === 0 ? (
        <div className="px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Nenhuma vaga disponível
            </h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              Novas vagas são publicadas todos os dias. Complete seu perfil para receber notificações.
            </p>
            <Button
              onClick={() => navigate('/recrutamento/candidato/meu-curriculo')}
              className="bg-white text-black font-semibold rounded-xl hover:bg-white/90"
            >
              Completar perfil
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 px-4">
          {vagas.map((vaga) => (
            <div
              key={vaga.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              {/* Header do Card */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {vaga.empresa_logo ? (
                    <img
                      src={vaga.empresa_logo}
                      alt={vaga.empresa_nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {vaga.empresa_nome}
                  </p>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{vaga.cidade}, {vaga.estado}</span>
                    <span className="text-zinc-600 mx-1">•</span>
                    <span className="text-xs">{formatarData(vaga.created_at)}</span>
                  </div>
                </div>
                {vaga.match_score && (
                  <div className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${getMatchColor(vaga.match_score)} text-white text-xs font-bold`}>
                    {vaga.match_score}% match
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-2">
                  {vaga.titulo}
                </h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                  {vaga.descricao}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <DollarSign className="w-3 h-3" />
                    {formatarSalario(vaga.salario_min, vaga.salario_max)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {vaga.regime || 'CLT'}
                  </span>
                  {vaga.modalidade && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                      {vaga.modalidade}
                    </span>
                  )}
                  {vaga.perfil_disc_ideal && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                      <Star className="w-3 h-3" />
                      Perfil {vaga.perfil_disc_ideal}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações estilo Instagram */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleCurtir(vaga.id)}
                    className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
                  >
                    <Heart
                      className={`w-6 h-6 ${vagasCurtidas.has(vaga.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </button>
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
                <button
                  onClick={() => toggleSalvar(vaga.id)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Bookmark
                    className={`w-6 h-6 ${vagasSalvas.has(vaga.id) ? 'fill-white text-white' : ''}`}
                  />
                </button>
              </div>

              {/* Botão de candidatura */}
              <div className="px-4 pb-4">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-bold rounded-xl hover:opacity-90"
                >
                  Me candidatar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="px-4 pb-4">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Dica</p>
              <p className="text-zinc-400 text-sm mt-1">
                Vagas com match acima de 80% têm 3x mais chances de contratação. Complete seu teste DISC!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
