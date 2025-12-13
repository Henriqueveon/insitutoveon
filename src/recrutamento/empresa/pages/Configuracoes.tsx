// =====================================================
// CONFIGURAÇÕES EMPRESA - Área de Recrutamento VEON
// Configurações da conta da empresa
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  Camera,
  Trash2,
  LogOut,
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  socio_nome: string;
  socio_email: string;
  socio_telefone: string;
  socio_foto_url: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  descricao: string | null;
  creditos: number;
}

export default function Configuracoes() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { empresa, recarregarEmpresa } = useOutletContext<{
    empresa: Empresa | null;
    recarregarEmpresa: () => void;
  }>();

  const [form, setForm] = useState({
    nome_fantasia: '',
    socio_nome: '',
    socio_telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    descricao: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [dialogExcluir, setDialogExcluir] = useState(false);

  useEffect(() => {
    if (empresa) {
      setForm({
        nome_fantasia: empresa.nome_fantasia || '',
        socio_nome: empresa.socio_nome || '',
        socio_telefone: empresa.socio_telefone || '',
        endereco: empresa.endereco || '',
        cidade: empresa.cidade || '',
        estado: empresa.estado || '',
        descricao: empresa.descricao || '',
      });
    }
  }, [empresa]);

  const salvarAlteracoes = async () => {
    if (!empresa) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('empresas_recrutamento')
        .update(form)
        .eq('id', empresa.id);

      if (error) throw error;

      toast({
        title: 'Alterações salvas!',
        description: 'Suas configurações foram atualizadas.',
      });

      recarregarEmpresa();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/recrutamento/empresa/login');
  };

  const excluirConta = async () => {
    // Em produção, isso deveria enviar um email para o suporte
    toast({
      title: 'Solicitação enviada',
      description: 'Nossa equipe entrará em contato em até 48h para confirmar a exclusão.',
    });
    setDialogExcluir(false);
  };

  if (!empresa) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400">Gerencie as informações da sua empresa</p>
      </div>

      {/* Dados da Empresa */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Razão Social</Label>
              <Input
                value={empresa.razao_social}
                disabled
                className="bg-slate-700/50 border-slate-600 text-slate-400"
              />
              <p className="text-xs text-slate-500">Não pode ser alterado</p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">CNPJ</Label>
              <Input
                value={empresa.cnpj}
                disabled
                className="bg-slate-700/50 border-slate-600 text-slate-400"
              />
              <p className="text-xs text-slate-500">Não pode ser alterado</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Nome Fantasia</Label>
            <Input
              value={form.nome_fantasia}
              onChange={(e) => setForm(prev => ({ ...prev, nome_fantasia: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Descrição da Empresa</Label>
            <Textarea
              placeholder="Conte um pouco sobre sua empresa..."
              value={form.descricao}
              onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
              className="bg-slate-700 border-slate-600 text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Endereço</Label>
              <Input
                value={form.endereco}
                onChange={(e) => setForm(prev => ({ ...prev, endereco: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Cidade</Label>
              <Input
                value={form.cidade}
                onChange={(e) => setForm(prev => ({ ...prev, cidade: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Estado</Label>
              <Input
                value={form.estado}
                onChange={(e) => setForm(prev => ({ ...prev, estado: e.target.value }))}
                maxLength={2}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Responsável */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Dados do Responsável
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={empresa.socio_foto_url || undefined} />
              <AvatarFallback className="bg-slate-600 text-white text-xl">
                {empresa.socio_nome?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium">{empresa.socio_nome}</p>
              <p className="text-sm text-slate-400">{empresa.socio_email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome Completo</Label>
              <Input
                value={form.socio_nome}
                onChange={(e) => setForm(prev => ({ ...prev, socio_nome: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Telefone</Label>
              <Input
                value={form.socio_telefone}
                onChange={(e) => setForm(prev => ({ ...prev, socio_telefone: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <Input
              value={empresa.socio_email}
              disabled
              className="bg-slate-700/50 border-slate-600 text-slate-400"
            />
            <p className="text-xs text-slate-500">
              Para alterar o email, entre em contato com o suporte
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={salvarAlteracoes}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      {/* Ações da Conta */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Ações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div>
              <p className="text-white font-medium">Sair da conta</p>
              <p className="text-sm text-slate-400">
                Você será redirecionado para a página de login
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-slate-600 text-slate-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div>
              <p className="text-red-400 font-medium">Excluir conta</p>
              <p className="text-sm text-red-400/70">
                Esta ação é irreversível. Todos os dados serão removidos.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setDialogExcluir(true)}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={dialogExcluir} onOpenChange={setDialogExcluir}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Tem certeza que deseja excluir sua conta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. Todos os seus dados, vagas,
              propostas e histórico de contratações serão permanentemente removidos.
              Os créditos não utilizados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirConta}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
