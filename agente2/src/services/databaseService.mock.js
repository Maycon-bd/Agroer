// Mock temporário do DatabaseService para testes sem PostgreSQL
class DatabaseServiceMock {
  
  // Consultar fornecedor por CNPJ
  async consultarFornecedor(cnpj) {
    console.log(`[MOCK] Consultando fornecedor: ${cnpj}`);
    
    // Simula que alguns fornecedores já existem
    const fornecedoresExistentes = {
      '11.222.333/0001-44': { id: 1, nome: 'Empresa Teste Ltda', documento: '11.222.333/0001-44', ativo: true },
      '12.345.678/0001-90': { id: 2, nome: 'Empresa ABC Ltda', documento: '12.345.678/0001-90', ativo: true }
    };
    
    const fornecedor = fornecedoresExistentes[cnpj];
    return {
      existe: !!fornecedor,
      dados: fornecedor || null
    };
  }

  // Consultar faturado por CPF
  async consultarFaturado(cpf) {
    console.log(`[MOCK] Consultando faturado: ${cpf}`);
    
    // Simula que alguns faturados já existem
    const faturadosExistentes = {
      '111.222.333-44': { id: 1, nome: 'Maria Silva', documento: '111.222.333-44', ativo: true },
      '123.456.789-00': { id: 2, nome: 'João da Silva', documento: '123.456.789-00', ativo: true }
    };
    
    const faturado = faturadosExistentes[cpf];
    return {
      existe: !!faturado,
      dados: faturado || null
    };
  }

  // Consultar classificação de despesa
  async consultarDespesa(descricao) {
    console.log(`[MOCK] Consultando despesa: ${descricao}`);
    
    // Simula classificações existentes
    const despesasExistentes = {
      'ADMINISTRATIVAS': { id: 1, tipo: 'DESPESA', descricao: 'ADMINISTRATIVAS', ativo: true },
      'OPERACIONAIS': { id: 2, tipo: 'DESPESA', descricao: 'OPERACIONAIS', ativo: true },
      'FINANCEIRAS': { id: 3, tipo: 'DESPESA', descricao: 'FINANCEIRAS', ativo: true }
    };
    
    const despesa = despesasExistentes[descricao];
    return {
      existe: !!despesa,
      dados: despesa || null
    };
  }

  // Criar fornecedor
  async criarFornecedor(dadosFornecedor) {
    console.log(`[MOCK] Criando fornecedor:`, dadosFornecedor);
    
    const novoId = Math.floor(Math.random() * 1000) + 100;
    return {
      id: novoId,
      nome: dadosFornecedor.nome,
      documento: dadosFornecedor.cnpj,
      tipo_relacionamento: 'FORNECEDOR',
      ativo: true,
      created_at: new Date().toISOString()
    };
  }

  // Criar faturado
  async criarFaturado(dadosFaturado) {
    console.log(`[MOCK] Criando faturado:`, dadosFaturado);
    
    const novoId = Math.floor(Math.random() * 1000) + 100;
    return {
      id: novoId,
      nome: dadosFaturado.nome,
      documento: dadosFaturado.cpf,
      tipo_relacionamento: 'FATURADO',
      ativo: true,
      created_at: new Date().toISOString()
    };
  }

  // Criar despesa
  async criarDespesa(descricao) {
    console.log(`[MOCK] Criando despesa: ${descricao}`);
    
    const novoId = Math.floor(Math.random() * 1000) + 100;
    return {
      id: novoId,
      tipo: 'DESPESA',
      descricao: descricao,
      ativo: true,
      created_at: new Date().toISOString()
    };
  }

  // Verificar movimento existente
  async verificarMovimentoExistente(dadosMovimento) {
    console.log(`[MOCK] Verificando movimento existente:`, dadosMovimento);
    
    // Simula que não há movimentos duplicados
    return {
      existe: false,
      dados: null
    };
  }

  // Criar movimento
  async criarMovimento(dadosMovimento) {
    console.log(`[MOCK] Criando movimento:`, dadosMovimento);
    
    const novoId = Math.floor(Math.random() * 1000) + 100;
    const movimento = {
      id: novoId,
      numero_documento: dadosMovimento.numeroDocumento,
      data_emissao: dadosMovimento.dataEmissao,
      valor_total: dadosMovimento.valorTotal,
      descricao: dadosMovimento.descricao,
      fornecedor_id: dadosMovimento.fornecedorId,
      faturado_id: dadosMovimento.faturadoId,
      created_at: new Date().toISOString()
    };

    // Simula criação de parcela se necessário
    let parcela = null;
    if (dadosMovimento.parcelas && dadosMovimento.parcelas.length > 0) {
      parcela = {
        id: novoId + 1,
        movimento_id: novoId,
        numero_parcela: 1,
        valor: dadosMovimento.valorTotal,
        data_vencimento: dadosMovimento.parcelas[0].dataVencimento || new Date().toISOString(),
        status: 'PENDENTE'
      };
    }

    return {
      movimento,
      parcela
    };
  }

  // Criar relação movimento-classificação
  async criarRelacaoMovimentoClassificacao(movimentoId, classificacaoId, percentual = 100) {
    console.log(`[MOCK] Criando relação movimento-classificação: ${movimentoId} -> ${classificacaoId} (${percentual}%)`);
    
    return {
      movimento_id: movimentoId,
      classificacao_id: classificacaoId,
      percentual: percentual,
      created_at: new Date().toISOString()
    };
  }
}

module.exports = new DatabaseServiceMock();