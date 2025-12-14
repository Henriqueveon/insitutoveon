// =====================================================
// COMPLETAR CADASTRO EMPRESA - Dados obrigatórios
// Nome, Função, CPF do responsável
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  User,
  Briefcase,
  CreditCard,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cadastro_completo: boolean;
  socio_nome: string | null;
  socio_cpf: string | null;
  socio_funcao: string | null;
  socio_email: string;
}

const FUNCOES_RESPONSAVEL = [
  { value: 'socio_proprietario', label: 'Sócio/Proprietário' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'rh_recrutador', label: 'RH/Recrutador' },
  { value: 'outro', label: 'Outro' },
];

// Máscara CPF
const aplicarMascaraCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

// Validação de CPF
const validarCPF = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

  return true;
};

export default function CompletarCadastro() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const context = useOutletContext<{ empresa: Empresa | null; recarregarEmpresa: () => void }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const [form, setForm] = useState({
    socio_nome: '',
    socio_funcao: '',
    socio_cpf: '',
    senha: '',
    confirmar_senha: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarEmpresa();
  }, [context?.empresa?.id]);

  const carregarEmpresa = async () => {
    setIsLoading(true);
    try {
      // Tentar usar o contexto primeiro
      if (context?.empresa) {
        setEmpresa(context.empresa as Empresa);
        setForm({
          socio_nome: context.empresa.socio_nome || '',
          socio_funcao: (context.empresa as any).socio_funcao || '',
          socio_cpf: (context.empresa as any).socio_cpf
            ? aplicarMascaraCPF((context.empresa as any).socio_cpf)
            : '',
          senha: '',
          confirmar_senha: '',
        });
        setIsLoading(false);
        return;
      }

      // Ou buscar pelo localStorage
      const empresaId = localStorage.getItem('veon_empresa_id');
      if (!empresaId) {
        navigate('/recrutamento/empresa/login');
        return;
      }

      const { data, error } = await supabase
        .from('empresas_recrutamento')
        .select('id, razao_social, nome_fantasia, socio_nome, socio_cpf, socio_funcao, socio_email')
        .eq('id', empresaId)
        .single();

      if (error || !data) {
        navigate('/recrutamento/empresa/login');
        return;
      }

      setEmpresa(data as unknown as Empresa);
      setForm({
        socio_nome: (data as any).socio_nome || '',
        socio_funcao: (data as any).socio_funcao || '',
        socio_cpf: (data as any).socio_cpf ? aplicarMascaraCPF((data as any).socio_cpf) : '',
        senha: '',
        confirmar_senha: '',
      });
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (form.socio_nome.trim().length < 3) {
      novosErros.socio_nome = 'Digite o nome completo';
    }

    if (!form.socio_funcao) {
      novosErros.socio_funcao = 'Selecione a função';
    }

    if (!validarCPF(form.socio_cpf)) {
      novosErros.socio_cpf = 'CPF inválido';
    }

    if (form.senha.length < 6) {
      novosErros.senha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (form.senha !== form.confirmar_senha) {
      novosErros.confirmar_senha = 'As senhas não coincidem';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarFormulario() || !empresa) return;

    setIsSaving(true);
    try {
      // 1. Criar usuário no Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email: empresa.socio_email,
        password: form.senha,
        options: {
          data: { tipo: 'empresa' },
        },
      });

      if (signUpError) {
        // Se o erro for que o usuário já existe, tentar fazer login
        if (signUpError.message.includes('User already registered')) {
          // Usuário já existe, tentar atualizar a senha
          console.log('Usuário já existe no Auth, continuando...');
        } else {
          throw signUpError;
        }
      }

      // 2. Fazer login para estabelecer sessão
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: empresa.socio_email,
        password: form.senha,
      });

      if (loginError && !loginError.message.includes('Email not confirmed')) {
        console.warn('Aviso no login:', loginError.message);
      }

      // 3. Atualizar dados da empresa
      const { error } = await supabase
        .from('empresas_recrutamento')
        .update({
          socio_nome: form.socio_nome.trim(),
          socio_funcao: form.socio_funcao,
          socio_cpf: form.socio_cpf.replace(/\D/g, ''),
          senha_hash: 'AUTH_SUPABASE', // Indica que usa Supabase Auth
          cadastro_completo: true,
        })
        .eq('id', empresa.id);

      if (error) throw error;

      toast({
        title: 'Cadastro completo!',
        description: 'Agora você pode visualizar todos os profissionais.',
      });

      // Recarregar dados se tiver contexto
      if (context?.recarregarEmpresa) {
        context.recarregarEmpresa();
      }

      // Redirecionar para dashboard
      navigate('/recrutamento/empresa/dashboard');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Não foi possível completar o cadastro.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Se cadastro já completo, redirecionar
  if (empresa?.cadastro_completo) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Cadastro já completo!
            </h2>
            <p className="text-slate-400 mb-6">
              Você já completou seu cadastro e pode acessar todos os profissionais.
            </p>
            <Button
              onClick={() => navigate('/recrutamento/empresa/buscar-candidatos')}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Buscar Profissionais
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Complete seu cadastro
        </h1>
        <p className="text-slate-400">
          Preencha os dados abaixo para acessar os perfis dos profissionais
        </p>
      </div>

      {/* Card Empresa */}
      <Card className="bg-slate-800/60 border-slate-700 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-blue-400" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-white font-medium">{empresa?.razao_social}</p>
            {empresa?.nome_fantasia && (
              <p className="text-slate-400 text-sm">{empresa.nome_fantasia}</p>
            )}
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Dados da empresa confirmados via CNPJ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-blue-400" />
            Dados do Responsável
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label className="text-slate-300">Nome completo *</Label>
            <Input
              placeholder="João da Silva"
              value={form.socio_nome}
              onChange={(e) => setForm(prev => ({ ...prev, socio_nome: e.target.value }))}
              className={`bg-slate-900/50 border-slate-600 text-white ${errors.socio_nome ? 'border-red-500' : ''}`}
            />
            {errors.socio_nome && (
              <p className="text-red-400 text-xs">{errors.socio_nome}</p>
            )}
          </div>

          {/* Função */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Função na empresa *
            </Label>
            <Select
              value={form.socio_funcao}
              onValueChange={(v) => setForm(prev => ({ ...prev, socio_funcao: v }))}
            >
              <SelectTrigger className={`bg-slate-900/50 border-slate-600 text-white ${errors.socio_funcao ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecione sua função" />
              </SelectTrigger>
              <SelectContent>
                {FUNCOES_RESPONSAVEL.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.socio_funcao && (
              <p className="text-red-400 text-xs">{errors.socio_funcao}</p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              CPF *
            </Label>
            <Input
              placeholder="000.000.000-00"
              value={form.socio_cpf}
              onChange={(e) => setForm(prev => ({ ...prev, socio_cpf: aplicarMascaraCPF(e.target.value) }))}
              className={`bg-slate-900/50 border-slate-600 text-white ${
                errors.socio_cpf
                  ? 'border-red-500'
                  : form.socio_cpf.length === 14 && validarCPF(form.socio_cpf)
                  ? 'border-green-500'
                  : ''
              }`}
              maxLength={14}
            />
            {errors.socio_cpf && (
              <p className="text-red-400 text-xs">{errors.socio_cpf}</p>
            )}
            {form.socio_cpf.length === 14 && validarCPF(form.socio_cpf) && (
              <p className="text-green-400 text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                CPF válido
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Criar senha de acesso *
            </Label>
            <div className="relative">
              <Input
                type={showSenha ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={(e) => setForm(prev => ({ ...prev, senha: e.target.value }))}
                className={`bg-slate-900/50 border-slate-600 text-white pr-10 ${errors.senha ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.senha && (
              <p className="text-red-400 text-xs">{errors.senha}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar senha *
            </Label>
            <div className="relative">
              <Input
                type={showConfirmarSenha ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                value={form.confirmar_senha}
                onChange={(e) => setForm(prev => ({ ...prev, confirmar_senha: e.target.value }))}
                className={`bg-slate-900/50 border-slate-600 text-white pr-10 ${errors.confirmar_senha ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmar_senha && (
              <p className="text-red-400 text-xs">{errors.confirmar_senha}</p>
            )}
            {form.confirmar_senha && form.senha === form.confirmar_senha && form.senha.length >= 6 && (
              <p className="text-green-400 text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Senhas coincidem
              </p>
            )}
          </div>

          {/* Botão Salvar */}
          <Button
            onClick={handleSalvar}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Completar Cadastro
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dica */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Dica</p>
            <p className="text-slate-400 text-sm">
              Após completar o cadastro, recomendamos preencher a aba "Sobre Minha Empresa"
              para atrair os melhores profissionais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
