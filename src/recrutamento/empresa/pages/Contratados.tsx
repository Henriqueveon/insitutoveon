// =====================================================
// CONTRATADOS - Estilo Rede Social Mobile-First
// Feed de contratações + Exportação CSV
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  CheckCircle,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Phone,
  Mail,
  Download,
  Users,
  TrendingUp,
  Award,
  X,
  UserCheck,
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
}

interface Contratacao {
  id: string;
  salario_oferecido: number;
  created_at: string;
  updated_at: string;
  candidato: {
    id: string;
    nome_completo: string;
    foto_url: string | null;
    cidade: string;
    estado: string;
    telefone: string;
    email: string;
    perfil_disc: string | null;
  };
  vaga: {
    id: string;
    titulo: string;
  };
}

// Cores DISC
const DISC_COLORS: Record<string, { bg: string; text: string }> = {
  D: { bg: 'bg-red-500', text: 'text-red-400' },
  I: { bg: 'bg-yellow-500', text: 'text-yellow-400' },
  S: { bg: 'bg-green-500', text: 'text-green-400' },
  C: { bg: 'bg-blue-500', text: 'text-blue-400' },
};

export default function Contratados() {
  const { toast } = useToast();
  const { empresa } = useOutletContext<{ empresa: Empresa | null }>();

  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAno, setFiltroAno] = useState<string>('todos');

  useEffect(() => {
    if (empresa?.id) {
      carregarContratacoes();
    }
  }, [empresa?.id]);

  const carregarContratacoes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('propostas_recrutamento')
        .select(`
          id,
          salario_oferecido,
          created_at,
          updated_at,
          candidato:candidatos_recrutamento (
            id, nome_completo, foto_url, cidade, estado, telefone, email, perfil_disc
          ),
          vaga:vagas_recrutamento (id, titulo)
        `)
        .eq('empresa_id', empresa?.id)
        .eq('status', 'contratado')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setContratacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar contratações:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as contratações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatarDataCompleta = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Anos disponíveis para filtro
  const anosDisponiveis = [...new Set(
    contratacoes.map(c => new Date(c.updated_at).getFullYear())
  )].sort((a, b) => b - a);

  // Filtrar contratações
  const contratacoesFiltradas = contratacoes.filter(c => {
    const matchBusca = busca === '' ||
      c.candidato.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      c.vaga.titulo.toLowerCase().includes(busca.toLowerCase());

    const matchAno = filtroAno === 'todos' ||
      new Date(c.updated_at).getFullYear().toString() === filtroAno;

    return matchBusca && matchAno;
  });

  // Estatísticas
  const stats = {
    total: contratacoes.length,
    esteMes: contratacoes.filter(c => {
      const data = new Date(c.updated_at);
      const hoje = new Date();
      return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    }).length,
    investimentoTotal: contratacoes.reduce((acc, c) => acc + (Number(c.salario_oferecido) || 0), 0),
  };

  const exportarCSV = () => {
    const escapeCSV = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Nome', 'Vaga', 'Salário', 'Data Contratação', 'Cidade', 'Estado', 'Telefone', 'Email'];
    const rows = contratacoesFiltradas.map(c => [
      escapeCSV(c.candidato?.nome_completo),
      escapeCSV(c.vaga?.titulo),
      escapeCSV(formatarMoeda(c.salario_oferecido)),
      escapeCSV(formatarDataCompleta(c.updated_at)),
      escapeCSV(c.candidato?.cidade),
      escapeCSV(c.candidato?.estado),
      escapeCSV(c.candidato?.telefone),
      escapeCSV(c.candidato?.email),
    ]);

    const BOM = '\uFEFF';
    const csv = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contratados_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportado!',
      description: 'O arquivo CSV foi baixado.',
    });
  };

  return (
    <div className="max-w-lg mx-auto -mx-4 sm:mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Contratados</h1>
            <p className="text-sm text-zinc-500">Histórico de contratações</p>
          </div>
          {contratacoes.length > 0 && (
            <Button
              variant="outline"
              onClick={exportarCSV}
              className="h-9 border-zinc-700 text-white hover:bg-zinc-800 rounded-xl"
            >
              <Download className="w-4 h-4 mr-1.5" />
              CSV
            </Button>
          )}
        </div>

        {/* Stats compactos */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-900 p-3 rounded-xl text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-zinc-500">Total</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-xl text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-white">{stats.esteMes}</p>
            <p className="text-[10px] text-zinc-500">Este mês</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-xl text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-sm font-bold text-white truncate">
              {formatarMoeda(stats.investimentoTotal / 12)}
            </p>
            <p className="text-[10px] text-zinc-500">Folha/mês</p>
          </div>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="px-4 py-3 border-b border-zinc-800 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou vaga..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 h-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl text-sm"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {anosDisponiveis.length > 1 && (
          <Select value={filtroAno} onValueChange={setFiltroAno}>
            <SelectTrigger className="h-9 bg-zinc-900 border-zinc-800 text-white rounded-xl text-sm">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="todos">Todos os anos</SelectItem>
              {anosDisponiveis.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Lista de Contratações */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
        </div>
      ) : contratacoesFiltradas.length > 0 ? (
        <div className="px-4 py-4 space-y-3">
          {contratacoesFiltradas.map((contratacao) => {
            const discColor = contratacao.candidato.perfil_disc ? DISC_COLORS[contratacao.candidato.perfil_disc] : null;

            return (
              <div
                key={contratacao.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Header do Card */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-emerald-500/30">
                        <AvatarImage src={contratacao.candidato.foto_url || undefined} />
                        <AvatarFallback className="bg-zinc-700 text-white font-bold">
                          {contratacao.candidato.nome_completo.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {contratacao.candidato.perfil_disc && discColor && (
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${discColor.bg} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-zinc-900`}>
                          {contratacao.candidato.perfil_disc}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {contratacao.candidato.nome_completo}
                        </h3>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Contratado
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        {contratacao.candidato.cidade}, {contratacao.candidato.estado}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-sm">
                        {formatarMoeda(contratacao.salario_oferecido)}
                      </p>
                      <p className="text-zinc-500 text-[10px]">salário</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[11px]">
                      <Briefcase className="w-3 h-3" />
                      {contratacao.vaga.titulo}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {formatarData(contratacao.updated_at)}
                    </span>
                  </div>

                  {/* Contato */}
                  <div className="p-3 bg-zinc-800/50 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-2">Contato</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href={`tel:${contratacao.candidato.telefone}`} className="text-white flex items-center hover:text-emerald-400 transition-colors">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                        {contratacao.candidato.telefone}
                      </a>
                      <a href={`mailto:${contratacao.candidato.email}`} className="text-white flex items-center hover:text-emerald-400 transition-colors truncate">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                        {contratacao.candidato.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
            <Users className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            {busca || filtroAno !== 'todos'
              ? 'Nenhuma contratação encontrada'
              : 'Você ainda não realizou contratações'}
          </h3>
          <p className="text-zinc-400 text-sm">
            {busca || filtroAno !== 'todos'
              ? 'Tente ajustar os filtros'
              : 'Quando você contratar profissionais, eles aparecerão aqui'}
          </p>
        </div>
      )}
    </div>
  );
}
