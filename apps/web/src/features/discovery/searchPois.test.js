import { test } from 'node:test';
import assert from 'node:assert/strict';
import { poiName, searchPois } from './searchPois.js';
const pois = [
  { id: '1', name: 'Playa Cancún', category: 'beaches', i18n: { en: { name: 'Cancun Beach' } } },
  { id: '2', name: 'Parque central', category: 'parks' },
];
test('lugares: combina texto sin acentos y categoría sin mutar los datos', () => {
  assert.deepEqual(searchPois(pois, { query: 'CANCUN playa', category: 'beaches' }).map((p) => p.id), ['1']);
  assert.equal(searchPois(pois, { query: 'Cancun', category: 'parks' }).length, 0);
  assert.equal(searchPois(pois).length, 2);
  assert.equal(pois[0].name, 'Playa Cancún');
});
test('lugares: busca nombre traducido y etiqueta de categoría', () => {
  assert.equal(searchPois(pois, { query: 'beach', locale: 'en' })[0].id, '1');
  assert.equal(searchPois(pois, { query: 'naturaleza', categoryLabel: () => 'Naturaleza' }).length, 2);
  assert.equal(poiName(pois[1], 'en'), 'Parque central');
});
