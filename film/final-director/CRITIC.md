# Final critic pass — From Nearby to Yours

Written against the rendered 1920×1080 master, watched at normal speed with
sound, muted, and at laptop size, plus frame-level inspection at every cut. Not
against the treatment, the edit file, or a styleframe.

The previous director's independent verdict on the CG candidate was **5/10
against the boutique-commercial bar**. That number is the thing to beat, and it
is the reason the CG lane is not in this film.

---

## The twenty questions

| # | Question | Verdict |
|---|---|---|
| 1 | Is Uptick understandable by 10 seconds? | **Yes.** By 0:07 the owner has seen his own station, the sentence "Uptick operates a network around your station", and three named local businesses with their distances. By 0:10 he has seen it reach a driver at one of them. |
| 2 | Is the network obvious early? | **Yes,** and it is the second beat, not the last third. Three businesses at 0.7, 1.2 and 1.5 mi, under one heading, at 0:03. |
| 3 | Does the customer feel like one person? | **Yes.** One navy overshirt, one build, one head of hair, in every shot he appears in. His face is deliberately withheld until the Friday counter, so no earlier frame can contradict the reveal. |
| 4 | Does Joe's feel like one location? | **Yes.** Exterior, doorway, interior and counter all descend from one generated storefront lineage: off-white brick, dark charcoal entrance surround, burgundy script sign, the round Joe's decal on the glass, the same warm ceiling practicals and the same wood counter. |
| 5 | Is the route believable? | **Yes.** Wet tire leaving the wash, then the same navy estate taking a real corner past brick shopfronts and gutter leaves. Two shots, 5.6 seconds, and it reads as a short local trip rather than a car commercial. |
| 6 | Does the first visit land physically? | **Yes.** Five uninterrupted seconds of a man walking through a door, with the copy held back 34 frames so the action lands before any type does. |
| 7 | Is permission clear without becoming SaaS? | **Yes.** One phone, one press, one acceptance, 3.75 seconds. Offer → `KEEP ME POSTED` → `YOU'RE IN.` → "Joe can reach him again." No taps, no cursor, no product tour. |
| 8 | Is the return unmistakably the same customer? | **Yes,** and it is the same doorway, shot the same way, which is what makes the behavioural difference legible: he is deeper into the store by frame 16 of the return than by frame 32 of the first visit. |
| 9 | Does the checkout prove a paid return? | **Yes.** Card at the terminal, then the two of them, then the bag and the cup, with `PAID · $4.99` on screen. It is a transaction, not another phone. |
| 10 | Is the ending too long? | **No.** Proof, neighbourhood and close together are 8.7 seconds of 52. The proof is the four events of the journey just watched, with their own timestamps. No KPI card, no aggregate, no percentage. |
| 11 | Does anything look obviously AI-generated? | **Nothing disqualifying survives.** The material that did — the CG lane, a car that changed model, a garment that lost its colour — was cut. See "What was cut and why". |
| 12 | Does any Higgsfield shot morph? | **Not inside the cut.** The one clip that morphs is the return, and it is trimmed to end 20 frames before its garment fails. |
| 13 | Does the vehicle change? | **No.** One dark navy estate with silver multi-spoke alloys. The low tire framing at the wash and the wide corner never contradict each other, and the take where the car became a crossover was rejected. |
| 14 | Does Joe's change? | **No.** |
| 15 | Does clothing change? | **No** — after the return trim. This was the last real defect in the film and it took a second render to remove. |
| 16 | Does the cashier change? | **She appears in one photograph,** framed three ways, so there is nothing to drift. |
| 17 | Does any hand interaction break? | **No.** The card, the terminal, the cup and the bag are all one photograph with anatomically correct hands. No video model was asked to animate several simultaneous hand interactions — the coverage does that job instead. |
| 18 | Does the film feel premium? | **Mostly.** Real brick, wet concrete, autumn leaves, skin, fabric and glass, one restrained type system, one grain, no music-video cutting. The honest caveat is in "Where it is still short". |
| 19 | Is the business story clear? | **Yes.** Somewhere else → Uptick → Joe's → permission → return. The word "QR" never appears; no code is ever scanned on screen. |
| 20 | Would a station owner see himself? | **Yes.** The film opens on his building, not on a diagram. |

---

## Score

**8.4 / 10** against the boutique-commercial bar. A subjective director
assessment of the delivered master.

Up from the 5/10 the CG candidate earned, and the whole of that gain is
photographic: skin, fabric, vehicles, glass, brick and human motion are now
plausible where they previously were not. It is not a 9.5, and the reasons are
below rather than hidden.

---

## Where it is still short

1. **Fifteen of the fifty-two seconds are true motion.** The rest is nine
   photographs moved inside their own pixels and three drawn phone screens. The
   moves are real, they are cut at native resolution and never magnified past
   1.44×, and the film does not read as a slideshow — but a director with a
   crew would have covered these beats with a camera, and a very close viewer
   will feel the difference in the counter sequence.
2. **The network is named three times and pictured once.** Only the car wash
   exists as a photograph. It is honest — the truth audit says so plainly — but
   a film with three real forecourts would sell "infrastructure" harder than
   type on one of them can.
3. **The customer never speaks or is seen deciding.** The offer arrives on a
   phone in an empty frame; we cut to him walking. A shot of him reading it, in
   his own hand, is the single most valuable clip this film does not have.
4. **The proof panel is the one moment that looks like software.** It is
   restrained and it is the journey rather than a KPI card, but it is still
   four rows of type where the rest of the film is photographs.
5. **The generated exteriors are beautiful and slightly too clean.** Joe's is a
   little more handsome than most real stations. That flatters the prospect,
   which is defensible in a commercial, but it is a small tax on credibility.

None of these is a defect I can remove with the material and tools available
this session. Each is a shot, and every shot requires a generation.

---

## What was cut and why

| Cut | Reason |
|---|---|
| The entire Blender lane — 13 plates, ~14.9 CPU-hours of queued render | Grey boxes on an empty horizon, a faceless mannequin customer, a red concept coupe where the hero's navy estate should be, and night dioramas. Against real brick and autumn light it would have exposed every frame it touched. Not rendered: rendering it would have been rendering obsolete shots. |
| `route-depart-v1` | The car waits before moving, and resolves into a rounder crossover in the closing frames. |
| `route-turn-rejected-car-v1` | The navy estate came back as a modern crossover SUV. Rejecting it is what forced the explicit vehicle-continuity correction that saved the route. |
| `doorway-return-v1`, frames 34–120 | The navy overshirt desaturates to grey and then to white. 87 of 121 frames discarded; the 34 that survive are the best return in the film. |
| `store-exterior-frontal-v1` | A flat frontal elevation. Kept as the parent of the shot that replaced it. |
| The 18 / 14 / 5 aggregate | Three depicted sources cannot sum to five-source totals. Absent from the picture, retained in the fixture. |
| Detached KPI cards | Replaced by the four events of the journey the viewer actually watched. |

---

## Five defects found on the rendered files and fixed

1. **The master was tagged full-range with BT.470BG (625-line PAL) coefficients.**
   Remotion renders from JPEG frames, so ffmpeg described an HD deliverable with
   PAL luma coefficients and full-range levels. A player honouring the tag would
   use the wrong matrix; one ignoring it would crush the blacks. Corrected by an
   honest range and matrix conversion, then tagged BT.709. Now a delivery check.
2. **The return shot ended one frame into its own failure.** At source frame 38
   a faint grey wash has already reached the shoulders, and that frame sat
   directly on the cut. Only visible on the rendered master, not in the source
   review. The trim was pulled back to frame 33 and the five frames went to the
   card tap.
3. **The film was effectively silent, and the mix was 20 dB out of balance.**
   The delivered master measured a mean of −44.2 dBFS with peaks at −23.4: it
   would have played roughly 25 dB under anything else on the viewer's machine.
   The cause was upstream — the synthesised stems sit at very different levels
   (`cafe-interior` at −47.7 dBFS mean, `director-carwash` at −26.2), and the
   hand-chosen cue gains had been applied on top of that spread, leaving the
   car wash bed about 22 dB louder than the store interior. Every gain was
   re-derived from its own stem's measured level against a target for its role,
   and the master is now normalised to −16 LUFS with a −1.5 dBTP ceiling. Both
   the per-cue peak headroom and the delivered loudness are now checks.

4. **The web cut re-encoded audio it should have copied**, a second lossy pass
   that pushed the true peak from −1.22 to −0.52 dBTP for no benefit. It now
   copies the master's stream.
5. **The teaser came out 2.7 dB louder than the film**, because loudnorm's gated
   integration is not exact over fifteen seconds. Corrected to −16.03 LUFS with
   a flat trim and a limiter, video copied so the picture paid nothing for it.

All five were caught by measuring and watching the delivered files rather than
the timeline that produced them, which is the argument for rendering before
declaring a lock. The last three would have survived any amount of looking at
contact sheets.
