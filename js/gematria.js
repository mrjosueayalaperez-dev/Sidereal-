// Gematria from data/letters.json: standard (mispar hechrachi), gadol (finals 500-900), ordinal (1-22).
export function makeGematria(letters) {
  const map = new Map();
  for (const l of letters) { map.set(l.char, l); if (l.final) map.set(l.final.char, { ...l.final, name: l.name + ' (final)' }); }
  return word => [...word].reduce((a, c) => { const l = map.get(c); if (!l) throw new Error('not a Hebrew letter: ' + c);
    return { standard: a.standard + l.standard, gadol: a.gadol + l.gadol, ordinal: a.ordinal + l.ordinal, parts: [...a.parts, [c, l.standard]] }; },
    { standard: 0, gadol: 0, ordinal: 0, parts: [] });
}
