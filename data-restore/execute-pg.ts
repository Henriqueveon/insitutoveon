// Script para executar SQL diretamente no PostgreSQL
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Conexão com o banco Supabase via pooler (modo session)
// Pooler URL: postgres://postgres.lzrquwyvguxywvlxsthj:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
const client = new Client({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543, // Porta do pooler para session mode
  user: 'postgres.lzrquwyvguxywvlxsthj',
  password: process.env.SUPABASE_DB_PASSWORD || '',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

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

if (!process.env.SUPABASE_DB_PASSWORD) {
  console.log('\\n❌ SUPABASE_DB_PASSWORD não configurada!');
  console.log('Você precisa configurar a senha do banco no arquivo .env.restore');
  console.log('A senha pode ser encontrada em: Dashboard > Settings > Database > Connection string');
  process.exit(1);
}

async function main() {
  console.log('\n========================================');
  console.log('🔧 EXECUTANDO SQL NO POSTGRESQL');
  console.log('========================================\n');

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!\n');

    const sqlFile = path.join(__dirname, 'FIX_SCHEMA.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Dividir em statements individuais
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    console.log(`📝 ${statements.length} statements para executar\n`);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      try {
        await client.query(stmt);
        success++;
        process.stdout.write('✅');
      } catch (error: any) {
        failed++;
        process.stdout.write('❌');
        errors.push(`Statement ${i + 1}: ${error.message}`);
      }
    }

    console.log(`\n\n📊 Resultados: ${success} sucesso, ${failed} falhas`);

    if (errors.length > 0) {
      console.log('\n⚠️ Primeiros 15 erros:');
      errors.slice(0, 15).forEach(e => console.log(`  - ${e}`));
    }

    console.log('\n✅ Schema atualizado!');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão fechada.');
  }
}

main().catch(console.error);
