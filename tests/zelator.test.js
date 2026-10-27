// Owner reference data (JAP:zelator-2026-10-27): reference-only, every field sourced + tradition-labelled, no personal content.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { renderZelator } from '../js/ui/zelator.js'; import { makeGematria } from '../js/gematria.js';
const L = f => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url)));
const z = L('zelator'), reg = L('esoteric-registry'), { sources } = L('sources'), { letters } = L('letters'), { paths } = L('paths'), { sephirot } = L('sephirot'), { planets } = L('planets');
const SRC = 'JAP:zelator-2026-10-27', TRADS = ['Jewish Kabbalah', 'Hermetic Qabalah', 'Personal interpretation'];
const isField = o => o && typeof o === 'object' && !Array.isArray(o) && 'value' in o && ('source' in o || 'tradition' in o);
function fields(o, out = [], p = '') { if (isField(o)) out.push([p, o]); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) fields(v, out, `${p}.${k}`); return out; }
function keys(o, out = []) { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (!Array.isArray(o)) out.push(k); keys(v, out); } return out; }
test('registry source JAP:zelator-2026-10-27 is confirmed-by-owner and resolves', () => {
  assert.equal(reg.sources[SRC].status, 'confirmed-by-owner'); assert.ok(sources[SRC]); assert.equal(z.source, SRC); assert.equal(z.status, 'confirmed-by-owner');
  assert.deepEqual(z.traditions, TRADS); assert.match(z.traditionsNote, /not interchangeable/);
});
test('10 sephiroth with name + meaning; names match sephirot.json', () => {
  assert.equal(z.sephiroth.length, 10);
  for (const s of z.sephiroth) { assert.ok(s.name.value && s.meaning.value); assert.equal(sephirot.find(x => x.n === s.n).name, s.name.value); }
});
test('22 paths present; path = 11 + letter index; letters/values agree with letters.json and paths.json', () => {
  assert.equal(z.paths.length, 22);
  z.paths.forEach((p, i) => { assert.equal(p.index, i); assert.equal(p.n.value, 11 + i);
    assert.equal(p.letter.value, letters[i].char); assert.equal(p.value.value, letters[i].standard); assert.equal(p.letterName.value, letters[i].name);
    const e = paths.find(x => x.n === p.n.value); assert.equal(e.letter, p.letter.value); assert.deepEqual([e.from, e.to], p.treeConnection.value);
    for (const k of ['tarot', 'symbol', 'attribution', 'treeConnection']) assert.ok(p[k].value, `${p.n.value}.${k}`); });
});
test('every field carries source + a valid tradition label', () => {
  const all = fields(z); assert.ok(all.length > 200, `fields=${all.length}`);
  for (const [p, f] of all) { assert.deepEqual(f.source, [SRC], p); assert.ok(TRADS.includes(f.tradition), `${p}: ${f.tradition}`); assert.equal(f.status, 'confirmed-by-owner', p); assert.notEqual(f.value, null, p); }
});
test('no personal-content keys or practice text', () => {
  const banned = /prompt|reflection|question|prayer|breath|practice|journal|birth|natal|chart|numerolog|life.?path|affirm|synthesis|intention|worksheet|personal(?!.?interpretation)|owner(?!Name)|dob/i;
  for (const k of keys(z)) assert.doesNotMatch(k, banned, k);
  const txt = JSON.stringify(z); assert.doesNotMatch(txt, /inhale|exhale|steady vessel|Pisces placement|birth time|What purpose|journal/i);
});
test('gematria methods + worked values agree with the gematria engine', () => {
  assert.ok(z.gematria.methods.length >= 4); for (const m of z.gematria.methods) assert.ok(m.description.value.length > 10);
  const gem = makeGematria(letters); for (const e of z.gematria.examples) assert.equal(gem(e.word.value).standard, e.value.value, e.word.value);
  assert.equal(z.moonMonday.levanahGematria.value, planets.find(p => p.id === 'moon').esoteric.nameGematria.value);
});
test('Moon/Monday and Heh/Zayin/Cheth facts consistent with existing data', () => {
  const seq = Object.fromEntries(z.moonMonday.weekdaySequence.value); for (const p of planets) assert.equal(seq[p.day].toLowerCase(), p.id);
  assert.deepEqual(z.hehZayinCheth.map(l => [l.letter.value, l.value.value, l.path.value]), [['ה', 5, 15], ['ז', 7, 17], ['ח', 8, 18]]);
  assert.equal(z.hehZayinCheth[1].spelledName.value.value, 67); assert.equal(z.hehZayinCheth[2].spelledName.value.value, 418);
});
test('UI: renders note, tradition tags, 22 path rows, 10 sephiroth rows', () => {
  const h = renderZelator(z, sources);
  assert.match(h, /id="traditionsNote"[^>]*>[^<]*not interchangeable/); assert.equal((h.match(/data-zpath=/g) || []).length, 22); assert.equal((h.match(/data-zseph=/g) || []).length, 10);
  for (const t of TRADS) assert.ok(h.includes(`Tradition: ${t}`), t); assert.ok(h.includes(`data-src="${SRC}"`)); assert.doesNotMatch(h, /UNCONFIRMED/);
});
