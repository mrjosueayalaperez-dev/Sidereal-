export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_GLYPH = '♈♉♊♋♌♍♎♏♐♑♒♓';
const jd = t => t.getTime() / 864e5 + 2440587.5;
/** Ayanamsa (deg) = candidate at t0 + linear rate. Returns {deg, status}. */
export function ayanamsa(data, id, t) { const s = data.systems.find(x => x.id === id); if (!s || s.candidate == null) return { deg: null, status: 'UNCONFIRMED' };
  return { deg: s.candidate + (jd(t) - s.t0JD) / 365.25 * data.rateArcsecPerYear / 3600, status: s.value == null ? 'UNCONFIRMED' : 'confirmed' }; }
export const norm = x => ((x % 360) + 360) % 360;
export function sign(lon) { const l = norm(lon), i = Math.floor(l / 30); return { index: i, name: SIGNS[i], glyph: SIGN_GLYPH[i], deg: l - i * 30 }; }
export const fmt = lon => { const s = sign(lon), d = Math.floor(s.deg), m = Math.floor((s.deg - d) * 60); return `${d}°${String(m).padStart(2, '0')}′ ${s.name}`; };
