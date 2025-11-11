import dotenv from 'dotenv';
import { pool } from '../services/db.js';
import { ensureSchema, indexFromDb } from '../services/embeddingStore.js';

dotenv.config();

async function main() {
  console.log('🧠 Iniciando indexação de embeddings (Agente3)...');
  try {
    // Garante conexão com o banco e schema de embeddings
    await pool.connect();
    await ensureSchema();

    const startedAt = Date.now();
    await indexFromDb();
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log(`✅ Indexação concluída em ${elapsed}s.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha na indexação de embeddings:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();