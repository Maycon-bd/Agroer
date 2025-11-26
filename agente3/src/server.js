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
import { indexFromDb, indexSchemaFromDb } from './services/embeddingStore.js';
import adminRouter from './routes/admin.js';

// Carregar sempre o .env localizado em agente3/.env, independente do cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3004;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.json({ limit: '1mb' }));
const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
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
app.use('/api/admin', adminRouter);

async function start() {
  console.log('Inicializando Agente3...');
  let dbReady = false;
  try {
    console.log('Conectando ao banco...');
    await pool.connect();
    console.log('Banco conectado. Assegurando schema RAG...');
    await ensureRagSchema();
    dbReady = true;
  } catch (err) {
    console.error('❌ Banco de dados indisponível ao iniciar Agente3:', err?.message || err);
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Agente3 (RAG/Admin) rodando na porta ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health (db=${dbReady ? 'OK' : 'NOK'})`);
    console.log(`🔎 RAG Simple: POST http://localhost:${PORT}/api/rag/simple`);
    console.log(`🧠 Embeddings Search: POST http://localhost:${PORT}/api/rag/embeddings/search`);
  });
  setImmediate(async () => {
    try {
      console.log('Indexando embeddings/schema em background...');
      await indexFromDb();
      await indexSchemaFromDb();
      console.log('✅ Embeddings e schema indexados para RAG.');
    } catch (e) {
      console.warn('⚠️ Falha ao indexar embeddings/schema no background:', e?.message || e);
    }
  });
}

process.on('uncaughtException', (err) => {
  console.error('UncaughtException:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection:', reason instanceof Error ? reason.message : String(reason));
});

start();
