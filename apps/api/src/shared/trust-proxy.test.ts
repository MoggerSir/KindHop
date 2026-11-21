import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readTrustProxySetting } from './trust-proxy.js';

describe('readTrustProxySetting', () => {
  it('sin valor o false/0 → no confía en el proxy', () => {
    assert.equal(readTrustProxySetting(undefined), false);
    assert.equal(readTrustProxySetting(''), false);
    assert.equal(readTrustProxySetting('false'), false);
    assert.equal(readTrustProxySetting('0'), false);
  });

  it('true → un salto (primer X-Forwarded-For)', () => {
    assert.equal(readTrustProxySetting('true'), 1);
  });

  it('acepta un entero de saltos', () => {
    assert.equal(readTrustProxySetting('2'), 2);
  });

  it('pasa cadenas de subred de Express (loopback, linklocal, …)', () => {
    assert.equal(readTrustProxySetting('loopback'), 'loopback');
  });
});