import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import '../../shared/env.js';
import { cities } from './catalog.js';
import { closePool, query } from '../../shared/db.js';

type CityRow = {
  id: string;
  name: string;
  country_code: string;
  center_lat: number;
  center_lon: number;
  timezone: string;
  default_zoom: number;
};

const skip = !process.env.DATABASE_URL && 'sin DATABASE_URL';

// El catálogo estático es la fuente de verdad; esta prueba asegura que la tabla cities coincide (issue #8).
describe('catálogo de ciudades vs tabla cities', { skip }, () => {
  after(closePool);

  it('las filas de PostgreSQL coinciden con el catálogo estático', async () => {
    const { rows } = await query<CityRow>(
      `SELECT id, name, country_code, center_lat, center_lon, timezone, default_zoom
       FROM cities ORDER BY id`,
    );
    assert.equal(rows.length, cities.length, 'mismo número de ciudades');
    const catalogIds = cities.map((c) => c.id).sort();
    assert.deepEqual(
      rows.map((r) => r.id),
      catalogIds,
    );

    for (const city of cities) {
      const row = rows.find((r) => r.id === city.id);
      assert.ok(row, `fila para ${city.id}`);
      assert.equal(row.name, city.name);
      assert.equal(row.country_code, city.countryCode);
      assert.equal(row.timezone, city.timezone);
      assert.equal(row.default_zoom, city.zoom);
      assert.equal(row.center_lon, city.center[0]);
      assert.equal(row.center_lat, city.center[1]);
    }
  });
});