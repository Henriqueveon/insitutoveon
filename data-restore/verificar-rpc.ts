// Script para verificar se as funções RPC existem
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

async function main() {
  console.log('\n========================================');
  console.log('🔍 VERIFICANDO FUNÇÕES RPC');
  console.log('========================================\n');

  // Verificar cadastrar_candidato_rapido
  console.log('1. Testando cadastrar_candidato_rapido...');

  try {
    // Testar a função com dados fake (para verificar se ela existe)
    const { data: testCandidato, error: errCandidato } = await supabase.rpc('cadastrar_candidato_rapido', {
      p_nome_completo: 'TESTE_VERIFICACAO',
      p_telefone: '00000000000',
      p_email: 'teste.verificacao@teste.com',
      p_auth_user_id: null,
      p_codigo_indicacao: null
    });

    if (errCandidato) {
      console.log(`   ❌ Erro: ${errCandidato.message}`);
    } else {
      console.log('   ✅ Função existe e retornou:', JSON.stringify(testCandidato));

      // Se foi inserido com sucesso, remover o registro de teste
      if (testCandidato && testCandidato.success) {
        await supabase
          .from('candidatos_recrutamento')
          .delete()
          .eq('email', 'teste.verificacao@teste.com');
        console.log('   🗑️ Registro de teste removido');
      }
    }
  } catch (e: any) {
    console.log(`   ❌ Exceção: ${e.message}`);
  }

  // Verificar cadastrar_empresa
  console.log('\n2. Testando cadastrar_empresa...');

  try {
    const { data: testEmpresa, error: errEmpresa } = await supabase.rpc('cadastrar_empresa', {
      p_cnpj: '00000000000000',
      p_razao_social: 'TESTE VERIFICACAO LTDA',
      p_nome_fantasia: 'TESTE'
    });

    if (errEmpresa) {
      console.log(`   ❌ Erro: ${errEmpresa.message}`);
    } else {
      console.log('   ✅ Função existe e retornou:', JSON.stringify(testEmpresa));

      // Se foi inserido com sucesso, remover o registro de teste
      if (testEmpresa && testEmpresa.success) {
        await supabase
          .from('empresas_recrutamento')
          .delete()
          .eq('cnpj', '00000000000000');
        console.log('   🗑️ Registro de teste removido');
      }
    }
  } catch (e: any) {
    console.log(`   ❌ Exceção: ${e.message}`);
  }

  console.log('\n========================================');
  console.log('✅ VERIFICAÇÃO CONCLUÍDA');
  console.log('========================================\n');
}

main().catch(console.error);
