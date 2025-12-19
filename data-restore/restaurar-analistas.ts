// Script para restaurar os 3 analistas que sumiram
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.lzrquwyvguxywvlxsthj',
  password: 'ghOyPaKdMLRdKMaWNbRabRrlxTVmEPTS',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const analistas = [
  {
    id: '64764447-c15f-43d2-9ed9-66cf42febd09',
    nome: 'Ederson Marques',
    email: 'operacional1@assessoriaveon.com',
    senha: 'Eusouabussola',
    telefone: '45998386876',
    empresa: 'Instituto Veon LTDA',
    tipo: 'empresa',
    licencas_total: 10,
    licencas_usadas: 0,
    link_unico: 'f78ee024-487d-40b2-bc59-130bbbf55369',
    ativo: true,
    data_cadastro: '2025-12-12 21:03:53.386578+00',
    ultimo_acesso: null,
    cpf_cnpj: '11552198995'
  },
  {
    id: 'a500c828-599f-477a-a499-e8f35d5c4616',
    nome: 'Henrique Alves',
    email: 'henriquealves01648@gmail.com',
    senha: 'Eufaturo1M$',
    telefone: '45998116723',
    empresa: 'Instituto Veon LTDA',
    tipo: 'empresa',
    licencas_total: 10,
    licencas_usadas: 1,
    link_unico: '5804d05f-01b0-4f5c-883c-134f9aa45bfd',
    ativo: true,
    data_cadastro: '2025-12-12 20:48:20.822571+00',
    ultimo_acesso: '2025-12-12 21:20:26.697+00',
    cpf_cnpj: '51065648000187'
  },
  {
    id: 'aa146ce3-0083-4e99-adad-cc093dd165cd',
    nome: 'Hermes da Costa Marques',
    email: 'hermescostaconsultor@gmail.com',
    senha: 'alterar1234',
    telefone: '65996090833',
    empresa: 'MIND3',
    tipo: 'empresa',
    licencas_total: 10,
    licencas_usadas: 3,
    link_unico: 'adf44014-20c6-441f-be20-2ed8837b8469',
    ativo: true,
    data_cadastro: '2025-12-12 22:39:06.125442+00',
    ultimo_acesso: '2025-12-12 22:40:15.416+00',
    cpf_cnpj: '63436470000112'
  }
];

async function main() {
  console.log('\n========================================');
  console.log('🔧 RESTAURANDO 3 ANALISTAS');
  console.log('========================================\n');

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL!\n');

    // 1. Verificar estrutura da tabela analistas
    console.log('📋 Verificando estrutura da tabela analistas...\n');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'analistas'
      ORDER BY ordinal_position
    `);

    if (columns.rows.length === 0) {
      console.log('❌ Tabela analistas NÃO EXISTE!');
      console.log('Criando tabela analistas...\n');

      await client.query(`
        CREATE TABLE IF NOT EXISTS analistas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          senha TEXT NOT NULL,
          telefone TEXT,
          empresa TEXT,
          tipo TEXT DEFAULT 'empresa',
          licencas_total INTEGER DEFAULT 10,
          licencas_usadas INTEGER DEFAULT 0,
          link_unico UUID DEFAULT gen_random_uuid(),
          ativo BOOLEAN DEFAULT true,
          data_cadastro TIMESTAMPTZ DEFAULT NOW(),
          ultimo_acesso TIMESTAMPTZ,
          cpf_cnpj TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Enable RLS
      await client.query(`ALTER TABLE analistas ENABLE ROW LEVEL SECURITY`);

      // Create policies
      await client.query(`
        DROP POLICY IF EXISTS "analistas_public_read" ON analistas;
        CREATE POLICY "analistas_public_read" ON analistas FOR SELECT USING (true);
        DROP POLICY IF EXISTS "analistas_insert" ON analistas;
        CREATE POLICY "analistas_insert" ON analistas FOR INSERT WITH CHECK (true);
        DROP POLICY IF EXISTS "analistas_update" ON analistas;
        CREATE POLICY "analistas_update" ON analistas FOR UPDATE USING (true);
        DROP POLICY IF EXISTS "analistas_delete" ON analistas;
        CREATE POLICY "analistas_delete" ON analistas FOR DELETE USING (true);
      `);

      console.log('✅ Tabela analistas criada com sucesso!\n');
    } else {
      console.log('✅ Tabela analistas existe com colunas:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
      console.log('');
    }

    // 2. Verificar se os analistas já existem
    console.log('🔍 Verificando analistas existentes...\n');
    const existing = await client.query(`
      SELECT id, nome, email, ativo FROM analistas
      WHERE id IN ($1, $2, $3)
    `, [analistas[0].id, analistas[1].id, analistas[2].id]);

    console.log(`Encontrados: ${existing.rows.length} analistas\n`);
    existing.rows.forEach(row => {
      console.log(`   - ${row.nome} (${row.email}) - ativo: ${row.ativo}`);
    });

    // 3. Inserir/Atualizar os 3 analistas
    console.log('\n📝 Inserindo/Atualizando os 3 analistas...\n');

    for (const a of analistas) {
      try {
        // Try to get column list first
        const colCheck = await client.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'analistas'
        `);
        const existingCols = colCheck.rows.map(r => r.column_name);

        // Build dynamic insert based on existing columns
        const insertCols: string[] = [];
        const insertVals: any[] = [];
        const updateParts: string[] = [];
        let paramIdx = 1;

        const fieldMap: Record<string, any> = {
          id: a.id,
          nome: a.nome,
          email: a.email,
          senha: a.senha,
          telefone: a.telefone,
          empresa: a.empresa,
          tipo: a.tipo,
          licencas_total: a.licencas_total,
          licencas_usadas: a.licencas_usadas,
          link_unico: a.link_unico,
          ativo: a.ativo,
          data_cadastro: a.data_cadastro,
          ultimo_acesso: a.ultimo_acesso,
          cpf_cnpj: a.cpf_cnpj
        };

        for (const [col, val] of Object.entries(fieldMap)) {
          if (existingCols.includes(col)) {
            insertCols.push(col);
            insertVals.push(val);
            if (col !== 'id') {
              updateParts.push(`${col} = $${paramIdx}`);
            }
            paramIdx++;
          }
        }

        const sql = `
          INSERT INTO analistas (${insertCols.join(', ')})
          VALUES (${insertCols.map((_, i) => `$${i + 1}`).join(', ')})
          ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            email = EXCLUDED.email,
            senha = EXCLUDED.senha,
            telefone = EXCLUDED.telefone,
            empresa = EXCLUDED.empresa,
            tipo = EXCLUDED.tipo,
            licencas_total = EXCLUDED.licencas_total,
            licencas_usadas = EXCLUDED.licencas_usadas,
            link_unico = EXCLUDED.link_unico,
            ativo = true,
            updated_at = NOW()
        `;

        await client.query(sql, insertVals);
        console.log(`✅ ${a.nome} (${a.email}) - RESTAURADO`);
      } catch (err: any) {
        console.log(`❌ ${a.nome}: ${err.message}`);
      }
    }

    // 4. Verificar resultado final
    console.log('\n📊 VERIFICAÇÃO FINAL:\n');
    const final = await client.query(`
      SELECT id, nome, email, empresa, ativo, licencas_total, licencas_usadas
      FROM analistas
      WHERE id IN ($1, $2, $3)
      ORDER BY nome
    `, [analistas[0].id, analistas[1].id, analistas[2].id]);

    console.log('┌────────────────────────────┬─────────────────────────────────────┬─────────┬──────────┐');
    console.log('│ Nome                       │ Email                               │ Ativo   │ Licenças │');
    console.log('├────────────────────────────┼─────────────────────────────────────┼─────────┼──────────┤');
    final.rows.forEach(row => {
      const nome = row.nome.padEnd(26).slice(0, 26);
      const email = row.email.padEnd(35).slice(0, 35);
      const ativo = row.ativo ? '✅ Sim ' : '❌ Não ';
      const lic = `${row.licencas_usadas}/${row.licencas_total}`.padEnd(8);
      console.log(`│ ${nome} │ ${email} │ ${ativo} │ ${lic} │`);
    });
    console.log('└────────────────────────────┴─────────────────────────────────────┴─────────┴──────────┘');

    console.log('\n========================================');
    console.log('✅ RESTAURAÇÃO CONCLUÍDA!');
    console.log('========================================\n');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
