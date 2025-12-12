import { useState } from 'react';
import { useAuthAnalista, UsuarioAnalista } from '@/context/AuthAnalistaContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Building2, Lock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnalistaConfiguracoes() {
  const { usuario, atualizarUsuario } = useAuthAnalista();
  const analista = usuario as UsuarioAnalista;
  const { toast } = useToast();

  // Dados do perfil
  const [nome, setNome] = useState(analista?.nome || '');
  const [telefone, setTelefone] = useState(analista?.telefone || '');
  const [empresa, setEmpresa] = useState(analista?.empresa || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Alteração de senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!nome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'O nome não pode estar vazio.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('analistas')
        .update({
          nome: nome.trim(),
          telefone: telefone.trim() || null,
          empresa: empresa.trim() || null,
        })
        .eq('id', analista.id);

      if (error) throw error;

      atualizarUsuario({
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        empresa: empresa.trim() || null,
      });

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos de senha.',
        variant: 'destructive',
      });
      return;
    }

    if (novaSenha.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: 'Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data, error } = await supabase.rpc('alterar_senha', {
        p_tipo: 'analista',
        p_id: analista.id,
        p_senha_atual: senhaAtual,
        p_nova_senha: novaSenha,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Erro ao alterar senha');
      }

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi alterada com sucesso.',
      });

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie seu perfil e senha</p>
      </div>

      {/* Informações do Perfil */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#003DA5]" />
            Informações do Perfil
          </CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome completo *
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              value={analista?.email || ''}
              disabled
              className="bg-gray-50 border-gray-200 text-gray-500"
            />
            <p className="text-xs text-gray-400">O email não pode ser alterado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone
            </Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa" className="text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </Label>
            <Input
              id="empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Nome da sua empresa"
              className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5]"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="bg-[#003DA5] hover:bg-[#002a73] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </CardContent>
      </Card>

      {/* Alteração de Senha */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#003DA5]" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Mantenha sua conta segura alterando sua senha periodicamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senhaAtual" className="text-gray-700">
              Senha atual *
            </Label>
            <Input
              id="senhaAtual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="novaSenha" className="text-gray-700">
              Nova senha *
            </Label>
            <Input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
              className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5]"
            />
            <p className="text-xs text-gray-400">Mínimo de 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="text-gray-700">
              Confirmar nova senha *
            </Label>
            <Input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
              className="border-gray-300 focus:border-[#003DA5] focus:ring-[#003DA5]"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            variant="outline"
            className="border-[#003DA5] text-[#003DA5] hover:bg-[#003DA5] hover:text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isChangingPassword ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-700 text-sm">Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Tipo de conta:</strong>{' '}
            <span className="capitalize">{analista?.tipo || 'Analista'}</span>
          </p>
          <p>
            <strong>Licenças totais:</strong> {analista?.licencas_total || 0}
          </p>
          <p>
            <strong>Licenças utilizadas:</strong> {analista?.licencas_usadas || 0}
          </p>
          <p>
            <strong>Link único:</strong> {analista?.link_unico || '-'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
