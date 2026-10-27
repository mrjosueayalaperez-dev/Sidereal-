import { helio } from './ephemeris.js';
import { drawOrrery, PLANETS } from './render/orrery.js';
const app = document.getElementById('app');
app.innerHTML = `<section class="card"><canvas id="orrery" width="800" height="800" aria-label="Heliocentric orrery"></canvas></section>
<section class="card" id="side"><h2>Now</h2><p id="when"></p><table id="pos"></table></section>`;
const t = new Date();
const positions = Object.fromEntries(PLANETS.map(id => [id, helio(id, t)]));
const hits = drawOrrery(document.getElementById('orrery'), positions);
document.getElementById('when').textContent = t.toISOString();
document.getElementById('pos').innerHTML = '<tr><th>Body</th><th>Helio lon°</th><th>AU</th></tr>' +
  PLANETS.map(id => `<tr><td>${id}</td><td>${positions[id].lon.toFixed(2)}</td><td>${positions[id].dist.toFixed(2)}</td></tr>`).join('');
window.__sidereal = { t, positions, hits };
