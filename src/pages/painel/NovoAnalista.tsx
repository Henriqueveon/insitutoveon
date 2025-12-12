import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, UserPlus, Loader2, Eye, EyeOff, Copy, Check, RefreshCw, CheckCircle2 } from 'lucide-react';

const tiposAnalista = [
  { value: 'coach', label: 'Coach' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'rh', label: 'RH' },
  { value: 'escola', label: 'Escola' },
  { value: 'outro', label: 'Outro' },
];

interface AnalistaCriado {
  id: string;
  nome: string;
  email: string;
  senha: string;
  link_unico: string;
}

// Função para gerar senha aleatória
const gerarSenhaAleatoria = (tamanho: number = 10): string => {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return senha;
};

export default function NovoAnalista() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [analistaCriado, setAnalistaCriado] = useState<AnalistaCriado | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: gerarSenhaAleatoria(),
    telefone: '',
    empresa: '',
    tipo: 'coach',
    licencas_total: '10',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    const licencas = parseInt(formData.licencas_total, 10);
    if (isNaN(licencas) || licencas < 0) {
      newErrors.licencas_total = 'Quantidade inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Criar hash da senha usando a função do banco
      const { data: hashData, error: hashError } = await supabase.rpc('criar_hash_senha', {
        p_senha: formData.senha,
      });

      if (hashError) {
        console.error('Erro ao criar hash:', hashError);
        throw new Error('Erro ao processar senha');
      }

      // Inserir analista com senha hasheada
      const { data, error } = await supabase.from('analistas').insert({
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: hashData,
        telefone: formData.telefone.trim() || null,
        empresa: formData.empresa.trim() || null,
        tipo: formData.tipo,
        licencas_total: parseInt(formData.licencas_total, 10),
        licencas_usadas: 0,
        ativo: true,
      }).select().single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email já está cadastrado');
        }
        throw error;
      }

      // Salvar dados para exibição (incluindo senha original)
      setAnalistaCriado({
        id: data.id,
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha, // Senha original, não o hash
        link_unico: data.link_unico,
      });

      toast({
        title: 'Analista cadastrado!',
        description: 'Copie os dados de acesso e envie para o analista.',
      });
    } catch (error: any) {
      console.error('Erro ao cadastrar analista:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Não foi possível cadastrar o analista.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const gerarNovaSenha = () => {
    const novaSenha = gerarSenhaAleatoria();
    setFormData((prev) => ({ ...prev, senha: novaSenha }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: 'Copiado!',
        description: 'Texto copiado para a área de transferência.',
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o texto.',
        variant: 'destructive',
      });
    }
  };

  const copyAllCredentials = async () => {
    if (!analistaCriado) return;

    const linkAvaliacao = `${window.location.origin}/avaliacao/${analistaCriado.link_unico}`;
    const texto = `Dados de Acesso - Instituto VEON

Nome: ${analistaCriado.nome}
Email: ${analistaCriado.email}
Senha: ${analistaCriado.senha}

Link de Login: ${window.location.origin}/login

Link de Avaliação (para seus clientes):
${linkAvaliacao}`;

    await copyToClipboard(texto, 'all');
  };

  // Tela de sucesso após criação
  if (analistaCriado) {
    const linkAvaliacao = `${window.location.origin}/avaliacao/${analistaCriado.link_unico}`;

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Analista Cadastrado!</h1>
          <p className="text-slate-400 mt-2">
            Copie os dados de acesso abaixo e envie para o analista
          </p>
        </div>

        {/* Card de credenciais */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Dados de Acesso</CardTitle>
            <CardDescription className="text-slate-400">
              Envie essas informações para {analistaCriado.nome}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label className="text-slate-400">Nome</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={analistaCriado.nome}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-slate-400">Email</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={analistaCriado.email}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(analistaCriado.email, 'email')}
                  className="border-slate-600 text-slate-400 hover:text-white"
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label className="text-slate-400">Senha (temporária)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={analistaCriado.senha}
                  className="bg-slate-900/50 border-slate-600 text-white font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(analistaCriado.senha, 'senha')}
                  className="border-slate-600 text-slate-400 hover:text-white"
                >
                  {copiedField === 'senha' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Link de Login */}
            <div className="space-y-2">
              <Label className="text-slate-400">Link de Login</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/login`}
                  className="bg-slate-900/50 border-slate-600 text-white text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(`${window.location.origin}/login`, 'login')}
                  className="border-slate-600 text-slate-400 hover:text-white"
                >
                  {copiedField === 'login' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Link de Avaliação */}
            <div className="space-y-2">
              <Label className="text-slate-400">Link de Avaliação (para os clientes do analista)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={linkAvaliacao}
                  className="bg-slate-900/50 border-slate-600 text-white text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(linkAvaliacao, 'avaliacao')}
                  className="border-slate-600 text-slate-400 hover:text-white"
                >
                  {copiedField === 'avaliacao' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Botão copiar tudo */}
            <Button
              onClick={copyAllCredentials}
              className="w-full bg-gradient-to-r from-[#00D9FF] to-[#0099CC] hover:from-[#00C4E6] hover:to-[#0088B3]"
            >
              {copiedField === 'all' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Todos os Dados
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-400">
            <strong>Importante:</strong> Esta é a única vez que a senha será exibida.
            Certifique-se de copiar e enviar para o analista antes de sair desta página.
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setAnalistaCriado(null);
              setFormData({
                nome: '',
                email: '',
                senha: gerarSenhaAleatoria(),
                telefone: '',
                empresa: '',
                tipo: 'coach',
                licencas_total: '10',
              });
            }}
            className="flex-1 border-slate-600 text-slate-300"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastrar Outro
          </Button>
          <Button
            onClick={() => navigate('/painel/analistas')}
            className="flex-1"
          >
            Ver Lista de Analistas
          </Button>
        </div>
      </div>
    );
  }

  // Formulário de cadastro
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/painel/analistas')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Analista</h1>
          <p className="text-slate-400 mt-1">
            Cadastre um novo analista no sistema
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00D9FF]" />
            Dados do Analista
          </CardTitle>
          <CardDescription className="text-slate-400">
            Preencha os dados para criar uma nova conta de analista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">
                Nome completo *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome do analista"
                className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${
                  errors.nome ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              {errors.nome && <p className="text-xs text-red-400">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-slate-300">
                Senha *
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => handleChange('senha', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10 font-mono ${
                      errors.senha ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={gerarNovaSenha}
                  className="border-slate-600 text-slate-300 hover:text-white"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar
                </Button>
              </div>
              {errors.senha && <p className="text-xs text-red-400">{errors.senha}</p>}
              <p className="text-xs text-slate-500">Clique em "Gerar" para criar uma senha aleatória</p>
            </div>

            {/* Telefone e Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-slate-300">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-slate-300">
                  Empresa/Consultoria
                </Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  placeholder="Nome da empresa"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Tipo e Licenças */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-slate-300">
                  Tipo de analista *
                </Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => handleChange('tipo', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {tiposAnalista.map((tipo) => (
                      <SelectItem
                        key={tipo.value}
                        value={tipo.value}
                        className="text-slate-300 hover:text-white hover:bg-slate-700"
                      >
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licencas" className="text-slate-300">
                  Licenças iniciais *
                </Label>
                <Input
                  id="licencas"
                  type="number"
                  min="0"
                  value={formData.licencas_total}
                  onChange={(e) => handleChange('licencas_total', e.target.value)}
                  className={`bg-slate-900/50 border-slate-600 text-white ${
                    errors.licencas_total ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                {errors.licencas_total && (
                  <p className="text-xs text-red-400">{errors.licencas_total}</p>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="text-sm text-slate-400">
                Após o cadastro, você verá os dados de acesso na tela para copiar e enviar
                ao analista. O link único de avaliação será gerado automaticamente.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/painel/analistas')}
                className="border-slate-600 text-slate-300"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC] hover:from-[#00C4E6] hover:to-[#0088B3]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar Analista
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
