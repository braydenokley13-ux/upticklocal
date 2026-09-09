# The Next Stop — Gate A working record

Status: **NOT PASSED**. Source code and screen bakes are not evidence of a
finished film. The original R&D film's scores do not transfer to this cut.

## Current scoreboard — September 9, on rendered motion

Scores are coarse self-review of **rendered evidence**, not measurements and not
approval. Every row below has been watched as a proxy plate at 24 fps or
inspected at 1920x1080, not judged from a still. Unrendered work earns nothing.
Overall target is 9.25+, with acquisition, route and the paired visits at 9.5+.
**None is certified at that standard, and Gate A is not passed.**

| System | Score | What the render showed | Options tested | Winning direction | Remaining blocker | Target |
| --- | --- | --- | --- | --- | --- | --- |
| External acquisition | 8/10 | Unit reads as installed hardware clear of the building; offer legible at 1080p; wet apron carries a specular; customer stops, turns and raises a lit handset | vacuum, exit, island, forecourt, all at 1280x720 | `option-forecourt` | Vehicle is credible but not a hero object; horizon is bare | 9.5+ |
| Route | 6.5/10 | Was three of seven seconds on empty terrain with a frozen tail; now a road-level travelling move with lamp standards, verges and the destination town growing ahead | 155 m apex vs 20 m vs road level; roadside furniture | Road-level travel, typography left to Remotion | The land either side is still a flat plain. Seven seconds may be more than this shot can earn | 9.5+ |
| First/second pair | 7/10 | Crossing is legible end to end: approach through glass, leaf swings, figure enters and passes. Face no longer carries the frame | Interior at 980/480/260/140 W; sun at 150/195/240; four cameras | Authored camera, room at 300 W, sun behind the door | Shop interior is a dark mass on the left; the pair rhymes but the *difference* between the visits lives in the counter shots, not here | 9.5+ |
| Permission | 7.5/10 | Counter framing is clean, the handset is legible, KEEP ME POSTED precedes YOU'RE IN | Hand-held vs counter-resting; 144-frame sequence checked for endpoints and count | Same coffee, phone and counter persist into permission | Not yet watched inside the full edit for reading time | 9+ |
| Network | 7.5/10 | The same installed unit at Quick Lube and Ridge Tire in one grammar, then a real district pullback over Joe's. The lube car read as hovering and now sits on a lift that is built to be seen | Partner inserts rendered and compared; lift rebuilt | Repeat the installation, change the trade, return to Joe's | Partner buildings are plain boxes; they are two-second inserts, but they are the least finished world in the film | 9+ |
| Proof | 8/10 layout | Tally marks count out 18, 14 and 5 above each number; illustrative-data line is readable | Fixture arithmetic validated; layout inspected at 1080p | Marks resolve into three counts with the qualification held | The transition into it has not been watched; five seconds of reading time is unverified | 9+ |

### What is still missing before Gate A can pass

- The full 67-second cut has not been assembled or watched, muted or with sound.
- The owner comprehension checks at 10/20/35/45/55 seconds have not been run.
- The DIY, Groupon, screen-company and marketing-agency threat tests have not been run.
- No system is at its target. Route in particular is well short.

## Next Stop comparison — resolved on cloud, September 8

`next-stop-comparison-v3.png` renders all four candidates at 1280x720/24 samples
at the same beat: handset raised, offer being read. The earlier
`next-stop-comparison-v2.png` compared the first three from 640x360 stills and
picked `island` provisionally. **That pick is superseded.** At a resolution
where the frame can actually be judged, all three original options failed the
same way, and it was not the failure the still review had identified:

- the unit stood inside or against the wash building in every one of them, so
  the offer read as a screen hung in a garage rather than as equipment Uptick
  installed on the forecourt — the exact opposite of "this network is operated";
- at that camera distance the offer surface was about 8% of frame width and
  illegible, while `placement.png` itself is well composed at 1:1;
- the just-washed vehicle sat unlit inside a bay and read as a dark mass;
- the apron was a dead tan plane: none of the authored wet patches registered;
- `island` additionally walked the customer past the unit without engaging it,
  which is not an acquisition interaction at all.

`option-forecourt` keeps `island`'s causal triangle — customer, vehicle, unit —
and fixes the shared defeat. The unit stands clear of the building's left edge
(the building spans WASH_X±8.7; the unit is at WASH_X-10.8) so its base, spine,
body, sun hood and amber fin silhouette against open ground and read as
hardware. The vehicle is out on the apron in daylight. The forecourt carries a
real wet sheet with tyre trails drying away from the bay mouth. A raking
morning sun (elev 14) gives the wet apron a specular the flat earlier lighting
had none of. The camera drifts three metres over the shot and holds the whole
named car wash at both ends: this is not the billboard push-in the user
rejected.

**Selected: `option-forecourt`.** It is the only candidate where the six things
the brief asks the frame to say are all present and legible at once. It is now
the production entry point for `external`; `acquisition_production.external` no
longer relabels a 144-frame animation as 168 frames but is authored at 168.

Selection is a direction, not a gate. What the renders do not yet prove:
the shot has only been inspected at 1280x720 and at six or eight sampled
frames, not at 24 fps and not at 1920x1080.

## Rendered-evidence fixes this comparison forced

| Defect found at 1:1 | Fix | Evidence |
| --- | --- | --- |
| Two-bone IK on the handset arm flattened and stretched the limb, because the solver fought the per-frame `matrix_basis` keys the retarget writes on the same bones | IK removed; the arm is posed inside the retarget bake via `customer(handset_at=...)` | `external-forecourt-handset-1to1.png` |
| `phone_at` rotated `Bip01 R Forearm` about local X. These bones run along X, so X is the twist axis and the hand never moved: the parameter was a silent no-op | Elbow folds about local Z; measured on the rig, -1.4 rad puts the hand at chest height with the elbow at the side (0.864 m to 1.254 m) | `scene-construction-checks.json` |
| A 14 cm unlit slab at 10 m is a few pixels of shadow, so the handset action did not register at all | The screen face is emissive, carrying the same pass surface the edit cuts to next | `external-forecourt-motion-sheet.png` |
| The vehicle greenhouse read as a black barrel: a .17 bevel on a .57 m smooth-shaded cabin | Greenhouse rebuilt as a glass band between an explicit shoulder line and a body-coloured roof; bevels reduced to a fraction of each box's smallest dimension | `external-forecourt-0147.png` |
| The near bollard and the left vacuum landed between the customer and the offer | Both moved further left; neither deleted, so the apron still reads as in use | `next-stop-comparison-v3.png` |
| The renderer pinned Cycles to 2 threads, a Mac-preview setting | Threads follow the host unless `FILM_THREADS` caps them | measured 4.27 s a proxy frame on 4 cores |

## Rig repair evidence

`carwash-rigged-0100.png` exposed stretched limbs in a later cycle despite a
stronger frame-20 doorway still. Retargeting now solves local pose bases against
the desired parent pose instead of an incompletely updated hierarchy.
`customer-motion-v5-sheet.png` shows frames 0/20/40/60/80/100 without the earlier
limb explosion. This is a sparse inspection, not a 24-fps motion pass.

`next-stop-island-motion-sheet.png` then tested the encounter/stop/turn at six
points. Subsequent endpoint checks moved the customer out from behind the car
at frame zero, put the car deeper in the wash bay, and reduced paint/rim glare.
The phone action remains a required full-motion check; a valid rig is not proof
that the audience notices the decision. Do not award the sequence 9.5 from
these endpoints.

The Microsoft Rocketbox source FBX, walking take, textures, MIT license and
SHA-256 manifest are in `blender/assets/rocketbox`. Import validates required
files before use, rebuilds live materials from repository assets, removes stale
imported texture nodes, and preserves the edit’s 24-fps timebase.

## Editorial and production source

Two 12-second opening comparisons exist as `opening-owner.mp4` and
`opening-customer.mp4`. They explicitly use **held prototype frames** and are
not full proxies. The complete new 67-second Remotion composition and 15-second
teaser are now authored. New physical plates are mandatory; there is no silent
fallback to the old R&D film. The full edited movie has not yet been rendered.

The current source selects a customer-first default and leaves owner-first
available for full-cut comparison. This is provisional pending the muted owner
test and adversarial review. Audio is sparse, without VO; the first-visit motif
returns with a longer, stronger resolution on the second visit.

## Round 1 — car-wash still, frame 48

Evidence: `carwash-0048.png`, 640×360, 8 Cycles samples, Metal.
Measured build-plus-render: 145.328 seconds (`carwash-0048.json`).

The building reads as a car wash through the large fascia and open bays.
The sign is grounded, with a visible stand, and no software floats. However,
the source business carries almost the whole frame while the offer is too
small to read. The vehicle is visibly assembled from simple rounded masses.
The figure is a monochrome mannequin at a distance where the viewer can
inspect its body. The sparse surroundings flatten the scene into architectural
visualization. **Reject.**

### Required changes

1. Compose an establishing start followed by a closer readable sign stop.
2. Replace the rounded vehicle with window pillars, body separation, mirrors,
   headlamps, bumpers, and wheel detail; inspect again before using it as a hero.
3. Keep the exposed procedural figure out of this establishing frame. Customer
   continuity still needs to be demonstrated in the vehicle/threshold edit.
4. Omit distant off-camera town meshes from this source-business render.
5. Test the camera in motion; a single readable endpoint does not pass the gate.

## Screen-surface checks

The placement, pass, redemption, permission, Friday offer, and paid-return
surfaces render with the film's original fonts. The permission sequence contains
144 PNGs at 780×1688. Frame 0 offers KEEP ME POSTED; frame 100 confirms YOU'RE IN.
The action precedes acceptance. These checks validate screen content only;
readability through the physical phone's lens remains unverified.

## Remaining Gate-A evidence

| System | Evidence still required |
| --- | --- |
| External acquisition | Revised stills and camera move; readable offer subordinate to external source |
| Distance to route | On-road distance, moving car, and causal connection to Joe's |
| First arrival | Route endpoint and actual doorway crossing |
| Explicit permission | Phone sequence with synchronized physical tap |
| First/second match | Same customer, matching doorway, clearly different day and paid return |
| Network to proof | External sources grounded in the district, then reconciled illustrative totals |

No motion category, signature score, or overall film score is assigned before
the corresponding rendered evidence exists.
