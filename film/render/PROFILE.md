# Render profile · where the seconds go, and the two lanes

_Measured 2026-09-07 on the machine this film is being cut on. Every number below is wall
clock from this box, not a quote from a benchmark table somewhere else._

## The machine

| | |
| --- | --- |
| CPU | Intel Xeon @ 2.80 GHz, **4 cores**, 1 thread/core |
| RAM | 15 GB (11 free, ~840 MB resident per Cycles process) |
| GPU | **none** — no `/dev/dri`, no `/dev/nvidia*`, no display device on the PCI bus |
| Blender | `bpy` 5.0.1, Linux |

### Device discovery is not an assumption any more

The old pipeline set `s.cycles.device = "CPU"` and never asked. It was asked:

```
compute_device_type options: []          # the enum is EMPTY
  CUDA:   []      HIPEW initialization failed: Error opening HIP dynamic library
  OPTIX:  []      CUEW initialization failed: Error opening the library
  HIP:    []      ONEAPI: []      METAL: unsupported on this platform
all devices: Intel Xeon Processor @ 2.80GHz  (CPU)
```

The `bpy` wheel has **no GPU backends compiled in**, and there is no GPU to drive if it had.
`--device auto` on this machine can only ever resolve to CPU, so CPU is now a *measured*
conclusion rather than a line of code nobody revisited.

### EEVEE was tried, and it loses here

`BLENDER_EEVEE` is registered, but it needs a GL context and the container had no `libEGL`.
Installing Mesa 25.2.8 (llvmpipe) made it render — and a **default cube at 480×270 took 65 s**.
EEVEE rasterises in software here, so its cost is dominated by llvmpipe, not by scene
complexity being cheap. On a 2 902-object scene with DOF and motion blur it is not a
credible proxy engine, let alone a final one. Cycles at proxy settings beats it by an order
of magnitude. **Verdict: EEVEE is not used in either lane.**

## Benchmark matrix

One `counter` frame — the hard case: interior, DOF, a figure, a phone and emissive glass.
Identical scene, seed, motion blur, denoiser and compositor; the whole machine, nothing else
running (the final queue was `SIGSTOP`ed for the measurement).

| engine | device | resolution | samples | s/frame | vs final | verdict |
| --- | --- | --- | ---: | ---: | ---: | --- |
| Cycles | CPU ×4 | 1280×720 | 18 | **53.1** | 1.0× | the final lane |
| Cycles | CPU ×4 | 960×540 | 12 | 23.9 | 2.2× | review tier |
| Cycles | CPU ×4 | **640×360** | **8** | **11.1** | **4.8×** | **the proxy lane** |
| Cycles | CPU ×4 | 480×270 | 6 | 8.0 | 6.7× | not worth it — see below |
| EEVEE | llvmpipe | 480×270 | — | 65 (a *cube*) | 0.8× | unusable |

In `--seq` mode the scene is built once instead of per frame, and the proxy lane measures
**7.0 s/frame** in practice rather than 11.1.

## Where the seconds actually go

Scene build is **1.4 s** and does not move with resolution. That is the floor, and it is why
480×270 buys only 1.4× over 640×360 while costing a third of the legibility: below 640×360 the
frame is no longer paying for pixels, it is paying for the build, the denoise, the compositor
and the PNG write. Going smaller than the proxy lane is not an optimisation, it is a haircut.

## The two lanes

| | LANE A · proxy | LANE B · final |
| --- | --- | --- |
| answers | camera, blocking, pacing, cuts, world crossings, composite alignment | material, light, glass, figures, atmosphere, noise |
| engine | Cycles CPU | Cycles CPU |
| resolution | 640×360 | 1280×720 |
| samples | 8 | 18 |
| s/frame | ~7 | ~50 |
| lives in | `public/film-rd/plates/proxy/` | `public/film-rd/plates/` |
| built by | `scripts/film-proxy.sh` | `scripts/film-plates.sh` |
| read by | `REMOTION_PLATE_QUALITY=proxy` | default |

### Why a proxy can be trusted with a world crossing

`export_tracks` stores every track through `world_to_camera_view`, which is **normalised**
(0–1), and `trackAt` scales it by the *composition's* 1920×1080 rather than the plate's. So a
proxy plate and a final plate produce **byte-identical composite geometry**. The homography on
a phone's glass lands on exactly the pixels it will land on in the final. Only the photograph
behind it is cheap.

This was checked rather than asserted. Rendering `approach`, `coffee` and `morning_pump`
through the proxy lane and diffing their exports against the committed ones:

```
approach      tracks identical=True   800x450 → 640x360
coffee        tracks identical=True   800x450 → 640x360
morning_pump  tracks identical=True   800x450 → 640x360
```

Only `width`/`height` moved. Those two fields are **vestigial**: nothing reads them, because
`trackAt` scales by the composition's own 1920×1080. They record which render last wrote the
file, not a space any coordinate lives in.

A shot already finished at final quality is a better proxy than any proxy, so `film-proxy.sh`
copies it into the proxy lane instead of re-rendering it. Freshness is decided by the frames:
if the final mp4 is newer than its own `seq/` directory, it is current.

## Frame-range audit

Generated from the actual cut (`SHOTS8`, `SHOTS9` and Act VI's own lengths), not from the
render script's guesses. The encoded plate is indexed from its own frame 0, so a shot's head
frames must exist; only the tail is free.

| | frames |
| --- | ---: |
| rendered by the old queue | 667 |
| actually required by the edit | 657 |
| dead tail | **10** |

The ranges were already tight. This is worth ~9 minutes, and it is not the bottleneck — it is
recorded so nobody goes looking for savings here again.

## The `.plate-cache` hazard, recorded

`blender/.plate-cache/<shot>` is keyed by shot name and **not by resolution**, so a cached
640×360 plate could in principle be restored for a 1280×720 request. It cannot happen today
because the cache is only consulted when `--range` is absent and both lanes always pass
`--range`. If the cache is ever used without a range, key it by `<shot>@<res>@<samples>`.

## Two hazards that are not about speed, recorded because both cost a run

**Do not edit a shell script while it is running.** `bash` reads a script
incrementally, by byte offset, and does not re-read what it has already
consumed. Inserting lines into `scripts/film-master.sh` while a rehearsal of it
was in flight shifted every offset after the insertion point, and the running
shell resumed mid-line: it reported `0:v:0: command not found` at a line number
that, in the file on disk, contains `fi`. Nothing was wrong with the script. The
long queues here run for hours (`film-plates.sh` is a six-hour script), so this
is a live risk every time one of them is going: change the file after it exits,
or copy it, or the run will fail in a way whose error message points at the
wrong line.

**libopus is not deterministic; the synthesiser is.** `film/audio/synth.py` is
seeded and writes byte-identical WAVs between runs, but re-encoding those WAVs
with `libopus` produces different bytes with identical decoded samples. So a
one-stem change looks like a 23-stem change in `git status`. Check before
committing — decode both versions and compare the PCM — and restore the stems
that did not actually move, or the history stops telling you which sound changed.

---

# The acquisition film · render economics

_Measured 2026-09-09 on the cloud worker, on the acquisition sources. Every
number is wall clock from that box. The old film's numbers above still stand for
the old film; these replace them for this one._

## The machine, re-verified — and a second one

`compute_device_type` enumerates **empty**, CUEW and HIPEW both fail to load,
and the only Cycles device is `Intel Xeon Processor @ 2.80GHz (CPU)`. A second,
independently provisioned `anthropic_cloud` worker was probed and reported the
same: 4 cores, 15 GiB, no `/dev/dri`, no `nvidia-smi`, Cycles CPU-only.

**There is no GPU on this account.** Metal is Apple-only and belongs to the Mac
in the earlier briefs; it is not a device this production can reach, and the Mac
is out of scope for rendering. So every number here is CPU, and the wall-clock
problem is solved by rendering fewer frames and by rendering them on more than
one machine — not by finding a faster device.

## Naive baseline, and why the first estimate was wrong

The first estimate extrapolated `external` (96.7 s a frame) across the film and
put the queue at 35.5 hours. That was wrong by a factor of 1.8: the Joe's
interiors cost 242-294 s a frame, nearly three times the exteriors. Measured per
shot, re-tracing every one of the edit's 1320 frames at the configured
1920x1080/64 lane costs **64.3 hours**. One representative shot cannot price
this film.

## True per-shot cost

| shot | frames | class | camera | s/frame 64 | s/frame 16 | fresh frames | hours | % cost |
| --- | ---: | :---: | --- | ---: | ---: | ---: | ---: | ---: |
| `permission` | 144 | B | static | 251.4 | 86.4 | 144 | 3.45 | 23.2% |
| `route` | 168 | D | moves | 90.1 | 41.2 | 168 | 1.92 | 12.9% |
| `external` | 168 | D | moves | 96.7 | 40.0 | 168 | 1.86 | 12.5% |
| `network` | 72 | D | moves | 177.3 | 68.1 | 72 | 1.36 | 9.1% |
| `approach` | 48 | C | static | 273.5 | 100.2 | 48 | 1.34 | 9.0% |
| `return-approach` | 48 | C | static | 293.5 | 95.7 | 48 | 1.28 | 8.6% |
| `first` | 48 | C | static | 261.5 | 88.2 | 48 | 1.18 | 7.9% |
| `second` | 48 | C | static | 241.8 | 86.2 | 48 | 1.15 | 7.7% |
| `network-tire` | 48 | D | moves | 108.6 | 45.1 | 48 | 0.60 | 4.0% |
| `network-lube` | 48 | D | moves | 112.2 | 44.9 | 48 | 0.60 | 4.0% |
| `paid` | 144 | A | static | 246.5 | 93.4 | 2 | 0.05 | 0.3% |
| `redeemed` | 96 | A | static | 248.7 | 86.8 | 2 | 0.05 | 0.3% |
| `pass` | 96 | A | static | 112.5 | 48.8 | 2 | 0.03 | 0.2% |
| `friday` | 144 | A | static | 132.9 | 46.9 | 2 | 0.03 | 0.2% |
| **total** | **1320** | | | | | **848** | **14.90** | |

Class A is a shot where nothing whatsoever changes; B is a static world with an
animated screen; C is a static world with a moving subject; D genuinely needs the
whole world re-traced. `s/frame 64` is the configured lane, `s/frame 16` the
validated one, and `hours` is the queue's real cost at 16 spp.

Two things fall out of the table. The four doorway and approach shots are 15% of
the film's frames and were 48% of its cost, which is why the sample floor was
worth measuring on an interior and not only on the car wash. And `permission` is
now the single largest line item: 144 frames of a world that does not move,
rendered only so a phone screen can animate.

## Static savings — 624 frames that are one photograph

`acquisition-render-worker.py decompose` walks **every** frame of every shot and
compares camera, lens, focus, light energy and position, world shading, every
object matrix and every pose bone against frame 0. Nothing is sampled.

Five shots never change: `pass`, `redeemed`, `permission`, `friday`, `paid` —
**624 of 1320 frames**. `pass` and `friday` render bit-identical first and last
frames. `redeemed` was spending 6.6 hours at the configured lane rendering the
same photograph 94 more times.

Four of them are held as a single plate. The queue does not take the
decomposition's word for it: a shot marked still renders its first and last
frame and must produce **byte-identical files** before one is looped for the
shot's duration. If they differ it renders in full and says why, so a shot that
actually moves can never be silently frozen. A decomposition measured against
different sources is ignored rather than trusted.

## Sample floor — validated in motion, not on a still

A still comparison cannot see denoiser boiling, so the ladder was run over
consecutive frames on the hardest content in the film, and on both an exterior
and an interior.

| | 64 spp | 32 spp | 24 spp | 16 spp |
| --- | ---: | ---: | ---: | ---: |
| `external` s/frame | 101.99 | 64.66 | 51.03 | 39.28 |
| error vs 64 spp | — | 0.221 | 0.303 | 0.383 |
| **error sd across frames** | — | **0.0014** | **0.0023** | **0.0019** |
| frame-to-frame change | 2.0809 | 2.0830 | 2.0867 | 2.0920 |
| `first` s/frame | 256.32 | — | 122.30 | 87.08 |
| error vs 64 spp | — | — | 0.555 | 0.647 |
| frame-to-frame change | 3.7330 | — | 3.7420 | 3.7354 |

The decisive column is the standard deviation of the error, not the error. At
16 spp the error against a 64 spp reference is a constant 0.38/255 outdoors and
0.65/255 indoors, and it varies by 0.002 across frames. A boiling denoiser
produces an error that *changes* frame to frame; this one does not. Frame-to-
frame change is 2.092 against 2.081 outdoors and 3.735 against 3.733 indoors:
the movement in the picture dominates, and the sample count adds around half a
percent to it.

Inspected at 1:1 on the wet forecourt — moving human edge, contact shadow,
glossy reflection, motion blur — and on the interior — glass, DOF, fabric, skin,
a motion-blurred hand — 16 spp and 64 spp are indistinguishable. **16 spp is the
floor, and it is 2.6x faster.** Adaptive sampling at 0.1 and OpenImageDenoise are
doing the work that samples 17 through 64 were paying for.

## Resolution stays at 1920x1080

The old film rendered 1280x720 plates under a 1080p master, and `export_tracks`
is normalised so composite geometry is identical either way — so a cheaper plate
was the obvious lever. It is not needed. At the validated sample floor the
native 1080p lane costs less than the old film's 720p lane did, so the physical
plates stay native and no resolution is given up to buy time.

## Decomposition beyond stills — measured, then declined

The four class-C shots hold a static camera and a static set with only the
customer (and, in the doorway pair, the door) moving. A background plate plus a
foreground pass would cut them further.

| | full render | if decomposed ~70% | saving | visual risk |
| --- | ---: | ---: | ---: | --- |
| the four class-C shots | 4.95 h | 1.49 h | 3.46 h serial | contact shadow, door glass, wet-ground reflection of the figure |
| the same, on 8 workers | 0.62 h | 0.19 h | **0.43 h wall clock** | as above |

**Declined.** Once sampling and sharding are applied these shots are no longer
the bottleneck, and the saving is 26 minutes of wall clock against a real risk
of a character that reads as pasted onto its own set. The brief's own rule
applies: a complex decomposition that saves little and introduces visual risk is
not worth doing.

## The one saving still on the table

`permission` renders 144 frames of a world that provably does not move, so that
a screen can animate: **3.45 h, 23% of the whole queue**. The camera, the phone
and the screen quad are all static, and the film already composites tracked
screens through `film/block/homography.ts`. Holding one plate and overlaying the
144 baked frames would take it to 0.02 h.

It is not built here because at eight workers the queue is already inside the
target, and the change touches the edit and needs its own review. It is the
first thing to do if the wall clock has to come down further.

## Sharding

Frame ranges are independently renderable: `--frames A:B` on the renderer, and
on the worker. Frame numbers stay absolute and `cycles.seed` is fixed with
`use_animated_seed` off, so shards rendered on different machines merge by
filename and produce the same image. A shard renders and defers; assembly runs
when every frame of the shot is present, and refuses to encode a short sequence.

`scripts/render-worker-bootstrap.sh` provisions a bare Linux worker: it installs
Blender 5.0.1 against its published checksum, installs the locked npm
dependencies, fetches Remotion's own browser, rebuilds the baked phone surfaces
from the compositions, prints the commit, and renders a shard. Every asset it
needs — the licensed character, its textures, the fonts, the fixture — is in the
repository. There are no absolute paths outside the checkout and no cache to
prime.

## Wall clock

| workers | wall clock | note |
| ---: | ---: | --- |
| 1 | 14.9 h | this box; too long |
| 2 | 7.5 h | |
| 4 | 3.7 h | meets "a few hours" |
| 8 | 1.9 h | |
| 8 + permission composite | 1.4 h | the saving above |

Shot-level sharding alone bounds at the longest shot, `route` at 1.92 h. The
frame-range sharding is what takes it below that.

## Storage

A 1920x1080 PNG frame measures ~1.5 MB. Peak transient storage is one shot's
frames, 168 x 1.5 MB = **0.25 GB**; the whole queue writes 848 fresh frames,
**1.24 GB**, and each shot's frames are removed once its plate is encoded and
verified. Encoded plates are a few MB each. The worker requires 12 GiB free
before it will start; this box has 27 GB.

## Summary

| | frames | hours |
| --- | ---: | ---: |
| edit length | 1320 | |
| naive, configured 1920x1080/64 lane | 1320 | 64.3 |
| after the still-plate decomposition | 848 | 38.6 |
| after the validated 16 spp floor | 848 | **14.9** |
| on 4 workers | | **3.7** |
| on 8 workers | | **1.9** |

No resolution was given up, no shot was simplified, and nothing was rendered on
anyone's own machine.
