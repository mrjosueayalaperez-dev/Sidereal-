// T8 done-when: Mercury-retrograde dates for 2026 match published ephemeris.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { stations, isRetro } from '../js/astro/retro.js'; import { moonInfo } from '../js/astro/moon.js';
const fx = JSON.parse(readFileSync(new URL('./fixtures/mercury-retro-2026.json', import.meta.url)));
test('Mercury 2026 stations match published (same UTC date, within 6 h)', () => {
  const s = stations('mercury', new Date('2026-01-01T00:00Z'), new Date('2027-01-01T00:00Z'));
  assert.equal(s.length, 6);
  s.forEach((x, i) => { const pub = new Date(fx.stations[i].utc); const hrs = Math.abs(x.t - pub) / 3600e3;
    console.log(x.type, x.t.toISOString().slice(0, 16), 'published', fx.stations[i].utc, 'Δh', hrs.toFixed(2));
    assert.equal(x.type, fx.stations[i].type); assert.equal(x.t.toISOString().slice(0, 10), pub.toISOString().slice(0, 10)); assert.ok(hrs < 6); });
});
test('retro flag mid-window', () => { assert.ok(isRetro('mercury', new Date('2026-03-10T00:00Z'))); assert.ok(!isRetro('mercury', new Date('2026-05-01T00:00Z'))); });
test('moon phase: full moon 2026-03-03 (total lunar eclipse) ~ illumination > 0.99', () => { const m = moonInfo(new Date('2026-03-03T11:38Z')); assert.ok(m.illumination > 0.99, m.illumination); assert.equal(m.name, 'Full'); });
