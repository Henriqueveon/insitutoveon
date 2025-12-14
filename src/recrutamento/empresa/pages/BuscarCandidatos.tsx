// =====================================================
// BUSCAR CANDIDATOS - Área de Recrutamento VEON
// Busca avançada com filtros e perfil expandido
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
} from 'lucide-react';
import CandidatoPerfilModal from '../components/CandidatoPerfilModal';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
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
  { value: 'D', label: 'Dominância', color: 'bg-red-500' },
  { value: 'I', label: 'Influência', color: 'bg-yellow-500' },
  { value: 'S', label: 'Estabilidade', color: 'bg-green-500' },
  { value: 'C', label: 'Conformidade', color: 'bg-blue-500' },
];

const DISPONIBILIDADES = [
  { value: 'imediata', label: 'Imediata' },
  { value: '15_dias', label: 'Em 15 dias' },
  { value: '30_dias', label: 'Em 30 dias' },
  { value: 'a_combinar', label: 'A combinar' },
];

const REGIMES = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'temporario', label: 'Temporário' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'freelancer', label: 'Freelancer' },
];

const ESTADOS_CIVIS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
];

const ORDENACAO_OPTIONS = [
  { value: 'recentes', label: 'Mais recentes', icon: Clock },
  { value: 'proximidade', label: 'Mais próximos', icon: MapPin },
  { value: 'experiencia', label: 'Maior experiência', icon: Briefcase },
  { value: 'salario', label: 'Menor pretensão salarial', icon: DollarSign },
];

export default function BuscarCandidatos() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { empresa } = useOutletContext<{ empresa: Empresa | null }>();

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
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
  });

  const [ordenacao, setOrdenacao] = useState<OrdenacaoOption>('recentes');
  const [cidadesSugestoes, setCidadesSugestoes] = useState<CidadeSugestao[]>([]);
  const [buscaCidade, setBuscaCidade] = useState('');
  const [showSugestoes, setShowSugestoes] = useState(false);

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
        .from('cidades_coordenadas')
        .select('cidade, estado')
        .ilike('cidade', `${termo}%`)
        .order('populacao', { ascending: false })
        .limit(10);

      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCidadesSugestoes((data as CidadeSugestao[]) || []);
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
          'buscar_candidatos_proximos',
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

        // IMPORTANTE: Só mostra candidatos com cadastro completo
        let query = supabase
          .from('candidatos_recrutamento')
          .select('*', { count: 'exact' })
          .in('id', candidatoIds)
          .eq('cadastro_completo', true)
          .not('perfil_disc', 'is', null)
          .not('foto_url', 'is', null);

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
        // IMPORTANTE: Só mostra candidatos com cadastro completo e perfil DISC
        let query = supabase
          .from('candidatos_recrutamento')
          .select('*', { count: 'exact' })
          .eq('status', 'disponivel')
          .eq('cadastro_completo', true)
          .not('perfil_disc', 'is', null)
          .not('foto_url', 'is', null);

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
      console.error('Erro ao carregar candidatos:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os candidatos.',
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
    setCandidatoSelecionado(candidato);
    setModalAberto(true);
    setSearchParams({ candidato: candidato.id });
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCandidatoSelecionado(null);
    setSearchParams({});
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

  const getCorPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'bg-red-500';
      case 'I': return 'bg-yellow-500';
      case 'S': return 'bg-green-500';
      case 'C': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getDisponibilidadeLabel = (disp: string) => {
    const item = DISPONIBILIDADES.find(d => d.value === disp);
    return item?.label || disp;
  };

  const filtrosAtivos = Object.values(filtros).filter(v =>
    Array.isArray(v) ? v.length > 0 : v !== '' && v !== null
  ).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar de Filtros - Desktop */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <Card className="bg-slate-800/60 border-slate-700 sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
            {filtrosAtivos > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limparFiltros}
                className="text-slate-400 hover:text-white h-8"
              >
                Limpar ({filtrosAtivos})
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {/* Ordenação */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Ordenar por
              </Label>
              <Select
                value={ordenacao}
                onValueChange={(v) => setOrdenacao(v as OrdenacaoOption)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDENACAO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label className="text-slate-300">Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(v) => {
                  setFiltros(prev => ({ ...prev, estado: v, cidade: '' }));
                  setBuscaCidade('');
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BR.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade com Autocomplete */}
            <div className="space-y-2 relative">
              <Label className="text-slate-300">Cidade</Label>
              <div className="relative">
                <Input
                  placeholder="Digite para buscar..."
                  value={buscaCidade}
                  onChange={(e) => {
                    setBuscaCidade(e.target.value);
                    setShowSugestoes(true);
                    if (e.target.value.length < 2) {
                      setFiltros(prev => ({ ...prev, cidade: '' }));
                    }
                  }}
                  onFocus={() => setShowSugestoes(true)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {buscaCidade && (
                  <button
                    onClick={() => {
                      setBuscaCidade('');
                      setFiltros(prev => ({ ...prev, cidade: '' }));
                      setCidadesSugestoes([]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {showSugestoes && cidadesSugestoes.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {cidadesSugestoes.map((cidade, i) => (
                    <button
                      key={i}
                      onClick={() => selecionarCidade(cidade.cidade, cidade.estado)}
                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center justify-between"
                    >
                      <span>{cidade.cidade}</span>
                      <span className="text-slate-400 text-xs">{cidade.estado}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle de Proximidade */}
            {filtros.cidade && (
              <div className="space-y-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-green-400" />
                    Buscar por proximidade
                  </Label>
                  <Switch
                    checked={filtros.buscaProximidade}
                    onCheckedChange={(checked) =>
                      setFiltros(prev => ({ ...prev, buscaProximidade: checked }))
                    }
                  />
                </div>
                {filtros.buscaProximidade && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Raio de busca:</span>
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
                    <p className="text-xs text-slate-500">
                      Mostra candidatos até {filtros.raioKm}km de {filtros.cidade}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Perfil DISC */}
            <Accordion type="single" collapsible defaultValue="disc">
              <AccordionItem value="disc" className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white py-2">
                  Perfil DISC
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {PERFIS_DISC.map((perfil) => (
                      <label
                        key={perfil.value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={filtros.perfilDisc.includes(perfil.value)}
                          onCheckedChange={(checked) => {
                            setFiltros(prev => ({
                              ...prev,
                              perfilDisc: checked
                                ? [...prev.perfilDisc, perfil.value]
                                : prev.perfilDisc.filter(p => p !== perfil.value)
                            }));
                          }}
                          className="border-slate-500"
                        />
                        <span className={`w-5 h-5 rounded-full ${perfil.color} flex items-center justify-center text-xs font-bold text-white`}>
                          {perfil.value}
                        </span>
                        <span className="text-sm text-slate-300">{perfil.label}</span>
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Experiência */}
            <div className="space-y-2">
              <Label className="text-slate-300">Experiência</Label>
              <Select
                value={filtros.anosExperiencia}
                onValueChange={(v) => setFiltros(prev => ({ ...prev, anosExperiencia: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Qualquer experiência" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS_EXPERIENCIA_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Área de Atuação */}
            <Accordion type="single" collapsible>
              <AccordionItem value="areas" className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white py-2">
                  Áreas de atuação
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {AREAS_EXPERIENCIA.map((area) => (
                      <label
                        key={area}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={filtros.areaExperiencia.includes(area)}
                          onCheckedChange={(checked) => {
                            setFiltros(prev => ({
                              ...prev,
                              areaExperiencia: checked
                                ? [...prev.areaExperiencia, area]
                                : prev.areaExperiencia.filter(a => a !== area)
                            }));
                          }}
                          className="border-slate-500"
                        />
                        <span className="text-sm text-slate-300">{area}</span>
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Escolaridade */}
            <div className="space-y-2">
              <Label className="text-slate-300">Escolaridade</Label>
              <Select
                value={filtros.escolaridade}
                onValueChange={(v) => setFiltros(prev => ({ ...prev, escolaridade: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Qualquer escolaridade" />
                </SelectTrigger>
                <SelectContent>
                  {ESCOLARIDADES.map((esc) => (
                    <SelectItem key={esc} value={esc}>{esc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pretensão Salarial */}
            <div className="space-y-2">
              <Label className="text-slate-300">Pretensão Salarial</Label>
              <Select
                value={filtros.faixaSalarial}
                onValueChange={(v) => setFiltros(prev => ({ ...prev, faixaSalarial: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Qualquer faixa" />
                </SelectTrigger>
                <SelectContent>
                  {FAIXAS_SALARIAIS.map((faixa) => (
                    <SelectItem key={faixa.value} value={faixa.value}>{faixa.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disponibilidade */}
            <div className="space-y-2">
              <Label className="text-slate-300">Disponibilidade</Label>
              <Select
                value={filtros.disponibilidade}
                onValueChange={(v) => setFiltros(prev => ({ ...prev, disponibilidade: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Qualquer disponibilidade" />
                </SelectTrigger>
                <SelectContent>
                  {DISPONIBILIDADES.map((disp) => (
                    <SelectItem key={disp.value} value={disp.value}>{disp.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Regime */}
            <div className="space-y-2">
              <Label className="text-slate-300">Regime de Trabalho</Label>
              <Select
                value={filtros.regime}
                onValueChange={(v) => setFiltros(prev => ({ ...prev, regime: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Qualquer regime" />
                </SelectTrigger>
                <SelectContent>
                  {REGIMES.map((reg) => (
                    <SelectItem key={reg.value} value={reg.value}>{reg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobilidade */}
            <Accordion type="single" collapsible>
              <AccordionItem value="mobilidade" className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white py-2">
                  <span className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Mobilidade
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filtros.possuiCNH === true}
                        onCheckedChange={(checked) => {
                          setFiltros(prev => ({ ...prev, possuiCNH: checked ? true : null }));
                        }}
                        className="border-slate-500"
                      />
                      <span className="text-sm text-slate-300">Possui CNH</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filtros.possuiVeiculo === true}
                        onCheckedChange={(checked) => {
                          setFiltros(prev => ({ ...prev, possuiVeiculo: checked ? true : null }));
                        }}
                        className="border-slate-500"
                      />
                      <span className="text-sm text-slate-300">Possui Veículo</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filtros.aceitaViajar === true}
                        onCheckedChange={(checked) => {
                          setFiltros(prev => ({ ...prev, aceitaViajar: checked ? true : null }));
                        }}
                        className="border-slate-500"
                      />
                      <span className="text-sm text-slate-300 flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        Aceita Viajar
                      </span>
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Perfil Pessoal */}
            <Accordion type="single" collapsible>
              <AccordionItem value="pessoal" className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white py-2">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Perfil Pessoal
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-xs">Estado Civil</Label>
                      <Select
                        value={filtros.estadoCivil}
                        onValueChange={(v) => setFiltros(prev => ({ ...prev, estadoCivil: v }))}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                          <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_CIVIS.map((ec) => (
                            <SelectItem key={ec.value} value={ec.value}>{ec.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filtros.temFilhos === true}
                        onCheckedChange={(checked) => {
                          setFiltros(prev => ({ ...prev, temFilhos: checked ? true : null }));
                        }}
                        className="border-slate-500"
                      />
                      <span className="text-sm text-slate-300 flex items-center gap-1">
                        <Baby className="w-3 h-3" />
                        Tem Filhos
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filtros.temFilhos === false}
                        onCheckedChange={(checked) => {
                          setFiltros(prev => ({ ...prev, temFilhos: checked ? false : null }));
                        }}
                        className="border-slate-500"
                      />
                      <span className="text-sm text-slate-300">Não tem filhos</span>
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar por nome, cargo ou habilidade..."
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Botão Filtros Mobile */}
          <Button
            variant="outline"
            className="lg:hidden border-slate-700 text-slate-300"
            onClick={() => setFiltrosAbertos(true)}
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filtros
            {filtrosAtivos > 0 && (
              <Badge className="ml-2 bg-[#E31E24]">{filtrosAtivos}</Badge>
            )}
          </Button>
        </div>

        {/* Resultados */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-400">
            {totalCandidatos} candidato{totalCandidatos !== 1 ? 's' : ''} encontrado{totalCandidatos !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid de Candidatos */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
          </div>
        ) : candidatos.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {candidatos.map((candidato) => (
                <Card
                  key={candidato.id}
                  className="bg-slate-800/60 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
                  onClick={() => abrirPerfil(candidato)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={candidato.foto_url || undefined} />
                            <AvatarFallback className="bg-slate-600 text-white">
                              {candidato.nome_completo.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {candidato.perfil_disc && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getCorPerfil(candidato.perfil_disc)} flex items-center justify-center text-xs font-bold text-white`}>
                              {candidato.perfil_disc}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {candidato.nome_completo.split(' ').slice(0, 2).join(' ')}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {candidato.cidade}, {candidato.estado}
                            {candidato.distancia_km !== undefined && candidato.distancia_km !== null && (
                              <span className="ml-2 text-green-400">
                                ({candidato.distancia_km} km)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorito(candidato.id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 ${favoritos.includes(candidato.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </Button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidato.areas_experiencia?.slice(0, 2).map((area, i) => (
                        <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                          {area}
                        </Badge>
                      ))}
                      {candidato.areas_experiencia?.length > 2 && (
                        <Badge variant="secondary" className="bg-slate-700 text-slate-400 text-xs">
                          +{candidato.areas_experiencia.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center text-slate-400">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-500" />
                        {candidato.anos_experiencia || 0} anos de experiência
                      </div>
                      <div className="flex items-center text-slate-400">
                        <GraduationCap className="w-4 h-4 mr-2 text-slate-500" />
                        {candidato.escolaridade || 'Não informado'}
                      </div>
                      <div className="flex items-center text-slate-400">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" />
                        {getDisponibilidadeLabel(candidato.disponibilidade_inicio || 'a_combinar')}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                      <div className="flex items-center space-x-2">
                        {candidato.possui_cnh === 'sim' && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                            <Car className="w-3 h-3 mr-1" />
                            CNH
                          </Badge>
                        )}
                        {candidato.video_url && (
                          <Badge variant="outline" className="border-blue-600 text-blue-400 text-xs">
                            <Play className="w-3 h-3 mr-1" />
                            Vídeo
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#E31E24] hover:text-[#E31E24] hover:bg-[#E31E24]/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual(prev => prev - 1)}
                  className="border-slate-700 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-slate-400">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPaginaAtual(prev => prev + 1)}
                  className="border-slate-700 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum candidato encontrado
              </h3>
              <p className="text-slate-400 mb-4">
                Tente ajustar os filtros para ver mais resultados
              </p>
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="border-slate-600 text-slate-300"
              >
                Limpar filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sheet de Filtros - Mobile */}
      <Sheet open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
        <SheetContent side="left" className="bg-slate-800 border-slate-700 w-80">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </span>
              {filtrosAtivos > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparFiltros}
                  className="text-slate-400 hover:text-white"
                >
                  Limpar ({filtrosAtivos})
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          {/* Mesmo conteúdo dos filtros desktop */}
          <div className="space-y-4 mt-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {/* Estado */}
            <div className="space-y-2">
              <Label className="text-slate-300">Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(v) => setFiltros(prev => ({ ...prev, estado: v, cidade: '' }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BR.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Perfil DISC */}
            <div className="space-y-2">
              <Label className="text-slate-300">Perfil DISC</Label>
              <div className="grid grid-cols-2 gap-2">
                {PERFIS_DISC.map((perfil) => (
                  <label
                    key={perfil.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={filtros.perfilDisc.includes(perfil.value)}
                      onCheckedChange={(checked) => {
                        setFiltros(prev => ({
                          ...prev,
                          perfilDisc: checked
                            ? [...prev.perfilDisc, perfil.value]
                            : prev.perfilDisc.filter(p => p !== perfil.value)
                        }));
                      }}
                      className="border-slate-500"
                    />
                    <span className={`w-5 h-5 rounded-full ${perfil.color} flex items-center justify-center text-xs font-bold text-white`}>
                      {perfil.value}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experiência */}
            <div className="space-y-2">
              <Label className="text-slate-300">Experiência</Label>
              <Select
                value={filtros.anosExperiencia}
                onValueChange={(v) => setFiltros(prev => ({ ...prev, anosExperiencia: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Qualquer experiência" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS_EXPERIENCIA_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aplicar */}
            <Button
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
              onClick={() => setFiltrosAbertos(false)}
            >
              Aplicar filtros
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Perfil */}
      <CandidatoPerfilModal
        candidato={candidatoSelecionado as any}
        isOpen={modalAberto}
        onClose={fecharModal}
        empresa={empresa}
        isFavorito={candidatoSelecionado ? favoritos.includes(candidatoSelecionado.id) : false}
        onToggleFavorito={toggleFavorito}
      />
    </div>
  );
}
