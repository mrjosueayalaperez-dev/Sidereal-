// Canvas 2D orrery: true ecliptic longitudes, log-scaled radii. Ecliptic longitude 0° (♈) points right, increasing counter-clockwise.
export const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
export const GLYPH = { sun: '☉', moon: '☽', mercury: '☿', venus: '♀', earth: '⊕', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇' };
export const COLOR = { sun: '#ffb000', moon: '#d8d8e0', mercury: '#c9b37e', venus: '#e8d07a', earth: '#5aa0ff', mars: '#e0553a', jupiter: '#d9a066', saturn: '#e3c98f', uranus: '#8fd8e0', neptune: '#5577ff', pluto: '#a88' };
const radius = (au, R) => R * (0.12 + 0.88 * Math.log10(1 + au * 2) / Math.log10(1 + 31 * 2));
let bg = null;
function staticLayer(w, h, R) {
  const c = new OffscreenCanvas(w, h), g = c.getContext('2d'); const cx = w / 2, cy = h / 2;
  g.strokeStyle = '#2a2618'; g.fillStyle = '#6b6450'; g.font = '12px serif';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); g.stroke(); }
  g.fillText('0° Aries', cx + R - 34, cy - 4); return c;
}
/** positions: {id:{lon,dist}} ; centre: 'sun'|'earth'. Returns hit targets [{id,x,y,r}]. */
export function drawOrrery(canvas, positions, { centre = 'sun', selected = null } = {}) {
  const g = canvas.getContext('2d'), w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 20;
  if (!bg || bg.width !== w || bg.height !== h) bg = staticLayer(w, h, R);
  g.clearRect(0, 0, w, h); g.drawImage(bg, 0, 0);
  const hits = [];
  g.beginPath(); g.fillStyle = COLOR[centre]; g.arc(cx, cy, 8, 0, 7); g.fill();
  g.font = '18px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const [id, p] of Object.entries(positions)) {
    const r = radius(p.dist, R), a = p.lon * Math.PI / 180, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
    g.strokeStyle = '#1e1c14'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    g.fillStyle = COLOR[id]; g.beginPath(); g.arc(x, y, id === selected ? 7 : 5, 0, 7); g.fill();
    if (id === selected) { g.strokeStyle = '#d4af37'; g.beginPath(); g.arc(x, y, 11, 0, 7); g.stroke(); }
    g.fillStyle = '#eee6cf'; g.fillText(GLYPH[id] + (p.retro ? '℞' : ''), x + 14, y - 12);
    hits.push({ id, x, y, r: 14, cx, cy });
  }
  return hits;
}
