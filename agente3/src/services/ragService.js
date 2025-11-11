import { getTextModel } from './geminiService.js';
import { query as dbQuery } from './db.js';
import { embedQueryAndSearch } from './embeddingStore.js';
import { tryNlqAnswer, detectEntity, lookupPessoaByEntity, detectMovementType } from './nlq.js';

function toSource(row) {
  return {
    id: String(row.id ?? row.movimento_id ?? row.pessoa_id ?? row.classificacao_id ?? 'unknown'),
    title: row.titulo ?? row.nome ?? row.numero_documento ?? row.descricao ?? undefined,
    score: row.score ?? undefined,
    type: row.origem ?? undefined,
  };
}

function formatCurrencyBRL(value) {
  try {
    const num = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  } catch {
    return `R$ ${Number(value || 0).toFixed(2)}`;
  }
}

async function tryDirectAnswer(queryText) {
  const q = String(queryText || '').trim();
  const qLower = q.toLowerCase();

  // Caso: "valores das notas de tal fornecedor"
  // Heurística simples: extrair nome depois da palavra "fornecedor" ou entre aspas
  if (qLower.includes('fornecedor')) {
    let nomeMatch = null;
    const byQuotes = q.match(/"([^"]+)"/);
    if (byQuotes && byQuotes[1]) {
      nomeMatch = byQuotes[1];
    } else {
      const afterFornecedor = q.replace(/.*fornecedor\s*/i, '').trim();
      if (afterFornecedor) nomeMatch = afterFornecedor;
    }

    if (nomeMatch && nomeMatch.length >= 2) {
      // Buscar pessoa aproximada por nome ou documento
      const likeParam = `%${nomeMatch}%`;
      const pessoas = await dbQuery(
        `SELECT id, nome, documento FROM Pessoas 
         WHERE nome ILIKE $1 OR documento ILIKE $1
         ORDER BY nome ASC LIMIT 1`,
        [likeParam]
      );
      const pessoa = pessoas[0];
      if (!pessoa) {
        return {
          success: true,
          answer: `Não encontrei fornecedor compatível com "${nomeMatch}" no cadastro.`,
          sources: [],
        };
      }

      // Reusar detalhes já implementados
      const detailsRows = await dbQuery(
        `SELECT id, numero_documento, data_emissao, valor_total, tipo_movimento, status_pagamento
         FROM MovimentoContas 
         WHERE fornecedor_id = $1 OR faturado_id = $1
         ORDER BY data_emissao DESC
         LIMIT 10`,
        [pessoa.id]
      );

      const qtd = detailsRows.length;
      if (qtd === 0) {
        return {
          success: true,
          answer: `O fornecedor ${pessoa.nome} não possui notas fiscais registradas.`,
          sources: [{ id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' }],
        };
      }

      const valores = detailsRows.map(r => formatCurrencyBRL(r.valor_total));
      let listaValores = '';
      if (valores.length === 1) {
        listaValores = `valor de ${valores[0]}`;
      } else if (valores.length === 2) {
        listaValores = `valores de ${valores[0]} e ${valores[1]}`;
      } else {
        const primeiras = valores.slice(0, 3).join(', ');
        const resto = valores.length > 3 ? `, entre outras` : '';
        listaValores = `valores como ${primeiras}${resto}`;
      }

      const notasTerm = qtd === 1 ? 'nota fiscal' : 'notas fiscais';
      const answer = `O fornecedor ${pessoa.nome} tem ${qtd} ${notasTerm}, com ${listaValores}.`;
      const sources = [
        { id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' },
        ...detailsRows.slice(0, 3).map(r => ({ id: String(r.id), title: r.numero_documento, type: 'MovimentoContas' })),
      ];

      return { success: true, answer, sources };
    }
  }

  // Sem caso direto reconhecido
  return null;
}

// Overview por nome simples: quando a pergunta é só um nome (sem métricas)
async function tryNameOverviewAnswer(queryText) {
  const q = String(queryText || '').trim();
  if (!q) return null;
  const qLower = q.toLowerCase();

  // Se contiver palavras de métrica/ação explícitas, não é overview
  const metricWords = ['valores', 'listar', 'lista', 'soma', 'total', 'quantas', 'qtd', 'número', 'numero', 'contagem', 'notas', 'compra', 'venda'];
  const hasMetric = metricWords.some(w => qLower.includes(w));
  if (hasMetric) return null;

  // Considerar nome entre aspas ou a string inteira
  const byQuotes = q.match(/"([^"]+)"/);
  const nameCandidate = (byQuotes && byQuotes[1]) ? byQuotes[1].trim() : q;
  if (nameCandidate.length < 2) return null;

  // Buscar Pessoa aproximada reutilizando heurística de proximidade já existente
  let pessoa = await lookupPessoaByEntity('fornecedor', nameCandidate);
  if (!pessoa) pessoa = await lookupPessoaByEntity('cliente', nameCandidate);
  if (!pessoa) pessoa = await lookupPessoaByEntity('faturado', nameCandidate);
  if (!pessoa) return null;

  // Agregados gerais da Pessoa
  const aggRows = await dbQuery(
    `SELECT COUNT(*)::int AS qtd, COALESCE(SUM(valor_total), 0) AS soma, MAX(data_emissao) AS ultima
     FROM MovimentoContas
     WHERE fornecedor_id = $1 OR faturado_id = $1`,
    [pessoa.id]
  );
  const agg = aggRows[0] || { qtd: 0, soma: 0, ultima: null };

  const topRows = await dbQuery(
    `SELECT id, numero_documento, valor_total
     FROM MovimentoContas
     WHERE fornecedor_id = $1 OR faturado_id = $1
     ORDER BY valor_total DESC NULLS LAST, data_emissao DESC
     LIMIT 3`,
    [pessoa.id]
  );

  const notasTerm = agg.qtd === 1 ? 'nota' : 'notas';
  const valoresList = topRows.map(r => formatCurrencyBRL(r.valor_total));
  let valoresInfo = '';
  if (valoresList.length === 1) valoresInfo = `Principal valor de ${valoresList[0]}.`;
  else if (valoresList.length === 2) valoresInfo = `Principais valores de ${valoresList[0]} e ${valoresList[1]}.`;
  else if (valoresList.length >= 3) valoresInfo = `Principais valores como ${valoresList.slice(0, 3).join(', ')}.`;
  const ultima = agg.ultima ? new Date(agg.ultima).toLocaleDateString('pt-BR') : null;

  const tipoRel = (pessoa.tipo_relacionamento || '').toUpperCase();
  const papel = tipoRel.includes('FORNECEDOR') && tipoRel.includes('CLIENTE')
    ? 'fornecedor/cliente'
    : (tipoRel.includes('FORNECEDOR') ? 'fornecedor' : (tipoRel.includes('CLIENTE') ? 'cliente' : 'fornecedor/cliente'));

  const parte1 = `O ${papel} ${pessoa.nome} possui ${agg.qtd} ${notasTerm}, total de ${formatCurrencyBRL(agg.soma)}.`;
  const parte2 = `${ultima ? ` Última emissão em ${ultima}.` : ''}${valoresInfo ? ` ${valoresInfo}` : ''}`;
  const answer = (parte1 + parte2).replace(/\s+/g, ' ').trim();

  const sources = [
    { id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' },
    ...topRows.map(r => ({ id: String(r.id), title: r.numero_documento, type: 'MovimentoContas' })),
  ];

  return { success: true, answer, sources };
}

export async function ragSimple(query) {
  // 1) Overview por nome: consulta curta sem métricas explícitas
  const overview = await tryNameOverviewAnswer(query);
  if (overview) return overview;

  // 2) NLQ simples: tentar responder diretamente via SQL com padrões gerais
  const nlq = await tryNlqAnswer(query);
  if (nlq) return nlq;

  // 3) Padrão anterior específico (legacy)
  const direct = await tryDirectAnswer(query);
  if (direct) return direct;

  // 3) Contexto LLM: ancorar no fornecedor/cliente mais próximo, se detectado
  const likeParam = `%${query}%`;
  const resultados = [];

  const entity = detectEntity(query);
  let focoPessoa = null;
  if (entity.type && entity.name && entity.name.length >= 2) {
    focoPessoa = await lookupPessoaByEntity(entity.type, entity.name);
  }

  if (focoPessoa) {
    resultados.push({ id: focoPessoa.id, titulo: focoPessoa.nome, texto: focoPessoa.documento, origem: 'Pessoas' });
    const movType = detectMovementType(query);
    const whereRel = entity.type === 'fornecedor' ? 'fornecedor_id = $1' : 'faturado_id = $1';
    const params = [focoPessoa.id];
    const movWhere = movType ? `${whereRel} AND tipo_movimento = $2` : whereRel;
    if (movType) params.push(movType);
    const movs = await dbQuery(
      `SELECT id, numero_documento AS titulo, descricao AS texto, valor_total, tipo_movimento
       FROM MovimentoContas WHERE ${movWhere}
       ORDER BY data_emissao DESC LIMIT 6`,
      params
    );
    resultados.push(...movs.map(r => ({ ...r, origem: 'MovimentoContas' })));
  }
  
  // Complemento genérico
  const pessoas = await dbQuery(
    `SELECT id, nome AS titulo, documento, tipo_relacionamento AS rel, endereco AS texto
     FROM Pessoas WHERE nome ILIKE $1 OR documento ILIKE $1`,
    [likeParam]
  );
  resultados.push(...pessoas.map(r => ({ ...r, origem: 'Pessoas' })));

  const movimentos = await dbQuery(
    `SELECT id, numero_documento AS titulo, descricao AS texto, valor_total, tipo_movimento
     FROM MovimentoContas WHERE numero_documento ILIKE $1 OR descricao ILIKE $1`,
    [likeParam]
  );
  resultados.push(...movimentos.map(r => ({ ...r, origem: 'MovimentoContas' })));

  const classificacoes = await dbQuery(
    `SELECT id, descricao AS titulo, categoria, subcategoria
     FROM Classificacao WHERE descricao ILIKE $1 OR categoria ILIKE $1 OR subcategoria ILIKE $1`,
    [likeParam]
  );
  resultados.push(...classificacoes.map(r => ({ ...r, origem: 'Classificacao' })));

  const context = resultados.slice(0, 12).map((r, idx) => {
    return `[#${idx + 1}] Origem=${r.origem} | id=${r.id} | titulo=${r.titulo ?? ''} | texto=${r.texto ?? ''}`;
  }).join('\n');

  const systemPrompt = `Você é um assistente especializado em consultas financeiras agrícolas.
Responda em português de forma clara e direta, com NO MÁXIMO 2 frases.
Cite IDs quando útil. Use somente o contexto abaixo, não invente dados.
Se a pergunta for curta ou ambígua, peça esclarecimento em 1 frase e dê até 2 exemplos concisos.`;

  const focoLine = focoPessoa ? `Fornecedor/Cliente foco: ${focoPessoa.nome} (id=${focoPessoa.id})` : '';
  const userPrompt = `Pergunta: ${query}\n${focoLine ? focoLine + '\n' : ''}\nContexto:\n${context}`;

  const model = getTextModel();
  const result = await model.generateContent([{ text: systemPrompt }, { text: userPrompt }]);
  const text = result.response.text();

  // Priorizamos fontes: pessoa foco e 3 notas principais
  const prioritized = [];
  if (focoPessoa) prioritized.push({ id: focoPessoa.id, titulo: focoPessoa.nome, origem: 'Pessoas' });
  const movFoco = resultados.filter(r => r.origem === 'MovimentoContas').slice(0, 3);
  prioritized.push(...movFoco);
  const extras = resultados.filter(r => !(prioritized.find(p => p.id === r.id && p.origem === r.origem))).slice(0, 8);
  const finalSources = [...prioritized, ...extras].map(toSource);
  return { success: true, answer: text, sources: finalSources };
}

export async function ragEmbeddingsSearch(query) {
  const results = await embedQueryAndSearch(query, { topK: 8 });
  return { success: true, results };
}

export async function getSourceDetails(type, id) {
  const numericId = Number(id);
  if (!type || Number.isNaN(numericId)) {
    throw new Error('Parâmetros de fonte inválidos.');
  }
  if (type === 'Pessoas') {
    const baseRows = await dbQuery(
      `SELECT id, nome, documento, tipo_relacionamento, endereco FROM Pessoas WHERE id = $1 LIMIT 1`,
      [numericId]
    );
    const base = baseRows[0] || null;
    if (!base) return null;
    const aggRows = await dbQuery(
      `SELECT 
         COUNT(*)::int AS qtd_notas, 
         COALESCE(SUM(valor_total), 0) AS total_notas
       FROM MovimentoContas 
       WHERE fornecedor_id = $1 OR faturado_id = $1`,
      [numericId]
    );
    const notasRows = await dbQuery(
      `SELECT id, numero_documento, data_emissao, valor_total, tipo_movimento, status_pagamento
       FROM MovimentoContas 
       WHERE fornecedor_id = $1 OR faturado_id = $1
       ORDER BY data_emissao DESC
       LIMIT 50`,
      [numericId]
    );
    const agg = aggRows[0] || { qtd_notas: 0, total_notas: 0 };
    const totalNotasNum = Number(agg.total_notas || 0);
    return { ...base, qtd_notas: agg.qtd_notas || 0, total_notas: totalNotasNum, notas: notasRows };
  }
  if (type === 'MovimentoContas') {
    const baseRows = await dbQuery(
      `SELECT id, numero_documento, descricao, valor_total, tipo_movimento, data_emissao, fornecedor_id, faturado_id 
       FROM MovimentoContas WHERE id = $1 LIMIT 1`,
      [numericId]
    );
    const base = baseRows[0] || null;
    if (!base) return null;
    const fornecedor = base.fornecedor_id 
      ? (await dbQuery(`SELECT id, nome, documento FROM Pessoas WHERE id = $1`, [base.fornecedor_id]))[0] || null 
      : null;
    const faturado = base.faturado_id 
      ? (await dbQuery(`SELECT id, nome, documento FROM Pessoas WHERE id = $1`, [base.faturado_id]))[0] || null 
      : null;
    const parcelas = await dbQuery(
      `SELECT id, numero_parcela, data_vencimento, valor_parcela, valor_pago, status_parcela 
       FROM ParcelasContas WHERE movimento_id = $1 
       ORDER BY numero_parcela ASC`,
      [numericId]
    );
    const classifs = await dbQuery(
      `SELECT mc.classificacao_id, c.descricao, mc.valor_classificacao, mc.percentual
       FROM MovimentoContas_has_Classificacao mc
       JOIN Classificacao c ON mc.classificacao_id = c.id
       WHERE mc.movimento_id = $1`,
      [numericId]
    );
    const totalParcelado = parcelas.reduce((acc, p) => acc + Number(p.valor_parcela || 0), 0);
    return { 
      ...base, 
      fornecedor, 
      faturado, 
      parcelas, 
      classificacoes: classifs, 
      qtd_parcelas: parcelas.length, 
      total_parcelado: totalParcelado 
    };
  }
  if (type === 'Classificacao') {
    const baseRows = await dbQuery(
      `SELECT id, descricao, categoria, subcategoria, tipo FROM Classificacao WHERE id = $1 LIMIT 1`,
      [numericId]
    );
    const base = baseRows[0] || null;
    if (!base) return null;
    const aggRows = await dbQuery(
      `SELECT COUNT(*)::int AS qtd_movimentos, COALESCE(SUM(valor_classificacao), 0) AS total_classificado
       FROM MovimentoContas_has_Classificacao WHERE classificacao_id = $1`,
      [numericId]
    );
    const movimentos = await dbQuery(
      `SELECT m.id, m.numero_documento, m.data_emissao, m.valor_total, m.tipo_movimento
       FROM MovimentoContas_has_Classificacao mc
       JOIN MovimentoContas m ON mc.movimento_id = m.id
       WHERE mc.classificacao_id = $1
       ORDER BY m.data_emissao DESC
       LIMIT 50`,
      [numericId]
    );
    const agg = aggRows[0] || { qtd_movimentos: 0, total_classificado: 0 };
    const totalClassificadoNum = Number(agg.total_classificado || 0);
    return { ...base, qtd_movimentos: agg.qtd_movimentos || 0, total_classificado: totalClassificadoNum, movimentos };
  }
  throw new Error(`Tipo de fonte não suportado: ${type}`);
}