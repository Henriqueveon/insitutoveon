// =====================================================
// SERVICE: Notificações - Área de Recrutamento VEON
// Gerenciamento de notificações no sistema
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { NotificacaoRecrutamento } from '../types/recrutamento.types';
import { enviarNotificacaoWhatsApp, TEMPLATES_WHATSAPP } from './whatsappService';

/**
 * Cria uma notificação no sistema
 */
export async function criarNotificacao(
  tipoDestinatario: 'empresa' | 'candidato',
  destinatarioId: string,
  tipoNotificacao: NotificacaoRecrutamento['tipo_notificacao'],
  titulo: string,
  mensagem: string,
  dados?: Record<string, unknown>
): Promise<NotificacaoRecrutamento | null> {
  try {
    const insertData = {
      tipo_destinatario: tipoDestinatario,
      destinatario_id: destinatarioId,
      tipo_notificacao: tipoNotificacao,
      titulo,
      mensagem,
      dados,
    };
    
    const { data, error } = await supabase
      .from('notificacoes_recrutamento')
      .insert(insertData as any)
      .select()
      .single();

    if (error) throw error;

    return data as NotificacaoRecrutamento;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return null;
  }
}

/**
 * Marca notificação como lida
 */
export async function marcarComoLida(
  notificacaoId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notificacoes_recrutamento')
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq('id', notificacaoId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return false;
  }
}

/**
 * Busca notificações não lidas
 */
export async function buscarNaoLidas(
  tipoDestinatario: 'empresa' | 'candidato',
  destinatarioId: string
): Promise<NotificacaoRecrutamento[]> {
  try {
    const { data, error } = await supabase
      .from('notificacoes_recrutamento')
      .select('*')
      .eq('tipo_destinatario', tipoDestinatario)
      .eq('destinatario_id', destinatarioId)
      .eq('lida', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as NotificacaoRecrutamento[]) || [];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}

/**
 * Notifica candidato sobre nova proposta
 */
export async function notificarNovaProposta(
  candidatoId: string,
  nomeEmpresa: string,
  cargo: string,
  telefone: string
): Promise<void> {
  // Cria notificação no sistema
  await criarNotificacao(
    'candidato',
    candidatoId,
    'nova_proposta',
    'Nova proposta de entrevista!',
    `${nomeEmpresa} quer te conhecer para a vaga de ${cargo}`,
    { empresa_nome: nomeEmpresa, cargo }
  );

  // Envia WhatsApp
  const mensagem = TEMPLATES_WHATSAPP.NOVA_PROPOSTA(nomeEmpresa, cargo);
  await enviarNotificacaoWhatsApp(telefone, mensagem);
}

/**
 * Notifica empresa sobre proposta aceita
 */
export async function notificarPropostaAceita(
  empresaId: string,
  nomeCandidato: string,
  cargo: string,
  telefone: string
): Promise<void> {
  await criarNotificacao(
    'empresa',
    empresaId,
    'proposta_aceita',
    'Proposta aceita!',
    `${nomeCandidato} aceitou sua proposta para ${cargo}`,
    { candidato_nome: nomeCandidato, cargo }
  );

  const mensagem = TEMPLATES_WHATSAPP.PROPOSTA_ACEITA(nomeCandidato, cargo);
  await enviarNotificacaoWhatsApp(telefone, mensagem);
}

/**
 * Notifica empresa sobre proposta recusada
 */
export async function notificarPropostaRecusada(
  empresaId: string,
  cargo: string,
  telefone: string
): Promise<void> {
  await criarNotificacao(
    'empresa',
    empresaId,
    'proposta_recusada',
    'Proposta recusada',
    `O candidato recusou sua proposta para ${cargo}. Seu crédito foi devolvido.`,
    { cargo }
  );

  const mensagem = TEMPLATES_WHATSAPP.PROPOSTA_RECUSADA(cargo);
  await enviarNotificacaoWhatsApp(telefone, mensagem);
}
