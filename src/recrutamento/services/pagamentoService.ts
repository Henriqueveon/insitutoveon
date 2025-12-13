// =====================================================
// SERVICE: Pagamento - Área de Recrutamento VEON
// Processamento de pagamentos
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import {
  TransacaoRecrutamento,
  VALOR_SOLICITACAO_EMPRESA,
  VALOR_ACEITE_CANDIDATO,
} from '../types/recrutamento.types';

/**
 * Processa pagamento da empresa para solicitar entrevista
 */
export async function processarPagamentoEmpresa(
  empresaId: string,
  solicitacaoId: string,
  metodoPagamento: 'cartao' | 'pix'
): Promise<TransacaoRecrutamento | null> {
  // TODO: Integrar com gateway de pagamento (Stripe, PagSeguro, etc)

  try {
    // Criar registro da transação
    const { data, error } = await supabase
      .from('transacoes_recrutamento')
      .insert({
        tipo: 'empresa',
        usuario_id: empresaId,
        solicitacao_id: solicitacaoId,
        valor: VALOR_SOLICITACAO_EMPRESA,
        tipo_transacao: 'pagamento',
        metodo_pagamento: metodoPagamento,
        status: 'pendente',
      })
      .select()
      .single();

    if (error) throw error;

    return data as TransacaoRecrutamento;
  } catch (error) {
    console.error('Erro ao processar pagamento empresa:', error);
    throw error;
  }
}

/**
 * Processa pagamento do candidato para aceitar entrevista
 */
export async function processarPagamentoCandidato(
  candidatoId: string,
  solicitacaoId: string,
  metodoPagamento: 'cartao' | 'pix'
): Promise<TransacaoRecrutamento | null> {
  // TODO: Integrar com gateway de pagamento

  try {
    const { data, error } = await supabase
      .from('transacoes_recrutamento')
      .insert({
        tipo: 'candidato',
        usuario_id: candidatoId,
        solicitacao_id: solicitacaoId,
        valor: VALOR_ACEITE_CANDIDATO,
        tipo_transacao: 'pagamento',
        metodo_pagamento: metodoPagamento,
        status: 'pendente',
      })
      .select()
      .single();

    if (error) throw error;

    return data as TransacaoRecrutamento;
  } catch (error) {
    console.error('Erro ao processar pagamento candidato:', error);
    throw error;
  }
}

/**
 * Estorna crédito para empresa quando candidato recusa
 */
export async function estornarCreditoEmpresa(
  empresaId: string,
  solicitacaoId: string,
  valor: number
): Promise<void> {
  try {
    // Criar transação de crédito
    await supabase.from('transacoes_recrutamento').insert({
      tipo: 'empresa',
      usuario_id: empresaId,
      solicitacao_id: solicitacaoId,
      valor: valor,
      tipo_transacao: 'credito',
      status: 'aprovado',
    });

    // Atualizar créditos da empresa
    await supabase.rpc('incrementar_creditos_empresa', {
      p_empresa_id: empresaId,
      p_valor: valor,
    });
  } catch (error) {
    console.error('Erro ao estornar crédito:', error);
    throw error;
  }
}
