// Owner reference layer (data/zelator.json, source JAP:zelator-2026-10-27). Reference data only; every value carries
// its source and a tradition label (Jewish Kabbalah / Hermetic Qabalah / Personal interpretation), shown as a tag.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TAG = { 'Jewish Kabbalah': 'jk', 'Hermetic Qabalah': 'hq', 'Personal interpretation': 'pi' };
export const tradTag = t => `<span class="trad trad-${TAG[t] || 'x'}" title="Tradition: ${esc(t)}">${esc(t)}</span>`;
/** One labelled cell: value + tradition tag (+ UNCONFIRMED badge if ever blank). */
export function cell(f, fmt = v => esc(v)) {
  if (!f) return '';
  if (f.value === null || f.status === 'UNCONFIRMED') return `<span class="muted">—</span> <span class="badge" title="${esc(f.note || '')}">UNCONFIRMED</span>`;
  return `${fmt(f.value)} ${tradTag(f.tradition)}`;
}
const heb = v => `<span lang="he" class="heb">${esc(v)}</span>`;
export function renderZelator(z, sources = {}) {
  const src = `<span class="muted" data-src="${esc(z.source)}">Source: ${esc(sources[z.source] || z.source)} — ${esc(z.status)}</span>`;
  const seph = z.sephiroth.map(s => `<tr data-zseph="${s.n}"><td>${s.n}</td><td>${cell(s.name)}</td><td>${cell(s.meaning)}</td></tr>`).join('');
  const paths = z.paths.map(p => `<tr data-zpath="${p.n.value}"><td>${cell(p.n)}</td><td>${cell(p.letter, heb)} ${esc(p.letterName.value)}</td><td>${cell(p.value)}</td><td>${cell(p.tarot)}</td><td>${cell(p.symbol)}</td><td>${cell(p.attribution)}</td><td>${cell(p.treeConnection, v => v.join('–'))}</td></tr>`).join('');
  const meth = z.gematria.methods.map(m => `<tr data-zgem="${esc(m.id)}"><th scope="row">${esc(m.name.value)}</th><td>${cell(m.description)}</td></tr>`).join('');
  const ex = z.gematria.examples.map(e => `<tr><td>${heb(e.word.value)} <span class="muted">${esc(e.gloss.value)}</span></td><td>${cell(e.value)}</td></tr>`).join('');
  const mm = z.moonMonday;
  const hzc = z.hehZayinCheth.map(l => `<tr data-zletter="${esc(l.name.value)}"><td>${cell(l.letter, heb)} ${esc(l.name.value)}</td><td>${cell(l.value)}</td><td>Path ${cell(l.path)}</td><td>${cell(l.tarot)}</td><td>${cell(l.symbol)}</td><td>${cell(l.attribution)}</td></tr>`
    + ['jewishTeaching', 'arithmeticEquality', 'tarotVariant'].filter(k => l[k]).map(k => `<tr><td></td><td colspan="5">${cell(l[k])}</td></tr>`).join('')
    + (l.spelledName ? `<tr><td></td><td colspan="5">Spelled name ${cell(l.spelledName, v => `${heb(v.word)} = ${esc(v.value)}`)}</td></tr>` : '')).join('');
  const conf = (z.conflicts || []).map(c => `<li>Path ${c.path}: existing ${esc(c.existing)}; this source: ${esc(c.thisSource)} — ${esc(c.note)}</li>`).join('');
  return `<h2>Zelator reference <span class="muted" style="font-size:13px">(reference data only)</span></h2>
 <p class="disclaimer" role="note" id="traditionsNote">${esc(z.traditionsNote)}</p>
 <p class="row" aria-label="Tradition labels">${z.traditions.map(tradTag).join(' ')}</p>
 <p>${src}</p>
 <div class="zgrid">
 <div><h3>Ten sephiroth</h3><table class="esoteric" id="zSeph"><tr><th>#</th><th>Name</th><th>Meaning</th></tr>${seph}</table>
  <p class="muted" style="font-size:12px">${cell(z.pillarsNote)}<br>${cell(z.daath)}</p></div>
 <div><h3>Moon · Monday</h3><table class="esoteric" id="zMoon"><tr><th scope="row">Planetary day</th><td>${cell(mm.day)}</td></tr>
  <tr><th scope="row">Weekday sequence</th><td>${cell(mm.weekdaySequence, v => v.map(([d, p]) => `${esc(d[0].toUpperCase() + d.slice(1))}–${esc(p)}`).join('; '))}</td></tr>
  <tr><th scope="row">Lunar themes</th><td>${cell(mm.lunarThemes)}</td></tr>
  <tr><th scope="row">Levanah <span lang="he">${esc(mm.levanahGematria.word)}</span></th><td>${cell(mm.levanahGematria)}</td></tr>
  <tr><th scope="row">Constellation vs sign</th><td>${cell(mm.constellationVsSign)}</td></tr></table>
  <h3>Gematria methods</h3><table class="esoteric" id="zGem">${meth}</table>
  <table class="esoteric" id="zGemEx"><caption class="muted">Worked values (standard method)</caption>${ex}</table>
  <p class="muted" style="font-size:12px">${cell(z.gematria.correction)}</p></div>
 </div>
 <h3>22 paths <span class="muted" style="font-size:12px">(path = 11 + letter index)</span></h3>
 <div style="overflow-x:auto"><table class="esoteric" id="zPaths"><tr><th>Path</th><th>Letter</th><th>Value</th><th>Tarot</th><th>Symbol</th><th>Attribution</th><th>Tree</th></tr>${paths}</table></div>
 <p class="muted" style="font-size:12px">${cell(z.pathsNote)}</p>
 <h3>Heh · Zayin · Cheth</h3><div style="overflow-x:auto"><table class="esoteric" id="zHZC">${hzc}</table></div>
 ${conf ? `<details><summary>Notes vs existing data</summary><ul class="muted" style="font-size:12px">${conf}</ul></details>` : ''}`;
}
