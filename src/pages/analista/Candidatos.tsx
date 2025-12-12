import { useState, useEffect } from 'react';
import { useAuthAnalista, UsuarioAnalista } from '@/context/AuthAnalistaContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Copy, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidato {
  id: string;
  nome_completo: string;
  email: string | null;
  cargo_atual: string | null;
  created_at: string;
  perfil_tipo: string | null;
}

export default function AnalistaCandidatos() {
  const { usuario } = useAuthAnalista();
  const analista = usuario as UsuarioAnalista;
  const { toast } = useToast();

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [filteredCandidatos, setFilteredCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('all');

  useEffect(() => {
    const fetchCandidatos = async () => {
      if (!analista?.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('candidatos_disc')
          .select('id, nome_completo, email, cargo_atual, created_at, perfil_tipo')
          .eq('analista_id', analista.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar candidatos:', error);
        } else {
          setCandidatos(data || []);
          setFilteredCandidatos(data || []);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidatos();
  }, [analista?.id]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...candidatos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nome_completo.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          (c.cargo_atual && c.cargo_atual.toLowerCase().includes(term))
      );
    }

    if (perfilFilter !== 'all') {
      filtered = filtered.filter((c) => {
        if (!c.perfil_tipo) return perfilFilter === 'none';
        return c.perfil_tipo.charAt(0).toUpperCase() === perfilFilter;
      });
    }

    setFilteredCandidatos(filtered);
  }, [searchTerm, perfilFilter, candidatos]);

  const copyReportLink = async (candidatoId: string) => {
    const reportLink = `${window.location.origin}/relatorio/${candidatoId}`;
    try {
      await navigator.clipboard.writeText(reportLink);
      toast({
        title: 'Link copiado!',
        description: 'O link do relatório foi copiado.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const getPerfilColor = (perfil: string | null) => {
    const cores: Record<string, string> = {
      D: 'bg-red-100 text-red-700 border-red-200',
      I: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      S: 'bg-green-100 text-green-700 border-green-200',
      C: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    if (!perfil) return 'bg-gray-100 text-gray-600 border-gray-200';
    return cores[perfil.charAt(0).toUpperCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getPerfilName = (perfil: string | null) => {
    const nomes: Record<string, string> = {
      D: 'Dominância',
      I: 'Influência',
      S: 'Estabilidade',
      C: 'Conformidade',
    };
    if (!perfil) return 'N/A';
    const letra = perfil.charAt(0).toUpperCase();
    return `${letra} - ${nomes[letra] || 'Desconhecido'}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Candidatos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie os candidatos que realizaram o teste através do seu link
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-[#003DA5]">{candidatos.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-red-600">
              {candidatos.filter((c) => c.perfil_tipo?.charAt(0) === 'D').length}
            </p>
            <p className="text-sm text-gray-600">Dominância</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-yellow-600">
              {candidatos.filter((c) => c.perfil_tipo?.charAt(0) === 'I').length}
            </p>
            <p className="text-sm text-gray-600">Influência</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-green-600">
              {candidatos.filter((c) => c.perfil_tipo?.charAt(0) === 'S').length}
            </p>
            <p className="text-sm text-gray-600">Estabilidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white border-gray-200">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger className="w-full sm:w-[180px] border-gray-300">
                <SelectValue placeholder="Filtrar por perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="D">Dominância (D)</SelectItem>
                <SelectItem value="I">Influência (I)</SelectItem>
                <SelectItem value="S">Estabilidade (S)</SelectItem>
                <SelectItem value="C">Conformidade (C)</SelectItem>
                <SelectItem value="none">Sem perfil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de candidatos */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#003DA5]" />
            Lista de Candidatos
          </CardTitle>
          <CardDescription>
            {filteredCandidatos.length} candidato(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCandidatos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {candidatos.length === 0
                  ? 'Nenhum candidato ainda'
                  : 'Nenhum candidato encontrado com os filtros aplicados'}
              </p>
              {candidatos.length === 0 && (
                <p className="text-gray-400 text-sm mt-1">
                  Compartilhe seu link para receber candidatos
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600">Nome</TableHead>
                    <TableHead className="text-gray-600">Email</TableHead>
                    <TableHead className="text-gray-600">Cargo</TableHead>
                    <TableHead className="text-gray-600">Data do Teste</TableHead>
                    <TableHead className="text-gray-600">Perfil DISC</TableHead>
                    <TableHead className="text-gray-600 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidatos.map((candidato) => (
                    <TableRow key={candidato.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {candidato.nome_completo}
                      </TableCell>
                      <TableCell className="text-gray-600">{candidato.email}</TableCell>
                      <TableCell className="text-gray-600">
                        {candidato.cargo_atual || '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(candidato.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPerfilColor(
                            candidato.perfil_tipo
                          )}`}
                        >
                          {candidato.perfil_tipo || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#003DA5] text-[#003DA5] hover:bg-[#003DA5] hover:text-white"
                            onClick={() =>
                              window.open(`/relatorio/${candidato.id}`, '_blank')
                            }
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Relatório
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-[#003DA5]"
                            onClick={() => copyReportLink(candidato.id)}
                            title="Copiar link do relatório"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
