-- =============================================
-- CRIAR FUNÇÕES RPC FALTANTES
-- =============================================

-- Função para vincular auth_user_id ao candidato
CREATE OR REPLACE FUNCTION public.vincular_auth_candidato(
  p_candidato_id UUID,
  p_auth_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE candidatos_recrutamento
  SET auth_user_id = p_auth_user_id
  WHERE id = p_candidato_id AND auth_user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para vincular auth_user_id à empresa
CREATE OR REPLACE FUNCTION public.vincular_auth_empresa(
  p_empresa_id UUID,
  p_auth_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE empresas_recrutamento
  SET auth_user_id = p_auth_user_id
  WHERE id = p_empresa_id AND auth_user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissões
GRANT EXECUTE ON FUNCTION public.vincular_auth_candidato TO authenticated;
GRANT EXECUTE ON FUNCTION public.vincular_auth_empresa TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_codigo_indicacao TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
