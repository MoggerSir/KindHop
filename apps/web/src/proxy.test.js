import { it } from 'node:test';
import assert from 'node:assert/strict';
import config from '../vite.config.js';

it('proxy: solo loopback puede reenviar HTTPS y la IP de Cloudflare', () => {
  let forward;
  config.server.proxy['/api'].configure({ on: (_event, handler) => { forward = handler; } });
  const headers = {};
  const proxy = { setHeader: (key, value) => { headers[key] = value; } };
  const supplied = { 'cf-connecting-ip': '203.0.113.5', 'x-forwarded-proto': 'https' };
  forward(proxy, { socket: { remoteAddress: '192.0.2.12' }, headers: supplied });
  assert.equal(headers['X-Forwarded-For'], '192.0.2.12');
  assert.equal(headers['X-Forwarded-Proto'], 'http');
  forward(proxy, { socket: { remoteAddress: '::1' }, headers: supplied });
  assert.equal(headers['X-Forwarded-For'], '203.0.113.5');
  assert.equal(headers['X-Forwarded-Proto'], 'https');
  forward(proxy, { socket: { remoteAddress: '::1' }, headers: { 'cf-connecting-ip': 'invalid' } });
  assert.equal(headers['X-Forwarded-For'], '::1');
  assert.equal(headers['X-Forwarded-Proto'], 'http');
});
