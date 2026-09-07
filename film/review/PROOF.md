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

**Rendered** `film/review/proof/redeem.mp4` — film frames 1160–1321 (6.75 s), on the **proxy
lane** (640×360/8spp), assembled about thirty-five minutes after the lane existed rather than
the seven hours the final queue would have cost. Read in motion and as fourteen stills.

## Verdict

**6.5 / 10 — REJECTED.** The cut is right and the film underneath it is right: six beats in
6.75 seconds, the forecourt, the threshold, the counter, the phone, the live state, the coffee.
Nothing is composited — every frame is a plate, the UI is emitted by a panel inside the shot,
the thumb covers the button it presses, and the staff perform no digital action anywhere. The
threshold shots are genuinely good: the customer is a dark silhouette against a blown doorway
and reads as a person because the light does the work.

It is rejected on the human system, which is the one thing the brief singled out. At the
approach the figure is a smooth grey capsule with a head-lump — the toy mannequin, not the
architectural maquette. At the counter and on the phone the hands are four rounded bulbs with
pale oval nails. At 95 mm the hand is the second-largest object in the frame and it reads as a
claw-machine prize. **`UI pasted over Blender` — no. `low-poly explainer` — yes.**

### This was checked at Gate B before any geometry was touched

A 640×360 proxy upscaled three times smears fine detail, and it would have been easy to
condemn the model for the proxy's softness. The same frame at 1280×720, 1:1, is **worse**: the
gloss on the nails survives at full resolution what the proxy's softness partly hid. The
finding is real.

## Punch list

1. `[PLATE]` `[P1]` **the fingertip nails — improved this round.** `dv_nail` was written in its
   own comment as "a sheen, not a colour" and then built with `coat 0.6` and `specular 0.5`
   over a paler brown. At this magnification that is not a sheen, it is four pale highlights
   reading as caps glued on. Now near-skin, near-matte, and smaller.
2. `[PLATE]` `[P1]` **the finger profile — improved this round.** Each finger's radius modulated
   by a tenth along its length, which reads as a smooth tube. A fifth reads as jointed, with
   the swell on the middle knuckle that rides the handset's edge — the one the lens sees.
3. `[PLATE]` `[P1]` **the hand's value — improved this round.** `dv_skin` at `#9d8272` rendered
   **brighter than the white screen it holds**, and in a macro frame the eye takes the brightest
   thing for the subject, so the shot was about a hand. Two stops down at the same hue, and the
   subsurface from 0.22 to 0.15 because the red bleed was lighting the finger edges from inside.
4. `[PLATE]` `[P1]` **the residue, and it is the real one.** Three passes each moved the frame
   and none of them fixed it. A procedural tube cannot carry a knuckle: the crease between
   phalanges, the flattening of the pad against glass, and the way real fingers touch and
   deform against each other are all geometry this builder has no way to express. The fingers
   also cannot be pulled in tighter — at `-hw - 0.011` the finger surface already clears the
   handset's edge by 0.4 mm, so the lateral bulge in frame *is* the finger's own radius. This
   is not a tuning problem and it should not be tuned at any further. It needs either a
   sculpted hand or a shot that shows less of this one.
5. `[PLATE]` `[P2]` **the approach figure.** Same cause at the other end of the lens family.
   The brief asks for shoulder structure, a tapered torso and a deliberate gait; the capsule has
   none. Note that the threshold shots solve it for free by making the figure a silhouette —
   that is the cheapest available answer and it is already in the film.
6. `[PLATE]` `[P3]` **the coffee.** The cup reads (paper, kraft sleeve, dark lid) but it arrives
   small and centre-frame under a smooth tube of an arm. The physical payoff of the whole act is
   currently the least composed shot in it.

## Keep

1. **The six beats and their lengths.** Approach, threshold, counter, device, live state, coffee
   in 6.75 seconds, with D and E one continuous shot so nothing cuts away between the action and
   its result. The edit is not the problem.
2. **The threshold pair.** A dark figure in a blown doorway, backlit. The one place in this act
   where a person reads as a person, and it does it with light rather than geometry.
3. **The live state.** `Redeemed. · 7:42:09 AM · One large coffee · Pump 3 · regular`, legible
   even at proxy resolution, with the seconds running so a screenshot of it would be obviously
   stale. One press, no interstitial, mint marking the transition rather than flooding it.

### 3 · the morning

**Rendered** `film/review/proof/morning.mp4` — film frames 1322–1499 (7.42 s), on the **proxy
lane**. Read in motion and as fourteen stills.

## Verdict

**7.5 / 10 — REJECTED, but narrowly and for one nameable reason.** The act's structure is
right and the ending is genuinely good. Four physical beats — the pump, the frontage, the door
later, the lane — with no count over the world, no score, no particle swarm and four different
cameras. The light does build: sun elevation 24° → 31° → 41° → 46°, exposure −3.0 → −2.55,
clock 8:05 → 8:26 → 9:12 → 9:40. The crossing back to the page works exactly as designed: the
morning goes over the set as light rather than as a cut, and the line the store stands on stays
behind as the rule the 21 sits on. `21 / came through the door. / 14 returned. 7 were new.` is
quiet, well set, and standing on a physical residue.

It is rejected because two of the four beats read as **archviz**, and the cause turned out to
be specific rather than atmospheric.

### The finding: a foreground that is the ground is not a foreground

The cinematography bible makes every shot declare a foreground. Reading them back:

| shot | declared foreground | reads as |
| --- | --- | --- |
| `threshold` | the two shelf runs the aisle passes between, dark, closing left and right | photographed |
| `approach` | the customer themself, a metre from the lens and far outside focus | photographed |
| `morning_pump` | the near pump's shoulder, dark, left of frame | photographed |
| `morning_walk` | *the curb, running out of frame right* | **archviz** |
| `rise` | *the lane's asphalt* | (deliberate — see below) |

A curb and a lane's asphalt are surfaces the camera looks **across**, not objects it looks
**past**. They occlude nothing and they sit on the same plane as everything else, so at f/5.6
with focus 13 m out the entire frame is one depth and it reads as a model viewer. The three
shots that work all name a real object near the lens. The film had already proved the rule and
then broke it twice.

## Punch list

1. `[PLATE]` `[P1]` **`morning_walk` — fixed this round.** A car parked along the near curb, six
   metres out, closing the right of frame. It is *sharp*, not soft, and that is correct: at
   40 mm a foreground at 6 m computes to under a pixel of circle of confusion, so a wide-lens
   foreground has to be a dark shape rather than a blur — the same lesson Act V's dusk shot
   taught when its parking-lot cars refused to go out of focus. The frame now has a near plane,
   a middle and a far.
2. `[PLATE]` `[P2]` **`rise` keeps its asphalt, deliberately.** Its motivation is *"we climb
   until only the base line and the doorway are left"* — the shot's job is to empty out so the
   page can take over, and a foreground object would fight the residue it exists to hand over.
   Recorded as a considered exception, not an oversight.
3. `[PLATE]` `[P2]` **the medium-distance figures.** Same cause as proof cut 2: at the pump and
   at the door the figures are large enough to show they are capsules. In the wides they are
   small enough to abstract and they read fine, and at the threshold they are silhouettes and
   read well. The failure band is medium distance in flat light.

## Keep

1. **The crossing back to the page.** The morning washes the set away as light, the tracked
   base line stays, and the 21 stands on it. One physical residue survives, which is exactly
   what was asked for, and it is not a fade.
2. **The light build.** 8:05 to 9:40 across four beats, carried by sun elevation and exposure
   rather than by a caption.
3. **The resolve's restraint.** A full-bleed rule, the numeral indented off it, two short lines
   and a great deal of nothing. No KPI screen anywhere near it.

## Verdict

**Two of three rejected. The physical layer is NOT frozen.**

| cut | verdict | |
| --- | --- | --- |
| 1 · the café | **9.0 — passes** | the panel is a physical object, both crossings are authored, nothing floats |
| 2 · the redemption | **6.5 — rejected** | the edit is right; the human system reads as a toy |
| 3 · the morning | **7.5 — rejected** | the ending is right; two beats read as archviz, one now fixed |

The two rejections share one root and it is not the compositor, the edit or the product design:
**every failure in both cuts is a Blender asset or a Blender camera.** Nothing in either cut is
UI pasted over a plate — the composite layer has passed everywhere it was tested. What fails is
the hand at 95 mm, the mannequin at medium distance, and a wide that names the ground as its
foreground.

Two of those three are now understood precisely enough to act on:

- **The foreground rule** is fixed in `morning_walk` and stated generally, with `rise` recorded
  as a deliberate exception. The film had already proved the rule three times before breaking
  it twice.
- **The hand** has had three passes — nails, profile, value — each of which moved the frame and
  none of which fixed it. The punch list says why further tuning is waste: a procedural tube
  cannot carry a knuckle, and the fingers cannot be drawn in tighter because at `-hw - 0.011`
  the surface already clears the handset by 0.4 mm, so the bulge in frame *is* the finger's own
  radius. It needs a sculpted hand or a shot that shows less of this one.
- **The medium-distance figure** is the same problem at a different lens. The film already
  contains its own answer: at the threshold the figure is a silhouette and reads as a person.

No final master should be cut until the redemption's close work passes. The final Cycles queue
stays paused rather than spending fifty seconds a frame on shots that have not passed a
creative gate.
