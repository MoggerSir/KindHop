import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { http } from './http.js';

let calls;

describe('dedupe de GET', { concurrency: false }, () => {
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (url, opts) => {
    calls.push(String(url));
    await new Promise((resolve) => setTimeout(resolve, 15));
    if (opts?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return new Response(JSON.stringify({ url: String(url) }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
});

afterEach(() => {
  delete globalThis.fetch;
});

it('dos GET iguales en vuelo comparten una sola petición', async () => {
  const [a, b] = await Promise.all([http('/api/dedupe-a'), http('/api/dedupe-a')]);
  assert.equal(calls.length, 1);
  assert.deepEqual(a, b);
});

it('abortar un consumidor no cancela al que sigue esperando', async () => {
  const controller = new AbortController();
  const cancelled = http('/api/dedupe-b', { signal: controller.signal });
  const kept = http('/api/dedupe-b');
  controller.abort();
  await assert.rejects(cancelled);
  assert.equal((await kept).url, '/api/dedupe-b');
  assert.equal(calls.length, 1);
});

it('fresh vuelve a pedir aunque la anterior siga en caché', async () => {
  await http('/api/dedupe-c');
  await http('/api/dedupe-c', { fresh: true });
  assert.equal(calls.length, 2);
});

it('POST no se deduplica', async () => {
  await Promise.all([
    http('/api/dedupe-d', { method: 'POST', body: { n: 1 } }),
    http('/api/dedupe-d', { method: 'POST', body: { n: 1 } }),
  ]);
  assert.equal(calls.length, 2);
});
});
