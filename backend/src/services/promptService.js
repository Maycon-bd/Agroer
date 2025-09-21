/**
 * Cria o prompt estruturado para o Gemini extrair dados de nota fiscal
 * @param {string} pdfText - Texto extraído do PDF
 * @returns {string} - Prompt formatado para o Gemini
 */
export function createInvoicePrompt(pdfText) {
  return `
Você é um especialista em análise de notas fiscais brasileiras. Analise o texto da nota fiscal abaixo e extraia TODOS os dados solicitados em formato JSON.

**TEXTO DA NOTA FISCAL:**
${pdfText}

**INSTRUÇÕES IMPORTANTES:**
1. Retorne APENAS um JSON válido, sem texto adicional
2. Se algum campo não for encontrado, use null
3. Para datas, use formato YYYY-MM-DD
4. Para valores monetários, use números decimais (ex: 1250.75)
5. Para CNPJ/CPF, mantenha a formatação original se houver
6. Classifique a DESPESA baseada nos produtos/serviços descritos

**CATEGORIAS DE DESPESAS DISPONÍVEIS:**
- INSUMOS_AGRICOLAS: Sementes, Fertilizantes, Defensivos Agrícolas, Corretivos
- MANUTENCAO_E_OPERACAO: Combustíveis, Lubrificantes, Peças, Componentes Mecânicos, Manutenção de Máquinas, Pneus, Filtros, Correias, Ferramentas
- RECURSOS_HUMANOS: Mão de Obra Temporária, Salários e Encargos
- SERVICOS_OPERACIONAIS: Frete, Transporte, Colheita Terceirizada, Secagem, Armazenagem, Pulverização
- INFRAESTRUTURA_E_UTILIDADES: Energia Elétrica, Arrendamento de Terras, Construções, Reformas, Materiais de Construção
- ADMINISTRATIVAS: Honorários Contábeis, Advocatícios, Agronômicos, Despesas Bancárias e Financeiras
- SEGUROS_E_PROTECAO: Seguro Agrícola, Seguro de Ativos, Seguro Prestamista
- IMPOSTOS_E_TAXAS: ITR, IPTU, IPVA, INCRA-CCIR
- INVESTIMENTOS: Aquisição de Máquinas, Implementos, Veículos, Imóveis, Infraestrutura Rural

**ESTRUTURA JSON OBRIGATÓRIA:**
{
  "fornecedor": {
    "razaoSocial": "string ou null",
    "nomeFantasia": "string ou null",
    "cnpj": "string ou null"
  },
  "faturado": {
    "nomeCompleto": "string ou null",
    "cpf": "string ou null"
  },
  "numeroNotaFiscal": "string ou null",
  "dataEmissao": "YYYY-MM-DD ou null",
  "descricaoProdutos": "string detalhada dos produtos/serviços ou null",
  "parcelas": [
    {
      "numero": 1,
      "dataVencimento": "YYYY-MM-DD ou null",
      "valor": 0.00
    }
  ],
  "valorTotal": 0.00,
  "classificacoesDespesa": [
    {
      "categoria": "uma das categorias listadas acima",
      "subcategoria": "subcategoria específica baseada nos produtos",
      "percentual": 100.0,
      "valor": 0.00,
      "justificativa": "explicação da classificação baseada nos produtos"
    }
  ]
}

**REGRAS PARA CLASSIFICAÇÃO DE DESPESAS:**
1. Analise CUIDADOSAMENTE a descrição dos produtos/serviços
2. Classifique na categoria mais apropriada
3. Se houver múltiplos tipos de produtos, crie múltiplas classificações com percentuais
4. O percentual total deve somar 100%
5. Forneça justificativa clara para cada classificação

**EXEMPLOS DE CLASSIFICAÇÃO:**
- "Óleo Diesel" → MANUTENCAO_E_OPERACAO (Combustíveis e Lubrificantes)
- "Material Hidráulico" → INFRAESTRUTURA_E_UTILIDADES (Materiais de Construção)
- "Sementes de Soja" → INSUMOS_AGRICOLAS (Sementes)
- "Honorários Contábeis" → ADMINISTRATIVAS (Honorários Contábeis)

Analise o texto da nota fiscal e retorne o JSON estruturado:
`;
}

/**
 * Cria prompt para re-processamento em caso de erro
 * @param {string} pdfText - Texto do PDF
 * @param {string} errorMessage - Mensagem de erro anterior
 * @returns {string} - Prompt de retry
 */
export function createRetryPrompt(pdfText, errorMessage) {
  return `
Houve um erro no processamento anterior: ${errorMessage}

Por favor, analise novamente o texto da nota fiscal e retorne um JSON válido e completo.
Seja mais cuidadoso com a formatação JSON e certifique-se de que todos os campos obrigatórios estejam presentes.

**TEXTO DA NOTA FISCAL:**
${pdfText}

Retorne APENAS o JSON válido, sem texto adicional:
`;
}

/**
 * Valida se o prompt não excede limites de tokens
 * @param {string} prompt - Prompt a ser validado
 * @returns {boolean} - True se válido
 */
export function validatePromptLength(prompt) {
  // Estimativa: ~4 caracteres por token
  const estimatedTokens = prompt.length / 4;
  const maxTokens = 30000; // Limite conservador para Gemini
  
  return estimatedTokens < maxTokens;
}

/**
 * Trunca texto do PDF se necessário para caber no prompt
 * @param {string} pdfText - Texto original do PDF
 * @param {number} maxLength - Tamanho máximo permitido
 * @returns {string} - Texto truncado se necessário
 */
export function truncatePdfText(pdfText, maxLength = 20000) {
  if (pdfText.length <= maxLength) {
    return pdfText;
  }
  
  console.log(`⚠️ Texto do PDF muito longo (${pdfText.length} chars), truncando para ${maxLength} chars`);
  
  // Tentar manter o início e fim do documento
  const halfLength = Math.floor(maxLength / 2);
  const truncated = pdfText.substring(0, halfLength) + 
                   '\n\n[... TEXTO TRUNCADO ...]\n\n' + 
                   pdfText.substring(pdfText.length - halfLength);
  
  return truncated;
}