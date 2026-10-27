import test from 'node:test'; import assert from 'node:assert/strict';
import * as A from '../vendor/astronomy.js';
import { readFileSync, existsSync } from 'node:fs';
test('astronomy-engine vendored with licence', () => {
  assert.equal(typeof A.GeoVector, 'function');
  assert.match(readFileSync(new URL('../vendor/LICENSE-astronomy-engine.txt', import.meta.url), 'utf8'), /MIT License/);
});
test('root index.html is Sidereal (MNQ page removed by owner decision; kept in git history at cd7c184)', () => {
  assert.match(readFileSync(new URL('../index.html', import.meta.url), 'utf8'), /<title>Sidereal/);
  assert.ok(existsSync(new URL('../vendor/astronomy.js', import.meta.url)));
});
