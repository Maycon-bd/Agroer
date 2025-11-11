import { getEmbeddingModel } from './geminiService.js';
import { query as dbQuery } from './db.js';

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

export async function ensureSchema() {
  await dbQuery(`CREATE TABLE IF NOT EXISTS rag_embeddings (
    id SERIAL PRIMARY KEY,
    ref_type TEXT NOT NULL,
    ref_id INTEGER,
    text TEXT NOT NULL,
    embedding JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ref_type, ref_id)
  )`);
}

async function upsertEmbedding(refType, refId, text, embedding, metadata = {}) {
  await dbQuery(
    `INSERT INTO rag_embeddings (ref_type, ref_id, text, embedding, metadata)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
     ON CONFLICT (ref_type, ref_id)
     DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata`,
    [refType, refId, text, JSON.stringify(embedding), JSON.stringify(metadata)]
  );
}

export async function indexFromDb() {
  const model = getEmbeddingModel();

  // Pessoas
  const pessoas = await dbQuery(`SELECT id, nome, documento, tipo_relacionamento FROM Pessoas LIMIT 500`);
  for (const p of pessoas) {
    const text = `Pessoa ${p.nome} (${p.documento}) relacionamento=${p.tipo_relacionamento}`;
    const emb = (await model.embedContent(text)).embedding.values;
    await upsertEmbedding('Pessoas', p.id, text, emb, { nome: p.nome, documento: p.documento });
  }

  // MovimentoContas
  const movs = await dbQuery(`SELECT id, numero_documento, descricao, valor_total, tipo_movimento FROM MovimentoContas LIMIT 1000`);
  for (const m of movs) {
    const text = `Movimento ${m.numero_documento} tipo=${m.tipo_movimento} valor=${m.valor_total} descricao=${m.descricao ?? ''}`;
    const emb = (await model.embedContent(text)).embedding.values;
    await upsertEmbedding('MovimentoContas', m.id, text, emb, { numero_documento: m.numero_documento });
  }

  // Classificacao
  const cls = await dbQuery(`SELECT id, descricao, categoria, subcategoria FROM Classificacao LIMIT 500`);
  for (const c of cls) {
    const text = `Classificacao ${c.descricao} categoria=${c.categoria ?? ''} subcategoria=${c.subcategoria ?? ''}`;
    const emb = (await model.embedContent(text)).embedding.values;
    await upsertEmbedding('Classificacao', c.id, text, emb, { descricao: c.descricao });
  }
}

export async function embedQueryAndSearch(queryText, { topK = 8 } = {}) {
  const model = getEmbeddingModel();
  const qEmb = (await model.embedContent(queryText)).embedding.values;
  const rows = await dbQuery(`SELECT id, ref_type, ref_id, text, embedding FROM rag_embeddings`);
  const scored = rows.map(r => {
    const emb = Array.isArray(r.embedding) ? r.embedding : r.embedding?.values || Object.values(r.embedding || {});
    const score = cosineSimilarity(qEmb, emb);
    return { id: String(r.id), text: r.text, score, metadata: { ref_type: r.ref_type, ref_id: r.ref_id } };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}