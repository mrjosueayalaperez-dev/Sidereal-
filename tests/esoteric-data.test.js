// Per-planet built-in esoteric layer: every planet has every registry field (value or UNCONFIRMED), gematria per doc §3.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
const L = f => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url)));
const { planets } = L('planets'), reg = L('esoteric-registry'), { sources } = L('sources');
const DOC = { saturn: 713, jupiter: 194, mars: 95, sun: 640, venus: 64, mercury: 48, moon: 87 }; // Shabbathai, Tzedek, Madim, Shemesh, Nogah, Kokab, Levanah
const okField = f => f && Array.isArray(f.source) && f.source.length && (['confirmed', 'confirmed-by-owner'].includes(f.status) ? f.value != null : f.status === 'UNCONFIRMED' && f.value === null && typeof f.note === 'string');
test('every planet has hebrewLetter, nameGematria, tarot + every registry field', () => {
  for (const k of ['hebrewLetter', 'nameGematria', 'tarot']) assert.ok(reg.fields.some(r => r.key === k), k);
  for (const p of planets) for (const r of reg.fields) { assert.ok(okField(p.esoteric[r.key]), `${p.id}.${r.key}`); for (const s of p.esoteric[r.key].source) assert.ok(sources[s], s); }
});
test('nameGematria equals doc §3 list', () => { assert.equal(planets.length, 7); for (const p of planets) assert.equal(p.esoteric.nameGematria.value, DOC[p.id], p.id); });
test('hebrewLetter consistent with letters.gd/gra; variants UNCONFIRMED blank', () => {
  for (const p of planets) { const h = p.esoteric.hebrewLetter; assert.equal(h.value, p.letters.gd); assert.equal(h.variants.gra.value, p.letters.gra);
    for (const v of ['short', 'long', 'saadia']) { assert.equal(h.variants[v].value, null); assert.equal(h.variants[v].status, 'UNCONFIRMED'); } }
});
const TAROT = { mercury: 'The Magician (I)', moon: 'The High Priestess (II)', venus: 'The Empress (III)', jupiter: 'Wheel of Fortune (X)', mars: 'The Tower (XVI)', sun: 'The Sun (XIX)', saturn: 'The Universe/World (XXI)' };
test('tarot equals owner-approved Golden Dawn mapping', () => { for (const p of planets) { assert.equal(p.esoteric.tarot.value, TAROT[p.id], p.id); assert.equal(p.esoteric.tarot.status, 'confirmed-by-owner'); assert.deepEqual(p.esoteric.tarot.source, ['GD:tarot']); } assert.equal(sources['GD:tarot'], 'Golden Dawn attribution (Liber 777 / Book T)'); });
