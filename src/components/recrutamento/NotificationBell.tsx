// =====================================================
// NOTIFICATION BELL - Sininho de Notificações
// Componente compartilhado para empresa e candidato
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Bell,
  Info,
  Megaphone,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo_notificacao: string;
  lida: boolean;
  created_at: string;
}

interface NotificationBellProps {
  usuarioId: string;
  tipoUsuario: 'empresa' | 'candidato';
  baseUrl: string; // ex: /recrutamento/empresa ou /recrutamento/candidato
}

const TIPOS_NOTIFICACAO = {
  informativo: { icon: Info, color: 'bg-blue-500', label: 'Informativo' },
  promocao: { icon: Megaphone, color: 'bg-green-500', label: 'Promoção' },
  atualizacao: { icon: Sparkles, color: 'bg-purple-500', label: 'Atualização' },
  urgente: { icon: AlertTriangle, color: 'bg-red-500', label: 'Urgente' },
};

export default function NotificationBell({ usuarioId, tipoUsuario, baseUrl }: NotificationBellProps) {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notificacaoDetalhe, setNotificacaoDetalhe] = useState<Notificacao | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (usuarioId) {
      carregarNotificacoes();

      // Polling a cada 30 segundos
      const interval = setInterval(carregarNotificacoes, 30000);
      return () => clearInterval(interval);
    }
  }, [usuarioId]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('destinatario_id', usuarioId)
        .eq('tipo_destinatario', tipoUsuario)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotificacoes((data as Notificacao[]) || []);
      setNaoLidas((data as Notificacao[])?.filter(n => !n.lida).length || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
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
        setNaoLidas(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Erro ao marcar como lida:', error);
      }
    }
    setNotificacaoDetalhe(notificacao);
  };

  const marcarTodasComoLidas = async () => {
    try {
      const { data, error } = await supabase.rpc('marcar_todas_notificacoes_lidas', {
        p_destinatario_id: usuarioId,
        p_tipo_destinatario: tipoUsuario,
      });

      if (error) throw error;

      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getTipoConfig = (tipo: string) => {
    return TIPOS_NOTIFICACAO[tipo as keyof typeof TIPOS_NOTIFICACAO] || TIPOS_NOTIFICACAO.informativo;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-400 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {naoLidas > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-red-500 text-white text-xs flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <h3 className="font-semibold text-white">Notificações</h3>
            {naoLidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={marcarTodasComoLidas}
                className="text-xs text-blue-400 hover:text-blue-300 h-auto py-1"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map(notificacao => {
                const tipoConfig = getTipoConfig(notificacao.tipo_notificacao);
                const TipoIcon = tipoConfig.icon;

                return (
                  <button
                    key={notificacao.id}
                    onClick={() => marcarComoLida(notificacao)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-700/50 transition-colors text-left ${
                      !notificacao.lida ? 'bg-slate-700/30' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${tipoConfig.color} flex-shrink-0`}>
                      <TipoIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        notificacao.lida ? 'text-slate-400' : 'text-white'
                      }`}>
                        {notificacao.titulo}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDistanceToNow(new Date(notificacao.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 p-2">
            <Button
              variant="ghost"
              className="w-full text-sm text-slate-400 hover:text-white"
              onClick={() => {
                setIsOpen(false);
                navigate(`${baseUrl}/notificacoes`);
              }}
            >
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
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
              {notificacaoDetalhe && formatDistanceToNow(new Date(notificacaoDetalhe.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
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
