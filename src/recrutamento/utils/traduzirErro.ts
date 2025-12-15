// =====================================================
// Função utilitária para traduzir mensagens de erro do Supabase
// Todas as mensagens em inglês são convertidas para português
// =====================================================

const TRADUCOES_ERRO: Record<string, string> = {
  // Erros de autenticação
  'Anonymous sign-ins are disabled': 'Não foi possível criar a conta. Por favor, tente novamente.',
  'User already registered': 'Este email já está cadastrado. Tente fazer login.',
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Por favor, confirme seu email antes de fazer login.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'Formato de email inválido.',
  'Signup requires a valid password': 'É necessário informar uma senha válida.',
  'To signup, please provide your email': 'É necessário informar um email.',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  'For security purposes, you can only request this once every 60 seconds': 'Por segurança, aguarde 60 segundos para tentar novamente.',

  // Erros de sessão
  'Invalid Refresh Token': 'Sessão expirada. Faça login novamente.',
  'Refresh Token Not Found': 'Sessão não encontrada. Faça login novamente.',
  'User not found': 'Usuário não encontrado.',
  'Invalid user': 'Usuário inválido.',

  // Erros de rede
  'Network error': 'Erro de conexão. Verifique sua internet.',
  'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
  'Request timeout': 'A requisição demorou muito. Tente novamente.',

  // Erros de cadastro
  'A user with this email address has already been registered': 'Este email já está cadastrado.',
  'Password is too weak': 'A senha é muito fraca. Use uma senha mais forte.',
  'Password must be at least': 'A senha deve ter pelo menos 6 caracteres.',

  // Erros de banco de dados
  'duplicate key value violates unique constraint': 'Este registro já existe no sistema.',
  'violates foreign key constraint': 'Erro de referência. Verifique os dados informados.',
  'Row not found': 'Registro não encontrado.',

  // Erros genéricos
  'Internal server error': 'Erro interno do servidor. Tente novamente mais tarde.',
  'Service temporarily unavailable': 'Serviço temporariamente indisponível.',
  'Bad request': 'Requisição inválida. Verifique os dados informados.',
  'Unauthorized': 'Não autorizado. Faça login novamente.',
  'Forbidden': 'Acesso negado.',
};

/**
 * Traduz mensagens de erro do Supabase (e outras) para português
 * @param mensagem - Mensagem de erro original (pode estar em inglês)
 * @returns Mensagem traduzida em português
 */
export function traduzirErroSupabase(mensagem: string): string {
  if (!mensagem) {
    return 'Ocorreu um erro. Por favor, tente novamente.';
  }

  // Procurar tradução exata ou parcial (case insensitive)
  const mensagemLower = mensagem.toLowerCase();

  for (const [ingles, portugues] of Object.entries(TRADUCOES_ERRO)) {
    if (mensagemLower.includes(ingles.toLowerCase())) {
      return portugues;
    }
  }

  // Se a mensagem já parece estar em português, retorna ela mesma
  if (/[áéíóúãõâêôàèìòùç]/i.test(mensagem)) {
    return mensagem;
  }

  // Se não encontrou tradução, retornar mensagem genérica
  return 'Ocorreu um erro. Por favor, tente novamente.';
}

/**
 * Extrai a mensagem de erro de qualquer tipo de erro
 * @param error - Objeto de erro (Error, string, ou unknown)
 * @returns Mensagem de erro traduzida
 */
export function obterMensagemErro(error: unknown): string {
  if (error instanceof Error) {
    return traduzirErroSupabase(error.message);
  }
  if (typeof error === 'string') {
    return traduzirErroSupabase(error);
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return traduzirErroSupabase(String((error as { message: unknown }).message));
  }
  return 'Ocorreu um erro desconhecido. Por favor, tente novamente.';
}
