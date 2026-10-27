// Click-a-planet card: correspondences, gematria, letters (version toggle), sources. Unconfirmed fields get a badge.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const GEMATRIA_NOTE = 'Gematria values are traditional and educational. They are not predictive and do not describe any causal influence.';
const U = v => `<span class="muted">—</span> <span class="badge" title="${esc(v.note)}">UNCONFIRMED</span>${v.draft ? ` <span class="muted">(draft: ${esc(v.draft)})</span>` : ''}`;
const val = v => v && v.status === 'UNCONFIRMED' ? U(v) : esc(v?.value ?? v);
export function renderPanel(el, { planet, letters, sephirot, gem, version, sources }) {
  if (!planet) { el.innerHTML = '<h2>Correspondences</h2><p class="muted">Select a planet (click the orrery or use the buttons).</p>'; return; }
  const g = gem(planet.hebrewName), seph = sephirot.find(s => s.n === planet.sephirah);
  const letterChar = planet.letters[version]; const L = typeof letterChar === 'string' ? letters.find(l => l.char === letterChar) : null;
  el.innerHTML = `<h2>${planet.symbol} ${esc(planet.id[0].toUpperCase() + planet.id.slice(1))}</h2>
  <table>
   <tr><th>Hebrew</th><td dir="rtl" lang="he">${planet.hebrewName}</td><td>${planet.translit}</td></tr>
   <tr><th>Metal</th><td colspan="2">${planet.metal}</td></tr><tr><th>Day</th><td colspan="2">${planet.day}</td></tr>
   <tr><th>King scale</th><td colspan="2"><span style="display:inline-block;width:12px;height:12px;background:${planet.colors.king.hex}"></span> ${planet.colors.king.name}</td></tr>
   <tr><th>Queen scale</th><td colspan="2">${val(planet.colors.queen)}</td></tr>
   <tr><th>Sephirah</th><td colspan="2">${planet.sephirah} ${seph.name} <span lang="he">${seph.hebrew}</span></td></tr>
   <tr><th>Path (GD)</th><td colspan="2">${planet.path}</td></tr>
   <tr><th>Hexagram</th><td colspan="2">${val(planet.hexagram)}</td></tr>
  </table>
  <h3>Double letter</h3>
  <div class="row" role="radiogroup" aria-label="Sefer Yetzirah version">${['gd', 'gra'].map(v => `<label><input type="radio" name="lv" value="${v}" ${v === version ? 'checked' : ''}> ${v === 'gd' ? 'GD / 777' : 'Gra'}</label>`).join('')}
   <span class="muted">Short/Long/Saadia</span> <span class="badge" title="${esc(planet.letters.short.note)}">UNCONFIRMED</span></div>
  <p id="letterOut">${L ? `<span lang="he" style="font-size:22px">${L.char}</span> ${L.name} (=${L.standard})` : val(letterChar)}</p>
  <h3>Gematria of <span lang="he">${planet.hebrewName}</span></h3>
  <table id="gemTable"><tr><th>Method</th><th>Value</th></tr>
   <tr><td>Standard</td><td data-k="standard">${g.standard}</td></tr><tr><td>Gadol</td><td data-k="gadol">${g.gadol}</td></tr><tr><td>Ordinal</td><td data-k="ordinal">${g.ordinal}</td></tr></table>
  <p class="muted" dir="ltr" style="font-size:12px">${g.parts.map(([c, n]) => `<bdi lang="he">${c}</bdi>(${n})`).join(" + ")} = ${g.standard}</p>
  <p class="disclaimer" role="note">${GEMATRIA_NOTE}</p>
  <details><summary>Sources</summary><ul>${planet.sources.map(s => `<li>${esc(sources[s] || s)}</li>`).join('')}</ul></details>`;
}
