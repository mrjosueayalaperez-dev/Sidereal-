import { helio, geo, lowPrecision } from './ephemeris.js';
import { drawOrrery, PLANETS, GLYPH } from './render/orrery.js';
import { parse, serialize, createStore, SPEEDS } from './state.js';
import { makeGematria } from './gematria.js';
import { renderPanel } from './ui/panel.js';
import { isRetro } from './astro/retro.js';
import { moonInfo } from './astro/moon.js';
import { ayanamsa, fmt } from './astro/zodiac.js';
import { renderWheel } from './render/wheel.js';
import { renderTree, highlightTree, pathForPlanet } from './render/tree.js';
import { decorateRows } from './ui/esoteric.js';
const J = f => fetch(new URL(`../data/${f}.json`, import.meta.url)).then(r => r.json());
const [presetsData, { planets }, { letters }, { sephirot }, { paths }, { sources }, ayanJson, registry] = await Promise.all(['presets', 'planets', 'letters', 'sephirot', 'paths', 'sources', 'ayanamsa', 'esoteric-registry'].map(J));
const ayanData = ayanJson;
const gem = makeGematria(letters);
const app = document.getElementById('app');
app.innerHTML = `<section class="card">
 <div class="row" role="group" aria-label="Time controls">
  <label>Date/time <input id="dt" type="datetime-local" step="60"></label>
  <select id="tz" aria-label="Time zone"><option value="utc">UTC</option><option value="local">Local</option></select>
  <button id="now">Now</button>
  <button id="rew" aria-label="Rewind">◀◀</button><button id="play" aria-label="Play">▶</button>
  <select id="speed" aria-label="Speed per second">${Object.keys(SPEEDS).map(k => `<option value="${k}" ${k === '1d' ? 'selected' : ''}>${k}/s</option>`).join('')}</select>
  <select id="view" aria-label="Centre"><option value="helio">Heliocentric</option><option value="geo">Geocentric</option></select>
  <span id="prec"></span>
 </div>
 <div class="row" id="presetRow"><label>Preset <select id="preset"><option value="">—</option>${presetsData.presets.map(p => `<option value="${p.id}">${p.label} (${p.date})</option>`).join('')}</select></label>
  <span id="presetInfo" class="muted"></span></div>
 <p class="disclaimer" id="presetDisclaimer" role="note">${presetsData.disclaimer}</p>
 <canvas id="orrery" width="800" height="800" aria-label="Orrery"></canvas>
 <h2>Zodiac wheel (geocentric)</h2>
 <div class="row"><select id="zodiac" aria-label="Zodiac"><option value="tropical">Tropical</option><option value="sidereal">Sidereal</option></select>
  <select id="ayan" aria-label="Ayanamsa">${ayanData.systems.map(a => `<option value="${a.id}">${a.label}</option>`).join('')}</select><span id="ayanOut"></span></div>
 <div id="wheel" style="max-width:520px"></div><table id="signs"></table></section>
<section class="card" id="side"><div class="row" role="group" aria-label="Select planet">${planets.map(p => `<button data-planet="${p.id}" aria-label="${p.id}">${p.symbol}</button>`).join('')}</div>
 <div id="panel"></div>
 <h2>Tree of Life</h2><p class="muted" style="font-size:12px">Dashed paths (?) = endpoints UNCONFIRMED. Path letters per GD/777.</p><div id="tree"></div><p id="pathInfo" class="muted" aria-live="polite"></p><h2 id="when"></h2><p id="moon"></p><table id="pos"></table></section>`;
const $ = id => document.getElementById(id);
const init = parse(location.search); if (!init.t) init.t = new Date();
const store = createStore(init); let rate = 0, last = 0, hits = [];
const pad = n => String(n).padStart(2, '0');
function toInput(t, tz) { const d = tz === 'utc' ? [t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes()] : [t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes()];
  return `${String(d[0]).padStart(4, '0')}-${pad(d[1] + 1)}-${pad(d[2])}T${pad(d[3])}:${pad(d[4])}`; }
function fromInput(v, tz) { return tz === 'utc' ? new Date(v + ':00Z') : new Date(v); }
export function positionsAt(t, view) {
  if (view === 'geo') return Object.fromEntries(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(id => [id, { ...geo(id, t), retro: isRetro(id, t) }]));
  return Object.fromEntries(PLANETS.map(id => [id, helio(id, t)]));
}
function render(s) {
  const pos = positionsAt(s.t, s.view);
  hits = drawOrrery($('orrery'), pos, { centre: s.view === 'geo' ? 'earth' : 'sun', selected: s.sel });
  if (document.activeElement !== $('dt')) $('dt').value = toInput(s.t, s.tz);
  $('tz').value = s.tz; $('when').textContent = s.t.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  $('prec').innerHTML = lowPrecision(s.t) ? '<span class="badge">low precision (outside 1800–2200)</span>' : '';
  { const g = Object.fromEntries(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(id => [id, { ...geo(id, s.t), retro: isRetro(id, s.t) }]));
    const ay = s.zodiac === 'sidereal' ? ayanamsa(ayanData, s.ayan, s.t) : null; const off = ay?.deg ?? 0;
    const shown = Object.fromEntries(Object.entries(g).map(([k, v]) => [k, { ...v, lon: ((v.lon - off) % 360 + 360) % 360 }]));
    $('zodiac').value = s.zodiac; $('ayan').value = s.ayan; $('ayan').disabled = s.zodiac !== 'sidereal';
    $('ayanOut').innerHTML = ay ? `ayanamsa ${ay.deg.toFixed(4)}° <span class="badge" title="${ayanData.note}">UNCONFIRMED constants</span>` : '';
    renderWheel($('wheel'), shown, { glyphs: GLYPH, label: `${s.zodiac} zodiac wheel` });
    $('signs').innerHTML = `<caption class="muted">${s.zodiac} positions${ay ? ' (sidereal results use UNCONFIRMED ayanamsa constants)' : ''}</caption>` + Object.entries(shown).map(([k, v]) => `<tr data-sign="${k}"><td>${GLYPH[k]} ${k}</td><td>${fmt(v.lon)}${v.retro ? ' ℞' : ''}</td></tr>`).join('');
    window.__wheel = shown; }
  $('view').value = s.view; const m = moonInfo(s.t);
  $('moon').innerHTML = `☽ ${m.name} — ${(m.illumination * 100).toFixed(1)}% illuminated (phase angle ${m.phase.toFixed(1)}°)`;
  $('pos').innerHTML = `<caption class="muted">${s.view === 'geo' ? 'Geocentric apparent' : 'Heliocentric'} ecliptic longitude (of date)</caption><tr><th>Body</th><th>Lon°</th><th>AU</th><th>Motion</th></tr>` + Object.entries(pos).map(([id, p]) => `<tr data-body="${id}"><td>${id}</td><td>${p.lon.toFixed(2)}</td><td>${p.dist.toFixed(3)}</td><td>${s.view === 'geo' ? (p.retro ? '℞ retrograde' : 'direct') : '—'}</td></tr>`).join('');
  renderPanel($('panel'), { planet: planets.find(p => p.id === s.sel), letters, sephirot, gem, version: s.letters, sources, registry });
  { const pl = planets.find(p => p.id === s.sel); highlightTree($('tree'), pl ? { sephirah: pl.sephirah, path: pathForPlanet(pl, paths, s.letters) } : {}); }
  document.querySelectorAll('[data-planet]').forEach(b => b.setAttribute('aria-pressed', b.dataset.planet === s.sel));
  decorateRows(document, planets, registry, { system: s.letters, letters });
  history.replaceState(null, '', '?' + serialize(s));
  window.__sidereal = { state: s, positions: pos, hits, rate };
}
renderTree($('tree'), { sephirot, paths, onPath: p => { $('pathInfo').textContent = `Path ${p.n} ${p.letter}: ${p.attribution.type} ${p.attribution.id}${p.status ? ' — UNCONFIRMED endpoints: ' + p.note : ''}`; } });
store.sub(render);
$('dt').addEventListener('change', e => { const t = fromInput(e.target.value, store.get().tz); if (!isNaN(t)) store.set({ t }); });
$('zodiac').addEventListener('change', e => store.set({ zodiac: e.target.value }));
$('ayan').addEventListener('change', e => store.set({ ayan: e.target.value }));
$('view').addEventListener('change', e => store.set({ view: e.target.value }));
$('tz').addEventListener('change', e => store.set({ tz: e.target.value }));
$('now').onclick = () => { rate = 0; store.set({ t: new Date() }); syncPlay(); };
const speed = () => SPEEDS[$('speed').value];
$('play').onclick = () => { rate = rate > 0 ? 0 : speed(); syncPlay(); };
$('rew').onclick = () => { rate = rate < 0 ? 0 : -speed(); syncPlay(); };
$('speed').onchange = () => { if (rate) rate = Math.sign(rate) * speed(); syncPlay(); };
function syncPlay() { $('play').textContent = rate > 0 ? '❚❚' : '▶'; $('rew').textContent = rate < 0 ? '❚❚' : '◀◀'; last = performance.now(); if (rate) requestAnimationFrame(tick); }
function tick(now) { if (!rate || document.hidden) return; const dt = (now - last) / 1000; last = now; store.set({ t: new Date(store.get().t.getTime() + rate * dt) }); requestAnimationFrame(tick); }
document.addEventListener('visibilitychange', () => { if (!document.hidden && rate) syncPlay(); });
$('preset').onchange = e => { const p = presetsData.presets.find(x => x.id === e.target.value); if (!p) return;
  const t = p.tz === 'local' ? new Date(`${p.date}T${p.time}`) : new Date(`${p.date}T${p.time}:00Z`);
  $('presetInfo').innerHTML = (p.figure || p.figureDraft || p.note || '') + (p.status === 'UNCONFIRMED' ? ' <span class="badge">UNCONFIRMED</span>' : '') + (p.sources[0]?.startsWith('http') ? ` <a href="${p.sources[0]}" target="_blank" rel="noopener">source</a>` : '');
  rate = 0; syncPlay(); store.set({ t }); };
document.querySelectorAll('[data-planet]').forEach(b => b.onclick = () => store.set({ sel: b.dataset.planet }));
$('panel').addEventListener('change', e => { if (e.target.name === 'lv') store.set({ letters: e.target.value }); });
$('orrery').addEventListener('click', e => { const c = $('orrery'), r = c.getBoundingClientRect(), x = (e.clientX - r.left) * c.width / r.width, y = (e.clientY - r.top) * c.height / r.height;
  const h = hits.find(h => Math.hypot(h.x - x, h.y - y) < h.r) || (store.get().view === 'helio' && Math.hypot(c.width / 2 - x, c.height / 2 - y) < 14 ? { id: 'sun' } : null);
  if (h && planets.some(p => p.id === h.id)) store.set({ sel: h.id }); });
export { store };
render(store.get());
