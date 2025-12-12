import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Link2,
  Copy,
  Trash2,
  Edit,
  Users,
  Calendar,
  Eye,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LinkAvaliacao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  cargo_vaga: string | null;
  limite_candidatos: number | null;
  data_expiracao: string | null;
  ativo: boolean;
  total_acessos: number;
  total_completados: number;
  created_at: string;
}

interface LinkForm {
  nome: string;
  codigo: string;
  descricao: string;
  cargo_vaga: string;
  limite_candidatos: string;
  data_expiracao: string;
  ativo: boolean;
}

const initialForm: LinkForm = {
  nome: '',
  codigo: '',
  descricao: '',
  cargo_vaga: '',
  limite_candidatos: '',
  data_expiracao: '',
  ativo: true,
};

export default function PainelLinks() {
  const { empresa, gestor } = useAuth();
  const { toast } = useToast();

  const [links, setLinks] = useState<LinkAvaliacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkAvaliacao | null>(null);
  const [form, setForm] = useState<LinkForm>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const fetchLinks = async () => {
    if (!empresa) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('links_avaliacao')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks((data as LinkAvaliacao[]) || []);
    } catch (error) {
      console.error('Erro ao buscar links:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os links.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [empresa]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNomeChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      nome: value,
      codigo: prev.codigo || generateSlug(value),
    }));
  };

  const openCreateDialog = () => {
    setSelectedLink(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: LinkAvaliacao) => {
    setSelectedLink(link);
    setForm({
      nome: link.nome,
      codigo: link.codigo,
      descricao: link.descricao || '',
      cargo_vaga: link.cargo_vaga || '',
      limite_candidatos: link.limite_candidatos?.toString() || '',
      data_expiracao: link.data_expiracao
        ? format(new Date(link.data_expiracao), 'yyyy-MM-dd')
        : '',
      ativo: link.ativo,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (link: LinkAvaliacao) => {
    setSelectedLink(link);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome || !form.codigo) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e o código do link.',
        variant: 'destructive',
      });
      return;
    }

    if (!empresa || !gestor) return;

    setIsSaving(true);

    try {
      const linkData = {
        nome: form.nome,
        codigo: form.codigo,
        descricao: form.descricao || null,
        cargo_vaga: form.cargo_vaga || null,
        limite_candidatos: form.limite_candidatos ? parseInt(form.limite_candidatos) : null,
        data_expiracao: form.data_expiracao ? new Date(form.data_expiracao).toISOString() : null,
        ativo: form.ativo,
        empresa_id: empresa.id,
        gestor_id: gestor.id,
      };

      if (selectedLink) {
        // Atualizar
        const { error } = await supabase
          .from('links_avaliacao')
          .update(linkData)
          .eq('id', selectedLink.id);

        if (error) throw error;

        toast({
          title: 'Link atualizado',
          description: 'O link foi atualizado com sucesso.',
        });
      } else {
        // Criar
        const { error } = await supabase.from('links_avaliacao').insert(linkData);

        if (error) {
          if (error.code === '23505') {
            toast({
              title: 'Código já existe',
              description: 'Já existe um link com este código. Escolha outro.',
              variant: 'destructive',
            });
            return;
          }
          throw error;
        }

        toast({
          title: 'Link criado',
          description: 'O link foi criado com sucesso.',
        });
      }

      setIsDialogOpen(false);
      fetchLinks();
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o link.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLink) return;

    try {
      const { error } = await supabase
        .from('links_avaliacao')
        .delete()
        .eq('id', selectedLink.id);

      if (error) throw error;

      toast({
        title: 'Link excluído',
        description: 'O link foi excluído com sucesso.',
      });

      setIsDeleteDialogOpen(false);
      fetchLinks();
    } catch (error) {
      console.error('Erro ao excluir link:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o link.',
        variant: 'destructive',
      });
    }
  };

  const copyLink = (codigo: string) => {
    const url = `${baseUrl}/avaliacao/${codigo}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copiado!',
      description: 'O link foi copiado para a área de transferência.',
    });
  };

  const toggleActive = async (link: LinkAvaliacao) => {
    try {
      const { error } = await supabase
        .from('links_avaliacao')
        .update({ ativo: !link.ativo })
        .eq('id', link.id);

      if (error) throw error;

      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, ativo: !l.ativo } : l))
      );

      toast({
        title: link.ativo ? 'Link desativado' : 'Link ativado',
        description: `O link foi ${link.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Links de Avaliação</h1>
          <p className="text-slate-400 mt-1">
            Crie e gerencie links personalizados para suas avaliações DISC
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC] hover:from-[#00C4E6] hover:to-[#0088B3]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedLink ? 'Editar Link' : 'Novo Link de Avaliação'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedLink
                  ? 'Atualize as informações do link'
                  : 'Crie um link personalizado para compartilhar a avaliação'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-300">
                  Nome do Link *
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex: Processo Seletivo Vendas 2024"
                  value={form.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-slate-300">
                  Código do Link *
                </Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-slate-700 border border-slate-600 rounded-l-md text-slate-400 text-sm">
                    /avaliacao/
                  </span>
                  <Input
                    id="codigo"
                    placeholder="processo-vendas-2024"
                    value={form.codigo}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, codigo: generateSlug(e.target.value) }))
                    }
                    className="bg-slate-900/50 border-slate-600 text-white rounded-l-none flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo_vaga" className="text-slate-300">
                  Cargo da Vaga
                </Label>
                <Input
                  id="cargo_vaga"
                  placeholder="Ex: Vendedor"
                  value={form.cargo_vaga}
                  onChange={(e) => setForm((prev) => ({ ...prev, cargo_vaga: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-slate-300">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Descrição opcional do link..."
                  value={form.descricao}
                  onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-white resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limite" className="text-slate-300">
                    Limite de Candidatos
                  </Label>
                  <Input
                    id="limite"
                    type="number"
                    placeholder="Ilimitado"
                    value={form.limite_candidatos}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, limite_candidatos: e.target.value }))
                    }
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiracao" className="text-slate-300">
                    Data de Expiração
                  </Label>
                  <Input
                    id="expiracao"
                    type="date"
                    value={form.data_expiracao}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, data_expiracao: e.target.value }))
                    }
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-white">Link Ativo</p>
                  <p className="text-xs text-slate-400">Desative para impedir novos acessos</p>
                </div>
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, ativo: checked }))}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : selectedLink ? (
                    'Atualizar'
                  ) : (
                    'Criar Link'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Links Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-slate-700" />
                <Skeleton className="h-4 w-1/2 bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Link2 className="w-16 h-16 text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-white">Nenhum link criado</h3>
            <p className="text-slate-400 text-center max-w-sm mt-2">
              Crie seu primeiro link de avaliação para começar a receber candidatos.
            </p>
            <Button
              onClick={openCreateDialog}
              className="mt-6 bg-gradient-to-r from-[#00D9FF] to-[#0099CC]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <Card
              key={link.id}
              className={`bg-slate-800/50 border-slate-700 ${
                !link.ativo ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <CardTitle className="text-lg text-white truncate">{link.nome}</CardTitle>
                    <CardDescription className="text-slate-400 text-xs truncate">
                      /avaliacao/{link.codigo}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      link.ativo
                        ? 'border-green-500/50 text-green-400 bg-green-500/10'
                        : 'border-slate-500/50 text-slate-400 bg-slate-500/10'
                    }
                  >
                    {link.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {link.cargo_vaga && (
                  <p className="text-sm text-slate-300">
                    Vaga: <span className="font-medium">{link.cargo_vaga}</span>
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-lg font-bold text-white">{link.total_acessos}</p>
                      <p className="text-xs text-slate-400">Acessos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-lg font-bold text-white">{link.total_completados}</p>
                      <p className="text-xs text-slate-400">Completos</p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-xs text-slate-400">
                  {link.limite_candidatos && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Limite: {link.limite_candidatos} candidatos</span>
                    </div>
                  )}
                  {link.data_expiracao && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Expira em:{' '}
                        {format(new Date(link.data_expiracao), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(link.codigo)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <a
                      href={`${baseUrl}/avaliacao/${link.codigo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(link)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(link)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Link</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir o link "{selectedLink?.nome}"? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
