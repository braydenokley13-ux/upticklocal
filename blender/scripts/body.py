"""
THE HUMAN SYSTEM · maquettes at distance, gesture up close.

The rule the film holds to:

    WIDE     a sculptural figure — shoulders, tapered torso, legs, a yaw that
             says which way it is going. An architectural maquette, not a pin.
    MEDIUM   crop it. Shoulder and arm, the head out of frame or half out.
    CLOSE    never a whole abstract body. A shoulder, a forearm, a hand, a
             phone. The gesture carries the humanity; no face is needed.

Everything here is lofted from elliptical sections, so a figure is broad
across the shoulders and shallow front to back and reads as facing somewhere.
"""
from __future__ import annotations

import math

import bpy

import block as B


# --------------------------------------------------------------------------
# Lofting
# --------------------------------------------------------------------------
def loft(name: str, sections, mat, group="people", segs=20, close_bottom=True, close_top=True):
    """sections: [(rx, ry, z), ...] bottom to top. Elliptical rings skinned into one smooth mesh."""
    mesh = bpy.data.meshes.new(name)
    vs, fs = [], []
    for rx, ry, z in sections:
        for i in range(segs):
            a = 2 * math.pi * i / segs
            vs.append((max(rx, 1e-4) * math.cos(a), max(ry, 1e-4) * math.sin(a), z))
    for j in range(len(sections) - 1):
        for i in range(segs):
            i2 = (i + 1) % segs
            fs.append((j * segs + i, j * segs + i2, (j + 1) * segs + i2, (j + 1) * segs + i))
    if close_bottom:
        vs.append((0.0, 0.0, sections[0][2]))
        c = len(vs) - 1
        for i in range(segs):
            fs.append((c, (i + 1) % segs, i))
    if close_top:
        vs.append((0.0, 0.0, sections[-1][2]))
        c = len(vs) - 1
        b = (len(sections) - 1) * segs
        for i in range(segs):
            fs.append((c, b + i, b + (i + 1) % segs))
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    for p in mesh.polygons:
        p.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    mesh.materials.append(mat)
    return B._link(obj, group)


# --------------------------------------------------------------------------
# The figure
# --------------------------------------------------------------------------
# Proportions of a 1.75 m adult, in metres from the floor, as fractions of height.
# The shoulder yoke is the whole point: wide in X, shallow in Y, and it sits
# where a shoulder sits. A pin has no shoulder; this is the difference.
TORSO = [
    # (rx, ry, z) as fractions of height
    (0.088, 0.070, 0.505),  # hip, where the legs meet
    (0.084, 0.062, 0.570),  # waist
    (0.094, 0.068, 0.650),  # lower ribs
    (0.104, 0.073, 0.720),  # chest
    (0.113, 0.070, 0.780),  # upper chest
    (0.124, 0.064, 0.822),  # the yoke: shoulders, wide and flat
    (0.104, 0.058, 0.852),  # the yoke rolls over
    (0.040, 0.040, 0.876),  # neck root
    (0.033, 0.035, 0.906),  # neck
    (0.049, 0.055, 0.928),  # jaw
    (0.058, 0.066, 0.958),  # head
    (0.052, 0.060, 0.982),  # crown
    (0.020, 0.024, 0.998),
]

LEG = [
    (0.036, 0.048, 0.012),  # the foot's ball, on the ground
    (0.030, 0.036, 0.045),  # ankle
    (0.043, 0.046, 0.140),  # calf swell
    (0.038, 0.040, 0.270),  # below the knee
    (0.041, 0.043, 0.300),  # knee
    (0.052, 0.055, 0.400),  # thigh
    (0.060, 0.062, 0.492),  # into the hip
]

ARM = [
    (0.040, 0.040, 0.000),  # deltoid, at the yoke
    (0.033, 0.033, -0.090),
    (0.027, 0.027, -0.200),  # elbow
    (0.024, 0.024, -0.300),
    (0.020, 0.021, -0.395),  # wrist
    (0.024, 0.017, -0.440),  # the hand's mass, closed
    (0.016, 0.012, -0.470),
]


def figure(name: str, loc, mat, height=1.75, yaw=0.0, group="people", legs=True, arms=True, segs=20):
    """A sculptural human. Returns the parent empty; body/legs/arms are its children so a
    walker's legs can swing and one arm can be raised without touching the torso."""
    root = B.empty(f"{name}_root", loc, group=group)
    root.rotation_euler = (0.0, 0.0, yaw)
    hip_z = TORSO[0][2] * height

    body = loft(name, [(rx * height, ry * height, z * height) for rx, ry, z in TORSO], mat, group=group, segs=segs)
    body.parent = root
    parts = {"body": body}

    if legs:
        for side, sx in (("l", -1.0), ("r", 1.0)):
            lg = loft(f"{name}_leg_{side}", [(rx * height, ry * height, z * height) for rx, ry, z in LEG], mat, group=group, segs=14)
            lg.parent = root
            lg.location = (sx * 0.052 * height, 0.0, 0.0)
            parts[f"leg_{side}"] = lg
    else:
        # one column instead of two: for the far background, where a leg gap is invisible
        col = loft(f"{name}_stand", [(0.070 * height, 0.062 * height, 0.010), (0.062 * height, 0.058 * height, 0.20 * height), (0.078 * height, 0.066 * height, hip_z)], mat, group=group, segs=14)
        col.parent = root
        parts["stand"] = col

    if arms:
        for side, sx in (("l", -1.0), ("r", 1.0)):
            am = loft(f"{name}_arm_{side}", [(rx * height, ry * height, z * height) for rx, ry, z in ARM], mat, group=group, segs=12)
            am.parent = root
            am.location = (sx * 0.118 * height, 0.0, 0.822 * height)
            am.rotation_euler = (0.0, sx * 0.055, 0.0)
            parts[f"arm_{side}"] = am

    root["parts"] = list(parts.keys())
    return root, parts


def gait(parts: dict, frames: int, *, speed=1.0, phase=0.0, stride=0.34, height=1.75, start=0):
    """A walk: the legs swing about the hip, the arms counter-swing. Keyed every third frame —
    enough for 24 fps with motion blur, cheap enough for a street full of people."""
    cad = 1.55 * speed  # steps per second
    for f in range(0, frames + 1, 3):
        t = f / 24.0
        a = 2 * math.pi * (cad * t + phase)
        for side, sgn in (("l", 1.0), ("r", -1.0)):
            lg = parts.get(f"leg_{side}")
            if lg:
                sw = math.sin(a) * sgn
                lg.rotation_euler = (sw * stride, 0.0, 0.0)
                lg.location = (lg.location.x, 0.0, abs(math.sin(a)) * 0.012 * height)
                lg.keyframe_insert("rotation_euler", frame=start + f)
                lg.keyframe_insert("location", frame=start + f)
            am = parts.get(f"arm_{side}")
            if am:
                am.rotation_euler = (-math.sin(a) * sgn * stride * 0.55, am.rotation_euler.y, 0.0)
                am.keyframe_insert("rotation_euler", frame=start + f)


# --------------------------------------------------------------------------
# The close rig: shoulder · upper arm · forearm · hand · phone
# --------------------------------------------------------------------------
def hand(name: str, mat, group="people", scale=1.0, closed=0.55):
    """A hand that can hold a phone: a palm, a thumb across the front, four fingers
    wrapping the far edge. Enough to read at 95 mm; no knuckle detail it cannot earn.

    Local frame: +X across the palm (thumb side +X), +Y out of the back of the hand,
    +Z from wrist toward the fingertips. The phone sits at Y ≈ -0.012, upright in Z."""
    s = scale
    root = B.empty(f"{name}_hand", (0, 0, 0), group=group)
    palm = loft(f"{name}_palm", [
        (0.030 * s, 0.021 * s, -0.020 * s),
        (0.036 * s, 0.024 * s, 0.010 * s),
        (0.042 * s, 0.025 * s, 0.048 * s),
        (0.043 * s, 0.024 * s, 0.082 * s),
        (0.038 * s, 0.021 * s, 0.098 * s),
    ], mat, group=group, segs=16)
    palm.parent = root
    parts = {"palm": palm}

    # four fingers, wrapping the far edge of whatever is held
    for i in range(4):
        fx = (-0.030 + i * 0.0225) * s
        fl = (0.070 - abs(i - 1.2) * 0.008) * s
        fg = loft(f"{name}_f{i}", [
            (0.0105 * s, 0.0105 * s, 0.0),
            (0.0098 * s, 0.0100 * s, fl * 0.45),
            (0.0090 * s, 0.0092 * s, fl * 0.78),
            (0.0072 * s, 0.0074 * s, fl),
        ], mat, group=group, segs=10)
        fg.parent = root
        fg.location = (fx, -0.004 * s, 0.096 * s)
        fg.rotation_euler = (-closed * 1.55, 0.0, 0.0)
        parts[f"f{i}"] = fg

    thumb = loft(f"{name}_thumb", [
        (0.0135 * s, 0.0135 * s, 0.0),
        (0.0125 * s, 0.0128 * s, 0.030 * s),
        (0.0112 * s, 0.0115 * s, 0.058 * s),
        (0.0092 * s, 0.0096 * s, 0.072 * s),
    ], mat, group=group, segs=10)
    thumb.parent = root
    thumb.location = (0.040 * s, -0.006 * s, 0.026 * s)
    thumb.rotation_euler = (-0.30, 0.0, -1.02)
    parts["thumb"] = thumb
    return root, parts


def forearm(name: str, mat, group="people", scale=1.0):
    """Elbow to wrist, tapering the right way. Parent a hand to its `wrist` empty."""
    root = B.empty(f"{name}_fa", (0, 0, 0), group=group)
    s = scale
    fa = loft(f"{name}_forearm", [
        (0.052 * s, 0.049 * s, -0.255 * s),
        (0.046 * s, 0.044 * s, -0.190 * s),
        (0.039 * s, 0.038 * s, -0.110 * s),
        (0.032 * s, 0.031 * s, -0.045 * s),
        (0.029 * s, 0.026 * s, 0.0),
    ], mat, group=group, segs=16)
    fa.parent = root
    wrist = B.empty(f"{name}_wrist", (0, 0, 0), group=group)
    wrist.parent = root
    return root, {"forearm": fa, "wrist": wrist}


def digit(name: str, mat, group="device", scale=1.0):
    """One thumb, for the press. At 95 mm a whole hand would fill the frame; what the shot
    needs is the tip of a thumb arriving, pressing once, and going away."""
    s = scale
    root = B.empty(f"{name}_root", (0, 0, 0), group=group)
    d = loft(f"{name}_d", [
        (0.0175 * s, 0.0170 * s, -0.085 * s),
        (0.0168 * s, 0.0162 * s, -0.048 * s),
        (0.0158 * s, 0.0150 * s, -0.020 * s),
        (0.0150 * s, 0.0140 * s, 0.004 * s),
        (0.0138 * s, 0.0126 * s, 0.020 * s),
        (0.0104 * s, 0.0098 * s, 0.030 * s),
    ], mat, group=group, segs=14)
    d.parent = root
    return root, {"digit": d}


def tube(name: str, points, radii, mat, group="device", segs=12):
    """A round tube swept along a polyline. Fingers are built this way so they can be placed
    around an object by hand: give the path, and the geometry follows it instead of a rig."""
    import mathutils

    mesh = bpy.data.meshes.new(name)
    pts = [mathutils.Vector(p) for p in points]
    rs = list(radii) if hasattr(radii, "__len__") else [radii] * len(pts)
    vs, fs = [], []
    up = mathutils.Vector((0.0, 0.0, 1.0))
    for i, p in enumerate(pts):
        if i == 0:
            t = (pts[1] - pts[0])
        elif i == len(pts) - 1:
            t = (pts[-1] - pts[-2])
        else:
            t = (pts[i + 1] - pts[i - 1])
        t.normalize()
        ref = up if abs(t.dot(up)) < 0.94 else mathutils.Vector((1.0, 0.0, 0.0))
        n1 = t.cross(ref).normalized()
        n2 = t.cross(n1).normalized()
        for k in range(segs):
            a = 2 * math.pi * k / segs
            vs.append(tuple(p + n1 * (rs[i] * math.cos(a)) + n2 * (rs[i] * math.sin(a))))
    for j in range(len(pts) - 1):
        for k in range(segs):
            k2 = (k + 1) % segs
            fs.append((j * segs + k, j * segs + k2, (j + 1) * segs + k2, (j + 1) * segs + k))
    for base, flip in ((0, True), ((len(pts) - 1) * segs, False)):
        c = len(vs)
        vs.append(tuple(pts[0] if flip else pts[-1]))
        for k in range(segs):
            k2 = (k + 1) % segs
            fs.append((c, base + k2, base + k) if flip else (c, base + k, base + k2))
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    for p in mesh.polygons:
        p.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    mesh.materials.append(mat)
    return B._link(obj, group)


def ellipsoid(name: str, radii, mat, group="device", segs=20, rings=12):
    rx, ry, rz = radii
    secs = []
    for k in range(-rings, rings + 1):
        a = k / rings * math.pi / 2
        secs.append((max(1e-4, rx * math.cos(a)), max(1e-4, ry * math.cos(a)), rz * math.sin(a)))
    return loft(name, secs, mat, group=group, segs=segs, close_bottom=False, close_top=False)
