// Script para restaurar os 3 analistas usando Supabase Client
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_KEY não configurada!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
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
    data_cadastro: '2025-12-12T21:03:53.386578+00:00',
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
    data_cadastro: '2025-12-12T20:48:20.822571+00:00',
    ultimo_acesso: '2025-12-12T21:20:26.697+00:00',
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
    data_cadastro: '2025-12-12T22:39:06.125442+00:00',
    ultimo_acesso: '2025-12-12T22:40:15.416+00:00',
    cpf_cnpj: '63436470000112'
  }
];

async function main() {
  console.log('\n========================================');
  console.log('🔧 RESTAURANDO 3 ANALISTAS');
  console.log('========================================\n');

  // 1. Verificar se a tabela existe
  console.log('📋 Verificando tabela analistas...\n');

  const { data: existingData, error: checkError } = await supabase
    .from('analistas')
    .select('id, nome, email')
    .limit(1);

  if (checkError) {
    console.log('⚠️ Erro ao verificar tabela:', checkError.message);
    console.log('A tabela pode não existir ou não ter as colunas necessárias.\n');
  } else {
    console.log('✅ Tabela analistas existe!\n');
  }

  // 2. Inserir/Atualizar os 3 analistas
  console.log('📝 Inserindo/Atualizando os 3 analistas...\n');

  for (const a of analistas) {
    // Tentar upsert
    const { data, error } = await supabase
      .from('analistas')
      .upsert({
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
        cpf_cnpj: a.cpf_cnpj,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.log(`❌ ${a.nome}: ${error.message}`);

      // Try without columns that may not exist
      const { error: error2 } = await supabase
        .from('analistas')
        .upsert({
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
          ativo: a.ativo
        }, { onConflict: 'id' });

      if (error2) {
        console.log(`   Tentativa 2 também falhou: ${error2.message}`);
      } else {
        console.log(`✅ ${a.nome} (${a.email}) - RESTAURADO (sem campos extras)`);
      }
    } else {
      console.log(`✅ ${a.nome} (${a.email}) - RESTAURADO`);
    }
  }

  // 3. Verificar resultado final
  console.log('\n📊 VERIFICAÇÃO FINAL:\n');

  const { data: final, error: finalError } = await supabase
    .from('analistas')
    .select('id, nome, email, empresa, ativo, licencas_total, licencas_usadas')
    .in('id', analistas.map(a => a.id));

  if (finalError) {
    console.log('❌ Erro ao verificar:', finalError.message);
  } else if (final && final.length > 0) {
    console.log('┌────────────────────────────┬─────────────────────────────────────┬─────────┬──────────┐');
    console.log('│ Nome                       │ Email                               │ Ativo   │ Licenças │');
    console.log('├────────────────────────────┼─────────────────────────────────────┼─────────┼──────────┤');
    final.forEach(row => {
      const nome = (row.nome || '').padEnd(26).slice(0, 26);
      const email = (row.email || '').padEnd(35).slice(0, 35);
      const ativo = row.ativo ? '✅ Sim ' : '❌ Não ';
      const lic = `${row.licencas_usadas || 0}/${row.licencas_total || 10}`.padEnd(8);
      console.log(`│ ${nome} │ ${email} │ ${ativo} │ ${lic} │`);
    });
    console.log('└────────────────────────────┴─────────────────────────────────────┴─────────┴──────────┘');

    console.log(`\n✅ ${final.length} analistas encontrados no banco!`);
  } else {
    console.log('⚠️ Nenhum analista encontrado após restauração.');
    console.log('Pode ser necessário criar a tabela primeiro.');
  }

  console.log('\n========================================');
  console.log('✅ RESTAURAÇÃO CONCLUÍDA!');
  console.log('========================================\n');
}

main().catch(console.error);
