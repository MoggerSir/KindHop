import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import './env.js';
import { closePool, getPool } from './db.js';

// Reglas de datos que hace cumplir PostgreSQL (db/migrations/0002_mvp_schema.sql). Necesita DATABASE_URL con
// migraciones y seeds aplicados; sin ella se salta (npm run check en local). La CI la corre con PostgreSQL.
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
const event = `INSERT INTO events (city_id, title, starts_at, data_status, source_url, image_url, image_author, image_license, image_source_url)
               VALUES ('cancun', 'x', now() + interval '1 day', $1, $2, $3, $4, $5, $6)`;

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

  it('rutas-cancun-api documenta la lectura en vivo y no una copia', async () => {
    const { rows } = await getPool().query<{ url: string; license: string; data_status: string; notes: string }>(
      `SELECT url, license, data_status, notes FROM data_sources WHERE id = 'rutas-cancun-api'`,
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.url, 'https://rutascancun.com/datos/catalogo.json');
    assert.equal(rows[0]?.data_status, 'REAL');
    assert.match(rows[0]?.license ?? '', /no se guarda copia/);
    assert.match(rows[0]?.notes ?? '', /transit_\*/);
  });

  it('los seeds dejan eventos DEMO futuros en ambas ciudades', async () => {
    const { rows } = await getPool().query<{ city_id: string }>(
      `SELECT DISTINCT city_id FROM events WHERE data_status = 'DEMO' AND ends_at > now() ORDER BY city_id`,
    );
    assert.deepEqual(rows.map((r) => r.city_id), ['cancun', 'cdmx']);
  });
});
