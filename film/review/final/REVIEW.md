# Final review record — From Nearby to Yours

What was actually looked at before the cut was locked, and what looking at it
changed. The contact sheets in `public/film-rd/final/contact/` are the review
record for the delivered master; the poster candidates beside this file are the
record for the poster choice.

## How the film was reviewed

1. **Every source clip first, before any editing.** Six generated clips and
   seven stills, decoded to contact sheets and judged on their own — motion,
   garment stability, vehicle identity, store identity, hands.
2. **The previous run's CG camera tests, side by side.** This is what settled
   the lane decision; see below.
3. **A half-resolution proof of the complete 52-second cut**, watched with
   sound, muted, and at laptop size.
4. **The delivered 1920×1080 master**, frame-stepped at every cut and at the
   end of every video shot.

Steps 3 and 4 are not interchangeable. Three defects survived step 3 and were
only found in step 4 — and one of them could not have been found by looking at
pictures at all.

## What the source review rejected

| Material | Finding |
|---|---|
| `route-depart-v1.mp4` | The car waits before moving, and in the closing frames the wagon resolves into a rounder crossover with different rear lamps. Superseded by the v2 tracking take, which moves from frame one and holds the wheel in frame. |
| `doorway-return-v1.mp4`, frames 34–120 | A grey wash reaches the shoulders by frame 38 and the navy overshirt is fully desaturated by ~52. 87 of 121 frames discarded. |
| `route-turn-rejected-car-v1.png` | The navy estate came back as a modern crossover SUV. |
| The Blender camera tests | Flat grey boxes on an empty horizon with floating text; a faceless mannequin customer; a **red concept coupe** in the acquisition shot where the hero's navy estate belongs; night dioramas for the station and neighbourhood; a plastic cup on a blank tan plane for the coffee and checkout. Cutting any of it against real brick and autumn light would have exposed every frame it touched. The whole lane was cut. |

## What the source review confirmed

- **`doorway-first-v1.mp4`** — the strongest generation of the run. Believable
  walking rhythm, stable clothing, he crosses the open gap rather than the
  glass, and the store identity holds. Five seconds, used almost entire.
- **`doorway-return-v1.mp4`, frames 0–33** — frame-matched against the first
  visit at n=0, 16 and 32, the return is measurably more direct: he is deeper
  into the store by frame 16 than the first visit is by frame 32. That
  difference is the shot's entire job and it is there in the material.
- **`route-turn-v2.mp4`** — vehicle identity rigid across the whole take. Brick
  shopfronts, gutter leaves and cracked asphalt do more for local credibility
  than any other frame in the film.
- **`store-opening-v2.mp4`** — signage letterforms stay stable through the
  dolly, which is rare, so it can carry the opening.
- **`paid-handoff-start-v1.png`** — the most valuable single frame available and
  the film's only view of the customer's face. Cut into three shots.

## What the proof cut (step 3) changed

| Found | Change |
|---|---|
| The network list was white type over a sunlit car wash — effectively illegible. | Gave the list its own right-side scrim, so the photograph could stay bright instead of being dimmed into mud. |
| "Uptick runs the places they already pass through." wrapped to three ragged lines. | Rewrote to "Uptick operates a network around your station." — the product thesis, two lines — and widened the copy column. |
| Four consecutive dark, type-led beats from 0:03 to 0:34. | Reduced the dim on `network` (0.46 → 0.18) and `invitation` (0.52 → 0.24), and gave the Thursday field a warm practical glow instead of near-black. The earlier opening test failed for being too dark; that mistake was not worth repeating on the beat that has to land in six seconds. |
| `arrive` was a near-repeat of the opening establishing shot. | Re-cropped tight onto the doorway, so the arrival reads as arriving rather than as the same picture twice. |
| The phone was a slab with a third of it empty. | Shortened it, and closed each screen with something true: the network path on the invitation, the destination and distance on the Friday offer. |
| `proof` and `close` had blurred Joe's into a grey smear. | Pulled the dim and blur back so the store is present behind the words. |
| "And she knew him." sat unreadable over a lit face. | Strengthened the bottom scrim and the type's shadow. |

## What the delivered master (step 4) changed

1. **The master's colour description was wrong.** Remotion renders from JPEG
   frames, so ffmpeg handed back an HD deliverable tagged full-range with
   BT.470BG — 625-line PAL luma coefficients. A player honouring the tag would
   use the wrong matrix; one ignoring it would crush the blacks. Fixed by an
   honest range and matrix conversion (full→limited, BT.601→BT.709) and
   re-tagging, and turned into a standing delivery check.
2. **The return ended one frame into its own failure.** The trim had been set to
   source frame 38 on the strength of the source review, but at 38 a faint grey
   wash has already reached the shoulders — and that frame sat directly on the
   cut, where the eye lands. Pulled back to frame 33, which is verifiably clean;
   the five frames went to the card tap. Re-rendered.
3. **The sound was inaudible and unbalanced.** The master measured −44.2 dBFS
   mean, −23.4 peak. Measuring the stems explained it: they were synthesised
   across a 21 dB spread (`cafe-interior` −47.7, `director-carwash` −26.2), and
   the cue gains had been chosen by eye on top of that, so the car wash bed sat
   about 22 dB above the store interior. Each gain was recomputed from its own
   stem's measured level — beds to a common target, music under them, one-shots
   set by peak rather than mean — and the master normalised to −16 LUFS / −1.5
   dBTP. Because only the sound edit changed, the audio was re-rendered on its
   own and remuxed onto the existing picture rather than costing a second video
   render.

The third is the one that argues hardest for finishing on the delivered file:
no amount of looking at frames would ever have found it.

## Poster

Six candidates were extracted from the master, one per act, and compared:

| Candidate | Frame | Verdict |
|---|---|---|
| **a-station** | 36 | **Chosen.** The store, the sign, warm morning light, and "Your next customers are already nearby." It carries the location and the whole proposition in one frame. |
| b-network | 150 | Too dark and too text-heavy to work as a single image. |
| c-route | 404 | A beautiful photograph, but "Seven tenths of a mile." is oblique without the film around it. |
| d-first | 560 | The back of a head. |
| e-return | 838 | The same, dimmer. |
| f-counter | 958 | The warmest and most human frame in the film — and the closest call. Rejected because on its own it says nothing about Uptick, Joe's or a network; it reads as generic retail stock. |

The choice is recorded as `POSTER` in `scripts/final-deliver.py` so it can be
re-argued against the same six rather than taken on trust.

## Tests

- `scripts/final-preflight.py` — 211 checks, 0 failed.
- `scripts/final-deliver.py validate` — 38 checks, 0 failed. Every delivered
  file re-read with ffprobe, including integrated loudness and true peak;
  results and checksums in `VALIDATION.json` beside this file.
- `scripts/final-deliver.py align` — re-measures what actually came out and
  trims it if the encoder missed. It caught the teaser 2.7 dB hot.
- `npx tsc --noEmit` — clean.
