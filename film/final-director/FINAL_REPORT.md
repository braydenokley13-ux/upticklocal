# From Nearby to Yours — final production report

**Status: DELIVERED.** 52.00 seconds, 1,248 frames, 1920×1080, 24 fps, stereo.
Master, web cut, WebM, 15-second teaser, poster, contact sheets and validation
are in `public/film-rd/final/` and `film/review/final/`.

This run took the film from an unlocked director candidate to a delivered set.
There is no handoff at the end of it.

---

## 1. Where the work was found

Six branches carried film work. The head of `astra/uptick-growth-final-director`
(`e4e0165`, "higgsfield stuff") was the newest coherent state and descends from
`claude/fervent-noether-88le2o` (`1531fd0`). Everything here is built on it.

The commit that mattered was the last one: it carried eleven Higgsfield
generations — five clips and six stills — that nothing in the repository yet
cut together. `photo-edit.json` still pointed at two files that were never
generated (`route-turn-start-v1.png`, `route-arrive-start-v1.png`) and did not
reference the newer motion at all, and its CG fallbacks point into
`public/film-rd/director/plates/review/`, which `.gitignore` excludes and which
does not exist in a fresh clone. The previous run's own composition would have
rendered mostly "PHOTO NOT SUPPLIED · NO USABLE MEDIA" placards.

So the media was recovered, judged, and re-cut.

## 2. What was available to work with

| | |
|---|---|
| Higgsfield MCP server | **Failed to connect for the entire session** (404 `CLIENT_HTTP_NOT_IMPLEMENTED` from the session's MCP gateway). Credit balance could not be read; **no generation was made and no credit was spent.** |
| Blender | Not installed. Recovered as the `bpy` 5.0.1 Python module — the exact version the previous run's gait test specifies. It was never needed; see §4. |
| ffmpeg / ffprobe | Not installed. Recovered: ffmpeg 7.0.2 (libx264, libvpx-vp9, aac, opus) and ffprobe. |
| Node / Remotion | `node_modules` empty; installed. Chromium headless shell was already present, so no browser download. |
| Hardware | 4 CPU cores, ~15 GB RAM, no usable GPU. |

## 3. The creative decision that shaped everything

**The CG lane was cut in full.** Looking at the previous run's own camera tests
settled it: the car wash, quick lube and tire shop are flat grey boxes on an
empty horizon with floating text; the customer is a faceless mannequin; the
acquisition shot contains a **red concept coupe** where the hero's navy estate
belongs; the station and neighbourhood are night dioramas; the coffee and
checkout are a plastic cup on a blank tan plane.

Cutting any of that against a real brick corner with autumn leaves in the gutter
would have exposed every frame it touched. The previous director scored that
lane 5/10 and pivoted away from it for exactly this reason; this run finished
the pivot instead of hedging it.

The consequence for engineering is in §4. The consequence for the film is that
every picture in it is photographic.

## 4. The render queue that was correctly not run

The preserved production engineering — naive 64.3 CPU-hours reduced to ~14.9 by
still decomposition and motion-validated 16 spp, deterministic sharding, ~1.9 h
expected wall clock across eight workers, `render-worker-bootstrap.sh` — all
described **plates for shots this film does not contain.**

Section 21 of the brief is explicit that obsolete shots must not be rendered.
Recalculated after creative lock, the Blender queue for the delivered film is
**0 plates, 0 CPU-hours, 0 workers.** The scripts, caches, determinism fixes and
bootstrap are untouched in the repository and would still work if a CG shot were
ever put back in the cut. See `RENDER_MANIFEST.json`.

The film renders in one Remotion pass on this container. No fleet, no sharding,
no bootstrap, no Mac.

## 5. The cut

52.00 s exactly, eighteen shots.

| # | Shot | In | Frames | Source |
|---|---|---|---|---|
| 1 | `station` | 0:00.0 | 72 | `store-opening-v2.mp4` — establishing dolly on Joe's |
| 2 | `network` | 0:03.0 | 96 | car wash still — three named businesses, real fixture distances |
| 3 | `encounter` | 0:07.0 | 66 | car wash still, tighter |
| 4 | `invitation` | 0:09.75 | 78 | Remotion phone — `YOUR NEXT STOP IS ON US.` |
| 5 | `depart` | 0:13.0 | 61 | `route-depart-tracking-v2.mp4` — wet tire, moving from frame one |
| 6 | `turn` | 0:15.5 | 73 | `route-turn-v2.mp4` — the estate takes a real corner |
| 7 | `arrive` | 0:18.6 | 48 | Joe's still, tight on the doorway |
| 8 | `first` | 0:20.6 | 120 | `doorway-first-v1.mp4` — five seconds of a man walking in |
| 9 | `coffee` | 0:25.6 | 48 | the free coffee on the counter |
| 10 | `permission` | 0:27.6 | 90 | Remotion phone — `KEEP ME POSTED` → `YOU'RE IN.` |
| 11 | `offer` | 0:31.3 | 72 | Remotion phone — `$4.99`, Friday 6–10 AM |
| 12 | `return` | 0:34.3 | 34 | `doorway-return-v1.mp4`, frames 0–33 |
| 13 | `paid-tap` | 0:35.75 | 62 | card at the terminal |
| 14 | `paid-face` | 0:38.3 | 72 | the two of them — "And she knew him." |
| 15 | `paid-goods` | 0:41.3 | 48 | the bag and the cup — `PAID · $4.99` |
| 16 | `proof` | 0:43.3 | 84 | the four events of this journey, with their own timestamps |
| 17 | `hood` | 0:46.8 | 48 | the neighbourhood street |
| 18 | `close` | 0:48.8 | 76 | UPTICK GROWTH |

Fifteen seconds are true photographic motion. Nine photographs are moved inside
their own pixels — crops animated in source space at native resolution, never
magnified past 1.44×, enforced by preflight. Three phone screens are drawn in
Remotion so the product copy is spelled correctly and timed to the frame; no
image or video model was trusted with it.

**One photograph became three shots twice over.** The checkout still is cut into
the card tap, the two faces and the goods — which is what section 16 asked for,
and it avoids putting a video model through several simultaneous hand
interactions. The car wash still is framed three ways as coverage of one
location.

## 6. Continuity

- **One customer.** Navy overshirt, dark trousers, short dark hair, one build,
  in every shot he appears in. His face is withheld through both doorway entries
  and revealed only at the Friday counter, so nothing earlier can contradict it.
- **One vehicle.** A dark navy early-2000s estate with silver multi-spoke
  alloys. The take where it became a crossover was rejected; the corrected
  reference is what made the route usable.
- **One Joe's.** Exterior, doorway, interior and counter descend from one
  storefront lineage — off-white brick, dark charcoal entrance surround,
  burgundy script sign, the round decal on the glass, the same warm practicals.
- **The return reads as a return.** Same doorway, same camera grammar, and he is
  deeper into the store by frame 16 of the return than by frame 32 of the first
  visit. That difference is the shot's whole job.

## 7. What was rejected

`route-depart-v1` (slow start, and the car becomes a crossover);
`route-turn-rejected-car-v1` (the estate came back an SUV);
`doorway-return-v1` frames 34–120 (the overshirt desaturates to white — 87 of
121 frames discarded); `store-exterior-frontal-v1` (flat frontal elevation, kept
as the parent of its replacement); the whole Blender lane; the 18/14/5 aggregate;
detached KPI cards. Full detail in `HIGGSFIELD_MANIFEST.json` and `CRITIC.md`.

## 8. Defects found on the rendered files and fixed

All five were found by measuring and watching the delivered files, not the
timeline that produced them.

1. **Wrong colour description.** Remotion renders from JPEG frames, so ffmpeg
   handed back an HD master tagged full-range with BT.470BG — 625-line PAL luma
   coefficients. Corrected by an honest range and matrix conversion (full→limited,
   BT.601→BT.709) and re-tagged. Now a delivery check, not a one-off fix.
2. **The return ended one frame into its own failure.** At source frame 38 a
   faint grey wash has already reached the shoulders, and that frame sat directly
   on the cut. Invisible in source review, visible on the master. Trim pulled
   back to frame 33; the five frames went to the card tap; re-rendered.
3. **The web cut re-encoded audio it should have copied.** A second lossy pass
   over the master's already-normalised AAC bought nothing and pushed the true
   peak from −1.22 to −0.52 dBTP. The web mp4 now copies the master's audio
   stream, so the two files are bit-identical in sound.
4. **The teaser came out 2.7 dB louder than the film.** loudnorm's gated
   integration is not exact over fifteen seconds. Caught by measuring the
   delivered file rather than trusting the filter, and corrected to −16.03 LUFS
   with a flat trim and a limiter, video copied.
5. **The film was effectively silent and the mix was 20 dB out of balance.** The
   master measured −44.2 dBFS mean. The synthesised stems span 21 dB
   (`cafe-interior` −47.7, `director-carwash` −26.2) and the cue gains had been
   chosen on top of that spread, so the car wash bed ran about 22 dB above the
   store interior. Every gain was re-derived from its stem's measured level
   against a target for its role, and the master is normalised to −16 LUFS with
   a −1.5 dBTP ceiling. Per-cue peak headroom and delivered loudness are now
   both checks. Only the sound edit changed, so the audio was re-rendered alone
   and remuxed onto the existing picture.

## 9. Truth

Every business name, distance, event timestamp and price on screen is read from
`film/data/acquisition.json` at render time, and `scripts/final-preflight.py`
fails the build if any of them drift — including the free-first-visit /
paid-return asymmetry, which is the ending's whole argument.

No aggregate appears anywhere in the film. The proof is the four events of the
one journey the viewer has just watched. No percentage, forecast, currency total
or guarantee is claimed. The qualification "Illustrative customer journey.
Outcomes are not guaranteed." is on screen for all 1,248 frames.

One honest gap is recorded rather than papered over: `coffee-start-v1.png` has
**no generation record** — it arrived in commit `e4e0165` with no job id, model
or credit charge. It is checksummed; its provenance is not reconstructed.

See `TRUTH_AUDIT.md`.

## 10. Tests

- `scripts/final-preflight.py` — **211 checks, 0 failed.** Timeline contiguity
  and total, source-clip range for every video shot, crop bounds, crop aspect
  and magnification ceiling, sound cues inside their stems and inside the film,
  per-cue peak headroom measured from the stem itself, fixture agreement for
  every on-screen claim, and a check that no CG plate can re-enter the
  photographic cut.
- `scripts/final-deliver.py validate` — **38 checks, 0 failed.** ffprobe on every
  delivered file: duration, resolution, frame rate, frame count, codecs, pixel
  format, colour range, colour space, integrated loudness and true peak, plus
  sha256 for each. Written to `film/review/final/VALIDATION.json`.
- `scripts/final-deliver.py align` — re-measures each delivered file's loudness
  and trims it if the encoder or a short programme's gating missed. It caught the
  teaser 2.7 dB hot and corrected it to −16.03 LUFS, copying the video so the
  picture never paid for an audio fix.
- `npx tsc --noEmit` — clean.

## 11. Deliverables

| | |
|---|---|
| Master | `public/film-rd/final/uptick-growth-final-master-1080p.mp4` — 64.3 MB, h264 CRF 14, AAC 256k, −16.13 LUFS |
| Web | `public/film-rd/final/uptick-growth-final-web-1080p.mp4` — 25.0 MB, CRF 21, faststart, audio copied from the master |
| WebM | `public/film-rd/final/uptick-growth-final-1080p.webm` — 11.5 MB, VP9 + Opus |
| Teaser (15 s) | `public/film-rd/final/uptick-growth-final-teaser.mp4` — 12.3 MB, 15.019 s |
| Poster | `public/film-rd/final/uptick-growth-final-poster.png` / `.jpg` — 1920×1080, frame 36 |
| Contact sheets | `public/film-rd/final/contact/final-sheet1–4.png` |
| Timeline | `film/final-director/final-edit.json` |
| Composition | `film/compositions/director/FinalFilm.tsx` |
| Source manifest | `film/final-director/SOURCE_MEDIA.json` |
| Higgsfield manifest | `film/final-director/HIGGSFIELD_MANIFEST.json` |
| Render manifest | `film/final-director/RENDER_MANIFEST.json` |
| Truth audit | `film/final-director/TRUTH_AUDIT.md` |
| Critic report | `film/final-director/CRITIC.md` |
| Validation | `film/review/final/VALIDATION.json` |

The R&D film's own deliverables (`uptick-growth-master-1080p.mp4` and its
siblings) are left in place as that film's record. Everything belonging to this
cut is prefixed `uptick-growth-final-`.

## 12. What would make it better

Not defects — shots. Each needs a generation, and the Higgsfield server was
unreachable for this entire session:

1. **The customer reading the offer, in his own hand, at the wash.** The single
   most valuable clip this film does not have. It would replace the one beat
   where the phone floats in an empty frame with a person making a decision.
2. **A second and third network business as photographs.** Three names are
   spoken; one place is pictured. Real forecourts would sell "infrastructure"
   harder than type on one of them can.
3. **Checkout motion.** The counter sequence is three framings of one excellent
   photograph. It holds, and the coverage is deliberate — but a real card tap
   and a real handoff would land harder than a moved still.

Estimated cost at the rates this project's own records show: roughly 5–9 credits
for a `kling3_0` motion clip and 2 for a `nano_banana_pro` still — call it
25–35 credits for all three, plus start frames. That is the only thing standing
between this film and a 9.
