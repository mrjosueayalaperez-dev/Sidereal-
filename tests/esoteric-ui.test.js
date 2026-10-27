// Built-in esoteric layer renders with every planet card; no visibility toggle; registry-driven generic rendering.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { renderEsoteric } from '../js/ui/esoteric.js'; import { renderPanel } from '../js/ui/panel.js'; import { makeGematria } from '../js/gematria.js';
const L = f => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url)));
const { planets } = L('planets'), { letters } = L('letters'), { sephirot } = L('sephirot'), { sources } = L('sources'), registry = L('esoteric-registry');
const DOC = { saturn: 713, jupiter: 194, mars: 95, sun: 640, venus: 64, mercury: 48, moon: 87 };
const card = (planet, version = 'gd') => { const el = { innerHTML: '' }; renderPanel(el, { planet, letters, sephirot, gem: makeGematria(letters), version, sources, registry }); return el.innerHTML; };
test('each planet card carries planet + letter + gematria + tarot by default', () => {
  for (const p of planets) { const h = card(p);
    assert.ok(h.includes(p.symbol)); assert.match(h, new RegExp(`data-eso="hebrewLetter"[^]*${p.letters.gd}`)); assert.match(h, new RegExp(`data-eso="nameGematria"><th[^]*?<td>${DOC[p.id]} `));
    assert.match(h, /data-eso="tarot"[^]*UNCONFIRMED/); }
});
test('no visibility toggle in the card: no checkbox/switch/aria-expanded/details around esoteric; only attribution radios', () => {
  for (const p of planets) { const h = card(p);
    assert.doesNotMatch(h, /type="checkbox"|role="switch"|aria-expanded|data-toggle|esoteric-toggle/i);
    const eso = h.slice(h.indexOf('<table class="esoteric"'), h.indexOf('</table>', h.indexOf('<table class="esoteric"'))); assert.doesNotMatch(eso, /<input|<button|<details/);
    assert.deepEqual([...h.matchAll(/<input[^>]*>/g)].map(m => m[0].match(/name="(\w+)"/)[1]), ['lv', 'lv']); }
});
test('Gra switches attribution (value), not visibility', () => { const s = planets.find(p => p.id === 'saturn');
  assert.match(card(s, 'gd'), /data-eso="hebrewLetter"[^]*?ת/); const g = card(s, 'gra'); assert.match(g, /data-eso="hebrewLetter"><th[^]*?\(GRA\)[^]*?ב/); assert.ok(g.includes('data-eso="tarot"')); });
test('generic rendering: a new dummy field needs only data + a registry entry', () => {
  const reg = { fields: [...registry.fields, { key: 'dummyElement', label: 'Dummy element', format: 'text' }] };
  const p = { ...planets[0], esoteric: { ...planets[0].esoteric, dummyElement: { value: 'Quintessence', source: ['test'], status: 'confirmed' } } };
  const h = renderEsoteric(p, reg); assert.match(h, /data-eso="dummyElement"><th scope="row">Dummy element<\/th><td>Quintessence<\/td>/);
  const u = renderEsoteric({ ...p, esoteric: { ...p.esoteric, dummyElement: { value: null, source: ['test'], status: 'UNCONFIRMED', note: 'n' } } }, reg); assert.match(u, /data-eso="dummyElement"[^]*UNCONFIRMED/);
  assert.match(renderEsoteric(p, reg, { compact: true }), /data-eso="dummyElement"[^>]*>Quintessence/);
});
