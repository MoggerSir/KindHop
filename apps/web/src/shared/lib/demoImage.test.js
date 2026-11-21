import assert from 'node:assert/strict';
import { it } from 'node:test';
import { sourcesFor } from './demoImage.js';

const manifest = {
  '/demo/events/concert.jpg': { width: 960, height: 720, widths: [320, 480, 960] },
  '/demo/events/night-market.jpg': { width: 500, height: 375, widths: [320, 480, 500] },
};

it('arma srcset AVIF y WebP sin pasar del ancho real', () => {
  const concert = sourcesFor('/demo/events/concert.jpg', manifest);
  assert.equal(concert.width, 960);
  assert.equal(concert.avif, '/demo/events/concert-320.avif 320w, /demo/events/concert-480.avif 480w, /demo/events/concert-960.avif 960w');
  assert.match(concert.webp, /concert-960\.webp 960w$/);
  const night = sourcesFor('/demo/events/night-market.jpg', manifest);
  assert.equal(night.avif.includes('960'), false);
  assert.match(night.webp, /night-market-500\.webp 500w$/);
});

it('una foto que no es DEMO no pide variantes', () => {
  assert.equal(sourcesFor('https://example.test/a.jpg', manifest), null);
  assert.equal(sourcesFor('/demo/events/missing.jpg', manifest), null);
});
