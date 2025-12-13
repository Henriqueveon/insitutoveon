// =====================================================
// CRÉDITOS - Área de Recrutamento VEON
// Sistema de pacotes de entrevistas
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  QrCode,
  Copy,
  Loader2,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  creditos: number;
}

interface Pacote {
  id: string;
  nome: string;
  quantidade_entrevistas: number;
  preco: number;
  preco_original?: number;
  preco_por_entrevista: number;
  economia: number;
  destaque: boolean;
  badge: string | null;
}

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  tipo_transacao: string | null;
  status: string | null;
  descricao?: string;
  created_at: string;
}

// Pacotes de entrevistas
const PACOTES: Pacote[] = [
  {
    id: 'avulso',
    nome: '1 Entrevista',
    quantidade_entrevistas: 1,
    preco: 39.90,
    preco_por_entrevista: 39.90,
    economia: 0,
    destaque: false,
    badge: null,
  },
  {
    id: 'popular',
    nome: '5 Entrevistas',
    quantidade_entrevistas: 5,
    preco: 189.00,
    preco_original: 199.50,
    preco_por_entrevista: 37.80,
    economia: 10.50,
    destaque: true,
    badge: 'MAIS POPULAR',
  },
  {
    id: 'profissional',
    nome: '10 Entrevistas',
    quantidade_entrevistas: 10,
    preco: 299.00,
    preco_original: 399.00,
    preco_por_entrevista: 29.90,
    economia: 100.00,
    destaque: false,
    badge: 'MELHOR CUSTO-BENEFÍCIO',
  },
];

// Custo de uma entrevista em créditos
const CUSTO_ENTREVISTA = 39.90;

export default function Creditos() {
  const { toast } = useToast();
  const { empresa, recarregarEmpresa } = useOutletContext<{
    empresa: Empresa | null;
    recarregarEmpresa: () => void;
  }>();

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de pagamento
  const [modalPagamento, setModalPagamento] = useState(false);
  const [pacoteSelecionado, setPacoteSelecionado] = useState<Pacote | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [pagamentoStatus, setPagamentoStatus] = useState<'aguardando' | 'aprovado' | 'erro' | null>(null);

  useEffect(() => {
    if (empresa?.id) {
      carregarTransacoes();
    }
  }, [empresa?.id]);

  const carregarTransacoes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transacoes_recrutamento')
        .select('*')
        .eq('usuario_id', empresa?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTransacoes((data as Transacao[]) || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const iniciarCompra = (pacote: Pacote) => {
    setPacoteSelecionado(pacote);
    setPagamentoStatus(null);
    setProcessandoPagamento(false);

    // Gerar código PIX no formato EMV
    const chavePix = 'pagamentos@institutoveon.com.br';
    const valor = pacote.preco.toFixed(2);
    const txid = `VEON${Date.now().toString(36).toUpperCase()}`;

    // Formato simplificado de PIX
    const pixPayload = `00020126580014BR.GOV.BCB.PIX0136${chavePix}5204000053039865802BR5925INSTITUTO VEON LTDA6009SAO PAULO62070503${txid}6304`;
    setPixCopiaECola(pixPayload);

    setModalPagamento(true);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    toast({
      title: 'Copiado!',
      description: 'Código PIX copiado para a área de transferência.',
    });
  };

  const simularPagamento = async () => {
    if (!pacoteSelecionado || !empresa) return;

    setProcessandoPagamento(true);
    setPagamentoStatus('aguardando');

    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const creditosAtuais = Number(empresa.creditos) || 0;
      const novosCreditos = creditosAtuais + pacoteSelecionado.preco;

      // Registrar transação
      const { error: transacaoError } = await supabase
        .from('transacoes_recrutamento')
        .insert({
          usuario_id: empresa.id,
          empresa_id: empresa.id,
          tipo: 'empresa',
          valor: pacoteSelecionado.preco,
          tipo_transacao: 'credito',
          status: 'aprovado',
          descricao: `Compra de pacote ${pacoteSelecionado.nome}`,
        });

      if (transacaoError) throw transacaoError;

      // Atualizar créditos da empresa
      const { error: empresaError } = await supabase
        .from('empresas_recrutamento')
        .update({ creditos: novosCreditos })
        .eq('id', empresa.id);

      if (empresaError) throw empresaError;

      setPagamentoStatus('aprovado');
      recarregarEmpresa();
      carregarTransacoes();

      toast({
        title: 'Pagamento aprovado!',
        description: `${pacoteSelecionado.quantidade_entrevistas} entrevista(s) adicionada(s) à sua conta.`,
      });

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setModalPagamento(false);
        setPacoteSelecionado(null);
      }, 2000);
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setPagamentoStatus('erro');
      toast({
        title: 'Erro no pagamento',
        description: 'Não foi possível processar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setProcessandoPagamento(false);
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcular entrevistas equivalentes
  const saldoAtual = Number(empresa?.creditos) || 0;
  const entrevistasEquivalentes = Math.floor(saldoAtual / CUSTO_ENTREVISTA);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Créditos</h1>
        <p className="text-slate-400">Gerencie seus créditos para entrevistas</p>
      </div>

      {/* Seção 1 - Explicação */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Como funcionam os créditos?</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Na Recruta Veon, você paga por entrevista agendada com o candidato de sua escolha.
                Por isso, escolha bem o candidato que melhor tem as características da vaga.
              </p>
              <div className="space-y-2">
                <p className="text-slate-300 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span>Se o candidato não aceitar a entrevista, <strong className="text-green-400">devolvemos seu crédito automaticamente</strong>.</span>
                </p>
                <p className="text-slate-300 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span>Os candidatos que você precisa estão aqui, na <strong className="text-white">Recruta Veon</strong>.</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2 - Pacotes de Créditos */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Escolha seu pacote
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {PACOTES.map((pacote) => (
            <Card
              key={pacote.id}
              className={`relative bg-slate-800/60 transition-all hover:scale-[1.02] ${
                pacote.destaque
                  ? 'border-2 border-[#E31E24] shadow-lg shadow-[#E31E24]/20'
                  : pacote.badge
                    ? 'border-blue-500/50'
                    : 'border-slate-700'
              }`}
            >
              {/* Badge */}
              {pacote.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={`${
                    pacote.destaque
                      ? 'bg-gradient-to-r from-[#E31E24] to-[#B91C1C]'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  } text-white px-3 py-1 text-xs font-bold`}>
                    {pacote.badge}
                  </Badge>
                </div>
              )}

              <CardContent className="p-6 pt-8 text-center">
                {/* Título */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {pacote.nome}
                </h3>

                {/* Preço */}
                <div className="mb-2">
                  {pacote.preco_original && (
                    <p className="text-slate-500 line-through text-lg">
                      {formatarMoeda(pacote.preco_original)}
                    </p>
                  )}
                  <p className="text-4xl font-bold text-white">
                    {formatarMoeda(pacote.preco)}
                  </p>
                </div>

                {/* Preço por entrevista */}
                <p className="text-slate-400 text-sm mb-4">
                  {formatarMoeda(pacote.preco_por_entrevista)}/entrevista
                </p>

                {/* Economia */}
                {pacote.economia > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 mb-6">
                    <p className="text-green-400 font-medium text-sm">
                      Economize {formatarMoeda(pacote.economia)}
                    </p>
                  </div>
                )}

                {/* Botão */}
                <Button
                  onClick={() => iniciarCompra(pacote)}
                  className={`w-full py-6 text-lg font-semibold ${
                    pacote.destaque
                      ? 'bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B]'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Comprar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seção 3 - Saldo Atual */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card de Saldo */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#E31E24]" />
              Seu saldo atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-bold text-white">
                  {formatarMoeda(saldoAtual)}
                </p>
                <p className="text-slate-400 mt-1">
                  Equivale a <span className="text-green-400 font-bold">{entrevistasEquivalentes}</span> entrevista{entrevistasEquivalentes !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Custo por entrevista</span>
                  <span className="text-white font-medium">{formatarMoeda(CUSTO_ENTREVISTA)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Histórico */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Últimas transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : transacoes.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {transacoes.slice(0, 5).map((transacao) => (
                  <div key={transacao.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transacao.tipo_transacao === 'credito'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        {transacao.tipo_transacao === 'credito' ? (
                          <ArrowDownRight className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {transacao.descricao || (transacao.tipo_transacao === 'credito' ? 'Crédito adicionado' : 'Débito')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatarData(transacao.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${
                      transacao.tipo_transacao === 'credito' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transacao.tipo_transacao === 'credito' ? '+' : '-'}{formatarMoeda(transacao.valor)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">Nenhuma transação ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção 4 - Frase Motivacional */}
      <div className="text-center py-8">
        <p className="text-xl text-slate-400 italic">
          "Recrutamento inteligente para empresas inteligentes."
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Target className="w-5 h-5 text-[#E31E24]" />
          <span className="text-slate-500 text-sm">Recruta Veon</span>
        </div>
      </div>

      {/* Modal de Pagamento PIX */}
      <Dialog open={modalPagamento} onOpenChange={setModalPagamento}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {pagamentoStatus === 'aprovado'
                ? 'Pagamento Aprovado!'
                : 'Pagamento via PIX'}
            </DialogTitle>
          </DialogHeader>

          {pagamentoStatus === 'aprovado' ? (
            <div className="py-8 text-center">
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <p className="text-white text-lg font-medium mb-2">
                Créditos adicionados!
              </p>
              <p className="text-slate-400">
                {pacoteSelecionado?.quantidade_entrevistas} entrevista(s) disponível(is)
              </p>
            </div>
          ) : (
            <>
              {pacoteSelecionado && (
                <div className="space-y-6 py-4">
                  {/* Resumo */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Pacote</span>
                      <span className="text-white font-medium">{pacoteSelecionado.nome}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Entrevistas</span>
                      <span className="text-white">{pacoteSelecionado.quantidade_entrevistas}</span>
                    </div>
                    {pacoteSelecionado.economia > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Economia</span>
                        <span className="text-green-400">{formatarMoeda(pacoteSelecionado.economia)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between items-center">
                      <span className="text-white font-medium">Total a pagar</span>
                      <span className="text-xl font-bold text-white">
                        {formatarMoeda(pacoteSelecionado.preco)}
                      </span>
                    </div>
                  </div>

                  {/* QR Code simulado */}
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="w-40 h-40 text-slate-800" />
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      Escaneie o QR Code ou copie o código
                    </p>
                  </div>

                  {/* Código PIX */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pixCopiaECola}
                        readOnly
                        className="flex-1 bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 truncate"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copiarPix}
                        className="border-slate-600"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status do pagamento */}
                  {pagamentoStatus === 'aguardando' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                      <div>
                        <p className="text-yellow-400 font-medium">Aguardando pagamento...</p>
                        <p className="text-sm text-yellow-400/70">
                          O status será atualizado automaticamente
                        </p>
                      </div>
                    </div>
                  )}

                  {pagamentoStatus === 'erro' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center space-x-3">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-red-400 font-medium">Erro no pagamento</p>
                        <p className="text-sm text-red-400/70">
                          Tente novamente ou entre em contato
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setModalPagamento(false)}
                  disabled={processandoPagamento}
                  className="border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={simularPagamento}
                  disabled={processandoPagamento}
                  className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
                >
                  {processandoPagamento ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Já fiz o pagamento'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
