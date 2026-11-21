import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sponsoredFirst } from './sponsored.js';

describe('sponsoredFirst (KH-021)', () => {
  it('pone los puestos 1, 2, 3 delante y deja el resto en su orden', () => {
    const events = [{ id: 'a' }, { id: 'b', sponsoredRank: 3 }, { id: 'c' }, { id: 'd', sponsoredRank: 1 }, { id: 'e', sponsoredRank: 2 }];
    assert.deepEqual(sponsoredFirst(events).map((e) => e.id), ['d', 'e', 'b', 'a', 'c']);
  });
  it('sin patrocinados no cambia nada', () => {
    assert.deepEqual(sponsoredFirst([{ id: 'a' }, { id: 'b' }]).map((e) => e.id), ['a', 'b']);
  });
});
