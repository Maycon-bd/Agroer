const { Pool } = require('pg');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'agroer_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite para conexões inativas
  connectionTimeoutMillis: 2000, // tempo limite para estabelecer conexão
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com PostgreSQL:', err);
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('🔗 Teste de conexão bem-sucedido:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Falha no teste de conexão:', err);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};