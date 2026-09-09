# Uptick Local

Public website for Uptick Local, a local business growth system. Free countertop screens at non-competing local businesses form a block-level network; the site explains the three ways to use it (**Host**, **Advertise**, **Growth**) and the content capability that works with any of them (**Uptick Suite**).

Next.js 16 · React 19 · three.js. No backend; contact paths are plain email links.

## Run

```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npx tsc --noEmit
```

## Routes

`/` (the story), `/network` (the architecture and rules of the block), `/host`, `/advertise`, `/growth`, `/suite`, `/partners`. Old paths redirect in `next.config.mjs`: `/how-it-works` and `/networks/*` → `/network`, `/locations` → `/host`, `/advertisers` → `/advertise`.

## Copy

`lib/content.ts` is the single source for every claim the site makes: the promise, the worked Growth example (Monthly Anchor + Uptick Drop), the three consent choices, the four ways, Uptick Suite, the proof section and the finale. Nothing on the site should state a customer, a number or a result that is not literally true; the example businesses (Joe's Market, Ridge Physical Therapy, Northside Roofing) are labelled as examples. In particular: no search-ranking promise, no invented statistic, no website build promised as a Suite deliverable, and no causal claim that the Anchor or the Drop produces a result — each is described by the job it does. Uptick Suite is delivered with JBCI, the editorial partner; `SUITE.partner` is the one place that relationship is worded, and it appears in the homepage Suite chapter, on `/suite` and in the footer.

## How the homepage is built

- `components/home/CinematicStage.tsx` — the opening beats over the live model. On landscape viewports ≥ 1024px they are one pinned section driven by scroll (`.home--desktop`); phones and portrait tablets get their own telling from baked stills (`components/home/MobileStory.tsx`, `.home--phone`). Browsers without WebGL fall back to the phone telling at any size.
- `lib/three/` — the architectural model. `engine.ts` renders on demand (no animation loop; the renderer sleeps when nothing changes), measures a quality tier at load, and draws one static shadow map. `world.ts` is the block, `unit.ts` the screen, `shots.ts` the camera choreography.
- `components/home/ScreenMatch.tsx` — the DOM surface the 3D screen hands over to at the end of the stage.
- `components/home/ModesChapter.tsx` + `BlockPlan.tsx` — one network, three ways to use it: a site-plan drawing of the same street that lights differently for Host, Advertise and Growth.
- `components/home/GrowthChapter.tsx` — the Monthly Anchor (on the screen) beside the Uptick Drop (on the phone), then claim → visit and redeem → report. `ClaimUI.tsx` holds the three separate consent choices; `OfferPass.tsx` is the redeem flow.
- `components/home/SuiteChapter.tsx` — one conversation becoming six content surfaces.
- `components/home/ProofChapter.tsx` — real photography from the counters the screens sit on (`public/photos/`). Captions state exactly what the hardware in the photo is.
- `components/home/FinaleChapter.tsx` / `MobileFinale.tsx` + `Doors.tsx` — the closing beat over the model and the four doors.

Typography is Geist and Geist Mono with one editorial accent, Newsreader italic, used for a single phrase per page.

## Still frames

Phones, portrait tablets and browsers without WebGL show `public/frames/*.webp`, rendered from the same scene. After changing the model, rebuild and re-bake:

```
npm run build && npm start
npm run bake            # needs Playwright with Chromium; NODE_PATH may point at a global install
```

`/?still=<hero|model|signal|screen|finale>` (or `?still=p:0.42`) renders a single composition, which the bake script and visual QA use. `/?q=<tier>` forces a quality tier.

## Design references

`project/` and `chats/` are the original design handoff. They predate the current product thesis and are kept for reference only; nothing at runtime depends on them. The photographs in `project/uploads/` are the source for `public/photos/`.

## Film R&D lab (branch `film/uptick-growth-rd`)

An experimental workstation for the Uptick Growth film: five hero-shot prototypes, each a Remotion composition, reviewed at `/film-rd` (private, `noindex`) with a frame-accurate transport. Nothing on the production routes imports from it.

```
npm run dev              # then open http://localhost:3000/film-rd
npm run film:dev         # Remotion Studio for the compositions
npm run film:render      # MP4 previews + stills + contact sheets + the lab's manifest → public/film-rd/renders
npm run film:tracks      # Blender → 2D tracks (blender/exports/*.json) the compositions import
npm run film:plates      # Blender plates (long; resumable) → public/film-rd/plates/*.mp4
npm run film:review -- Hero1 --every 12   # frames + 2×2 review sheets → film/review/frames/Hero1 (the critic's input)
npm run film:lookdev -- --pos -2.5,-19.5,5.2 --target 6,10.5,2.8 --lens 29 --out /tmp/still.png   # a 20 s look-dev still of the Block
```

- `film/` — the Remotion project: `data/joes.ts` is the one fixture every shot reads (21 through the door = 14 returned + 7 new; 104 relationships with overlapping signals; nearby-screen acquisition Friday morning); `primitives/` are the film-level product objects (GrowthPlan, Offer/Pass slab, ScreenContent, type); `block/` composites Blender plates and reads their tracks; `compositions/Hero1…5` are the gates; `audio/NOTES.md` is the sound intent.
- `blender/` — the Uptick Block, built procedurally with `bpy` (see `blender/README.md`).
- `film/PLAN.md` and `film/REPORT.md` — the implementation plan and the R&D report. `film/review/` holds the critic's brief and every punch list; each hero shot is critiqued from extracted frames before the lead acts.

Renders use a local Chromium: `FILM_CHROME=/path/to/chrome-headless-shell` (defaults to Playwright's in the remote environment).

## The delivered film — *The Weekly Drop*

The finished Uptick Growth commercial: 56.00 s, 1,344 frames, 1920×1080, 24 fps.
It sells one thing — Uptick puts screens in the local businesses around a
station, uses them to hand nearby drivers a reason to come in, and then keeps
that audience on the merchant's Weekly Drop, where there is always something
free.

Every picture is photographic; no Blender plate appears in the master. Every
product surface is drawn in Remotion so the copy is exact: the screen at the car
wash, the fuel receipt, and four phone states. The car wash screen is *projected*
onto a real blank sign panel in the plate with a homography, so it takes that
panel's own perspective and defocus rather than being pasted on flat.

```
python3 scripts/final-preflight.py        # 263 checks; must pass before a render
npm run film:final                        # master + teaser, then the whole delivery set
python3 scripts/final-deliver.py validate # ffprobe every delivered file
```

- `film/data/weekly-drop.json` — the product truth. Every business name,
  distance, offer, timestamp and price on screen is read from it at render time.
- `film/final-director/final-edit.json` — the locked timeline: twenty shots,
  their media, crops, the composited screen's measured quad, and the sound edit.
- `film/compositions/director/FinalFilm.tsx` — the composition (`Final-Film`)
  and the 15-second teaser (`Final-Teaser`).
- `film/final-director/FINAL_REPORT.md` — what was made, what was cut and why.
  `CRITIC.md` scores the delivered master; `TRUTH_AUDIT.md` checks every claim on
  screen and names the three moments the film shows by implication;
  `HIGGSFIELD_MANIFEST.json`, `SOURCE_MEDIA.json` and `RENDER_MANIFEST.json` are
  the provenance record.
- Deliverables are `public/film-rd/final/uptick-growth-final-*`. The R&D film's
  own outputs keep their original names beside them.

Preflight fails the build if any on-screen claim drifts from the fixture, if
either offer loses its free component, if a redemption is marked done before it
is pressed — or if anything on screen says "Friday", because the product is a
Weekly Drop and not a Friday promotion.
