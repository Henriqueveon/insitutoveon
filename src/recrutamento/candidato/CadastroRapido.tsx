// =====================================================
// CADASTRO RÁPIDO CANDIDATO - 2 Etapas
// Etapa 1: Nome, Telefone, Email
// Etapa 2: Criar Senha
// Usa Supabase Auth para autenticação segura
// =====================================================

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { obterMensagemErro } from '../utils/traduzirErro';

// Máscara para telefone
const aplicarMascaraTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

// Validação de senha
const validarSenha = (senha: string) => {
  const temMinimo = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const forca = [temMinimo, temMaiuscula, temNumero].filter(Boolean).length;
  return { temMinimo, temMaiuscula, temNumero, forca, valido: forca === 3 };
};

export default function CadastroRapido() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  // Etapa atual (1 ou 2)
  const [etapa, setEtapa] = useState(1);

  // Dados do formulário
  const [form, setForm] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação Etapa 1
  const validarEtapa1 = () => {
    const novosErros: Record<string, string> = {};

    if (form.nome_completo.trim().length < 3) {
      novosErros.nome_completo = 'Digite seu nome completo';
    }

    if (form.telefone.replace(/\D/g, '').length < 10) {
      novosErros.telefone = 'Digite um telefone válido';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      novosErros.email = 'Digite um e-mail válido';
    }

    if (!aceiteTermos) {
      novosErros.termos = 'Você precisa aceitar os termos';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Validação Etapa 2
  const validarEtapa2 = () => {
    const novosErros: Record<string, string> = {};
    const validacao = validarSenha(form.senha);

    if (!validacao.valido) {
      novosErros.senha = 'A senha não atende aos requisitos';
    }

    if (form.senha !== form.confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não conferem';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Avançar para etapa 2
  const avancarEtapa = async () => {
    if (!validarEtapa1()) return;

    setIsLoading(true);

    try {
      const emailLower = form.email.toLowerCase().trim();
      const telefoneNumeros = form.telefone.replace(/\D/g, '');

      // Verificar se já existe cadastro com este email
      const { data: existenteEmail } = await supabase
        .from('candidatos_recrutamento')
        .select('id, email')
        .eq('email', emailLower)
        .maybeSingle();

      if (existenteEmail) {
        toast({
          title: 'E-mail já cadastrado',
          description: 'Você já possui um cadastro. Faça login para continuar.',
          variant: 'default',
        });
        navigate('/recrutamento/candidato/login', {
          state: { email: existenteEmail.email }
        });
        return;
      }

      // Verificar se já existe cadastro com este telefone
      const { data: existenteTelefone } = await supabase
        .from('candidatos_recrutamento')
        .select('id, email, telefone')
        .eq('telefone', telefoneNumeros)
        .maybeSingle();

      if (existenteTelefone) {
        toast({
          title: 'Telefone já cadastrado',
          description: 'Este telefone já está em uso. Faça login ou use outro número.',
          variant: 'default',
        });
        navigate('/recrutamento/candidato/login', {
          state: { email: existenteTelefone.email }
        });
        return;
      }

      // Tudo ok, avançar para etapa 2
      setEtapa(2);
    } catch (error) {
      console.error('Erro ao verificar cadastro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Finalizar cadastro
  const finalizarCadastro = async () => {
    if (!validarEtapa2()) return;

    setIsLoading(true);

    const emailLower = form.email.toLowerCase().trim();
    const telefoneNumeros = form.telefone.replace(/\D/g, '');

    try {
      // 1. Criar usuário no Supabase Auth
      console.log('Criando usuário Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailLower,
        password: form.senha,
        options: {
          data: {
            nome: form.nome_completo,
            tipo: 'candidato',
          },
          emailRedirectTo: `${window.location.origin}/recrutamento/candidato/login`,
        },
      });

      if (authError) {
        console.error('Erro Auth:', authError);
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          toast({
            title: 'E-mail já cadastrado',
            description: 'Este e-mail já está em uso. Faça login ou recupere sua senha.',
            variant: 'destructive',
          });
          navigate('/recrutamento/candidato/login', {
            state: { email: form.email }
          });
          return;
        }
        throw new Error(authError.message || 'Erro ao criar conta. Tente novamente.');
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário. Tente novamente.');
      }

      console.log('Usuário Auth criado:', authData.user.id);

      // 2. Criar candidato na tabela usando RPC (bypassa RLS)
      console.log('Criando candidato na tabela via RPC...');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('cadastrar_candidato_rapido', {
        p_nome_completo: form.nome_completo.trim(),
        p_telefone: telefoneNumeros,
        p_email: emailLower,
        p_auth_user_id: authData.user.id,
        p_codigo_indicacao: ref || null,
      });

      console.log('Resultado RPC:', rpcResult);

      if (rpcError) {
        console.error('Erro RPC:', rpcError);
        throw new Error(`Erro ao criar perfil: ${rpcError.message}`);
      }

      // Verificar se a RPC retornou erro
      const resultado = rpcResult as { success: boolean; error?: string; candidato_id?: string };
      if (!resultado.success) {
        console.error('Erro retornado pela RPC:', resultado.error);
        throw new Error(resultado.error || 'Erro ao criar perfil');
      }

      console.log('Candidato criado:', resultado.candidato_id);
      const novoCandidatoId = resultado.candidato_id;

      // 3. Verificar se precisa confirmar email
      // Se a sessão foi criada, significa que não precisa confirmar
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        // Precisa confirmar email
        toast({
          title: 'Cadastro criado!',
          description: 'Verifique seu e-mail para confirmar a conta e fazer login.',
        });
        navigate('/recrutamento/candidato/login', {
          state: { email: emailLower, mensagem: 'Verifique seu e-mail para confirmar a conta.' }
        });
        return;
      }

      // 4. Processar indicação se houver
      if (ref && novoCandidatoId) {
        try {
          await (supabase.rpc as any)('processar_indicacao', {
            p_codigo: ref,
            p_indicado_tipo: 'candidato',
            p_indicado_id: novoCandidatoId,
          });
        } catch (e) {
          console.log('Indicação não processada:', e);
        }
      }

      toast({
        title: 'Bem-vindo ao Recruta Veon!',
        description: 'Seu cadastro foi criado. Complete seu perfil para aparecer para empresas.',
      });

      // 5. Ir para o painel do candidato
      navigate('/recrutamento/candidato/inicio');

    } catch (error) {
      console.error('Erro ao criar cadastro:', error);
      toast({
        title: 'Não foi possível criar sua conta',
        description: obterMensagemErro(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const beneficiosRapidos = [
    'Empresas te encontram e enviam propostas',
    'Descubra seus talentos naturais com teste DISC',
    'Currículo profissional gerado automaticamente',
  ];

  const validacaoSenha = validarSenha(form.senha);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {etapa === 1 ? 'Cadastre-se em segundos' : 'Crie sua senha'}
          </h1>
          <p className="text-slate-400">
            {etapa === 1
              ? 'Crie sua conta e comece a receber propostas de emprego'
              : 'Escolha uma senha segura para proteger sua conta'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Etapa {etapa} de 2</span>
            <span>{etapa === 1 ? '50%' : '100%'}</span>
          </div>
          <Progress value={etapa === 1 ? 50 : 100} className="h-2 bg-slate-700" />
        </div>

        {/* Benefícios (só na etapa 1) */}
        {etapa === 1 && (
          <div className="mb-6 space-y-2">
            {beneficiosRapidos.map((beneficio, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>{beneficio}</span>
              </div>
            ))}
          </div>
        )}

        {/* Formulário */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            {/* ========== ETAPA 1: DADOS BÁSICOS ========== */}
            {etapa === 1 && (
              <>
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome completo
                  </label>
                  <Input
                    placeholder="Digite seu nome completo"
                    value={form.nome_completo}
                    onChange={(e) => setForm(prev => ({ ...prev, nome_completo: e.target.value }))}
                    className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.nome_completo ? 'border-red-500' : ''}`}
                    autoFocus
                  />
                  {errors.nome_completo && (
                    <p className="text-red-400 text-xs">{errors.nome_completo}</p>
                  )}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone/WhatsApp
                  </label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={form.telefone}
                    onChange={(e) => setForm(prev => ({ ...prev, telefone: aplicarMascaraTelefone(e.target.value) }))}
                    className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.telefone ? 'border-red-500' : ''}`}
                    maxLength={15}
                  />
                  {errors.telefone && (
                    <p className="text-red-400 text-xs">{errors.telefone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Aceite de termos */}
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="termos"
                    checked={aceiteTermos}
                    onCheckedChange={(checked) => setAceiteTermos(checked as boolean)}
                    className={`mt-0.5 border-slate-500 data-[state=checked]:bg-[#E31E24] data-[state=checked]:border-[#E31E24] ${errors.termos ? 'border-red-500' : ''}`}
                  />
                  <label htmlFor="termos" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                    Concordo com os <span className="text-slate-300 underline">termos de uso</span> e{' '}
                    <span className="text-slate-300 underline">política de privacidade</span> (LGPD)
                  </label>
                </div>
                {errors.termos && (
                  <p className="text-red-400 text-xs">{errors.termos}</p>
                )}

                {/* Botão Continuar */}
                <Button
                  onClick={avancarEtapa}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </>
            )}

            {/* ========== ETAPA 2: CRIAR SENHA ========== */}
            {etapa === 2 && (
              <>
                {/* Resumo dos dados */}
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 mb-4">
                  <p className="text-xs text-slate-500 mb-1">Seus dados:</p>
                  <p className="text-white text-sm font-medium">{form.nome_completo}</p>
                  <p className="text-slate-400 text-xs">{form.email}</p>
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showSenha ? 'text' : 'password'}
                      placeholder="Crie uma senha segura"
                      value={form.senha}
                      onChange={(e) => setForm(prev => ({ ...prev, senha: e.target.value }))}
                      className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10 ${errors.senha ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Indicadores de força */}
                  {form.senha && (
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              validacaoSenha.forca >= level
                                ? validacaoSenha.forca === 3
                                  ? 'bg-green-500'
                                  : validacaoSenha.forca === 2
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs space-y-1">
                        <p className={validacaoSenha.temMinimo ? 'text-green-400' : 'text-slate-500'}>
                          {validacaoSenha.temMinimo ? '✓' : '○'} Mínimo 8 caracteres
                        </p>
                        <p className={validacaoSenha.temMaiuscula ? 'text-green-400' : 'text-slate-500'}>
                          {validacaoSenha.temMaiuscula ? '✓' : '○'} Uma letra maiúscula
                        </p>
                        <p className={validacaoSenha.temNumero ? 'text-green-400' : 'text-slate-500'}>
                          {validacaoSenha.temNumero ? '✓' : '○'} Um número
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmarSenha ? 'text' : 'password'}
                      placeholder="Digite a senha novamente"
                      value={form.confirmarSenha}
                      onChange={(e) => setForm(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                      className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10 ${errors.confirmarSenha ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmarSenha && form.senha !== form.confirmarSenha && (
                    <p className="text-red-400 text-xs">As senhas não conferem</p>
                  )}
                  {form.confirmarSenha && form.senha === form.confirmarSenha && (
                    <p className="text-green-400 text-xs">✓ Senhas conferem</p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setEtapa(1)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={finalizarCadastro}
                    disabled={isLoading || !validacaoSenha.valido || form.senha !== form.confirmarSenha}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        Criar conta
                        <CheckCircle2 className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Clock className="w-3 h-3" />
            <span>Leva menos de 1 minuto</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Shield className="w-3 h-3" />
            <span>Seus dados estão protegidos pela LGPD</span>
          </div>
        </div>

        {/* Link para login */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem uma conta?{' '}
          <button
            onClick={() => navigate('/recrutamento/candidato/login')}
            className="text-[#E31E24] hover:underline"
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
}
