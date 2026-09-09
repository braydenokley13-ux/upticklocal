import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const fixture = JSON.parse(readFileSync(new URL('../film/data/acquisition.json', import.meta.url)));
assert.equal(fixture.illustrative, true);
assert.equal(fixture.disclaimer, 'Illustrative campaign data.');
const keys = ['claims', 'firstVisits', 'optIns', 'returns'];
const totals = Object.fromEntries(keys.map(key => [key, 0]));
assert.equal(new Set(fixture.sources.map(source => source.id)).size, fixture.sources.length);
for (const source of fixture.sources) {
  let previous = Infinity;
  for (const key of keys) {
    assert(Number.isInteger(source[key]) && source[key] >= 0, `${source.id}: invalid ${key}`);
    assert(source[key] <= previous, `${source.id}: ${key} exceeds prior state`);
    previous = source[key];
    totals[key] += source[key];
  }
}
assert.deepEqual(totals, {claims:24, firstVisits:18, optIns:14, returns:5});
const source = fixture.sources.find(source => source.id === fixture.hero.sourceId);
assert(source && source.returns > 0, 'Hero must belong to a returning acquisition source');
assert.equal(source.distanceMiles, 0.7);
assert.deepEqual(fixture.hero.events.map(event => event.kind),
  ['claim', 'first-redemption', 'permission', 'return-offer', 'return-redemption']);
for (let i = 1; i < fixture.hero.events.length; i++) {
  assert(fixture.hero.events[i].weekMinute > fixture.hero.events[i - 1].weekMinute,
    'Permission and return must follow acquisition in time');
}
assert.equal(fixture.hero.events[2].accepted, true);
assert.equal(fixture.hero.events[2].action, fixture.permission.action);
assert.equal(fixture.hero.events[1].priceCents, 0);
assert.equal(fixture.hero.events[4].priceCents, fixture.returnOffer.priceCents);
assert(fixture.returnOffer.priceCents > 0, 'The second offer must be paid');
const friday = fixture.hero.events[4].weekMinute - 4 * 1440;
assert(friday >= 360 && friday < 600, 'Return must occur Friday 6–10 AM');
let end = 0;
for (const act of fixture.acts) {
  assert.equal(act.start, end, `${act.id}: timeline gap or overlap`);
  assert(Number.isInteger(act.end) && act.end > act.start);
  end = act.end;
}
assert.equal(fixture.fps, 24);
assert(end / fixture.fps >= 64 && end / fixture.fps <= 68);
console.log(JSON.stringify({status:'PASS', totals, frames:end, fps:fixture.fps,
  seconds:end / fixture.fps, scope:'Fixture only; no render or creative gate validated'}, null, 2));
