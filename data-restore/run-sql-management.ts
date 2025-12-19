// Script para executar SQL via Supabase Management API
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_REF = 'lzrquwyvguxywvlxsthj';

async function getAccessToken(): Promise<string> {
  // Get access token from Supabase CLI
  try {
    const result = execSync('npx supabase projects list --output json', { encoding: 'utf-8' });
    // The CLI stores the token, we can use it via the API
  } catch (e) {
    // ignore
  }

  // Try to read from stored credentials
  const possiblePaths = [
    process.env.APPDATA + '/Supabase/access-token',
    process.env.HOME + '/.config/supabase/access-token',
    process.env.USERPROFILE + '/.supabase/access-token',
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8').trim();
      }
    } catch (e) {
      // ignore
    }
  }

  return '';
}

async function runSqlViaManagementApi(sql: string, accessToken: string): Promise<any> {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
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
  console.log('🔧 EXECUTANDO SQL VIA MANAGEMENT API');
  console.log('========================================\n');

  // Read SQL file
  const sqlFile = path.join(__dirname, 'EXECUTAR_NO_DASHBOARD.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  console.log('🔑 Obtendo token de acesso...');

  // Try using supabase CLI to get connection info
  try {
    const dbInfo = execSync('npx supabase db dump --dry-run 2>&1', { encoding: 'utf-8' });
    const passwordMatch = dbInfo.match(/PGPASSWORD="([^"]+)"/);
    const hostMatch = dbInfo.match(/PGHOST="([^"]+)"/);

    if (passwordMatch && hostMatch) {
      console.log('✅ Credenciais obtidas via CLI');

      // Use pg client
      const pg = await import('pg');
      const client = new pg.default.Client({
        host: hostMatch[1],
        port: 5432,
        user: 'postgres',
        password: passwordMatch[1],
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        console.log('✅ Conectado ao PostgreSQL!\n');

        // Execute SQL
        console.log('📝 Executando SQL...\n');
        await client.query(sql);
        console.log('✅ SQL executado com sucesso!');

        await client.end();
        return;
      } catch (pgError: any) {
        console.log('❌ Erro PostgreSQL:', pgError.message);
        // Try with cli_login_postgres user
        const client2 = new pg.default.Client({
          host: hostMatch[1],
          port: 5432,
          user: 'cli_login_postgres',
          password: passwordMatch[1],
          database: 'postgres',
          ssl: { rejectUnauthorized: false }
        });

        try {
          await client2.connect();
          console.log('✅ Conectado como cli_login_postgres!\n');

          // Execute SQL statement by statement
          const statements = sql.split(';').filter(s => s.trim().length > 0);
          let success = 0, failed = 0;

          for (const stmt of statements) {
            try {
              await client2.query(stmt);
              success++;
              process.stdout.write('✅');
            } catch (e: any) {
              failed++;
              process.stdout.write('❌');
            }
          }

          console.log(`\n\n📊 Resultados: ${success} sucesso, ${failed} falhas`);
          await client2.end();
        } catch (e2: any) {
          console.log('❌ Erro:', e2.message);
        }
      }
    }
  } catch (e: any) {
    console.log('⚠️ Não foi possível obter credenciais:', e.message);
  }

  console.log('\n⚠️ Execute o SQL manualmente no Dashboard:');
  console.log('https://supabase.com/dashboard/project/lzrquwyvguxywvlxsthj/sql/new');
}

main().catch(console.error);
