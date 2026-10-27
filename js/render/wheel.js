// SVG zodiac wheel (geocentric). 0° Aries at left (ascendant-style), longitudes increase counter-clockwise.
import { SIGN_GLYPH, SIGNS } from '../astro/zodiac.js';
const NS = 'http://www.w3.org/2000/svg';
const el = (n, a, txt) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; };
const P = (lon, r) => { const a = Math.PI - lon * Math.PI / 180; return [200 + r * Math.cos(a), 200 - r * Math.sin(a)]; };
export function renderWheel(host, bodies, { glyphs, label }) {
  const svg = el('svg', { viewBox: '0 0 400 400', role: 'img', 'aria-label': label, id: 'wheelSvg' });
  svg.appendChild(el('circle', { cx: 200, cy: 200, r: 190, fill: 'none', stroke: '#8a7224' })); svg.appendChild(el('circle', { cx: 200, cy: 200, r: 150, fill: 'none', stroke: '#8a7224' }));
  for (let i = 0; i < 12; i++) { const [x1, y1] = P(i * 30, 150), [x2, y2] = P(i * 30, 190), [tx, ty] = P(i * 30 + 15, 170);
    svg.appendChild(el('line', { x1, y1, x2, y2, stroke: '#8a7224' })); svg.appendChild(el('text', { x: tx, y: ty + 6, 'text-anchor': 'middle', fill: '#d4af37', 'font-size': 18, 'aria-label': SIGNS[i] }, SIGN_GLYPH[i] + '\uFE0E')); }
  for (const [id, b] of Object.entries(bodies)) { const [x, y] = P(b.lon, 125), [x2, y2] = P(b.lon, 150);
    svg.appendChild(el('line', { x1: x, y1: y, x2, y2, stroke: '#555' }));
    svg.appendChild(el('text', { x, y: y + 6, 'text-anchor': 'middle', fill: '#eee6cf', 'font-size': 16, 'data-wbody': id, 'data-lon': b.lon.toFixed(4) }, glyphs[id] + (b.retro ? 'ℛ' : ''))); }
  host.replaceChildren(svg);
}
