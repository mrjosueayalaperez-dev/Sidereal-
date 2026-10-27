// Thin wrapper over astronomy-engine v2.1.19 (MIT). Longitudes in degrees, true ecliptic of date.
import * as A from '../vendor/astronomy.js';
export { A as Astronomy };
export const BODIES = ['sun', 'moon', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const cap = s => s[0].toUpperCase() + s.slice(1);
export const body = id => A.Body[cap(id)];
const norm = x => ((x % 360) + 360) % 360;
/** Geocentric apparent ecliptic longitude/latitude (light-time + aberration corrected). */
export function geo(id, date) {
  const v = A.GeoVector(body(id), date, true); const e = A.Ecliptic(v);
  return { lon: norm(e.elon), lat: e.elat, dist: v.Length() };
}
/** Heliocentric ecliptic longitude/latitude/distance (AU). */
export function helio(id, date) {
  const v = A.HelioVector(body(id), date); const e = A.Ecliptic(v);
  return { lon: norm(e.elon), lat: e.elat, dist: v.Length() };
}
export const angDiff = (a, b) => { const d = Math.abs(norm(a) - norm(b)) % 360; return d > 180 ? 360 - d : d; };
/** Outside 1800–2200 ΔT uncertainty grows; UI shows a "low precision" badge. */
export const lowPrecision = date => { const y = date.getUTCFullYear(); return y < 1800 || y > 2200; };
