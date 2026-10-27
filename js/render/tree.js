// SVG Tree of Life. Paths with UNCONFIRMED endpoints are drawn dashed from the research-doc draft and badged.
const NS = 'http://www.w3.org/2000/svg', W = 300, H = 520;
const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
export function renderTree(host, { sephirot, paths, onPath, showDaath = true }) {
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Tree of Life: 10 sephirot and 22 paths', id: 'treeSvg' });
  const P = n => { const s = sephirot.find(s => s.n === n); return [20 + s.pos.x * (W - 40), 20 + s.pos.y * (H - 40)]; };
  for (const p of paths) {
    const ends = p.from ? [p.from, p.to] : [p.draft.from, p.draft.to]; const [a, b] = ends.map(P);
    const g = el('g', { 'data-path': p.n, tabindex: 0, role: 'button', 'aria-label': `Path ${p.n} ${p.letter} ${p.attribution.id}${p.status ? ' (endpoints UNCONFIRMED)' : ''}` });
    g.appendChild(el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#8a7224', 'stroke-width': 4, 'stroke-dasharray': p.status ? '6 5' : '', class: 'path-line' }));
    const t = el('text', { x: (a[0] + b[0]) / 2 + 6, y: (a[1] + b[1]) / 2 - 3, fill: p.status ? '#ffb347' : '#a59f8c', 'font-size': 11 }); t.textContent = p.letter + p.n + (p.status ? '?' : ''); g.appendChild(t);
    const ti = el('title', {}); ti.textContent = `Path ${p.n} ${p.letter}: ${p.attribution.type} ${p.attribution.id}${p.status ? ' — ' + p.note : ''}`; g.appendChild(ti);
    g.addEventListener('click', () => onPath?.(p)); g.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && onPath?.(p));
    svg.appendChild(g);
  }
  for (const s of sephirot) {
    if (s.optional && !showDaath) continue;
    const [x, y] = s.n ? P(s.n) : [20 + s.pos.x * (W - 40), 20 + s.pos.y * (H - 40)];
    const g = el('g', { 'data-seph': s.n ?? 'daath' });
    g.appendChild(el('circle', { cx: x, cy: y, r: 22, fill: '#111116', stroke: s.optional ? '#555' : '#d4af37', 'stroke-width': 2, 'stroke-dasharray': s.optional ? '3 3' : '', class: 'seph' }));
    const t = el('text', { x, y: y + 4, fill: '#eee6cf', 'font-size': 10, 'text-anchor': 'middle' }); t.textContent = (s.n ? s.n + ' ' : '') + s.name; g.appendChild(t);
    svg.appendChild(g);
  }
  host.replaceChildren(svg);
}
export function highlightTree(host, { sephirah = null, path = null } = {}) {
  host.querySelectorAll('[data-seph] circle').forEach(c => { const on = +c.parentNode.dataset.seph === sephirah; c.setAttribute('fill', on ? '#d4af37' : '#111116'); });
  host.querySelectorAll('[data-path]').forEach(g => { const on = +g.dataset.path === path; g.querySelector('line').setAttribute('stroke', on ? '#ffd700' : '#8a7224'); g.querySelector('line').setAttribute('stroke-width', on ? 7 : 4); g.setAttribute('aria-pressed', on); });
}
/** Path for a planet under a letter version: GD path table carries letters, so look up by the version's letter. */
export function pathForPlanet(planet, paths, version) { const ch = planet.letters[version]; return typeof ch === 'string' ? paths.find(p => p.letter === ch)?.n ?? null : null; }
