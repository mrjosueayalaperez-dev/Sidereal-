import * as Astronomy from '../vendor/astronomy.js';
document.getElementById('status').textContent = `astronomy-engine loaded (${typeof Astronomy.GeoVector === 'function' ? 'ok' : 'missing'})`;
