import { Pool } from 'pg';

let pool: Pool;

export function initDb(connectionString: string) {
  pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
}

export function getDb() {
  if (!pool) throw new Error('Database not initialized');
  return pool;
}
