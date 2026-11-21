import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPrivacyPath } from './route.js';

test('reconoce /privacidad con o sin barra final y sin distinguir mayúsculas', () => {
  assert.equal(isPrivacyPath('/privacidad'), true);
  assert.equal(isPrivacyPath('/privacidad/'), true);
  assert.equal(isPrivacyPath('/Privacidad'), true);
});

test('el resto de rutas sigue en la app con sesión', () => {
  assert.equal(isPrivacyPath('/'), false);
  assert.equal(isPrivacyPath('/privacidad/otra'), false);
  assert.equal(isPrivacyPath('/api/privacidad'), false);
});
