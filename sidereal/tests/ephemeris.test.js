// T2 done-when: 4-date JPL Horizons fixtures pass within tolerance (0.05° planets, 0.1° Moon).
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { geo, angDiff } from '../js/ephemeris.js';
const fx = JSON.parse(readFileSync(new URL('./fixtures/horizons.json', import.meta.url)));
const req = ['sun', 'moon', 'mars', 'jupiter', 'saturn'];
for (const [d, rows] of Object.entries(fx.data)) for (const b of req) test(`${b} @ ${d} UT vs Horizons`, () => {
  const t = new Date(d.replace(' ', 'T') + ':00Z'); const tol = b === 'moon' ? 0.1 : 0.05;
  const diff = angDiff(geo(b, t).lon, rows[b].lon);
  assert.ok(diff < tol, `diff ${diff.toFixed(4)}° >= ${tol}`);
});
test('report all bodies (incl. optional) max error', () => {
  let worst = 0; for (const [d, rows] of Object.entries(fx.data)) for (const b of Object.keys(rows)) {
    const diff = angDiff(geo(b, new Date(d.replace(' ', 'T') + ':00Z')).lon, rows[b].lon); worst = Math.max(worst, diff);
    assert.ok(diff < (b === 'moon' ? 0.1 : 0.05), `${b} ${d} ${diff}`);
  }
  console.log('max abs diff vs Horizons (deg):', worst.toFixed(5));
});
