# The critic

Every hero shot is reviewed by a harsh critic who has not built it, from extracted frames, before the lead decides anything. The critic's job is to say what a world-class film director would say in the room, with frame numbers, and to put every note into one of three buckets so the lead knows what it costs to act on it.

## How to run one

1. Render the preview: `scripts/film-render.sh Hero1` (or `npm run film:render -- Hero1`).
2. Extract frames and sheets: `scripts/film-review.py Hero1 30 96 106 120 130 …` or `scripts/film-review.py Hero1 --every 12`. Sheets land in `film/review/frames/Hero1/sheetN.png`, four frames each in time order.
3. Give the critic the brief below, the shot's intent in two or three sentences, the sheet paths, and the frames each sheet holds. Ask for the structure below. Do not let the critic edit files.
4. Put the result in `film/review/<shot>-punchlist.md`, act on it, and re-render.

## The brief the critic is held to

- The number must become the place. No fade, no wipe, no ordinary cross-dissolve.
- Camera: still editorial frame → controlled transformation or descent → reveal → intentional settle.
- Amber is people (abstract scale figures, never humans). Mint is rationed to eight moments in the film. No cream/navy slide alternation.
- Signage restraint. Morning light. Material richness. Nothing toy-like.
- Rejected on sight: a Blender test, a model-viewer demo, a low-poly street, a previs frame, a generic 3D motion study, a CSS card flip, a drone-shot cliché.

## The structure asked for

```
# <Shot> · punch list
## Verdict
Score /10 and one paragraph: does it pass the gate; does anything read as a rejected category.
## Punch list
N. [COMPOSITE|PLATE|PRODUCTION] [P1|P2|P3] frame(s) — problem — fix (a value, a placement, a timing in frames, a material or light change).
## Keep
Three things that must not change.
```

COMPOSITE is fixable in the Remotion layer with no re-render. PLATE needs a Blender re-render (materials, geometry, camera, lights, figures): about an hour a plate at R&D quality on this machine, so these are batched. PRODUCTION is left for the full-film build (resolution, renderer motion blur, sky, sound).

## What the critic has said so far

| Round | Shot | Score | The note that changed the work |
| --- | --- | --- | --- |
| 1 | Hero 1 (first pass) | 3/10 | A beige archviz plate with a shrinking number. Camera too high; no human energy; a Blender test. |
| 2 | Hero 1 A vs C | 6 / 5 | A's camera journey is real; C's tilt is a card flip over an already-visible street. |
| 3 | Hero 1 A vs B | 7 / 5.5 | B's 70 m plan-to-crane is the drone cliché; A's rough patch is the mid-lift CG. |
| 4 | Hero 1 A v3 | 7/10, passes | The drain on the hairline is the cleanest "number becomes place" beat; the concrete is too clean; the crane's fastest half-second drops the 3 to the frame edge; nothing in the world says "Joe's" at R&D resolution. |
