// Generic renderer for the built-in per-planet esoteric layer. Driven entirely by data/esoteric-registry.json:
// any field listed there and present in planet.esoteric renders, always (no visibility toggle).
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const badge = f => `<span class="badge" title="${esc(f.note || 'Not verified against a primary source')}">UNCONFIRMED</span>`;
/** Resolve the field for an attribution system (e.g. gd/gra) if the registry marks it systemAware. */
export function resolveField(field, reg, system) {
  if (reg.systemAware && system && field.system !== system && field.variants?.[system]) return { ...field.variants[system], system };
  return field;
}
function fmtValue(f, reg, letters) {
  if (f.value === null || f.status === 'UNCONFIRMED') return `<span class="muted">—</span> ${badge(f)}`;
  if (reg.format === 'hebrew-letter') { const L = letters?.find(l => l.char === f.value); return `<span lang="he" class="heb">${esc(f.value)}</span>${L ? ` ${esc(L.name)}` : ''}`; }
  return esc(f.value) + (reg.detailKey && f[reg.detailKey] ? ` <span class="muted">(<span lang="he">${esc(f[reg.detailKey])}</span>)</span>` : '');
}
/** Full card rows (table) or compact inline summary. */
export function renderEsoteric(planet, registry, { system = 'gd', letters = null, compact = false } = {}) {
  const rows = registry.fields.filter(r => planet.esoteric?.[r.key]).map(r => { const f = resolveField(planet.esoteric[r.key], r, system);
    return { r, f, html: fmtValue(f, r, letters) }; });
  if (compact) return `<span class="eso" data-eso-planet="${esc(planet.id)}">${rows.map(({ r, html }) => `<span data-eso="${esc(r.key)}" title="${esc(r.label)}">${html}</span>`).join(' · ')}</span>`;
  return `<table class="esoteric" data-eso-planet="${esc(planet.id)}"><caption class="muted">Built-in correspondences</caption>${rows.map(({ r, f, html }) =>
    `<tr data-eso="${esc(r.key)}"><th scope="row">${esc(r.label)}${r.systemAware ? ` <span class="muted">(${esc((f.system || system).toUpperCase())})</span>` : ''}</th><td>${html}</td></tr>`).join('')}</table>`;
}
/** Append the compact built-in layer to any table row naming a planet (positions, signs, …). Idempotent per render. */
export function decorateRows(root, planets, registry, opts) {
  for (const tr of root.querySelectorAll('#pos tr, #signs tr')) {
    if (tr.querySelector('.eso-cell')) continue;
    const cell = document.createElement(tr.querySelector('th') ? 'th' : 'td'); cell.className = 'eso-cell';
    if (cell.tagName === 'TH') cell.textContent = 'Letter · Gematria · Tarot';
    else { const name = (tr.cells[0]?.textContent || '').toLowerCase(); const p = planets.find(p => new RegExp(`\\b${p.id}\\b`).test(name)); if (p) cell.innerHTML = renderEsoteric(p, registry, { ...opts, compact: true }); }
    tr.appendChild(cell);
  }
}
