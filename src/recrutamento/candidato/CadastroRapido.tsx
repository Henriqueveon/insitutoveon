// =====================================================
// CADASTRO RÁPIDO CANDIDATO - Apenas 3 campos
// Nome, Telefone, Email para entrada rápida
// =====================================================

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Phone,
  Mail,
  ArrowRight,
  Loader2,
  Shield,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';

// Máscara para telefone
const aplicarMascaraTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export default function CadastroRapido() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [form, setForm] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
  });
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validarFormulario = () => {
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

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      // Verificar se já existe cadastro com este email ou telefone
      const { data: existente } = await supabase
        .from('candidatos_recrutamento')
        .select('id, email, telefone')
        .or(`email.eq.${form.email},telefone.eq.${form.telefone.replace(/\D/g, '')}`)
        .maybeSingle();

      if (existente) {
        // Já existe, fazer login direto
        localStorage.setItem('veon_candidato_id', existente.id);
        toast({
          title: 'Bem-vindo de volta!',
          description: 'Encontramos seu cadastro. Redirecionando...',
        });
        navigate('/recrutamento/candidato/inicio');
        return;
      }

      // Criar novo candidato com cadastro incompleto
      const { data: novoCandidato, error } = await supabase
        .from('candidatos_recrutamento')
        .insert({
          nome_completo: form.nome_completo.trim(),
          telefone: form.telefone.replace(/\D/g, ''),
          email: form.email.toLowerCase().trim(),
          status: 'pendente', // Status pendente até completar cadastro
          cadastro_completo: false,
          aceite_termos: true,
          aceite_termos_data: new Date().toISOString(),
          aceite_lgpd: true,
          aceite_lgpd_data: new Date().toISOString(),
          codigo_indicacao: ref || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este e-mail ou telefone já está cadastrado.');
        }
        throw error;
      }

      // Processar indicação se houver
      if (ref && novoCandidato) {
        await supabase.rpc('processar_indicacao', {
          p_codigo: ref,
          p_indicado_tipo: 'candidato',
          p_indicado_id: novoCandidato.id,
        });
      }

      // Salvar ID no localStorage para manter sessão
      localStorage.setItem('veon_candidato_id', novoCandidato.id);

      toast({
        title: 'Cadastro criado!',
        description: 'Agora complete seu perfil para aparecer para empresas.',
      });

      // Ir direto para o painel do candidato
      navigate('/recrutamento/candidato/inicio');
    } catch (error) {
      console.error('Erro ao criar cadastro:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Cadastre-se em segundos
          </h1>
          <p className="text-slate-400">
            Crie sua conta e comece a receber propostas de emprego
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

            {/* Botão */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg disabled:opacity-50"
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
            <span>Leva menos de 30 segundos</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Shield className="w-3 h-3" />
            <span>Seus dados estão protegidos pela LGPD</span>
          </div>
        </div>

        {/* Link para cadastro completo */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Quer fazer o cadastro completo agora?{' '}
          <button
            onClick={() => navigate(`/recrutamento/candidato/cadastro${ref ? `?ref=${ref}` : ''}`)}
            className="text-[#E31E24] hover:underline"
          >
            Clique aqui
          </button>
        </p>
      </div>
    </div>
  );
}
