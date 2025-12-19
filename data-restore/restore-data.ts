// =====================================================
// SCRIPT DE RESTAURAÇÃO DE DADOS - VEON Recrutamento
// Importa dados dos CSVs exportados para o Supabase
// =====================================================
//
// COMO EXECUTAR:
// npx tsx data-restore/restore-data.ts
// =====================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env.restore se existir
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

// =====================================================
// CONFIGURAÇÃO DO SUPABASE
// =====================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lzrquwyvguxywvlxsthj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_KEY não configurada!');
  console.log('Configure a variável de ambiente SUPABASE_SERVICE_KEY com a chave de serviço do Supabase');
  console.log('Você pode encontrar em: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Parseia um arquivo CSV com delimitador ;
 */
function parseCSV(content: string, delimiter = ';'): Record<string, any>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const data: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse respeitando aspas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && (j === 0 || line[j - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      let value: any = values[index]?.trim() || null;

      // Remove aspas externas
      if (value && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      // Converter valores especiais
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value === '' || value === 'null' || value === undefined) value = null;

      // Tentar parsear JSON
      if (value && typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          value = JSON.parse(value.replace(/\\"/g, '"'));
        } catch (e) {
          // Manter como string se não for JSON válido
        }
      }

      row[header] = value;
    });

    data.push(row);
  }

  return data;
}

/**
 * Lê um arquivo CSV
 */
function readCSV(filename: string): Record<string, any>[] {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Arquivo não encontrado: ${filename}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseCSV(content);
}

/**
 * Log colorido
 */
function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m'
  };
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️'
  };
  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

// =====================================================
// FUNÇÕES DE IMPORTAÇÃO
// =====================================================

/**
 * Importa diferenciais_empresa
 */
async function importarDiferenciais() {
  log('Importando diferenciais_empresa...', 'info');
  const data = readCSV('diferenciais_empresa.csv');

  if (data.length === 0) {
    log('Nenhum diferencial encontrado', 'warn');
    return;
  }

  // Limpar tabela existente
  await supabase.from('diferenciais_empresa').delete().neq('id', 0);

  for (const row of data) {
    const { error } = await supabase
      .from('diferenciais_empresa')
      .upsert({
        id: parseInt(row.id),
        categoria: row.categoria,
        nome: row.nome,
        icone: row.icone,
        ordem: parseInt(row.ordem) || 0,
        ativo: row.ativo
      }, { onConflict: 'id' });

    if (error) console.error(`Erro diferencial ${row.id}:`, error.message);
  }

  log(`${data.length} diferenciais importados`, 'success');
}

/**
 * Importa cidades_coordenadas
 */
async function importarCidades() {
  log('Importando cidades_coordenadas...', 'info');
  const data = readCSV('cidades_coordenadas.csv');

  if (data.length === 0) {
    log('Nenhuma cidade encontrada', 'warn');
    return;
  }

  // Limpar tabela existente
  await supabase.from('cidades_coordenadas').delete().neq('id', 0);

  for (const row of data) {
    const { error } = await supabase
      .from('cidades_coordenadas')
      .upsert({
        id: parseInt(row.id),
        cidade: row.cidade?.trim(),
        estado: row.estado?.trim(),
        latitude: parseFloat(row.latitude?.toString().trim()) || null,
        longitude: parseFloat(row.longitude?.toString().trim()) || null,
        populacao: parseInt(row.populacao) || null
      }, { onConflict: 'id' });

    if (error) console.error(`Erro cidade ${row.id}:`, error.message);
  }

  log(`${data.length} cidades importadas`, 'success');
}

/**
 * Importa pacotes_creditos
 */
async function importarPacotes() {
  log('Importando pacotes_creditos...', 'info');
  const data = readCSV('pacotes_creditos.csv');

  if (data.length === 0) {
    log('Nenhum pacote encontrado', 'warn');
    return;
  }

  for (const row of data) {
    const { error } = await supabase
      .from('pacotes_creditos')
      .upsert({
        id: row.id,
        nome: row.nome,
        quantidade_entrevistas: parseInt(row.quantidade_entrevistas),
        preco: parseFloat(row.preco),
        preco_por_entrevista: parseFloat(row.preco_por_entrevista) || null,
        preco_original: parseFloat(row.preco_original) || null,
        economia: parseFloat(row.economia) || 0,
        destaque: row.destaque,
        badge: row.badge || null,
        cor_botao: row.cor_botao || 'gray',
        ativo: row.ativo,
        ordem: parseInt(row.ordem) || 0,
        created_at: row.created_at
      }, { onConflict: 'id' });

    if (error) console.error(`Erro pacote ${row.id}:`, error.message);
  }

  log(`${data.length} pacotes importados`, 'success');
}

/**
 * Importa analistas
 */
async function importarAnalistas() {
  log('Importando analistas...', 'info');
  const data = readCSV('analistas.csv');

  if (data.length === 0) {
    log('Nenhum analista encontrado', 'warn');
    return;
  }

  for (const row of data) {
    const { error } = await supabase
      .from('analistas')
      .upsert({
        id: row.id,
        nome: row.nome,
        email: row.email?.toLowerCase(),
        senha: row.senha, // Senha em plain text do CSV
        telefone: row.telefone,
        empresa: row.empresa,
        tipo: row.tipo || 'empresa',
        licencas_total: parseInt(row.licencas_total) || 10,
        licencas_usadas: parseInt(row.licencas_usadas) || 0,
        link_unico: row.link_unico,
        ativo: row.ativo,
        data_cadastro: row.data_cadastro,
        ultimo_acesso: row.ultimo_acesso || null,
        cpf_cnpj: row.cpf_cnpj,
        updated_at: row.updated_at
      }, { onConflict: 'id' });

    if (error) console.error(`Erro analista ${row.email}:`, error.message);
  }

  log(`${data.length} analistas importados`, 'success');
  return data;
}

/**
 * Importa empresas_recrutamento
 */
async function importarEmpresas() {
  log('Importando empresas_recrutamento...', 'info');
  const data = readCSV('empresas_recrutamento.csv');

  if (data.length === 0) {
    log('Nenhuma empresa encontrada', 'warn');
    return;
  }

  for (const row of data) {
    const { error } = await supabase
      .from('empresas_recrutamento')
      .upsert({
        id: row.id,
        cnpj: row.cnpj,
        razao_social: row.razao_social,
        nome_fantasia: row.nome_fantasia,
        situacao_cadastral: row.situacao_cadastral,
        data_abertura: row.data_abertura,
        natureza_juridica: row.natureza_juridica,
        porte: row.porte,
        capital_social: parseFloat(row.capital_social) || null,
        logradouro: row.logradouro,
        numero: row.numero,
        complemento: row.complemento,
        bairro: row.bairro,
        cidade: row.cidade,
        estado: row.estado,
        cep: row.cep,
        telefone_empresa: row.telefone_empresa,
        email_empresa: row.email_empresa,
        socio_nome: row.socio_nome,
        socio_cpf: row.socio_cpf,
        socio_email: row.socio_email?.toLowerCase(),
        socio_telefone: row.socio_telefone,
        socio_foto_url: row.socio_foto_url,
        senha_hash: row.senha_hash, // Senha em plain text
        creditos: parseFloat(row.creditos) || 0,
        cartao_token: row.cartao_token,
        aceite_termos: row.aceite_termos,
        aceite_termos_data: row.aceite_termos_data,
        aceite_lgpd: row.aceite_lgpd,
        aceite_lgpd_data: row.aceite_lgpd_data,
        status: row.status || 'ativo',
        created_at: row.created_at,
        updated_at: row.updated_at,
        logo_url: row.logo_url,
        segmento: row.segmento,
        tempo_mercado: row.tempo_mercado,
        num_colaboradores: row.num_colaboradores,
        site_url: row.site_url,
        instagram_empresa: row.instagram_empresa,
        sobre_empresa: row.sobre_empresa,
        diferenciais: row.diferenciais,
        porque_trabalhar: row.porque_trabalhar,
        fotos_ambiente: row.fotos_ambiente,
        link_recrutamento: row.link_recrutamento,
        total_acessos_link: parseInt(row.total_acessos_link) || 0,
        auth_user_id: row.auth_user_id || null, // Será atualizado depois
        responsavel_nome: row.responsavel_nome,
        responsavel_cargo: row.responsavel_cargo,
        socio_funcao: row.socio_funcao,
        verificado: row.verificado,
        cadastro_completo: row.cadastro_completo
      }, { onConflict: 'id' });

    if (error) console.error(`Erro empresa ${row.cnpj}:`, error.message);
  }

  log(`${data.length} empresas importadas`, 'success');
  return data;
}

/**
 * Importa candidatos_recrutamento
 */
async function importarCandidatos() {
  log('Importando candidatos_recrutamento...', 'info');
  const data = readCSV('candidatos_recrutamento.csv');

  if (data.length === 0) {
    log('Nenhum candidato encontrado', 'warn');
    return;
  }

  for (const row of data) {
    const { error } = await supabase
      .from('candidatos_recrutamento')
      .upsert({
        id: row.id,
        nome_completo: row.nome_completo,
        data_nascimento: row.data_nascimento,
        cpf: row.cpf,
        telefone: row.telefone,
        email: row.email?.toLowerCase(),
        estado: row.estado,
        cidade: row.cidade,
        bairro: row.bairro,
        cep: row.cep,
        logradouro: row.logradouro,
        numero: row.numero,
        complemento: row.complemento,
        sexo: row.sexo,
        esta_trabalhando: row.esta_trabalhando,
        salario_atual: parseFloat(row.salario_atual) || null,
        regime_atual: row.regime_atual,
        motivo_busca_oportunidade: row.motivo_busca_oportunidade,
        disponibilidade_inicio: row.disponibilidade_inicio,
        regime_preferido: row.regime_preferido,
        ultima_empresa: row.ultima_empresa,
        ultimo_cargo: row.ultimo_cargo,
        tempo_ultima_empresa: row.tempo_ultima_empresa,
        motivo_saida: row.motivo_saida,
        areas_experiencia: row.areas_experiencia,
        anos_experiencia: parseInt(row.anos_experiencia) || null,
        escolaridade: row.escolaridade,
        curso: row.curso,
        instituicao: row.instituicao,
        ano_conclusao: row.ano_conclusao,
        certificacoes: row.certificacoes,
        possui_veiculo: row.possui_veiculo,
        possui_cnh: row.possui_cnh,
        categoria_cnh: row.categoria_cnh,
        disponibilidade_horario: row.disponibilidade_horario,
        aceita_viajar: row.aceita_viajar,
        aceita_mudanca: row.aceita_mudanca,
        estado_civil: row.estado_civil,
        tem_filhos: row.tem_filhos,
        quantidade_filhos: parseInt(row.quantidade_filhos) || null,
        idade_filhos: row.idade_filhos,
        instagram: row.instagram,
        pretensao_salarial: row.pretensao_salarial,
        valores_empresa: row.valores_empresa,
        areas_interesse: row.areas_interesse,
        objetivo_profissional: row.objetivo_profissional,
        foto_url: row.foto_url,
        video_url: row.video_url,
        video_duracao: row.video_duracao,
        video_tipo: row.video_tipo,
        documento_url: row.documento_url,
        documento_tipo: row.documento_tipo,
        documento_verificado: row.documento_verificado,
        curriculo_url: row.curriculo_url,
        teste_disc_id: row.teste_disc_id,
        perfil_disc: row.perfil_disc,
        perfil_disc_detalhado: row.perfil_disc_detalhado,
        perfil_valores: row.perfil_valores,
        perfil_natural: row.perfil_natural,
        teste_disc_concluido: row.teste_disc_concluido,
        teste_disc_data: row.teste_disc_data,
        disc_completado_em: row.disc_completado_em,
        disc_resultado_json: row.disc_resultado_json,
        confiabilidade: parseInt(row.confiabilidade) || 0,
        confiabilidade_score: parseInt(row.confiabilidade_score) || 0,
        confiabilidade_nivel: row.confiabilidade_nivel || 'baixa',
        confiabilidade_flags: row.confiabilidade_flags,
        status: row.status || 'disponivel',
        etapa_atual: parseInt(row.etapa_atual) || 1,
        etapa_cadastro: parseInt(row.etapa_cadastro) || 1,
        etapas_completadas: parseInt(row.etapas_completadas) || 0,
        etapas_json: row.etapas_json,
        cadastro_completo: row.cadastro_completo,
        recrutado_por_empresa_id: row.recrutado_por_empresa_id,
        recrutado_data: row.recrutado_data,
        indicado_por_empresa_id: row.indicado_por_empresa_id,
        indicado_por_candidato_id: row.indicado_por_candidato_id,
        aceite_termos: row.aceite_termos,
        aceite_termos_data: row.aceite_termos_data,
        aceite_lgpd: row.aceite_lgpd,
        aceite_lgpd_data: row.aceite_lgpd_data,
        auth_user_id: row.auth_user_id || null, // Será atualizado depois
        slug_publico: row.slug_publico,
        curriculo_publico: row.curriculo_publico,
        visualizacoes_perfil: parseInt(row.visualizacoes_perfil) || 0,
        created_at: row.created_at,
        updated_at: row.updated_at
      }, { onConflict: 'id' });

    if (error) console.error(`Erro candidato ${row.email || row.id}:`, error.message);
  }

  log(`${data.length} candidatos importados`, 'success');
  return data;
}

/**
 * Importa candidatos_disc
 */
async function importarCandidatosDISC() {
  log('Importando candidatos_disc...', 'info');
  const data = readCSV('candidatos_disc.csv');

  if (data.length === 0) {
    log('Nenhum registro DISC encontrado', 'warn');
    return;
  }

  for (const row of data) {
    const { error } = await supabase
      .from('candidatos_disc')
      .upsert({
        id: row.id,
        nome_completo: row.nome_completo,
        telefone_whatsapp: row.telefone_whatsapp,
        email: row.email?.toLowerCase(),
        cargo_atual: row.cargo_atual,
        empresa_instagram: row.empresa_instagram,
        perfil_natural: row.perfil_natural,
        perfil_adaptado: row.perfil_adaptado,
        perfil_tipo: row.perfil_tipo,
        pdf_url: row.pdf_url,
        status: row.status || 'pendente',
        analista_id: row.analista_id,
        confiabilidade_score: parseInt(row.confiabilidade_score) || 100,
        confiabilidade_nivel: row.confiabilidade_nivel || 'ALTA',
        flags_detectadas: row.flags_detectadas,
        tempo_total_segundos: parseInt(row.tempo_total_segundos) || null,
        tempo_por_questao: row.tempo_por_questao,
        created_at: row.created_at,
        updated_at: row.updated_at
      }, { onConflict: 'id' });

    if (error) console.error(`Erro DISC ${row.nome_completo}:`, error.message);
  }

  log(`${data.length} registros DISC importados`, 'success');
  return data;
}

/**
 * Importa códigos de indicação
 */
async function importarCodigosIndicacao() {
  log('Importando codigos_indicacao...', 'info');
  const data = readCSV('codigos_indicacao.csv');

  if (data.length === 0) {
    log('Nenhum código de indicação encontrado', 'warn');
    return;
  }

  for (const row of data) {
    const { error } = await supabase
      .from('codigos_indicacao')
      .upsert({
        id: row.id,
        tipo_usuario: row.tipo_usuario,
        usuario_id: row.usuario_id,
        codigo: row.codigo,
        total_indicacoes: parseInt(row.total_indicacoes) || 0,
        creditos_ganhos: parseFloat(row.creditos_ganhos) || 0,
        ativo: row.ativo,
        created_at: row.created_at
      }, { onConflict: 'id' });

    if (error) console.error(`Erro código indicação ${row.codigo}:`, error.message);
  }

  log(`${data.length} códigos de indicação importados`, 'success');
}

/**
 * Cria usuários de autenticação no Supabase
 */
async function criarUsuariosAuth(analistas: any[], empresas: any[], candidatos: any[]) {
  log('Criando usuários de autenticação...', 'info');

  // Usuários a criar (combinando todos os dados)
  const usuariosParaCriar: { email: string; senha: string; nome: string; tipo: string; refId?: string }[] = [];

  // Analistas
  for (const a of analistas) {
    if (a.email && a.senha) {
      usuariosParaCriar.push({
        email: a.email.toLowerCase(),
        senha: a.senha,
        nome: a.nome,
        tipo: 'analista'
      });
    }
  }

  // Empresas
  for (const e of empresas) {
    if (e.socio_email && e.senha_hash) {
      // Verificar se já foi adicionado (mesmo email)
      if (!usuariosParaCriar.find(u => u.email === e.socio_email.toLowerCase())) {
        usuariosParaCriar.push({
          email: e.socio_email.toLowerCase(),
          senha: e.senha_hash,
          nome: e.socio_nome || e.nome_fantasia,
          tipo: 'empresa',
          refId: e.id
        });
      }
    }
  }

  // Candidatos (apenas os que já têm auth_user_id - já tinham conta)
  for (const c of candidatos) {
    if (c.email && c.auth_user_id) {
      // Verificar se já foi adicionado
      if (!usuariosParaCriar.find(u => u.email === c.email.toLowerCase())) {
        usuariosParaCriar.push({
          email: c.email.toLowerCase(),
          senha: 'Veon@2024', // Senha padrão para candidatos
          nome: c.nome_completo,
          tipo: 'candidato',
          refId: c.id
        });
      }
    }
  }

  log(`Criando ${usuariosParaCriar.length} usuários...`, 'info');

  const resultados: { email: string; userId?: string; error?: string }[] = [];

  for (const user of usuariosParaCriar) {
    try {
      // Criar usuário via Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.senha,
        email_confirm: true, // Marcar email como confirmado
        user_metadata: {
          nome_completo: user.nome,
          tipo: user.tipo
        }
      });

      if (error) {
        // Se o usuário já existe, tentar buscar o ID
        if (error.message.includes('already') || error.message.includes('exists')) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existing = existingUsers?.users?.find(u => u.email === user.email);
          if (existing) {
            resultados.push({ email: user.email, userId: existing.id });
            log(`Usuário já existe: ${user.email} (${existing.id})`, 'warn');

            // Atualizar referência na tabela
            if (user.tipo === 'empresa' && user.refId) {
              await supabase
                .from('empresas_recrutamento')
                .update({ auth_user_id: existing.id })
                .eq('id', user.refId);
            } else if (user.tipo === 'candidato' && user.refId) {
              await supabase
                .from('candidatos_recrutamento')
                .update({ auth_user_id: existing.id })
                .eq('id', user.refId);
            }
            continue;
          }
        }
        resultados.push({ email: user.email, error: error.message });
        log(`Erro criando ${user.email}: ${error.message}`, 'error');
        continue;
      }

      resultados.push({ email: user.email, userId: data.user?.id });
      log(`Usuário criado: ${user.email} (${data.user?.id})`, 'success');

      // Atualizar referência na tabela
      if (data.user?.id) {
        if (user.tipo === 'empresa' && user.refId) {
          await supabase
            .from('empresas_recrutamento')
            .update({ auth_user_id: data.user.id })
            .eq('id', user.refId);
        } else if (user.tipo === 'candidato' && user.refId) {
          await supabase
            .from('candidatos_recrutamento')
            .update({ auth_user_id: data.user.id })
            .eq('id', user.refId);
        }
      }
    } catch (e: any) {
      resultados.push({ email: user.email, error: e.message });
      log(`Exceção criando ${user.email}: ${e.message}`, 'error');
    }
  }

  return resultados;
}

// =====================================================
// EXECUÇÃO PRINCIPAL
// =====================================================

async function main() {
  console.log('\n========================================');
  console.log('🚀 RESTAURAÇÃO DE DADOS VEON RECRUTAMENTO');
  console.log('========================================\n');

  try {
    // 1. Importar tabelas de lookup (sem dependências)
    console.log('\n--- FASE 1: Tabelas de Lookup ---\n');
    await importarDiferenciais();
    await importarCidades();
    await importarPacotes();

    // 2. Importar tabelas principais
    console.log('\n--- FASE 2: Tabelas Principais ---\n');
    const analistas = await importarAnalistas() || [];
    const empresas = await importarEmpresas() || [];
    const candidatos = await importarCandidatos() || [];
    await importarCandidatosDISC();
    await importarCodigosIndicacao();

    // 3. Criar usuários de autenticação
    console.log('\n--- FASE 3: Usuários de Autenticação ---\n');
    const resultadosAuth = await criarUsuariosAuth(analistas, empresas, candidatos);

    // 4. Resumo final
    console.log('\n========================================');
    console.log('📊 RESUMO DA RESTAURAÇÃO');
    console.log('========================================\n');

    const criados = resultadosAuth.filter(r => r.userId && !r.error);
    const erros = resultadosAuth.filter(r => r.error);

    log(`Usuários criados/encontrados: ${criados.length}`, 'success');
    if (erros.length > 0) {
      log(`Erros: ${erros.length}`, 'error');
      erros.forEach(e => console.log(`  - ${e.email}: ${e.error}`));
    }

    console.log('\n========================================');
    console.log('✅ RESTAURAÇÃO CONCLUÍDA!');
    console.log('========================================\n');

    console.log('📋 USUÁRIOS PARA TESTE:\n');
    console.log('ANALISTAS/ADMIN:');
    console.log('  - operacional1@assessoriaveon.com | Eusouabussola');
    console.log('  - henriquealves01648@gmail.com | Eufaturo1M$');
    console.log('  - hermescostaconsultor@gmail.com | alterar1234');
    console.log('\nEMPRESAS:');
    console.log('  - henriquealves01648@gmail.com | Eufaturo1M$ (Instituto Veon)');
    console.log('  - rafaelbonoldi1074@gmail.com | Novasenha123');
    console.log('\nCANDIDATOS:');
    console.log('  - kariny817@gmail.com | Veon@2024');
    console.log('  - (outros candidatos com auth_user_id) | Veon@2024\n');

  } catch (error: any) {
    log(`Erro na restauração: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Executar
main();
