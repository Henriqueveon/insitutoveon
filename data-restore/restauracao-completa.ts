// Script de restauração completa do banco de dados VEON
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
  auth: { autoRefreshToken: false, persistSession: false }
});

// =====================================================
// DADOS PARA RESTAURAR
// =====================================================

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
    cpf_cnpj: '63436470000112'
  }
];

const profiles = [
  { id: '7e192772-3e0e-4bd5-9a94-f7208fd35dae', nome_completo: 'Henrique Alves', cargo: 'Usuário' },
  { id: '4c389ba3-49ba-44a2-a1e8-32fd1f1d32a5', nome_completo: 'veonmidias@gmail.com', cargo: 'Usuário' },
  { id: 'ea277535-ee8d-4cb6-bb70-0c87a25df4a8', nome_completo: 'institutoveon@gmail.com', cargo: 'Usuário' },
  { id: '2c581912-d70c-4845-9100-09665a46238f', nome_completo: 'rodrigueskamilyvitoria2003@gmail.com', cargo: 'Usuário' },
  { id: '48e0636d-1643-4f08-8193-5f5544403f04', nome_completo: 'kariny817@gmail.com', cargo: 'Usuário' },
  { id: '14df62d7-9c5f-40e3-ba54-5afc981e708d', nome_completo: 'vitor.parmanhani@gmail.com', cargo: 'Usuário' },
  { id: 'd6bb2a06-5fff-4683-9822-0d7cbb08229f', nome_completo: 'ninobr112@gmail.com', cargo: 'Usuário' },
  { id: 'e0f4e438-ce7c-4265-bf6a-ca8747dbb2cb', nome_completo: 'rafaelbonoldi1074@gmail.com', cargo: 'Usuário' }
];

const empresas = [
  {
    id: 'a52b073d-5d4b-48ab-b5f3-c3202491a891',
    cnpj: '51.065.648/0001-87',
    razao_social: 'INSTITUTO VEON LTDA',
    nome_fantasia: 'INSTITUTO VEON',
    situacao_cadastral: 'ATIVA',
    natureza_juridica: 'Sociedade Empresária Limitada',
    porte: 'MICRO EMPRESA',
    capital_social: 5000.00,
    logradouro: 'VISCONDE DE GUARAPUAVA',
    numero: '2214',
    complemento: 'APT 301',
    bairro: 'CENTRO',
    cidade: 'CASCAVEL',
    estado: 'PR',
    cep: '85801160',
    telefone_empresa: '4598038455',
    socio_nome: 'Henrique Alves',
    socio_cpf: '08337947950',
    socio_email: 'henriquealves01648@gmail.com',
    socio_telefone: '45998116723',
    senha_hash: 'Eufaturo1M$',
    creditos: 0.00,
    aceite_termos: true,
    aceite_lgpd: true,
    status: 'ativo',
    segmento: 'Educação',
    tempo_mercado: '1 a 3 anos',
    num_colaboradores: '11 a 50',
    site_url: 'institutoveon.com',
    instagram_empresa: 'institutoveon',
    sobre_empresa: 'teste 123',
    diferenciais: '["Bonificação por Metas","Cozinha/Refeitório","Estacionamento","Horário Flexível","Treinamentos Profissionalizantes","Plano de Carreira","Mentoria","Ambiente Descontraído","Confraternizações","Eventos de Integração"]',
    porque_trabalhar: 'teste 123456',
    socio_funcao: 'socio_proprietario',
    verificado: false,
    cadastro_completo: true
  },
  {
    id: 'de2deb53-3063-4be5-b353-8cc3e93d9687',
    cnpj: '62.542.602/0001-28',
    razao_social: '62.542.602 RAFAEL JOSE BONOLDI',
    nome_fantasia: '62.542.602 RAFAEL JOSE BONOLDI',
    situacao_cadastral: 'ATIVA',
    natureza_juridica: 'Empresário (Individual)',
    porte: 'MICRO EMPRESA',
    capital_social: 2000.00,
    logradouro: 'JENUINO REBELLATO',
    numero: '2119',
    bairro: 'FLORESTA',
    cidade: 'CASCAVEL',
    estado: 'PR',
    cep: '85814512',
    telefone_empresa: '4591311810',
    socio_nome: 'Rafael Bonoldi',
    socio_cpf: '01207621960',
    socio_email: 'rafaelbonoldi1074@gmail.com',
    socio_telefone: '45991311810',
    senha_hash: 'Novasenha123',
    creditos: 0.00,
    aceite_termos: true,
    aceite_lgpd: true,
    status: 'ativo',
    socio_funcao: 'socio_proprietario',
    verificado: false,
    cadastro_completo: true
  }
];

const vagas = [
  {
    id: 'a81a9148-3b13-425b-9dd5-59b019f5ce26',
    empresa_id: 'a52b073d-5d4b-48ab-b5f3-c3202491a891',
    titulo: 'Vendedor Closer',
    descricao: 'Fazer fechamento de vendas on-line.',
    cidade: 'Cascavel',
    estado: 'PR',
    status: 'ativa',
    faixa_salarial: '2500_4000'
  },
  {
    id: '699c49b0-1cfc-42f2-80f4-47abc5eeb590',
    empresa_id: 'a52b073d-5d4b-48ab-b5f3-c3202491a891',
    titulo: 'Social Midia',
    descricao: 'Vaga para jovem iniciando no mercado de trabalho.',
    cidade: 'Cascavel',
    estado: 'PR',
    status: 'ativa',
    faixa_salarial: '1500_2500'
  }
];

const candidatos = [
  {
    id: 'b78c93f9-c7c3-4ebe-b457-3f670ab51621',
    nome: 'Karine Cristina da Cruz',
    nome_completo: 'Karine Cristina da Cruz',
    telefone: '45998614321',
    email: 'kariny817@gmail.com',
    status: 'disponivel',
    aceite_termos: true,
    aceite_lgpd: true,
    auth_user_id: '48e0636d-1643-4f08-8193-5f5544403f04',
    slug_publico: 'arine-ristina-da-ruz-131695',
    curriculo_publico: true
  },
  {
    id: '06453022-1e0a-455b-ba10-de9e5317f061',
    nome: 'NICHOLAS BATISTA BEZERRA',
    nome_completo: 'NICHOLAS BATISTA BEZERRA',
    telefone: '45998038455',
    email: 'ninobr112@gmail.com',
    status: 'disponivel',
    aceite_termos: true,
    aceite_lgpd: true,
    auth_user_id: 'd6bb2a06-5fff-4683-9822-0d7cbb08229f',
    slug_publico: '-7d363d',
    curriculo_publico: true
  },
  {
    id: '37cafc92-58cf-463c-9e68-b59262e9910f',
    nome: 'Vitor Hugo de carvalho parmanhani',
    nome_completo: 'Vitor Hugo de carvalho parmanhani',
    data_nascimento: '2006-08-14',
    cpf: '13354007966',
    telefone: '44991716176',
    email: 'vitor.parmanhani@gmail.com',
    estado: 'PR',
    cidade: 'Jesuítas',
    bairro: 'Centro',
    esta_trabalhando: true,
    ultima_empresa: 'Concretas',
    ultimo_cargo: 'Auxiliar de Produção',
    areas_experiencia: '["outros"]',
    anos_experiencia: 4,
    escolaridade: 'medio_incompleto',
    estado_civil: 'casado',
    sexo: 'masculino',
    status: 'disponivel',
    aceite_termos: true,
    aceite_lgpd: true,
    auth_user_id: '14df62d7-9c5f-40e3-ba54-5afc981e708d',
    slug_publico: 'itor-ugo-de-carvalho-parmanhani-844b4e',
    curriculo_publico: true
  },
  {
    id: 'df963026-8f16-477f-9663-71db1f10f0cb',
    nome: 'Kamily Vitória Rodrigues',
    nome_completo: 'Kamily Vitória Rodrigues',
    data_nascimento: '2003-09-11',
    cpf: '12983648923',
    telefone: '45999862437',
    email: 'rodrigueskamilyvitoria2003@gmail.com',
    estado: 'PR',
    bairro: 'São Cristóvão',
    esta_trabalhando: false,
    ultima_empresa: 'RJS Utilidades LTDA',
    ultimo_cargo: 'Vendedora',
    areas_experiencia: '["vendas"]',
    anos_experiencia: 1,
    escolaridade: 'medio_incompleto',
    estado_civil: 'solteiro',
    sexo: 'feminino',
    status: 'disponivel',
    aceite_termos: true,
    aceite_lgpd: true,
    auth_user_id: '2c581912-d70c-4845-9100-09665a46238f',
    slug_publico: 'amily-itoria-odrigues-83a14a',
    curriculo_publico: true
  },
  {
    id: 'fc275cf2-860e-4271-ae0d-0276b1cf0005',
    nome: 'Henrique Alves',
    nome_completo: 'Henrique Alves',
    data_nascimento: '1993-11-12',
    cpf: '08337947950',
    telefone: '45998116722',
    email: 'henriquealves01648@gmail.com',
    estado: 'PR',
    cidade: 'Cascavel',
    bairro: 'Centro',
    esta_trabalhando: false,
    ultima_empresa: 'Instituto veon',
    ultimo_cargo: 'Vendedor',
    anos_experiencia: 15,
    escolaridade: 'fundamental',
    estado_civil: 'casado',
    instagram: 'Henriquea',
    pretensao_salarial: '2500_3000',
    objetivo_profissional: 'Aprender e crescer',
    perfil_disc: 'I',
    cadastro_completo: true,
    sexo: 'masculino',
    status: 'disponivel',
    aceite_termos: true,
    aceite_lgpd: true,
    auth_user_id: '1e73954a-eead-41bd-9ebb-e3168c2e9fd3',
    slug_publico: 'enrique-lves-1d1a69',
    curriculo_publico: true,
    confiabilidade_score: 100,
    confiabilidade_nivel: 'ALTA'
  }
];

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function main() {
  console.log('\n========================================');
  console.log('🔧 RESTAURAÇÃO COMPLETA DO BANCO VEON');
  console.log('========================================\n');

  let successCount = 0;
  let errorCount = 0;

  // 1. RESTAURAR ANALISTAS
  console.log('📝 Restaurando ANALISTAS...');
  for (const a of analistas) {
    const { error } = await supabase.from('analistas').upsert(a, { onConflict: 'id' });
    if (error) {
      console.log(`   ❌ ${a.nome}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${a.nome}`);
      successCount++;
    }
  }

  // 2. RESTAURAR PROFILES
  console.log('\n📝 Restaurando PROFILES...');
  for (const p of profiles) {
    const { error } = await supabase.from('profiles').upsert(p, { onConflict: 'id' });
    if (error) {
      console.log(`   ❌ ${p.nome_completo}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${p.nome_completo}`);
      successCount++;
    }
  }

  // 3. RESTAURAR EMPRESAS
  console.log('\n📝 Restaurando EMPRESAS...');
  for (const e of empresas) {
    const { error } = await supabase.from('empresas_recrutamento').upsert(e, { onConflict: 'id' });
    if (error) {
      console.log(`   ❌ ${e.nome_fantasia}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${e.nome_fantasia}`);
      successCount++;
    }
  }

  // 4. RESTAURAR VAGAS
  console.log('\n📝 Restaurando VAGAS...');
  for (const v of vagas) {
    const { error } = await supabase.from('vagas_recrutamento').upsert(v, { onConflict: 'id' });
    if (error) {
      console.log(`   ❌ ${v.titulo}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${v.titulo}`);
      successCount++;
    }
  }

  // 5. RESTAURAR CANDIDATOS
  console.log('\n📝 Restaurando CANDIDATOS...');
  for (const c of candidatos) {
    const { error } = await supabase.from('candidatos_recrutamento').upsert(c, { onConflict: 'id' });
    if (error) {
      console.log(`   ❌ ${c.nome_completo}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${c.nome_completo}`);
      successCount++;
    }
  }

  // VERIFICAÇÃO FINAL
  console.log('\n========================================');
  console.log('📊 VERIFICAÇÃO FINAL');
  console.log('========================================\n');

  const tables = ['analistas', 'profiles', 'empresas_recrutamento', 'vagas_recrutamento', 'candidatos_recrutamento'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log(`   ${table}: ${count} registros`);
    } else {
      console.log(`   ${table}: ERRO - ${error.message}`);
    }
  }

  console.log('\n========================================');
  console.log(`✅ Sucesso: ${successCount} | ❌ Erros: ${errorCount}`);
  console.log('========================================\n');
}

main().catch(console.error);
