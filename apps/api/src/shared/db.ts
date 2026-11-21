import pg from 'pg';
import { AppError } from './errors.js';

// Acceso compartido a PostgreSQL. La API arranca sin DATABASE_URL; los módulos con persistencia usan
// requireDatabase() o isDatabaseConfigured() y responden MODULE_UNAVAILABLE si no hay BD.

let pool: pg.Pool | undefined;

export type QueryResultRow = pg.QueryResultRow;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function poolSsl(connectionString: string): pg.PoolConfig['ssl'] | undefined {
  const explicit = process.env.DATABASE_SSL;
  const wantsSsl =
    explicit === 'true' ||
    (explicit !== 'false' && /\bsslmode=(require|verify-full|verify-ca|prefer)\b/i.test(connectionString));
  if (!wantsSsl) return undefined;
  return { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true' };
}

function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error('DATABASE_URL no está configurada');
  const max = Number(process.env.DATABASE_POOL_MAX ?? 5);
  return new pg.Pool({ connectionString, max, ssl: poolSsl(connectionString) });
}

/** Pool perezoso; solo para scripts (migrate/seed) y uso interno tras requireDatabase(). */
export function getPool(): pg.Pool {
  pool ??= createPool();
  return pool;
}

/** Lanza 503 MODULE_UNAVAILABLE si no hay DATABASE_URL (mismo estilo que módulos sin adaptador). */
export function requireDatabase(): pg.Pool {
  if (!isDatabaseConfigured()) {
    throw new AppError(503, 'MODULE_UNAVAILABLE', 'Base de datos no configurada');
  }
  return getPool();
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return requireDatabase().query<T>(text, params);
}

export type DatabaseHealth = {
  configured: boolean;
  connected: boolean;
};

/** Para /health: no lanza; prueba conectividad solo si hay DATABASE_URL. */
export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  if (!isDatabaseConfigured()) return { configured: false, connected: false };
  try {
    await getPool().query('SELECT 1');
    return { configured: true, connected: true };
  } catch (err) {
    console.error('health: fallo al conectar con PostgreSQL', err);
    return { configured: true, connected: false };
  }
}

export async function closePool(): Promise<void> {
  await pool?.end();
  pool = undefined;
}