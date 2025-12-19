// Script para executar SQL no Supabase usando o endpoint SQL
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

const PROJECT_REF = 'lzrquwyvguxywvlxsthj';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SERVICE_KEY) {
  console.error('Service key not found!');
  process.exit(1);
}

async function runSqlViaApi(sql: string): Promise<any> {
  // Try the pg/query endpoint
  const response = await fetch(`https://${PROJECT_REF}.supabase.co/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function main() {
  console.log('\n========================================');
  console.log('🔧 EXECUTANDO SQL PARA FIX DO SCHEMA');
  console.log('========================================\n');

  const sqlFile = path.join(__dirname, 'FIX_SCHEMA.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  // Dividir em statements individuais e executar um por vez
  const statements = sql.split(';').filter(s => s.trim().length > 0);

  console.log(`📝 ${statements.length} statements para executar\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;

    try {
      await runSqlViaApi(stmt);
      success++;
      process.stdout.write(`✅`);
    } catch (error: any) {
      failed++;
      process.stdout.write(`❌`);
      // Se for erro de endpoint não encontrado, tentar outro método
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('\n\n⚠️ Endpoint SQL não disponível via API.');
        console.log('Você precisa executar o SQL manualmente no Dashboard:');
        console.log('https://supabase.com/dashboard/project/lzrquwyvguxywvlxsthj/sql/new\n');
        console.log('SQL a executar:\n');
        console.log('-------------------------------------------');
        console.log(sql.substring(0, 2000) + '...');
        console.log('-------------------------------------------');
        console.log(`\nArquivo completo: ${sqlFile}`);
        process.exit(0);
      }
    }
  }

  console.log(`\n\n📊 Resultados: ${success} sucesso, ${failed} falhas`);
}

main().catch(console.error);
