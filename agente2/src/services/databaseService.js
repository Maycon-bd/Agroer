const { pool } = require('../config/database');

class DatabaseService {
  
  // Consultar fornecedor por CNPJ
  async consultarFornecedor(cnpj) {
    try {
      const query = `
        SELECT id, nome, documento, ativo 
        FROM Pessoas 
        WHERE tipo_relacionamento = 'FORNECEDOR' AND documento = $1
      `;
      const result = await pool.query(query, [cnpj]);
      
      return {
        existe: result.rows.length > 0,
        dados: result.rows[0] || null
      };
    } catch (error) {
      console.error('Erro ao consultar fornecedor:', error);
      throw new Error('Falha na consulta do fornecedor');
    }
  }

  // Consultar faturado por CPF
  async consultarFaturado(cpf) {
    try {
      const query = `
        SELECT id, nome, documento, ativo 
        FROM Pessoas 
        WHERE tipo_relacionamento = 'FATURADO' AND documento = $1
      `;
      const result = await pool.query(query, [cpf]);
      
      return {
        existe: result.rows.length > 0,
        dados: result.rows[0] || null
      };
    } catch (error) {
      console.error('Erro ao consultar faturado:', error);
      throw new Error('Falha na consulta do faturado');
    }
  }

  // Consultar classificação de despesa
  async consultarDespesa(descricao) {
    try {
      const query = `
        SELECT id, tipo, descricao, ativo 
        FROM Classificacao 
        WHERE tipo = 'DESPESA' AND UPPER(descricao) = UPPER($1)
      `;
      const result = await pool.query(query, [descricao]);
      
      return {
        existe: result.rows.length > 0,
        dados: result.rows[0] || null
      };
    } catch (error) {
      console.error('Erro ao consultar despesa:', error);
      throw new Error('Falha na consulta da despesa');
    }
  }

  // Criar novo fornecedor
  async criarFornecedor(dadosFornecedor) {
    try {
      // Primeiro verificar se o fornecedor já existe
      const checkQuery = `
        SELECT id, nome, documento 
        FROM Pessoas 
        WHERE documento = $1 AND tipo_relacionamento = 'FORNECEDOR'
      `;
      
      const existingResult = await pool.query(checkQuery, [dadosFornecedor.documento]);
      
      if (existingResult.rows.length > 0) {
        // Se já existe, retorna o fornecedor existente
        return existingResult.rows[0];
      }
      
      // Se não existe, cria um novo
      const query = `
        INSERT INTO Pessoas (tipo_relacionamento, nome, tipo_pessoa, documento, ativo)
        VALUES ('FORNECEDOR', $1, $2, $3, true)
        RETURNING id, nome, documento
      `;
      
      // Determinar tipo de pessoa baseado no documento
      const documento = dadosFornecedor.documento;
      const tipoPessoa = documento && documento.length > 11 ? 'JURIDICA' : 'FISICA';
      
      const values = [
        dadosFornecedor.nome || dadosFornecedor.razaosocial,
        tipoPessoa,
        documento
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw new Error('Falha na criação do fornecedor');
    }
  }

  // Criar novo faturado
  async criarFaturado(dadosFaturado) {
    try {
      // Primeiro verificar se o faturado já existe
      const checkQuery = `
        SELECT id, nome, documento 
        FROM Pessoas 
        WHERE documento = $1 AND tipo_relacionamento = 'FATURADO'
      `;
      
      const existingResult = await pool.query(checkQuery, [dadosFaturado.documento]);
      
      if (existingResult.rows.length > 0) {
        // Se já existe, retorna o faturado existente
        return existingResult.rows[0];
      }
      
      // Se não existe, cria um novo
      const query = `
        INSERT INTO Pessoas (tipo_relacionamento, nome, tipo_pessoa, documento, ativo)
        VALUES ('FATURADO', $1, $2, $3, true)
        RETURNING id, nome, documento
      `;
      
      // Determinar tipo de pessoa baseado no documento
      const documento = dadosFaturado.documento;
      const tipoPessoa = documento && documento.length > 11 ? 'JURIDICA' : 'FISICA';
      
      const values = [
        dadosFaturado.nome || dadosFaturado.razaosocial,
        tipoPessoa,
        documento
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar faturado:', error);
      throw new Error('Falha na criação do faturado');
    }
  }

  // Criar nova classificação de despesa
  async criarDespesa(descricao) {
    try {
      // Primeiro verificar se a classificação já existe
      const checkQuery = `
        SELECT id, descricao 
        FROM Classificacao 
        WHERE descricao = $1 AND tipo = 'DESPESA'
      `;
      
      const existingResult = await pool.query(checkQuery, [descricao]);
      
      if (existingResult.rows.length > 0) {
        // Se já existe, retorna a classificação existente
        return existingResult.rows[0];
      }
      
      // Se não existe, cria uma nova
      const query = `
        INSERT INTO Classificacao (tipo, descricao, ativo)
        VALUES ('DESPESA', $1, true)
        RETURNING id, descricao
      `;
      
      const result = await pool.query(query, [descricao]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw new Error('Falha na criação da despesa');
    }
  }

  // Verificar se movimento já existe
  async verificarMovimentoExistente(dadosMovimento) {
    try {
      const query = `
        SELECT m.id, m.numero_documento, m.data_emissao, m.valor_total
        FROM MovimentoContas m
        WHERE m.numero_documento = $1 
          AND m.data_emissao = $2 
          AND m.valor_total = $3
          AND m.fornecedor_id = $4
          AND m.faturado_id = $5
      `;
      
      const values = [
        dadosMovimento.numeronotafiscal,
        dadosMovimento.dataemissao,
        dadosMovimento.valortotal,
        dadosMovimento.idFornecedor,
        dadosMovimento.idFaturado
      ];

      const result = await pool.query(query, values);
      
      return {
        existe: result.rows.length > 0,
        dados: result.rows.length > 0 ? result.rows[0] : null
      };
    } catch (error) {
      console.error('Erro ao verificar movimento existente:', error);
      throw new Error('Falha na verificação de movimento existente');
    }
  }

  // Criar movimento de contas
  async criarMovimento(dadosMovimento) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Inserir movimento principal
      const movimentoQuery = `
        INSERT INTO MovimentoContas (
          tipo_movimento, numero_documento, data_emissao, descricao, status_pagamento, valor_total,
          fornecedor_id, faturado_id
        )
        VALUES ($1, $2, $3, $4, 'PENDENTE', $5, $6, $7)
        RETURNING id
      `;
      
      const movimentoValues = [
        'SAIDA',
        dadosMovimento.numeronotafiscal,
        dadosMovimento.dataemissao,
        dadosMovimento.descricao,
        dadosMovimento.valortotal,
        dadosMovimento.idFornecedor,
        dadosMovimento.idFaturado
      ];

      const movimentoResult = await client.query(movimentoQuery, movimentoValues);
      const idMovimento = movimentoResult.rows[0].id;

      // Associar classificação ao movimento
      const classificacaoQuery = `
        INSERT INTO MovimentoContas_has_Classificacao (
          movimento_id, classificacao_id, valor_classificacao
        )
        VALUES ($1, $2, $3)
      `;
      
      await client.query(classificacaoQuery, [idMovimento, dadosMovimento.idClassificacao, dadosMovimento.valortotal]);

      // Criar parcela única (assumindo pagamento à vista por enquanto)
      const parcelaQuery = `
        INSERT INTO ParcelasContas (
          movimento_id, numero_parcela, data_vencimento, valor_parcela, status_parcela
        )
        VALUES ($1, $2, $3, $4, 'PENDENTE')
        RETURNING id
      `;

      const parcelaValues = [
        idMovimento,
        1,
        dadosMovimento.datavencimento || dadosMovimento.dataemissao,
        dadosMovimento.valortotal
      ];

      const parcelaResult = await client.query(parcelaQuery, parcelaValues);

      await client.query('COMMIT');

      return {
        idMovimento,
        idParcela: parcelaResult.rows[0].id
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar movimento:', error);
      throw new Error('Falha na criação do movimento');
    } finally {
      client.release();
    }
  }
}

module.exports = new DatabaseService();