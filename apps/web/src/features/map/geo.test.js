import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { distanceMeters, eventsOnDay, formatDistance, groupEventsByPlace } from './geo.js';

describe('geo del mapa', () => {
  it('distanceMeters: de Las Palapas al Mercado 28 hay unos 600 m', () => {
    const d = distanceMeters([-86.8265, 21.1617], [-86.8318, 21.1636]);
    assert.ok(d > 500 && d < 700, `distancia ${d}`);
  });

  it('formatDistance: metros redondeados a 10 y km con un decimal', () => {
    assert.equal(formatDistance(347, 'es-MX'), '350 m');
    assert.equal(formatDistance(1234, 'es-MX'), '1.2 km');
    assert.equal(formatDistance(23_400, 'en'), '23 km');
  });

  it('groupEventsByPlace: un grupo por lugar y fuera los eventos sin lugar', () => {
    const palapas = { id: '1', name: 'Palapas', coordinates: [-86.8, 21.1], dataStatus: 'DEMO' };
    const groups = groupEventsByPlace([{ id: 'a', place: palapas }, { id: 'b', place: palapas }, { id: 'c' }]);
    assert.equal(groups.length, 1);
    assert.deepEqual(groups[0].events.map((e) => e.id), ['a', 'b']);
  });

  it('eventsOnDay: sin día devuelve todos; con día, solo los de ese día', () => {
    const events = [{ startsAt: '2026-11-20' }, { startsAt: '2026-11-21' }];
    const key = (iso) => iso;
    assert.equal(eventsOnDay(events, null, key).length, 2);
    assert.deepEqual(eventsOnDay(events, '2026-11-21', key), [{ startsAt: '2026-11-21' }]);
  });
});
