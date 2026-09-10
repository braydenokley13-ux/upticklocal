# Focused correction: Joe's on an indoor car-wash TV

Baseline: `6902d04` on `opus/uptick-growth-final`, fetched and pulled before
editing. The finished Weekly Drop version is 56 seconds, not the earlier
52-second draft. This correction preserves all 1,344 frames of timing.

## What changed

At 6.00 seconds, the customer is seated inside Main Street Car Wash. Upholstered
waiting chairs, an interior service-counter edge, and blue wash brushes behind
a viewing window establish the business. A thin-bezel landscape TV hangs on the
wall. He looks up from his phone toward it, then holds his attention there.
At 10.75 seconds, the cut moves closer to that same TV to read the offer.

The screen says, from the unchanged `weekly-drop.json` fixture:

- JOE'S FUEL & GO
- BUY $25 OF GAS
- GET A FREE COFFEE
- UPTICK WEEKLY DROP

The wall, black bezel and shadow are photographic; the advertisement is a
1600×900 Remotion surface mapped to measured TV corners. No generated lettering
is used. The foreground customer and TV are visible together for 4.75 seconds,
then the close-up holds for 2.75 seconds. There is no outdoor advertising panel,
freestanding kiosk or proprietary Uptick hardware in the acquisition sequence.

The existing network list now says indoor TVs and uses landscape display
symbols. Quick Lube and Ridge Tire remain named examples; no extra scenes were
inserted. Every shot from `depart` onward, every shot duration, the soundtrack,
the product fixture and all redemption/opt-in timing are unchanged. The scope
comparison is recorded in `indoor-tv/SCOPE_CHECK.json`.

## Copy pass requested on September 10

The follow-up copy pass stays inside the same composition and does not redesign
the commercial. The TV creative now includes a scan cue beside the wayfinding;
the receipt qualification reads `QUALIFIES · $25 GAS · UPTICK OFFER`; the SMS
body reads `FRIDAY ONLY — DON'T MISS IT.` followed by the breakfast sandwich and
free coffee; and the final detail line reads `Big excitement, small cost.` The
message is timestamped Thursday evening and the return Friday morning so the
urgency is coherent in the existing journey.

The QR mark is a deterministic Remotion graphic using the repository's existing
QR pattern component. It is a visual scan cue, while all offer typography stays
controlled in compositing. No generated asset or scene was added for this copy
pass.

## Test before integration

1. Generated one waiting-room still using the existing customer's counter
   photograph as the identity reference.
2. Rendered inexpensive 960×540 wide and close compositing tests. The offer fits
   within the TV's actual black bezel and remains legible in the close-up.
3. Generated one five-second locked-camera motion test. Reviewed source frames
   0, 24, 48, 80 and 113: the customer raises his head toward the TV; his navy
   clothing, phone and the room remain consistent. The TV corners stay fixed.
4. Rendered the 9.5-second acquisition section with its entry and exit cuts.
   Played it at 1× in the browser and inspected composited frames before and
   after the head lift and at the offer close-up. It reads as waiting → notice
   Joe's on the indoor TV → offer → departure.

Cheap test images are saved in `indoor-tv/waiting-room-test.png` and
`indoor-tv/offer-test.png`. They are review evidence, not delivery masters.
Two Higgsfield jobs used 10.75 credits in total. Parameters, job IDs, source
lineage and checksums are recorded in `INDOOR_TV_GENERATION.json` and
`HIGGSFIELD_MANIFEST.json` under `film/final-director/`.

## Delivery review

The completed 1080p master was played end-to-end at normal speed (browser
playback rate 1, duration 56.10 seconds including the audio tail), with the
indoor-TV shot inspected during playback and the 36-frame contact-sheet set
inspected across the whole film. The customer and the host-business TV are
visible together; the next close-up shows the same TV with Joe's exact offer.
The viewer is given both the physical interior and the business name, then the
film continues into the existing departure, fuel purchase and Weekly Drop story.

Poster frame 245 now shows the customer looking toward the wall-mounted TV.
All four current contact sheets were regenerated. Four obsolete sheets from the
older naming scheme were removed; the delivery script now prevents them from
surviving another rebuild.

A comparison of seven representative unchanged frames against the baseline
master scored 0.9936–0.9957 SSIM at 480×270. This is visual similarity after lossy
encoding, not a claim of byte identity. The stronger scope check compares the
actual timeline and confirms all later shots and every shot's timing are intact.

Preflight: **271 checks passed**. TypeScript and the production site build passed.
The master measured **−16.05 LUFS / −1.35 dBTP**; the teaser measured
**−16.04 LUFS / −2.15 dBTP**. **All 40 delivery checks passed** on the rebuilt master, web MP4, WebM,
teaser, posters and contact-sheet presence/cleanup. The WebM measured
−16.04 LUFS / −1.40 dBTP, and its TV close-up was inspected after encoding. WebM uses VP9 `cpu-used=4`, still at CRF 32 and 1920×1080,
for a bounded local export; the master and web MP4 encoding settings are unchanged.

## Scope limits

This is a placement and comprehension correction. The baseline's pump coverage,
counter treatment and other named network locations were not redesigned. The
historical critic score has not been relabelled as a new whole-film assessment.
`TRUTH_AUDIT.md` describes the current generated/composited imagery accurately.
