import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { highlight, searchEvents, suggestions } from './search.js';

const TZ = 'America/Cancun';
const now = new Date('2026-11-20T15:00:00Z'); // 20/11 10:00 en Cancún
const labels = { music: 'Música', food: 'Comida', art: 'Arte' };
const opts = { timeZone: TZ, now, categoryLabel: (id) => labels[id] ?? '' };

const events = [
  { id: 'mercado', title: 'Mercado nocturno', venue: 'Parque Las Palapas', category: 'food', startsAt: '2026-11-21T23:00:00Z' },
  { id: 'concierto', title: 'Concierto en Las Palapas', venue: 'Parque Las Palapas', category: 'music', startsAt: '2026-11-21T01:00:00Z' },
  { id: 'ceramica', title: 'Taller de cerámica', venue: 'Casa de la Cultura', category: 'art', startsAt: '2026-11-29T16:00:00Z' },
  { id: 'pasado', title: 'Concierto pasado', venue: 'Centro', category: 'music', startsAt: '2026-11-19T20:00:00Z', endsAt: '2026-11-19T22:00:00Z' },
];
const ids = (list) => list.map((e) => e.id);

describe('búsqueda de eventos', () => {
  it('sin filtros da los no terminados por fecha', () => {
    assert.deepEqual(ids(searchEvents(events, opts)), ['concierto', 'mercado', 'ceramica']);
  });

  it('ignora acentos y mayúsculas, y el título pesa más que el lugar', () => {
    assert.deepEqual(ids(searchEvents(events, { ...opts, query: 'CERAMICA' })), ['ceramica']);
    assert.deepEqual(ids(searchEvents(events, { ...opts, query: 'palapas' })), ['concierto', 'mercado']);
  });

  it('busca por el nombre visible de la categoría y exige todas las palabras', () => {
    assert.deepEqual(ids(searchEvents(events, { ...opts, query: 'musica' })), ['concierto']);
    assert.deepEqual(ids(searchEvents(events, { ...opts, query: 'mercado arte' })), []);
  });

  it('combina categoría y cuándo (hoy / esta semana en la zona de la ciudad)', () => {
    assert.deepEqual(ids(searchEvents(events, { ...opts, category: 'food' })), ['mercado']);
    assert.deepEqual(ids(searchEvents(events, { ...opts, when: 'today' })), ['concierto']); // 20/11 20:00 local
    assert.deepEqual(ids(searchEvents(events, { ...opts, when: 'week' })), ['concierto', 'mercado']);
  });

  it('highlight marca lo que coincide sin perder los acentos del original', () => {
    assert.deepEqual(highlight('Taller de cerámica', 'ceram'), [
      { text: 'Taller de ', match: false },
      { text: 'cerám', match: true },
      { text: 'ica', match: false },
    ]);
    assert.deepEqual(highlight('Hola', ''), [{ text: 'Hola', match: false }]);
  });

  it('suggestions da lugares reales sin repetir', () => {
    assert.deepEqual(suggestions(events), ['Parque Las Palapas', 'Casa de la Cultura', 'Centro']);
  });
});
