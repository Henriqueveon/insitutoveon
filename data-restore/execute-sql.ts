// Script para executar SQL no Supabase usando a API
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lzrquwyvguxywvlxsthj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_KEY não configurada!');
  console.log('Configure: $env:SUPABASE_SERVICE_KEY="sua_key_aqui"');
  process.exit(1);
}

async function executeSql(sql: string): Promise<any> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    // Se a função RPC não existir, vamos usar o endpoint de query direto
    const pgResponse = await fetch(`${SUPABASE_URL}/pg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!pgResponse.ok) {
      throw new Error(`HTTP ${pgResponse.status}: ${await pgResponse.text()}`);
    }
    return pgResponse.json();
  }

  return response.json();
}

async function main() {
  console.log('\n========================================');
  console.log('🔧 EXECUTANDO SQL NO SUPABASE');
  console.log('========================================\n');

  const sqlFile = path.join(__dirname, 'EXECUTAR_NO_DASHBOARD.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  // Dividir em statements individuais
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 ${statements.length} statements para executar\n`);

  // Usar o Supabase client diretamente com query
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Testar conexão primeiro
  console.log('🔌 Testando conexão...');
  const { data: testData, error: testError } = await supabase
    .from('_test_connection')
    .select('*')
    .limit(1);

  // Ignorar erro de tabela não existir - é esperado
  if (testError && !testError.message.includes('does not exist')) {
    console.log('⚠️ Aviso de conexão:', testError.message);
  }

  console.log('✅ Conexão OK!\n');

  // Executar cada statement importante manualmente via Supabase
  // Como não temos acesso direto ao SQL, vamos criar as tabelas via API se possível

  // Verificar se tabelas já existem
  console.log('🔍 Verificando tabelas existentes...\n');

  const tablesToCheck = [
    'diferenciais_empresa',
    'cidades_coordenadas',
    'pacotes_creditos',
    'analistas',
    'empresas_recrutamento',
    'candidatos_recrutamento',
    'candidatos_disc',
    'codigos_indicacao',
    'entrevistas_recrutamento'
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: existe (${data?.length || 0} registro(s) de teste)`);
    }
  }

  console.log('\n========================================');
  console.log('📋 RESULTADO');
  console.log('========================================\n');
  console.log('As tabelas precisam ser criadas via SQL Editor no Dashboard.');
  console.log('URL: https://supabase.com/dashboard/project/lzrquwyvguxywvlxsthj/sql/new');
  console.log('\nOU use a conexão PostgreSQL direta (psql).');
}

main().catch(console.error);
