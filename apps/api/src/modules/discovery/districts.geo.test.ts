import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bboxFromGeometry, pointInDistrictGeometry } from './geo.js';

describe('geometría de distritos (sin red)', () => {
  it('punto en polígono: Zócalo cae en Cuauhtémoc', async () => {
    const raw = JSON.parse(
      await readFile(new URL('./data/cdmx.alcaldias.geojson', import.meta.url), 'utf8'),
    ) as { features: { properties: { name: string }; geometry: Parameters<typeof pointInDistrictGeometry>[2] }[] };
    const cuauhtemoc = raw.features.find((f) => f.properties.name === 'Cuauhtémoc');
    assert.ok(cuauhtemoc);
    assert.equal(pointInDistrictGeometry(-99.1332, 19.4326, cuauhtemoc.geometry), true);
    const bbox = bboxFromGeometry(cuauhtemoc.geometry);
    assert.ok(bbox[0] < -99.1332 && bbox[2] > -99.1332);
  });

  it('punto fuera de CDMX no cae en alcaldía', async () => {
    const raw = JSON.parse(
      await readFile(new URL('./data/cdmx.alcaldias.geojson', import.meta.url), 'utf8'),
    ) as { features: { geometry: Parameters<typeof pointInDistrictGeometry>[2] }[] };
    const anyInside = raw.features.some((f) => pointInDistrictGeometry(-86.8265, 21.1617, f.geometry));
    assert.equal(anyInside, false);
  });
});