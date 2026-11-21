import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from './errors.js';
import { isDatabaseConfigured, requireDatabase } from './db.js';

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

  it('requireDatabase sin DATABASE_URL -> 503 MODULE_UNAVAILABLE', () => {
    const had = process.env.DATABASE_URL;
    try {
      delete process.env.DATABASE_URL;
      assert.throws(() => requireDatabase(), (err: unknown) => {
        return err instanceof AppError && err.status === 503 && err.code === 'MODULE_UNAVAILABLE';
      });
    } finally {
      if (had === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = had;
    }
  });
});