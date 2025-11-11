import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, healthCheck as dbHealthCheck } from './services/db.js';
import { ensureSchema as ensureRagSchema } from './services/embeddingStore.js';
import ragRouter from './routes/rag.js';

// Carregar sempre o .env localizado em agente3/.env, independente do cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3003;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(helmet());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.get('/api/health', async (_req, res) => {
  try {
    const dbOk = await dbHealthCheck();
    res.json({ ok: true, service: 'agente3', db: dbOk ? 'OK' : 'NOK' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

app.use('/api/rag', ragRouter);

async function start() {
  try {
    await pool.connect();
    await ensureRagSchema();
    app.listen(PORT, () => {
      console.log(`🚀 Agente3 (RAG) rodando na porta ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔎 RAG Simple: POST http://localhost:${PORT}/api/rag/simple`);
      console.log(`🧠 Embeddings Search: POST http://localhost:${PORT}/api/rag/embeddings/search`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar Agente3:', err);
    process.exit(1);
  }
}

start();