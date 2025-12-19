// Script para corrigir o schema das tabelas via SQL
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env.restore
const envPath = path.join(__dirname, '.env.restore');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const SUPABASE_URL = 'https://lzrquwyvguxywvlxsthj.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SERVICE_KEY) {
  console.error('Service key not found!');
  process.exit(1);
}

// SQL para adicionar colunas faltantes
const alterStatements = [
  // diferenciais_empresa
  `ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS categoria TEXT`,
  `ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS nome TEXT`,
  `ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS icone TEXT`,
  `ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0`,
  `ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true`,

  // pacotes_creditos
  `ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS badge TEXT`,
  `ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS cor_botao TEXT DEFAULT 'gray'`,
  `ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS preco_por_entrevista DECIMAL(10,2)`,
  `ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS preco_original DECIMAL(10,2)`,
  `ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS economia DECIMAL(5,2) DEFAULT 0`,

  // analistas
  `ALTER TABLE analistas ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT`,
  `ALTER TABLE analistas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,

  // empresas_recrutamento
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_lgpd BOOLEAN DEFAULT false`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_lgpd_data TIMESTAMPTZ`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_termos BOOLEAN DEFAULT false`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_termos_data TIMESTAMPTZ`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT false`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS responsavel_nome TEXT`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS responsavel_cargo TEXT`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS socio_funcao TEXT`,
  `ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS total_acessos_link INTEGER DEFAULT 0`,

  // candidatos_recrutamento
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS aceita_mudanca BOOLEAN`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS aceita_viajar BOOLEAN`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS estado_civil TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS tem_filhos BOOLEAN`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS quantidade_filhos INTEGER`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS idade_filhos TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS instagram TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS pretensao_salarial TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS valores_empresa TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS areas_interesse JSONB DEFAULT '[]'`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS objetivo_profissional TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS documento_url TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS documento_tipo TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS documento_verificado BOOLEAN DEFAULT false`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS perfil_disc_detalhado JSONB`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS perfil_valores JSONB`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS perfil_natural TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS disc_completado_em TIMESTAMPTZ`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS disc_resultado_json JSONB`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade INTEGER DEFAULT 0`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade_score INTEGER DEFAULT 0`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade_nivel TEXT DEFAULT 'baixa'`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade_flags JSONB DEFAULT '[]'`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS etapa_cadastro INTEGER DEFAULT 1`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS etapas_completadas INTEGER DEFAULT 0`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS etapas_json JSONB`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS recrutado_por_empresa_id UUID`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS recrutado_data TIMESTAMPTZ`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS indicado_por_empresa_id UUID`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS indicado_por_candidato_id UUID`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS slug_publico TEXT`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS curriculo_publico BOOLEAN DEFAULT false`,
  `ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS visualizacoes_perfil INTEGER DEFAULT 0`,

  // codigos_indicacao
  `ALTER TABLE codigos_indicacao ADD COLUMN IF NOT EXISTS creditos_ganhos DECIMAL(10,2) DEFAULT 0`,

  // Criar tabela candidatos_disc se não existir
  `CREATE TABLE IF NOT EXISTS candidatos_disc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    telefone_whatsapp TEXT,
    email TEXT,
    cargo_atual TEXT,
    empresa_instagram TEXT,
    perfil_natural TEXT,
    perfil_adaptado TEXT,
    perfil_tipo TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'pendente',
    analista_id UUID,
    confiabilidade_score INTEGER DEFAULT 100,
    confiabilidade_nivel TEXT DEFAULT 'ALTA',
    flags_detectadas JSONB DEFAULT '[]',
    tempo_total_segundos INTEGER,
    tempo_por_questao JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // RLS para candidatos_disc
  `ALTER TABLE candidatos_disc ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "disc_public_read" ON candidatos_disc`,
  `CREATE POLICY "disc_public_read" ON candidatos_disc FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "disc_insert" ON candidatos_disc`,
  `CREATE POLICY "disc_insert" ON candidatos_disc FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "disc_update" ON candidatos_disc`,
  `CREATE POLICY "disc_update" ON candidatos_disc FOR UPDATE USING (true)`,
  `DROP POLICY IF EXISTS "disc_delete" ON candidatos_disc`,
  `CREATE POLICY "disc_delete" ON candidatos_disc FOR DELETE USING (true)`,
];

async function executeSql(sql: string): Promise<boolean> {
  try {
    // Usar o endpoint pg/query do Supabase (requer Management API)
    // Como não temos acesso direto, vamos usar uma abordagem diferente

    // Tentar usar o RPC se existir uma função para isso
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_raw_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      return true;
    }

    // Se não funcionar, retornar false - o SQL precisa ser executado manualmente
    return false;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('\n========================================');
  console.log('🔧 CORRIGINDO SCHEMA DAS TABELAS');
  console.log('========================================\n');

  // Juntar todos os statements em um único SQL
  const fullSql = alterStatements.join(';\n') + ';';

  // Salvar SQL em arquivo para execução manual se necessário
  const sqlFile = path.join(__dirname, 'FIX_SCHEMA.sql');
  fs.writeFileSync(sqlFile, fullSql, 'utf-8');
  console.log(`📝 SQL salvo em: ${sqlFile}\n`);

  // Tentar executar via API
  console.log('🔌 Tentando executar via API...\n');

  let success = 0;
  let failed = 0;

  for (const sql of alterStatements) {
    const result = await executeSql(sql);
    if (result) {
      success++;
      console.log(`✅ ${sql.substring(0, 60)}...`);
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Resultados: ${success} sucesso, ${failed} falhas`);

  if (failed > 0) {
    console.log('\n⚠️ Alguns comandos falharam.');
    console.log('Execute o arquivo FIX_SCHEMA.sql no Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/lzrquwyvguxywvlxsthj/sql/new');
  }
}

main().catch(console.error);
