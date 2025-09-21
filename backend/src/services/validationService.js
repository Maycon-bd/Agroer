/**
 * Categorias válidas de despesas
 */
const VALID_EXPENSE_CATEGORIES = [
  'INSUMOS_AGRICOLAS',
  'MANUTENCAO_E_OPERACAO',
  'RECURSOS_HUMANOS',
  'SERVICOS_OPERACIONAIS',
  'INFRAESTRUTURA_E_UTILIDADES',
  'ADMINISTRATIVAS',
  'SEGUROS_E_PROTECAO',
  'IMPOSTOS_E_TAXAS',
  'INVESTIMENTOS'
];

/**
 * Valida formato de CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - True se válido
 */
function isValidCNPJ(cnpj) {
  if (!cnpj) return false;
  
  // Remove formatação
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  return cleanCNPJ.length === 14;
}

/**
 * Valida formato de CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - True se válido
 */
function isValidCPF(cpf) {
  if (!cpf) return false;
  
  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  return cleanCPF.length === 11;
}

/**
 * Valida formato de data
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {boolean} - True se válido
 */
function isValidDate(date) {
  if (!date) return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
}

/**
 * Valida se o valor é um número válido
 * @param {any} value - Valor a ser validado
 * @returns {boolean} - True se válido
 */
function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Valida estrutura do fornecedor
 * @param {Object} fornecedor - Dados do fornecedor
 * @returns {Object} - Fornecedor validado
 */
function validateFornecedor(fornecedor) {
  if (!fornecedor || typeof fornecedor !== 'object') {
    return {
      razaoSocial: null,
      nomeFantasia: null,
      cnpj: null
    };
  }
  
  const validated = {
    razaoSocial: fornecedor.razaoSocial || null,
    nomeFantasia: fornecedor.nomeFantasia || null,
    cnpj: fornecedor.cnpj || null
  };
  
  // Validar CNPJ se fornecido
  if (validated.cnpj && !isValidCNPJ(validated.cnpj)) {
    console.warn(`⚠️ CNPJ inválido: ${validated.cnpj}`);
  }
  
  return validated;
}

/**
 * Valida estrutura do faturado
 * @param {Object} faturado - Dados do faturado
 * @returns {Object} - Faturado validado
 */
function validateFaturado(faturado) {
  if (!faturado || typeof faturado !== 'object') {
    return {
      nomeCompleto: null,
      cpf: null
    };
  }
  
  const validated = {
    nomeCompleto: faturado.nomeCompleto || null,
    cpf: faturado.cpf || null
  };
  
  // Validar CPF se fornecido
  if (validated.cpf && !isValidCPF(validated.cpf)) {
    console.warn(`⚠️ CPF inválido: ${validated.cpf}`);
  }
  
  return validated;
}

/**
 * Valida estrutura das parcelas
 * @param {Array} parcelas - Array de parcelas
 * @param {number} valorTotal - Valor total para validação
 * @returns {Array} - Parcelas validadas
 */
function validateParcelas(parcelas, valorTotal) {
  if (!Array.isArray(parcelas) || parcelas.length === 0) {
    // Se não há parcelas, criar uma única parcela com valor total
    return [{
      numero: 1,
      dataVencimento: null,
      valor: valorTotal || 0
    }];
  }
  
  const validatedParcelas = parcelas.map((parcela, index) => {
    const validated = {
      numero: parcela.numero || (index + 1),
      dataVencimento: null,
      valor: 0
    };
    
    // Validar data de vencimento
    if (parcela.dataVencimento && isValidDate(parcela.dataVencimento)) {
      validated.dataVencimento = parcela.dataVencimento;
    }
    
    // Validar valor
    if (isValidNumber(parcela.valor)) {
      validated.valor = Number(parcela.valor);
    }
    
    return validated;
  });
  
  // Verificar se soma das parcelas bate com valor total
  const somaParcelas = validatedParcelas.reduce((sum, p) => sum + p.valor, 0);
  if (valorTotal && Math.abs(somaParcelas - valorTotal) > 0.01) {
    console.warn(`⚠️ Soma das parcelas (${somaParcelas}) difere do valor total (${valorTotal})`);
  }
  
  return validatedParcelas;
}

/**
 * Valida classificações de despesa
 * @param {Array} classificacoes - Array de classificações
 * @param {number} valorTotal - Valor total para validação
 * @returns {Array} - Classificações validadas
 */
function validateClassificacoesDespesa(classificacoes, valorTotal) {
  if (!Array.isArray(classificacoes) || classificacoes.length === 0) {
    // Se não há classificações, criar uma genérica
    return [{
      categoria: 'ADMINISTRATIVAS',
      subcategoria: 'Não classificado',
      percentual: 100.0,
      valor: valorTotal || 0,
      justificativa: 'Classificação automática - dados insuficientes'
    }];
  }
  
  const validatedClassificacoes = classificacoes.map(classificacao => {
    const validated = {
      categoria: 'ADMINISTRATIVAS', // padrão
      subcategoria: classificacao.subcategoria || 'Não especificado',
      percentual: 0,
      valor: 0,
      justificativa: classificacao.justificativa || 'Sem justificativa'
    };
    
    // Validar categoria
    if (classificacao.categoria && VALID_EXPENSE_CATEGORIES.includes(classificacao.categoria)) {
      validated.categoria = classificacao.categoria;
    } else {
      console.warn(`⚠️ Categoria inválida: ${classificacao.categoria}`);
    }
    
    // Validar percentual
    if (isValidNumber(classificacao.percentual)) {
      validated.percentual = Math.max(0, Math.min(100, Number(classificacao.percentual)));
    }
    
    // Validar valor
    if (isValidNumber(classificacao.valor)) {
      validated.valor = Number(classificacao.valor);
    } else if (valorTotal && validated.percentual > 0) {
      // Calcular valor baseado no percentual
      validated.valor = (valorTotal * validated.percentual) / 100;
    }
    
    return validated;
  });
  
  // Verificar se percentuais somam 100%
  const somaPercentuais = validatedClassificacoes.reduce((sum, c) => sum + c.percentual, 0);
  if (Math.abs(somaPercentuais - 100) > 0.01) {
    console.warn(`⚠️ Soma dos percentuais (${somaPercentuais}%) não é 100%`);
    
    // Ajustar percentuais proporcionalmente
    if (somaPercentuais > 0) {
      validatedClassificacoes.forEach(classificacao => {
        classificacao.percentual = (classificacao.percentual / somaPercentuais) * 100;
        if (valorTotal) {
          classificacao.valor = (valorTotal * classificacao.percentual) / 100;
        }
      });
    }
  }
  
  return validatedClassificacoes;
}

/**
 * Valida e estrutura os dados extraídos da nota fiscal
 * @param {Object} rawData - Dados brutos extraídos pelo Gemini
 * @returns {Object} - Dados validados e estruturados
 */
export function validateExtractedData(rawData) {
  console.log('🔍 Validando dados extraídos...');
  
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Dados extraídos inválidos ou vazios');
  }
  
  // Validar valor total
  let valorTotal = 0;
  if (isValidNumber(rawData.valorTotal)) {
    valorTotal = Number(rawData.valorTotal);
  } else {
    console.warn('⚠️ Valor total não encontrado ou inválido');
  }
  
  // Estruturar dados validados
  const validatedData = {
    fornecedor: validateFornecedor(rawData.fornecedor),
    faturado: validateFaturado(rawData.faturado),
    numeroNotaFiscal: rawData.numeroNotaFiscal || null,
    dataEmissao: null,
    descricaoProdutos: rawData.descricaoProdutos || null,
    parcelas: validateParcelas(rawData.parcelas, valorTotal),
    valorTotal: valorTotal,
    classificacoesDespesa: validateClassificacoesDespesa(rawData.classificacoesDespesa, valorTotal)
  };
  
  // Validar data de emissão
  if (rawData.dataEmissao && isValidDate(rawData.dataEmissao)) {
    validatedData.dataEmissao = rawData.dataEmissao;
  } else if (rawData.dataEmissao) {
    console.warn(`⚠️ Data de emissão inválida: ${rawData.dataEmissao}`);
  }
  
  console.log('✅ Dados validados com sucesso');
  
  return validatedData;
}

/**
 * Valida se os dados mínimos obrigatórios estão presentes
 * @param {Object} data - Dados validados
 * @returns {Object} - Resultado da validação
 */
export function validateRequiredFields(data) {
  const errors = [];
  const warnings = [];
  
  // Campos obrigatórios
  if (!data.fornecedor?.razaoSocial && !data.fornecedor?.nomeFantasia) {
    errors.push('Nome do fornecedor (Razão Social ou Fantasia) é obrigatório');
  }
  
  if (!data.numeroNotaFiscal) {
    errors.push('Número da nota fiscal é obrigatório');
  }
  
  if (!data.valorTotal || data.valorTotal <= 0) {
    errors.push('Valor total deve ser maior que zero');
  }
  
  // Campos recomendados
  if (!data.dataEmissao) {
    warnings.push('Data de emissão não encontrada');
  }
  
  if (!data.fornecedor?.cnpj) {
    warnings.push('CNPJ do fornecedor não encontrado');
  }
  
  if (!data.descricaoProdutos) {
    warnings.push('Descrição dos produtos não encontrada');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}