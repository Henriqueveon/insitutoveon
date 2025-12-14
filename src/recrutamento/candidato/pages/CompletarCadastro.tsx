// =====================================================
// COMPLETAR CADASTRO - Página para finalizar perfil
// Campos adicionais após cadastro rápido inicial
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  GraduationCap,
  Car,
  Target,
  Loader2,
  Save,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

import {
  ESTADOS_BR,
  FAIXAS_SALARIAIS,
  FAIXAS_SALARIAIS_ATUAL,
  MOTIVOS_BUSCA,
  DISPONIBILIDADE_INICIO,
  REGIMES_TRABALHO,
  TEMPO_PERMANENCIA,
  MOTIVOS_SAIDA,
  AREAS_EXPERIENCIA,
  ESCOLARIDADES,
  VEICULOS,
  DISPONIBILIDADE_HORARIO,
  OPCOES_VIAGEM_MUDANCA,
  OPCOES_MUDANCA,
  ESTADOS_CIVIS,
  VALORES_EMPRESA,
  AREAS_INTERESSE,
  SUGESTOES_CARGOS,
  OPCOES_SEXO,
} from '../dadosFormulario';

import { validarCPF } from '../../services/cnpjService';
import CidadeAutocomplete from '@/components/recrutamento/CidadeAutocomplete';
import DataNascimentoInput from '@/components/recrutamento/DataNascimentoInput';
import ExperienciaSelector from '@/components/recrutamento/ExperienciaSelector';
import CNHSelector from '@/components/recrutamento/CNHSelector';

interface Candidato {
  id: string;
  nome_completo: string;
  telefone: string;
  email: string;
  [key: string]: any;
}

// Máscaras
const aplicarMascaraCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Seções do cadastro
const SECOES = [
  { id: 'pessoal', titulo: 'Dados Pessoais', icon: User },
  { id: 'profissional', titulo: 'Experiência', icon: Briefcase },
  { id: 'formacao', titulo: 'Formação', icon: GraduationCap },
  { id: 'logistica', titulo: 'Mobilidade', icon: Car },
  { id: 'expectativas', titulo: 'Expectativas', icon: Target },
  { id: 'conta', titulo: 'Senha', icon: Lock },
];

export default function CompletarCadastro() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidato: candidatoContext, recarregarCandidato } = useOutletContext<{
    candidato: Candidato | null;
    recarregarCandidato: () => void;
  }>();

  const [secaoAtual, setSecaoAtual] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [cargoSugestoes, setCargoSugestoes] = useState<string[]>([]);
  const [showCargoSugestoes, setShowCargoSugestoes] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [senhaErrors, setSenhaErrors] = useState<Record<string, string>>({});

  // Carregar dados existentes
  useEffect(() => {
    if (candidatoContext) {
      setForm({
        // Dados pessoais
        data_nascimento: candidatoContext.data_nascimento || '',
        cpf: candidatoContext.cpf ? aplicarMascaraCPF(candidatoContext.cpf) : '',
        estado: candidatoContext.estado || '',
        cidade: candidatoContext.cidade || '',
        bairro: candidatoContext.bairro || '',

        // Situação atual
        esta_trabalhando: candidatoContext.esta_trabalhando,
        salario_atual: candidatoContext.salario_atual || '',
        regime_atual: candidatoContext.regime_atual || '',
        motivos_busca: candidatoContext.motivo_busca_oportunidade?.split(', ') || [],
        disponibilidade_inicio: candidatoContext.disponibilidade_inicio || '',
        regime_preferido: candidatoContext.regime_preferido || '',

        // Experiência
        ultima_empresa: candidatoContext.ultima_empresa || '',
        ultimo_cargo: candidatoContext.ultimo_cargo || '',
        tempo_permanencia: candidatoContext.tempo_ultima_empresa || '',
        motivo_saida: candidatoContext.motivo_saida || '',
        areas_experiencia: candidatoContext.areas_experiencia || [],
        anos_experiencia: candidatoContext.anos_experiencia || 0,

        // Formação
        escolaridade: candidatoContext.escolaridade || '',
        curso: candidatoContext.curso || '',
        certificacoes: candidatoContext.certificacoes || '',

        // Logística
        veiculo: candidatoContext.possui_veiculo || '',
        cnh: candidatoContext.possui_cnh || [],
        cnh_em_processo: false,
        disponibilidade_horario: candidatoContext.disponibilidade_horario?.split(', ') || [],
        aceita_viajar: candidatoContext.aceita_viajar || '',
        aceita_mudanca: candidatoContext.aceita_mudanca || '',

        // Vida pessoal
        sexo: candidatoContext.sexo || '',
        estado_civil: candidatoContext.estado_civil || '',
        tem_filhos: candidatoContext.tem_filhos,
        quantidade_filhos: candidatoContext.quantidade_filhos || 0,
        idade_filhos: candidatoContext.idade_filhos || '',

        // Expectativas
        pretensao_salarial: candidatoContext.pretensao_salarial || '',
        valores_empresa: candidatoContext.valores_empresa || [],
        areas_interesse: candidatoContext.areas_interesse || [],
        objetivo_profissional: candidatoContext.objetivo_profissional || '',

        // Senha (vazio inicialmente)
        senha: '',
        confirmar_senha: '',
      });
    }
  }, [candidatoContext]);

  const updateForm = useCallback((field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayValue = useCallback((field: string, value: string) => {
    setForm((prev) => {
      const arr = (prev[field] as string[]) || [];
      const newArr = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [field]: newArr };
    });
  }, []);

  // Filtrar sugestões de cargo
  const filtrarCargoSugestoes = (texto: string) => {
    if (texto.length < 2) {
      setCargoSugestoes([]);
      setShowCargoSugestoes(false);
      return;
    }
    const filtradas = SUGESTOES_CARGOS.filter((c) =>
      c.toLowerCase().includes(texto.toLowerCase())
    ).slice(0, 6);
    setCargoSugestoes(filtradas);
    setShowCargoSugestoes(filtradas.length > 0);
  };

  // Calcular progresso
  const calcularProgresso = () => {
    let pontos = 0;
    let total = 0;

    // Dados pessoais
    total += 4;
    if (form.data_nascimento) pontos++;
    if (form.cpf?.length === 14 && validarCPF(form.cpf)) pontos++;
    if (form.estado) pontos++;
    if (form.cidade) pontos++;

    // Experiência
    total += 4;
    if (form.ultima_empresa) pontos++;
    if (form.ultimo_cargo) pontos++;
    if (form.areas_experiencia?.length > 0) pontos++;
    if (form.anos_experiencia !== undefined) pontos++;

    // Formação
    total += 1;
    if (form.escolaridade) pontos++;

    // Logística
    total += 3;
    if (form.veiculo) pontos++;
    if (form.cnh?.length > 0) pontos++;
    if (form.disponibilidade_horario?.length > 0) pontos++;

    // Expectativas
    total += 3;
    if (form.pretensao_salarial) pontos++;
    if (form.areas_interesse?.length > 0) pontos++;
    if (form.objetivo_profissional) pontos++;

    return Math.round((pontos / total) * 100);
  };

  // Validar senha
  const validarSenha = () => {
    const erros: Record<string, string> = {};

    if (!form.senha || form.senha.length < 6) {
      erros.senha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (form.senha !== form.confirmar_senha) {
      erros.confirmar_senha = 'As senhas não coincidem';
    }

    setSenhaErrors(erros);
    return Object.keys(erros).length === 0;
  };

  // Salvar dados
  const salvarDados = async (avancar = false) => {
    if (!candidatoContext?.id) return;

    // Se está na seção de senha e quer avançar, validar senha
    if (secaoAtual === 5 && avancar) {
      if (!validarSenha()) return;
    }

    setIsSaving(true);
    try {
      const dadosParaSalvar: Record<string, any> = {
        // Dados pessoais
        data_nascimento: form.data_nascimento || null,
        cpf: form.cpf?.replace(/\D/g, '') || null,
        estado: form.estado || null,
        cidade: form.cidade || null,
        bairro: form.bairro || null,

        // Situação atual
        esta_trabalhando: form.esta_trabalhando,
        salario_atual: form.salario_atual || null,
        regime_atual: form.regime_atual || null,
        motivo_busca_oportunidade: form.motivos_busca?.join(', ') || null,
        disponibilidade_inicio: form.disponibilidade_inicio || null,
        regime_preferido: form.regime_preferido || null,

        // Experiência
        ultima_empresa: form.ultima_empresa || null,
        ultimo_cargo: form.ultimo_cargo || null,
        tempo_ultima_empresa: form.tempo_permanencia || null,
        motivo_saida: form.motivo_saida || null,
        areas_experiencia: form.areas_experiencia || [],
        anos_experiencia: form.anos_experiencia || 0,

        // Formação
        escolaridade: form.escolaridade || null,
        curso: form.curso || null,
        certificacoes: form.certificacoes || null,

        // Logística
        possui_veiculo: form.veiculo || null,
        possui_cnh: form.cnh || [],
        disponibilidade_horario: form.disponibilidade_horario?.join(', ') || null,
        aceita_viajar: form.aceita_viajar || null,
        aceita_mudanca: form.aceita_mudanca || null,

        // Vida pessoal
        sexo: form.sexo || null,
        estado_civil: form.estado_civil || null,
        tem_filhos: form.tem_filhos,
        quantidade_filhos: form.tem_filhos ? form.quantidade_filhos : null,
        idade_filhos: form.tem_filhos ? form.idade_filhos : null,

        // Expectativas
        pretensao_salarial: form.pretensao_salarial || null,
        valores_empresa: form.valores_empresa || [],
        areas_interesse: form.areas_interesse || [],
        objetivo_profissional: form.objetivo_profissional || null,
      };

      // Verificar se cadastro está completo
      const progresso = calcularProgresso();
      if (progresso >= 80) {
        dadosParaSalvar.cadastro_completo = true;
        dadosParaSalvar.status = 'disponivel';
      }

      const { error } = await supabase
        .from('candidatos_recrutamento')
        .update(dadosParaSalvar)
        .eq('id', candidatoContext.id);

      if (error) throw error;

      toast({
        title: 'Dados salvos!',
        description: progresso >= 80
          ? 'Seu perfil está quase completo. Adicione foto e faça o teste DISC.'
          : 'Continue preenchendo para completar seu perfil.',
      });

      if (avancar) {
        if (secaoAtual < SECOES.length - 1) {
          setSecaoAtual(secaoAtual + 1);
        } else {
          // Última seção (senha) - criar usuário no Supabase Auth
          if (form.senha && candidatoContext.email) {
            try {
              // Criar usuário no Auth
              const { error: signUpError } = await supabase.auth.signUp({
                email: candidatoContext.email,
                password: form.senha,
                options: {
                  data: { tipo: 'candidato' },
                },
              });

              if (signUpError && !signUpError.message.includes('User already registered')) {
                console.warn('Erro ao criar auth:', signUpError.message);
              }

              // Tentar fazer login
              const { error: loginError } = await supabase.auth.signInWithPassword({
                email: candidatoContext.email,
                password: form.senha,
              });

              if (loginError && !loginError.message.includes('Email not confirmed')) {
                console.warn('Aviso no login:', loginError.message);
              }

              // Atualizar flag de senha criada
              await supabase
                .from('candidatos_recrutamento')
                .update({ status: 'disponivel' } as any)
                .eq('id', candidatoContext.id);

            } catch (authError) {
              console.error('Erro auth:', authError);
            }
          }

          // Finalizado - verificar se precisa do teste DISC
          recarregarCandidato();

          toast({
            title: 'Cadastro completo!',
            description: 'Sua conta foi criada com sucesso.',
          });

          if (!candidatoContext.perfil_disc) {
            navigate('/teste', {
              state: {
                candidatoRecrutamentoId: candidatoContext.id,
                nomeCompleto: candidatoContext.nome_completo,
                telefone: candidatoContext.telefone,
                email: candidatoContext.email,
              },
            });
          } else {
            navigate('/recrutamento/candidato/inicio');
          }
        }
      } else {
        recarregarCandidato();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSecao = () => {
    switch (secaoAtual) {
      case 0: // Dados Pessoais
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Data de nascimento</label>
              <DataNascimentoInput
                value={form.data_nascimento}
                onChange={(value) => updateForm('data_nascimento', value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">CPF</label>
              <Input
                placeholder="000.000.000-00"
                value={form.cpf || ''}
                onChange={(e) => updateForm('cpf', aplicarMascaraCPF(e.target.value))}
                className="bg-slate-900/50 border-slate-600 text-white"
                maxLength={14}
              />
              {form.cpf?.length === 14 && !validarCPF(form.cpf) && (
                <p className="text-red-400 text-xs">CPF inválido</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Estado</label>
              <Select value={form.estado || ''} onValueChange={(v) => updateForm('estado', v)}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                  {ESTADOS_BR.map((e) => (
                    <SelectItem key={e.value} value={e.value} className="text-white">
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Cidade</label>
              <CidadeAutocomplete
                value={form.cidade || ''}
                estado={form.estado}
                onChange={(cidade, uf) => {
                  updateForm('cidade', cidade);
                  if (uf && uf !== form.estado) {
                    updateForm('estado', uf);
                  }
                }}
                placeholder="Digite sua cidade"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Bairro</label>
              <Input
                placeholder="Digite seu bairro"
                value={form.bairro || ''}
                onChange={(e) => updateForm('bairro', e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sexo</label>
              <div className="grid grid-cols-3 gap-2">
                {OPCOES_SEXO.map((s) => (
                  <BotaoOpcao
                    key={s.value}
                    selecionado={form.sexo === s.value}
                    onClick={() => updateForm('sexo', s.value)}
                    small
                  >
                    {s.label}
                  </BotaoOpcao>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Estado civil</label>
              <div className="grid grid-cols-2 gap-2">
                {ESTADOS_CIVIS.map((e) => (
                  <BotaoOpcao
                    key={e.value}
                    selecionado={form.estado_civil === e.value}
                    onClick={() => updateForm('estado_civil', e.value)}
                    small
                  >
                    {e.label}
                  </BotaoOpcao>
                ))}
              </div>
            </div>
          </div>
        );

      case 1: // Experiência
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Você está trabalhando atualmente?</label>
              <div className="grid grid-cols-2 gap-3">
                <BotaoOpcao
                  selecionado={form.esta_trabalhando === true}
                  onClick={() => updateForm('esta_trabalhando', true)}
                >
                  SIM
                </BotaoOpcao>
                <BotaoOpcao
                  selecionado={form.esta_trabalhando === false}
                  onClick={() => updateForm('esta_trabalhando', false)}
                >
                  NÃO
                </BotaoOpcao>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Última empresa</label>
              <Input
                placeholder="Nome da empresa"
                value={form.ultima_empresa || ''}
                onChange={(e) => updateForm('ultima_empresa', e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm text-slate-300">Último cargo</label>
              <Input
                placeholder="Ex: Vendedor, Gerente..."
                value={form.ultimo_cargo || ''}
                onChange={(e) => {
                  updateForm('ultimo_cargo', e.target.value);
                  filtrarCargoSugestoes(e.target.value);
                }}
                onFocus={() => filtrarCargoSugestoes(form.ultimo_cargo || '')}
                onBlur={() => setTimeout(() => setShowCargoSugestoes(false), 200)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              {showCargoSugestoes && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg">
                  {cargoSugestoes.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-full text-left px-4 py-2 text-white hover:bg-slate-700"
                      onClick={() => {
                        updateForm('ultimo_cargo', c);
                        setShowCargoSugestoes(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Áreas de experiência</label>
              <div className="flex flex-wrap gap-2">
                {AREAS_EXPERIENCIA.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      form.areas_experiencia?.includes(a.value)
                        ? 'bg-[#E31E24] text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => toggleArrayValue('areas_experiencia', a.value)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <ExperienciaSelector
              value={form.anos_experiencia || 0}
              onChange={(value) => updateForm('anos_experiencia', value)}
            />
          </div>
        );

      case 2: // Formação
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Escolaridade</label>
              <div className="space-y-2">
                {ESCOLARIDADES.map((e) => (
                  <BotaoOpcao
                    key={e.value}
                    selecionado={form.escolaridade === e.value}
                    onClick={() => updateForm('escolaridade', e.value)}
                    small
                  >
                    {e.label}
                  </BotaoOpcao>
                ))}
              </div>
            </div>

            {['tecnico', 'superior_incompleto', 'superior_completo', 'pos_graduacao'].includes(form.escolaridade) && (
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Qual curso?</label>
                <Input
                  placeholder="Ex: Administração, Contabilidade..."
                  value={form.curso || ''}
                  onChange={(e) => updateForm('curso', e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Cursos ou certificações (opcional)</label>
              <Textarea
                placeholder="Liste cursos e certificações relevantes..."
                value={form.certificacoes || ''}
                onChange={(e) => updateForm('certificacoes', e.target.value)}
                className="min-h-24 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>
        );

      case 3: // Logística
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Possui veículo próprio?</label>
              <div className="grid grid-cols-2 gap-2">
                {VEICULOS.map((v) => (
                  <BotaoOpcao
                    key={v.value}
                    selecionado={form.veiculo === v.value}
                    onClick={() => updateForm('veiculo', v.value)}
                  >
                    <span className="mr-2">{v.icon}</span>
                    {v.label}
                  </BotaoOpcao>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Habilitação (CNH)</label>
              <CNHSelector
                value={form.cnh || []}
                onChange={(value) => updateForm('cnh', value)}
                emProcesso={form.cnh_em_processo}
                onEmProcessoChange={(value) => updateForm('cnh_em_processo', value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Disponibilidade de horário</label>
              <div className="space-y-2">
                {DISPONIBILIDADE_HORARIO.map((d) => (
                  <BotaoOpcao
                    key={d.value}
                    selecionado={form.disponibilidade_horario?.includes(d.value)}
                    onClick={() => toggleArrayValue('disponibilidade_horario', d.value)}
                    small
                  >
                    {d.label}
                  </BotaoOpcao>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Aceita viajar a trabalho?</label>
              <div className="grid grid-cols-3 gap-2">
                {OPCOES_VIAGEM_MUDANCA.map((o) => (
                  <BotaoOpcao
                    key={o.value}
                    selecionado={form.aceita_viajar === o.value}
                    onClick={() => updateForm('aceita_viajar', o.value)}
                    small
                  >
                    {o.label}
                  </BotaoOpcao>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Expectativas
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Pretensão salarial</label>
              <Select value={form.pretensao_salarial || ''} onValueChange={(v) => updateForm('pretensao_salarial', v)}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                  {FAIXAS_SALARIAIS.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="text-white">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                O que você mais valoriza em uma empresa? (até 3)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VALORES_EMPRESA.map((v) => (
                  <BotaoOpcao
                    key={v.value}
                    selecionado={form.valores_empresa?.includes(v.value)}
                    onClick={() => {
                      if (form.valores_empresa?.includes(v.value)) {
                        toggleArrayValue('valores_empresa', v.value);
                      } else if ((form.valores_empresa?.length || 0) < 3) {
                        toggleArrayValue('valores_empresa', v.value);
                      }
                    }}
                    disabled={!form.valores_empresa?.includes(v.value) && (form.valores_empresa?.length || 0) >= 3}
                    small
                  >
                    <span className="mr-1">{v.icon}</span>
                    {v.label}
                  </BotaoOpcao>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Áreas de interesse</label>
              <div className="flex flex-wrap gap-2">
                {AREAS_INTERESSE.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      form.areas_interesse?.includes(a.value)
                        ? 'bg-[#E31E24] text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => toggleArrayValue('areas_interesse', a.value)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Objetivo profissional em uma frase</label>
              <Textarea
                placeholder="Ex: Crescer na área comercial e me tornar gerente"
                value={form.objetivo_profissional || ''}
                onChange={(e) => {
                  if (e.target.value.length <= 150) {
                    updateForm('objetivo_profissional', e.target.value);
                  }
                }}
                className="min-h-20 bg-slate-900/50 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-500 text-right">
                {(form.objetivo_profissional?.length || 0)}/150
              </p>
            </div>
          </div>
        );

      case 5: // Conta (Senha)
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
              <p className="text-blue-300 text-sm">
                Crie uma senha para acessar sua conta de qualquer dispositivo.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Criar senha de acesso
              </label>
              <div className="relative">
                <Input
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha || ''}
                  onChange={(e) => {
                    updateForm('senha', e.target.value);
                    setSenhaErrors({});
                  }}
                  className={`bg-slate-900/50 border-slate-600 text-white pr-10 ${senhaErrors.senha ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {senhaErrors.senha && (
                <p className="text-red-400 text-xs">{senhaErrors.senha}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmar senha
              </label>
              <div className="relative">
                <Input
                  type={showConfirmarSenha ? 'text' : 'password'}
                  placeholder="Digite a senha novamente"
                  value={form.confirmar_senha || ''}
                  onChange={(e) => {
                    updateForm('confirmar_senha', e.target.value);
                    setSenhaErrors({});
                  }}
                  className={`bg-slate-900/50 border-slate-600 text-white pr-10 ${senhaErrors.confirmar_senha ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {senhaErrors.confirmar_senha && (
                <p className="text-red-400 text-xs">{senhaErrors.confirmar_senha}</p>
              )}
              {form.confirmar_senha && form.senha === form.confirmar_senha && form.senha?.length >= 6 && (
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Senhas coincidem
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progresso = calcularProgresso();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header com progresso */}
      <div>
        <h1 className="text-xl font-bold text-white mb-2">Complete seu perfil</h1>
        <p className="text-sm text-slate-400 mb-4">
          Preencha seus dados para aparecer para empresas
        </p>

        {/* Indicadores de seção */}
        <div className="flex justify-between mb-3">
          {SECOES.map((secao, index) => {
            const Icon = secao.icon;
            const isAtual = secaoAtual === index;
            const isCompleta = secaoAtual > index;
            return (
              <button
                key={secao.id}
                onClick={() => setSecaoAtual(index)}
                className={`flex flex-col items-center transition-all ${
                  isAtual ? 'text-white' : isCompleta ? 'text-green-400' : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    isAtual
                      ? 'bg-[#E31E24]'
                      : isCompleta
                      ? 'bg-green-500'
                      : 'bg-slate-700'
                  }`}
                >
                  {isCompleta ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="text-xs hidden sm:block">{secao.titulo}</span>
              </button>
            );
          })}
        </div>

        <Progress value={progresso} className="h-2" />
        <p className="text-center text-sm text-slate-400 mt-2">{progresso}% completo</p>
      </div>

      {/* Conteúdo da seção */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {(() => {
              const Icon = SECOES[secaoAtual].icon;
              return <Icon className="w-5 h-5" />;
            })()}
            {SECOES[secaoAtual].titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderSecao()}</CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (secaoAtual > 0) {
              setSecaoAtual(secaoAtual - 1);
            } else {
              navigate('/recrutamento/candidato/inicio');
            }
          }}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {secaoAtual === 0 ? 'Voltar' : 'Anterior'}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => salvarDados(false)}
            disabled={isSaving}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>

          <Button
            onClick={() => salvarDados(true)}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : secaoAtual === SECOES.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar
interface BotaoOpcaoProps {
  children: React.ReactNode;
  selecionado: boolean;
  onClick: () => void;
  small?: boolean;
  disabled?: boolean;
}

function BotaoOpcao({ children, selecionado, onClick, small, disabled }: BotaoOpcaoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${small ? 'py-2 px-3 text-sm' : 'py-3 px-4'}
        rounded-lg font-medium transition-all flex items-center justify-center
        ${
          selecionado
            ? 'bg-[#E31E24] text-white border-2 border-[#E31E24]'
            : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600 hover:border-slate-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}
