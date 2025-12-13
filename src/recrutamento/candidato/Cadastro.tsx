// =====================================================
// CADASTRO CANDIDATO - Formulário Dinâmico 37 Perguntas
// Área de Recrutamento VEON
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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
  FileText,
  GraduationCap,
  Car,
  Users,
  Target,
} from 'lucide-react';

import {
  FormularioCandidato,
  VALORES_INICIAIS,
  ETAPAS,
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
  CNH_CATEGORIAS,
  DISPONIBILIDADE_HORARIO,
  OPCOES_VIAGEM_MUDANCA,
  OPCOES_MUDANCA,
  ESTADOS_CIVIS,
  VALORES_EMPRESA,
  AREAS_INTERESSE,
  SUGESTOES_CARGOS,
} from './dadosFormulario';

import { validarCPF } from '../services/cnpjService';

const STORAGE_KEY = 'veon_candidato_cadastro';

// Máscaras
const aplicarMascaraCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const aplicarMascaraTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

// Ícones das etapas
const ICONES_ETAPAS = [User, Briefcase, FileText, GraduationCap, Car, Users, Target];

export default function CadastroCandidato() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [perguntaAtual, setPerguntaAtual] = useState(1);
  const [form, setForm] = useState<FormularioCandidato>(VALORES_INICIAIS);
  const [cidades, setCidades] = useState<{ value: string; label: string }[]>([]);
  const [cargoSugestoes, setCargoSugestoes] = useState<string[]>([]);
  const [showCargoSugestoes, setShowCargoSugestoes] = useState(false);

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(parsed.form || VALORES_INICIAIS);
        setEtapaAtual(parsed.etapa || 1);
        setPerguntaAtual(parsed.pergunta || 1);
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
  }, []);

  // Salvar progresso automaticamente
  useEffect(() => {
    const data = { form, etapa: etapaAtual, pergunta: perguntaAtual };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [form, etapaAtual, perguntaAtual]);

  // Buscar cidades quando estado muda
  useEffect(() => {
    if (form.estado) {
      buscarCidades(form.estado);
    }
  }, [form.estado]);

  const buscarCidades = async (uf: string) => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      );
      const data = await response.json();
      const cidadesFormatadas = data
        .map((c: { nome: string }) => ({ value: c.nome, label: c.nome }))
        .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
      setCidades(cidadesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      setCidades([]);
    }
  };

  // Atualizar campo do formulário
  const updateForm = useCallback((field: keyof FormularioCandidato, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Toggle em arrays
  const toggleArrayValue = useCallback((field: keyof FormularioCandidato, value: string) => {
    setForm((prev) => {
      const arr = (prev[field] as string[]) || [];
      const newArr = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [field]: newArr };
    });
  }, []);

  // Calcular progresso total
  const calcularProgresso = () => {
    const totalPerguntas = ETAPAS.reduce((acc, e) => acc + e.perguntas, 0);
    const perguntasAnteriores = ETAPAS.slice(0, etapaAtual - 1).reduce(
      (acc, e) => acc + e.perguntas,
      0
    );
    return Math.round(((perguntasAnteriores + perguntaAtual) / totalPerguntas) * 100);
  };

  // Navegar para próxima pergunta/etapa
  const proximaPergunta = () => {
    const etapa = ETAPAS[etapaAtual - 1];
    if (perguntaAtual < etapa.perguntas) {
      setPerguntaAtual(perguntaAtual + 1);
    } else if (etapaAtual < ETAPAS.length) {
      setEtapaAtual(etapaAtual + 1);
      setPerguntaAtual(1);
    } else {
      // Formulário completo, ir para selfie
      navigate('/recrutamento/candidato/selfie', { state: { form, ref } });
    }
  };

  // Voltar pergunta/etapa
  const voltarPergunta = () => {
    if (perguntaAtual > 1) {
      setPerguntaAtual(perguntaAtual - 1);
    } else if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
      setPerguntaAtual(ETAPAS[etapaAtual - 2].perguntas);
    }
  };

  // Verificar se pode avançar
  const podeAvancar = (): boolean => {
    if (etapaAtual === 1) {
      switch (perguntaAtual) {
        case 1: return form.nome_completo.trim().length >= 3;
        case 2: return !!form.data_nascimento;
        case 3: return form.cpf.length === 14 && validarCPF(form.cpf);
        case 4: return form.telefone.length >= 14;
        case 5: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        case 6: return !!form.estado;
        case 7: return !!form.cidade;
        case 8: return form.bairro.trim().length >= 2;
      }
    }
    if (etapaAtual === 2) {
      switch (perguntaAtual) {
        case 1: return form.esta_trabalhando !== null;
        case 2: return !form.esta_trabalhando || !!form.salario_atual;
        case 3: return !form.esta_trabalhando || !!form.regime_atual;
        case 4: return form.motivos_busca.length > 0;
        case 5: return !!form.disponibilidade_inicio;
        case 6: return !!form.regime_preferido;
      }
    }
    if (etapaAtual === 3) {
      switch (perguntaAtual) {
        case 1: return form.ultima_empresa.trim().length >= 2;
        case 2: return form.ultimo_cargo.trim().length >= 2;
        case 3: return !!form.tempo_permanencia;
        case 4: return !!form.motivo_saida;
        case 5: return form.areas_experiencia.length > 0;
        case 6: return true;
      }
    }
    if (etapaAtual === 4) {
      switch (perguntaAtual) {
        case 1: return !!form.escolaridade;
        case 2: {
          const precisaCurso = ['tecnico', 'superior_incompleto', 'superior_completo', 'pos_graduacao'].includes(form.escolaridade);
          return !precisaCurso || form.curso.trim().length >= 2;
        }
        case 3: return true;
      }
    }
    if (etapaAtual === 5) {
      switch (perguntaAtual) {
        case 1: return !!form.veiculo;
        case 2: return !!form.cnh;
        case 3: return form.disponibilidade_horario.length > 0;
        case 4: return !!form.aceita_viajar;
        case 5: return !!form.aceita_mudanca;
      }
    }
    if (etapaAtual === 6) {
      switch (perguntaAtual) {
        case 1: return !!form.estado_civil;
        case 2: return form.tem_filhos !== null;
        case 3: return !form.tem_filhos || form.quantidade_filhos > 0;
        case 4: return !form.tem_filhos || form.idade_filhos.trim().length >= 1;
        case 5: return true;
      }
    }
    if (etapaAtual === 7) {
      switch (perguntaAtual) {
        case 1: return !!form.pretensao_salarial;
        case 2: return form.valores_empresa.length > 0 && form.valores_empresa.length <= 3;
        case 3: return form.areas_interesse.length > 0;
        case 4: return form.objetivo_profissional.trim().length >= 10;
      }
    }
    return true;
  };

  // Pular perguntas condicionais
  useEffect(() => {
    if (etapaAtual === 2 && form.esta_trabalhando === false) {
      if (perguntaAtual === 2 || perguntaAtual === 3) {
        setPerguntaAtual(4);
      }
    }
    if (etapaAtual === 6 && form.tem_filhos === false) {
      if (perguntaAtual === 3 || perguntaAtual === 4) {
        setPerguntaAtual(5);
      }
    }
    if (etapaAtual === 4 && perguntaAtual === 2) {
      const precisaCurso = ['tecnico', 'superior_incompleto', 'superior_completo', 'pos_graduacao'].includes(form.escolaridade);
      if (!precisaCurso) {
        setPerguntaAtual(3);
      }
    }
  }, [etapaAtual, perguntaAtual, form.esta_trabalhando, form.tem_filhos, form.escolaridade]);

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

  // Renderizar pergunta atual
  const renderPergunta = () => {
    // ==================== ETAPA 1 - DADOS PESSOAIS ====================
    if (etapaAtual === 1) {
      switch (perguntaAtual) {
        case 1:
          return (
            <PerguntaWrapper titulo="Qual é o seu nome completo?">
              <Input
                placeholder="Digite seu nome completo"
                value={form.nome_completo}
                onChange={(e) => updateForm('nome_completo', e.target.value)}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
                autoFocus
              />
            </PerguntaWrapper>
          );

        case 2:
          return (
            <PerguntaWrapper titulo="Qual sua data de nascimento?">
              <Input
                type="date"
                value={form.data_nascimento}
                onChange={(e) => updateForm('data_nascimento', e.target.value)}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
                max={new Date().toISOString().split('T')[0]}
              />
              {form.data_nascimento && (
                <p className="text-slate-400 mt-2">
                  Idade: {calcularIdade(form.data_nascimento)} anos
                </p>
              )}
            </PerguntaWrapper>
          );

        case 3:
          return (
            <PerguntaWrapper titulo="Qual é o seu CPF?">
              <Input
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => updateForm('cpf', aplicarMascaraCPF(e.target.value))}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
                maxLength={14}
              />
              {form.cpf.length === 14 && !validarCPF(form.cpf) && (
                <p className="text-red-400 text-sm mt-2">CPF inválido</p>
              )}
            </PerguntaWrapper>
          );

        case 4:
          return (
            <PerguntaWrapper titulo="Qual seu telefone/WhatsApp?">
              <div className="relative">
                <Input
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => updateForm('telefone', aplicarMascaraTelefone(e.target.value))}
                  className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white pl-12"
                  maxLength={15}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-xl">
                  📱
                </span>
              </div>
            </PerguntaWrapper>
          );

        case 5:
          return (
            <PerguntaWrapper titulo="Qual seu e-mail?">
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
              />
            </PerguntaWrapper>
          );

        case 6:
          return (
            <PerguntaWrapper titulo="Em qual estado você mora?">
              <Select value={form.estado} onValueChange={(v) => updateForm('estado', v)}>
                <SelectTrigger className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white">
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
            </PerguntaWrapper>
          );

        case 7:
          return (
            <PerguntaWrapper titulo="Em qual cidade você mora?">
              <Select value={form.cidade} onValueChange={(v) => updateForm('cidade', v)}>
                <SelectTrigger className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                  {cidades.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-white">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PerguntaWrapper>
          );

        case 8:
          return (
            <PerguntaWrapper titulo="Qual seu bairro?">
              <Input
                placeholder="Digite seu bairro"
                value={form.bairro}
                onChange={(e) => updateForm('bairro', e.target.value)}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
              />
            </PerguntaWrapper>
          );
      }
    }

    // ==================== ETAPA 2 - SITUAÇÃO ATUAL ====================
    if (etapaAtual === 2) {
      switch (perguntaAtual) {
        case 1:
          return (
            <PerguntaWrapper titulo="Você está trabalhando atualmente?">
              <div className="grid grid-cols-2 gap-4">
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
            </PerguntaWrapper>
          );

        case 2:
          return (
            <PerguntaWrapper titulo="Qual seu salário atual?">
              <Select value={form.salario_atual} onValueChange={(v) => updateForm('salario_atual', v)}>
                <SelectTrigger className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione a faixa salarial" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {FAIXAS_SALARIAIS_ATUAL.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="text-white">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PerguntaWrapper>
          );

        case 3:
          return (
            <PerguntaWrapper titulo="Você está como CLT ou PJ?">
              <div className="grid grid-cols-2 gap-4">
                <BotaoOpcao
                  selecionado={form.regime_atual === 'clt'}
                  onClick={() => updateForm('regime_atual', 'clt')}
                >
                  CLT
                </BotaoOpcao>
                <BotaoOpcao
                  selecionado={form.regime_atual === 'pj'}
                  onClick={() => updateForm('regime_atual', 'pj')}
                >
                  PJ
                </BotaoOpcao>
              </div>
            </PerguntaWrapper>
          );

        case 4:
          return (
            <PerguntaWrapper titulo="Por que busca uma nova oportunidade?" subtitulo="Pode marcar várias opções">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOTIVOS_BUSCA.map((m) => (
                  <BotaoOpcao
                    key={m.value}
                    selecionado={form.motivos_busca.includes(m.value)}
                    onClick={() => toggleArrayValue('motivos_busca', m.value)}
                    small
                  >
                    {m.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 5:
          return (
            <PerguntaWrapper titulo="Qual sua disponibilidade para início?">
              <div className="grid grid-cols-2 gap-3">
                {DISPONIBILIDADE_INICIO.map((d) => (
                  <BotaoOpcao
                    key={d.value}
                    selecionado={form.disponibilidade_inicio === d.value}
                    onClick={() => updateForm('disponibilidade_inicio', d.value)}
                  >
                    {d.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 6:
          return (
            <PerguntaWrapper titulo="Qual regime de trabalho você prefere?">
              <div className="grid grid-cols-3 gap-3">
                {REGIMES_TRABALHO.map((r) => (
                  <BotaoOpcao
                    key={r.value}
                    selecionado={form.regime_preferido === r.value}
                    onClick={() => updateForm('regime_preferido', r.value)}
                  >
                    {r.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );
      }
    }

    // ==================== ETAPA 3 - EXPERIÊNCIA ====================
    if (etapaAtual === 3) {
      switch (perguntaAtual) {
        case 1:
          return (
            <PerguntaWrapper titulo="Qual a última empresa em que trabalhou?" subtitulo="Este dado só será revelado após match">
              <Input
                placeholder="Nome da empresa"
                value={form.ultima_empresa}
                onChange={(e) => updateForm('ultima_empresa', e.target.value)}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
              />
            </PerguntaWrapper>
          );

        case 2:
          return (
            <PerguntaWrapper titulo="Qual cargo você ocupava?">
              <div className="relative">
                <Input
                  placeholder="Ex: Vendedor, Gerente, Auxiliar..."
                  value={form.ultimo_cargo}
                  onChange={(e) => {
                    updateForm('ultimo_cargo', e.target.value);
                    filtrarCargoSugestoes(e.target.value);
                  }}
                  onFocus={() => filtrarCargoSugestoes(form.ultimo_cargo)}
                  onBlur={() => setTimeout(() => setShowCargoSugestoes(false), 200)}
                  className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
                />
                {showCargoSugestoes && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg">
                    {cargoSugestoes.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="w-full text-left px-4 py-2 text-white hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
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
            </PerguntaWrapper>
          );

        case 3:
          return (
            <PerguntaWrapper titulo="Quanto tempo você ficou nesta empresa?">
              <Select value={form.tempo_permanencia} onValueChange={(v) => updateForm('tempo_permanencia', v)}>
                <SelectTrigger className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {TEMPO_PERMANENCIA.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-white">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PerguntaWrapper>
          );

        case 4:
          return (
            <PerguntaWrapper titulo="Qual foi o principal motivo da saída?">
              <Select value={form.motivo_saida} onValueChange={(v) => updateForm('motivo_saida', v)}>
                <SelectTrigger className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {MOTIVOS_SAIDA.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-white">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PerguntaWrapper>
          );

        case 5:
          return (
            <PerguntaWrapper titulo="Em quais áreas você tem experiência?" subtitulo="Selecione todas que se aplicam">
              <div className="flex flex-wrap gap-2">
                {AREAS_EXPERIENCIA.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      form.areas_experiencia.includes(a.value)
                        ? 'bg-[#E31E24] text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => toggleArrayValue('areas_experiencia', a.value)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 6:
          return (
            <PerguntaWrapper titulo="Quantos anos de experiência profissional você tem?">
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-5xl font-bold text-white">
                    {form.anos_experiencia}
                  </span>
                  <span className="text-xl text-slate-400 ml-2">anos</span>
                </div>
                <Slider
                  value={[form.anos_experiencia]}
                  onValueChange={([v]) => updateForm('anos_experiencia', v)}
                  min={0}
                  max={30}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>0 anos</span>
                  <span>30+ anos</span>
                </div>
              </div>
            </PerguntaWrapper>
          );
      }
    }

    // ==================== ETAPA 4 - FORMAÇÃO ====================
    if (etapaAtual === 4) {
      switch (perguntaAtual) {
        case 1:
          return (
            <PerguntaWrapper titulo="Qual sua escolaridade?">
              <div className="grid grid-cols-1 gap-2">
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
            </PerguntaWrapper>
          );

        case 2:
          return (
            <PerguntaWrapper titulo="Qual seu curso?">
              <Input
                placeholder="Ex: Administração, Contabilidade, Enfermagem..."
                value={form.curso}
                onChange={(e) => updateForm('curso', e.target.value)}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
              />
            </PerguntaWrapper>
          );

        case 3:
          return (
            <PerguntaWrapper titulo="Possui cursos ou certificações?" subtitulo="Opcional">
              <Textarea
                placeholder="Liste cursos, certificações ou especializações relevantes..."
                value={form.certificacoes}
                onChange={(e) => updateForm('certificacoes', e.target.value)}
                className="min-h-32 bg-slate-900/50 border-slate-600 text-white"
              />
            </PerguntaWrapper>
          );
      }
    }

    // ==================== ETAPA 5 - LOGÍSTICA ====================
    if (etapaAtual === 5) {
      switch (perguntaAtual) {
        case 1:
          return (
            <PerguntaWrapper titulo="Possui veículo próprio?">
              <div className="grid grid-cols-2 gap-3">
                {VEICULOS.map((v) => (
                  <BotaoOpcao
                    key={v.value}
                    selecionado={form.veiculo === v.value}
                    onClick={() => updateForm('veiculo', v.value)}
                  >
                    <span className="text-2xl mr-2">{v.icon}</span>
                    {v.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 2:
          return (
            <PerguntaWrapper titulo="Possui CNH?">
              <div className="grid grid-cols-2 gap-3">
                {CNH_CATEGORIAS.map((c) => (
                  <BotaoOpcao
                    key={c.value}
                    selecionado={form.cnh === c.value}
                    onClick={() => updateForm('cnh', c.value)}
                  >
                    {c.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 3:
          return (
            <PerguntaWrapper titulo="Qual sua disponibilidade de horário?" subtitulo="Selecione todas que se aplicam">
              <div className="grid grid-cols-1 gap-2">
                {DISPONIBILIDADE_HORARIO.map((d) => (
                  <BotaoOpcao
                    key={d.value}
                    selecionado={form.disponibilidade_horario.includes(d.value)}
                    onClick={() => toggleArrayValue('disponibilidade_horario', d.value)}
                    small
                  >
                    {d.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 4:
          return (
            <PerguntaWrapper titulo="Aceita viajar a trabalho?">
              <div className="grid grid-cols-3 gap-3">
                {OPCOES_VIAGEM_MUDANCA.map((o) => (
                  <BotaoOpcao
                    key={o.value}
                    selecionado={form.aceita_viajar === o.value}
                    onClick={() => updateForm('aceita_viajar', o.value)}
                  >
                    {o.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 5:
          return (
            <PerguntaWrapper titulo="Aceita mudança de cidade?">
              <div className="grid grid-cols-1 gap-3">
                {OPCOES_MUDANCA.map((o) => (
                  <BotaoOpcao
                    key={o.value}
                    selecionado={form.aceita_mudanca === o.value}
                    onClick={() => updateForm('aceita_mudanca', o.value)}
                  >
                    {o.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );
      }
    }

    // ==================== ETAPA 6 - VIDA PESSOAL ====================
    if (etapaAtual === 6) {
      switch (perguntaAtual) {
        case 1:
          return (
            <PerguntaWrapper titulo="Qual seu estado civil?">
              <div className="grid grid-cols-2 gap-3">
                {ESTADOS_CIVIS.map((e) => (
                  <BotaoOpcao
                    key={e.value}
                    selecionado={form.estado_civil === e.value}
                    onClick={() => updateForm('estado_civil', e.value)}
                  >
                    {e.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 2:
          return (
            <PerguntaWrapper titulo="Você tem filhos?">
              <div className="grid grid-cols-2 gap-4">
                <BotaoOpcao
                  selecionado={form.tem_filhos === true}
                  onClick={() => updateForm('tem_filhos', true)}
                >
                  SIM
                </BotaoOpcao>
                <BotaoOpcao
                  selecionado={form.tem_filhos === false}
                  onClick={() => updateForm('tem_filhos', false)}
                >
                  NÃO
                </BotaoOpcao>
              </div>
            </PerguntaWrapper>
          );

        case 3:
          return (
            <PerguntaWrapper titulo="Quantos filhos você tem?">
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <BotaoOpcao
                    key={n}
                    selecionado={form.quantidade_filhos === n}
                    onClick={() => updateForm('quantidade_filhos', n)}
                  >
                    {n === 5 ? '5+' : n}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 4:
          return (
            <PerguntaWrapper titulo="Qual a idade dos seus filhos?">
              <Input
                placeholder="Ex: 3 anos, 7 anos"
                value={form.idade_filhos}
                onChange={(e) => updateForm('idade_filhos', e.target.value)}
                className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white"
              />
            </PerguntaWrapper>
          );

        case 5:
          return (
            <PerguntaWrapper titulo="Qual seu Instagram?" subtitulo="Para verificação de perfil (opcional)">
              <div className="relative">
                <Input
                  placeholder="seuinstagram"
                  value={form.instagram}
                  onChange={(e) => updateForm('instagram', e.target.value.replace('@', ''))}
                  className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white pl-10"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
              </div>
            </PerguntaWrapper>
          );
      }
    }

    // ==================== ETAPA 7 - EXPECTATIVAS ====================
    if (etapaAtual === 7) {
      switch (perguntaAtual) {
        case 1:
          return (
            <PerguntaWrapper titulo="Qual sua pretensão salarial?">
              <Select value={form.pretensao_salarial} onValueChange={(v) => updateForm('pretensao_salarial', v)}>
                <SelectTrigger className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white">
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
            </PerguntaWrapper>
          );

        case 2:
          return (
            <PerguntaWrapper
              titulo="O que você mais valoriza em uma empresa?"
              subtitulo={`Escolha até 3 opções (${form.valores_empresa.length}/3)`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VALORES_EMPRESA.map((v) => (
                  <BotaoOpcao
                    key={v.value}
                    selecionado={form.valores_empresa.includes(v.value)}
                    onClick={() => {
                      if (form.valores_empresa.includes(v.value)) {
                        toggleArrayValue('valores_empresa', v.value);
                      } else if (form.valores_empresa.length < 3) {
                        toggleArrayValue('valores_empresa', v.value);
                      }
                    }}
                    disabled={!form.valores_empresa.includes(v.value) && form.valores_empresa.length >= 3}
                    small
                  >
                    <span className="mr-2">{v.icon}</span>
                    {v.label}
                  </BotaoOpcao>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 3:
          return (
            <PerguntaWrapper titulo="Quais áreas te interessam?" subtitulo="Selecione todas que se aplicam">
              <div className="flex flex-wrap gap-2">
                {AREAS_INTERESSE.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      form.areas_interesse.includes(a.value)
                        ? 'bg-[#E31E24] text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => toggleArrayValue('areas_interesse', a.value)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </PerguntaWrapper>
          );

        case 4:
          return (
            <PerguntaWrapper titulo="Qual seu objetivo profissional em uma frase?">
              <div className="space-y-2">
                <Textarea
                  placeholder="Ex: Crescer na área comercial e me tornar gerente"
                  value={form.objetivo_profissional}
                  onChange={(e) => {
                    if (e.target.value.length <= 150) {
                      updateForm('objetivo_profissional', e.target.value);
                    }
                  }}
                  className="min-h-24 bg-slate-900/50 border-slate-600 text-white"
                />
                <p className={`text-right text-sm ${form.objetivo_profissional.length >= 140 ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {form.objetivo_profissional.length}/150
                </p>
              </div>
            </PerguntaWrapper>
          );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl">
        {/* Header com progresso */}
        <div className="mb-8">
          {/* Etapas */}
          <div className="flex justify-between mb-4">
            {ETAPAS.map((etapa, index) => {
              const Icone = ICONES_ETAPAS[index];
              const isAtual = etapaAtual === etapa.id;
              const isCompleta = etapaAtual > etapa.id;
              return (
                <div
                  key={etapa.id}
                  className={`flex flex-col items-center ${
                    isAtual ? 'text-white' : isCompleta ? 'text-green-400' : 'text-slate-600'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all ${
                      isAtual
                        ? 'bg-[#E31E24]'
                        : isCompleta
                        ? 'bg-green-500'
                        : 'bg-slate-700'
                    }`}
                  >
                    {isCompleta ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icone className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{etapa.titulo}</span>
                </div>
              );
            })}
          </div>

          {/* Barra de progresso */}
          <Progress value={calcularProgresso()} className="h-2 bg-slate-700" />
          <p className="text-center text-sm text-slate-400 mt-2">
            {calcularProgresso()}% completo
          </p>
        </div>

        {/* Pergunta atual */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm mb-6">
          <CardContent className="p-6">{renderPergunta()}</CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={voltarPergunta}
            disabled={etapaAtual === 1 && perguntaAtual === 1}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button
            onClick={proximaPergunta}
            disabled={!podeAvancar()}
            className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] disabled:opacity-50"
          >
            {etapaAtual === ETAPAS.length && perguntaAtual === ETAPAS[etapaAtual - 1].perguntas
              ? 'Continuar'
              : 'Próximo'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

interface PerguntaWrapperProps {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}

function PerguntaWrapper({ titulo, subtitulo, children }: PerguntaWrapperProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white">{titulo}</h2>
        {subtitulo && <p className="text-slate-400 mt-1">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}

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
        ${small ? 'py-3 px-4' : 'py-4 px-6'}
        rounded-xl font-medium transition-all flex items-center justify-center
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

function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}
