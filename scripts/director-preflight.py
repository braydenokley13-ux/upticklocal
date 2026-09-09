#!/usr/bin/env python3
"""Editorial and input integrity, never a substitute for watching the cut."""
import importlib.util,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('production',ROOT/'scripts/director-production.py')
P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)
plan=P.PLAN
assert (plan['fps'],plan['width'],plan['height'],plan['frames'])==(24,1920,1080,1248)
shots=P.SHOTS
assert len(shots)==len(plan['shots']), 'Duplicate plate IDs'
end=0
for cut in plan['edit']:
    assert cut['from']==end and cut['duration']>0, f'Gap/overlap at {cut["id"]}'
    if cut['plate']:
        assert cut['plate'] in shots
        assert 0<=cut['start'] and cut['start']+cut['duration']<=shots[cut['plate']]['frames'],f'Frozen/overrun plate: {cut["id"]}'
    end+=cut['duration']
assert end==plan['frames']
# Film.tsx owns these special layouts. Bound every actual source interval.
uses=[('first',0,72),('permission',72,72),('paid',0,72),
      ('wash',0,24),('lube',0,24),('encounter',48,48),('first',24,48),('permission',90,48),('return',24,72),('station',0,96)]
for name,start,n in uses:assert start+n<=shots[name]['frames'],f'Proof/teaser source overrun: {name}'
fixture=json.loads((ROOT/'film/data/acquisition.json').read_text())
assert fixture['hero']['sourceId']=='car-wash'
assert fixture['sources'][0]['distanceMiles']==.7
assert fixture['returnOffer']['priceCents']==499
assert fixture['hero']['events'][2]['accepted'] is True
assert [x['weekMinute'] for x in fixture['hero']['events']]==sorted(x['weekMinute'] for x in fixture['hero']['events'])
for cue in plan['sound']:
    assert 0<=cue['at'] and cue['at']+cue['frames']<=plan['frames']
    assert (ROOT/f'public/film-rd/audio/{cue["file"]}.ogg').is_file(), f'Missing sound: {cue}'
for path in P.inputs():assert path.is_file(),f'Missing production input: {path}'
source=(ROOT/'film/compositions/director/Film.tsx').read_text()
assert 'edit.disclaimer' in source and 'edit.networkCopy' in source
assert 'creative-approval' not in source, 'Do not bake approval claims into the movie'
print(json.dumps({'status':'TECHNICAL PREFLIGHT PASS; CREATIVE LOCK NOT IMPLIED','frames':end,'seconds':end/24,'freshFrames':sum(x['frames'] for x in shots.values()),'sourceHash':P.source_record()['sourceHash']},indent=2))
