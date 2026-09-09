# The Uptick Block — Blender

The physical world of the Uptick Growth film, built procedurally so it can be rebuilt, re-lit and re-shot from code.

## Run

```
pip install bpy==5.0.1            # Blender as a Python module (Cycles CPU + OpenImageDenoise)
python3 blender/scripts/render.py lookdev --still 0 --res 960x540 --samples 32 --out /tmp/lookdev.png
python3 blender/scripts/render.py hero1 --tracks-only          # 2D tracks → blender/exports/hero1.json
npm run film:plates                                            # every plate, resumable, then encoded to public/film-rd/plates
```

`blender/scripts/render.py --save blender/assets/block.blend` writes a .blend you can open in Blender's UI to art-direct by hand; the script is the source of truth, the .blend is a snapshot (ignored by git).

## Files

- `scripts/block.py` — the world. Street geometry (road, curbs, sidewalks), six far-side lots (Gym · Pharmacy · Joe's Fuel & Go · Café · Barber · Restaurant) with real interiors and counter screens, a low near row, cross streets, masses beyond, furniture, cars, the sky, and the lighting states (`dawn`, `morning`, `dusk`, `night`). Palette in one place (`Palette`). Materials are procedural: graphite/mineral plaster with fine bump, scored concrete, asphalt with broad tonal drift, architectural glass as a Fresnel mix (reflection + tinted transparency, no refraction noise), emissive warm cards behind upper windows, mint only on the Uptick units and plaques.
- `scripts/shots.py` — cameras (look-at keyframes with the film's plane bezier), the people system (amber capsules that walk sidewalks, pause, cross thresholds and go inside, with a subtle walking bob), tracked empties → per-frame normalised 2D coordinates, and the four plate shots: `hero1` (dawn, page → block), `hero3a` (dusk, distribute), `hero3b` (café morning, through the door to the counter screen), `hero5` (morning, threshold crossings). Each shot returns its frame count, camera, people (events), tracked names and meta timings; `export_tracks` writes `blender/exports/<shot>.json`, which the Remotion compositions import.
- `scripts/render.py` — CLI: stills, sequences (resumable), tracks only.
- `assets/screens/*.png` — what the counter units show, rendered from the Remotion `ScreenContent` primitive (`npx remotion still Screen-cafe-joes …`) so the physical panel and the DOM object are literally the same picture.
- `assets/fonts/` — Geist as TTF (converted from the OFL woff2 with fontTools) for the signage.
- `exports/*.json` — tracks. Committed: small, and the compositions depend on them.

## Conventions

X runs along the street (east positive), Y across it (north positive), Z up. Road |y| < 4.5, sidewalks to 8.2, frontage line 8.2. Sun rotation is clockwise from north (90 = east). Dawn light comes from the ESE at 7°, so the frontages take raking light and the east-end mass throws its long shadow across the roofs.

Frames are 24 fps. R&D plates are rendered at 960×540 / 24 samples / OIDN (≈18–25 s per frame on 4 CPU cores); the compositions upscale them. For the finished film, re-render with `RES=1920x1080 SAMPLES=96` — nothing else changes.

## Upgrading the world by hand

Open the saved .blend, art-direct materials/lighting, and either keep the changes in the .blend (then render with Blender's UI or `blender -b file.blend -a`) or port them back into `block.py`. The tracks pipeline only needs the named empties (`track_*`) to survive.
