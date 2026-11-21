import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { CANCUN_BBOX, buildOverpassQuery, fetchOverpass, mapOverpass, runImport } from './fetch-osm-pois.mjs';

const fixturePath = fileURLToPath(new URL('./fixtures/overpass-cancun-sample.json', import.meta.url));

async function fixture() {
  return JSON.parse(await readFile(fixturePath, 'utf8'));
}

describe('consulta Overpass acotada', () => {
  it('la caja de Cancún es pequeña y la consulta la repite en cada filtro', () => {
    assert.ok(CANCUN_BBOX.north - CANCUN_BBOX.south < 1);
    assert.ok(CANCUN_BBOX.east - CANCUN_BBOX.west < 1);
    const query = buildOverpassQuery(CANCUN_BBOX);
    const box = '(21.02,-86.98,21.24,-86.74)';
    assert.equal(query.split(box).length - 1, 5);
    assert.match(query, /\["natural"="beach"\]/);
    assert.match(query, /\["tourism"="museum"\]/);
    assert.match(query, /\["leisure"="park"\]/);
    assert.match(query, /\["amenity"="marketplace"\]/);
    assert.match(query, /\["place"="square"\]/);
    assert.throws(() => buildOverpassQuery({ south: -90, west: -180, north: 90, east: 180 }), /acotada/);
  });

  it('si el primer espejo falla, prueba el siguiente y no usa la red real', async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, init });
      if (calls.length === 1) return { ok: false, status: 502, json: async () => ({}) };
      return {
        ok: true,
        status: 200,
        json: async () => ({ elements: [] }),
      };
    };
    const { url } = await fetchOverpass(buildOverpassQuery(), { fetchImpl });
    assert.equal(calls.length, 2);
    assert.equal(url, 'https://overpass.openstreetmap.fr/api/interpreter');
    assert.equal(calls[0].init.headers['User-Agent'], 'KinHop/0.1 (hackathon; https://github.com/MoggerSir/KindHop)');
    assert.match(calls[0].init.body.toString(), /data=/);
  });
});

describe('mapeo del fixture grabado', () => {
  it('clasifica el recorte real y descarta la plaza sin nombre', async () => {
    const { places, skipped } = mapOverpass(await fixture(), CANCUN_BBOX);
    const byId = Object.fromEntries(places.map((place) => [place.externalId, place]));
    assert.equal(places.length, 8);
    assert.equal(skipped.unnamed, 1);
    assert.equal(skipped.duplicate, 0);

    const beach = byId['node/2611777999'];
    assert.equal(beach.name, 'Playa Delfines');
    assert.equal(beach.category, 'beaches');
    assert.deepEqual({ lat: beach.lat, lon: beach.lon }, { lat: 21.0619642, lon: -86.778583 });
    assert.equal(beach.sourceUrl, 'https://www.openstreetmap.org/node/2611777999');
    assert.deepEqual(beach.i18n, {});
    assert.equal(beach.isFree, null);

    assert.equal(byId['way/250248208'].category, 'museums');
    assert.equal(byId['way/250248208'].name, 'Museo Maya de Cancún');
    assert.equal(byId['way/250248208'].isFree, false);
    assert.equal(byId['way/250248208'].address, 'Boulevard Kukulcán');
    assert.equal(byId['node/11989000965'].address, 'Calle Ixcún 1');
    assert.equal(byId['node/14363059307'].category, 'markets');
    assert.equal(byId['way/249820610'].category, 'markets');
    assert.equal(byId['node/4343465100'].category, 'parks');
    assert.equal(byId['relation/17996889'].category, 'beaches');
    assert.equal(byId['relation/17996889'].sourceUrl, 'https://www.openstreetmap.org/relation/17996889');
    assert.equal(byId['way/508039638'], undefined);
  });

  it('guarda name:en y prefiere name:es; un id repetido no se duplica', async () => {
    const payload = await fixture();
    const beach = payload.elements.find((element) => element.id === 2611777999);
    // El recorte grabado de estas categorías no trae name:en (Cancún, 2026-11-21). Se añade aquí solo para probar el mapeo.
    beach.tags['name:en'] = 'Delfines Beach';
    beach.tags['name:es'] = 'Playa de los Delfines';
    payload.elements.push(structuredClone(beach));
    const { places, skipped } = mapOverpass(payload, CANCUN_BBOX);
    const mapped = places.filter((place) => place.externalId === 'node/2611777999');
    assert.equal(mapped.length, 1);
    assert.equal(mapped[0].name, 'Playa de los Delfines');
    assert.deepEqual(mapped[0].i18n, { en: { name: 'Delfines Beach' } });
    assert.equal(skipped.duplicate, 1);
  });

  it('el dry-run del fixture no necesita base de datos', async () => {
    const result = await runImport({ fixture: fixturePath, dryRun: true });
    assert.equal(result.places.length, 8);
    assert.equal(result.written, null);
    assert.equal(result.osmTimestamp, '2026-11-21T01:54:43Z');
  });
});
