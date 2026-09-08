# Claude Code cloud continuation — The Next Stop

Continue the existing film; do not restart. Work from the latest pushed
`astra/uptick-acquisition-film` branch in this repository. Read, in order:

1. `film/briefs/ACQUISITION-LATEST.md`
2. `film/briefs/MAXIMUM-PUSH.md`
3. `film/review/acquisition/GATE-A.md`
4. `film/render/ACQUISITION-STATUS.md`
5. `film/briefs/ACQUISITION-ORIGINAL.md` for the original detailed mandate.

The latest instructions override older compute and creative choices. Mac
cleanup is finished. Do not delete unrelated files or repeat that work.

## Actual state — do not inflate it

The full 67-second/1608-frame edit, physical-shot definitions, baked surface
pipeline, deterministic fixture, source-preserving permission transition,
paired Tuesday/Friday blocking, paid return, partner inserts, proof, sound edit,
15-second teaser, export/finishing scripts, and review evidence are in source.

**The film is not finished. No new creative gate has passed.** Most full
production plates have not been rendered. The source is a production candidate,
not an independently validated 9.25+ film. Do not treat a successful encode as
proof of creative quality. Original files in `public/film-rd/final` are the old
film and must never be relabeled as this one.

`Acquisition-Film` defaults to customer-first; owner-first is also available.
The two existing opening MP4s are labeled held-frame editorial comparisons,
not full proxies. New acquisition plates are mandatory; there is no fallback
to old plates in the new edit.

## Start with the cloud worker, not another strategy document

Confirm this is an Anthropic-hosted Linux VM, not Remote Control on the Mac.
Report CPU, RAM, free disk, installed Blender/Node/ffmpeg and actual GPU backend.
There is no guaranteed GPU merely because the environment is cloud hosted.
Do not purchase services or enable extra paid usage. Use existing subscription
resources. If the VM is inadequate, complete the inexpensive work and report
the measured bottleneck; do not silently run a huge final queue.

Use Blender 5.0.1, matching the tested renderer. If installation is needed,
install dependencies only in this cloud workspace. Use official Blender
downloads, verify their published checksum, and document the version. Install
the locked Node dependencies with `npm ci`; install ffmpeg and a Chrome/Chromium
runtime. Set `BLENDER` and `FILM_CHROME` to their cloud executable paths.

Then run:

```sh
node scripts/acquisition-fixture-check.mjs
node scripts/acquisition-validate.mjs
npx tsc --noEmit
node scripts/acquisition-bake.mjs
python3 scripts/acquisition-render-worker.py preflight
```

For each physical shot in `film/render/acquisition-shots.json`, validate scene
construction before rendering:

```sh
"$BLENDER" --background --factory-startup --python-exit-code 1 \
  --python blender/scripts/acquisition_scene_check.py -- external
```

Repeat with the other shot IDs. This check does not render and does not award
creative approval.

## Resolve the acquisition comparison before a full sequence

`blender/scripts/acquisition_options.py` contains `option-vacuum`, `option-exit`
and `option-island`. These change the customer's task/encounter location, not
just the camera. Keep the car-wash name, bays, equipment, customer and reusable
Next Stop unit in the same frame. Compare the contact sheets and fix any
remaining occlusion, wrong-facing customer or unconvincing handset action.

Render inexpensive comparison frames and short motion tests using the same
entry arguments as `acquisition.py`. Inspect actual images. The target is 9.5+,
not “better than the old one.” Carry the chosen unit into Quick Lube and Ridge
Tire. A billboard-dominated push-in is specifically rejected by the user.

The licensed Rocketbox character includes its MIT license and checksum
manifest. Live materials use repository assets. A later-cycle limb explosion
was repaired with parent-aware matrix-basis retargeting; still inspect walking,
stopping and handset actions across the full range. Do not move faces closer
than the asset supports.

## Render, review, revise, then finish

For actual short motion evidence on cloud, choose `CPU`, `OPTIX` or `CUDA`
according to the measured backend. Never request a missing GPU silently.

```sh
python3 scripts/acquisition-render-worker.py stills --lane proxy --device CPU
python3 scripts/acquisition-render-worker.py prototypes --lane proxy --device CPU \
  --shots external route first permission second paid network-lube network-tire network
```

Update the six-system scoreboard. Gate approvals are JSON files under
`film/review/acquisition`, containing `status: "PASS"`, the exact current
`sourceHash`, and a nonempty list of repository-relative `evidence` paths.
Get the hash from preflight or the source-hash helper. **Do not create PASS
files to bypass review.** They must reflect inspected evidence and the user's
quality standard. Source changes invalidate approvals conservatively.

Once Gate A is actually approved, write `gate-a-approval.json`, then:

```sh
python3 scripts/acquisition-render-worker.py plates --lane proxy --device CPU
node scripts/acquisition-export.mjs proxy
```

Watch both full proxy openings, muted and with sound. Run the mandatory owner
comprehension checks at 10/20/35/45/55 seconds and the DIY, Groupon, screen
company and marketing agency threat tests. Use an independent critic:
“Assume this company spent $30,000 on this commercial. Find every second that
does not justify itself.” Revise the movie rather than defend sunk costs.

The physical locations are illustrative. Proof uses all five source rows in
the fixture even though the hero film depicts selected physical channels.
Never equate the few illustrated cars with all 18 visits. Preserve 18
source-specific first redemptions, 14 explicit permissions and 5 paid Friday
returns. Keep the illustrative-data disclaimer readable.

After Gate B is earned, write `gate-b-approval.json` with the chosen
`opening: "customer"` or `"owner"`. Benchmark and inspect native 1920×1080
representative frames before any final queue:

```sh
python3 scripts/acquisition-render-worker.py stills --lane final --device CPU
```

Inspect every new asset family at 1:1. Once approved, record
`final-frame-approval.json`. Only then:

```sh
python3 scripts/acquisition-render-worker.py plates --lane final --device CPU
node scripts/acquisition-export.mjs final
```

Use the detected GPU backend instead of CPU when available. If CPU final
rendering is impractical, report measured time and required resources; do not
claim completion. The queue encodes each verified plate, then removes only its
own transient frame directory, preserving output and manifests.

Watch the final film before selecting the poster. Three candidates are
exported, not pre-approved. With the selected candidate:

```sh
python3 scripts/acquisition-finish.py --poster external
```

Replace `external` with `return` or `network` only if that candidate wins the
actual finished-film review. Verify master, web MP4/WebM, teaser, normalized
sound, poster, contact sheets and metadata. The finishing script normalizes
audio in two passes and measures the result; visually inspect reported black
or frozen intervals rather than blindly rejecting authored holds.

Keep the source branch isolated. If Claude's GitHub integration restricts
pushes to its assigned `claude/...` branch, push there and give the exact commit
for incorporation into `astra/uptick-acquisition-film`; do not modify main or
the old R&D branch, and do not force-push. Push meaningful checkpoints. Finish
with actual artifact paths, measured validation, unresolved limitations and the
final commit. Do not claim a 9.25+ film without rendered evidence supporting it.
