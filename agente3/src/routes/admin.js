import { Router } from 'express';
import { query as db } from '../services/db.js';

const router = Router();

function buildTokens(q) {
  const raw = String(q || '').trim();
  if (!raw) return [];
  return raw.split('&').map(s => s.trim()).filter(Boolean);
}

router.get('/pessoas/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const tipo = String(req.query.tipo || '').trim();
    const tokens = buildTokens(q);
    const filters = [];
    const params = [];
    if (tipo) { params.push(tipo); filters.push(`tipo_relacionamento = $${params.length}`); }
    if (tokens.length) {
      const ors = tokens.map((t, i) => {
        params.push(`%${t}%`);
        const p = `$${params.length}`;
        return `(nome ILIKE ${p} OR documento ILIKE ${p} OR email ILIKE ${p} OR telefone ILIKE ${p} OR cidade ILIKE ${p})`;
      }).join(' AND ');
      filters.push(ors);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const rows = await db(`SELECT id, nome, documento, tipo_relacionamento, ativo FROM Pessoas ${where} ORDER BY nome ASC LIMIT 100`, params);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.get('/pessoas/all', async (_req, res) => {
  try {
    const rows = await db(`SELECT id, nome, documento, tipo_relacionamento, ativo FROM Pessoas WHERE ativo = TRUE ORDER BY nome ASC LIMIT 100`);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.post('/pessoas', async (req, res) => {
  try {
    const { nome, documento, tipo_relacionamento } = req.body || {};
    if (!nome || !documento || !tipo_relacionamento) return res.status(400).json({ error: 'Campos obrigatórios' });
    const tipo_pessoa = String(documento).replace(/\D+/g, '').length > 11 ? 'JURIDICA' : 'FISICA';
    const rows = await db(`INSERT INTO Pessoas (nome, documento, tipo_relacionamento, tipo_pessoa, ativo) VALUES ($1,$2,$3,$4,TRUE) RETURNING id, nome, documento, tipo_relacionamento, ativo`, [nome, documento, tipo_relacionamento, tipo_pessoa]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.put('/pessoas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, documento, tipo_relacionamento } = req.body || {};
    const params = [];
    const sets = [];
    if (nome) { params.push(nome); sets.push(`nome = $${params.length}`); }
    if (documento) { params.push(documento); sets.push(`documento = $${params.length}`); }
    if (tipo_relacionamento) { params.push(tipo_relacionamento); sets.push(`tipo_relacionamento = $${params.length}`); }
    if (!sets.length) return res.status(400).json({ error: 'Sem alterações' });
    params.push(id);
    const rows = await db(`UPDATE Pessoas SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id, nome, documento, tipo_relacionamento, ativo`, params);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.post('/pessoas/:id/inactivate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await db(`UPDATE Pessoas SET ativo = FALSE WHERE id = $1 RETURNING id, nome, documento, tipo_relacionamento, ativo`, [id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.get('/classificacao/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const tipo = String(req.query.tipo || '').trim();
    const tokens = buildTokens(q);
    const filters = [];
    const params = [];
    if (tipo) { params.push(tipo); filters.push(`tipo = $${params.length}`); }
    if (tokens.length) {
      const ors = tokens.map((t, i) => {
        params.push(`%${t}%`);
        const p = `$${params.length}`;
        return `(descricao ILIKE ${p} OR categoria ILIKE ${p} OR subcategoria ILIKE ${p})`;
      }).join(' AND ');
      filters.push(ors);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const rows = await db(`SELECT id, descricao, tipo, categoria, subcategoria, ativo FROM Classificacao ${where} ORDER BY descricao ASC LIMIT 100`, params);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.get('/classificacao/all', async (req, res) => {
  try {
    const tipo = String(req.query.tipo || '').trim();
    const params = [];
    const where = tipo ? `WHERE tipo = $1 AND ativo = TRUE` : `WHERE ativo = TRUE`;
    if (tipo) params.push(tipo);
    const rows = await db(`SELECT id, descricao, tipo, categoria, subcategoria, ativo FROM Classificacao ${where} ORDER BY descricao ASC LIMIT 100`, params);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.post('/classificacao', async (req, res) => {
  try {
    const { descricao, tipo, categoria, subcategoria } = req.body || {};
    if (!descricao || !tipo) return res.status(400).json({ error: 'Campos obrigatórios' });
    const rows = await db(`INSERT INTO Classificacao (descricao, tipo, categoria, subcategoria, ativo) VALUES ($1,$2,$3,$4,TRUE) RETURNING id, descricao, tipo, categoria, subcategoria, ativo`, [descricao, tipo, categoria || null, subcategoria || null]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.put('/classificacao/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { descricao, tipo, categoria, subcategoria } = req.body || {};
    const params = [];
    const sets = [];
    if (descricao) { params.push(descricao); sets.push(`descricao = $${params.length}`); }
    if (tipo) { params.push(tipo); sets.push(`tipo = $${params.length}`); }
    if (categoria !== undefined) { params.push(categoria || null); sets.push(`categoria = $${params.length}`); }
    if (subcategoria !== undefined) { params.push(subcategoria || null); sets.push(`subcategoria = $${params.length}`); }
    if (!sets.length) return res.status(400).json({ error: 'Sem alterações' });
    params.push(id);
    const rows = await db(`UPDATE Classificacao SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id, descricao, tipo, categoria, subcategoria, ativo`, params);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.post('/classificacao/:id/inactivate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await db(`UPDATE Classificacao SET ativo = FALSE WHERE id = $1 RETURNING id, descricao, tipo, categoria, subcategoria, ativo`, [id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.get('/movimentos/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const tokens = buildTokens(q);
    const filters = [];
    const params = [];
    if (tokens.length) {
      const ors = tokens.map((t, i) => {
        params.push(`%${t}%`);
        const p = `$${params.length}`;
        return `(m.numero_documento ILIKE ${p} OR m.descricao ILIKE ${p} OR pf.nome ILIKE ${p} OR pf.documento ILIKE ${p} OR pt.nome ILIKE ${p} OR pt.documento ILIKE ${p})`;
      }).join(' AND ');
      filters.push(ors);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const rows = await db(`SELECT m.id, m.numero_documento, m.data_emissao, m.valor_total, m.tipo_movimento, m.status_pagamento FROM MovimentoContas m LEFT JOIN Pessoas pf ON m.fornecedor_id = pf.id LEFT JOIN Pessoas pt ON m.faturado_id = pt.id ${where} ORDER BY m.data_emissao DESC LIMIT 100`, params);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.post('/movimentos', async (req, res) => {
  try {
    const { numero_documento, data_emissao, data_vencimento, descricao, observacoes, valor_total, tipo_movimento, status_pagamento, fornecedor_id, faturado_id, parcelas, classificacoes } = req.body || {};
    if (!data_emissao || !valor_total || !tipo_movimento) return res.status(400).json({ error: 'Campos obrigatórios' });
    const sp = status_pagamento && ['PENDENTE','PAGO','VENCIDO','CANCELADO'].includes(status_pagamento) ? status_pagamento : 'PENDENTE';
    const insertMov = await db(
      `INSERT INTO MovimentoContas (numero_documento, data_emissao, data_vencimento, descricao, observacoes, valor_total, tipo_movimento, status_pagamento, fornecedor_id, faturado_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [numero_documento || null, data_emissao, data_vencimento || null, descricao || null, observacoes || null, Number(valor_total), tipo_movimento, sp, fornecedor_id || null, faturado_id || null]
    );
    const movId = insertMov[0]?.id;
    if (!movId) return res.status(500).json({ error: 'Falha ao criar movimento' });

    if (Array.isArray(parcelas)) {
      for (const p of parcelas) {
        const np = Number(p?.numero_parcela);
        const dv = p?.data_vencimento || null;
        const vp = Number(p?.valor_parcela);
        if (!np || !dv || !vp) continue;
        await db(`INSERT INTO ParcelasContas (movimento_id, numero_parcela, data_vencimento, valor_parcela) VALUES ($1,$2,$3,$4)`, [movId, np, dv, vp]);
      }
    }

    if (Array.isArray(classificacoes)) {
      for (const c of classificacoes) {
        const cid = Number(c?.classificacao_id);
        const vc = Number(c?.valor_classificacao);
        const perc = c?.percentual !== undefined ? Number(c?.percentual) : null;
        const jus = c?.justificativa || null;
        if (!cid || !vc) continue;
        await db(`INSERT INTO MovimentoContas_has_Classificacao (movimento_id, classificacao_id, valor_classificacao, percentual, justificativa) VALUES ($1,$2,$3,$4,$5)`, [movId, cid, vc, perc, jus]);
      }
    }

    res.json({ id: movId });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.put('/movimentos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { numero_documento, data_emissao, data_vencimento, descricao, valor_total, tipo_movimento, status_pagamento } = req.body || {};
    const params = [];
    const sets = [];
    if (numero_documento !== undefined) { params.push(numero_documento || null); sets.push(`numero_documento = $${params.length}`); }
    if (data_emissao !== undefined) { params.push(data_emissao || null); sets.push(`data_emissao = $${params.length}`); }
    if (data_vencimento !== undefined) { params.push(data_vencimento || null); sets.push(`data_vencimento = $${params.length}`); }
    if (descricao !== undefined) { params.push(descricao || null); sets.push(`descricao = $${params.length}`); }
    if (valor_total !== undefined) { params.push(Number(valor_total)); sets.push(`valor_total = $${params.length}`); }
    if (tipo_movimento !== undefined) { params.push(tipo_movimento); sets.push(`tipo_movimento = $${params.length}`); }
    if (status_pagamento !== undefined) { params.push(status_pagamento); sets.push(`status_pagamento = $${params.length}`); }
    if (!sets.length) return res.status(400).json({ error: 'Sem alterações' });
    params.push(id);
    await db(`UPDATE MovimentoContas SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

// Atualizar classificações de um movimento (substitui todas)
router.post('/movimentos/:id/classificacoes', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const classificacoes = Array.isArray(req.body?.classificacoes) ? req.body.classificacoes : [];
    await db(`DELETE FROM MovimentoContas_has_Classificacao WHERE movimento_id = $1`, [id]);
    for (const c of classificacoes) {
      const cid = Number(c?.classificacao_id);
      const vc = Number(c?.valor_classificacao);
      const perc = c?.percentual !== undefined ? Number(c?.percentual) : null;
      const jus = c?.justificativa || null;
      if (!cid || !vc) continue;
      await db(`INSERT INTO MovimentoContas_has_Classificacao (movimento_id, classificacao_id, valor_classificacao, percentual, justificativa) VALUES ($1,$2,$3,$4,$5)`, [id, cid, vc, perc, jus]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

// Atualizar parcelas de um movimento (substitui todas)
router.post('/movimentos/:id/parcelas', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parcelas = Array.isArray(req.body?.parcelas) ? req.body.parcelas : [];
    await db(`DELETE FROM ParcelasContas WHERE movimento_id = $1`, [id]);
    for (const p of parcelas) {
      const np = Number(p?.numero_parcela);
      const dv = p?.data_vencimento || null;
      const vp = Number(p?.valor_parcela);
      if (!np || !dv || !vp) continue;
      await db(`INSERT INTO ParcelasContas (movimento_id, numero_parcela, data_vencimento, valor_parcela) VALUES ($1,$2,$3,$4)`, [id, np, dv, vp]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.post('/movimentos/:id/inactivate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db(`UPDATE MovimentoContas SET status_pagamento = 'CANCELADO' WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

export default router;

// Unified search across Pessoas, Classificacao, MovimentoContas
router.get('/unified/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize || 25)));
    const offset = (page - 1) * pageSize;

    const tokens = buildTokens(q);
    const paramsP = [];
    const paramsC = [];
    const paramsM = [];
    const filtersP = [];
    const filtersC = [];
    const filtersM = [];
    if (tokens.length) {
      const orsP = tokens.map(t => {
        paramsP.push(`%${t}%`);
        const p = `$${paramsP.length}`;
        return `(p.nome ILIKE ${p} OR p.documento ILIKE ${p} OR p.email ILIKE ${p} OR p.telefone ILIKE ${p})`;
      }).join(' AND ');
      filtersP.push(orsP);
      const orsC = tokens.map(t => {
        paramsC.push(`%${t}%`);
        const p = `$${paramsC.length}`;
        return `(c.descricao ILIKE ${p} OR c.categoria ILIKE ${p} OR c.subcategoria ILIKE ${p})`;
      }).join(' AND ');
      filtersC.push(orsC);
      const orsM = tokens.map(t => {
        paramsM.push(`%${t}%`);
        const p = `$${paramsM.length}`;
        return `(m.numero_documento ILIKE ${p} OR m.descricao ILIKE ${p} OR pf.nome ILIKE ${p} OR pt.nome ILIKE ${p} OR pf.documento ILIKE ${p} OR pt.documento ILIKE ${p} OR cc.descricao ILIKE ${p})`;
      }).join(' AND ');
      filtersM.push(orsM);
    }
    const whereP = filtersP.length ? `WHERE ${filtersP.join(' AND ')}` : '';
    const whereC = filtersC.length ? `WHERE ${filtersC.join(' AND ')}` : '';
    const whereM = filtersM.length ? `WHERE ${filtersM.join(' AND ')}` : '';
    const pessoas = await db(`SELECT p.id, p.nome, p.documento, p.tipo_relacionamento AS rel, p.ativo FROM Pessoas p ${whereP} ORDER BY p.nome ASC LIMIT 50`, paramsP);
    const classif = await db(`SELECT c.id, c.descricao, c.tipo, c.categoria, c.subcategoria, c.ativo FROM Classificacao c ${whereC} ORDER BY c.descricao ASC LIMIT 50`, paramsC);
    paramsM.push(pageSize, offset);
    const movs = await db(`
      SELECT m.id,
             m.numero_documento,
             m.data_emissao,
             m.data_vencimento,
             m.descricao,
             m.valor_total,
             m.tipo_movimento,
             m.status_pagamento,
             pf.id AS fornecedor_id,
             pf.nome AS fornecedor_nome,
             pf.documento AS fornecedor_doc,
             pf.tipo_relacionamento AS fornecedor_tipo,
             pt.id AS faturado_id,
             pt.nome AS faturado_nome,
             pt.documento AS faturado_doc,
             pt.tipo_relacionamento AS faturado_tipo,
             COALESCE(string_agg(DISTINCT cc.descricao, ' | '), '') AS classificacoes,
             COALESCE(string_agg(DISTINCT cc.categoria, ' | '), '') AS categorias,
             COALESCE(COUNT(DISTINCT pc.id), 0) AS parcelas_count
      FROM MovimentoContas m
      LEFT JOIN Pessoas pf ON m.fornecedor_id = pf.id
      LEFT JOIN Pessoas pt ON m.faturado_id = pt.id
      LEFT JOIN MovimentoContas_has_Classificacao mc ON mc.movimento_id = m.id
      LEFT JOIN Classificacao cc ON cc.id = mc.classificacao_id
      LEFT JOIN ParcelasContas pc ON pc.movimento_id = m.id
      ${whereM}
      GROUP BY m.id, pf.id, pf.nome, pf.documento, pf.tipo_relacionamento, pt.id, pt.nome, pt.documento, pt.tipo_relacionamento
      ORDER BY m.data_emissao DESC
      LIMIT $${paramsM.length - 1} OFFSET $${paramsM.length}
    `, paramsM);
    const items = [
      ...pessoas.map(p => ({ type: 'Pessoas', id: p.id, title: p.nome, documento: p.documento, rel: p.rel, ativo: p.ativo })),
      ...classif.map(c => ({ type: 'Classificacao', id: c.id, title: c.descricao, tipo: c.tipo, categoria: c.categoria, subcategoria: c.subcategoria, ativo: c.ativo })),
      ...movs.map(m => ({ type: 'MovimentoContas', id: m.id, numero_documento: m.numero_documento, data_emissao: m.data_emissao, data_vencimento: m.data_vencimento, descricao: m.descricao, valor_total: m.valor_total, tipo_movimento: m.tipo_movimento, status_pagamento: m.status_pagamento, fornecedor_id: m.fornecedor_id, fornecedor_nome: m.fornecedor_nome, fornecedor_doc: m.fornecedor_doc, fornecedor_tipo: m.fornecedor_tipo, faturado_id: m.faturado_id, faturado_nome: m.faturado_nome, faturado_doc: m.faturado_doc, faturado_tipo: m.faturado_tipo, classificacoes: m.classificacoes, categorias: m.categorias, parcelas_count: Number(m.parcelas_count) })),
    ];
    res.json({ items, page, pageSize });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.get('/unified/all', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize || 25)));
    const offset = (page - 1) * pageSize;
    const pessoas = await db(`SELECT p.id, p.nome, p.documento, p.tipo_relacionamento AS rel, p.ativo FROM Pessoas p WHERE p.ativo = TRUE ORDER BY p.nome ASC LIMIT 50`);
    const classif = await db(`SELECT c.id, c.descricao, c.tipo, c.categoria, c.subcategoria, c.ativo FROM Classificacao c WHERE c.ativo = TRUE ORDER BY c.descricao ASC LIMIT 50`);
    const movs = await db(`
      SELECT m.id,
             m.numero_documento,
             m.data_emissao,
             m.data_vencimento,
             m.descricao,
             m.valor_total,
             m.tipo_movimento,
             m.status_pagamento,
             pf.id AS fornecedor_id,
             pf.nome AS fornecedor_nome,
             pf.documento AS fornecedor_doc,
             pf.tipo_relacionamento AS fornecedor_tipo,
             pt.id AS faturado_id,
             pt.nome AS faturado_nome,
             pt.documento AS faturado_doc,
             pt.tipo_relacionamento AS faturado_tipo,
             COALESCE(string_agg(DISTINCT cc.descricao, ' | '), '') AS classificacoes,
             COALESCE(string_agg(DISTINCT cc.categoria, ' | '), '') AS categorias,
             COALESCE(COUNT(DISTINCT pc.id), 0) AS parcelas_count
      FROM MovimentoContas m
      LEFT JOIN Pessoas pf ON m.fornecedor_id = pf.id
      LEFT JOIN Pessoas pt ON m.faturado_id = pt.id
      LEFT JOIN MovimentoContas_has_Classificacao mc ON mc.movimento_id = m.id
      LEFT JOIN Classificacao cc ON cc.id = mc.classificacao_id
      LEFT JOIN ParcelasContas pc ON pc.movimento_id = m.id
      GROUP BY m.id, pf.id, pf.nome, pf.documento, pf.tipo_relacionamento, pt.id, pt.nome, pt.documento, pt.tipo_relacionamento
      ORDER BY m.data_emissao DESC
      LIMIT $1 OFFSET $2
    `, [pageSize, offset]);
    const items = [
      ...pessoas.map(p => ({ type: 'Pessoas', id: p.id, title: p.nome, documento: p.documento, rel: p.rel, ativo: p.ativo })),
      ...classif.map(c => ({ type: 'Classificacao', id: c.id, title: c.descricao, tipo: c.tipo, categoria: c.categoria, subcategoria: c.subcategoria, ativo: c.ativo })),
      ...movs.map(m => ({ type: 'MovimentoContas', id: m.id, numero_documento: m.numero_documento, data_emissao: m.data_emissao, data_vencimento: m.data_vencimento, descricao: m.descricao, valor_total: m.valor_total, tipo_movimento: m.tipo_movimento, status_pagamento: m.status_pagamento, fornecedor_id: m.fornecedor_id, fornecedor_nome: m.fornecedor_nome, fornecedor_doc: m.fornecedor_doc, fornecedor_tipo: m.fornecedor_tipo, faturado_id: m.faturado_id, faturado_nome: m.faturado_nome, faturado_doc: m.faturado_doc, faturado_tipo: m.faturado_tipo, classificacoes: m.classificacoes, categorias: m.categorias, parcelas_count: Number(m.parcelas_count) })),
    ];
    res.json({ items, page, pageSize });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});
