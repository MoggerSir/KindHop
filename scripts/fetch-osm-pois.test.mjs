import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { CANCUN_BBOX, buildOverpassQuery, chainOf, fetchOverpass, mapOverpass, runImport } from './fetch-osm-pois.mjs';

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
    assert.equal(query.split(box).length - 1, 7);
    assert.match(query, /\["amenity"~"\^\(restaurant/);
    assert.match(query, /\["shop"~"\^\(bakery/);
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

  it('descarta nombres genéricos y lo que no es un lugar, y manda el deporte a sports', async () => {
    const payload = await fixture();
    const beach = payload.elements.find((element) => element.id === 2611777999);
    const samples = [
      ['sin nombre', null],
      ['Parque', null],
      ['parque', null],
      ['Camellón sunyaxchen', null],
      ['Rotonda Catania', null],
      ['Glorieta fuente las américas', null],
      ['Privadas Sacbe, RUBA', null],
      ['Residencial Rio by Cumbres', null],
      ['Entrada Santa Fe', null],
      ['Parque de la 95', 'parks'],
      ['Unidad Deportiva Reg. 95', 'sports'],
      ['Unidad Desportiva 223', 'sports'],
      ['Cancha sintetica', 'sports'],
      ['Campo de Futbol Atlante', 'sports'],
      ['parque de futbol R. 221', 'sports'],
    ];
    payload.elements = samples.map(([name], index) => {
      const copy = structuredClone(beach);
      copy.id = 8_000_000_000 + index;
      copy.tags = { ...copy.tags, name, natural: undefined, leisure: 'park' };
      return copy;
    });
    const { places, skipped } = mapOverpass(payload, CANCUN_BBOX);
    const byName = Object.fromEntries(places.map((place) => [place.name, place.category]));
    for (const [name, category] of samples) {
      assert.equal(byName[name] ?? null, category, name);
    }
    assert.equal(skipped.generic, 3);
    assert.equal(skipped.notPlace, 6);
  });

  it('el dry-run del fixture no necesita base de datos', async () => {
    const result = await runImport({ fixture: fixturePath, dryRun: true });
    assert.equal(result.places.length, 8);
    assert.equal(result.written, null);
    assert.equal(result.osmTimestamp, '2026-11-21T01:54:43Z');
  });
});

describe('cadena o negocio local (KH-020)', () => {
  it('un comercio con brand es cadena y guarda la marca', () => {
    assert.deepEqual(chainOf({ amenity: 'cafe', name: 'Starbucks Plaza', brand: 'Starbucks' }, 'food'), { isChain: true, brand: 'Starbucks' });
  });
  it('brand:wikidata sin brand también es cadena (usa el nombre como marca)', () => {
    assert.deepEqual(chainOf({ shop: 'convenience', name: 'OXXO Tulum', 'brand:wikidata': 'Q1342296' }, 'shopping'), { isChain: true, brand: 'OXXO Tulum' });
  });
  it('sin marca registrada es independiente según OSM', () => {
    assert.deepEqual(chainOf({ amenity: 'restaurant', name: 'Taquería El Fogón' }, 'food'), { isChain: false, brand: null });
  });
  it('fuera de comercios no aplica', () => {
    assert.deepEqual(chainOf({ natural: 'beach', name: 'Playa Delfines', brand: 'X' }, 'beaches'), { isChain: null, brand: null });
  });
  it('mapOverpass clasifica restaurantes y tiendas y marca la cadena', () => {
    const { places } = mapOverpass({ elements: [
      { type: 'node', id: 1, lat: 21.16, lon: -86.82, tags: { amenity: 'restaurant', name: 'Taquería El Fogón' } },
      { type: 'node', id: 2, lat: 21.16, lon: -86.83, tags: { shop: 'convenience', name: 'OXXO Centro', brand: 'OXXO' } },
    ] });
    assert.deepEqual(places.map((p) => [p.category, p.isChain, p.brand]), [['food', false, null], ['shopping', true, 'OXXO']]);
  });
});

