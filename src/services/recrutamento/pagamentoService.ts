import { supabase } from "@/integrations/supabase/client";

interface CriarPagamentoParams {
  tipo: "empresa" | "candidato";
  usuarioId: string;
  solicitacaoId: string;
  valor: number;
  metodoPagamento: "pix" | "cartao" | "creditos";
}

interface PagamentoResult {
  success: boolean;
  transacaoId?: string;
  qrCode?: string;
  pixCopia?: string;
  error?: string;
}

export const criarPagamento = async (params: CriarPagamentoParams): Promise<PagamentoResult> => {
  try {
    // 1. Registrar transação no banco
    const { data: transacao, error: transacaoError } = await supabase
      .from("transacoes_recrutamento")
      .insert({
        tipo: params.tipo,
        usuario_id: params.usuarioId,
        solicitacao_id: params.solicitacaoId,
        valor: params.valor,
        tipo_transacao: "entrevista",
        metodo_pagamento: params.metodoPagamento,
        status: "pendente"
      })
      .select()
      .single();

    if (transacaoError) throw transacaoError;

    // 2. Se for PIX, gerar QR Code
    if (params.metodoPagamento === "pix") {
      // TODO: Integrar com gateway de pagamento (Stripe, Mercado Pago, etc.)
      return {
        success: true,
        transacaoId: transacao.id,
        qrCode: "data:image/png;base64,..." // Mock
      };
    }

    // 3. Se for créditos, debitar do saldo
    if (params.metodoPagamento === "creditos") {
      const { error: creditoError } = await supabase
        .from("empresas_recrutamento")
        .update({ 
          creditos: supabase.rpc as unknown as number // Será calculado via RPC
        })
        .eq("id", params.usuarioId);

      if (creditoError) throw creditoError;

      // Marcar transação como concluída
      await supabase
        .from("transacoes_recrutamento")
        .update({ status: "concluido" })
        .eq("id", transacao.id);

      return {
        success: true,
        transacaoId: transacao.id
      };
    }

    return {
      success: true,
      transacaoId: transacao.id
    };
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao processar pagamento"
    };
  }
};

export const verificarPagamento = async (transacaoId: string): Promise<{
  status: string;
  pago: boolean;
}> => {
  const { data, error } = await supabase
    .from("transacoes_recrutamento")
    .select("status")
    .eq("id", transacaoId)
    .single();

  if (error || !data) {
    return { status: "erro", pago: false };
  }

  return {
    status: data.status,
    pago: data.status === "concluido"
  };
};

export const adicionarCreditos = async (empresaId: string, valor: number): Promise<boolean> => {
  try {
    const { data: empresa, error: fetchError } = await supabase
      .from("empresas_recrutamento")
      .select("creditos")
      .eq("id", empresaId)
      .single();

    if (fetchError) throw fetchError;

    const novoSaldo = ((empresa?.creditos as number) || 0) + valor;

    const { error: updateError } = await supabase
      .from("empresas_recrutamento")
      .update({ creditos: novoSaldo })
      .eq("id", empresaId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Erro ao adicionar créditos:", error);
    return false;
  }
};
