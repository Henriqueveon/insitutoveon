// =====================================================
// SERVICE: CNPJ - Área de Recrutamento VEON
// Validação e consulta de CNPJ via ReceitaWS
// =====================================================

import { CNPJResponse } from '../types/recrutamento.types';

// API ReceitaWS (gratuita, até 3 consultas por minuto)
const RECEITAWS_URL = 'https://receitaws.com.br/v1/cnpj';

// API alternativa: BrasilAPI (backup)
const BRASILAPI_URL = 'https://brasilapi.com.br/api/cnpj/v1';

/**
 * Valida formato do CNPJ (algoritmo oficial)
 */
export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

  // Validação dos dígitos verificadores
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
 */
export function formatarCNPJ(cnpj: string): string {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  return cnpjLimpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Limpa CNPJ removendo caracteres especiais
 */
export function limparCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Consulta dados do CNPJ na ReceitaWS
 * Fallback para BrasilAPI se ReceitaWS falhar
 */
export async function buscarCNPJ(cnpj: string): Promise<CNPJResponse | null> {
  const cnpjLimpo = limparCNPJ(cnpj);

  if (!validarCNPJ(cnpjLimpo)) {
    throw new Error('CNPJ inválido');
  }

  // Tentar ReceitaWS primeiro
  try {
    const response = await fetch(`${RECEITAWS_URL}/${cnpjLimpo}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Verificar se a API retornou erro
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'CNPJ não encontrado');
      }

      return {
        cnpj: formatarCNPJ(data.cnpj),
        razao_social: data.nome,
        nome_fantasia: data.fantasia || data.nome,
        situacao_cadastral: data.situacao,
        data_abertura: data.abertura,
        natureza_juridica: data.natureza_juridica,
        porte: data.porte,
        capital_social: parseFloat(data.capital_social) || 0,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep?.replace(/\D/g, ''),
        telefone: data.telefone,
        email: data.email,
        qsa: data.qsa || [],
      };
    }
  } catch (error) {
    console.warn('ReceitaWS falhou, tentando BrasilAPI...', error);
  }

  // Fallback para BrasilAPI
  try {
    const response = await fetch(`${BRASILAPI_URL}/${cnpjLimpo}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado na Receita Federal');
      }
      throw new Error('Erro ao consultar CNPJ');
    }

    const data = await response.json();

    return {
      cnpj: formatarCNPJ(data.cnpj),
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia || data.razao_social,
      situacao_cadastral: data.descricao_situacao_cadastral,
      data_abertura: data.data_inicio_atividade,
      natureza_juridica: data.natureza_juridica,
      porte: data.porte,
      capital_social: data.capital_social || 0,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep,
      telefone: data.ddd_telefone_1,
      email: data.email,
      qsa: data.qsa || [],
    };
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Erro ao consultar CNPJ. Verifique o número e tente novamente.'
    );
  }
}

/**
 * Valida se CPF é válido (algoritmo oficial)
 */
export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;

  // Validação do primeiro dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

  // Validação do segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

  return true;
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}
