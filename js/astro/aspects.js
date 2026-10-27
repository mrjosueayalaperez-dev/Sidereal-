// Aspects between geocentric longitudes. Default orbs: 8° for conjunction/opposition/square/trine, 6° for sextile
// (interpretation of research doc §6.5 "default 8°/6°"; configurable).
export const ASPECTS = [{ id: 'conjunction', angle: 0, glyph: '☌' }, { id: 'sextile', angle: 60, glyph: '⚹' }, { id: 'square', angle: 90, glyph: '□' }, { id: 'trine', angle: 120, glyph: '△' }, { id: 'opposition', angle: 180, glyph: '☍' }];
export const DEFAULT_ORBS = { conjunction: 8, sextile: 6, square: 8, trine: 8, opposition: 8 };
export function aspects(lons, orbs = DEFAULT_ORBS) {
  const ids = Object.keys(lons), out = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    let d = Math.abs(lons[ids[i]] - lons[ids[j]]) % 360; if (d > 180) d = 360 - d;
    for (const a of ASPECTS) { const orb = Math.abs(d - a.angle); if (orb <= orbs[a.id]) out.push({ a: ids[i], b: ids[j], type: a.id, glyph: a.glyph, orb: +orb.toFixed(3) }); }
  }
  return out;
}
