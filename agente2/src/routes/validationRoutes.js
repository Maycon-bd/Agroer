const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// Rota para analisar dados extraídos
router.post('/analyze', async (req, res) => {
  try {
    const { dadosExtraidos } = req.body;

    if (!dadosExtraidos) {
      return res.status(400).json({ error: 'Dados extraídos são obrigatórios' });
    }

    // Consultar fornecedor
    const fornecedorResult = await databaseService.consultarFornecedor(dadosExtraidos.cnpjFornecedor);
    
    // Consultar faturado
    const faturadoResult = await databaseService.consultarFaturado(dadosExtraidos.cpfFaturado);
    
    // Consultar despesa
    const despesaResult = await databaseService.consultarDespesa(dadosExtraidos.classificacaoDespesa);

    const analise = {
      fornecedor: {
        nome: dadosExtraidos.nomeFornecedor,
        cnpj: dadosExtraidos.cnpjFornecedor,
        existe: fornecedorResult.existe,
        id: fornecedorResult.dados?.id || null,
        status: fornecedorResult.existe ? `EXISTE – ID: ${fornecedorResult.dados?.id}` : 'NÃO EXISTE'
      },
      faturado: {
        nome: dadosExtraidos.nomeFaturado,
        cpf: dadosExtraidos.cpfFaturado,
        existe: faturadoResult.existe,
        id: faturadoResult.dados?.id || null,
        status: faturadoResult.existe ? `EXISTE – ID: ${faturadoResult.dados?.id}` : 'NÃO EXISTE'
      },
      despesa: {
        descricao: dadosExtraidos.classificacaoDespesa,
        existe: despesaResult.existe,
        id: despesaResult.dados?.id || null,
        status: despesaResult.existe ? `EXISTE – ID: ${despesaResult.dados?.id}` : 'NÃO EXISTE'
      }
    };

    res.json({
      success: true,
      analise,
      dadosOriginais: dadosExtraidos
    });

  } catch (error) {
    console.error('Erro na análise:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Rota para criar registros e movimento
router.post('/create-movement', async (req, res) => {
  try {
    const { dadosExtraidos, analise } = req.body;

    if (!dadosExtraidos || !analise) {
      return res.status(400).json({ error: 'Dados extraídos e análise são obrigatórios' });
    }

    let idFornecedor = analise.fornecedor.id;
    let idFaturado = analise.faturado.id;
    let idDespesa = analise.despesa.id;

    const resultados = {
      fornecedorCriado: false,
      faturadoCriado: false,
      despesaCriada: false,
      movimentoCriado: false
    };

    // Criar fornecedor se não existir
    if (!analise.fornecedor.existe) {
      const novoFornecedor = await databaseService.criarFornecedor({
        razaosocial: dadosExtraidos.nomeFornecedor,
        documento: dadosExtraidos.cnpjFornecedor
      });
      idFornecedor = novoFornecedor.id;
      resultados.fornecedorCriado = true;
    }

    // Criar faturado se não existir
    if (!analise.faturado.existe) {
      const novoFaturado = await databaseService.criarFaturado({
        razaosocial: dadosExtraidos.nomeFaturado,
        documento: dadosExtraidos.cpfFaturado
      });
      idFaturado = novoFaturado.id;
      resultados.faturadoCriado = true;
    }

    // Criar despesa se não existir
    if (!analise.despesa.existe) {
      const novaDespesa = await databaseService.criarDespesa(dadosExtraidos.classificacaoDespesa);
      idDespesa = novaDespesa.id;
      resultados.despesaCriada = true;
    }

    // Verificar se movimento já existe antes de criar
    const movimentoExistente = await databaseService.verificarMovimentoExistente({
      numeronotafiscal: dadosExtraidos.numeroNota,
      dataemissao: dadosExtraidos.dataEmissao,
      valortotal: parseFloat(dadosExtraidos.valorTotal),
      idFornecedor,
      idFaturado
    });

    if (movimentoExistente.existe) {
      return res.status(400).json({
        success: false,
        error: 'MOVIMENTO JÁ CADASTRADO',
        message: 'Os dados informados já foram cadastrados anteriormente no sistema.',
        detalhes: {
          movimentoId: movimentoExistente.dados.id,
          numeroDocumento: movimentoExistente.dados.numero_documento,
          dataEmissao: movimentoExistente.dados.data_emissao,
          valorTotal: movimentoExistente.dados.valor_total
        }
      });
    }

    // Criar movimento
    const movimento = await databaseService.criarMovimento({
      numeronotafiscal: dadosExtraidos.numeroNota,
      dataemissao: dadosExtraidos.dataEmissao,
      descricao: `Nota Fiscal ${dadosExtraidos.numeroNota} - ${dadosExtraidos.nomeFornecedor}`,
      valortotal: parseFloat(dadosExtraidos.valorTotal),
      idFornecedor,
      idFaturado,
      idClassificacao: idDespesa,
      datavencimento: dadosExtraidos.dataVencimento
    });

    resultados.movimentoCriado = true;
    resultados.idMovimento = movimento.idMovimento;
    resultados.identificacaoParcela = movimento.identificacaoParcela;

    res.json({
      success: true,
      message: 'REGISTRO FOI LANÇADO COM SUCESSO!',
      resultados,
      movimento: {
        id: movimento.idMovimento,
        parcela: movimento.identificacaoParcela
      }
    });

  } catch (error) {
    console.error('Erro na criação do movimento:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

module.exports = router;