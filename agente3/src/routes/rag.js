import { Router } from 'express';
import { ragSimple, ragEmbeddingsSearch, getSourceDetails } from '../services/ragService.js';
import { indexFromDb } from '../services/embeddingStore.js';

const router = Router();

router.post('/simple', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Parâmetro "query" é obrigatório.' });
    }
    const result = await ragSimple(query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

router.post('/embeddings/search', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Parâmetro "query" é obrigatório.' });
    }
    const result = await ragEmbeddingsSearch(query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

// Opcional: endpoint para indexar embeddings a partir do DB
router.post('/embeddings/index', async (_req, res) => {
  try {
    await indexFromDb();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

// Detalhes de uma fonte por tipo e id
router.get('/source/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const details = await getSourceDetails(type, id);
    if (!details) return res.status(404).json({ success: false, error: 'Fonte não encontrada.' });
    res.json({ success: true, details });
  } catch (e) {
    res.status(400).json({ success: false, error: e instanceof Error ? e.message : 'Erro desconhecido' });
  }
});

export default router;