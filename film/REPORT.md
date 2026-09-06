# Uptick Growth · final film report

_Branch `film/uptick-growth-rd`. Nothing here touches production routes. The film, its deliverables, the source, the critics' record, and what is still weak. The R&D report this replaces is in the branch history (`git log -- film/REPORT.md`)._

## The film

**Uptick Growth** · 2148 frames at 24 fps · 89.5 s · 1920×1080 · twelve acts on one timeline (`film/compositions/Film.tsx`). No narration. One family for the film's voice (Geist), one serif for the customer's voice (Newsreader italic), mono for facts. Cream and marine as pages, ink as type, amber for people, mint for eight events.

| act | frames | s | what happens |
| --- | --- | --- | --- |
| I · The gap | 0–252 | 0–10.5 | `3` and one sentence on cream. The page is a photograph of the sidewalk in front of Joe's; the cream lifts off the concrete, the hairline is the curb, the camera cranes back across Main St; the printed 3 stays on the pavement, takes paint weight, and stands as the mark. "Same street. Same morning." |
| II–IV · Owner speaks · understands · one plan | 252–660 | 10.5–27.5 | Joe types "Friday mornings are slow" at 96 px, no input chrome. The three words become instruments: six Fridays, an honest 06:00–16:00 axis, 3 visits below it, 63 morning responders above it. The plan assembles from the instruments into one statement block: Morning Coffee Drop · 7–10 AM · $25+ fill-up, coffee on us · regular, premium, diesel · 104 relationships · first 30, $18.60. Approve, in plain ink. |
| V · Thought becomes action | 660–860 | 27.5–35.8 | One tap. The plan becomes a line under the header; the line takes Joe's frontage on the block at dusk; five windows light where Joe already has a way in; two screens arm. The ledger: 5 homes · 2 screens · 0 new accounts. |
| VI · Two ways in | 860–1242 | 35.8–51.75 | Thursday 6:48 PM: a text for someone who said yes; opened, it becomes the Offer. Friday 7:04 AM at the café two doors down: Joe's offer arrives on the counter screen, a stranger notices, scans; the screen's content lifts off the glass and becomes the same Offer. Rows, permission, Yes. The Offer folds to the head of a thread. |
| VII · The relationship is useful | 1242–1458 | 51.75–60.75 | "Does diesel count?" 900 ms of nothing. The approved plan surfaces; its fuel row lights; regular · premium · diesel leave the row and land as the answer, the row left reading `Fuel: ————`. "This week: 38 handled · 2 needed Joe", with the provenance. |
| VIII · Offer → Pass → Redeem now | 1458–1686 | 60.75–70.25 | The plane unfolds to the slab; Save my pass; the slab becomes the Pass. 7:41 at the counter: staff see it; Redeem now; one confirmation that can't be undone; the ink block travels up the pass and becomes the live redeemed state: JOE'S · 07:41:06 running · "Regular, pump 4". Mint marks the moment and nothing else. |
| IX–XI · Physical · the build · the proof | 1686–2016 | 70.25–84 | The pass goes into a pocket; the forecourt from the near curb; five customers cross the threshold as the light advances 07:42 → 09:50; 1 · 4 · 9 · 14 · 21 steps on the door, never on a counter. The page returns with the door's warmth on it: "21 came through the door." then "14 returned. 7 were new." |
| XII · Resolve | 2016–2148 | 84–89.5 | The proof leaves. Uptick Growth. "Tell Uptick what you want more of." |

"38 handled · 2 needed Joe" sits with the provenance in Act VII and never after the 21.

## Deliverables

All under `public/film-rd/final/` from one command, `scripts/film-master.sh` (steps `master web poster teaser sheet`; `SCALE=2` renders the project at 3840×2160).

| | file | what |
| --- | --- | --- |
| A | `uptick-growth-master-1080p.mp4` | the master: H.264 CRF 15 from PNG frames, 24 fps, the mix lifted once to −1 dBTP |
| B | `uptick-growth-1080p.mp4` · `uptick-growth-1080p.webm` · `uptick-growth-poster.jpg` | web H.264 (CRF 20, faststart, AAC 160k) and VP9/Opus, with the poster |
| C | `uptick-growth-loop.mp4` | the silent 10 s loop: the 3 becoming the sidewalk, cut to loop (`film/compositions/Teaser.tsx`) |
| D | `uptick-growth-poster.png` | the poster frame (Film frame 236: the settle, the painted 3 beside "JOE'S · 07:00–10:00") |
| E | `film/`, `blender/`, `scripts/`, `public/film-rd/{plates,audio,fonts}` | organised source: compositions, acts, primitives, the fixture, the Blender world and shots, the sound, the pipeline |
| F | `contact/` | the final contact sheet: one frame every two seconds, nine to a sheet |
| G | this file · `film/HANDOFF.md` · `film/review/` | the report, the website/app handoff, the critics' record |

**Resolution.** The master is 1920×1080. The Blender plates render at 1280×720 (24 samples, OIDN, motion blur) on four CPU cores at 45–50 s a frame, 684 plate frames in all; at 3840×2160 the plates would be a 3× upscale under vector typography, which is not a 4K film, so the honest master is 1080p and the project renders 4K with `SCALE=2` when the plates are re-rendered on a GPU box (`RES=2560x1440 SAMPLES=64 scripts/film-render-plates.sh`, roughly 8× this machine's time per frame).

## Gate history

Every hero shot went through a critic who had not built it (`film/review/CRITIC.md`; the punch lists are the record). The stricter scale applied from the production mandate on: 6 prototype · 7 decent startup film · 8 professional but not special · 9 the minimum for a final · 9.5+ signature.

| shot | rounds | scores | what the rounds changed |
| --- | --- | --- | --- |
| Hero 1 · the gap | 6 | 3 → 6 / 5 (A vs C) → 7 / 5.5 (A vs B) → 7 → 6 (stricter scale) → 6.5 gate, approved with conditions | B (the 70 m descent) and C (the tilting page) rejected as the drone cliché and a card flip; A kept. The cut made invisible (the cream leaves on one frame under the plate's exposure ramp); the printed 3 never shrinks, it takes paint weight and stays as the mark; the crane keeps the 3 inside the frame; the world rebuilt through six passes (below) |
| Hero 2 · owner speaks | 3 | 6 → 8 → 8.5 | The flood made honest (63 morning responders, none after 11:00) on one axis that shares the weeks line's origin; the plan assembles from the instruments instead of cutting in; row rules and the Approve underline gone; money in ink; the plan block at the instruments' origin with one leading; "mornings" becomes the plan's "Morning" |
| Hero 4 · does diesel count | 3 | 5 → 8 → 8.5 | Chat bubbles, the typing indicator and the stray timestamp gone; paper planes; the approved plan legible in real depth; the three words leave the fuel row at its own scale and land inside the answer, the row left emptied; the question yields to the answer |
| Acts V, VI, IX · the block | on plates | verified against the R&D plates, then the finals | Act V: the delivered line takes Joe's frontage and persists; Joe's lights when the line lands; the ledger at reading size. Act VI: the café screen's quad tracked so the content lifts by homography; the queue walker turns on the notice frame. Act IX: the thresholds on tracked door frames; the count steps on the tap |
| Act VIII · redemption | redesigned | — | Replaced the earlier PIN/scan grammar with one transforming object: Redeem now → Confirm — this can't be undone → the ink block travels up the pass and becomes the live state (merchant, running clock, one detail only now could produce). No mint field |
| The full cut | 1 | see below | fifteen categories, `film/review/FULLCUT.md` |

## The Block

One procedural neighbourhood (`blender/scripts/block.py`) built deterministically from constants, keyed per shot (`shots.py`), rendered with Cycles on CPU with OpenImageDenoise (`render.py`, resumable image sequences, per-frame 2D tracks exported beside every plate so the editorial layer sits on physical things: `blender/exports/<shot>.json`).

Six world passes. Pass 6, applied before the final plates: brick with world-space coursing; facades as plates with real openings, piers, sills and lintels; cornices that throw a shadow line; cast sidewalk slabs with joints, a patched slab and gullies; figures with height and yaw variety, a lean, and contact shadows from the sun; a three-box sedan; a 2.3 m price panel and the canopy name on the fascia; renderer motion blur (shutter 0.5). Four lighting states; the dusk state gives the street lamps real wattage and Joe's its lights the moment the plan lands.

Four plates in the film: `hero1a` (Act I, 156 f), `hero3a` (Act V, 144 f), `hero3b` (Act VI, 168 f), `hero5` (Act IX, 216 f). Every camera is authored: a straight-down hold that lifts on an oblique path and cranes to a street-height settle at 29 mm (I); an upper window across the street with a slow drift (V); an eye-height dolly from the street through the café door to the counter screen (VI); the forecourt from the near curb at 4.6 m, 35 mm, as the light advances (IX).

Leftovers the pass-6 world still carries: cornice overruns at two corners, the near row's back faces, level-of-detail beyond the second row, blinds, forecourt joints under the islands, the slab field's extent. None reads at the film's cameras; all are listed in `blender/scripts/block.py`.

## Typography

Geist Sans 200/300/400, Geist Mono 400/500, Newsreader italic; all SIL OFL 1.1, the files and licences committed under `public/film-rd/fonts/`. The A/B against Bricolage Grotesque and Hanken Grotesk at the film's four sizes (`film/review/typography.md`) kept Geist: the 640 px weight-200 numeral holds its bowls where the others go idiosyncratic or soft, and the film's argument wants the voice to be quiet. Weight 200 only above 96 px. The serif is the customer's voice and nothing else. Mono is for the header's facts, never for labels. Text is measured with the tracking it is set in (`film/typography/measure.ts`), so uprights and counters sit on the letters.

## Sound

Built into the edit (`film/audio/cues.ts` → `film/compositions/Sound.tsx`), every cue at a frame the picture motivates. The material is synthesised from noise and sinusoids by `film/audio/synth.py` (deterministic, no recordings, no third-party audio), rendered to `public/film-rd/audio/*.ogg`; the cue sheet with measured levels is `film/audio/CUES.md`; the intent is `film/audio/NOTES.md`.

Room tone under the page; the street at 7:12 as the cream lifts; the keystrokes at the typing's own cadence with a cleaner click on the last key; three rising ticks as the words re-set; a dry grain as the 63 land; one soft resolve as the plan lands and nothing when Approve appears; one press; a held mint pad as the signal enters the block, a wooden tap per window; the café's grinder stopping; the scan; paper unfolds; the send, then 900 ms of nothing; the row landing as the clearest small sound in the film; the redeem note alone; the same tap on every threshold, never louder; the street falling away under the 21; silence for the resolve. Under it a score in D at 76 bpm cut to the act boundaries (`music-bed`), dipping under the question and resolving at the 21. The master is lifted once to −1 dBTP (`scripts/film-peak.py`); the film is also cut to work muted.

## Pipeline

Blender owns the physical world; Remotion owns the timeline, the typography, the compositing and the final render. Nothing is screen-recorded.

```
python3 film/audio/synth.py                                  # the sound material (WAV, git-ignored) → scripts/film-audio-encode.sh → .ogg
RES=1280x720 SAMPLES=24 scripts/film-render-plates.sh hero3a hero1a hero3b hero5   # the plates and their tracks (resumable)
npm run film:dev                                             # Remotion Studio on film/index.ts
scripts/film-render.sh Hero1 Hero2 …                         # previews, stills, contact sheets per shot
scripts/film-review.py Film --every 48 --per-sheet 9         # the critic's sheets from any preview
scripts/film-master.sh                                       # master · web · poster · loop · contact sheet
```

## The full-cut review

_Filled from the critic's pass on the assembled film (`film/review/fullcut-review.md`)._

«FULLCUT-TABLE»

## Remaining weaknesses

«WEAKNESSES»

## What the site takes

`film/HANDOFF.md`: the grammar the film froze, the primitives to port (`OfferSlab`, `PassSlab`, `GrowthPlanCard`, `ScreenFaceContent`, `Touch`, the type voices, the fixture), the page mapping for `/growth`, `/growth/demo` and the owner app, and what not to port. Preparation only; nothing on the site changed.
