# Photographic motion comparison — creative work in progress

The user explicitly reaffirmed that Astra must solve the visual problems before handoff. No creative approval has been issued. The 52-second edit remains a candidate.

## Decisions from this round

- Reject the detailed concept coupe as the final hero car: improved geometry, wrong everyday-customer signal.
- Reject the passenger mirror concept as drawn: the reflection makes the wash appear adjacent to Joe's and confuses the 0.7-mile trip.
- Prefer tactile road fragments for the next moving test: wet wheel → passing curb → canopy. The CG implementations still fail the photographic standard; this is a treatment preference, not footage approval.
- Prefer over-shoulder store entry over a full frontal character shot. The store becomes the destination and the face no longer exposes the weak model.
- Reject the bag-on-entry variant in the photographic board: it depicts the return purchase before the return visit. No breakfast bag until after purchase.
- Compare an actual generated photographic motion plate with the corrected CG motion. Do not treat a static image or digital push-in as a passed human-motion test.

## First photographic motion test — Higgsfield

Input: `public/film-rd/director/photographic/doorway-first-start-v1.png`.

Duration: 5 seconds, 16:9. Start with one take only. Prefer native 24fps when the selected model supports it. Record the model, seed if exposed, resolution, credit charge, prompt, downloaded file checksum and any trim. No upscale before inspecting motion.

Exact motion prompt:

> A continuous over-the-shoulder tracking shot. The man takes two relaxed, purposeful steps forward through the already open entrance gap, to the left of the stationary glass door, toward the coffee counter. His shoulders shift naturally with his weight and his navy cotton jacket moves gently with his steps. The camera follows him forward a short distance at shoulder height, keeping the warm store interior visible beyond him. Ordinary natural walking pace. The shelves, doorframe, glass bar, coffee equipment and lighting remain physically consistent. Restrained live-action commercial cinematography. The shot remains behind the man throughout.

Inspect at normal speed, muted and with temporary store sound. Reject: walking through glass, gliding, head/shoulder deformation, clothing identity changes, moving shelves, opening a second nonexistent door, suddenly acquired cup/bag, unusable first or last frames, a prominent fabricated logo. Compare the candidate at the actual proposed 3-second first-visit duration, not just as a standalone 5-second clip.

## Motion diagnostic, independent of visual quality

The original take carries body translation and sway on the armature object. The previous importer discarded those while copying bone poses. Initial suspicion of duplicated root movement was disproved by inspection; do not repeat it as the finding.

The experiment preserves body sway, removes only forward travel from that object animation, drives animation phase by measured distance along the authored path, and makes the path interpolate linearly. In the three-second straight-path test, median toe movement while both sample heights were below 4cm dropped from ~0.548 m/s to ~0.134 m/s. Maximum hip displacement per frame was ~0.039m after correction. Residual sliding and appearance must be judged in motion. This is not a photorealism score.

Reproduce numerical check with Blender 5.0.1:

```sh
blender -b --factory-startup --python-exit-code 1 --python scripts/director-gait-test.py
```

The one-second CG motion comparison uses `director_tests.py`, shot `pair-follow-first`, frames 24:47 inclusive, 640×360, 8 samples, CPU, 2 threads. It is a bounded diagnostic, not a master plate.

Independent code review found that normalizing the donor object by its animated first frame removed a real 6.06-degree pitch. The latest experiment preserves the full donor object orientation and follows the actual doorway path tangent. The earlier numbers above predate these two corrections; fresh motion evidence is required. The attempted Mac sequence was aborted when frame times exceeded 60 seconds; see `aborted-motion-test.json`. It is not a complete clip.
