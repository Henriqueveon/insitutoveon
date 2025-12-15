// =====================================================
// BUSCAR CANDIDATOS - Estilo Rede Social Mobile-First
// Grid de cards + Filtros em Sheet + Quick filters
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  GraduationCap,
  Car,
  Clock,
  DollarSign,
  X,
  Play,
  FileText,
  Send,
  Heart,
  ChevronLeft,
  ChevronRight,
  Users,
  SlidersHorizontal,
  Eye,
  Star,
  Plane,
  Baby,
  ArrowUpDown,
  Navigation,
  UserCircle,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import CandidatoPerfilModal from '../components/CandidatoPerfilModal';
// CurriculoCompletoModal removido - agora usa página dedicada
import ProfissionalCard, { calcularMatchSimples } from '../components/ProfissionalCard';
import CadastroIncompletoModal from '../components/CadastroIncompletoModal';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
  cadastro_completo?: boolean;
}

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url: string | null;
  cidade: string;
  estado: string;
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  pretensao_salarial: string | null;
  escolaridade: string | null;
  perfil_disc: string | null;
  disponibilidade_inicio: string | null;
  possui_cnh: string | null;
  possui_veiculo: string | null;
  regime_preferido: string | null;
  objetivo_profissional: string | null;
  distancia_km?: number | null;
}

interface Filtros {
  busca: string;
  estado: string;
  cidade: string;
  buscaProximidade: boolean;
  raioKm: number;
  areaExperiencia: string[];
  anosExperiencia: string;
  escolaridade: string;
  faixaSalarial: string;
  perfilDisc: string[];
  disponibilidade: string;
  possuiCNH: boolean | null;
  possuiVeiculo: boolean | null;
  aceitaViajar: boolean | null;
  regime: string;
  idadeMin: number | null;
  idadeMax: number | null;
  estadoCivil: string;
  temFilhos: boolean | null;
  sexo: string;
}

type OrdenacaoOption = 'recentes' | 'proximidade' | 'experiencia' | 'salario' | 'match';

interface CidadeSugestao {
  cidade: string;
  estado: string;
}

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const AREAS_EXPERIENCIA = [
  'Vendas', 'Atendimento', 'Administrativo', 'Financeiro', 'Marketing',
  'Recursos Humanos', 'Tecnologia', 'Logística', 'Produção', 'Saúde',
  'Educação', 'Jurídico', 'Engenharia', 'Contabilidade', 'Compras',
];

const ANOS_EXPERIENCIA_OPTIONS = [
  { value: 'primeiro_emprego', label: 'Primeiro emprego' },
  { value: 'menos_1', label: 'Menos de 1 ano' },
  { value: '1_2', label: '1 a 2 anos' },
  { value: '3_5', label: '3 a 5 anos' },
  { value: '5_10', label: '5 a 10 anos' },
  { value: 'mais_10', label: 'Mais de 10 anos' },
];

const ESCOLARIDADES = [
  'Ensino Fundamental',
  'Ensino Médio',
  'Ensino Técnico',
  'Ensino Superior (cursando)',
  'Ensino Superior (completo)',
  'Pós-graduação',
  'Mestrado/Doutorado',
];

const FAIXAS_SALARIAIS = [
  { value: 'ate_1500', label: 'Até R$ 1.500' },
  { value: '1500_2500', label: 'R$ 1.500 - R$ 2.500' },
  { value: '2500_4000', label: 'R$ 2.500 - R$ 4.000' },
  { value: '4000_6000', label: 'R$ 4.000 - R$ 6.000' },
  { value: '6000_10000', label: 'R$ 6.000 - R$ 10.000' },
  { value: 'acima_10000', label: 'Acima de R$ 10.000' },
];

const PERFIS_DISC = [
  { value: 'D', label: 'Dominante', color: 'bg-red-500', ring: 'ring-red-500' },
  { value: 'I', label: 'Influente', color: 'bg-yellow-500', ring: 'ring-yellow-500' },
  { value: 'S', label: 'Estável', color: 'bg-green-500', ring: 'ring-green-500' },
  { value: 'C', label: 'Conforme', color: 'bg-blue-500', ring: 'ring-blue-500' },
];

const DISPONIBILIDADES = [
  { value: 'imediata', label: 'Imediata' },
  { value: '15_dias', label: '15 dias' },
  { value: '30_dias', label: '30 dias' },
  { value: 'a_combinar', label: 'A combinar' },
];

const REGIMES = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'temporario', label: 'Temp.' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'freelancer', label: 'Freelancer' },
];

// Cores DISC
const DISC_COLORS = {
  D: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' },
  I: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  S: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' },
  C: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' },
};

export default function BuscarCandidatos() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { empresa } = useOutletContext<{ empresa: Empresa | null }>();

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  // Estados do modal removidos - agora usa página dedicada
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalCandidatos, setTotalCandidatos] = useState(0);
  const [cidades, setCidades] = useState<string[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const ITENS_POR_PAGINA = 12;

  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    estado: '',
    cidade: '',
    buscaProximidade: false,
    raioKm: 30,
    areaExperiencia: [],
    anosExperiencia: '',
    escolaridade: '',
    faixaSalarial: '',
    perfilDisc: [],
    disponibilidade: '',
    possuiCNH: null,
    possuiVeiculo: null,
    aceitaViajar: null,
    regime: '',
    idadeMin: null,
    idadeMax: null,
    estadoCivil: '',
    temFilhos: null,
    sexo: '',
  });

  const [ordenacao, setOrdenacao] = useState<OrdenacaoOption>('recentes');
  const [cidadesSugestoes, setCidadesSugestoes] = useState<CidadeSugestao[]>([]);
  const [buscaCidade, setBuscaCidade] = useState('');
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [showCadastroIncompleto, setShowCadastroIncompleto] = useState(false);

  // Verificar se há candidato selecionado na URL
  useEffect(() => {
    const candidatoId = searchParams.get('candidato');
    if (candidatoId && candidatos.length > 0) {
      const candidato = candidatos.find(c => c.id === candidatoId);
      if (candidato) {
        setCandidatoSelecionado(candidato);
        setModalAberto(true);
      }
    }
  }, [searchParams, candidatos]);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (filtros.estado) {
      carregarCidades(filtros.estado);
    } else {
      setCidades([]);
    }
  }, [filtros.estado]);

  // Resetar paginação quando filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtros]);

  // Carregar candidatos quando filtros, ordenação ou página mudarem
  useEffect(() => {
    carregarCandidatos();
  }, [filtros, paginaAtual, ordenacao]);

  // Carregar favoritos
  useEffect(() => {
    if (empresa?.id) {
      carregarFavoritos();
    }
  }, [empresa?.id]);

  const carregarCidades = async (uf: string) => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      );
      const data = await response.json();
      setCidades(data.map((c: any) => c.nome).sort());
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  // Buscar cidades com coordenadas para autocomplete
  const buscarCidadesAutocomplete = async (termo: string) => {
    if (termo.length < 2) {
      setCidadesSugestoes([]);
      return;
    }

    try {
      let query = supabase
        .from('cidades_coordenadas' as any)
        .select('cidade, estado')
        .ilike('cidade', `${termo}%`)
        .order('populacao', { ascending: false })
        .limit(10);

      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCidadesSugestoes((data as unknown as CidadeSugestao[]) || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  // Debounce para busca de cidades
  useEffect(() => {
    const timer = setTimeout(() => {
      if (buscaCidade) {
        buscarCidadesAutocomplete(buscaCidade);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [buscaCidade, filtros.estado]);

  const carregarCandidatos = async () => {
    setIsLoading(true);
    try {
      // Se busca por proximidade está ativa e tem cidade selecionada, usar função RPC
      if (filtros.buscaProximidade && filtros.cidade && filtros.estado) {
        const { data: proximosData, error: proximosError } = await supabase.rpc(
          'buscar_candidatos_proximos' as any,
          {
            p_cidade_origem: filtros.cidade,
            p_estado_origem: filtros.estado,
            p_raio_km: filtros.raioKm,
          }
        );

        if (proximosError) throw proximosError;

        // Buscar detalhes dos candidatos encontrados
        const candidatoIds = (proximosData as any[])?.map(c => c.candidato_id) || [];

        if (candidatoIds.length === 0) {
          setCandidatos([]);
          setTotalCandidatos(0);
          setIsLoading(false);
          return;
        }

        // Mostra candidatos com perfil DISC preenchido
        let query = supabase
          .from('candidatos_recrutamento')
          .select('*', { count: 'exact' })
          .in('id', candidatoIds)
          .not('perfil_disc', 'is', null)
          .neq('perfil_disc', '');

        // Aplicar outros filtros
        query = aplicarFiltrosExtras(query);

        const { data, count, error } = await query;

        if (error) throw error;

        // Adicionar distância aos candidatos
        const candidatosComDistancia = (data || []).map(candidato => {
          const info = (proximosData as any[])?.find(p => p.candidato_id === candidato.id);
          return { ...candidato, distancia_km: info?.distancia_km };
        });

        // Ordenar por distância se for proximidade
        if (ordenacao === 'proximidade') {
          candidatosComDistancia.sort((a, b) =>
            (a.distancia_km || 999) - (b.distancia_km || 999)
          );
        }

        setCandidatos(candidatosComDistancia as unknown as Candidato[]);
        setTotalCandidatos(count || 0);
      } else {
        // Busca normal sem proximidade
        // Mostra candidatos com perfil DISC preenchido
        // Status e cadastro_completo são tratados de forma mais flexível
        let query = supabase
          .from('candidatos_recrutamento')
          .select('*', { count: 'exact' })
          .not('perfil_disc', 'is', null)
          .neq('perfil_disc', '');

        // Aplicar filtros de localização
        if (filtros.estado) {
          query = query.eq('estado', filtros.estado);
        }
        if (filtros.cidade) {
          query = query.ilike('cidade', filtros.cidade);
        }

        // Aplicar outros filtros
        query = aplicarFiltrosExtras(query);

        // Paginação
        const from = (paginaAtual - 1) * ITENS_POR_PAGINA;
        const to = from + ITENS_POR_PAGINA - 1;
        query = query.range(from, to);

        // Ordenação
        switch (ordenacao) {
          case 'experiencia':
            query = query.order('anos_experiencia', { ascending: false, nullsFirst: false });
            break;
          case 'salario':
            query = query.order('pretensao_salarial', { ascending: true, nullsFirst: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, count, error } = await query;

        if (error) throw error;

        setCandidatos((data as unknown as Candidato[]) || []);
        setTotalCandidatos(count || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os profissionais.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para aplicar filtros extras
  const aplicarFiltrosExtras = (query: any) => {
    if (filtros.busca) {
      query = query.or(`nome_completo.ilike.%${filtros.busca}%,objetivo_profissional.ilike.%${filtros.busca}%`);
    }
    if (filtros.anosExperiencia) {
      switch (filtros.anosExperiencia) {
        case 'primeiro_emprego':
          query = query.eq('anos_experiencia', 0);
          break;
        case 'menos_1':
          query = query.lt('anos_experiencia', 1);
          break;
        case '1_2':
          query = query.gte('anos_experiencia', 1).lte('anos_experiencia', 2);
          break;
        case '3_5':
          query = query.gte('anos_experiencia', 3).lte('anos_experiencia', 5);
          break;
        case '5_10':
          query = query.gte('anos_experiencia', 5).lte('anos_experiencia', 10);
          break;
        case 'mais_10':
          query = query.gt('anos_experiencia', 10);
          break;
      }
    }
    if (filtros.escolaridade) {
      query = query.eq('escolaridade', filtros.escolaridade);
    }
    if (filtros.faixaSalarial) {
      query = query.eq('pretensao_salarial', filtros.faixaSalarial);
    }
    if (filtros.perfilDisc.length > 0) {
      query = query.in('perfil_disc', filtros.perfilDisc);
    }
    if (filtros.disponibilidade) {
      query = query.eq('disponibilidade_inicio', filtros.disponibilidade);
    }
    if (filtros.possuiCNH !== null) {
      query = query.eq('possui_cnh', filtros.possuiCNH ? 'sim' : 'nao');
    }
    if (filtros.possuiVeiculo !== null) {
      query = query.eq('possui_veiculo', filtros.possuiVeiculo ? 'sim' : 'nao');
    }
    if (filtros.aceitaViajar !== null) {
      query = query.eq('aceita_viajar', filtros.aceitaViajar ? 'sim' : 'nao');
    }
    if (filtros.regime) {
      query = query.eq('regime_preferido', filtros.regime);
    }
    if (filtros.areaExperiencia.length > 0) {
      query = query.overlaps('areas_experiencia', filtros.areaExperiencia);
    }
    if (filtros.estadoCivil) {
      query = query.eq('estado_civil', filtros.estadoCivil);
    }
    if (filtros.temFilhos !== null) {
      query = query.eq('tem_filhos', filtros.temFilhos);
    }
    if (filtros.sexo) {
      query = query.eq('sexo', filtros.sexo);
    }
    // Filtro de idade baseado em data_nascimento
    if (filtros.idadeMin !== null || filtros.idadeMax !== null) {
      const hoje = new Date();
      if (filtros.idadeMax !== null) {
        const dataMinNascimento = new Date(hoje.getFullYear() - filtros.idadeMax - 1, hoje.getMonth(), hoje.getDate());
        query = query.gte('data_nascimento', dataMinNascimento.toISOString().split('T')[0]);
      }
      if (filtros.idadeMin !== null) {
        const dataMaxNascimento = new Date(hoje.getFullYear() - filtros.idadeMin, hoje.getMonth(), hoje.getDate());
        query = query.lte('data_nascimento', dataMaxNascimento.toISOString().split('T')[0]);
      }
    }
    return query;
  };

  const carregarFavoritos = async () => {
    const { data } = await supabase
      .from('favoritos_recrutamento')
      .select('candidato_id')
      .eq('empresa_id', empresa?.id);

    if (data) {
      setFavoritos(data.map(f => f.candidato_id));
    }
  };

  const toggleFavorito = async (candidatoId: string) => {
    if (!empresa?.id) return;

    const isFavorito = favoritos.includes(candidatoId);

    if (isFavorito) {
      await supabase
        .from('favoritos_recrutamento')
        .delete()
        .eq('empresa_id', empresa.id)
        .eq('candidato_id', candidatoId);
      setFavoritos(prev => prev.filter(id => id !== candidatoId));
    } else {
      await supabase
        .from('favoritos_recrutamento')
        .insert({ empresa_id: empresa.id, candidato_id: candidatoId });
      setFavoritos(prev => [...prev, candidatoId]);
    }
  };

  const abrirPerfil = (candidato: Candidato) => {
    // Verificar se cadastro da empresa está completo
    if (!empresa?.cadastro_completo) {
      setShowCadastroIncompleto(true);
      return;
    }
    setCandidatoSelecionado(candidato);
    setModalAberto(true);
    setSearchParams({ candidato: candidato.id });
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCandidatoSelecionado(null);
    setSearchParams({});
  };

  // Função para abrir currículo completo - agora navega para página dedicada
  const abrirCurriculoCompleto = (candidatoId: string) => {
    if (!empresa?.cadastro_completo) {
      setShowCadastroIncompleto(true);
      return;
    }
    navigate(`/recrutamento/empresa/candidato/${candidatoId}`);
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      estado: '',
      cidade: '',
      buscaProximidade: false,
      raioKm: 30,
      areaExperiencia: [],
      anosExperiencia: '',
      escolaridade: '',
      faixaSalarial: '',
      perfilDisc: [],
      disponibilidade: '',
      possuiCNH: null,
      possuiVeiculo: null,
      aceitaViajar: null,
      regime: '',
      idadeMin: null,
      idadeMax: null,
      estadoCivil: '',
      temFilhos: null,
      sexo: '',
    });
    setBuscaCidade('');
    setOrdenacao('recentes');
    setPaginaAtual(1);
  };

  const selecionarCidade = (cidade: string, estado: string) => {
    setFiltros(prev => ({ ...prev, cidade, estado }));
    setBuscaCidade(cidade);
    setShowSugestoes(false);
  };

  const totalPaginas = Math.ceil(totalCandidatos / ITENS_POR_PAGINA);

  const filtrosAtivos = Object.values(filtros).filter(v =>
    Array.isArray(v) ? v.length > 0 : v !== '' && v !== null && v !== false
  ).length;

  return (
    <div className="max-w-lg mx-auto -mx-4 sm:mx-auto">
      {/* Header com busca */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {/* Campo de busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar profissional..."
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="pl-9 h-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl text-sm"
            />
          </div>

          {/* Botão Filtros */}
          <button
            onClick={() => setFiltrosAbertos(true)}
            className={`relative h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${
              filtrosAtivos > 0 ? 'bg-[#E31E24] text-white' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {filtrosAtivos > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {filtrosAtivos}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Filters - Perfil DISC */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs text-zinc-500 flex-shrink-0">DISC:</span>
          {PERFIS_DISC.map((perfil) => {
            const isSelected = filtros.perfilDisc.includes(perfil.value);
            return (
              <button
                key={perfil.value}
                onClick={() => {
                  setFiltros(prev => ({
                    ...prev,
                    perfilDisc: isSelected
                      ? prev.perfilDisc.filter(p => p !== perfil.value)
                      : [...prev.perfilDisc, perfil.value]
                  }));
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  isSelected
                    ? `${perfil.color} text-white`
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${perfil.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {perfil.value}
                </span>
                {perfil.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          <span className="text-white font-semibold">{totalCandidatos}</span> profissiona{totalCandidatos !== 1 ? 'is' : 'l'}
        </p>
        <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as OrdenacaoOption)}>
          <SelectTrigger className="h-8 w-auto bg-transparent border-0 text-zinc-400 text-xs gap-1 p-0 hover:text-white">
            <ArrowUpDown className="w-3 h-3" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="experiencia">Maior experiência</SelectItem>
            <SelectItem value="salario">Menor pretensão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Candidatos */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
        </div>
      ) : candidatos.length > 0 ? (
        <div className="px-4 pb-4 space-y-3">
          {candidatos.map((candidato) => {
            const discColor = candidato.perfil_disc ? DISC_COLORS[candidato.perfil_disc as keyof typeof DISC_COLORS] : null;
            const matchScore = calcularMatchSimples(candidato);
            const isFavorito = favoritos.includes(candidato.id);

            return (
              <div
                key={candidato.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
              >
                {/* Header do Card */}
                <div className="flex items-center gap-3 p-4">
                  <div className="relative" onClick={() => abrirPerfil(candidato)}>
                    <Avatar className="h-12 w-12 ring-2 ring-white/10">
                      <AvatarImage src={candidato.foto_url || undefined} />
                      <AvatarFallback className="bg-zinc-700 text-white font-bold">
                        {(candidato.nome_completo || 'P').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {candidato.perfil_disc && discColor && (
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${discColor.bg} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-zinc-900`}>
                        {candidato.perfil_disc}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => abrirPerfil(candidato)}>
                    <p className="text-white font-semibold text-sm truncate">
                      {candidato.nome_completo}
                    </p>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs truncate">{candidato.cidade}, {candidato.estado}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorito(candidato.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorito ? 'text-red-500' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
                    </button>
                    <Badge
                      className={`${
                        matchScore >= 90
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : matchScore >= 80
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-r from-zinc-600 to-zinc-700'
                      } text-white text-xs font-bold px-2 py-0.5 rounded-full`}
                    >
                      {matchScore}%
                    </Badge>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="px-4 pb-3" onClick={() => abrirPerfil(candidato)}>
                  {candidato.objetivo_profissional && (
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                      {candidato.objetivo_profissional}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {candidato.anos_experiencia && candidato.anos_experiencia > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-medium">
                        <Briefcase className="w-3 h-3" />
                        {candidato.anos_experiencia} anos
                      </span>
                    )}
                    {candidato.disponibilidade_inicio && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                        <Clock className="w-3 h-3" />
                        {candidato.disponibilidade_inicio === 'imediata' ? 'Imediato' : candidato.disponibilidade_inicio}
                      </span>
                    )}
                    {candidato.areas_experiencia?.slice(0, 1).map((area, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[11px]">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
                  <button
                    onClick={() => abrirCurriculoCompleto(candidato.id)}
                    className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver currículo
                  </button>
                  <Button
                    onClick={() => {
                      if (!empresa?.cadastro_completo) {
                        setShowCadastroIncompleto(true);
                        return;
                      }
                      abrirPerfil(candidato);
                    }}
                    className="h-8 bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-lg text-xs active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Proposta
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(prev => prev - 1)}
                className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-zinc-400">
                {paginaAtual} / {totalPaginas}
              </span>
              <button
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual(prev => prev + 1)}
                className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
            <Users className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Nenhum profissional encontrado
          </h3>
          <p className="text-zinc-400 text-sm mb-6">
            Tente ajustar os filtros para ver mais resultados
          </p>
          <Button
            onClick={limparFiltros}
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Sheet de Filtros */}
      <Sheet open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
        <SheetContent side="bottom" className="bg-black border-t border-zinc-800 rounded-t-3xl h-[85vh] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Filtros</span>
              </div>
              <div className="flex items-center gap-2">
                {filtrosAtivos > 0 && (
                  <button
                    onClick={limparFiltros}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Limpar ({filtrosAtivos})
                  </button>
                )}
                <button
                  onClick={() => setFiltrosAbertos(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Conteúdo dos filtros */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Localização */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  Localização
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filtros.estado}
                    onValueChange={(v) => {
                      setFiltros(prev => ({ ...prev, estado: v, cidade: '' }));
                      setBuscaCidade('');
                    }}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {ESTADOS_BR.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Input
                      placeholder="Cidade"
                      value={buscaCidade}
                      onChange={(e) => {
                        setBuscaCidade(e.target.value);
                        setShowSugestoes(true);
                        if (e.target.value.length < 2) {
                          setFiltros(prev => ({ ...prev, cidade: '' }));
                        }
                      }}
                      onFocus={() => setShowSugestoes(true)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                    {showSugestoes && cidadesSugestoes.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {cidadesSugestoes.map((cidade, i) => (
                          <button
                            key={i}
                            onClick={() => selecionarCidade(cidade.cidade, cidade.estado)}
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 flex items-center justify-between"
                          >
                            <span>{cidade.cidade}</span>
                            <span className="text-zinc-500 text-xs">{cidade.estado}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Busca por proximidade */}
                {filtros.cidade && (
                  <div className="bg-zinc-900 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-emerald-400" />
                        Buscar por proximidade
                      </span>
                      <Switch
                        checked={filtros.buscaProximidade}
                        onCheckedChange={(checked) =>
                          setFiltros(prev => ({ ...prev, buscaProximidade: checked }))
                        }
                      />
                    </div>
                    {filtros.buscaProximidade && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">Raio de busca</span>
                          <span className="text-white font-medium">{filtros.raioKm} km</span>
                        </div>
                        <Slider
                          value={[filtros.raioKm]}
                          onValueChange={([value]) =>
                            setFiltros(prev => ({ ...prev, raioKm: value }))
                          }
                          min={10}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Experiência */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  Experiência
                </Label>
                <Select
                  value={filtros.anosExperiencia}
                  onValueChange={(v) => setFiltros(prev => ({ ...prev, anosExperiencia: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Qualquer experiência" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {ANOS_EXPERIENCIA_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pretensão Salarial */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  Pretensão Salarial
                </Label>
                <Select
                  value={filtros.faixaSalarial}
                  onValueChange={(v) => setFiltros(prev => ({ ...prev, faixaSalarial: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Qualquer faixa" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {FAIXAS_SALARIAIS.map((faixa) => (
                      <SelectItem key={faixa.value} value={faixa.value}>{faixa.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Escolaridade */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-zinc-400" />
                  Escolaridade
                </Label>
                <Select
                  value={filtros.escolaridade}
                  onValueChange={(v) => setFiltros(prev => ({ ...prev, escolaridade: v }))}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Qualquer escolaridade" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {ESCOLARIDADES.map((esc) => (
                      <SelectItem key={esc} value={esc}>{esc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disponibilidade */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Disponibilidade
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DISPONIBILIDADES.map((disp) => {
                    const isSelected = filtros.disponibilidade === disp.value;
                    return (
                      <button
                        key={disp.value}
                        onClick={() => setFiltros(prev => ({
                          ...prev,
                          disponibilidade: isSelected ? '' : disp.value
                        }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {disp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Regime */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Regime de Trabalho
                </Label>
                <div className="flex flex-wrap gap-2">
                  {REGIMES.map((reg) => {
                    const isSelected = filtros.regime === reg.value;
                    return (
                      <button
                        key={reg.value}
                        onClick={() => setFiltros(prev => ({
                          ...prev,
                          regime: isSelected ? '' : reg.value
                        }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {reg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobilidade */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Car className="w-4 h-4 text-zinc-400" />
                  Mobilidade
                </Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl">
                    <Checkbox
                      checked={filtros.possuiCNH === true}
                      onCheckedChange={(checked) => {
                        setFiltros(prev => ({ ...prev, possuiCNH: checked ? true : null }));
                      }}
                    />
                    <span className="text-sm text-white">Possui CNH</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl">
                    <Checkbox
                      checked={filtros.possuiVeiculo === true}
                      onCheckedChange={(checked) => {
                        setFiltros(prev => ({ ...prev, possuiVeiculo: checked ? true : null }));
                      }}
                    />
                    <span className="text-sm text-white">Possui Veículo</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl">
                    <Checkbox
                      checked={filtros.aceitaViajar === true}
                      onCheckedChange={(checked) => {
                        setFiltros(prev => ({ ...prev, aceitaViajar: checked ? true : null }));
                      }}
                    />
                    <span className="text-sm text-white flex items-center gap-2">
                      <Plane className="w-4 h-4 text-purple-400" />
                      Aceita Viajar
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer com botão aplicar */}
            <div className="p-4 border-t border-zinc-800 bg-black">
              <Button
                onClick={() => setFiltrosAbertos(false)}
                className="w-full h-12 bg-gradient-to-r from-[#E31E24] to-[#003DA5] text-white font-semibold rounded-xl"
              >
                Ver {totalCandidatos} profissiona{totalCandidatos !== 1 ? 'is' : 'l'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Perfil (para enviar proposta) */}
      <CandidatoPerfilModal
        candidato={candidatoSelecionado as any}
        isOpen={modalAberto}
        onClose={fecharModal}
        empresa={empresa}
        isFavorito={candidatoSelecionado ? favoritos.includes(candidatoSelecionado.id) : false}
        onToggleFavorito={toggleFavorito}
      />

      {/* Modal Cadastro Incompleto */}
      <CadastroIncompletoModal
        open={showCadastroIncompleto}
        onOpenChange={setShowCadastroIncompleto}
      />
    </div>
  );
}
