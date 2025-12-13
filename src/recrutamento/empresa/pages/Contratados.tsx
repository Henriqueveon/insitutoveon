// =====================================================
// CONTRATADOS - Área de Recrutamento VEON
// Histórico de contratações realizadas
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const getCorPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'bg-red-500';
      case 'I': return 'bg-yellow-500';
      case 'S': return 'bg-green-500';
      case 'C': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
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
    investimentoTotal: contratacoes.reduce((acc, c) => acc + c.salario_oferecido, 0),
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Vaga', 'Salário', 'Data Contratação', 'Cidade', 'Estado', 'Telefone', 'Email'];
    const rows = contratacoesFiltradas.map(c => [
      c.candidato.nome_completo,
      c.vaga.titulo,
      formatarMoeda(c.salario_oferecido),
      formatarData(c.updated_at),
      c.candidato.cidade,
      c.candidato.estado,
      c.candidato.telefone,
      c.candidato.email,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contratados</h1>
          <p className="text-slate-400">Histórico de contratações realizadas</p>
        </div>
        {contratacoes.length > 0 && (
          <Button
            variant="outline"
            onClick={exportarCSV}
            className="border-slate-600 text-slate-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Total de contratações</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.esteMes}</p>
              <p className="text-sm text-slate-400">Este mês</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {formatarMoeda(stats.investimentoTotal / 12)}
              </p>
              <p className="text-sm text-slate-400">Folha mensal média</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou vaga..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        {anosDisponiveis.length > 1 && (
          <Select value={filtroAno} onValueChange={setFiltroAno}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
        </div>
      ) : contratacoesFiltradas.length > 0 ? (
        <div className="space-y-4">
          {contratacoesFiltradas.map((contratacao) => (
            <Card key={contratacao.id} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info do candidato */}
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={contratacao.candidato.foto_url || undefined} />
                        <AvatarFallback className="bg-slate-600 text-white">
                          {contratacao.candidato.nome_completo.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {contratacao.candidato.perfil_disc && (
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getCorPerfil(contratacao.candidato.perfil_disc)} flex items-center justify-center text-xs font-bold text-white`}>
                          {contratacao.candidato.perfil_disc}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {contratacao.candidato.nome_completo}
                        </h3>
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Contratado
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-2">
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {contratacao.vaga.titulo}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {contratacao.candidato.cidade}, {contratacao.candidato.estado}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatarData(contratacao.updated_at)}
                        </span>
                      </div>

                      {/* Contato */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-slate-300 flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-slate-500" />
                          {contratacao.candidato.telefone}
                        </span>
                        <span className="text-slate-300 flex items-center">
                          <Mail className="w-4 h-4 mr-1 text-slate-500" />
                          {contratacao.candidato.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salário */}
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase">Salário</p>
                    <p className="text-xl font-bold text-green-400">
                      {formatarMoeda(contratacao.salario_oferecido)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {busca || filtroAno !== 'todos'
                ? 'Nenhuma contratação encontrada'
                : 'Você ainda não realizou contratações'}
            </h3>
            <p className="text-slate-400">
              {busca || filtroAno !== 'todos'
                ? 'Tente ajustar os filtros'
                : 'Quando você contratar candidatos, eles aparecerão aqui'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
