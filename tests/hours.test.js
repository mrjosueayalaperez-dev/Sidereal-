// T12 done-when: hours for a test city/date match a known table (USNO sunrise/sunset → 24 hour boundaries; traditional ruler table).
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { planetaryHours } from '../js/astro/hours.js';
const F = JSON.parse(readFileSync(new URL('./fixtures/hours-nyc-2026-10-26.json', import.meta.url)));
const hm = (ymd, s) => new Date(`${ymd}T${s}:00-04:00`);
test('NYC 2026-10-26 planetary hours vs USNO-derived table', () => {
  const r = planetaryHours(F.date, F.lat, F.lon);
  const R = hm(F.date, F.usno.sunrise), S = hm(F.date, F.usno.sunset), R2 = hm('2026-10-27', F.usno.nextSunrise);
  const exp = []; for (let i = 0; i < 12; i++) exp.push(+R + i * (S - R) / 12); for (let i = 0; i < 12; i++) exp.push(+S + i * (R2 - S) / 12);
  let worst = 0; r.hours.forEach((h, i) => { const d = Math.abs(h.start - exp[i]) / 60e3; worst = Math.max(worst, d); assert.ok(d <= 1.5, `hour ${i} off ${d} min`); });
  console.log('max deviation vs USNO-derived boundaries (min):', worst.toFixed(2));
  assert.deepEqual(r.hours.slice(0, 12).map(h => h.ruler), F.expectedRulers.day); assert.deepEqual(r.hours.slice(12).map(h => h.ruler), F.expectedRulers.night);
  assert.equal(r.dayRuler, 'moon');
});
test('next day ruler continuity (Tue hour 1 = Mars)', () => assert.equal(planetaryHours('2026-10-27', F.lat, F.lon).hours[0].ruler, 'mars'));
test('polar night handled', () => assert.ok(planetaryHours('2026-12-21', 78.22, 15.65).error));
