# Uptick Growth · Film R&D report

_Branch `film/uptick-growth-rd`. Five hero-shot prototypes as quality gates for the film. Nothing here touches production routes._

## What was built

- **A film R&D lab** at `/film-rd`: the five shots on Remotion's Player with a frame-accurate transport (play/pause, scrub, frame stepping, keyboard), a 16:9 stage, and the render ledger (MP4, stills, contact sheet) per shot.
- **Five Remotion compositions** (`film/compositions/Hero1…5.tsx`), 1920×1080 at 24 fps, each independently previewable in Remotion Studio (`npm run film:dev`) and renderable (`npm run film:render`).
- **The Uptick Block in Blender** (`blender/scripts/block.py`, `shots.py`, `render.py`): one authored neighbourhood — Gym · Pharmacy · Joe's Fuel & Go · Café · Barber · Restaurant on the far side of Main St, a low near row, cross streets, masses beyond — with real interiors, counter screens, a fuel canopy and pumps, sidewalks with curbs, cars, lamps, trees, and four lighting states (dawn, morning, dusk, night). People are amber capsules that walk sidewalks, pause and cross thresholds. Four plate shots render image sequences and export per-frame 2D tracks so the Direction 1 layers sit on physical things.
- **One fixture** (`film/data/joes.ts`) feeding every shot, with the corrections built in: 21 through the door = 14 returned + 7 new; 104 relationships with overlapping signals (63 morning responders, 41 lapsed); nearby-screen acquisition Friday morning inside the 7–10 window; $0.62 × 30 = $18.60. The file throws if it ever disagrees with itself.
- **Shared primitives** (`film/primitives/`): Frame, type voices (Numeral, Line, Mono, Voice, Words, Rule), GrowthPlanCard (one plan, per-row reveal, press/fill), OfferSlab and PassSlab (message · offer · pass as one slab), ScreenContent (what a counter unit shows; also rendered to PNG as the Blender screen texture so the physical panel and the DOM object are the same picture), plate/track helpers and a homography for sitting DOM objects on tracked surfaces.
- **Pipeline scripts**: plate render/encode (resumable), preview render, stills + contact sheets, the lab manifest.

## Tools actually available

| Tool | Status |
| --- | --- |
| Blender | Not installed at start. `apt` provides Blender 4.0.2 (runs headless, but without OpenImageDenoise and without EEVEE: no GPU/EGL). The `bpy` 5.0.1 pip wheel installs and runs Cycles on CPU **with** OIDN denoising; used for everything. 4 cores, no GPU. |
| Remotion | 4.0.521 with the Player in the Next app. Chromium from Playwright's headless shell. |
| ffmpeg | Remotion's bundled ffmpeg (its `select` filter syntax is limited; seeking with `-ss` works). |
| Fonts | Geist, Geist Mono, Newsreader as OFL files from `@fontsource`, committed under `public/film-rd/fonts` with licences; Geist converted to TTF for Blender signage. |

**Blender was used**, for the Block: all four plates are Cycles renders of the procedural world. R&D plates are 960×540 / 24 samples / OIDN (≈18–25 s per frame on this CPU; 696 frames total). The compositions upscale them 2×, which is visible as softness on the block plates in these previews. The same scripts render 1920×1080 at higher samples for the finished film (`RES=1920x1080 SAMPLES=96 npm run film:plates`), roughly 8–10× the render time.

## Where the renders live

| Output | Path |
| --- | --- |
| Hero previews (MP4, h264 crf 18) | `public/film-rd/renders/Hero{1..5}.mp4` |
| Stills | `public/film-rd/renders/stills/Hero{n}-{frame}.png` |
| Contact sheets | `public/film-rd/renders/Hero{n}-contact.png` |
| Block plates (MP4) | `public/film-rd/plates/{hero1,hero3a,hero3b,hero5}.mp4` |
| Plate frame sequences | `public/film-rd/plates/seq/` (git-ignored; rebuilt by `npm run film:plates`) |
| Tracks | `blender/exports/*.json` |
| Screen textures | `blender/assets/screens/*.png` |

## Hero shots

### Hero 1 · `3` → the physical block

The first pass (a cream page fading to a high beige archviz plate with a shrinking 3) was rejected by the critic at 3/10 and by the client: a Blender test, an ordinary transition, a camera too high and safe, no human energy. Everything below is the second push.

**The world, passes 2–4.** Colour separation across the six buildings (brick café, pale render, tan, stone, green-grey, charcoal) instead of six greys; people as architect's scale figures (slim capsule, neck, head) in matte amber, lit by the morning rather than glowing; Joe's canopy as a painted fascia with a brand stripe and a drip edge instead of a blown-out light band; two-tone pumps with the stripe; a real price sign (dark panel, two lit lines); dawn a stop darker with the sun at 0.62 against a real sky fill and dust in the air for a warm horizon; the neighbours' interiors warmer; the back row with parapet caps, string courses, sills and a stagger; satin cars with dark solid cabins; and the settle camera brought down from 10.5 m to 5.2 m across the street at 29 mm, Joe's centre-left and the café alive on the right. Rejected on the way: capsule people at 6× emission (candles), a white price panel, the whole street in one beige.

**Three materially different transitions**, each on the same 4 s page and the same settle:

| Variant | The idea | Camera |
| --- | --- | --- |
| A · the page is the pavement | The page is a photograph of the sidewalk in front of Joe's, straight down, blown to paper. At the cut nothing moves: the cream lifts off and the concrete is already under the number; the hairline is the curb; the dark band under it is the road. The page layer is projected onto the ground with a homography from four tracked footprint corners, so the printed 3 stays on the pavement, foreshortening as the camera lifts, and stands up as the mark at the settle. | Hold straight down (22 f) → lift and crane back across the street (78 f) → settle and drift. |
| B · the descent | The page is a plan of the block from 70 m, paper-white; the 3 stamps onto Joe's lot; a crane-down settles into the street. | 70 m plan → descent to the settle. |
| C · the page tilts in | The page itself, as a plane, tilts into the street's ground plane over Joe's lot and dissolves; the 3 lands as a mark. | A slow push only. |

**Verdict on C (rejected).** 5/10 from the critic, and mine agrees. The tilting page is the cleanest literal "number becomes place" device of the three, and that is worth keeping as a primitive. But the street is fully visible behind the plane before the transformation finishes, so there is no reveal left to have; the camera barely moves, which fails the film's camera rule and gives the boxes and pumps nowhere to hide; and a translucent card laying into a scene reads as a card flip, which the client's list rejects. Kept: the plane-into-ground homography, now used properly in A.

_(verdicts on A and B below)_

## Block status

## Known weaknesses

## Before full-film production

## Primitives reusable in `/growth` and `/growth/demo`

## Recommendation
