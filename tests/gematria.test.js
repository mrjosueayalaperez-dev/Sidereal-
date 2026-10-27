// T6: gematria must match research doc §3 exactly.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { makeGematria } from '../js/gematria.js';
const L = JSON.parse(readFileSync(new URL('../data/letters.json', import.meta.url))).letters;
const P = JSON.parse(readFileSync(new URL('../data/planets.json', import.meta.url))).planets;
const g = makeGematria(L);
const T = { saturn: ['שבתאי', 713, 713, 56], jupiter: ['צדק', 194, 194, 41], mars: ['מאדים', 95, 655, 41], sun: ['שמש', 640, 640, 55], venus: ['נוגה', 64, 64, 28], mercury: ['כוכב', 48, 48, 30], moon: ['לבנה', 87, 87, 33] };
for (const [id, [heb, s, gd, o]] of Object.entries(T)) test(`${id} ${heb} = ${s}/${gd}/${o}`, () => {
  assert.equal(P.find(p => p.id === id).hebrewName, heb); const r = g(heb); assert.deepEqual([r.standard, r.gadol, r.ordinal], [s, gd, o]);
});
