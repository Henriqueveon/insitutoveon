-- Complete schema with ALL columns needed

-- ===== pacotes_creditos columns =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacotes_creditos' AND column_name = 'preco_por_entrevista') THEN
    ALTER TABLE pacotes_creditos ADD COLUMN preco_por_entrevista DECIMAL(10,2);
  END IF;
END $$;

-- ===== analistas columns =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'data_cadastro') THEN
    ALTER TABLE analistas ADD COLUMN data_cadastro TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'ultimo_acesso') THEN
    ALTER TABLE analistas ADD COLUMN ultimo_acesso TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'link_unico') THEN
    ALTER TABLE analistas ADD COLUMN link_unico UUID DEFAULT gen_random_uuid();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'licencas_total') THEN
    ALTER TABLE analistas ADD COLUMN licencas_total INTEGER DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'licencas_usadas') THEN
    ALTER TABLE analistas ADD COLUMN licencas_usadas INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'tipo') THEN
    ALTER TABLE analistas ADD COLUMN tipo TEXT DEFAULT 'empresa';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'empresa') THEN
    ALTER TABLE analistas ADD COLUMN empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'telefone') THEN
    ALTER TABLE analistas ADD COLUMN telefone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'ativo') THEN
    ALTER TABLE analistas ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ===== empresas_recrutamento ALL columns =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'bairro') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN bairro TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'logradouro') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN logradouro TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'numero') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN numero TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'complemento') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN complemento TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'cidade') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN cidade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'estado') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN estado TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'cep') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN cep TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'telefone_empresa') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN telefone_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'email_empresa') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN email_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'socio_nome') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN socio_nome TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'socio_cpf') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN socio_cpf TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'socio_telefone') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN socio_telefone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'senha_hash') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN senha_hash TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'creditos') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN creditos DECIMAL(10,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'cartao_token') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN cartao_token TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'status') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN status TEXT DEFAULT 'ativo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'logo_url') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN logo_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'segmento') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN segmento TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'tempo_mercado') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN tempo_mercado TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'num_colaboradores') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN num_colaboradores TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'site_url') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN site_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'instagram_empresa') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN instagram_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'sobre_empresa') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN sobre_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'porque_trabalhar') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN porque_trabalhar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'link_recrutamento') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN link_recrutamento TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'total_acessos_link') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN total_acessos_link INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'auth_user_id') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN auth_user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'situacao_cadastral') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN situacao_cadastral TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'data_abertura') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN data_abertura DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'natureza_juridica') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN natureza_juridica TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'porte') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN porte TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'capital_social') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN capital_social DECIMAL(15,2);
  END IF;
END $$;

-- ===== candidatos_recrutamento ALL columns =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceite_lgpd') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceite_lgpd BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceite_lgpd_data') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceite_lgpd_data TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceite_termos') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceite_termos BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceite_termos_data') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceite_termos_data TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'data_nascimento') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN data_nascimento DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cpf') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cpf TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'telefone') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN telefone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'estado') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN estado TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cidade') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cidade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'bairro') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN bairro TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cep') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cep TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'logradouro') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN logradouro TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'numero') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN numero TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'complemento') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN complemento TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'sexo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN sexo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'esta_trabalhando') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN esta_trabalhando BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'salario_atual') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN salario_atual DECIMAL(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'regime_atual') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN regime_atual TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'motivo_busca_oportunidade') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN motivo_busca_oportunidade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'disponibilidade_inicio') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN disponibilidade_inicio TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'regime_preferido') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN regime_preferido TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'ultima_empresa') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN ultima_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'ultimo_cargo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN ultimo_cargo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'tempo_ultima_empresa') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN tempo_ultima_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'motivo_saida') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN motivo_saida TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'areas_experiencia') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN areas_experiencia JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'anos_experiencia') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN anos_experiencia INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'escolaridade') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN escolaridade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'curso') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN curso TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'instituicao') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN instituicao TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'ano_conclusao') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN ano_conclusao TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'certificacoes') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN certificacoes JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'possui_veiculo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN possui_veiculo BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'possui_cnh') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN possui_cnh BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'categoria_cnh') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN categoria_cnh TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'disponibilidade_horario') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN disponibilidade_horario JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'instagram') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN instagram TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'pretensao_salarial') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN pretensao_salarial TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'areas_interesse') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN areas_interesse JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'objetivo_profissional') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN objetivo_profissional TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'foto_url') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN foto_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'video_url') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN video_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'video_duracao') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN video_duracao INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'video_tipo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN video_tipo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'documento_url') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN documento_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'documento_tipo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN documento_tipo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'documento_verificado') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN documento_verificado BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'curriculo_url') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN curriculo_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'teste_disc_id') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN teste_disc_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'perfil_disc') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN perfil_disc TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'teste_disc_concluido') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN teste_disc_concluido BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'teste_disc_data') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN teste_disc_data TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'status') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN status TEXT DEFAULT 'disponivel';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'etapa_atual') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN etapa_atual INTEGER DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'etapa_cadastro') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN etapa_cadastro INTEGER DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'etapas_completadas') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN etapas_completadas INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cadastro_completo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cadastro_completo BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'auth_user_id') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN auth_user_id UUID;
  END IF;
END $$;

-- ===== codigos_indicacao columns =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'codigos_indicacao' AND column_name = 'tipo_usuario') THEN
    ALTER TABLE codigos_indicacao ADD COLUMN tipo_usuario TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'codigos_indicacao' AND column_name = 'usuario_id') THEN
    ALTER TABLE codigos_indicacao ADD COLUMN usuario_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'codigos_indicacao' AND column_name = 'codigo') THEN
    ALTER TABLE codigos_indicacao ADD COLUMN codigo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'codigos_indicacao' AND column_name = 'total_indicacoes') THEN
    ALTER TABLE codigos_indicacao ADD COLUMN total_indicacoes INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'codigos_indicacao' AND column_name = 'ativo') THEN
    ALTER TABLE codigos_indicacao ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

SELECT 'Schema complete!' as resultado;
