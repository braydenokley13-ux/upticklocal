"""
CLI for the Block plates.

    python3 blender/scripts/render.py lookdev --still 0 --res 960x540 --samples 32 --out /tmp/x.png
    python3 blender/scripts/render.py hero1 --seq --res 1280x720 --samples 48 --out public/film-rd/plates/seq/hero1
    python3 blender/scripts/render.py hero1 --tracks-only

Runs on the `bpy` pip module (Blender 5.0). Renders are deterministic: fixed
seed, no animated seed, fixed sample count.
"""
from __future__ import annotations

import argparse
import os
import shutil
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import block as B  # noqa: E402
import shots as S  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shot")
    ap.add_argument("--still", type=int, default=None, help="render one frame")
    ap.add_argument("--seq", action="store_true", help="render the whole sequence")
    ap.add_argument("--range", type=str, default=None, help="a:b frame range for --seq")
    ap.add_argument("--res", type=str, default="1920x1080")
    ap.add_argument("--samples", type=int, default=64)
    ap.add_argument("--out", type=str, required=False)
    ap.add_argument("--state", type=str, default=None, help="lighting state override for lookdev")
    ap.add_argument("--no-comp", action="store_true")
    ap.add_argument("--save", type=str, default=None, help="save the .blend here")
    ap.add_argument("--tracks-only", action="store_true")
    ap.add_argument("--screens", type=str, default=None, help="dir with <lot>.png screen content")
    a = ap.parse_args()

    w, h = (int(v) for v in a.res.lower().split("x"))
    # Cycles runs on four CPU cores here: a 1280x720/24spp frame of the block costs about two minutes, and
    # the film's plates are ~870 frames. PLATE_RES_CAP (default 960x540) clamps what a render chain asks
    # for down to what the machine can finish in a night. It only ever lowers a request, never raises one.
    cw, ch = (int(v) for v in os.environ.get("PLATE_RES_CAP", "960x540").lower().split("x"))
    if a.seq and w * h > cw * ch:
        print(f"plate cap: {w}x{h} -> {cw}x{ch}")
        w, h = cw, ch
    S.settings(width=w, height=h, samples=a.samples)
    screens = {}
    if a.screens:
        for lot in ("cafe", "pharmacy", "joes"):
            p = os.path.join(a.screens, f"{lot}.png")
            if os.path.exists(p):
                screens[lot] = p
    t0 = time.time()
    W = B.build(screen_images=screens)
    print(f"built in {time.time() - t0:.1f}s, {len(bpy.data.objects)} objects")
    fn = S.SHOTS[a.shot]
    shot = fn(W, a.state) if a.shot == "lookdev" and a.state else fn(W)
    if not a.no_comp:
        S.compositor(**shot.get("comp", {}))
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = max(0, shot["frames"] - 1)

    if a.save:
        os.makedirs(os.path.dirname(a.save), exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.save))

    events = shot.get("people").events if shot.get("people") else []
    if shot["frames"] > 1 or a.tracks_only:
        out = os.path.join(S.EXPORTS, f"{a.shot}.json")
        S.export_tracks(W, shot["cam"], shot["frames"], shot.get("names", []), events, shot.get("meta", {}), out)
        print("tracks →", out)
    if a.tracks_only:
        return

    if a.still is not None:
        scene.frame_set(a.still)
        scene.render.filepath = os.path.abspath(a.out or f"/tmp/{a.shot}_{a.still}.png")
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print(f"still {a.still} → {scene.render.filepath} in {time.time() - t:.1f}s")
    elif a.seq:
        outdir = os.path.abspath(a.out or f"/tmp/{a.shot}")
        os.makedirs(outdir, exist_ok=True)
        f0, f1 = 0, shot["frames"] - 1
        # A finished plate is kept in blender/.plate-cache/<shot> as hard links. A chain that asks again for
        # a shot already rendered at a resolution we accepted gets those frames back instead of paying for
        # them a second time. Clear a shot's cache directory whenever the shot itself changes.
        cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".plate-cache", a.shot)
        if os.path.isdir(cache) and not a.range:
            have = sorted(f for f in os.listdir(cache) if f.endswith(".png"))
            if len(have) >= shot["frames"]:
                linked = 0
                for f in have:
                    dst = os.path.join(outdir, f)
                    if not os.path.exists(dst):
                        try:
                            os.link(os.path.join(cache, f), dst)
                        except OSError:
                            shutil.copyfile(os.path.join(cache, f), dst)
                        linked += 1
                print(f"plate cache: {a.shot} restored from blender/.plate-cache ({linked} linked, {len(have)} frames)")
                return
        if a.range:
            f0, f1 = (int(v) for v in a.range.split(":"))
        for f in range(f0, f1 + 1):
            path = os.path.join(outdir, f"{f:04d}.png")
            if os.path.exists(path) and os.path.getsize(path) > 1000:
                continue
            scene.frame_set(f)
            scene.render.filepath = path
            t = time.time()
            bpy.ops.render.render(write_still=True)
            print(f"frame {f}/{f1} in {time.time() - t:.1f}s", flush=True)


if __name__ == "__main__":
    main()
