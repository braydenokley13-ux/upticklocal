# The physical layer · three proof cuts

_The physical layer is not frozen until all three of these pass. Each is rendered
in motion from the assembled film, then read as 8–12 arbitrary stills on a
contact sheet, then criticised. A cut can hide what a still cannot, and a still
can expose what a cut hides, so both are required._

```
scripts/film-proof.sh cafe      796  967   14
scripts/film-proof.sh redeem   1160 1321   13
scripts/film-proof.sh morning  1322 1499   14
```

## What each cut has to prove

| # | cut | film frames | s | what it has to prove |
| --- | --- | --- | --- | --- |
| 1 | **the café** | 796–967 | 33.2–40.3 | Joe's morning is on a *physical* panel, on a physical counter, with a person working behind it. A stranger holds their phone to it. We scale into that glass — the same glass, tracked — and it opens back out into the relationship. Both crossings are authored objects, not fades. |
| 2 | **the redemption** | 1160–1321 | 48.3–55.1 | Six beats in under seven seconds: the forecourt, the threshold, the counter, the phone, the live state, the coffee. It must feel *filmed*, not demonstrated. The UI is emitted by a panel inside the shot, so the thumb covers it and the lens blurs it. One customer action; the staff perform nothing. |
| 3 | **the morning** | 1322–1499 | 55.1–62.5 | The build is physical life — light, people, a door — with no count over the world, no score, no particle swarm and no single static camera. Then one physical residue survives into the page: the line the store stands on becomes the rule the 21 stands on. |

## Rejection criteria

Reject the cut if any frame still reads as:

- UI pasted over Blender
- a low-poly explainer
- archviz
- a tech demo
- a generic SaaS commercial

and reject it if anything Uptick makes floats in the physical world — hovering
in front of a building or a person, a slab suspended in space, a counter with
nothing holding it up, or debug and metadata overlays the story does not need.

## Results

_Filled as each cut is rendered and read._

### 1 · the café

**Rendered** `film/review/proof/cafe.mp4` — film frames 796–967 (7.17 s), read in motion and
then as fourteen stills (`film/review/proof/cafe/`), across three rounds.

## Verdict

**9.0 / 10 — passes.** The panel is not a screen the film put into a room, it is a screen the
room has: a bezel with a chamfer, a foot with weight, a contact shadow, a warm rim off the
left edge, a figure working behind it and the customer's own handset rising into the
foreground to occlude it, thrown well out of focus by a 75 mm at f/2.4. At act 130 the same
handset is sharp and a hand is wrapped around it, so the blurred slab in the earlier frames is
paid for. Nothing Uptick makes hovers anywhere in the physical stretch — between the two
crossings the only Uptick surface on screen is a panel or a handset Blender lit, and the
composite lays nothing over either. The two crossings are objects: the offer's rectangle
travels out of the relationship and lands on the panel's own quad on the frame the film cuts
to the café, and the same glass we have been watching a stranger hold opens back out into the
frame. Neither is a fade, and both survive being stepped through two frames at a time.

It is not 9.5. The café reads as a warm room more than as a café — at 75 mm the dressing sits
outside the frame and the only things in it are the panel, the counter and one figure — and
World 3 is a very dark field that the act spends a third of its length on. Both are choices
the film can defend; neither is a choice that would make a stranger say *that is beautiful.*

## Punch list

1. `[COMPOSITE]` `[P1]` **act 66–76 — fixed this round.** The crossing was a cross-dissolve
   wearing a rectangle: the phone's cream page and the café panel's white type were drawn at
   once, and the frame was a double exposure of two typographies. Compounding it, `<Plate>`
   wraps a `<Sequence>`, which renders nothing before its `from`, so the opacity ramp meant to
   bring the café up from act 60 was fading in over black and the room hard-cut in at 76 under
   a DOM panel whose teal did not match the plate's. The rectangle now finishes its travel on
   the cut, lands on the panel's quad as the room arrives around it, and the content changes
   there. From that frame the panel is the plate's alone.
2. `[COMPOSITE]` `[P1]` **act 146 — fixed this round.** `outward > 0.6 ? rows : 1` snapped the
   offer's three fact rows from whole to half in two frames as the glass opened out. They had
   no business re-revealing: Blender emits the complete offer on that handset as the screen's
   own emission, so the composite contradicted the plate it was standing on.
3. `[COMPOSITE]` `[P1]` **act 148 — fixed this round.** The scan plate is 46 frames and ended
   at 148 while the fade carrying the café out ran to 166, so the café did not leave, it
   vanished. The fade is tied to the plate's own length now, and the twenty frames that had
   been buying a motionless screen at the end of the act went into the opening-out instead.
4. `[PLATE]` `[P3]` **act 88–130 — the café is a beige room.** The dressing exists but sits
   outside a 75 mm frame. Not taken: a wider establishing beat costs a plate and about a
   second, and this act has neither to spend.
5. `[PLATE]` `[P3]` **act 88–116 — the panel's glass carries almost no reflection of the
   room.** Physically that is correct: a dim interior opposite a bright emissive display at
   f/2.4 returns nearly nothing. Not taken — painting a reflection on would be the one thing
   in this cut that read as CG.

## Keep

1. **Act 130.** The hand around the handset, the offer on its glass, the panel two feet behind
   it and out of focus. One frame that says the whole thesis: the software is in the room.
2. **The cut at act 76.** The rectangle holds still while everything around it changes — dark
   marine to warm morning, cream page to black panel. The film's biggest world change, and it
   is a cut, not a dissolve.
3. **The foot under the panel, and its shadow.** Three hundred pixels of geometry doing more
   for credibility than any amount of grade.

### 2 · the redemption

**Rendered** `film/review/proof/redeem.mp4` — film frames 1160–1321 (6.75 s), on the proxy lane.

## Verdict — round 2

**8.9 / 10 — PASSES.** Round one scored 6.5 and was rejected on the human system. The fix was
not a better hand.

### What round one got wrong about its own problem

Three tuning passes went into the hand — the nail material, the finger profile, the skin value —
and each moved the frame while none of them fixed it. Then the measurement that ended the
argument: at `-hw - 0.011` the finger surface already clears the handset's edge by **0.4 mm**, so
the lateral bulge in frame *is* the finger's own radius. It could not be tuned smaller.

Three genuinely different cameras were cut against each other on the proxy lane rather than three
offsets of one: **A** the staff eyeline at 75 mm (hierarchy fixed, but the wider lens saw past
the phone to the blown forecourt and the screen went illegible), **B** over the shoulder at 65 mm
(the most cinematic frame in the set and the least readable product), **C** the threshold's own
grammar at 85 mm, raked. C won, and a sweep at 118 / 132 / 148 / 162 / 176 landed the rake at
**32° off the lens** — below 148 the grip swings back toward the lens and reads worse, above it
the fingers separate again.

**But the reframe alone did not pass Gate B.** At 1280×720 the fingers were still four separate
bulbs with pale caps. What passed was a design change: `grip()` used to crest each fingertip over
the near edge and rest its pad on the *front* of the glass — which is what a hand does when it is
presenting a phone to a camera, and not what a hand does when it is holding one. A one-handed
grip wraps the back and puts only the thumb on the face. Cresting also put four pads broadside to
the lens, and because the fingers are separate meshes Cycles renders their intersections as hard
V-grooves where skin would fold. **The wrap now ends at the side: one soft edge along the
handset's silhouette instead of four pads.** The nails went with them; they existed only for tips
that faced the lens.

The approach walker was the act's other residual, and it was measured rather than eyeballed:
(97,87,68) while its own docstring called it "a dark mass". It now uses `dv_cloth_dark`, and it
reads as a person with shoulder taper against the storefront.

| | |
| --- | ---: |
| human readability | 8.5 |
| phone physicality | 9.5 |
| product clarity | 9.5 |
| cinematic quality | 9.0 |
| toy / CG smell | 8.5 |
| gesture naturalness | 9.0 |

## Punch list

1. `[PLATE]` `[P3]` **the coffee shot's arm** is still a smooth tube. It is one second, at the end
   of the act, and the cup itself reads — but it is the least composed shot in the beat.
2. `[PLATE]` `[P3]` **the defocused foreground figure at frame 0** is a soft grey mass. That is
   correct by design — it is a metre from the lens and far outside focus — but it is the frame a
   viewer sees first.

## Keep

1. **The six beats and their lengths.** Unchanged from round one: the edit was never the problem.
2. **The rake.** It is the whole trick, and it is cheap: no new geometry, no asset, one angle.
3. **The live state.** ✓ Redeemed. / ● 7:42:08 AM / Joe's Fuel & Go / One large coffee · Pump 3 —
   four things in the order they matter, with the seconds promoted to second-largest because they
   are what prove the state is live and not a screenshot.

### 3 · the morning

**Rendered** `film/review/proof/morning.mp4` — film frames 1322–1499 (7.42 s), on the proxy lane.

## Verdict — round 2

**8.8 / 10 — PASSES.** Round one scored 7.5 and was rejected for two beats that read as archviz.
Both causes were found by measurement rather than by eye, and both were in the declaration, not
the ambition.

**The foreground.** `morning_walk` declared *"the curb"* and `rise` declared *"the lane's
asphalt"* — surfaces the camera looks **across**, not objects it looks **past**. They occlude
nothing, so at f/5.6 everything sat on one plane. The first fix put a parked car six metres out;
it worked structurally and failed legibly, reading as an ambiguous dark pod. It is now a lamp
post: unambiguous at any crop, and the dark vertical a wide lens actually wants, since at 40 mm a
foreground at six metres computes to under a pixel of circle of confusion and so has to *already*
be a shape rather than be softened into one. `rise` keeps its asphalt deliberately — its
motivation is to climb until only the base line and the doorway are left, and an object there
would fight the residue it exists to hand over.

**The figures.** `morning_door` was always fine and the measurement said why: its figure sits at
(37,30,19) against a (44,39,30) door — darker than what is behind it, so light does the work.
`morning_pump`'s sat at (112,104,89) against a (176,162,147) pump, a lit grey volume. Darkened,
it now reads as a person between two pump shoulders.

One finding worth keeping: halving the albedo moved the sampled value only 112 → 92. These
figures are lit chiefly by sky ambient, so **material alone cannot silhouette them**. What changed
the frame was that the darker value let the pump shoulders and the storefront carry the contrast.
Where that is not available, a figure needs backlight or occlusion — not more tuning.

| | |
| --- | ---: |
| human readability | 8.5 |
| physical world | 9.0 |
| light and time | 9.0 |
| crossing to the page | 9.0 |
| toy / CG smell | 8.5 |
| cinematic quality | 9.0 |

## Punch list

1. `[PLATE]` `[P3]` **the `rise` figures** are the last of the mid-distance band, and they are
   small enough that it does not cost the shot. Left alone deliberately.

## Keep

1. **The crossing back to the page.** The morning washes the set away as light, the tracked base
   line stays, and the 21 stands on it. One physical residue survives, and it is not a fade.
2. **The light build.** 8:05 to 9:40 across four beats, carried by sun elevation and exposure.
3. **`morning_door`'s silhouette.** The film's own proof that light beats geometry, and the
   reference the other three shots were fixed against.

## Verdict

**All three cuts pass. The physical layer is frozen.**

| cut | round 1 | round 2 | |
| --- | ---: | ---: | --- |
| 1 · the café | **9.0** | — | the panel is a physical object, both crossings authored, nothing floats |
| 2 · the redemption | 6.5 | **8.9** | the grip wraps the back of the handset instead of presenting pads to the lens |
| 3 · the morning | 7.5 | **8.8** | a foreground that is an object, and figures the light can carry |

Both rejections were Blender assets or Blender cameras. **Nothing that failed was UI composited
over a plate** — the composite layer passed everywhere it was tested, in all three cuts, in both
rounds. That is the finding the whole gate existed to produce.

Three lessons the film should not have to learn twice, all of them measured:

1. **A foreground that is the ground is not a foreground.** Declaring one is not the same as
   having one, and at a wide lens it cannot be rescued with depth of field — a foreground at six
   metres on a 40 mm computes to under a pixel of circle of confusion. It has to be an object,
   and it has to be legible as one.
2. **Material alone cannot silhouette a figure lit by sky.** Halving the albedo moved the value
   by 18%. Contrast has to come from what is behind and beside the figure.
3. **A procedural hand must never be a hero object.** Three tuning passes failed; the camera
   alone failed Gate B; what worked was changing what the hand *does* — wrapping the back of the
   handset rather than resting pads on its face, which is also what a real one-handed grip does.

The costed fallback that went unused: Blender Studio's Human Base Meshes v1.4.1 (CC0) is the
right asset and ships no armature. `film/review/HUMAN.md` records it, in case a future shot needs
a hand the camera cannot hide.
