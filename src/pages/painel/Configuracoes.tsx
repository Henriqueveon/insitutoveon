import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Lock, Loader2, Save } from 'lucide-react';

export default function PainelConfiguracoes() {
  const { gestor, empresa, user } = useAuth();
  const { toast } = useToast();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile form
  const [nome, setNome] = useState(gestor?.nome || '');
  const [cargo, setCargo] = useState(gestor?.cargo || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gestor) return;

    setIsUpdatingProfile(true);

    try {
      const { error } = await supabase
        .from('gestores')
        .update({ nome, cargo })
        .eq('id', gestor.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi alterada com sucesso.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie suas informações e preferências</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#00D9FF]" />
            Perfil
          </CardTitle>
          <CardDescription className="text-slate-400">
            Suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-slate-900/50 border-slate-600 text-slate-400"
              />
              <p className="text-xs text-slate-500">O e-mail não pode ser alterado</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">
                Nome Completo
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-slate-300">
                Cargo
              </Label>
              <Input
                id="cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Gerente de RH"
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdatingProfile}
              className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC]"
            >
              {isUpdatingProfile ? (
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
          </form>
        </CardContent>
      </Card>

      {/* Company Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00D9FF]" />
            Empresa
          </CardTitle>
          <CardDescription className="text-slate-400">
            Informações da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{empresa?.nome || 'Não definido'}</p>
                <p className="text-sm text-slate-400">
                  {empresa?.cnpj || 'CNPJ não cadastrado'}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Para alterar as informações da empresa, entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#00D9FF]" />
            Alterar Senha
          </CardTitle>
          <CardDescription className="text-slate-400">
            Atualize sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-300">
                Nova Senha
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC]"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-slate-800/50 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
          <CardDescription className="text-slate-400">
            Ações irreversíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div>
              <p className="font-medium text-white">Excluir Conta</p>
              <p className="text-sm text-slate-400">
                Esta ação removerá permanentemente sua conta
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => {
                toast({
                  title: 'Contate o suporte',
                  description:
                    'Para excluir sua conta, entre em contato com suporte@institutoveon.com.br',
                });
              }}
            >
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
