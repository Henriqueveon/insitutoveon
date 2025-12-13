// =====================================================
// SERVICE: CNPJ - Área de Recrutamento VEON
// Validação e consulta de CNPJ
// =====================================================

import { CNPJResponse } from '../types/recrutamento.types';

const CNPJ_API_URL = 'https://brasilapi.com.br/api/cnpj/v1';

/**
 * Valida formato do CNPJ
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
 * Consulta dados do CNPJ na BrasilAPI
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJResponse | null> {
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  if (!validarCNPJ(cnpjLimpo)) {
    throw new Error('CNPJ inválido');
  }

  try {
    const response = await fetch(`${CNPJ_API_URL}/${cnpjLimpo}`);

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
      capital_social: data.capital_social,
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
    throw error;
  }
}
