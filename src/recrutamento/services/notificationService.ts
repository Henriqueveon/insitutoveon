// =====================================================
// NOTIFICATION SERVICE - Área de Recrutamento VEON
// Templates de notificações WhatsApp e Email
// =====================================================

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TEMPLATES DE MENSAGENS WHATSAPP
// =====================================================

export const WHATSAPP_TEMPLATES = {
  // PARA CANDIDATO - Nova proposta
  CANDIDATO_NOVA_PROPOSTA: (dados: {
    nome: string;
    titulo_vaga: string;
    faixa_salarial: string;
    cidade: string;
    estado: string;
    link: string;
  }) => `🎉 Olá ${dados.nome}! Uma empresa quer te conhecer!

📍 Vaga: ${dados.titulo_vaga}
💰 Salário: ${dados.faixa_salarial}
📍 Local: ${dados.cidade}/${dados.estado}

Acesse o app para ver detalhes e aceitar:
${dados.link}

Veon Recrutamento`,

  // PARA CANDIDATO - Proposta aceita
  CANDIDATO_PROPOSTA_ACEITA: (dados: {
    nome: string;
    nome_empresa: string;
    telefone: string;
  }) => `✅ Parabéns ${dados.nome}!

A empresa ${dados.nome_empresa} recebeu seus dados.
Aguarde o contato em breve!

📞 WhatsApp da empresa: ${dados.telefone}

Boa sorte na entrevista! 🍀`,

  // PARA CANDIDATO - Entrevista agendada
  CANDIDATO_ENTREVISTA_AGENDADA: (dados: {
    nome: string;
    nome_empresa: string;
    data: string;
    horario: string;
    tipo: string;
    local_ou_link: string;
  }) => `📅 ${dados.nome}, sua entrevista foi agendada!

🏢 Empresa: ${dados.nome_empresa}
📆 Data: ${dados.data}
⏰ Horário: ${dados.horario}
📍 ${dados.tipo === 'presencial' ? `Local: ${dados.local_ou_link}` : dados.tipo === 'video' ? `Link: ${dados.local_ou_link}` : 'Por telefone'}

Boa sorte! 🍀
Veon Recrutamento`,

  // PARA EMPRESA - Candidato aceitou
  EMPRESA_CANDIDATO_ACEITOU: (dados: {
    nome_candidato: string;
    telefone: string;
    email: string;
    link: string;
  }) => `✅ Boa notícia!

${dados.nome_candidato} aceitou sua proposta de entrevista!

📞 Telefone: ${dados.telefone}
📧 Email: ${dados.email}

Acesse o painel para ver todos os dados:
${dados.link}

Veon Recrutamento`,

  // PARA EMPRESA - Candidato recusou
  EMPRESA_CANDIDATO_RECUSOU: (dados: {
    nome_candidato: string;
    motivo: string;
    saldo: string;
    link: string;
  }) => `❌ ${dados.nome_candidato} recusou sua proposta.

Motivo: ${dados.motivo}

💳 Seu crédito de R$ 50,00 foi devolvido.
Saldo atual: ${dados.saldo}

Continue buscando candidatos:
${dados.link}`,

  // PARA EMPRESA - Contratação confirmada
  EMPRESA_CONTRATACAO_CONFIRMADA: (dados: {
    nome_candidato: string;
    titulo_vaga: string;
  }) => `🎉 Parabéns pela contratação!

${dados.nome_candidato} confirmou que foi contratado para a vaga de ${dados.titulo_vaga}.

Obrigado por usar a Veon Recrutamento!`,
};

// =====================================================
// FUNÇÕES DE ENVIO
// =====================================================

interface NotificacaoParams {
  tipo_destinatario: 'candidato' | 'empresa';
  destinatario_id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  dados_extras?: Record<string, any>;
}

/**
 * Salva notificação no banco de dados
 */
export async function salvarNotificacao(params: NotificacaoParams) {
  const insertData = {
    tipo_destinatario: params.tipo_destinatario,
    destinatario_id: params.destinatario_id,
    titulo: params.titulo,
    mensagem: params.mensagem,
    tipo_notificacao: params.tipo,
    dados: params.dados_extras,
    lida: false,
  };
  
  const { error } = await supabase
    .from('notificacoes_recrutamento')
    .insert(insertData as any);

  if (error) {
    console.error('Erro ao salvar notificação:', error);
    throw error;
  }
}

/**
 * Envia mensagem via WhatsApp (integração com API)
 * Em produção, usar Twilio, Z-API, Evolution API, etc.
 */
export async function enviarWhatsApp(
  telefone: string,
  mensagem: string
): Promise<boolean> {
  // Remove caracteres não numéricos
  const numeroLimpo = telefone.replace(/\D/g, '');

  // Adiciona código do país se não tiver
  const numeroCompleto = numeroLimpo.startsWith('55')
    ? numeroLimpo
    : `55${numeroLimpo}`;

  // Em desenvolvimento, apenas loga
  console.log('📱 WhatsApp para:', numeroCompleto);
  console.log('📝 Mensagem:', mensagem);

  // TODO: Integrar com API de WhatsApp
  // Exemplo com Z-API:
  // const response = await fetch('https://api.z-api.io/instances/YOUR_INSTANCE/token/YOUR_TOKEN/send-text', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     phone: numeroCompleto,
  //     message: mensagem,
  //   }),
  // });

  return true;
}

/**
 * Notifica candidato sobre nova proposta
 */
export async function notificarCandidatoNovaProposta(
  candidatoId: string,
  candidatoNome: string,
  candidatoTelefone: string,
  vaga: { titulo: string; faixa_salarial: string; cidade: string; estado: string }
) {
  const link = `${window.location.origin}/recrutamento/candidato/propostas`;

  // Salva notificação no app
  await salvarNotificacao({
    tipo_destinatario: 'candidato',
    destinatario_id: candidatoId,
    titulo: 'Nova proposta de entrevista!',
    mensagem: `Uma empresa quer te conhecer para a vaga de ${vaga.titulo}`,
    tipo: 'proposta',
  });

  // Envia WhatsApp
  const mensagem = WHATSAPP_TEMPLATES.CANDIDATO_NOVA_PROPOSTA({
    nome: candidatoNome.split(' ')[0],
    titulo_vaga: vaga.titulo,
    faixa_salarial: vaga.faixa_salarial,
    cidade: vaga.cidade,
    estado: vaga.estado,
    link,
  });

  await enviarWhatsApp(candidatoTelefone, mensagem);
}

/**
 * Notifica empresa que candidato aceitou
 */
export async function notificarEmpresaCandidatoAceitou(
  empresaId: string,
  empresaTelefone: string,
  candidato: { nome: string; telefone: string; email: string }
) {
  const link = `${window.location.origin}/recrutamento/empresa/em-processo`;

  // Salva notificação no app
  await salvarNotificacao({
    tipo_destinatario: 'empresa',
    destinatario_id: empresaId,
    titulo: `${candidato.nome} aceitou sua proposta!`,
    mensagem: 'Os dados de contato do candidato foram liberados.',
    tipo: 'proposta_aceita',
  });

  // Envia WhatsApp
  const mensagem = WHATSAPP_TEMPLATES.EMPRESA_CANDIDATO_ACEITOU({
    nome_candidato: candidato.nome,
    telefone: candidato.telefone,
    email: candidato.email,
    link,
  });

  await enviarWhatsApp(empresaTelefone, mensagem);
}

/**
 * Notifica empresa que candidato recusou
 */
export async function notificarEmpresaCandidatoRecusou(
  empresaId: string,
  empresaTelefone: string,
  candidatoNome: string,
  motivo: string,
  saldoAtual: number
) {
  const link = `${window.location.origin}/recrutamento/empresa/buscar-candidatos`;

  // Salva notificação no app
  await salvarNotificacao({
    tipo_destinatario: 'empresa',
    destinatario_id: empresaId,
    titulo: 'Proposta recusada',
    mensagem: `${candidatoNome} recusou a proposta. Crédito devolvido.`,
    tipo: 'proposta_recusada',
  });

  // Envia WhatsApp
  const mensagem = WHATSAPP_TEMPLATES.EMPRESA_CANDIDATO_RECUSOU({
    nome_candidato: candidatoNome,
    motivo,
    saldo: `R$ ${saldoAtual.toFixed(2).replace('.', ',')}`,
    link,
  });

  await enviarWhatsApp(empresaTelefone, mensagem);
}

/**
 * Marca notificações como lidas
 */
export async function marcarNotificacoesComoLidas(
  tipo_destinatario: 'candidato' | 'empresa',
  destinatario_id: string
) {
  await supabase
    .from('notificacoes_recrutamento')
    .update({ lida: true })
    .eq('tipo_destinatario', tipo_destinatario)
    .eq('destinatario_id', destinatario_id)
    .eq('lida', false);
}

/**
 * Busca notificações não lidas
 */
export async function buscarNotificacoesNaoLidas(
  tipo_destinatario: 'candidato' | 'empresa',
  destinatario_id: string
) {
  const { data, error } = await supabase
    .from('notificacoes_recrutamento')
    .select('*')
    .eq('tipo_destinatario', tipo_destinatario)
    .eq('destinatario_id', destinatario_id)
    .eq('lida', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
