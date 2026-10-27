// T9 done-when: Lahiri ayanamsa at 2000-01-01 within 0.01° of reference.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { ayanamsa, sign } from '../js/astro/zodiac.js';
const A = JSON.parse(readFileSync(new URL('../data/ayanamsa.json', import.meta.url)));
for (const r of A.references) test(`Lahiri 2000-01-01 vs ${r.dms} (${r.source.split(' ')[0]})`, () => {
  const a = ayanamsa(A, 'lahiri', new Date('2000-01-01T12:00Z')); console.log('computed', a.deg.toFixed(5), 'ref', r.deg, 'Δ', Math.abs(a.deg - r.deg).toFixed(5));
  assert.ok(Math.abs(a.deg - r.deg) < 0.01); assert.equal(a.status, 'UNCONFIRMED');
});
test('all ayanamsa constants flagged UNCONFIRMED (value null)', () => { for (const s of A.systems) { assert.equal(s.value, null); assert.equal(s.status, 'UNCONFIRMED'); } });
test('sign()', () => { assert.equal(sign(0).name, 'Aries'); assert.equal(sign(359.9).name, 'Pisces'); assert.equal(sign(-1).name, 'Pisces'); });
