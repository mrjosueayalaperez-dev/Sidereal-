// T10 done-when: aspect list for 1977-03-17 matches a reference chart within orbs.
// Reference = aspects computed from independent JPL Horizons longitudes (tests/fixtures/horizons.json, 12:00 UT).
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { aspects } from '../js/astro/aspects.js'; import { geo } from '../js/ephemeris.js';
const fx = JSON.parse(readFileSync(new URL('./fixtures/horizons.json', import.meta.url))).data['1977-03-17 12:00'];
const key = l => l.map(x => `${x.a}-${x.b}:${x.type}`).sort();
test('1977-03-17 aspects: engine == Horizons reference, orbs within 0.05°', () => {
  const ref = aspects(Object.fromEntries(Object.entries(fx).map(([k, v]) => [k, v.lon])));
  const t = new Date('1977-03-17T12:00Z'); const mine = aspects(Object.fromEntries(Object.keys(fx).map(k => [k, geo(k, t).lon])));
  console.log('reference aspects:', ref.map(x => `${x.a} ${x.glyph} ${x.b} (${x.orb}°)`).join('; '));
  assert.deepEqual(key(mine), key(ref)); for (const m of mine) { const r = ref.find(x => x.a === m.a && x.b === m.b && x.type === m.type); assert.ok(Math.abs(m.orb - r.orb) < 0.05); }
});
test('basic', () => { assert.equal(aspects({ a: 0, b: 182 })[0].type, 'opposition'); assert.equal(aspects({ a: 10, b: 75 })[0].type, 'sextile'); assert.equal(aspects({ a: 0, b: 67 }).length, 0); });
