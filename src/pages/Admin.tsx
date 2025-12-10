import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, RefreshCw, Users, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidato {
  id: string;
  nome_completo: string;
  telefone_whatsapp: string;
  cargo_atual: string;
  empresa_instagram: string;
  created_at: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [filteredCandidatos, setFilteredCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCargo, setFilterCargo] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  const fetchCandidatos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidatos_disc')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCandidatos(data || []);
      setFilteredCandidatos(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os candidatos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatos();
  }, []);

  useEffect(() => {
    let filtered = candidatos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nome_completo.toLowerCase().includes(term) ||
          c.telefone_whatsapp.includes(term)
      );
    }

    if (filterCargo) {
      filtered = filtered.filter((c) =>
        c.cargo_atual.toLowerCase().includes(filterCargo.toLowerCase())
      );
    }

    if (filterEmpresa) {
      filtered = filtered.filter((c) =>
        c.empresa_instagram.toLowerCase().includes(filterEmpresa.toLowerCase())
      );
    }

    setFilteredCandidatos(filtered);
  }, [searchTerm, filterCargo, filterEmpresa, candidatos]);

  const exportToCSV = () => {
    const headers = ['Nome Completo', 'Telefone/WhatsApp', 'Cargo', 'Empresa Instagram', 'Data de Cadastro'];
    const rows = filteredCandidatos.map((c) => [
      c.nome_completo,
      c.telefone_whatsapp,
      c.cargo_atual,
      c.empresa_instagram,
      format(new Date(c.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidatos_disc_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Exportação concluída',
      description: `${filteredCandidatos.length} registros exportados.`,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCargo('');
    setFilterEmpresa('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <h1 className="text-lg font-semibold text-foreground">Painel Administrativo</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Candidatos</p>
                  <p className="text-2xl font-bold">{candidatos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Filter className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filtrados</p>
                  <p className="text-2xl font-bold">{filteredCandidatos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Calendar className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último Cadastro</p>
                  <p className="text-lg font-semibold">
                    {candidatos.length > 0
                      ? format(new Date(candidatos[0].created_at), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Filtros e Ações</CardTitle>
            <CardDescription>Busque, filtre e exporte os dados dos candidatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Filtrar por cargo"
                value={filterCargo}
                onChange={(e) => setFilterCargo(e.target.value)}
              />
              <Input
                placeholder="Filtrar por empresa"
                value={filterEmpresa}
                onChange={(e) => setFilterEmpresa(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Limpar
                </Button>
                <Button variant="outline" onClick={fetchCandidatos} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <Button onClick={exportToCSV} className="gradient-veon" disabled={filteredCandidatos.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV ({filteredCandidatos.length} registros)
            </Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead>Telefone/WhatsApp</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">Carregando...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredCandidatos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
                        <p className="mt-2 text-muted-foreground">Nenhum candidato encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCandidatos.map((candidato) => (
                      <TableRow key={candidato.id}>
                        <TableCell className="font-medium">{candidato.nome_completo}</TableCell>
                        <TableCell>{candidato.telefone_whatsapp}</TableCell>
                        <TableCell>{candidato.cargo_atual}</TableCell>
                        <TableCell className="text-primary">{candidato.empresa_instagram}</TableCell>
                        <TableCell>
                          {format(new Date(candidato.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
