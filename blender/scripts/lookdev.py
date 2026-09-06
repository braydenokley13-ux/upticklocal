"""A look-dev still of the Block from any camera, in any lighting state, with the Hero 1 people if dawn.

    python3 blender/scripts/lookdev.py --pos -2.5,-19.5,5.2 --target 6,10.5,2.8 --lens 29 --frame 100 --out /tmp/settle.png
    python3 blender/scripts/lookdev.py --state dusk --override lamps=1.0 --out /tmp/dusk.png

Renders in ~20 s at 960×540 on this CPU; the way to iterate on materials, light and camera before spending an hour on a plate.
"""
import argparse, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import block as B
import shots as S

ap = argparse.ArgumentParser()
ap.add_argument("--pos", default="-3,-22,10.5")
ap.add_argument("--target", default="5.5,12.5,2.5")
ap.add_argument("--lens", type=float, default=25)
ap.add_argument("--fstop", type=float, default=4.0)
ap.add_argument("--focus", type=float, default=34.0)
ap.add_argument("--frame", type=int, default=100)
ap.add_argument("--exposure", type=float, default=None)
ap.add_argument("--state", default="dawn")
ap.add_argument("--res", default="960x540")
ap.add_argument("--samples", type=int, default=24)
ap.add_argument("--out", required=True)
ap.add_argument("--override", default="", help="k=v,k=v state overrides")
a = ap.parse_args()
w, h = (int(v) for v in a.res.split("x"))
S.settings(width=w, height=h, samples=a.samples)
t0 = time.time()
W = B.build()
ov = {}
for kv in filter(None, a.override.split(",")):
    k, v = kv.split("=")
    ov[k] = float(v)
B.set_state(W, a.state, **ov)
walk, ppl = S._hero1_common(W) if a.state == "dawn" else (None, None)
if ov:
    B.set_state(W, a.state, **ov)
pos = tuple(float(v) for v in a.pos.split(","))
tgt = tuple(float(v) for v in a.target.split(","))
cam = S.camera(lens=a.lens, fstop=a.fstop, focus=a.focus)
S.key_cam(cam, 0, pos, tgt, lens=a.lens, focus=a.focus)
S.compositor(mist=0.45, mist_color=(0.74, 0.66, 0.56), mist_start=30, mist_depth=140)
if a.exposure is not None:
    bpy.context.scene.view_settings.exposure = a.exposure
sc = bpy.context.scene
sc.frame_start = 0
sc.frame_end = 200
sc.frame_set(a.frame)
sc.render.filepath = os.path.abspath(a.out)
t = time.time()
bpy.ops.render.render(write_still=True)
print(f"built+rendered {a.out} in {time.time() - t0:.1f}s (render {time.time() - t:.1f}s)")
