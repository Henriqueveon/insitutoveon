// =====================================================
// CRÉDITOS - Área de Recrutamento VEON
// Compra de créditos e histórico de transações
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Star,
  Zap,
  Crown,
  QrCode,
  Copy,
  Loader2,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  valor: number;
  creditos: number;
  bonus: number;
  destaque: boolean;
  icone: any;
}

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  tipo_transacao: string | null;
  status: string | null;
  created_at: string;
}

const PACOTES: Pacote[] = [
  {
    id: 'basico',
    nome: 'Básico',
    valor: 100,
    creditos: 100,
    bonus: 0,
    destaque: false,
    icone: Zap,
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    valor: 250,
    creditos: 250,
    bonus: 25,
    destaque: true,
    icone: Star,
  },
  {
    id: 'empresarial',
    nome: 'Empresarial',
    valor: 500,
    creditos: 500,
    bonus: 75,
    destaque: false,
    icone: Crown,
  },
];

const CUSTOS = {
  proposta: 50,
  entrevista: 25,
  contratacao: 0,
};

export default function Creditos() {
  const { toast } = useToast();
  const { empresa, recarregarEmpresa } = useOutletContext<{
    empresa: Empresa | null;
    recarregarEmpresa: () => void;
  }>();

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState('comprar');

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
        .limit(50);

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

    // Gerar código PIX fictício
    const codigoPix = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 38)}5204000053039865802BR5925VEON RECRUTAMENTO LTDA6009SAO PAULO62070503***63041234`;
    setPixCopiaECola(codigoPix);

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
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const totalCreditos = pacoteSelecionado.creditos + pacoteSelecionado.bonus;

      // Registrar transação
      const { error: transacaoError } = await supabase
        .from('transacoes_recrutamento')
        .insert({
          usuario_id: empresa.id,
          tipo: 'empresa',
          valor: pacoteSelecionado.valor,
          tipo_transacao: 'credito',
          status: 'aprovado',
        });

      if (transacaoError) throw transacaoError;

      // Atualizar créditos da empresa
      const { error: empresaError } = await supabase
        .from('empresas_recrutamento')
        .update({ creditos: empresa.creditos + totalCreditos })
        .eq('id', empresa.id);

      if (empresaError) throw empresaError;

      setPagamentoStatus('aprovado');
      recarregarEmpresa();
      carregarTransacoes();

      toast({
        title: 'Pagamento aprovado!',
        description: `R$ ${totalCreditos},00 em créditos foram adicionados à sua conta.`,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-500/20 text-green-400">Aprovado</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pendente</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-500/20 text-red-400">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Créditos</h1>
          <p className="text-slate-400">Gerencie seus créditos para recrutamento</p>
        </div>
      </div>

      {/* Saldo atual */}
      <Card className="bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 border-[#E31E24]/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Saldo disponível</p>
                <p className="text-3xl font-bold text-white">
                  {formatarMoeda(empresa?.creditos || 0)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setTabAtiva('comprar')}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Créditos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="comprar" className="data-[state=active]:bg-slate-700">
            Comprar Créditos
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-slate-700">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="precos" className="data-[state=active]:bg-slate-700">
            Tabela de Preços
          </TabsTrigger>
        </TabsList>

        {/* Tab Comprar */}
        <TabsContent value="comprar" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {PACOTES.map((pacote) => (
              <Card
                key={pacote.id}
                className={`relative bg-slate-800/60 border-slate-700 transition-all hover:border-slate-600 ${
                  pacote.destaque ? 'border-[#E31E24]/50 shadow-lg shadow-[#E31E24]/10' : ''
                }`}
              >
                {pacote.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white">
                      Mais popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    pacote.destaque
                      ? 'bg-gradient-to-br from-[#E31E24] to-[#B91C1C]'
                      : 'bg-slate-700'
                  }`}>
                    <pacote.icone className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">
                    {pacote.nome}
                  </h3>

                  <p className="text-3xl font-bold text-white mb-2">
                    {formatarMoeda(pacote.valor)}
                  </p>

                  <div className="space-y-2 mb-6">
                    <p className="text-slate-300">
                      <span className="font-medium text-green-400">
                        R$ {pacote.creditos + pacote.bonus}
                      </span>
                      {' '}em créditos
                    </p>
                    {pacote.bonus > 0 && (
                      <p className="text-sm text-green-400">
                        +R$ {pacote.bonus} de bônus
                      </p>
                    )}
                  </div>

                  <ul className="text-left text-sm text-slate-400 space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      {Math.floor((pacote.creditos + pacote.bonus) / CUSTOS.proposta)} propostas
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      {Math.floor((pacote.creditos + pacote.bonus) / CUSTOS.entrevista)} entrevistas
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Créditos não expiram
                    </li>
                  </ul>

                  <Button
                    onClick={() => iniciarCompra(pacote)}
                    className={`w-full ${
                      pacote.destaque
                        ? 'bg-gradient-to-r from-[#E31E24] to-[#B91C1C]'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Histórico */}
        <TabsContent value="historico" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
            </div>
          ) : transacoes.length > 0 ? (
            <div className="space-y-3">
              {transacoes.map((transacao) => (
                <Card key={transacao.id} className="bg-slate-800/60 border-slate-700">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transacao.tipo_transacao === 'credito'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        {transacao.tipo_transacao === 'credito' ? (
                          <ArrowDownRight className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transacao.tipo_transacao || 'Transação'}</p>
                        <p className="text-sm text-slate-400">
                          {formatarData(transacao.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transacao.tipo_transacao === 'credito' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transacao.tipo_transacao === 'credito' ? '+' : '-'}{formatarMoeda(transacao.valor)}
                      </p>
                      {getStatusBadge(transacao.status || '')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="py-12 text-center">
                <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma transação ainda
                </h3>
                <p className="text-slate-400">
                  Suas transações aparecerão aqui
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Preços */}
        <TabsContent value="precos" className="mt-6">
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Como funcionam os créditos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Ação</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Custo</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 text-white">Enviar proposta</td>
                      <td className="py-3 px-4 text-right text-[#E31E24] font-medium">R$ 50,00</td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        Envie uma proposta para qualquer candidato disponível
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 text-white">Agendar entrevista</td>
                      <td className="py-3 px-4 text-right text-[#E31E24] font-medium">R$ 25,00</td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        Desbloqueie o telefone e email do candidato
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-white">Marcar como contratado</td>
                      <td className="py-3 px-4 text-right text-green-400 font-medium">Gratuito</td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        Registre a contratação sem custo adicional
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 mt-6">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  Informações importantes
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Os créditos não expiram e podem ser usados a qualquer momento</li>
                  <li>• Caso o candidato recuse a proposta, os créditos não são devolvidos</li>
                  <li>• Você pode acompanhar todas as transações no histórico</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                R$ {pacoteSelecionado ? pacoteSelecionado.creditos + pacoteSelecionado.bonus : 0},00
                foram adicionados à sua conta
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
                      <span className="text-slate-400">Créditos</span>
                      <span className="text-white">R$ {pacoteSelecionado.creditos}</span>
                    </div>
                    {pacoteSelecionado.bonus > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Bônus</span>
                        <span className="text-green-400">+R$ {pacoteSelecionado.bonus}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between items-center">
                      <span className="text-white font-medium">Total a pagar</span>
                      <span className="text-xl font-bold text-white">
                        {formatarMoeda(pacoteSelecionado.valor)}
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
