// =====================================================
// CADASTRO RÁPIDO EMPRESA - Apenas 3 campos
// CNPJ, Email, Telefone para entrada rápida
// =====================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Loader2,
  Shield,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  XCircle,
} from 'lucide-react';
import { buscarCNPJ, formatarCNPJ, validarCNPJ } from '../services/cnpjService';
import { CNPJResponse } from '../types/recrutamento.types';
import { obterMensagemErro } from '../utils/traduzirErro';

// Máscaras
const aplicarMascaraCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const aplicarMascaraTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

export default function CadastroRapido() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    cnpj: '',
    email: '',
    telefone: '',
  });
  const [dadosCNPJ, setDadosCNPJ] = useState<CNPJResponse | null>(null);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuscando, setIsBuscando] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBuscarCNPJ = async () => {
    const cnpjLimpo = form.cnpj.replace(/\D/g, '');

    if (!validarCNPJ(cnpjLimpo)) {
      setErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }));
      return;
    }

    setIsBuscando(true);
    setErrors(prev => ({ ...prev, cnpj: '' }));

    try {
      const dados = await buscarCNPJ(cnpjLimpo);

      if (!dados) {
        throw new Error('CNPJ não encontrado na Receita Federal');
      }

      if (dados.situacao_cadastral !== 'ATIVA') {
        setErrors(prev => ({ ...prev, cnpj: `CNPJ com situação "${dados.situacao_cadastral}"` }));
        setDadosCNPJ(null);
        return;
      }

      // Verificar se já existe no banco
      const { data: empresaExistente } = await supabase
        .from('empresas_recrutamento')
        .select('id')
        .eq('cnpj', dados.cnpj)
        .single();

      if (empresaExistente) {
        setErrors(prev => ({ ...prev, cnpj: 'Esta empresa já está cadastrada. Faça login.' }));
        setDadosCNPJ(null);
        return;
      }

      setDadosCNPJ(dados);
      toast({
        title: 'CNPJ encontrado!',
        description: dados.razao_social,
      });
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      setErrors(prev => ({
        ...prev,
        cnpj: error instanceof Error ? error.message : 'Erro ao buscar CNPJ',
      }));
      setDadosCNPJ(null);
    } finally {
      setIsBuscando(false);
    }
  };

  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!dadosCNPJ) {
      novosErros.cnpj = 'Busque um CNPJ válido';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      novosErros.email = 'Digite um e-mail válido';
    }

    if (form.telefone.replace(/\D/g, '').length < 10) {
      novosErros.telefone = 'Digite um telefone válido';
    }

    if (!aceiteTermos) {
      novosErros.termos = 'Você precisa aceitar os termos';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario() || !dadosCNPJ) return;

    setIsLoading(true);

    try {
      // Verificar se já existe cadastro com este email
      const { data: existente } = await supabase
        .from('empresas_recrutamento')
        .select('id, socio_email')
        .eq('socio_email', form.email.toLowerCase().trim())
        .maybeSingle();

      if (existente) {
        toast({
          title: 'E-mail já cadastrado',
          description: 'Este e-mail já está vinculado a outra empresa. Faça login.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Criar empresa com cadastro incompleto (via RPC para bypassar RLS)
      const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)('cadastrar_empresa_rapido', {
        p_cnpj: dadosCNPJ.cnpj,
        p_razao_social: dadosCNPJ.razao_social,
        p_nome_fantasia: dadosCNPJ.nome_fantasia || null,
        p_situacao_cadastral: dadosCNPJ.situacao_cadastral || null,
        p_data_abertura: dadosCNPJ.data_abertura || null,
        p_natureza_juridica: dadosCNPJ.natureza_juridica || null,
        p_porte: dadosCNPJ.porte || null,
        p_capital_social: dadosCNPJ.capital_social || null,
        p_logradouro: dadosCNPJ.logradouro || null,
        p_numero: dadosCNPJ.numero || null,
        p_complemento: dadosCNPJ.complemento || null,
        p_bairro: dadosCNPJ.bairro || null,
        p_cidade: dadosCNPJ.municipio || null,
        p_estado: dadosCNPJ.uf || null,
        p_cep: dadosCNPJ.cep || null,
        p_telefone_empresa: dadosCNPJ.telefone || null,
        p_email_empresa: dadosCNPJ.email || null,
        p_socio_email: form.email.toLowerCase().trim(),
        p_socio_telefone: form.telefone.replace(/\D/g, ''),
      });

      if (rpcError) {
        console.error('Erro RPC:', rpcError);
        throw new Error(rpcError.message);
      }

      const result = rpcResult as { success: boolean; empresa_id?: string; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Erro ao cadastrar empresa');
      }

      // Salvar ID no localStorage para manter sessão
      if (result.empresa_id) {
        localStorage.setItem('veon_empresa_id', result.empresa_id);
      }

      toast({
        title: 'Cadastro criado!',
        description: 'Agora complete seu perfil para acessar os profissionais.',
      });

      // Ir para completar cadastro
      navigate('/recrutamento/empresa/completar-cadastro');
    } catch (error) {
      console.error('Erro ao criar cadastro:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: obterMensagemErro(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const beneficiosRapidos = [
    'Acesso a milhares de profissionais qualificados',
    'Perfil DISC de cada candidato revelado',
    'Match inteligente para sua vaga',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Cadastre sua empresa
          </h1>
          <p className="text-slate-400">
            Encontre os melhores profissionais para sua equipe
          </p>
        </div>

        {/* Benefícios */}
        <div className="mb-6 space-y-2">
          {beneficiosRapidos.map((beneficio, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{beneficio}</span>
            </div>
          ))}
        </div>

        {/* Formulário */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            {/* CNPJ */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                CNPJ da empresa
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, cnpj: aplicarMascaraCNPJ(e.target.value) }));
                    setDadosCNPJ(null);
                    setErrors(prev => ({ ...prev, cnpj: '' }));
                  }}
                  className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.cnpj ? 'border-red-500' : dadosCNPJ ? 'border-green-500' : ''}`}
                  maxLength={18}
                />
                <Button
                  onClick={handleBuscarCNPJ}
                  disabled={isBuscando || form.cnpj.length < 18}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isBuscando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {errors.cnpj && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.cnpj}
                </p>
              )}
              {dadosCNPJ && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">CNPJ Encontrado</span>
                  </div>
                  <p className="text-white text-sm font-medium">{dadosCNPJ.razao_social}</p>
                  {dadosCNPJ.nome_fantasia && (
                    <p className="text-slate-400 text-xs">{dadosCNPJ.nome_fantasia}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1">
                    {dadosCNPJ.municipio}/{dadosCNPJ.uf}
                  </p>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail do responsável
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email}</p>
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

            {/* Aceite de termos */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="termos"
                checked={aceiteTermos}
                onCheckedChange={(checked) => setAceiteTermos(checked as boolean)}
                className={`mt-0.5 border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 ${errors.termos ? 'border-red-500' : ''}`}
              />
              <label htmlFor="termos" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                Concordo com os <span className="text-slate-300 underline">termos de uso</span> e{' '}
                <span className="text-slate-300 underline">política de privacidade</span> (LGPD)
              </label>
            </div>
            {errors.termos && (
              <p className="text-red-400 text-xs">{errors.termos}</p>
            )}

            {/* Botão */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !dadosCNPJ}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando sua conta...
                </>
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
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
            onClick={() => navigate('/recrutamento/empresa/login')}
            className="text-blue-400 hover:underline"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
}
