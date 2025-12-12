import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  Link2,
  Copy,
  Check,
  Plus,
  Minus,
  UserX,
  UserCheck,
  Calendar,
  Clock,
  ClipboardList,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Analista {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  tipo: string;
  licencas_total: number;
  licencas_usadas: number;
  link_unico: string;
  ativo: boolean;
  data_cadastro: string;
  ultimo_acesso: string | null;
}

interface Candidato {
  id: string;
  nome_completo: string;
  email: string | null;
  cargo_atual: string;
  created_at: string;
}

export default function AnalistaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [analista, setAnalista] = useState<Analista | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Dialog states
  const [licencasDialogOpen, setLicencasDialogOpen] = useState(false);
  const [licencasAction, setLicencasAction] = useState<'add' | 'remove'>('add');
  const [licencasQuantidade, setLicencasQuantidade] = useState('10');
  const [isUpdating, setIsUpdating] = useState(false);
  const [desativarDialogOpen, setDesativarDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnalista();
      fetchCandidatos();
    }
  }, [id]);

  const fetchAnalista = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analistas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnalista(data);
    } catch (error) {
      console.error('Erro ao buscar analista:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do analista.',
        variant: 'destructive',
      });
      navigate('/painel/analistas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCandidatos = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatos_disc')
        .select('id, nome_completo, email, cargo_atual, created_at')
        .eq('analista_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidatos(data || []);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, { label: string; color: string }> = {
      coach: { label: 'Coach', color: 'bg-blue-500/20 text-blue-400' },
      psicologo: { label: 'Psicólogo', color: 'bg-purple-500/20 text-purple-400' },
      empresa: { label: 'Empresa', color: 'bg-green-500/20 text-green-400' },
      rh: { label: 'RH', color: 'bg-orange-500/20 text-orange-400' },
      escola: { label: 'Escola', color: 'bg-cyan-500/20 text-cyan-400' },
      outro: { label: 'Outro', color: 'bg-slate-500/20 text-slate-400' },
    };
    return tipos[tipo] || tipos.outro;
  };

  const copyLink = async () => {
    if (!analista) return;
    const link = `${window.location.origin}/avaliacao/${analista.link_unico}`;
    try {
      await navigator.clipboard.writeText(link);
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

  const openLicencasDialog = (action: 'add' | 'remove') => {
    setLicencasAction(action);
    setLicencasQuantidade('10');
    setLicencasDialogOpen(true);
  };

  const handleUpdateLicencas = async () => {
    if (!analista) return;

    const quantidade = parseInt(licencasQuantidade, 10);
    if (isNaN(quantidade) || quantidade <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe uma quantidade válida.',
        variant: 'destructive',
      });
      return;
    }

    let novoTotal: number;
    if (licencasAction === 'add') {
      novoTotal = analista.licencas_total + quantidade;
    } else {
      novoTotal = analista.licencas_total - quantidade;
      if (novoTotal < analista.licencas_usadas) {
        toast({
          title: 'Não é possível remover',
          description: `O total não pode ser menor que ${analista.licencas_usadas} (licenças já usadas).`,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('analistas')
        .update({ licencas_total: novoTotal })
        .eq('id', analista.id);

      if (error) throw error;

      setAnalista({ ...analista, licencas_total: novoTotal });

      toast({
        title: 'Licenças atualizadas',
        description: `${analista.nome} agora tem ${novoTotal} licenças.`,
      });

      setLicencasDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar licenças:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as licenças.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAtivo = async () => {
    if (!analista) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('analistas')
        .update({ ativo: !analista.ativo })
        .eq('id', analista.id);

      if (error) throw error;

      setAnalista({ ...analista, ativo: !analista.ativo });

      toast({
        title: analista.ativo ? 'Analista desativado' : 'Analista ativado',
        description: `${analista.nome} foi ${analista.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });

      setDesativarDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-slate-700" />
            <Skeleton className="h-4 w-32 bg-slate-700" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 bg-slate-700 rounded-lg" />
          <Skeleton className="h-64 bg-slate-700 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!analista) {
    return null;
  }

  const tipo = getTipoLabel(analista.tipo);
  const licencasDisponiveis = analista.licencas_total - analista.licencas_usadas;
  const linkAvaliacao = `${window.location.origin}/avaliacao/${analista.link_unico}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/painel/analistas')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-white font-bold text-lg">
              {analista.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{analista.nome}</h1>
                {analista.ativo ? (
                  <Badge className="bg-green-500/20 text-green-400">Ativo</Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400">Inativo</Badge>
                )}
              </div>
              <p className="text-slate-400">{analista.email}</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setDesativarDialogOpen(true)}
          className={
            analista.ativo
              ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
              : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
          }
        >
          {analista.ativo ? (
            <>
              <UserX className="w-4 h-4 mr-2" />
              Desativar
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Ativar
            </>
          )}
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados Cadastrais */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#00D9FF]" />
              Dados Cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-white">{analista.email}</p>
              </div>
            </div>
            {analista.telefone && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Telefone</p>
                  <p className="text-white">{analista.telefone}</p>
                </div>
              </div>
            )}
            {analista.empresa && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Building className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Empresa</p>
                  <p className="text-white">{analista.empresa}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Tipo</p>
                <Badge className={tipo.color}>{tipo.label}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Cadastro</p>
                  <p className="text-white text-sm">
                    {format(new Date(analista.data_cadastro), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Último acesso</p>
                  <p className="text-white text-sm">
                    {analista.ultimo_acesso
                      ? formatDistanceToNow(new Date(analista.ultimo_acesso), { addSuffix: true, locale: ptBR })
                      : 'Nunca acessou'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Licenças */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-500" />
              Licenças
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barra de progresso */}
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Utilizadas</span>
                <span className="text-white font-bold">
                  {analista.licencas_usadas} / {analista.licencas_total}
                </span>
              </div>
              <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    licencasDisponiveis === 0
                      ? 'bg-red-500'
                      : licencasDisponiveis <= 5
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${(analista.licencas_usadas / analista.licencas_total) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-slate-500">{analista.licencas_usadas} usadas</span>
                <span
                  className={
                    licencasDisponiveis === 0
                      ? 'text-red-400'
                      : licencasDisponiveis <= 5
                      ? 'text-amber-400'
                      : 'text-green-400'
                  }
                >
                  {licencasDisponiveis} disponíveis
                </span>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => openLicencasDialog('add')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
              <Button
                onClick={() => openLicencasDialog('remove')}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                disabled={licencasDisponiveis === 0}
              >
                <Minus className="w-4 h-4 mr-2" />
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link de Avaliação */}
      <Card className="bg-gradient-to-r from-[#003366] to-[#002244] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Link de Avaliação
          </CardTitle>
          <CardDescription className="text-slate-300">
            Link único para os clientes deste analista realizarem a avaliação DISC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
            <input
              type="text"
              readOnly
              value={linkAvaliacao}
              className="flex-1 bg-transparent text-white text-sm outline-none"
            />
            <Button
              size="sm"
              className="bg-white text-[#003366] hover:bg-white/90"
              onClick={copyLink}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-500" />
            Candidatos deste Analista
          </CardTitle>
          <CardDescription className="text-slate-400">
            {candidatos.length} candidato(s) realizaram avaliação com este analista
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidatos.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="mt-4 text-slate-400">Nenhum candidato ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Candidato</TableHead>
                  <TableHead className="text-slate-400">Cargo</TableHead>
                  <TableHead className="text-slate-400">Data</TableHead>
                  <TableHead className="text-slate-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatos.map((candidato) => (
                  <TableRow key={candidato.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{candidato.nome_completo}</p>
                        {candidato.email && (
                          <p className="text-sm text-slate-400">{candidato.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{candidato.cargo_atual}</TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {format(new Date(candidato.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/relatorio/${candidato.id}`, '_blank')}
                        className="text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Relatório
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para gerenciar licenças */}
      <Dialog open={licencasDialogOpen} onOpenChange={setLicencasDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {licencasAction === 'add' ? 'Adicionar Licenças' : 'Remover Licenças'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {licencasAction === 'add'
                ? `Adicione mais licenças para ${analista.nome}`
                : `Remova licenças de ${analista.nome}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400">Licenças atuais</p>
                <p className="text-xl font-bold text-white">{analista.licencas_total}</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400">Licenças usadas</p>
                <p className="text-xl font-bold text-white">{analista.licencas_usadas}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="licencas" className="text-slate-300">
                Quantidade a {licencasAction === 'add' ? 'adicionar' : 'remover'}
              </Label>
              <Input
                id="licencas"
                type="number"
                min="1"
                value={licencasQuantidade}
                onChange={(e) => setLicencasQuantidade(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              {licencasAction === 'remove' && (
                <p className="text-xs text-slate-500">
                  Máximo: {licencasDisponiveis} (não pode ficar abaixo das usadas)
                </p>
              )}
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <p className="text-sm text-slate-400">
                Novo total:{' '}
                <span className="text-white font-bold">
                  {licencasAction === 'add'
                    ? analista.licencas_total + (parseInt(licencasQuantidade) || 0)
                    : analista.licencas_total - (parseInt(licencasQuantidade) || 0)}{' '}
                  licenças
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLicencasDialogOpen(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateLicencas}
              disabled={isUpdating}
              className={
                licencasAction === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : licencasAction === 'add' ? (
                'Adicionar'
              ) : (
                'Remover'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para desativar */}
      <AlertDialog open={desativarDialogOpen} onOpenChange={setDesativarDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {analista.ativo ? 'Desativar Analista?' : 'Ativar Analista?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {analista.ativo
                ? `${analista.nome} não poderá mais acessar o sistema e seu link de avaliação ficará inativo.`
                : `${analista.nome} poderá acessar o sistema novamente e seu link de avaliação será reativado.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleAtivo}
              className={analista.ativo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : analista.ativo ? (
                'Desativar'
              ) : (
                'Ativar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
