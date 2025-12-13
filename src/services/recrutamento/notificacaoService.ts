import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface EnviarNotificacaoParams {
  tipoDestinatario: "empresa" | "candidato";
  destinatarioId: string;
  tipoNotificacao: string;
  titulo: string;
  mensagem: string;
  dados?: Json;
  enviarWhatsApp?: boolean;
}

export const enviarNotificacao = async (params: EnviarNotificacaoParams): Promise<boolean> => {
  try {
    // 1. Salvar notificação no banco
    const { error: notifError } = await supabase
      .from("notificacoes_recrutamento")
      .insert([{
        tipo_destinatario: params.tipoDestinatario,
        destinatario_id: params.destinatarioId,
        tipo_notificacao: params.tipoNotificacao,
        titulo: params.titulo,
        mensagem: params.mensagem,
        dados: params.dados
      }]);

    if (notifError) throw notifError;

    // 2. Se solicitado, enviar via WhatsApp
    if (params.enviarWhatsApp) {
      await enviarNotificacaoWhatsApp(params);
    }

    return true;
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return false;
  }
};

const enviarNotificacaoWhatsApp = async (params: EnviarNotificacaoParams): Promise<void> => {
  // TODO: Integrar com API de WhatsApp (Twilio, Z-API, etc.)
  console.log("Enviando WhatsApp para:", params.destinatarioId, params.mensagem);
};

// Templates de notificação
export const notificacaoTemplates = {
  nova_solicitacao_empresa: (nomeEmpresa: string, tituloVaga: string) => ({
    titulo: "Nova proposta de entrevista!",
    mensagem: `A empresa ${nomeEmpresa} está interessada em você para a vaga de ${tituloVaga}. Acesse sua área para ver os detalhes.`
  }),
  
  candidato_aceitou: (nomeCandidato: string) => ({
    titulo: "Candidato aceitou sua proposta!",
    mensagem: `${nomeCandidato} aceitou sua proposta de entrevista. Complete o pagamento para liberar os dados de contato.`
  }),
  
  candidato_recusou: (nomeCandidato: string, motivo: string) => ({
    titulo: "Candidato recusou a proposta",
    mensagem: `${nomeCandidato} recusou a proposta. Motivo: ${motivo}`
  }),
  
  dados_liberados: (nomeEmpresa: string) => ({
    titulo: "Dados de contato liberados!",
    mensagem: `A empresa ${nomeEmpresa} agora tem acesso aos seus dados de contato. Prepare-se para a entrevista!`
  }),
  
  pagamento_confirmado: (valor: number) => ({
    titulo: "Pagamento confirmado!",
    mensagem: `Seu pagamento de R$ ${valor.toFixed(2)} foi confirmado com sucesso.`
  })
};
