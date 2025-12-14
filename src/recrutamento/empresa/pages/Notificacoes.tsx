// =====================================================
// NOTIFICAÇÕES - Painel da Empresa
// Lista de todas as notificações recebidas
// =====================================================

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Info,
  Megaphone,
  Sparkles,
  AlertTriangle,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Empresa {
  id: string;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo_notificacao: string;
  lida: boolean;
  created_at: string;
}

const TIPOS_NOTIFICACAO = {
  informativo: { icon: Info, color: 'bg-blue-500', label: 'Informativo' },
  promocao: { icon: Megaphone, color: 'bg-green-500', label: 'Promoção' },
  atualizacao: { icon: Sparkles, color: 'bg-purple-500', label: 'Atualização' },
  urgente: { icon: AlertTriangle, color: 'bg-red-500', label: 'Urgente' },
};

const ITENS_POR_PAGINA = 10;

export default function NotificacoesEmpresa() {
  const { toast } = useToast();
  const { empresa } = useOutletContext<{ empresa: Empresa }>();

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [totalNotificacoes, setTotalNotificacoes] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroLeitura, setFiltroLeitura] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [notificacaoDetalhe, setNotificacaoDetalhe] = useState<Notificacao | null>(null);

  useEffect(() => {
    if (empresa?.id) {
      carregarNotificacoes();
    }
  }, [empresa?.id, paginaAtual, filtroLeitura, filtroTipo]);

  const carregarNotificacoes = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('notificacoes')
        .select('*', { count: 'exact' })
        .eq('destinatario_id', empresa.id)
        .eq('tipo_destinatario', 'empresa')
        .order('created_at', { ascending: false });

      // Filtro de leitura
      if (filtroLeitura === 'nao_lidas') {
        query = query.eq('lida', false);
      } else if (filtroLeitura === 'lidas') {
        query = query.eq('lida', true);
      }

      // Filtro de tipo
      if (filtroTipo !== 'todos') {
        query = query.eq('tipo_notificacao', filtroTipo);
      }

      // Paginação
      const from = (paginaAtual - 1) * ITENS_POR_PAGINA;
      const to = from + ITENS_POR_PAGINA - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setNotificacoes((data as Notificacao[]) || []);
      setTotalNotificacoes(count || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const marcarComoLida = async (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      try {
        await supabase
          .from('notificacoes')
          .update({ lida: true, lida_em: new Date().toISOString() })
          .eq('id', notificacao.id);

        setNotificacoes(prev =>
          prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n)
        );
      } catch (error) {
        console.error('Erro ao marcar como lida:', error);
      }
    }
    setNotificacaoDetalhe(notificacao);
  };

  const marcarTodasComoLidas = async () => {
    try {
      const { data, error } = await supabase.rpc('marcar_todas_notificacoes_lidas' as any, {
        p_usuario_id: empresa.id,
        p_tipo_usuario: 'empresa',
      });

      if (error) throw error;

      const resultado = data as { success: boolean; marcadas: number };

      if (resultado.success) {
        toast({
          title: 'Pronto!',
          description: `${resultado.marcadas} notificações marcadas como lidas.`,
        });
        carregarNotificacoes();
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getTipoConfig = (tipo: string) => {
    return TIPOS_NOTIFICACAO[tipo as keyof typeof TIPOS_NOTIFICACAO] || TIPOS_NOTIFICACAO.informativo;
  };

  const totalPaginas = Math.ceil(totalNotificacoes / ITENS_POR_PAGINA);
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-amber-400" />
            Notificações
          </h1>
          <p className="text-slate-400 mt-1">
            {totalNotificacoes} notificação(ões) • {naoLidas} não lida(s)
          </p>
        </div>

        {naoLidas > 0 && (
          <Button
            onClick={marcarTodasComoLidas}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <Select value={filtroLeitura} onValueChange={(v) => { setFiltroLeitura(v); setPaginaAtual(1); }}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="nao_lidas">Não lidas</SelectItem>
            <SelectItem value="lidas">Lidas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroTipo} onValueChange={(v) => { setFiltroTipo(v); setPaginaAtual(1); }}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="informativo">Informativo</SelectItem>
            <SelectItem value="promocao">Promoção</SelectItem>
            <SelectItem value="atualizacao">Atualização</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de notificações */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notificacoes.map(notificacao => {
                const tipoConfig = getTipoConfig(notificacao.tipo_notificacao);
                const TipoIcon = tipoConfig.icon;

                return (
                  <button
                    key={notificacao.id}
                    onClick={() => marcarComoLida(notificacao)}
                    className={`w-full px-6 py-4 flex items-start gap-4 hover:bg-slate-700/50 transition-colors text-left ${
                      !notificacao.lida ? 'bg-slate-700/30' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${tipoConfig.color} flex-shrink-0`}>
                      <TipoIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-medium ${notificacao.lida ? 'text-slate-400' : 'text-white'}`}>
                            {notificacao.titulo}
                          </p>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {notificacao.mensagem}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notificacao.lida && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                          <Badge className={`${tipoConfig.color} text-white text-xs`}>
                            {tipoConfig.label}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(notificacao.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual(prev => prev - 1)}
            className="border-slate-700 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-slate-400">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual(prev => prev + 1)}
            className="border-slate-700 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modal de detalhes */}
      <Dialog open={!!notificacaoDetalhe} onOpenChange={() => setNotificacaoDetalhe(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {notificacaoDetalhe && (() => {
                const config = getTipoConfig(notificacaoDetalhe.tipo_notificacao);
                return (
                  <>
                    <div className={`p-1.5 rounded-lg ${config.color}`}>
                      <config.icon className="w-4 h-4 text-white" />
                    </div>
                    {notificacaoDetalhe.titulo}
                  </>
                );
              })()}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {notificacaoDetalhe && format(new Date(notificacaoDetalhe.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          {notificacaoDetalhe && (
            <div className="mt-4">
              <p className="text-slate-300 whitespace-pre-wrap">
                {notificacaoDetalhe.mensagem}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
