import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { natalSnapshot } from '../js/astro/natal.js'; import { sign } from '../js/astro/zodiac.js';
const fx = JSON.parse(readFileSync(new URL('./fixtures/horizons.json', import.meta.url))).data;
for (const d of Object.keys(fx)) test(`natal signs @ ${d} match Horizons-derived signs`, () => {
  const s = natalSnapshot(new Date(d.replace(' ', 'T') + ':00Z'));
  for (const b of s.bodies) assert.equal(b.sign, sign(fx[d][b.id].lon).name, b.id);
  assert.equal(s.houses.status, 'DEFERRED');
});
test('1977-03-17: Sun in Pisces', () => assert.equal(natalSnapshot(new Date('1977-03-17T12:00Z')).bodies[0].sign, 'Pisces'));
