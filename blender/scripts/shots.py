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
import camera as CAM
import scenes as SC

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
# a cast with real height variety: adults from a short one to a tall one, picked deterministically
HEIGHTS = (1.57, 1.62, 1.66, 1.70, 1.73, 1.77, 1.81, 1.87)


def ground_z(x: float, y: float) -> float:
    """Where a foot actually lands: the road, the kerbed sidewalk, Joe's forecourt, or a shop floor.
    Nobody hovers, so everybody has a contact shadow."""
    ay = abs(y)
    if ay < B.ROAD_HALF:
        return 0.0
    if ay < B.FRONT:
        return B.CURB_H
    if y >= B.FRONT:
        joes = B.LOTS[2]
        if joes.x0 < x < joes.x1 and y < 19.6:
            return B.CURB_H + 0.01
        return 0.02
    return 0.005


def _cast_height(n: int, given):
    return given if given is not None else HEIGHTS[int(B._fac(n, 5) * 977) % len(HEIGHTS)]


class People:
    """Amber figures that walk sidewalks, pause, cross thresholds and go inside."""

    def __init__(self, W: B.World):
        self.W = W
        self.n = 0
        self.events: list[dict] = []
        self.objects: list[bpy.types.Object] = []

    def walk(self, path: list[tuple[float, float]], start: int, speed=1.25, pauses: dict[int, int] | None = None, into: str | None = None, name=None, height=None, hide_after=True, bob=0.018, start_hidden=True) -> bpy.types.Object:
        """Walk through `path` points (x, y) starting at `start`. `pauses` maps point index → frames to wait there.
        `into` names a lot; the last point should be inside the door and a threshold event is recorded when the
        path crosses the frontage line.

        A walker is turned to face the way it is going and leans a little into the walk; it stands up straight
        while it waits. Its feet stay on whatever surface it is crossing, so Cycles gives it a contact shadow."""
        self.n += 1
        nm = name or f"person{self.n}"
        h = _cast_height(self.n, height)
        p = B.figure(nm, (path[0][0], path[0][1], B.CURB_H), self.W.person_mat, height=h)
        self.objects.append(p)
        pauses = pauses or {}
        f = start
        lean = 0.05 + 0.035 * B._fac(self.n, 9)
        drop = bob if bob > 0 else 0.0  # the bob only ever sinks, so no foot leaves the ground

        def gz(v):
            return ground_z(v.x, v.y) - drop

        if start_hidden and start > 0:
            p.hide_render = True
            p.keyframe_insert("hide_render", frame=0)
            p.hide_render = False
            p.keyframe_insert("hide_render", frame=start)
        a0 = Vector(path[0])
        p.location = (a0.x, a0.y, gz(a0))
        p.keyframe_insert("location", frame=f)
        yaw = math.atan2(path[1][1] - path[0][1], path[1][0] - path[0][0]) + math.pi / 2
        p.rotation_euler = (lean, 0.0, yaw)
        p.keyframe_insert("rotation_euler", frame=f)
        crossed = False
        for i in range(1, len(path)):
            a, b = Vector(path[i - 1]), Vector(path[i])
            dist = (b - a).length
            dur = max(1, round(dist / speed * FPS))
            seg = math.atan2(b.y - a.y, b.x - a.x) + math.pi / 2
            while seg - yaw > math.pi:
                seg -= 2 * math.pi
            while seg - yaw < -math.pi:
                seg += 2 * math.pi
            yaw = seg
            turn = max(1, min(6, dur // 4))
            p.rotation_euler = (lean, 0.0, yaw)
            p.keyframe_insert("rotation_euler", frame=f + turn)
            # threshold: the frontage line at |y| = FRONT, or a door opening
            if into and not crossed and abs(a.y) < B.FRONT + 0.05 and abs(b.y) > B.FRONT + 0.05 and into != "joes":
                t = (B.FRONT - abs(a.y)) / max(1e-6, abs(b.y) - abs(a.y))
                self.events.append({"frame": int(round(f + dur * t)), "kind": "threshold", "who": nm, "lot": into})
                crossed = True
            if into == "joes" and not crossed and i == len(path) - 1:
                self.events.append({"frame": int(round(f + dur * 0.55)), "kind": "threshold", "who": nm, "lot": into})
                crossed = True
            f += dur
            p.location = (b.x, b.y, gz(b))
            p.keyframe_insert("location", frame=f)
            p.keyframe_insert("rotation_euler", frame=f - min(turn, dur - 1) if dur > 1 else f)
            if i in pauses:
                p.rotation_euler = (0.0, 0.0, yaw)
                p.keyframe_insert("rotation_euler", frame=f + min(5, pauses[i]))
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

    def stand(self, at: tuple[float, float], start: int, end: int, name=None, height=None, face=None):
        self.n += 1
        nm = name or f"person{self.n}"
        p = B.figure(nm, (at[0], at[1], ground_z(at[0], at[1])), self.W.person_mat, height=_cast_height(self.n, height))
        p.rotation_euler = (0.0, 0.0, face if face is not None else B._fac(self.n, 13) * 2 * math.pi)
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
    # No resolution is recorded, deliberately. world_to_camera_view is NORMALISED, and the
    # composite scales it by the composition's own 1920x1080 rather than the plate's -- which is
    # precisely why a 640x360 proxy and a 1280x720 final produce byte-identical composite
    # geometry, and why a world crossing can be judged on the proxy lane. Recording the render
    # resolution here implied otherwise and made the two lanes fight over the same file.
    data = {"fps": FPS, "frames": frames, "basis": "normalised", "tracks": tracks, "events": events, "meta": meta}
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
    # a real shutter: plates carry the camera's own blur instead of being 156 crisp stills
    s.render.use_motion_blur = True
    s.render.motion_blur_shutter = 0.5
    s.render.motion_blur_position = "CENTER"
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
    # far enough west by the settle that it is gone, not a half-figure stuck in the corner of the frame
    ppl.walk([(-8.0, -y + 0.4), (-34.0, -y + 0.6)], offset - 40, speed=1.3)
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
    ppl.walk([(6.0, -y + 0.5), (10.0, -0.5), (13.5, y - 0.6), (cafe_door[0] - 3.0, y - 0.3)], offset - 110, speed=1.45)
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
    B.car_at(5.1, 13.4, 3, yaw=math.pi / 2, name="car_joes_quiet", z=B.CURB_H + 0.02)
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
    cam = CAM.Cam("page", fstop=4.0,
                  subject="the sidewalk in front of Joe's, and then the block that sidewalk belongs to",
                  foreground="nothing while we are over the ground — the near row's bench and low wall arrive as we cross the street",
                  background="the far row and the morning behind it",
                  motivation="the page is printed on this pavement, so the camera lifts off the ground it printed and lets the block rise into the frame")
    cam.key(0, (fcx, fcy, FP_Z), (fcx, fcy + 0.0001, 0.0), lens=26, focus=FP_Z, label="straight down, the page")
    cam.key(22, (fcx, fcy, FP_Z), (fcx, fcy + 0.0001, 0.0), lens=26, focus=FP_Z, label="straight down, the page")
    # out over the street, not under Joe's canopy: the canopy stays a line along the top instead of a slab
    cam.key(74, (fcx - 6.0, fcy - 19.0, 8.6), (fcx + 1.0, B.FRONT - 0.2, 1.2), lens=27, focus=24.0, label="out over the street")
    cam.key(110, E_FINAL["pos"], E_FINAL["target"], lens=E_FINAL["lens"], focus=34.0, label="across Main St")
    cam.key(132, E_DRIFT["pos"], E_DRIFT["target"], lens=E_DRIFT["lens"], focus=34.0, label="settled")
    cam.key(frames - 1, E_DRIFT["pos"], E_DRIFT["target"], lens=E_DRIFT["lens"], focus=34.0, label="settled")
    # the film's own bezier, not the camera module's, because this move was cut to the music
    ease(cam.obj)
    ease(cam.obj.data)
    # the editorial light carries in: paper-white while the camera holds, settling to the morning as it lifts
    base = B.STATES["dawn"]["exposure"]
    _exposure(0, base + 3.0)
    _exposure(14, base + 2.8)
    _exposure(52, base)
    return {"frames": frames, "cam": cam.obj, "people": ppl, "names": HERO1_TRACKS,
            "meta": {"variant": "A", "hold": 22, "tilt": [22, 110], "clock": "Friday · 07:12", "spec": cam.spec()},
            "comp": {"mist": 0.45, "mist_color": (0.74, 0.66, 0.56), "mist_start": 30, "mist_depth": 140}}


def shot_hero1(W: B.World):
    return shot_hero1a(W)


def shot_hero3a(W: B.World):
    """ACT V · Thursday, 6:48 PM. The plan reaches the block, and the block answers.

    lens      block 40 mm at f/2.8    height 1.62 m — standing in the lot opposite Joe's
    fore      the lot's own asphalt and its low wall, running across below the road
    subject   Joe's forecourt: the canopy, the near island, the store behind them
    back      the cafe two doors east, and the flats above its shopfront
    focus     the near pump island, 31.2 m
    move      locked. Someone watching a street from a parking lot does not drift.

    This beat used to be a 20 mm elevation of the whole block from nine metres up:
    no foreground, no ground a person could be standing on, and five windows scattered
    over sixty metres of frontage where each was eight pixels wide and three of them
    were jammed into the last tenth of the frame. That is a drawing of a network, which
    is the one thing this act must not be. So it is played from the ground instead.
    Joe's own forecourt comes on when the plan lands on it, and then, three times, a
    window lights in the flats above the cafe. One window standing for a hundred and
    four is a better claim than five dots standing for nothing.
    """
    frames = 144
    # Joe's is dark until the plan lands on its lot; then the canopy, the sign and the entrance light: delivered
    B.set_state(W, "dusk", frame=0, joes=0.0, canopy=0.0)
    B.set_state(W, "dusk", frame=38, joes=0.0, canopy=0.0)
    B.set_state(W, "dusk", frame=52)

    # the two cars nosed into the near bays sit exactly on the horizon from standing height, so they
    # cross the frame as two pale slabs in front of the forecourt rather than reading as foreground.
    # A wide lens cannot blur anything at seven metres, so they go: the bays they stand in are empty
    # at a quarter to seven, which is the most ordinary thing on this street.
    for nm in ("lotcar1", "lotcar2"):
        for o in bpy.data.objects:
            if o.name == nm or o.name.startswith(nm + "_"):
                o.hide_render = True

    # people carry a little emission so they hold their amber in shade. At dusk, with the sky
    # three stops down, that same emission turns them into lit dolls standing in a dark street,
    # so it comes most of the way off and the canopy lights them instead.
    B.mat_emission(W.person_mat, 0.14)

    cam = CAM.Cam("block", fstop=2.8,
                  subject="Joe's forecourt: the canopy, the near island, the store behind them",
                  foreground="the lot's own asphalt and its low wall, running across below the road",
                  background="the cafe two doors east, and the flats above its shopfront",
                  motivation="locked")
    cam.lock((-16.5, -18.0, 1.62), (2.5, 9.0, 3.0), frames, focus=(-6.2, 11.5, 1.74), label="the lot opposite")
    CAM.ease_camera(cam.obj)

    # the flats above the cafe: three windows in the same building, coming on one after another.
    # They are chosen because they are legible in this frame, not because they are spread across it.
    homes = [("cafe", 0), ("cafe", 5), ("cafe", 4)]
    home_frames = [66, 84, 101]
    names = ["joes_lot", "joes_canopy", "joes_curb_w", "joes_curb_e", "door_joes", "pump_01", "pump_10"]
    for i, ((lot, idx), f) in enumerate(zip(homes, home_frames)):
        B.set_window(W, lot, idx, 0.0, frame=f - 1)
        B.set_window(W, lot, idx, 1.0, frame=f + 5, strength=16.0)
        card = W.upper_windows[lot][idx]
        nm = f"home_{i}"
        W.tracks[nm] = B.empty(f"track_{nm}", (card.location.x, card.location.y - 0.35, card.location.z))
        names.append(nm)
    # the two Uptick screens wake for tomorrow morning. Only the cafe's is in this frame, at the
    # far right, and it stays a lit object in the world: Act VI is the one that walks up to it.
    for key, f in (("pharmacy", 112), ("cafe", 118)):
        B.set_plaque(W, key, 0.0, frame=f - 1)
        B.set_plaque(W, key, 1.0, frame=f + 3)
        B.set_screen(W, key, 0.0, frame=f - 1)
        B.set_screen(W, key, 1.0, frame=f + 3)

    # life, at the scale this lens gives it: a car on the east island with someone standing at the
    # pump, one person along Joe's frontage, one going into the cafe while the flats light above it
    B.car_at(4.9, 13.0, 1, yaw=math.pi / 2, name="car_joes_dusk", z=B.CURB_H + 0.02)
    ppl = People(W)
    ppl.stand((3.7, 12.3), 0, 10000)
    ppl.walk([(-15.0, 6.4), (-5.0, 6.4)], 6, speed=1.05)
    ppl.walk([(19.4, 6.5), (23.6, 7.9)], 58, speed=0.95, into="cafe")
    return {"frames": frames, "cam": cam.obj, "people": ppl, "names": names,
            "meta": {"state": "dusk", "homes": home_frames, "arm": {"pharmacy": 112, "cafe": 118},
                     "clock": "Thursday · 6:48 PM", "spec": cam.spec()},
            "comp": {"mist": 0.26, "mist_color": (0.16, 0.22, 0.32)}}


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
    # standing at the counter: upright; the walk keys its lean only while it moves
    t0, tl = path_frames([(door.x - 0.2, B.FRONT + 1.2), (spot.x, spot.y)], 0.85, {})
    q.rotation_euler = (0.0, 0.0, q.rotation_euler[2])
    q.keyframe_insert("rotation_euler", frame=18 + t0 + tl + 4)
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
    # The lane between the two pump islands (x -6.2 and 2.2) runs straight at the door: we stand in it, at
    # eye height, and drift in under the canopy across the morning. The islands flank the frame, the canopy
    # cuts the top, and a person at the door is a third of the frame high — a person, not a marker.
    cam = camera(lens=40, fstop=4.5, focus=14.2)
    key_cam(cam, 0, (-0.55, 7.0, 1.74), (door.x - 1.55, door.y + 0.05, 2.0), lens=40, focus=13.2)
    key_cam(cam, frames - 1, (-0.75, 8.4, 1.71), (door.x - 1.5, door.y + 0.05, 1.96), lens=42, focus=11.9)
    ease(cam)
    ease(cam.data)
    # the store door stands open all morning
    for o in bpy.data.objects:
        if o.name in ("lot_joes_door", "lot_joes_doorglass"):
            o.hide_render = True
    # a customer's car at the east pump island
    B.car_at(5.1, 13.4, 2, yaw=math.pi / 2, name="car_pump", z=B.CURB_H + 0.02)
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



def shot_hero5c(W: B.World):
    """Inside Joe's, Friday 7:42. The staff's side of the counter: a customer holds the pass up to us; the door,
    the forecourt and the street are through the glass behind them. The redemption happens here, in the world."""
    frames = 186
    B.set_state(W, "morning", frame=0, elev=12.5, rot=118, exposure=-1.75, joes=1.0, interior_w=1800)
    B.set_state(W, "morning", frame=frames - 1, elev=13.6, rot=120, exposure=-1.75, joes=1.0, interior_w=1800)
    lot = next(l for l in B.LOTS if l.id == "joes")
    scx = lot.cx + 2.0
    sy0 = B.FRONT + 12.0 - 0.5
    open_w = 15.0 - 1.4
    ccx, ccy = scx + open_w * 0.22, sy0 + 2.4
    door = W.doors["joes"]
    cam = camera(lens=30, fstop=2.8, focus=2.7)
    key_cam(cam, 0, (ccx + 2.1, ccy + 1.25, 1.62), (ccx - 0.75, ccy - 1.35, 1.2), lens=30, focus=3.4)
    key_cam(cam, frames - 1, (ccx + 1.98, ccy + 1.12, 1.59), (ccx - 0.72, ccy - 1.33, 1.19), lens=30, focus=3.25)
    ease(cam)
    ease(cam.data)
    # the door stands open (the glass leaves are out of the frames); the lot's yard wall runs through this room
    for o in bpy.data.objects:
        if o.name in ("lot_joes_doorglass-1", "lot_joes_doorglass1", "lot_joes_yardwall", "lot_joes_coffee"):
            o.hide_render = True
    # the coffee machine, at this distance: a body, a boiler, two group heads, a drip tray, a cup
    steel = B.mat_surface("steel", "#b9bcc0", rough=0.25, metallic=0.8)
    dark = B.mat_surface("machine_dark", "#26282a", rough=0.45, metallic=0.2)
    mx, my = ccx - 1.45, ccy + 0.04
    B.box("h5c_machine_body", (0.92, 0.46, 0.42), (mx, my, 1.0 + 0.21), steel, bevel=0.012, group="lot_joes")
    B.box("h5c_machine_boiler", (0.92, 0.40, 0.10), (mx, my + 0.02, 1.0 + 0.47), dark, bevel=0.01, group="lot_joes")
    B.box("h5c_machine_panel", (0.86, 0.02, 0.16), (mx, my - 0.24, 1.0 + 0.30), dark, bevel=0.004, group="lot_joes")
    for gx in (-0.22, 0.22):
        B.box(f"h5c_machine_group{gx}", (0.12, 0.16, 0.09), (mx + gx, my - 0.27, 1.0 + 0.135), dark, bevel=0.01, group="lot_joes")
    B.box("h5c_machine_tray", (0.90, 0.16, 0.025), (mx, my - 0.31, 1.0 + 0.0125), dark, bevel=0.004, group="lot_joes")
    B.box("h5c_cup", (0.085, 0.085, 0.11), (mx + 0.62, my - 0.18, 1.0 + 0.055), B.mat_surface("cup", "#efe9df", rough=0.5), bevel=0.02, group="lot_joes")
    ppl = People(W)
    # the customer, at the counter, facing us; a small sway so the figure is alive
    cx0, cy0 = ccx - 0.07, ccy - 1.02
    cust = ppl.stand((cx0, cy0), 0, frames + 2, name="customer", height=1.74, face=math.pi)
    for f, dx, dy, yaw in ((0, 0.0, 0.0, 0.0), (70, 0.014, -0.010, 0.035), (140, -0.012, 0.012, -0.03), (185, 0.005, 0.0, 0.015)):
        cust.location = (cx0 + dx, cy0 + dy, ground_z(cx0 + dx, cy0 + dy))
        cust.keyframe_insert("location", frame=f)
        cust.rotation_euler = (0.0, 0.0, math.pi + yaw)
        cust.keyframe_insert("rotation_euler", frame=f)
    ease(cust)
    # the hand: it comes up from the hip with the phone over the first 18 frames and holds the pass up toward us
    # (local -y is the figure's front; local +x is the figure's right, which is screen-right from this camera).
    # The pass in the composite rises with this hand, so the slab grows out of a phone that is held, not hung.
    hand = B.empty("h5c_hand", (0.0, 0.0, 0.0))
    hand.parent = cust
    elbow = (0.19, -0.04, 1.08)
    poses = ((0, (0.20, -0.14, 0.72)), (18, (0.05, -0.36, 1.24)), (frames - 1, (0.05, -0.36, 1.24)))
    for f, at in poses:
        hand.location = at
        hand.keyframe_insert("location", frame=f)
    ease(hand)
    forearm = B.cylinder("h5c_forearm", 0.042, 1.0, (0.0, 0.0, 0.0), W.person_mat, group="people", verts=16)
    forearm.parent = cust
    for f, at in poses:
        d = (at[0] - elbow[0], at[1] - elbow[1], at[2] - elbow[2])
        length = math.sqrt(d[0] ** 2 + d[1] ** 2 + d[2] ** 2)
        forearm.location = ((elbow[0] + at[0]) / 2, (elbow[1] + at[1]) / 2, (elbow[2] + at[2]) / 2)
        forearm.rotation_euler = (0.0, math.atan2(math.sqrt(d[0] ** 2 + d[1] ** 2), d[2]), math.atan2(d[1], d[0]))
        forearm.scale = (1.0, 1.0, length)
        forearm.keyframe_insert("location", frame=f)
        forearm.keyframe_insert("rotation_euler", frame=f)
        forearm.keyframe_insert("scale", frame=f)
    ease(forearm)
    phone_mat = B.mat_surface("h5c_phone", "#141618", rough=0.28, metallic=0.15, spec=0.6)
    phone_obj = B.box("h5c_phone", (0.074, 0.008, 0.152), (0.0, 0.0, 0.0), phone_mat, bevel=0.004, group="people")
    phone_obj.parent = hand
    phone_obj.location = (0.0, -0.02, 0.085)
    phone_obj.rotation_euler = (-0.14, 0.0, 0.0)
    phone = B.empty("track_phone", (0.0, 0.0, 0.0))
    phone.parent = hand
    top = B.empty("track_phone_top", (0.0, 0.0, 0.16))
    top.parent = hand
    W.tracks["phone"] = phone
    W.tracks["phone_top"] = top
    W.tracks["counter"] = B.empty("track_counter", (ccx - 0.3, ccy - 0.35, 1.0))
    W.tracks["coffee"] = B.empty("track_coffee", (ccx - 1.5, ccy - 0.25, 1.6))
    # life: the car at the east pump with someone fuelling; a walker on the sidewalk; the next customer comes in behind
    B.car_at(5.1, 13.4, 2, yaw=math.pi / 2, name="car_pump", z=B.CURB_H + 0.02)
    ppl.stand((6.05, 12.7), 0, frames + 2, name="fuelling", face=-math.pi / 2, height=1.68)
    y = B.ROAD_HALF + 1.9
    ppl.walk([(-30.0, y - 0.9), (30.0, y - 0.7)], -46, speed=1.3, start_hidden=False)
    dx, dy = door.x, door.y
    # the next customer comes in behind and turns along the front of the store. The storefront glass (y 19.82)
    # reflects the room from this side, so anyone standing deeper in the store appears in the window behind
    # the first customer; a path along the front keeps that reflection off the glass. The crossing of the door
    # line (y = door.y) on the third leg is the threshold, at frame 112.
    nxt = [(14.0, y + 0.2), (8.0, 12.5), (dx, dy - 1.2), (dx + 0.3, dy + 0.2), (dx - 2.6, dy + 0.5)]
    legs = [max(1, round((Vector(nxt[i]) - Vector(nxt[i - 1])).length / 1.3 * FPS)) for i in range(1, len(nxt))]
    cross = (dy - nxt[2][1]) / (nxt[3][1] - nxt[2][1])
    ppl.walk(nxt, int(round(112 - legs[0] - legs[1] - legs[2] * cross)), speed=1.3, name="next", hide_after=False, start_hidden=False)
    ppl.events.append({"frame": 112, "kind": "threshold", "who": "next", "lot": "joes"})
    names = ["phone", "phone_top", "counter", "coffee", "door_joes", "pump_00"]
    thresholds = sorted(e["frame"] for e in ppl.events)
    return {"frames": frames, "cam": cam, "people": ppl, "names": names, "meta": {"state": "morning", "clock": "07:42", "thresholds": thresholds}, "comp": {"mist": 0.08, "mist_start": 6, "mist_depth": 60}}

SHOTS.update({
    # The physical acts, rebuilt: one camera grammar, real objects, no floating software.
    "approach": SC.shot_approach, "threshold": SC.shot_threshold, "counter": SC.shot_counter,
    "device": SC.shot_device, "coffee": SC.shot_coffee,
    "cafe": SC.shot_cafe, "scan": SC.shot_scan,
    "morning_pump": SC.shot_morning_pump, "morning_walk": SC.shot_morning_walk, "morning_door": SC.shot_morning_door,
    "rise": SC.shot_rise,
})
SHOTS.update({"hero1": shot_hero1, "hero1a": shot_hero1a, "hero3a": shot_hero3a, "hero3b": shot_hero3b, "hero5": shot_hero5, "hero5c": shot_hero5c})
