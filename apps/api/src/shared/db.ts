import pg from 'pg';

// Pool perezoso: la API arranca sin PostgreSQL; solo los módulos que persisten lo piden.
let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL no está configurada');
  pool ??= new pg.Pool({ connectionString, max: 5 });
  return pool;
}

export async function closePool(): Promise<void> {
  await pool?.end();
  pool = undefined;
}
