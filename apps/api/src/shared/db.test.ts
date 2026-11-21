import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from './errors.js';
import { closePool, databaseSsl, getDatabaseHealth, isDatabaseConfigured, requireDatabase } from './db.js';

describe('acceso a base de datos', () => {
  it('isDatabaseConfigured refleja DATABASE_URL', () => {
    const had = process.env.DATABASE_URL;
    try {
      delete process.env.DATABASE_URL;
      assert.equal(isDatabaseConfigured(), false);
      process.env.DATABASE_URL = 'postgresql://u:p@localhost:5432/k';
      assert.equal(isDatabaseConfigured(), true);
    } finally {
      if (had === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = had;
    }
  });

  it('databaseSsl respeta sslmode y DATABASE_SSL', () => {
    const hadSsl = process.env.DATABASE_SSL;
    const hadReject = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
    try {
      process.env.DATABASE_SSL = 'true';
      delete process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
      assert.equal(databaseSsl('postgresql://u:p@localhost:5432/k?sslmode=require'), undefined);
      assert.deepEqual(databaseSsl('postgresql://u:p@localhost:5432/k'), { rejectUnauthorized: true });
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = 'false';
      assert.deepEqual(databaseSsl('postgresql://u:p@localhost:5432/k'), { rejectUnauthorized: false });
      process.env.DATABASE_SSL = 'false';
      assert.equal(databaseSsl('postgresql://u:p@localhost:5432/k'), undefined);
    } finally {
      if (hadSsl === undefined) delete process.env.DATABASE_SSL;
      else process.env.DATABASE_SSL = hadSsl;
      if (hadReject === undefined) delete process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
      else process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = hadReject;
    }
  });

  it('requireDatabase sin DATABASE_URL -> 503 DATABASE_UNAVAILABLE', () => {
    const had = process.env.DATABASE_URL;
    try {
      delete process.env.DATABASE_URL;
      assert.throws(() => requireDatabase(), (err: unknown) => {
        return err instanceof AppError && err.status === 503 && err.code === 'DATABASE_UNAVAILABLE';
      });
    } finally {
      if (had === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = had;
    }
  });

  it('getDatabaseHealth con URL inalcanzable devuelve connected false sin colgar', async () => {
    const hadUrl = process.env.DATABASE_URL;
    const hadTimeout = process.env.DATABASE_CONNECTION_TIMEOUT_MS;
    try {
      await closePool();
      process.env.DATABASE_CONNECTION_TIMEOUT_MS = '1500';
      process.env.DATABASE_URL = 'postgresql://nobody:nopass@127.0.0.1:1/nodb';
      const started = Date.now();
      const health = await getDatabaseHealth();
      assert.equal(health.configured, true);
      assert.equal(health.connected, false);
      assert.ok(Date.now() - started < 5000, 'health no debe bloquear más de unos segundos');
    } finally {
      await closePool();
      if (hadTimeout === undefined) delete process.env.DATABASE_CONNECTION_TIMEOUT_MS;
      else process.env.DATABASE_CONNECTION_TIMEOUT_MS = hadTimeout;
      if (hadUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = hadUrl;
    }
  });
});