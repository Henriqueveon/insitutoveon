// =====================================================
// SEÇÃO DE INDICAÇÃO - Painel do Candidato
// Sistema viral de indicações
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Gift,
  Copy,
  Share2,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
}

interface Indicacao {
  id: string;
  indicado_tipo: string;
  indicado_id: string;
  credito_indicador: number;
  status: string;
  created_at: string;
}

interface CodigoIndicacao {
  id: string;
  codigo: string;
  total_indicacoes: number;
  creditos_ganhos: number;
}

interface Props {
  candidato: Candidato;
}

const BASE_URL = 'https://insitutoveon.lovable.app';

export default function SecaoIndicacaoCandidato({ candidato }: Props) {
  const { toast } = useToast();
  const [codigoIndicacao, setCodigoIndicacao] = useState<CodigoIndicacao | null>(null);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (candidato?.id) {
      carregarDadosIndicacao();
    }
  }, [candidato?.id]);

  const carregarDadosIndicacao = async () => {
    setIsLoading(true);
    try {
      // Gerar ou buscar código existente
      const { data: codigoData, error: codigoError } = await supabase.rpc('gerar_codigo_indicacao', {
        p_tipo_usuario: 'candidato',
        p_usuario_id: candidato.id,
      });

      if (codigoError) throw codigoError;

      const resultado = codigoData as { success: boolean; codigo: string; id: string };
      if (resultado?.success) {
        // Buscar dados completos do código
        const { data: codigoCompleto } = await supabase
          .from('codigos_indicacao')
          .select('*')
          .eq('id', resultado.id)
          .single();

        if (codigoCompleto) {
          setCodigoIndicacao(codigoCompleto as CodigoIndicacao);
        }
      }

      // Buscar indicações
      const { data: indicacoesData } = await supabase
        .from('indicacoes')
        .select('*')
        .eq('indicador_id', candidato.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setIndicacoes((indicacoesData as Indicacao[]) || []);
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const linkIndicacao = codigoIndicacao
    ? `${BASE_URL}/recrutamento/candidato/bem-vindo?ref=${codigoIndicacao.codigo}`
    : '';

  const copiarLink = () => {
    navigator.clipboard.writeText(linkIndicacao);
    toast({
      title: 'Link copiado!',
      description: 'Compartilhe com seus amigos que estão procurando emprego.',
    });
  };

  const compartilharWhatsApp = () => {
    const mensagem = encodeURIComponent(
      `🎯 Descobri uma plataforma incrível para encontrar emprego!\n\n` +
      `A Recruta Veon ajuda profissionais a descobrirem seus talentos naturais e conecta com empresas que combinam com seu perfil.\n\n` +
      `Cadastre-se pelo meu link:\n${linkIndicacao}`
    );
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              💰 Indique Amigos e Ganhe R$ 30,00
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Ajude um profissional a encontrar o emprego dos sonhos! Compartilhe seu link e ganhe{' '}
              <strong className="text-green-400">R$ 30,00 em créditos</strong>{' '}
              quando ele completar o cadastro.
            </p>
          </div>
        </div>

        {/* Link de Indicação */}
        <div className="bg-slate-800/80 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Seu link de indicação:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-slate-900/60 rounded-lg px-4 py-3 border border-slate-700">
              <p className="text-white text-sm truncate font-mono">
                {linkIndicacao || 'Gerando...'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copiarLink}
                disabled={!codigoIndicacao}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button
                onClick={compartilharWhatsApp}
                disabled={!codigoIndicacao}
                className="bg-green-600 hover:bg-green-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/60 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {codigoIndicacao?.total_indicacoes || 0}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Amigos indicados</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {formatarMoeda(codigoIndicacao?.creditos_ganhos || 0)}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Créditos ganhos</p>
          </div>
        </div>

        {/* Lista de Indicações */}
        {indicacoes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Suas indicações
            </h3>
            <div className="space-y-2">
              {indicacoes.slice(0, 5).map((indicacao) => (
                <div
                  key={indicacao.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      indicacao.status === 'creditado'
                        ? 'bg-green-500/20'
                        : 'bg-yellow-500/20'
                    }`}>
                      {indicacao.status === 'creditado' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm">Amigo indicado</p>
                      <p className="text-slate-500 text-xs">{formatarData(indicacao.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">
                      +{formatarMoeda(indicacao.credito_indicador)}
                    </p>
                    <Badge className={`text-xs ${
                      indicacao.status === 'creditado'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {indicacao.status === 'creditado' ? 'Creditado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
