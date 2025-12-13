interface DadosCNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral: string;
  data_abertura?: string;
  natureza_juridica?: string;
  porte?: string;
  capital_social?: number;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  socios?: Array<{
    nome: string;
    cpf?: string;
  }>;
}

export const buscarDadosCNPJ = async (cnpj: string): Promise<DadosCNPJ | null> => {
  try {
    // Remove caracteres especiais do CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    
    if (cnpjLimpo.length !== 14) {
      throw new Error("CNPJ inválido");
    }

    // TODO: Integrar com API de consulta de CNPJ (ReceitaWS, BrasilAPI, etc.)
    // Por enquanto, retorna dados mock
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
    
    if (!response.ok) {
      throw new Error("CNPJ não encontrado");
    }

    const data = await response.json();

    return {
      cnpj: cnpj,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia,
      situacao_cadastral: data.descricao_situacao_cadastral,
      data_abertura: data.data_inicio_atividade,
      natureza_juridica: data.natureza_juridica,
      porte: data.porte,
      capital_social: data.capital_social,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.municipio,
      estado: data.uf,
      cep: data.cep,
      telefone: data.ddd_telefone_1,
      email: data.email,
      socios: data.qsa?.map((socio: { nome_socio: string }) => ({
        nome: socio.nome_socio
      }))
    };
  } catch (error) {
    console.error("Erro ao buscar CNPJ:", error);
    return null;
  }
};

export const formatarCNPJ = (cnpj: string): string => {
  const numeros = cnpj.replace(/\D/g, "");
  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

export const validarCNPJ = (cnpj: string): boolean => {
  const numeros = cnpj.replace(/\D/g, "");
  
  if (numeros.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numeros)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(numeros[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(numeros[12]) !== digito1) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(numeros[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(numeros[13]) === digito2;
};
