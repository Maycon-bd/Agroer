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

// ========= INDEXAÇÃO DE ESQUEMA (SCHEMA RAG) =========

function stringToStableIntId(str) {
  const s = String(str || '');
  let h = 7 >>> 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  // garantir signed 32-bit dentro de INTEGER do Postgres
  return h % 2147483647; // 2^31 - 1
}

function buildTableSchemaChunk(tableName, columns) {
  const cols = columns.map(c => `${c.column_name} (${c.data_type}${c.is_nullable === 'NO' ? ', NOT NULL' : ''})`).join(', ');
  return `Tabela ${tableName}:
Colunas: ${cols}
Objetivo: Contexto de esquema para geração de SQL válida neste banco.`;
}

export async function indexSchemaFromDb() {
  const model = getEmbeddingModel();
  // Listar tabelas do schema público
  const tables = await dbQuery(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`
  );

  for (const t of tables) {
    const tableName = t.table_name;
    const columns = await dbQuery(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );
    const text = buildTableSchemaChunk(tableName, columns);
    const emb = (await model.embedContent(text)).embedding.values;
    const refType = 'SCHEMA';
    const refId = stringToStableIntId(tableName);
    await dbQuery(
      `INSERT INTO rag_embeddings (ref_type, ref_id, text, embedding, metadata)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
       ON CONFLICT (ref_type, ref_id)
       DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata`,
      [refType, refId, text, JSON.stringify(emb), JSON.stringify({ table: tableName })]
    );
  }
}

export async function getSchemaChunksBySimilarity(queryText, { topK = 6 } = {}) {
  const model = getEmbeddingModel();
  const qEmb = (await model.embedContent(queryText)).embedding.values;
  const rows = await dbQuery(
    `SELECT id, ref_type, ref_id, text, embedding FROM rag_embeddings WHERE ref_type = 'SCHEMA'`
  );
  const scored = rows.map(r => {
    const emb = Array.isArray(r.embedding) ? r.embedding : r.embedding?.values || Object.values(r.embedding || {});
    const score = cosineSimilarity(qEmb, emb);
    return { id: String(r.id), text: r.text, score, metadata: { ref_type: r.ref_type, ref_id: r.ref_id } };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}