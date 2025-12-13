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
  areas_experiencia: string[];
  anos_experiencia: string;
  pretensao_salarial: string;
  escolaridade: string;
  perfil_disc: string | null;
  disponibilidade_inicio: string;
  possui_cnh: boolean;
  possui_veiculo: boolean;
  regime_preferido: string;
  objetivo_profissional: string;
}

interface Filtros {
  busca: string;
  estado: string;
  cidade: string;
  areaExperiencia: string[];
  anosExperiencia: string;
  escolaridade: string;
  faixaSalarial: string;
  perfilDisc: string[];
  disponibilidade: string;
  possuiCNH: boolean | null;
  possuiVeiculo: boolean | null;
  regime: string;
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
    areaExperiencia: [],
    anosExperiencia: '',
    escolaridade: '',
    faixaSalarial: '',
    perfilDisc: [],
    disponibilidade: '',
    possuiCNH: null,
    possuiVeiculo: null,
    regime: '',
  });

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

  // Carregar candidatos quando filtros mudarem
  useEffect(() => {
    carregarCandidatos();
  }, [filtros, paginaAtual]);

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

  const carregarCandidatos = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('candidatos_recrutamento')
        .select('*', { count: 'exact' })
        .eq('status', 'disponivel');

      // Aplicar filtros
      if (filtros.busca) {
        query = query.or(`nome_completo.ilike.%${filtros.busca}%,objetivo_profissional.ilike.%${filtros.busca}%`);
      }
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros.cidade) {
        query = query.eq('cidade', filtros.cidade);
      }
      if (filtros.anosExperiencia) {
        query = query.eq('anos_experiencia', filtros.anosExperiencia);
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
        query = query.eq('possui_cnh', filtros.possuiCNH);
      }
      if (filtros.possuiVeiculo !== null) {
        query = query.eq('possui_veiculo', filtros.possuiVeiculo);
      }
      if (filtros.regime) {
        query = query.eq('regime_preferido', filtros.regime);
      }
      if (filtros.areaExperiencia.length > 0) {
        query = query.overlaps('areas_experiencia', filtros.areaExperiencia);
      }

      // Paginação
      const from = (paginaAtual - 1) * ITENS_POR_PAGINA;
      const to = from + ITENS_POR_PAGINA - 1;
      query = query.range(from, to);
      query = query.order('created_at', { ascending: false });

      const { data, count, error } = await query;

      if (error) throw error;

      setCandidatos(data || []);
      setTotalCandidatos(count || 0);
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
      areaExperiencia: [],
      anosExperiencia: '',
      escolaridade: '',
      faixaSalarial: '',
      perfilDisc: [],
      disponibilidade: '',
      possuiCNH: null,
      possuiVeiculo: null,
      regime: '',
    });
    setPaginaAtual(1);
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
            {/* Localização */}
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

            {filtros.estado && cidades.length > 0 && (
              <div className="space-y-2">
                <Label className="text-slate-300">Cidade</Label>
                <Select
                  value={filtros.cidade}
                  onValueChange={(v) => setFiltros(prev => ({ ...prev, cidade: v }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {/* CNH e Veículo */}
            <div className="space-y-3 pt-2">
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
            </div>
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
                        {ANOS_EXPERIENCIA_OPTIONS.find(a => a.value === candidato.anos_experiencia)?.label || candidato.anos_experiencia}
                      </div>
                      <div className="flex items-center text-slate-400">
                        <GraduationCap className="w-4 h-4 mr-2 text-slate-500" />
                        {candidato.escolaridade}
                      </div>
                      <div className="flex items-center text-slate-400">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" />
                        {getDisponibilidadeLabel(candidato.disponibilidade_inicio)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                      <div className="flex items-center space-x-2">
                        {candidato.possui_cnh && (
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
        candidato={candidatoSelecionado}
        isOpen={modalAberto}
        onClose={fecharModal}
        empresa={empresa}
        isFavorito={candidatoSelecionado ? favoritos.includes(candidatoSelecionado.id) : false}
        onToggleFavorito={toggleFavorito}
      />
    </div>
  );
}
