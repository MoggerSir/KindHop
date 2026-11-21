import pg from 'pg';
import { AppError } from './errors.js';

// Acceso compartido a PostgreSQL. La API arranca sin DATABASE_URL; los módulos con persistencia usan
// requireDatabase() o isDatabaseConfigured() y responden 503 DATABASE_UNAVAILABLE.

let pool: pg.Pool | undefined;

const DEFAULT_CONNECTION_TIMEOUT_MS = 3_000;

export type QueryResultRow = pg.QueryResultRow;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function connectionStringHasSslMode(connectionString: string): boolean {
  return /\bsslmode=/i.test(connectionString);
}

/**
 * Opciones SSL del pool. Con pg 8.23, `sslmode` en DATABASE_URL sustituye la config `ssl` del pool:
 * si la URL ya trae sslmode (Neon/Supabase), no pasamos `ssl` aquí.
 */
function poolSsl(connectionString: string): pg.PoolConfig['ssl'] | undefined {
  if (connectionStringHasSslMode(connectionString)) return undefined;
  if (process.env.DATABASE_SSL !== 'true') return undefined;
  const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';
  return { rejectUnauthorized };
}

function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error('DATABASE_URL no está configurada');
  const max = Number(process.env.DATABASE_POOL_MAX ?? 5);
  const connectionTimeoutMillis = Number(
    process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? DEFAULT_CONNECTION_TIMEOUT_MS,
  );
  return new pg.Pool({
    connectionString,
    max,
    ssl: poolSsl(connectionString),
    connectionTimeoutMillis,
  });
}

/** Pool perezoso; solo para scripts (migrate/seed) y uso interno tras requireDatabase(). */
export function getPool(): pg.Pool {
  pool ??= createPool();
  return pool;
}

/** Lanza 503 DATABASE_UNAVAILABLE si no hay DATABASE_URL. */
export function requireDatabase(): pg.Pool {
  if (!isDatabaseConfigured()) {
    throw new AppError(503, 'DATABASE_UNAVAILABLE', 'La base de datos no está configurada');
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

/** Para /health: no lanza; prueba conectividad solo si hay DATABASE_URL (respeta connectionTimeoutMillis). */
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