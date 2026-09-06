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

**Verdict on B (rejected).** 5.5/10 from the critic. The plan emerging under the number and the 3 stamping onto Joe's lot as a locator are clean, confident beats, and the stamp is worth stealing. But a 70 m straight-down opening that cranes into the street is structurally the drone establishing shot the client's list rejects; the rooftop phase is topographic rather than atmospheric, so "the street is alive" only lands in the last second; and the descent covers a huge scale change in too few frames, reading as a fly-through path rather than a controlled descent. Kept: the stamp, now in A's settle.

**Verdict on A (chosen).** 6/10 then 7/10 from the critic across two rounds, against 3/10 for the first pass. The cut is invisible: the cream lifts and the concrete is already under the number, the hairline is the curb, the dark band is the road. The camera performs the brief's journey (still frame → lift → reveal → settle) as one real move, and the printed 3 on the pavement is the film's first physical image. What the critic still saw, and what the third pass answers: the forecourt moment mid-lift exposed the CG (now an oblique path over a longer lift, with a speed blur at the crane's fastest moment, on the pass-4 world); the thin printed 3 foreshortened into a scrawl (it now takes paint weight as the camera lifts, the same glyph); the back row read as boxes (pass 4); the mark and caption needed more presence at the settle (larger, with a stamp overshoot and a paper halo).

_(A v3 result below)_

## Block status

One procedural neighbourhood in `blender/scripts/block.py`, built from constants (road half-width 4.5 m, 3.7 m sidewalks, 0.13 m curbs, six lots on the far side, a parking lot and a low row on the near side, a staggered second row behind, masses beyond the cross streets). Every shot builds it fresh, deterministically, in about half a second, then keys a camera, a lighting state and the people. Four lighting states (dawn, morning, dusk, night); Hero 1 uses dawn. What is in it after pass 4: the far row with distinct materials (brick, pale render, tan, stone, green-grey, charcoal), coursing and dirt gradients, stall risers, transoms, mullions, recessed doors, awnings, planters, bistro tables, an A-board, plaques, upper windows with reveals and sills and a deterministic scatter of lit cards, parapets, roof gravel, HVAC, vents, skylights, downpipes; Joe's with a forecourt, two pump islands (two-tone pumps with the brand stripe, hoses, boots, screens), a canopy with a painted fascia, stripe and drip edge, lit soffit panels, a store with a double door, an entrance light, a coffee station, gondolas and a cooler, a security light, bollards, wheel stops, stain patches, a price sign with lit lines; sidewalks with score lines, gutters, drains, manholes, a crosswalk, lane markings; lamps, a bench, a bike rack, a bin, trees; satin cars with solid cabins; and scale figures (capsule, neck, head) in matte amber that walk paths, pause, cross thresholds and go inside, with threshold events exported alongside per-frame 2D tracks so composited objects sit on physical things.

What it is not: it is not photoreal and is not meant to be. It is an abstract-physical world with real light. Its limits at R&D quality (960×540, 24 samples, denoised, 4 CPU cores at ~20 s a frame): softness when upscaled 2×, some denoiser smear on the figures' edges, no motion blur from the renderer (a composite speed blur stands in), and a sky that is a clean gradient with aerosol haze rather than weather.

## Known weaknesses

- The Block reads as a set, not a street, in any frame that holds still on plain geometry for long; the shots that work keep the camera moving and the frame dressed (figures, cars, awnings, the brick corner).
- Figures are legible as people at street height and as pins from above; the top-down phases of B expose this.
- Plates are rendered once per variant; every world change costs a full re-render (about an hour a plate on this machine), which is why the world was iterated on stills first and the composite carries as much as it can (grain, the warm cut, the speed blur, the printed page).
- Hero 3 and Hero 5 plates have not been re-rendered on the pass-4 world; their compositions exist but are unreviewed since the Hero 1 redirect.

## Before full-film production

- Render the surviving plates at 1920×1080 / 96 samples (roughly 8–10× the R&D time per frame); consider a GPU box, or a render farm, for the ~74 s film.
- A real sky (clouds, or an HDRI) and renderer motion blur.
- A second look-dev pass on Joe's store interior and the pumps at the mid-lift distance, where the camera is closest to geometry.
- Sound design against the sound-intent notes in `film/audio/NOTES.md`.

## Primitives reusable in `/growth` and `/growth/demo`

`GrowthPlanCard` (one plan, per-row reveal, press and fill states), `OfferSlab` / `PassSlab`, `ScreenContent` (the counter unit's states), the type voices (`Numeral`, `Line`, `Mono`, `Voice`, `Words`, `Rule`), the motion grammar in `film/motion` (the plane bezier, ramps and windows at 76 bpm), the fixture in `film/data/joes.ts`, and the homography helpers for sitting DOM on tracked surfaces. None of them import anything from the app, so they can move into shared components without dragging Remotion along.

## Recommendation

_(after the Hero 1 A v3 review)_
