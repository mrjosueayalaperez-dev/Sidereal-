import { helio, geo, lowPrecision } from './ephemeris.js';
import { drawOrrery, PLANETS } from './render/orrery.js';
import { parse, serialize, createStore, SPEEDS } from './state.js';
import { makeGematria } from './gematria.js';
import { renderPanel } from './ui/panel.js';
import { decorateRows } from './ui/esoteric.js';
const J = f => fetch(new URL(`../data/${f}.json`, import.meta.url)).then(r => r.json());
const [presetsData, { planets }, { letters }, { sephirot }, { paths }, { sources }, registry] = await Promise.all(['presets', 'planets', 'letters', 'sephirot', 'paths', 'sources', 'esoteric-registry'].map(J));
const gem = makeGematria(letters);
const app = document.getElementById('app');
app.innerHTML = `<section class="card">
 <div class="row" role="group" aria-label="Time controls">
  <label>Date/time <input id="dt" type="datetime-local" step="60"></label>
  <select id="tz" aria-label="Time zone"><option value="utc">UTC</option><option value="local">Local</option></select>
  <button id="now">Now</button>
  <button id="rew" aria-label="Rewind">◀◀</button><button id="play" aria-label="Play">▶</button>
  <select id="speed" aria-label="Speed per second">${Object.keys(SPEEDS).map(k => `<option value="${k}" ${k === '1d' ? 'selected' : ''}>${k}/s</option>`).join('')}</select>
  <span id="prec"></span>
 </div>
 <div class="row" id="presetRow"><label>Preset <select id="preset"><option value="">—</option>${presetsData.presets.map(p => `<option value="${p.id}">${p.label} (${p.date})</option>`).join('')}</select></label>
  <span id="presetInfo" class="muted"></span></div>
 <p class="disclaimer" id="presetDisclaimer" role="note">${presetsData.disclaimer}</p>
 <canvas id="orrery" width="800" height="800" aria-label="Orrery"></canvas></section>
<section class="card" id="side"><div class="row" role="group" aria-label="Select planet">${planets.map(p => `<button data-planet="${p.id}" aria-label="${p.id}">${p.symbol}</button>`).join('')}</div>
 <div id="panel"></div><h2 id="when"></h2><table id="pos"></table></section>`;
const $ = id => document.getElementById(id);
const init = parse(location.search); if (!init.t) init.t = new Date();
const store = createStore(init); let rate = 0, last = 0, hits = [];
const pad = n => String(n).padStart(2, '0');
function toInput(t, tz) { const d = tz === 'utc' ? [t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes()] : [t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes()];
  return `${String(d[0]).padStart(4, '0')}-${pad(d[1] + 1)}-${pad(d[2])}T${pad(d[3])}:${pad(d[4])}`; }
function fromInput(v, tz) { return tz === 'utc' ? new Date(v + ':00Z') : new Date(v); }
export function positionsAt(t, view) {
  if (view === 'geo') return Object.fromEntries(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(id => [id, geo(id, t)]));
  return Object.fromEntries(PLANETS.map(id => [id, helio(id, t)]));
}
function render(s) {
  const pos = positionsAt(s.t, s.view);
  hits = drawOrrery($('orrery'), pos, { centre: s.view === 'geo' ? 'earth' : 'sun', selected: s.sel });
  if (document.activeElement !== $('dt')) $('dt').value = toInput(s.t, s.tz);
  $('tz').value = s.tz; $('when').textContent = s.t.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  $('prec').innerHTML = lowPrecision(s.t) ? '<span class="badge">low precision (outside 1800–2200)</span>' : '';
  $('pos').innerHTML = '<tr><th>Body</th><th>Lon°</th><th>AU</th></tr>' + Object.entries(pos).map(([id, p]) => `<tr><td>${id}</td><td>${p.lon.toFixed(2)}</td><td>${p.dist.toFixed(3)}</td></tr>`).join('');
  renderPanel($('panel'), { planet: planets.find(p => p.id === s.sel), letters, sephirot, gem, version: s.letters, sources, registry });
  document.querySelectorAll('[data-planet]').forEach(b => b.setAttribute('aria-pressed', b.dataset.planet === s.sel));
  decorateRows(document, planets, registry, { system: s.letters, letters });
  history.replaceState(null, '', '?' + serialize(s));
  window.__sidereal = { state: s, positions: pos, hits, rate };
}
store.sub(render);
$('dt').addEventListener('change', e => { const t = fromInput(e.target.value, store.get().tz); if (!isNaN(t)) store.set({ t }); });
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
