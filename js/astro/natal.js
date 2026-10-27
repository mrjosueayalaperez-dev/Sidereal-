// Natal snapshot — signs only (research doc §6.9). Houses (Placidus etc.) and the optional 3D view are DEFERRED.
import { geo } from '../ephemeris.js'; import { sign, fmt, ayanamsa } from './zodiac.js'; import { isRetro } from './retro.js';
export const NATAL_BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export function natalSnapshot(t, { zodiac = 'tropical', ayanData = null, ayan = 'lahiri' } = {}) {
  const ay = zodiac === 'sidereal' ? ayanamsa(ayanData, ayan, t) : null;
  return { t, zodiac, ayanamsa: ay, houses: { value: null, status: 'DEFERRED', note: 'House systems not implemented (T13 later).' },
    bodies: NATAL_BODIES.map(id => { const lon = (geo(id, t).lon - (ay?.deg ?? 0) + 360) % 360; return { id, lon, sign: sign(lon).name, text: fmt(lon), retro: isRetro(id, t) }; }) };
}
export const snapshotText = s => `Natal snapshot ${s.t.toISOString().slice(0, 16)}Z (${s.zodiac}${s.ayanamsa ? ', ayanamsa UNCONFIRMED constants' : ''})\n` + s.bodies.map(b => `${b.id}: ${b.text}${b.retro ? ' R' : ''}`).join('\n') + '\nHouses: not computed. Educational only; not a prediction.';
