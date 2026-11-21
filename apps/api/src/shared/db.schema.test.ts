import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import './env.js';
import { closePool, getPool } from './db.js';

// Reglas de datos que hace cumplir PostgreSQL (db/migrations/0002_mvp_schema.sql y 0003_source_id_not_null.sql).
// Necesita DATABASE_URL con migraciones y seeds aplicados; sin ella se salta (npm run check en local).
// La CI la corre con PostgreSQL. Cada prueba escribe dentro de una transacción que se deshace.
const skip = !process.env.DATABASE_URL && 'sin DATABASE_URL';

// Ejecuta `sql` dentro de una transacción que siempre se deshace y devuelve el código de error de PostgreSQL (o null).
async function errorCode(sql: string, params: unknown[] = []): Promise<string | null> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(sql, params);
    return null;
  } catch (err) {
    return (err as { code?: string }).code ?? 'UNKNOWN';
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
}

const CHECK = '23514';
const FOREIGN_KEY = '23503';
const NOT_NULL = '23502';
const UNIQUE = '23505';
// source_id va siempre: 0003 lo exige. source_url del evento es otra columna (el enlace) y sigue pudiendo ser nulo en DEMO.
const event = `INSERT INTO events (city_id, source_id, title, starts_at, data_status, source_url, image_url, image_author, image_license, image_source_url)
               VALUES ('cancun', 'kindhop-demo', 'x', now() + interval '1 day', $1, $2, $3, $4, $5, $6)`;

describe('esquema de datos', { skip }, () => {
  after(closePool);

  it('un evento REAL sin fuente se rechaza; uno DEMO sin fuente se acepta', async () => {
    assert.equal(await errorCode(event, ['REAL', null, null, null, null, null]), CHECK);
    assert.equal(await errorCode(event, ['DEMO', null, null, null, null, null]), null);
  });

  it('una foto de evento sin autor/licencia/fuente se rechaza', async () => {
    assert.equal(await errorCode(event, ['DEMO', null, '/x.jpg', null, null, null]), CHECK);
    assert.equal(await errorCode(event, ['DEMO', null, '/x.jpg', 'Autor', 'CC0', 'https://commons.wikimedia.org/x']), null);
  });

  it('una categoría que no existe se rechaza', async () => {
    const sql = `INSERT INTO places (city_id, source_id, name, category, lat, lon) VALUES ('cancun', 'kindhop-demo', 'x', $1, 21, -86)`;
    assert.equal(await errorCode(sql, ['no-existe']), FOREIGN_KEY);
    assert.equal(await errorCode(sql, ['parks']), null);
  });

  it('una incidencia que caduca antes de crearse se rechaza', async () => {
    const sql = `INSERT INTO urban_reports (city_id, lat, lon, kind, expires_at) VALUES ('cancun', 21.16, -86.82, 'FLOOD', now() - interval '1 minute')`;
    assert.equal(await errorCode(sql), CHECK);
  });

  it('los seeds dejan eventos DEMO futuros en ambas ciudades', async () => {
    const { rows } = await getPool().query<{ city_id: string; stale: string }>(
      `SELECT city_id, count(*) FILTER (WHERE ends_at <= now())::text AS stale
       FROM events WHERE data_status = 'DEMO' AND source_id = 'kindhop-demo'
       GROUP BY city_id ORDER BY city_id`,
    );
    assert.deepEqual(rows.map((r) => r.city_id), ['cancun', 'cdmx']);
    assert.ok(rows.every((r) => r.stale === '0'), 'ningún evento DEMO debe haber terminado');
  });

  it('source_id es obligatorio en places y events', async () => {
    const { rows } = await getPool().query<{ table_name: string; is_nullable: string }>(
      `SELECT table_name, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND column_name = 'source_id' AND table_name IN ('places', 'events')
       ORDER BY table_name`,
    );
    assert.deepEqual(rows, [
      { table_name: 'events', is_nullable: 'NO' },
      { table_name: 'places', is_nullable: 'NO' },
    ]);
    const place = `INSERT INTO places (city_id, name, category, lat, lon, data_status)
                   VALUES ('cancun', 'sin fuente', 'parks', 21, -86, 'DEMO')`;
    const ev = `INSERT INTO events (city_id, title, starts_at, data_status)
                VALUES ('cancun', 'sin fuente', now() + interval '1 day', 'DEMO')`;
    assert.equal(await errorCode(place), NOT_NULL);
    assert.equal(await errorCode(ev), NOT_NULL);
  });

  it('places ya no tiene source_name, source_url ni license; events.source_url sigue', async () => {
    const { rows: legado } = await getPool().query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'places'
         AND column_name IN ('source_name', 'source_url', 'license')
       ORDER BY column_name`,
    );
    assert.deepEqual(legado, []);
    const { rows: enlace } = await getPool().query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'source_url'`,
    );
    assert.deepEqual(enlace.map((row) => row.column_name), ['source_url']);
  });

  it('el único (source_id, external_id) sigue y el upsert no duplica', async () => {
    const { rows } = await getPool().query<{ tabla: string; definicion: string }>(
      `SELECT rel.relname AS tabla, pg_get_constraintdef(con.oid) AS definicion
       FROM pg_constraint con
       JOIN pg_class rel ON rel.oid = con.conrelid
       JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
       WHERE nsp.nspname = 'public'
         AND rel.relname IN ('places', 'events')
         AND con.contype = 'u'
         AND pg_get_constraintdef(con.oid) LIKE '%(source_id, external_id)%'
       ORDER BY rel.relname`,
    );
    assert.deepEqual(rows, [
      { tabla: 'events', definicion: 'UNIQUE (source_id, external_id)' },
      { tabla: 'places', definicion: 'UNIQUE (source_id, external_id)' },
    ]);

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      const insertar = `INSERT INTO places (city_id, source_id, external_id, name, category, lat, lon, data_status)
                        VALUES ('cancun', 'osm', 'node/schema-test', $1, 'parks', 21.1, -86.8, 'REAL')`;
      await client.query(insertar, ['antes']);
      await client.query('SAVEPOINT antes_duplicado');
      let duplicado: string | null = null;
      try {
        await client.query(
          `INSERT INTO places (city_id, source_id, external_id, name, category, lat, lon, data_status)
           VALUES ('cancun', 'osm', 'node/schema-test', 'otra', 'parks', 21.1, -86.8, 'REAL')`,
        );
      } catch (err) {
        duplicado = (err as { code?: string }).code ?? 'UNKNOWN';
      }
      assert.equal(duplicado, UNIQUE);
      await client.query('ROLLBACK TO SAVEPOINT antes_duplicado');
      const { rows: actualizado } = await client.query<{ name: string }>(
        `INSERT INTO places (city_id, source_id, external_id, name, category, lat, lon, data_status)
         VALUES ('cancun', 'osm', 'node/schema-test', 'despues', 'parks', 21.2, -86.7, 'REAL')
         ON CONFLICT (source_id, external_id) DO UPDATE SET
           name = EXCLUDED.name, lat = EXCLUDED.lat, lon = EXCLUDED.lon
         RETURNING name`,
      );
      assert.equal(actualizado[0]?.name, 'despues');
      const { rows: cuenta } = await client.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM places WHERE source_id = 'osm' AND external_id = 'node/schema-test'`,
      );
      assert.equal(cuenta[0]?.n, 1);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('los seeds DEMO de places y events apuntan a kindhop-demo', async () => {
    const { rows } = await getPool().query<{ tabla: string; n: number }>(
      `SELECT tabla, n FROM (
         SELECT 'events' AS tabla, count(*)::int AS n FROM events
         WHERE data_status = 'DEMO' AND source_id IS DISTINCT FROM 'kindhop-demo'
         UNION ALL
         SELECT 'places', count(*)::int FROM places
         WHERE data_status = 'DEMO' AND source_id IS DISTINCT FROM 'kindhop-demo'
       ) cuentas
       ORDER BY tabla`,
    );
    assert.deepEqual(rows, [
      { tabla: 'events', n: 0 },
      { tabla: 'places', n: 0 },
    ]);
    const { rows: vacios } = await getPool().query<{ n: number }>(
      `SELECT count(*)::int AS n FROM (
         SELECT 1 FROM places WHERE source_id IS NULL
         UNION ALL
         SELECT 1 FROM events WHERE source_id IS NULL
       ) huerfanos`,
    );
    assert.equal(vacios[0]?.n, 0);
  });
});
