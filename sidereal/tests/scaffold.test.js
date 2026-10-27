import test from 'node:test'; import assert from 'node:assert/strict';
import * as A from '../vendor/astronomy.js';
import { readFileSync, existsSync } from 'node:fs';
test('astronomy-engine vendored with licence', () => {
  assert.equal(typeof A.GeoVector, 'function');
  assert.match(readFileSync(new URL('../vendor/LICENSE-astronomy-engine.txt', import.meta.url), 'utf8'), /MIT License/);
});
test('root MNQ page untouched (exists, 5213 bytes)', () => {
  const p = new URL('../../index.html', import.meta.url);
  assert.ok(existsSync(p)); assert.equal(readFileSync(p).length, 5213);
});
