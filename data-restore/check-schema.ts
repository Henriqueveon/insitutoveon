// Script para verificar o schema das tabelas existentes
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  port: 5432,
  user: 'cli_login_postgres.lzrquwyvguxywvlxsthj',
  password: 'OtaLNjJbHgZkmPbEcLSgCpsSGBkFKjSX',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('\n========================================');
  console.log('🔍 VERIFICANDO SCHEMA DAS TABELAS');
  console.log('========================================\n');

  try {
    await client.connect();
    console.log('✅ Conectado!\n');

    // Listar todas as tabelas do schema public
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 TABELAS EXISTENTES:');
    for (const row of tablesResult.rows) {
      console.log(`  - ${row.table_name}`);
    }

    // Verificar colunas de cada tabela importante
    const tablesToCheck = [
      'diferenciais_empresa',
      'cidades_coordenadas',
      'pacotes_creditos',
      'analistas',
      'empresas_recrutamento',
      'candidatos_recrutamento',
      'candidatos_disc',
      'codigos_indicacao'
    ];

    for (const table of tablesToCheck) {
      console.log(`\n📊 ${table.toUpperCase()}:`);

      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      if (columnsResult.rows.length === 0) {
        console.log('  ❌ TABELA NÃO EXISTE');
      } else {
        columnsResult.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
      }
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
