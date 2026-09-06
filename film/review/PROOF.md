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

«PROOF-2»

### 3 · the morning

«PROOF-3»

## Verdict

«PROOF-VERDICT»
