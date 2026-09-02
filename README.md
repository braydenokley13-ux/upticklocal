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

`lib/content.ts` is the single source for every claim the site makes: the promise, the worked Growth example (Monthly Anchor + Uptick Drop), the three consent choices, the four ways, Uptick Suite, the proof section and the finale. Nothing on the site should state a customer, a number or a result that is not literally true; the example businesses (Joe's Market, Ridge Physical Therapy) are labelled as examples.

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
