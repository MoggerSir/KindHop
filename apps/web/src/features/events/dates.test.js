import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, eventsFromDay, nextDays } from './dates.js';

const TZ = 'America/Cancun'; // UTC-5 todo el año
const now = new Date('2026-11-20T03:30:00Z'); // 19/11 22:30 en Cancún

describe('fechas de eventos', () => {
  it('dayKey usa la zona de la ciudad, no la UTC', () => {
    assert.equal(dayKey(now, TZ), '2026-11-19');
  });

  it('nextDays empieza hoy en la ciudad y da días consecutivos', () => {
    assert.deepEqual(nextDays(3, TZ, now).map((d) => d.key), ['2026-11-19', '2026-11-20', '2026-11-21']);
  });

  it('eventsFromDay quita los terminados y los de días anteriores, y ordena por inicio', () => {
    const events = [
      { id: 'b', startsAt: '2026-11-21T01:00:00Z', endsAt: '2026-11-21T03:00:00Z' }, // 20/11 20:00 local
      { id: 'pasado', startsAt: '2026-11-19T20:00:00Z', endsAt: '2026-11-19T22:00:00Z' },
      { id: 'a', startsAt: '2026-11-20T02:00:00Z', endsAt: '2026-11-20T05:00:00Z' }, // en curso
    ];
    assert.deepEqual(eventsFromDay(events, '2026-11-19', TZ, now).map((e) => e.id), ['a', 'b']);
    assert.deepEqual(eventsFromDay(events, '2026-11-20', TZ, now).map((e) => e.id), ['b']);
  });
});
