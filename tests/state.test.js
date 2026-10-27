import test from 'node:test'; import assert from 'node:assert/strict';
import { parse, serialize, SPEEDS } from '../js/state.js';
test('URL round-trip (doc §6 example)', () => {
  const q = 't=1977-03-17T12:00Z&view=geo&zodiac=sidereal&ayan=lahiri&letters=gd';
  const s = parse(q); assert.equal(s.t.toISOString(), '1977-03-17T12:00:00.000Z'); assert.equal(s.view, 'geo'); assert.equal(s.zodiac, 'sidereal');
  assert.deepEqual(parse(serialize(s)), s);
});
test('invalid params fall back to defaults', () => { const s = parse('view=x&t=nope&letters=evil'); assert.equal(s.view, 'helio'); assert.equal(s.t, null); assert.equal(s.letters, 'gd'); });
test('speeds', () => assert.deepEqual(Object.keys(SPEEDS), ['1h', '1d', '1wk', '1mo', '1yr']));
