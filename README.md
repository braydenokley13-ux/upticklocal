# Uptick Local

Public website for Uptick Local: a local screen and promotion network with two independent products, **Uptick Growth** (an offer distributed to screens at nearby non-competing local stores) and **Host a free screen**.

Next.js 16 · React 19 · three.js. No backend; contact paths are plain email links.

## Run

```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## How the homepage is built

- `components/home/CinematicStage.tsx` — the five opening beats. On landscape viewports ≥ 1024px they are one pinned section driven by scroll; everywhere else the same beats are baked stills with the copy set underneath.
- `lib/three/` — the architectural model. `engine.ts` renders on demand (no animation loop; the renderer sleeps when nothing changes), measures a quality tier at load, and draws one static shadow map. `world.ts` is the block, `unit.ts` the screen, `shots.ts` the camera choreography.
- `components/home/ScreenMatch.tsx` — the DOM surface the 3D screen hands over to at the end of the stage.
- The product chapters (claim, visit, follow-up, who handles what, two doors) are plain DOM on warm canvas.

## Still frames

Phones, portrait tablets and browsers without WebGL show `public/frames/*.webp`, rendered from the same scene. After changing the model, rebuild and re-bake:

```
npm run build && npm start
npm run bake            # needs Playwright with Chromium; NODE_PATH may point at a global install
```

`/?still=<hero|model|signal|screen|finale>` (or `?still=p:0.42`) renders a single composition, which the bake script and visual QA use.

## Design references

`project/` and `chats/` are the original design handoff. They predate the current product thesis and are kept for reference only; nothing at runtime depends on them.
