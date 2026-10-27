import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { pathForPlanet } from '../js/render/tree.js';
const L = f => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url)));
const { planets } = L('planets'), { paths } = L('paths');
test('GD: planet path = doc §4 planets-on-paths', () => { for (const p of planets) assert.equal(pathForPlanet(p, paths, 'gd'), p.path, p.id); });
test('Gra: Saturn->Beth->12, Moon->Tav->32', () => { const f = id => pathForPlanet(planets.find(p => p.id === id), paths, 'gra'); assert.equal(f('saturn'), 12); assert.equal(f('moon'), 32); });
