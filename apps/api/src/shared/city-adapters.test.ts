import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from './errors.js';
import { pickAdapter, type CityAdapters } from './city-adapters.js';

const adapters: CityAdapters<() => string> = { cancun: () => 'cancun' };

describe('pickAdapter', () => {
  it('devuelve el adaptador de la ciudad', () => {
    assert.equal(pickAdapter(adapters, 'cancun', 'Transporte')(), 'cancun');
  });

  it('ciudad sin adaptador -> 404 MODULE_UNAVAILABLE', () => {
    assert.throws(() => pickAdapter(adapters, 'cdmx', 'Transporte'), (err: unknown) => err instanceof AppError && err.status === 404 && err.code === 'MODULE_UNAVAILABLE');
  });

  it('no confunde propiedades heredadas de Object con adaptadores', () => {
    assert.throws(() => pickAdapter(adapters, 'constructor', 'Transporte'), AppError);
  });
});
