import './env.js';
import { readdir, readFile } from 'node:fs/promises';
import { closePool, getPool } from './db.js';
import { importDistrictFixtures } from '../modules/discovery/districts.import.js';

// Aplica db/seeds/*.sql en orden, cada uno en su transacción. A diferencia de las migraciones, se puede repetir:
// los seeds son idempotentes (upsert) y regeneran los datos DEMO con fechas relativas a hoy.
const seedsDir = new URL('../../../../db/seeds/', import.meta.url);

async function seed(): Promise<void> {
  const db = getPool();
  const files = (await readdir(seedsDir)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = await readFile(new URL(file, seedsDir), 'utf8');
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`seed ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await importDistrictFixtures(client);
    await client.query('COMMIT');
    console.log('seed districts (fixture CDMX)');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closePool);
