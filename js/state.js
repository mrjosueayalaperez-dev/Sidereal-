// Single store + URL param sync (history.replaceState). Pure parse/serialize are unit-tested in Node.
export const DEFAULTS = { t: null, view: 'helio', zodiac: 'tropical', ayan: 'lahiri', letters: 'gd', sel: null, tz: 'utc' };
const ENUMS = { view: ['helio', 'geo'], zodiac: ['tropical', 'sidereal'], ayan: ['lahiri', 'fagan-bradley', 'raman', 'krishnamurti'], letters: ['gd', 'gra'], tz: ['utc', 'local'] };
export function parse(search) {
  const q = new URLSearchParams(search), s = { ...DEFAULTS };
  const t = q.get('t'); if (t && !isNaN(Date.parse(t))) s.t = new Date(t);
  for (const k of Object.keys(ENUMS)) { const v = q.get(k); if (ENUMS[k].includes(v)) s[k] = v; }
  if (q.get('sel')) s.sel = q.get('sel').replace(/[^a-z]/g, '');
  return s;
}
export function serialize(s) {
  const q = new URLSearchParams();
  if (s.t) q.set('t', s.t.toISOString().replace(/:00\.000Z$/, 'Z').replace(/\.000Z$/, 'Z'));
  for (const k of Object.keys(ENUMS)) if (s[k] !== DEFAULTS[k]) q.set(k, s[k]);
  if (s.sel) q.set('sel', s.sel);
  return q.toString().replace(/%3A/g, ':');
}
export const SPEEDS = { '1h': 3600e3, '1d': 86400e3, '1wk': 7 * 86400e3, '1mo': 30.436875 * 86400e3, '1yr': 365.25 * 86400e3 };
export function createStore(init) {
  let s = init; const subs = new Set();
  return { get: () => s, set(p) { s = { ...s, ...p }; subs.forEach(f => f(s)); }, sub: f => subs.add(f) };
}
