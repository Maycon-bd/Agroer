const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const validationRoutes = require('./routes/validationRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
});
app.use(limiter);

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para log de requisições (debug)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body recebido:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Rotas
app.use('/api/validation', validationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Agente2 - Database Validator',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Agente2 (Database Validator) rodando na porta ${PORT}`);
  console.log(`📊 Health check disponível em: http://localhost:${PORT}/api/health`);
  console.log(`🔍 API de validação em: http://localhost:${PORT}/api/validation`);
});