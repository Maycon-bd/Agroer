import pg from 'pg';

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'Agroer',
  DB_USER = 'postgres',
  DB_PASSWORD = 'admin',
} = process.env;

export const pool = new pg.Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function healthCheck() {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    return result.rows?.[0]?.ok === 1;
  } catch {
    return false;
  }
}

export async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}