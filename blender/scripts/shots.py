"""
Shots: cameras, people schedules, lighting over time, screen states, and the
2D tracks each Remotion composition needs. One function per plate.

Every shot returns a dict:
    frames      total frames at 24 fps
    tracks      {name: [[u, v, depth], ...]} per frame, u/v normalised 0–1 from top-left
    events      [{"frame": n, "kind": "threshold", "who": ..., "lot": ...}]
    meta        anything else the composition wants (state names, timings)
"""
from __future__ import annotations

import json
import math
import os

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

import block as B

FPS = 24
HERE = os.path.dirname(os.path.abspath(__file__))
EXPORTS = os.path.join(HERE, "..", "exports")


# --------------------------------------------------------------------------
# Camera
# --------------------------------------------------------------------------
def camera(name="Camera", lens=40.0, fstop=None, focus=None) -> bpy.types.Object:
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_width = 36.0
    cd.sensor_fit = "HORIZONTAL"
    cd.clip_start = 0.05
    cd.clip_end = 900
    if fstop is not None:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        if focus is not None:
            cd.dof.focus_distance = focus
    co = bpy.data.objects.new(name, cd)
    bpy.context.scene.collection.objects.link(co)
    bpy.context.scene.camera = co
    return co


def aim(cam: bpy.types.Object, pos, target, roll=0.0):
    cam.location = Vector(pos)
    d = Vector(target) - Vector(pos)
    q = d.to_track_quat("-Z", "Y")
    cam.rotation_euler = q.to_euler()
    if roll:
        cam.rotation_euler.rotate_axis("Z", roll)


def key_cam(cam: bpy.types.Object, frame: int, pos, target, lens=None, focus=None):
    """Keyframe a look-at pose. Interpolation is set to the film's one bezier afterwards via ease()."""
    aim(cam, pos, target)
    cam.keyframe_insert("location", frame=frame)
    cam.keyframe_insert("rotation_euler", frame=frame)
    if lens is not None:
        cam.data.lens = lens
        cam.data.keyframe_insert("lens", frame=frame)
    if focus is not None and cam.data.dof.use_dof:
        cam.data.dof.focus_distance = focus
        cam.data.dof.keyframe_insert("focus_distance", frame=frame)


def ease(obj, plane=True, linear=False):
    """The plane bezier (.7,0,.2,1) approximated with Bezier handles; or linear for walks."""
    ad = obj.animation_data
    if not ad or not ad.action:
        return
    for fc in _fcurves(ad.action):
        pts = fc.keyframe_points
        for i, kp in enumerate(pts):
            if linear:
                kp.interpolation = "LINEAR"
                continue
            kp.interpolation = "BEZIER"
            kp.handle_left_type = "FREE"
            kp.handle_right_type = "FREE"
        if linear:
            continue
        # handle lengths: right handle of key i toward key i+1 by 0.7 of the span; left handle of key i+1 back by 0.8 of the span
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            span = b.co.x - a.co.x
            a.handle_right = (a.co.x + span * 0.7, a.co.y)
            b.handle_left = (b.co.x - span * 0.8, b.co.y)
        if len(pts):
            pts[0].handle_left = (pts[0].co.x - 1, pts[0].co.y)
            pts[-1].handle_right = (pts[-1].co.x + 1, pts[-1].co.y)
        fc.extrapolation = "CONSTANT"


def _fcurves(action):
    if hasattr(action, "fcurves") and len(action.fcurves):
        return list(action.fcurves)
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags:
                out.extend(cb.fcurves)
    return out


def hold_keys(obj):
    """Constant interpolation for on/off toggles (hide_render)."""
    ad = obj.animation_data
    if not ad or not ad.action:
        return
    for fc in _fcurves(ad.action):
        for kp in fc.keyframe_points:
            kp.interpolation = "CONSTANT"


# --------------------------------------------------------------------------
# People
# --------------------------------------------------------------------------
class People:
    """Amber capsules that walk sidewalks, pause, cross thresholds and go inside."""

    def __init__(self, W: B.World):
        self.W = W
        self.n = 0
        self.events: list[dict] = []
        self.objects: list[bpy.types.Object] = []

    def walk(self, path: list[tuple[float, float]], start: int, speed=1.25, pauses: dict[int, int] | None = None, into: str | None = None, name=None, height=1.72, hide_after=True, bob=0.018, start_hidden=True) -> bpy.types.Object:
        """Walk through `path` points (x, y) starting at `start`. `pauses` maps point index → frames to wait there.
        `into` names a lot; the last point should be inside the door and a threshold event is recorded when the
        path crosses the frontage line."""
        self.n += 1
        nm = name or f"person{self.n}"
        p = B.figure(nm, (path[0][0], path[0][1], B.CURB_H), self.W.person_mat, height=height)
        self.objects.append(p)
        pauses = pauses or {}
        f = start
        if start_hidden and start > 0:
            p.hide_render = True
            p.keyframe_insert("hide_render", frame=0)
            p.hide_render = False
            p.keyframe_insert("hide_render", frame=start)
        p.location = (path[0][0], path[0][1], B.CURB_H)
        p.keyframe_insert("location", frame=f)
        crossed = False
        for i in range(1, len(path)):
            a, b = Vector(path[i - 1]), Vector(path[i])
            dist = (b - a).length
            dur = max(1, round(dist / speed * FPS))
            # threshold: the frontage line at |y| = FRONT, or a door opening
            if into and not crossed and abs(a.y) < B.FRONT + 0.05 and abs(b.y) > B.FRONT + 0.05 and into != "joes":
                t = (B.FRONT - abs(a.y)) / max(1e-6, abs(b.y) - abs(a.y))
                self.events.append({"frame": int(round(f + dur * t)), "kind": "threshold", "who": nm, "lot": into})
                crossed = True
            if into == "joes" and not crossed and i == len(path) - 1:
                self.events.append({"frame": int(round(f + dur * 0.55)), "kind": "threshold", "who": nm, "lot": into})
                crossed = True
            f += dur
            p.location = (b.x, b.y, B.CURB_H)
            p.keyframe_insert("location", frame=f)
            if i in pauses:
                f += pauses[i]
                p.keyframe_insert("location", frame=f)
        ease(p, linear=True)
        if hide_after and into:
            p.hide_render = False
            p.keyframe_insert("hide_render", frame=f + 12)
            p.hide_render = True
            p.keyframe_insert("hide_render", frame=f + 13)
        hold_keys_only_hide(p)
        # a walking bob: a subtle vertical oscillation driven by an f-curve modifier on location.z
        if bob > 0:
            ad = p.animation_data
            for fc in _fcurves(ad.action):
                if fc.data_path == "location" and fc.array_index == 2:
                    mod = fc.modifiers.new("FNGENERATOR")
                    mod.function_type = "SIN"
                    mod.amplitude = bob
                    mod.phase_multiplier = 2 * math.pi * 1.9 / FPS
                    mod.use_additive = True
                    mod.use_restricted_range = True
                    mod.frame_start = start
                    mod.frame_end = f
        return p

    def stand(self, at: tuple[float, float], start: int, end: int, name=None, height=1.72, face=None):
        self.n += 1
        nm = name or f"person{self.n}"
        p = B.figure(nm, (at[0], at[1], B.CURB_H), self.W.person_mat, height=height)
        self.objects.append(p)
        p.hide_render = True
        p.keyframe_insert("hide_render", frame=0)
        p.hide_render = False
        p.keyframe_insert("hide_render", frame=start)
        p.hide_render = True
        p.keyframe_insert("hide_render", frame=end)
        hold_keys(p)
        return p


def hold_keys_only_hide(obj):
    ad = obj.animation_data
    if not ad or not ad.action:
        return
    for fc in _fcurves(ad.action):
        if fc.data_path == "hide_render":
            for kp in fc.keyframe_points:
                kp.interpolation = "CONSTANT"


# --------------------------------------------------------------------------
# Tracks
# --------------------------------------------------------------------------
def export_tracks(W: B.World, cam: bpy.types.Object, frames: int, names: list[str], events: list[dict], meta: dict, out: str):
    scene = bpy.context.scene
    tracks = {n: [] for n in names}
    dg = bpy.context.evaluated_depsgraph_get()
    for f in range(frames):
        scene.frame_set(f)
        dg.update()
        for n in names:
            e = W.tracks[n]
            co = e.evaluated_get(dg).matrix_world.translation
            v = world_to_camera_view(scene, cam.evaluated_get(dg), co)
            tracks[n].append([round(v.x, 5), round(1 - v.y, 5), round(v.z, 3)])
    data = {"fps": FPS, "frames": frames, "width": scene.render.resolution_x, "height": scene.render.resolution_y, "tracks": tracks, "events": events, "meta": meta}
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w") as fh:
        json.dump(data, fh)
    scene.frame_set(0)
    return data


# --------------------------------------------------------------------------
# Compositor: mist for depth, a soft glare on the emissives
# --------------------------------------------------------------------------
def compositor(mist=0.42, mist_color=(0.62, 0.70, 0.78), glare=0.12, mist_start=40, mist_depth=200):
    scene = bpy.context.scene
    vl = scene.view_layers[0]
    vl.use_pass_mist = True
    scene.world.mist_settings.start = mist_start
    scene.world.mist_settings.depth = mist_depth
    scene.world.mist_settings.falloff = "QUADRATIC"
    try:
        ng = bpy.data.node_groups.new("FilmComp", "CompositorNodeTree")
        scene.compositing_node_group = ng
        scene.use_nodes = True
        rl = ng.nodes.new("CompositorNodeRLayers")
        out = ng.nodes.new("NodeGroupOutput")
        ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        mixn = ng.nodes.new("ShaderNodeMix")
        mixn.data_type = "RGBA"
        mixn.blend_type = "MIX"
        mistfac = ng.nodes.new("ShaderNodeMath")
        mistfac.operation = "MULTIPLY"
        mistfac.inputs[1].default_value = mist
        ng.links.new(rl.outputs["Mist"], mistfac.inputs[0])
        col = ng.nodes.new("CompositorNodeRGB")
        col.outputs[0].default_value = (*mist_color, 1.0)
        ng.links.new(mistfac.outputs[0], mixn.inputs[0])
        ng.links.new(rl.outputs["Image"], mixn.inputs[6])
        ng.links.new(col.outputs[0], mixn.inputs[7])
        img_out = mixn.outputs[2]
        gl = ng.nodes.new("CompositorNodeGlare")
        try:
            gl.inputs["Type"].default_value = "BLOOM"
        except Exception:
            pass
        for nm, val in (("Threshold", 1.6), ("Strength", glare), ("Size", 0.55), ("Quality", "MEDIUM")):
            try:
                gl.inputs[nm].default_value = val
            except Exception:
                pass
        ng.links.new(img_out, gl.inputs["Image"])
        ng.links.new(gl.outputs[0], out.inputs[0])
        return True
    except Exception as e:  # pragma: no cover - environment dependent
        print("compositor unavailable:", e)
        return False


# --------------------------------------------------------------------------
# Render settings
# --------------------------------------------------------------------------
def settings(width=1920, height=1080, samples=64, denoise=True, adaptive=0.1, seed=7):
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = samples
    s.cycles.use_adaptive_sampling = True
    s.cycles.adaptive_threshold = adaptive
    s.cycles.use_denoising = denoise
    try:
        s.cycles.denoiser = "OPENIMAGEDENOISE"
        s.cycles.denoising_use_gpu = False
    except Exception:
        pass
    s.cycles.max_bounces = 4
    s.cycles.diffuse_bounces = 2
    s.cycles.glossy_bounces = 2
    s.cycles.transmission_bounces = 2
    s.cycles.transparent_max_bounces = 8
    s.cycles.caustics_reflective = False
    s.cycles.caustics_refractive = False
    s.cycles.seed = seed
    s.cycles.use_animated_seed = False
    s.cycles.blur_glossy = 0.6
    s.cycles.film_exposure = 1.0
    s.render.resolution_x = width
    s.render.resolution_y = height
    s.render.resolution_percentage = 100
    s.render.fps = FPS
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGB"
    s.render.image_settings.color_depth = "8"
    s.render.image_settings.compression = 60
    s.render.film_transparent = False
    s.render.use_motion_blur = False
    s.view_settings.view_transform = "AgX"
    s.view_settings.look = "AgX - Medium High Contrast"
    s.view_settings.gamma = 1.0
    s.render.use_persistent_data = True


# --------------------------------------------------------------------------
# Shots
# --------------------------------------------------------------------------
def shot_lookdev(W: B.World, state="dawn"):
    """The establishing composition: Joe's centred, the block alive around it."""
    B.set_state(W, state)
    cam = camera(lens=42, fstop=None)
    aim(cam, (-9.0, -46.0, 23.0), (0.0, 9.0, 3.5))
    ppl = People(W)
    _dawn_life(ppl)
    return {"frames": 1, "cam": cam, "people": ppl, "names": ["joes_lot", "door_joes", "door_cafe", "door_pharmacy"]}


def _dawn_life(ppl: People, offset=0):
    """Friday 7:12: the block is at work, Joe's is not. Arrivals at the café and pharmacy land between frames 90 and 160."""
    y = B.ROAD_HALF + 1.9  # walking line on the far sidewalk
    cafe = B.LOTS[3]
    ph = B.LOTS[1]
    cafe_door = (cafe.cx + (cafe.w - 1.4) * 0.22, B.FRONT + 0.7)
    ph_door = (ph.cx - (ph.w - 1.4) * 0.22, B.FRONT + 0.7)
    # into the café: one from the east, one from the west (both cross the door around frames 100 and 135)
    ppl.walk([(cafe_door[0] + 4.0, y), (cafe_door[0] + 0.4, y), (cafe_door[0], B.FRONT - 0.2), (cafe_door[0], cafe_door[1] + 1.6)], offset - 10, into="cafe", pauses={2: 8})
    ppl.walk([(cafe_door[0] - 5.0, y + 0.5), (cafe_door[0] - 0.4, y + 0.3), (cafe_door[0], B.FRONT - 0.2), (cafe_door[0], cafe_door[1] + 1.8)], offset + 30, into="cafe", pauses={2: 6})
    ppl.walk([(cafe_door[0] + 6.0, y - 0.3), (cafe_door[0] + 0.5, y - 0.2), (cafe_door[0], B.FRONT - 0.2), (cafe_door[0], cafe_door[1] + 2.0)], offset + 62, into="cafe", pauses={2: 6})
    # into the pharmacy from the west (door at about frame 120)
    ppl.walk([(ph_door[0] - 4.0, y + 0.3), (ph_door[0] - 0.3, y), (ph_door[0], B.FRONT - 0.2), (ph_door[0], ph_door[1] + 1.6)], offset + 18, into="pharmacy", pauses={2: 8})
    ppl.walk([(ph_door[0] + 5.0, y - 0.2), (ph_door[0] + 0.3, y), (ph_door[0], B.FRONT - 0.2), (ph_door[0], ph_door[1] + 1.8)], offset + 66, into="pharmacy", pauses={2: 6})
    # one comes out of the café with coffee and walks on
    ppl.walk([(cafe_door[0], cafe_door[1] + 1.0), (cafe_door[0], B.FRONT - 0.6), (cafe_door[0] + 1.0, y + 0.7), (cafe_door[0] + 14.0, y + 0.9)], offset + 96, start_hidden=True)
    # walkers who pass Joe's without turning in (never under the opening camera)
    ppl.walk([(-30.0, y - 0.9), (-6.0, y - 0.8), (24.0, y - 0.7)], offset + 60, speed=1.35)
    ppl.walk([(-1.0, -y + 0.4), (-24.0, -y + 0.6)], offset + 40, speed=1.25)
    # people already inside: two at the café counter, one in the pharmacy; two seated outside the café
    ppl.stand((cafe.cx - 1.4, B.FRONT + 3.3), 0, 10000)
    ppl.stand((cafe.cx + 1.2, B.FRONT + 2.2), 0, 10000)
    ppl.stand((ph.cx + 0.6, B.FRONT + 2.9), 0, 10000)
    ppl.stand((cafe.x0 + 2.6 - 0.55, B.FRONT - 1.5), 0, 10000, height=1.25)
    ppl.stand((cafe.x0 + 4.4 + 0.55, B.FRONT - 1.5), 0, 10000, height=1.25)
    # a short queue out of the café door, along the frontage
    for k, (dx, dy) in enumerate(((0.0, 0.0), (0.62, -0.22), (1.55, 0.08))):
        ppl.stand((cafe_door[0] - 1.1 - dx, B.FRONT - 0.9 - dy), 0, 10000, height=1.72 - 0.05 * k)
    ppl.walk([(cafe.cx - 12.0, y + 0.2), (cafe.cx - 3.0, y + 0.4)], offset + 10, speed=1.2)
    # someone crosses the road toward the café in the last seconds, past Joe's empty mouth
    ppl.walk([(6.0, -y + 0.5), (10.0, -0.5), (13.5, y - 0.6), (cafe_door[0] - 3.0, y - 0.3)], offset - 60, speed=1.45)
    # someone reaching the restaurant end, and a person at the barber door
    rest = B.LOTS[5]
    ppl.walk([(rest.cx - 4, y + 0.5), (rest.cx + (rest.w - 1.4) * 0.22, y), (rest.cx + (rest.w - 1.4) * 0.22, B.FRONT + 2.4)], offset + 40, into="restaurant")
    ppl.stand((ph.cx - 1.8, B.FRONT + 4.2), 0, 10000)
    ppl.stand((rest.cx - 1.0, B.FRONT + 2.4), 0, 10000)


SHOTS = {"lookdev": shot_lookdev}


# --------------------------------------------------------------------------
# Plate shots
# --------------------------------------------------------------------------
ESTABLISH = dict(pos=(-3.0, -24.0, 26.0), target=(2.0, 13.0, 2.5), lens=26)


def _hold_keys_material(mat):
    ad = mat.node_tree.animation_data
    if ad and ad.action:
        for fc in _fcurves(ad.action):
            for kp in fc.keyframe_points:
                kp.interpolation = "CONSTANT"


# the settle: across the street at first-floor height, Joe's centre-left, the café alive on the right
E_FINAL = dict(pos=(-2.5, -19.5, 5.2), target=(6.0, 10.5, 2.8), lens=29)
E_DRIFT = dict(pos=(-1.7, -19.0, 5.05), target=(6.3, 10.5, 2.8), lens=29.6)
# dusk, from an upper window across the street: the far row's wall of windows, the two screens, the forecourt
E_DUSK = dict(pos=(-2.0, -23.0, 9.5), target=(0.0, 12.0, 5.0), lens=20)
E_DUSK_END = dict(pos=(-2.8, -22.6, 9.2), target=(0.4, 12.0, 4.8), lens=20.5)
# the top-down page frame (26 mm from 10 m): its centre on the sidewalk so the curb lies at 70% of the page
FP_Z = 10.0
FP_DY = 1.56
HERO1_TRACKS = ["joes_walk", "joes_lot", "joes_apron", "joes_curb_w", "joes_curb_e", "joes_frontage_w", "joes_frontage_e", "door_joes", "joes_canopy", "door_cafe", "door_pharmacy", "page_tl", "page_tr", "page_br", "page_bl", "fp_tl", "fp_tr", "fp_br", "fp_bl"]


def _hero1_common(W: B.World):
    """Shared by the Hero 1 variants: dawn, the block at work, Joe's quiet, a page rectangle on the ground for the editorial layer."""
    B.set_state(W, "dawn")
    lot = W.tracks["joes_lot"].location
    walk = (lot.x, B.ROAD_HALF - 1.3, 0.0)
    W.tracks["joes_walk"] = B.empty("track_joes_walk", walk)
    W.tracks["joes_apron"] = B.empty("track_joes_apron", (lot.x, B.FRONT + 0.9, B.CURB_H))
    # the top-down frame's footprint on the ground (26 mm lens from 10 m): the page maps onto exactly this
    fcx, fcy, fz = lot.x + 1.5, B.ROAD_HALF + FP_DY, FP_Z
    hw = (fz - B.CURB_H) * 18.0 / 26.0  # the sidewalk's top, not the road
    hh = hw * 9 / 16
    for name, (px, py) in (("fp_tl", (fcx - hw, fcy + hh)), ("fp_tr", (fcx + hw, fcy + hh)), ("fp_br", (fcx + hw, fcy - hh)), ("fp_bl", (fcx - hw, fcy - hh))):
        W.tracks[name] = B.empty(f"track_{name}", (px, py, B.CURB_H))
    # the page's footprint on the ground: a 16:9 rectangle over Joe's lot, its bottom edge in the road just past the curb
    pw, pd = 30.0, 30.0 * 9 / 16
    py0 = B.ROAD_HALF - 1.5
    for name, (px, py) in (("page_tl", (lot.x - pw / 2, py0 + pd)), ("page_tr", (lot.x + pw / 2, py0 + pd)), ("page_br", (lot.x + pw / 2, py0)), ("page_bl", (lot.x - pw / 2, py0))):
        W.tracks[name] = B.empty(f"track_{name}", (px, py, B.CURB_H))
    # one unattended car at Joe's east island: the forecourt is not empty, it is quiet
    B.car_at(5.1, 13.4, 3, yaw=math.pi / 2, name="car_joes_quiet")
    ppl = People(W)
    _dawn_life(ppl, offset=0)
    return walk, ppl


def _exposure(frame, value):
    s = bpy.context.scene
    s.view_settings.exposure = value
    s.view_settings.keyframe_insert("exposure", frame=frame)


def shot_hero1a(W: B.World):
    """A · the page is the pavement. Straight down on the sidewalk in front of Joe's; the camera lifts and the block rises."""
    frames = 156
    walk, ppl = _hero1_common(W)
    lot = W.tracks["joes_lot"].location
    fcx, fcy = lot.x + 1.5, B.ROAD_HALF + FP_DY
    cam = camera(lens=26, fstop=4.0, focus=34.0)
    key_cam(cam, 0, (fcx, fcy, FP_Z), (fcx, fcy + 0.0001, 0.0), lens=26, focus=FP_Z)
    key_cam(cam, 22, (fcx, fcy, FP_Z), (fcx, fcy + 0.0001, 0.0), lens=26, focus=FP_Z)
    key_cam(cam, 74, (fcx - 4.5, fcy - 11.0, 7.8), (fcx - 1.0, B.FRONT + 2.0, 1.4), lens=27, focus=22.0)
    key_cam(cam, 110, E_FINAL["pos"], E_FINAL["target"], lens=E_FINAL["lens"], focus=34.0)
    key_cam(cam, frames - 1, E_DRIFT["pos"], E_DRIFT["target"], lens=E_DRIFT["lens"], focus=34.0)
    ease(cam)
    ease(cam.data)
    # the editorial light carries in: paper-white while the camera holds, settling to the morning as it lifts
    base = B.STATES["dawn"]["exposure"]
    _exposure(0, base + 3.0)
    _exposure(14, base + 2.8)
    _exposure(52, base)
    return {"frames": frames, "cam": cam, "people": ppl, "names": HERO1_TRACKS, "meta": {"variant": "A", "hold": 22, "tilt": [22, 110], "clock": "Friday · 07:12"}, "comp": {"mist": 0.45, "mist_color": (0.74, 0.66, 0.56), "mist_start": 30, "mist_depth": 140}}


def shot_hero1b(W: B.World):
    """B · the descent. The block as a plan from 70 m, paper-white; the 3 stamps onto Joe's lot; a crane-down settles into the street."""
    frames = 144
    walk, ppl = _hero1_common(W)
    lot = W.tracks["joes_lot"].location
    cam = camera(lens=26, fstop=4.0, focus=70.0)
    key_cam(cam, 0, (lot.x + 2.0, B.FRONT - 1.0, 70.0), (lot.x + 2.0, B.FRONT - 0.9999, 0.0), lens=26, focus=70.0)
    key_cam(cam, 18, (lot.x + 2.0, B.FRONT - 1.0, 70.0), (lot.x + 2.0, B.FRONT - 0.9999, 0.0), lens=26, focus=70.0)
    key_cam(cam, 96, E_FINAL["pos"], E_FINAL["target"], lens=E_FINAL["lens"], focus=34.0)
    key_cam(cam, frames - 1, E_DRIFT["pos"], E_DRIFT["target"], lens=E_DRIFT["lens"], focus=34.0)
    ease(cam)
    ease(cam.data)
    base = B.STATES["dawn"]["exposure"]
    _exposure(0, base + 3.2)
    _exposure(18, base + 3.2)
    _exposure(60, base)
    return {"frames": frames, "cam": cam, "people": ppl, "names": HERO1_TRACKS, "meta": {"variant": "B", "descent": [18, 96], "clock": "Friday · 07:12"}, "comp": {"mist": 0.5, "mist_start": 30, "mist_depth": 140}}


def shot_hero1c(W: B.World):
    """C · the page tilts into the street. A slow push only; the editorial page becomes the ground plane in the composite."""
    frames = 120
    walk, ppl = _hero1_common(W)
    cam = camera(lens=26, fstop=4.0, focus=36.0)
    key_cam(cam, 0, (-11.0, -22.5, 7.0), (1.0, 10.5, 3.0), lens=27, focus=36.0)
    key_cam(cam, frames - 1, E_FINAL["pos"], E_FINAL["target"], lens=E_FINAL["lens"], focus=34.0)
    ease(cam)
    ease(cam.data)
    base = B.STATES["dawn"]["exposure"]
    _exposure(0, base + 2.4)
    _exposure(34, base)
    return {"frames": frames, "cam": cam, "people": ppl, "names": HERO1_TRACKS, "meta": {"variant": "C", "clock": "Friday · 07:12"}, "comp": {"mist": 0.5, "mist_start": 30, "mist_depth": 140}}


def shot_hero1(W: B.World):
    return shot_hero1a(W)


def shot_hero3a(W: B.World):
    """Distribute. Thursday 6:48 PM. The plan enters the block; texts land in homes (windows), the two screens arm."""
    frames = 144
    B.set_state(W, "dusk", frame=0)
    cam = camera(lens=22, fstop=4.0, focus=34.0)
    key_cam(cam, 0, E_DUSK["pos"], E_DUSK["target"], lens=E_DUSK["lens"], focus=34.0)
    key_cam(cam, frames - 1, E_DUSK_END["pos"], E_DUSK_END["target"], lens=E_DUSK_END["lens"], focus=34.0)
    ease(cam)
    ease(cam.data)
    # homes: five windows across the block that light amber as the texts land, all inside the dusk frame
    homes = [("cafe", 1), ("pharmacy", 2), ("cafe", 6), ("pharmacy", 6), ("cafe", 3)]
    home_frames = [66, 74, 82, 91, 101]
    names = ["joes_walk", "joes_lot", "joes_canopy", "door_joes", "door_cafe", "door_pharmacy", "plaque_cafe", "plaque_pharmacy", "pump_01", "pump_10"]
    W.tracks["joes_walk"] = B.empty("track_joes_walk", (W.tracks["joes_lot"].location.x, B.ROAD_HALF + 2.0, B.CURB_H))
    for i, ((lot, idx), f) in enumerate(zip(homes, home_frames)):
        B.set_window(W, lot, idx, 0.0, frame=f - 1)
        B.set_window(W, lot, idx, 1.0, frame=f + 5, strength=16.0)
        cards = W.upper_windows[lot]
        card = cards[idx]
        nm = f"home_{i}"
        W.tracks[nm] = B.empty(f"track_{nm}", (card.location.x, card.location.y - 0.35, card.location.z))
        names.append(nm)
    # screens arm once the signal reaches them
    for key, f in (("pharmacy", 112), ("cafe", 118)):
        B.set_plaque(W, key, 0.0, frame=f - 1)
        B.set_plaque(W, key, 1.0, frame=f + 3)
        B.set_screen(W, key, 0.0, frame=f - 1)
        B.set_screen(W, key, 1.0, frame=f + 3)
    ppl = People(W)
    y = B.ROAD_HALF + 1.9
    ppl.walk([(47.0, y), (-47.0, y + 0.4)], 0, speed=1.2)
    ppl.walk([(-30.0, -y + 0.5), (20.0, -y + 0.3)], 24, speed=1.25)
    cafe = B.LOTS[3]
    ppl.stand((cafe.cx - 1.4, B.FRONT + 3.3), 0, 10000)
    ppl.stand((cafe.cx + 1.6, B.FRONT + 4.6), 0, 10000)
    return {"frames": frames, "cam": cam, "people": ppl, "names": names, "meta": {"state": "dusk", "homes": home_frames, "arm": {"pharmacy": 112, "cafe": 118}, "clock": "Thursday · 6:48 PM"}, "comp": {"mist": 0.3, "mist_color": (0.16, 0.22, 0.32)}}


def shot_hero3b(W: B.World):
    """The café, Friday 7:04 AM. Street → through the door → the counter screen. Joe's content arrives; a person notices."""
    frames = 168
    B.set_state(W, "morning", elev=11.0, rot=118, exposure=-2.4, interior_w=2200)
    cafe = B.LOTS[3]
    door = W.doors["cafe"]
    scr = W.screens["cafe"]
    # the door stands open for the camera: hide the leaf
    for o in bpy.data.objects:
        if o.name in ("lot_cafe_door", "lot_cafe_doorglass"):
            o.hide_render = True
    panel = scr["panel"]
    bpy.context.view_layer.update()
    pc = panel.matrix_world.translation.copy()
    yaw = scr["root"].rotation_euler.z
    facing = Vector((math.sin(yaw), -math.cos(yaw), 0.0))  # where the panel looks
    perp = Vector((-facing.y, facing.x, 0.0))
    cam = camera(lens=32, fstop=4.0, focus=9.0)
    key_cam(cam, 0, (door.x - 4.2, 1.6, 1.62), (door.x + 0.4, 9.0, 1.45), lens=32, focus=8.5)
    key_cam(cam, 30, (door.x - 4.2, 1.6, 1.62), (door.x + 0.4, 9.0, 1.45), lens=32, focus=8.5)
    key_cam(cam, 92, (door.x + 0.1, 8.9, 1.55), (pc.x, pc.y, pc.z + 0.05), lens=36, focus=3.0)
    end = pc + facing * 2.0 + perp * 1.0
    key_cam(cam, frames - 1, (end.x, end.y, 1.48), (pc.x - facing.x * 0.05, pc.y - facing.y * 0.05, pc.z), lens=42, focus=2.2)
    ease(cam)
    ease(cam.data)
    # screen: the café's own content, then Joe's
    B.set_screen(W, "cafe", 1.0, frame=0, image=os.path.join(HERE, "..", "assets", "screens", "cafe-idle.png"))
    # second panel with Joe's content, swapped in at the arrival frame
    joes_mat = B.mat_screen("screen_cafe_joes", os.path.join(HERE, "..", "assets", "screens", "cafe-joes.png"), strength=2.2)
    panel2 = B.plane("unit_cafe_panel_joes", (0.465, 0.465 * 9 / 16), panel.location, joes_mat, group="lot_cafe", rot=panel.rotation_euler)
    panel2.parent = panel.parent
    panel2.location = panel.location
    panel2.location.y -= 0.0006
    arrive = 78
    panel2.hide_render = True
    panel2.keyframe_insert("hide_render", frame=0)
    panel2.hide_render = False
    panel2.keyframe_insert("hide_render", frame=arrive)
    hold_keys(panel2)
    panel.hide_render = False
    panel.keyframe_insert("hide_render", frame=0)
    panel.hide_render = True
    panel.keyframe_insert("hide_render", frame=arrive)
    hold_keys(panel)
    led = scr["led"].data.materials[0].node_tree.nodes["Principled BSDF"]
    led.inputs["Emission Strength"].default_value = 1.5
    led.inputs["Emission Strength"].keyframe_insert("default_value", frame=arrive - 1)
    led.inputs["Emission Strength"].default_value = 6.0
    led.inputs["Emission Strength"].keyframe_insert("default_value", frame=arrive + 2)
    B.set_plaque(W, "cafe", 1.0)
    # people: a barista behind the counter, one person in the queue who arrives, waits, then turns to the screen
    ppl = People(W)
    ccx = cafe.cx - (cafe.w - 1.4) * 0.18
    ccy = B.FRONT + 2.6
    ppl.stand((ccx - 0.6, ccy + 0.95), 0, 10000, name="barista")
    ppl.stand((cafe.cx + 2.2, B.FRONT + 5.2), 0, 10000, name="seated")
    spot = pc + facing * 0.95 - perp * 0.35
    q = ppl.walk([(door.x - 0.2, B.FRONT + 1.2), (spot.x, spot.y)], 18, speed=0.85, name="queue", start_hidden=False, pauses={})
    # hold at the queue point, then a half-step toward the screen at the moment it notices
    q.keyframe_insert("location", frame=104)
    spot2 = pc + facing * 0.8 - perp * 0.15
    q.location = (spot2.x, spot2.y, B.CURB_H)
    q.keyframe_insert("location", frame=118)
    q.keyframe_insert("location", frame=frames - 1)
    ease(q, linear=True)
    head = B.empty("track_person_cafe", (0, 0, 1.5))
    head.parent = q
    W.tracks["person_cafe"] = head
    W.tracks["screen_cafe_c"] = B.empty("track_screen_cafe_c", (0, 0, 0))
    W.tracks["screen_cafe_c"].parent = panel
    names = ["screen_cafe_tl", "screen_cafe_tr", "screen_cafe_br", "screen_cafe_bl", "screen_cafe_c", "person_cafe", "door_cafe", "plaque_cafe"]
    return {"frames": frames, "cam": cam, "people": ppl, "names": names, "meta": {"state": "morning", "arrive": arrive, "notice": 104, "scan": 122, "clock": "Friday · 7:04 AM"}, "comp": {"mist": 0.12, "glare": 0.1}}


def path_frames(path, speed, pauses):
    """Frames from the first point to the start of the last segment, and the last segment's length."""
    total = 0
    for i in range(1, len(path)):
        a, b = Vector(path[i - 1]), Vector(path[i])
        dur = max(1, round((b - a).length / speed * FPS))
        if i == len(path) - 1:
            return total, dur
        total += dur + pauses.get(i, 0)
    return total, 0


def shot_hero5(W: B.World):
    """Return. Friday 7:42 → 9:50. Across Joe's forecourt, people cross the store threshold; the morning advances."""
    frames = 216
    B.set_state(W, "morning", frame=0, elev=12.0, rot=116, exposure=-2.7)
    B.set_state(W, "morning", frame=frames - 1, elev=27.0, rot=140, exposure=-3.5)
    door = W.doors["joes"]
    cam = camera(lens=35, fstop=5.6, focus=20.0)
    key_cam(cam, 0, (-11.0, 3.0, 4.6), (door.x - 0.5, door.y - 3.0, 1.4), lens=35, focus=22.0)
    key_cam(cam, frames - 1, (-9.6, 5.4, 4.3), (door.x - 0.4, door.y - 3.0, 1.3), lens=38, focus=19.0)
    ease(cam)
    ease(cam.data)
    # the store door stands open all morning
    for o in bpy.data.objects:
        if o.name in ("lot_joes_door", "lot_joes_doorglass"):
            o.hide_render = True
    # a customer's car at the east pump island
    B.car_at(5.1, 13.4, 2, yaw=math.pi / 2, name="car_pump")
    ppl = People(W)
    y = B.ROAD_HALF + 1.9
    dx, dy = door.x, door.y
    inside = (dx, dy + 2.2)
    def to_door(path, cross_at, name, speed=1.35):
        full = path + [(dx, dy - 1.2), inside]
        pauses = {len(path): 3}
        before, last = path_frames(full, speed, pauses)
        start = int(round(cross_at - before - last * 0.55))
        return ppl.walk(full, start, speed=speed, into="joes", name=name, pauses=pauses)
    # 1 · the redeemed customer: from the car at the pump to the door
    first = to_door([(5.1, 10.9), (2.6, 15.6)], 30, "first", speed=1.2)
    # 2 · from the café side (east), across the forecourt
    to_door([(12.0, y + 0.3), (7.5, 12.0)], 66, "p2")
    # 3 · from the west sidewalk
    to_door([(-16.0, y + 0.2), (-9.5, 12.5)], 100, "p3")
    # 4 · from the west pump island
    to_door([(-6.0, 10.6), (-5.0, 16.2)], 130, "p4", speed=1.2)
    # 5 · from the café side again
    to_door([(13.0, y - 0.2), (6.0, 13.5)], 156, "p5")
    # life that is not Joe's: walkers who pass, and someone leaving Joe's with coffee at the end
    ppl.walk([(-30.0, y - 0.9), (30.0, y - 0.7)], -60, speed=1.3)
    ppl.walk([(28.0, -y + 0.4), (-28.0, -y + 0.6)], 20, speed=1.2)
    ppl.walk([inside, (dx, dy - 1.4), (-8.0, 12.0), (-15.0, y + 0.2), (-30.0, y)], 168, speed=1.25, start_hidden=True)
    head = B.empty("track_first", (0, 0, 1.5))
    head.parent = first
    W.tracks["first"] = head
    names = ["door_joes", "first", "joes_canopy", "pump_00", "joes_store"]
    thresholds = sorted(e["frame"] for e in ppl.events)
    return {"frames": frames, "cam": cam, "people": ppl, "names": names, "meta": {"state": "morning", "clock_from": "07:42", "clock_to": "09:50", "thresholds": thresholds}, "comp": {"mist": 0.18}}


SHOTS.update({"hero1": shot_hero1, "hero1a": shot_hero1a, "hero1b": shot_hero1b, "hero1c": shot_hero1c, "hero3a": shot_hero3a, "hero3b": shot_hero3b, "hero5": shot_hero5})
