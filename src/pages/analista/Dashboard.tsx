import { useState, useEffect } from 'react';
import { useAuthAnalista, UsuarioAnalista } from '@/context/AuthAnalistaContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  CheckCircle2,
  Users,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidato {
  id: string;
  nome_completo: string;
  email: string;
  created_at: string;
  perfil_disc: string | null;
}

export default function AnalistaDashboard() {
  const { usuario, atualizarUsuario } = useAuthAnalista();
  const analista = usuario as UsuarioAnalista;
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCandidatos, setTotalCandidatos] = useState(0);

  // Modal de solicitação de licenças
  const [solicitarDialogOpen, setSolicitarDialogOpen] = useState(false);
  const [solicitacaoQuantidade, setSolicitacaoQuantidade] = useState('');
  const [solicitacaoMensagem, setSolicitacaoMensagem] = useState('');
  const [isSolicitando, setIsSolicitando] = useState(false);

  const licencasDisponiveis = (analista?.licencas_total || 0) - (analista?.licencas_usadas || 0);
  const licencasUsadas = analista?.licencas_usadas || 0;
  const linkAvaliacao = `${window.location.origin}/teste/${analista?.link_unico}`;

  // Buscar candidatos do analista
  useEffect(() => {
    const fetchCandidatos = async () => {
      if (!analista?.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('candidatos_disc')
          .select('id, nome_completo, email, created_at, perfil_disc')
          .eq('analista_id', analista.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar candidatos:', error);
        } else {
          setCandidatos(data || []);
          setTotalCandidatos(data?.length || 0);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidatos();
  }, [analista?.id]);

  // Atualizar dados do analista do banco
  useEffect(() => {
    const fetchAnalistaAtualizado = async () => {
      if (!analista?.id) return;

      const { data, error } = await supabase
        .from('analistas')
        .select('licencas_total, licencas_usadas')
        .eq('id', analista.id)
        .single();

      if (!error && data) {
        atualizarUsuario({
          licencas_total: data.licencas_total,
          licencas_usadas: data.licencas_usadas,
        });
      }
    };

    fetchAnalistaAtualizado();
  }, [analista?.id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkAvaliacao);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const copyReportLink = async (candidatoId: string) => {
    const reportLink = `${window.location.origin}/relatorio/${candidatoId}`;
    try {
      await navigator.clipboard.writeText(reportLink);
      toast({
        title: 'Link do relatório copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const handleSolicitarLicencas = async () => {
    const quantidade = parseInt(solicitacaoQuantidade);
    if (!quantidade || quantidade <= 0) {
      toast({
        title: 'Quantidade inválida',
        description: 'Informe uma quantidade válida de licenças.',
        variant: 'destructive',
      });
      return;
    }

    setIsSolicitando(true);
    try {
      const { error } = await supabase.from('solicitacoes_licencas').insert({
        analista_id: analista.id,
        quantidade,
        mensagem: solicitacaoMensagem || null,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Solicitação enviada!',
        description: 'Sua solicitação foi enviada ao gestor.',
      });

      setSolicitarDialogOpen(false);
      setSolicitacaoQuantidade('');
      setSolicitacaoMensagem('');
    } catch (error) {
      console.error('Erro ao solicitar:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setIsSolicitando(false);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Licenças Disponíveis */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[#003DA5]/10">
                <CreditCard className="w-6 h-6 text-[#003DA5]" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-[#003DA5]">{licencasDisponiveis}</p>
                <p className="text-sm font-medium text-gray-700">Licenças Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Licenças Utilizadas */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-green-600">{licencasUsadas}</p>
                <p className="text-sm font-medium text-gray-700">Licenças Utilizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Candidatos */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-purple-600">{totalCandidatos}</p>
                <p className="text-sm font-medium text-gray-700">Total de Candidatos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solicitar Licenças */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[#E31E24]/10">
                <Plus className="w-6 h-6 text-[#E31E24]" />
              </div>
              <div className="flex-1">
                <Button
                  onClick={() => setSolicitarDialogOpen(true)}
                  className="w-full bg-[#E31E24] hover:bg-[#c91920] text-white"
                >
                  Solicitar mais licenças
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de licenças baixas */}
      {licencasDisponiveis <= 5 && licencasDisponiveis > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-700 text-sm">
              <strong>Atenção:</strong> Você tem apenas {licencasDisponiveis} licença(s) disponível(is).
              Considere solicitar mais licenças.
            </p>
          </CardContent>
        </Card>
      )}

      {licencasDisponiveis === 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">
              <strong>Sem licenças:</strong> Você não possui licenças disponíveis.
              Solicite mais licenças para continuar realizando avaliações.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Seção Meu Link de Testes */}
      <Card className="bg-gradient-to-r from-[#003DA5] to-[#002a73] border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Meu Link de Testes
          </CardTitle>
          <CardDescription className="text-white/80">
            Compartilhe este link com seus candidatos:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 p-3 bg-white/10 rounded-lg border border-white/20">
              <input
                type="text"
                readOnly
                value={linkAvaliacao}
                className="flex-1 bg-transparent text-white text-sm outline-none min-w-0"
              />
            </div>
            <Button
              onClick={copyLink}
              className="bg-white text-[#003DA5] hover:bg-white/90 font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-white/70 mt-3 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Cada candidato que completar o teste por este link consumirá 1 licença
          </p>
        </CardContent>
      </Card>

      {/* Seção Meus Candidatos */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#003DA5]" />
            Meus Candidatos
          </CardTitle>
          <CardDescription>
            Lista de candidatos que realizaram o teste através do seu link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : candidatos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum candidato ainda</p>
              <p className="text-gray-400 text-sm mt-1">
                Compartilhe seu link para receber candidatos
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600">Nome</TableHead>
                    <TableHead className="text-gray-600">Email</TableHead>
                    <TableHead className="text-gray-600">Data do Teste</TableHead>
                    <TableHead className="text-gray-600">Perfil DISC</TableHead>
                    <TableHead className="text-gray-600 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidatos.map((candidato) => (
                    <TableRow key={candidato.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {candidato.nome_completo}
                      </TableCell>
                      <TableCell className="text-gray-600">{candidato.email}</TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(candidato.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPerfilColor(
                            candidato.perfil_disc
                          )}`}
                        >
                          {candidato.perfil_disc || 'N/A'}
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
                            Ver Relatório
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-[#003DA5]"
                            onClick={() => copyReportLink(candidato.id)}
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

      {/* Modal Solicitar Licenças */}
      <Dialog open={solicitarDialogOpen} onOpenChange={setSolicitarDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Solicitar mais licenças</DialogTitle>
            <DialogDescription>
              Envie uma solicitação ao gestor para obter mais licenças de avaliação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade" className="text-gray-700">
                Quantidade desejada *
              </Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                placeholder="Ex: 10"
                value={solicitacaoQuantidade}
                onChange={(e) => setSolicitacaoQuantidade(e.target.value)}
                className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem" className="text-gray-700">
                Mensagem (opcional)
              </Label>
              <Textarea
                id="mensagem"
                placeholder="Adicione uma mensagem para o gestor..."
                value={solicitacaoMensagem}
                onChange={(e) => setSolicitacaoMensagem(e.target.value)}
                className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5] min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSolicitarDialogOpen(false)}
              className="border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSolicitarLicencas}
              disabled={isSolicitando || !solicitacaoQuantidade}
              className="bg-[#003DA5] hover:bg-[#002a73] text-white"
            >
              {isSolicitando ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
