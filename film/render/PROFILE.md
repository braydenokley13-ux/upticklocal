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
