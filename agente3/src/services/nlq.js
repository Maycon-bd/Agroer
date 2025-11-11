// Utilitário NLQ simples: interpreta perguntas em PT-BR e responde direto do banco
// Cobertura: entidade (fornecedor/cliente/faturado), tipo (compra=ENTRADA, venda=SAIDA),
// métricas (count/sum/list), período básico (ano, mês atual/mês passado, últimos N dias), status (pendente/pago/vencido).

import { query as dbQuery } from './db.js';

function normalize(str) {
  return String(str || '').trim();
}

function lower(str) {
  return normalize(str).toLowerCase();
}

function extractQuoted(text) {
  const m = text.match(/"([^"]+)"/);
  return m && m[1] ? m[1].trim() : null;
}

function extractAfterWord(text, word) {
  const re = new RegExp(`${word}\\s+([^\n]+)`, 'i');
  const m = text.match(re);
  return m && m[1] ? m[1].trim() : null;
}

export function detectEntity(q) {
  const qLower = lower(q);
  const quoted = extractQuoted(q);
  if (qLower.includes('fornecedor')) {
    const name = quoted || extractAfterWord(q, 'fornecedor') || null;
    return { type: 'fornecedor', name };
  }
  if (qLower.includes('cliente')) {
    const name = quoted || extractAfterWord(q, 'cliente') || null;
    return { type: 'cliente', name };
  }
  if (qLower.includes('faturado')) {
    const name = quoted || extractAfterWord(q, 'faturado') || null;
    return { type: 'faturado', name };
  }
  return { type: null, name: null };
}

export function detectMovementType(q) {
  const t = lower(q);
  if (t.includes('compra') || t.includes('compras') || t.includes('entrada')) return 'ENTRADA';
  if (t.includes('venda') || t.includes('vendas') || t.includes('saída') || t.includes('saida')) return 'SAIDA';
  return null;
}

function detectMetric(q) {
  const t = lower(q);
  if (t.includes('quantas') || t.includes('qtd') || t.includes('número') || t.includes('numero') || t.includes('contagem')) return 'count';
  if (t.includes('média') || t.includes('media') || t.includes('average')) return 'avg';
  if (t.includes('soma') || t.includes('total') || t.includes('valor total')) return 'sum';
  if (t.includes('valores') || t.includes('listar') || t.includes('quais os valores') || t.includes('lista')) return 'list';
  // padrão por valores quando pergunta por "valores"
  return null;
}

export function detectStatus(q) {
  const t = lower(q);
  if (t.includes('aberta') || t.includes('abertas') || t.includes('pendente') || t.includes('pendentes')) return 'PENDENTE';
  if (t.includes('paga') || t.includes('pagas') || t.includes('pago')) return 'PAGO';
  if (t.includes('vencida') || t.includes('vencidas') || t.includes('vencido')) return 'VENCIDO';
  if (t.includes('cancelada') || t.includes('canceladas') || t.includes('cancelado')) return 'CANCELADO';
  return null;
}

function parseDateISO(s) {
  // Aceita YYYY-MM-DD
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function detectPeriod(q) {
  const t = lower(q);
  const now = new Date();
  const yearMatch = t.match(/\b(20\d{2})\b/);
  if (t.includes('este mês') || t.includes('mes atual') || t.includes('mês atual')) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end, label: 'no mês atual' };
  }
  if (t.includes('mês passado') || t.includes('mes passado')) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start, end, label: 'no mês passado' };
  }
  const lastDays = t.match(/últimos\s+(\d+)\s+dias/);
  if (lastDays) {
    const n = Number(lastDays[1]);
    const end = now;
    const start = new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
    return { start, end, label: `nos últimos ${n} dias` };
  }
  const betweenMatch = t.match(/entre\s+(\d{4}-\d{2}-\d{2})\s+e\s+(\d{4}-\d{2}-\d{2})/);
  if (betweenMatch) {
    const start = parseDateISO(betweenMatch[1]);
    const end = parseDateISO(betweenMatch[2]);
    if (start && end) return { start, end, label: `entre ${betweenMatch[1]} e ${betweenMatch[2]}` };
  }
  if (yearMatch) {
    const y = Number(yearMatch[1]);
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31);
    return { start, end, label: `em ${y}` };
  }
  return null;
}

export function formatCurrencyBRL(value) {
  try {
    const num = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  } catch {
    return `R$ ${Number(value || 0).toFixed(2)}`;
  }
}

function stripAccents(s) {
  return normalize(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function similarityScore(a, b) {
  const A = stripAccents(a);
  const B = stripAccents(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (B.startsWith(A)) return 0.95;
  if (B.includes(A)) return 0.9;
  const at = A.split(/\s+/).filter(Boolean);
  const bt = new Set(B.split(/\s+/).filter(Boolean));
  const overlap = at.filter(t => bt.has(t)).length / Math.max(1, at.length);
  return Math.max(0.6 * overlap, 0);
}

export async function lookupPessoaByEntity(entityType, nameLike) {
  const likeParam = `%${nameLike}%`;
  let relFilter = null;
  if (entityType === 'fornecedor') relFilter = `tipo_relacionamento IN ('FORNECEDOR','FORNECEDOR_CLIENTE')`;
  if (entityType === 'cliente') relFilter = `tipo_relacionamento IN ('CLIENTE','FORNECEDOR_CLIENTE')`;
  if (entityType === 'faturado') relFilter = `tipo_relacionamento IN ('FATURADO','FORNECEDOR_CLIENTE')`;

  const whereRel = relFilter ? ` AND ${relFilter}` : '';
  const rows = await dbQuery(
    `SELECT id, nome, documento FROM Pessoas
     WHERE (nome ILIKE $1 OR documento ILIKE $1)${whereRel}
     ORDER BY nome ASC LIMIT 10`,
    [likeParam]
  );
  if (rows.length) {
    let best = rows[0];
    let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
    for (const r of rows) {
      const sc = similarityScore(nameLike, r.nome || r.documento || '');
      if (sc > bestScore) { best = r; bestScore = sc; }
    }
    // limiar mínimo simples
    if (bestScore >= 0.3) return best;
  }
  // Tentativa com tokens ampliados (nomes com variações: Ltda, Indústria, etc.)
  const tokens = stripAccents(nameLike).split(/\s+/).filter(t => t.length >= 2);
  if (tokens.length) {
    const likes = tokens.map(t => `%${t}%`);
    const params = likes;
    const orConds = tokens.map((_, i) => `(nome ILIKE $${i + 1} OR documento ILIKE $${i + 1})`).join(' OR ');
    const toks = await dbQuery(
      `SELECT id, nome, documento FROM Pessoas
       WHERE (${orConds})${whereRel}
       ORDER BY nome ASC LIMIT 20`,
      params
    );
    if (toks.length) {
      let best = toks[0];
      let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
      for (const r of toks) {
        const sc = similarityScore(nameLike, r.nome || r.documento || '');
        if (sc > bestScore) { best = r; bestScore = sc; }
      }
      if (bestScore >= 0.3) return best;
    }
  }
  // Fallback: procurar pelo relacionamento em MovimentoContas com join
  if (entityType === 'fornecedor') {
    const jrows = await dbQuery(
      `SELECT p.id, p.nome, p.documento, COUNT(m.id) as qtd
       FROM MovimentoContas m
       JOIN Pessoas p ON m.fornecedor_id = p.id
       WHERE p.nome ILIKE $1 OR p.documento ILIKE $1
       GROUP BY p.id
       ORDER BY qtd DESC
       LIMIT 10`,
      [likeParam]
    );
    if (jrows.length) {
      let best = jrows[0];
      let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
      for (const r of jrows) {
        const sc = similarityScore(nameLike, r.nome || r.documento || '');
        if (sc > bestScore) { best = r; bestScore = sc; }
      }
      if (bestScore >= 0.3) return best;
    }
    if (tokens.length) {
      const likes = tokens.map(t => `%${t}%`);
      const orConds = tokens.map((_, i) => `(p.nome ILIKE $${i + 1} OR p.documento ILIKE $${i + 1})`).join(' OR ');
      const jtok = await dbQuery(
        `SELECT p.id, p.nome, p.documento, COUNT(m.id) as qtd
         FROM MovimentoContas m
         JOIN Pessoas p ON m.fornecedor_id = p.id
         WHERE ${orConds}
         GROUP BY p.id
         ORDER BY qtd DESC
         LIMIT 20`,
        likes
      );
      if (jtok.length) {
        let best = jtok[0];
        let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
        for (const r of jtok) {
          const sc = similarityScore(nameLike, r.nome || r.documento || '');
          if (sc > bestScore) { best = r; bestScore = sc; }
        }
        if (bestScore >= 0.3) return best;
      }
    }
    // Fallback final: escolher melhor candidato entre os mais frequentes
    const jall = await dbQuery(
      `SELECT p.id, p.nome, p.documento, COUNT(m.id) as qtd
       FROM MovimentoContas m
       JOIN Pessoas p ON m.fornecedor_id = p.id
       GROUP BY p.id
       ORDER BY qtd DESC
       LIMIT 100`
    );
    if (jall.length) {
      let best = jall[0];
      let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
      for (const r of jall) {
        const sc = similarityScore(nameLike, r.nome || r.documento || '');
        if (sc > bestScore) { best = r; bestScore = sc; }
      }
      return best;
    }
  } else {
    const jrows = await dbQuery(
      `SELECT p.id, p.nome, p.documento, COUNT(m.id) as qtd
       FROM MovimentoContas m
       JOIN Pessoas p ON m.faturado_id = p.id
       WHERE p.nome ILIKE $1 OR p.documento ILIKE $1
       GROUP BY p.id
       ORDER BY qtd DESC
       LIMIT 10`,
      [likeParam]
    );
    if (jrows.length) {
      let best = jrows[0];
      let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
      for (const r of jrows) {
        const sc = similarityScore(nameLike, r.nome || r.documento || '');
        if (sc > bestScore) { best = r; bestScore = sc; }
      }
      if (bestScore >= 0.3) return best;
    }
    if (tokens.length) {
      const likes = tokens.map(t => `%${t}%`);
      const orConds = tokens.map((_, i) => `(p.nome ILIKE $${i + 1} OR p.documento ILIKE $${i + 1})`).join(' OR ');
      const jtok = await dbQuery(
        `SELECT p.id, p.nome, p.documento, COUNT(m.id) as qtd
         FROM MovimentoContas m
         JOIN Pessoas p ON m.faturado_id = p.id
         WHERE ${orConds}
         GROUP BY p.id
         ORDER BY qtd DESC
         LIMIT 20`,
        likes
      );
      if (jtok.length) {
        let best = jtok[0];
        let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
        for (const r of jtok) {
          const sc = similarityScore(nameLike, r.nome || r.documento || '');
          if (sc > bestScore) { best = r; bestScore = sc; }
        }
        if (bestScore >= 0.3) return best;
      }
    }
    const jall = await dbQuery(
      `SELECT p.id, p.nome, p.documento, COUNT(m.id) as qtd
       FROM MovimentoContas m
       JOIN Pessoas p ON m.faturado_id = p.id
       GROUP BY p.id
       ORDER BY qtd DESC
       LIMIT 100`
    );
    if (jall.length) {
      let best = jall[0];
      let bestScore = similarityScore(nameLike, best.nome || best.documento || '');
      for (const r of jall) {
        const sc = similarityScore(nameLike, r.nome || r.documento || '');
        if (sc > bestScore) { best = r; bestScore = sc; }
      }
      return best;
    }
  }
  return null;
}

export async function tryNlqAnswer(queryText) {
  const q = normalize(queryText);
  if (!q) return null;

  // Detecções básicas
  const entity = detectEntity(q); // {type,name}
  const movType = detectMovementType(q); // 'ENTRADA' | 'SAIDA' | null
  const metric = detectMetric(q); // 'count' | 'sum' | 'list' | null
  const status = detectStatus(q); // 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO' | null
  const period = detectPeriod(q); // {start,end,label} | null

  // Construção de filtros
  let pessoa = null;
  let pessoaRel = null;
  if (entity.type && entity.name && entity.name.length >= 2) {
    pessoa = await lookupPessoaByEntity(entity.type, entity.name);
    pessoaRel = entity.type;
  }

  const where = [];
  const params = [];

  if (pessoa && pessoa.id) {
    if (pessoaRel === 'fornecedor') {
      params.push(pessoa.id);
      where.push(`fornecedor_id = $${params.length}`);
    } else {
      // cliente ou faturado -> usar faturado_id
      params.push(pessoa.id);
      where.push(`faturado_id = $${params.length}`);
    }
  }

  if (movType) {
    params.push(movType);
    where.push(`tipo_movimento = $${params.length}`);
  }

  if (status) {
    params.push(status);
    where.push(`status_pagamento = $${params.length}`);
  }

  if (period) {
    // Converter para YYYY-MM-DD
    const start = period.start.toISOString().slice(0, 10);
    const end = period.end.toISOString().slice(0, 10);
    params.push(start);
    where.push(`data_emissao >= $${params.length}`);
    params.push(end);
    where.push(`data_emissao <= $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Métrica padrão: se perguntar por "valores" ou não especificar, listar curtos
  const metricEff = metric || 'list';

  if (metricEff === 'avg') {
    const rows = await dbQuery(
      `SELECT COALESCE(AVG(valor_total),0) AS media, COUNT(*)::int AS qtd
       FROM MovimentoContas ${whereSql}`,
      params
    );
    const r = rows[0] || { media: 0, qtd: 0 };
    const tipo = movType === 'ENTRADA' ? 'de compra' : (movType === 'SAIDA' ? 'de venda' : '');
    const periodo = period ? ` ${period.label}` : '';
    const statusLbl = status ? ` ${lower(status)}` : '';
    const whoPhrase = pessoa
      ? (pessoaRel === 'fornecedor' ? `do fornecedor ${pessoa.nome}`
        : (pessoaRel === 'cliente' ? `do cliente ${pessoa.nome}`
        : `do faturado ${pessoa.nome}`))
      : '';
    const subject = `Média ${tipo}${whoPhrase ? ' ' + whoPhrase : ''}${periodo}${statusLbl}`;
    const answer = `${subject}: ${formatCurrencyBRL(r.media)} (em ${r.qtd} notas).`.replace(/\s+/g, ' ').trim();
    const srcMovs = await dbQuery(
      `SELECT id, numero_documento FROM MovimentoContas ${whereSql} ORDER BY data_emissao DESC LIMIT 3`,
      params
    );
    const sources = [
      ...(pessoa ? [{ id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' }] : []),
      ...srcMovs.map(m => ({ id: String(m.id), title: m.numero_documento, type: 'MovimentoContas' }))
    ];
    return { success: true, answer, sources };
  }

  if (metricEff === 'count') {
    const rows = await dbQuery(
      `SELECT COUNT(*)::int AS qtd, COALESCE(SUM(valor_total),0) AS soma
       FROM MovimentoContas ${whereSql}`,
      params
    );
    const r = rows[0] || { qtd: 0, soma: 0 };
    const tipo = movType === 'ENTRADA' ? 'de compra' : (movType === 'SAIDA' ? 'de venda' : '');
    const periodo = period ? ` ${period.label}` : '';
    const statusLbl = status ? ` ${lower(status)}` : '';
    const subjectPessoa = pessoa
      ? (pessoaRel === 'fornecedor' ? `O fornecedor ${pessoa.nome}`
        : (pessoaRel === 'cliente' ? `O cliente ${pessoa.nome}`
        : `O faturado ${pessoa.nome}`))
      : null;
    const qualifiers = `${tipo}${periodo}${statusLbl}`.trim();
    const afterNotas = qualifiers ? ` ${qualifiers}` : '';
    const notasTerm = r.qtd === 1 ? 'nota' : 'notas';
    const answer = (subjectPessoa
      ? `${subjectPessoa} possui ${r.qtd} ${notasTerm}${afterNotas}. Soma: ${formatCurrencyBRL(r.soma)}.`
      : `Foram encontradas ${r.qtd} ${notasTerm}${afterNotas}. Soma: ${formatCurrencyBRL(r.soma)}.`
    ).replace(/\s+/g, ' ').trim();
    const srcMovs = await dbQuery(
      `SELECT id, numero_documento FROM MovimentoContas ${whereSql} ORDER BY data_emissao DESC LIMIT 3`,
      params
    );
    const sources = [
      ...(pessoa ? [{ id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' }] : []),
      ...srcMovs.map(m => ({ id: String(m.id), title: m.numero_documento, type: 'MovimentoContas' }))
    ];
    return { success: true, answer, sources };
  }

  if (metricEff === 'sum') {
    const rows = await dbQuery(
      `SELECT COALESCE(SUM(valor_total),0) AS soma, COUNT(*)::int AS qtd
       FROM MovimentoContas ${whereSql}`,
      params
    );
    const r = rows[0] || { soma: 0, qtd: 0 };
    const tipo = movType === 'ENTRADA' ? 'de compra' : (movType === 'SAIDA' ? 'de venda' : '');
    const periodo = period ? ` ${period.label}` : '';
    const statusLbl = status ? ` ${lower(status)}` : '';
    const whoPhrase = pessoa
      ? (pessoaRel === 'fornecedor' ? `do fornecedor ${pessoa.nome}`
        : (pessoaRel === 'cliente' ? `do cliente ${pessoa.nome}`
        : `do faturado ${pessoa.nome}`))
      : '';
    const subject = `Total ${tipo}${whoPhrase ? ' ' + whoPhrase : ''}${periodo}${statusLbl}`;
    const notasTerm = r.qtd === 1 ? 'nota' : 'notas';
    const answer = `${subject}: ${formatCurrencyBRL(r.soma)} (em ${r.qtd} ${notasTerm}).`.replace(/\s+/g, ' ').trim();
    const srcMovs = await dbQuery(
      `SELECT id, numero_documento FROM MovimentoContas ${whereSql} ORDER BY data_emissao DESC LIMIT 3`,
      params
    );
    const sources = [
      ...(pessoa ? [{ id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' }] : []),
      ...srcMovs.map(m => ({ id: String(m.id), title: m.numero_documento, type: 'MovimentoContas' }))
    ];
    return { success: true, answer, sources };
  }

  // list
  const movs = await dbQuery(
    `SELECT id, numero_documento, data_emissao, valor_total, tipo_movimento
     FROM MovimentoContas ${whereSql}
     ORDER BY data_emissao DESC
     LIMIT 10`,
    params
  );
  const qtd = movs.length;
  if (qtd === 0) {
    const tipo = movType === 'ENTRADA' ? 'de compra' : (movType === 'SAIDA' ? 'de venda' : '');
    const periodo = period ? ` ${period.label}` : '';
    const statusLbl = status ? ` ${lower(status)}` : '';
    const subjectPessoa = pessoa
      ? (pessoaRel === 'fornecedor' ? `do fornecedor ${pessoa.nome}`
        : (pessoaRel === 'cliente' ? `do cliente ${pessoa.nome}`
        : `do faturado ${pessoa.nome}`))
      : null;
    const answer = (subjectPessoa
      ? `Não encontrei notas ${tipo} ${subjectPessoa}${periodo}${statusLbl}.`
      : `Não encontrei notas ${tipo}${periodo}${statusLbl}.`
    ).replace(/\s+/g, ' ').trim();
    const sources = pessoa ? [{ id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' }] : [];
    return { success: true, answer, sources };
  }
  const valores = movs.map(m => formatCurrencyBRL(m.valor_total));
  let listaValores = '';
  if (valores.length === 1) listaValores = `valor de ${valores[0]}`;
  else if (valores.length === 2) listaValores = `valores de ${valores[0]} e ${valores[1]}`;
  else {
    const primeiras = valores.slice(0, 3).join(', ');
    const resto = valores.length > 3 ? `, entre outras` : '';
    listaValores = `valores como ${primeiras}${resto}`;
  }
  const tipo = movType === 'ENTRADA' ? 'de compra' : (movType === 'SAIDA' ? 'de venda' : '');
  const periodo = period ? ` ${period.label}` : '';
  const statusLbl = status ? ` ${lower(status)}` : '';
  const subjectPessoa = pessoa
    ? (pessoaRel === 'fornecedor' ? `O fornecedor ${pessoa.nome}`
      : (pessoaRel === 'cliente' ? `O cliente ${pessoa.nome}`
      : `O faturado ${pessoa.nome}`))
    : null;
  const qualifiers = `${tipo}${periodo}${statusLbl}`.trim();
  const afterNotas = qualifiers ? ` ${qualifiers}` : '';
  const notasTerm = qtd === 1 ? 'nota' : 'notas';
  const answer = (subjectPessoa
    ? `${subjectPessoa} tem ${qtd} ${notasTerm}${afterNotas} com ${listaValores}.`
    : `Foram encontradas ${qtd} ${notasTerm}${afterNotas} com ${listaValores}.`
  ).replace(/\s+/g, ' ').trim();

  const sources = [
    ...(pessoa ? [{ id: String(pessoa.id), title: pessoa.nome, type: 'Pessoas' }] : []),
    ...movs.slice(0, 3).map(r => ({ id: String(r.id), title: r.numero_documento, type: 'MovimentoContas' }))
  ];
  return { success: true, answer, sources };
}