// Script para verificar o histórico de migrations
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'db.lzrquwyvguxywvlxsthj.supabase.co',
  port: 5432,
  user: 'cli_login_postgres',
  password: 'knzjDtdDOrvItLslnspBTHaoyAOZoYkl',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('\n========================================');
  console.log('🔍 VERIFICANDO HISTÓRICO DE MIGRATIONS');
  console.log('========================================\n');

  try {
    await client.connect();
    console.log('✅ Conectado!\n');

    // Verificar migrations
    const result = await client.query(`
      SELECT version, name
      FROM supabase_migrations.schema_migrations
      ORDER BY version
    `);

    console.log('📋 MIGRATIONS REGISTRADAS:');
    for (const row of result.rows) {
      console.log(`  - ${row.version}: ${row.name}`);
    }

    console.log(`\n Total: ${result.rows.length} migrations`);

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
