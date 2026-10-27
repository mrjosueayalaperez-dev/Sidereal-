// One-off fixture generator: queries the public JPL Horizons API (no credentials)
// for observer-centred (geocentric, apparent, ecliptic-of-date) longitudes.
// Usage: node tools/fetch-horizons.mjs > tests/fixtures/horizons.json
const bodies = { sun: '10', moon: '301', mercury: '199', venus: '299', mars: '499',
  jupiter: '599', saturn: '699', uranus: '799', neptune: '899', pluto: '999' };
const dates = ['1929-10-29 12:00', '1977-03-17 12:00', '2000-01-01 12:00', '2020-03-16 12:00'];
const out = { source: 'JPL Horizons API https://ssd.jpl.nasa.gov/api/horizons.api', quantity: '31 (ObsEcLon/ObsEcLat, apparent, ecliptic of date)', center: '500@399 (geocentre)', timeScale: 'UT', fetched: new Date().toISOString(), data: {} };
for (const d of dates) {
  out.data[d] = {};
  for (const [name, id] of Object.entries(bodies)) {
    const [day] = d.split(' ');
    const p = new URLSearchParams({ format: 'json', COMMAND: `'${id}'`, EPHEM_TYPE: 'OBSERVER', CENTER: "'500@399'",
      START_TIME: `'${d}'`, STOP_TIME: `'${day} 12:01'`, STEP_SIZE: "'1 m'", QUANTITIES: "'31'", TIME_TYPE: 'UT', CSV_FORMAT: 'YES', MAKE_EPHEM: 'YES' });
    const r = await (await fetch('https://ssd.jpl.nasa.gov/api/horizons.api?' + p)).json();
    const line = r.result.split('$$SOE')[1].trim().split('\n')[0];
    const cols = line.split(',').map(s => s.trim());
    const nums = cols.filter(c => /^-?\d+\.\d+$/.test(c)).map(Number);
    out.data[d][name] = { lon: nums[0], lat: nums[1], raw: line };
  }
}
console.log(JSON.stringify(out, null, 1));
