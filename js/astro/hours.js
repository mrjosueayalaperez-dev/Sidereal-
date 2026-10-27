// Planetary hours (Chaldean order ♄♃♂☉♀☿☽). Day (sunrise→sunset) and night (sunset→next sunrise) each split into 12 unequal hours;
// hour 1 of the day belongs to the day ruler (Agrippa II / Regardie, per research doc §6.8).
import { Astronomy as A } from '../ephemeris.js';
export const CHALDEAN = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];
export const DAY_RULER = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']; // Sunday..Saturday
/** ymd: 'YYYY-MM-DD' civil date at the location. Returns 24 hours with start/end Date and ruler. */
export function planetaryHours(ymd, lat, lon) {
  const obs = new A.Observer(lat, lon, 0);
  const localMidnightUT = new Date(Date.parse(ymd + 'T00:00:00Z') - lon / 15 * 3600e3);
  const rise = A.SearchRiseSet(A.Body.Sun, obs, +1, localMidnightUT, 1)?.date;
  const set = rise && A.SearchRiseSet(A.Body.Sun, obs, -1, rise, 1)?.date;
  const rise2 = set && A.SearchRiseSet(A.Body.Sun, obs, +1, set, 1)?.date;
  if (!rise || !set || !rise2) return { error: 'No sunrise/sunset (polar day/night) — planetary hours undefined' };
  const wd = new Date(ymd + 'T12:00:00Z').getUTCDay(), first = CHALDEAN.indexOf(DAY_RULER[wd]);
  const dayLen = (set - rise) / 12, nightLen = (rise2 - set) / 12, hours = [];
  for (let i = 0; i < 24; i++) { const day = i < 12, s = day ? +rise + i * dayLen : +set + (i - 12) * nightLen;
    hours.push({ n: (i % 12) + 1, part: day ? 'day' : 'night', start: new Date(s), end: new Date(s + (day ? dayLen : nightLen)), ruler: CHALDEAN[(first + i) % 7] }); }
  return { sunrise: rise, sunset: set, nextSunrise: rise2, dayRuler: DAY_RULER[wd], hours };
}
