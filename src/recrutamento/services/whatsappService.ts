// =====================================================
// SERVICE: WhatsApp - Área de Recrutamento VEON
// Envio de notificações via WhatsApp
// =====================================================

/**
 * Formata número de telefone para WhatsApp (formato internacional)
 */
export function formatarTelefoneWhatsApp(telefone: string): string {
  const telefoneLimpo = telefone.replace(/\D/g, '');

  // Se já tem código do país (55), retorna
  if (telefoneLimpo.startsWith('55') && telefoneLimpo.length >= 12) {
    return telefoneLimpo;
  }

  // Adiciona código do Brasil
  return `55${telefoneLimpo}`;
}

/**
 * Gera link de WhatsApp com mensagem pré-definida
 */
export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const telefoneFormatado = formatarTelefoneWhatsApp(telefone);
  const mensagemEncoded = encodeURIComponent(mensagem);
  return `https://wa.me/${telefoneFormatado}?text=${mensagemEncoded}`;
}

/**
 * Envia notificação via API do WhatsApp Business (Evolution API ou similar)
 */
export async function enviarNotificacaoWhatsApp(
  telefone: string,
  mensagem: string
): Promise<boolean> {
  // TODO: Integrar com Evolution API ou WhatsApp Business API

  const telefoneFormatado = formatarTelefoneWhatsApp(telefone);

  console.log(`[WhatsApp] Enviando para ${telefoneFormatado}:`, mensagem);

  // Placeholder - implementar integração real
  return true;
}

/**
 * Templates de mensagens
 */
export const TEMPLATES_WHATSAPP = {
  NOVA_PROPOSTA: (nomeEmpresa: string, cargo: string) =>
    `🎯 *Nova oportunidade no Veon Recrutamento!*\n\nA empresa *${nomeEmpresa}* quer conhecer você para a vaga de *${cargo}*.\n\nAcesse o app para ver os detalhes e responder em até 48h.`,

  PROPOSTA_ACEITA: (nomeCandidato: string, cargo: string) =>
    `✅ *Proposta aceita!*\n\n*${nomeCandidato}* aceitou sua proposta para a vaga de *${cargo}*.\n\nOs dados de contato já estão disponíveis no painel.`,

  PROPOSTA_RECUSADA: (cargo: string) =>
    `❌ O candidato recusou sua proposta para *${cargo}*.\n\nSeu crédito de R$ 39,90 foi devolvido automaticamente.`,

  CREDITO_DEVOLVIDO: (valor: string) =>
    `💰 *Crédito devolvido!*\n\nR$ ${valor} foi adicionado aos seus créditos no Veon Recrutamento.`,

  LEMBRETE_EXPIRACAO: (horasRestantes: number) =>
    `⏰ *Atenção!* Você tem uma proposta que expira em ${horasRestantes} horas.\n\nAcesse o app para responder.`,
};
