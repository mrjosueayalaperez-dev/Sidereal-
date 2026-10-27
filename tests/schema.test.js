// T5: schema validation + "every record has a source" + unconfirmed items are flagged (value null + status).
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
const load = f => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url)));
const { planets } = load('planets'), { letters } = load('letters'), { sephirot } = load('sephirot'), { paths } = load('paths'), { presets } = load('presets'), { sources } = load('sources');
const isU = v => v && v.value === null && v.status === 'UNCONFIRMED' && typeof v.note === 'string';
const allRecs = [...planets, ...letters, ...sephirot, ...paths, ...presets];
test('every record has sources[] and a confidence', () => { for (const r of allRecs) { assert.ok(Array.isArray(r.sources) && r.sources.length, JSON.stringify(r).slice(0, 60)); assert.match(r.confidence, /^(confirmed|unconfirmed)$/); } });
test('source keys resolve (non-URL)', () => { for (const r of allRecs) for (const s of r.sources) if (!s.startsWith('http') && !s.startsWith('research-doc §')) assert.ok(sources[s], s); });
test('planets: 7 with required fields', () => {
  assert.equal(planets.length, 7);
  for (const p of planets) { for (const k of ['id', 'symbol', 'hebrewName', 'translit', 'metal', 'day', 'sephirah', 'path']) assert.ok(p[k] != null, k);
    assert.match(p.colors.king.hex, /^#[0-9a-f]{6}$/); assert.ok(isU(p.colors.queen), 'queen must be UNCONFIRMED');
    for (const v of ['short', 'long', 'saadia']) assert.ok(isU(p.letters[v])); assert.ok('בגדכפרת'.includes(p.letters.gd) && 'בגדכפרת'.includes(p.letters.gra)); }
  for (const v of ['gd', 'gra']) assert.equal(new Set(planets.map(p => p.letters[v])).size, 7);
  const sides = planets.filter(p => !['saturn', 'moon', 'sun'].includes(p.id)); assert.ok(sides.every(p => isU(p.hexagram)));
});
test('letters: 22, values & classes', () => {
  assert.equal(letters.length, 22); assert.equal(letters.filter(l => l.class === 'mother').length, 3); assert.equal(letters.filter(l => l.class === 'double').length, 7);
  assert.equal(letters.at(-1).standard, 400); assert.deepEqual(letters.filter(l => l.final).map(l => l.final.gadol), [500, 600, 700, 800, 900]);
});
test('sephirot: 10 numbered + optional Daath', () => { assert.equal(sephirot.filter(s => s.n).length, 10); assert.ok(sephirot.find(s => s.id === 'daath').optional); });
test('paths: 22 (11-32); 15/16/20/24/25 endpoints UNCONFIRMED', () => {
  assert.deepEqual(paths.map(p => p.n), Array.from({ length: 22 }, (_, i) => i + 11));
  for (const p of paths) if ([15, 16, 20, 24, 25].includes(p.n)) { assert.equal(p.from, null); assert.equal(p.status, 'UNCONFIRMED'); assert.ok(p.draft); } else { assert.ok(p.from >= 1 && p.to <= 10); }
});
test('presets: unlinked figures UNCONFIRMED', () => { for (const p of presets) if (p.kind === 'market' && !p.sources[0].startsWith('http')) { assert.equal(p.status, 'UNCONFIRMED'); assert.equal(p.figure, null); } });
