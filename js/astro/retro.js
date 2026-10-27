// Retrograde: sign of geocentric ecliptic-longitude change over ±1 day (research doc §6.2).
import { geo } from '../ephemeris.js';
const D = 86400e3;
export function lonRate(id, t) { let d = geo(id, new Date(t.getTime() + D)).lon - geo(id, new Date(t.getTime() - D)).lon; if (d > 180) d -= 360; if (d < -180) d += 360; return d / 2; }
export const isRetro = (id, t) => id !== 'sun' && id !== 'moon' && lonRate(id, t) < 0;
/** Station times in [start,end) found by sign change of lonRate, refined by bisection. */
export function stations(id, start, end, step = 6 * 3600e3) {
  const out = []; let t0 = start.getTime(), r0 = lonRate(id, start);
  for (let t = t0 + step; t < end.getTime(); t += step) { const r = lonRate(id, new Date(t));
    if (Math.sign(r) !== Math.sign(r0)) { let a = t - step, b = t; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; Math.sign(lonRate(id, new Date(m))) === Math.sign(r0) ? a = m : b = m; }
      out.push({ t: new Date((a + b) / 2), type: r < 0 ? 'retrograde' : 'direct' }); }
    r0 = r; }
  return out;
}
