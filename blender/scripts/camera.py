"""
THE LENS · one camera grammar for the whole film.

Every physical shot in this film is authored through `Cam`. A shot cannot be
built without declaring its lens family, its height, what is in the
foreground, what the subject is, what is behind it, where the focal plane
sits, and — if the camera moves at all — what motivates the move and where it
starts and stops. The prose version of this is film/CINEMATOGRAPHY.md.

There are four families and nothing else:

    BLOCK    40 mm   the street, the lot, the building as a whole
    STREET   50 mm   a person crossing a real distance
    HUMAN    75 mm   the counter, the shoulder, the exchange
    DEVICE   95 mm   the phone, the cup, the thing in the hand

Sensor is 36 mm wide throughout, so "40 mm" is 40 mm as a full-frame
photographer means it. Depth of field is always on: an f-stop and a focus
distance are part of the lens, not an effect.

Movement is the exception. Most shots here are locked. When one does move it
moves for a reason a viewer could name — settling into a place, following a
person, closing on a device — and it starts and stops on rest, never mid-drift.
"""
from __future__ import annotations

import math

import bpy
from mathutils import Vector

# --------------------------------------------------------------------------
# The four families. fstop is the family's working stop; a shot may open up.
# --------------------------------------------------------------------------
FAMILIES = {
    "block": dict(lens=40.0, fstop=5.6, height=1.62, note="the street, the lot, the building whole"),
    "street": dict(lens=50.0, fstop=4.0, height=1.58, note="a person crossing a real distance"),
    "human": dict(lens=75.0, fstop=2.8, height=1.42, note="the counter, the shoulder, the exchange"),
    "device": dict(lens=95.0, fstop=2.2, height=1.10, note="the phone, the cup, the thing in the hand"),
}

SENSOR = 36.0


class Cam:
    """One authored camera. Build it, key it, and it reports itself for the bible."""

    def __init__(self, family: str, *, subject: str, foreground: str, background: str,
                 motivation: str = "locked", name: str = "Camera", lens: float | None = None,
                 fstop: float | None = None, shutter: float = 0.5):
        f = FAMILIES[family]
        self.family = family
        self.subject = subject
        self.foreground = foreground
        self.background = background
        self.motivation = motivation
        self.moves: list[dict] = []
        cd = bpy.data.cameras.new(name)
        cd.lens = lens if lens is not None else f["lens"]
        cd.sensor_width = SENSOR
        cd.sensor_fit = "HORIZONTAL"
        cd.clip_start = 0.008
        cd.clip_end = 900.0
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop if fstop is not None else f["fstop"]
        cd.dof.aperture_blades = 8
        cd.dof.aperture_rotation = math.radians(11)
        self.obj = bpy.data.objects.new(name, cd)
        bpy.context.scene.collection.objects.link(self.obj)
        bpy.context.scene.camera = self.obj
        bpy.context.scene.render.motion_blur_shutter = shutter
        bpy.context.scene.render.use_motion_blur = True

    # -- posing -------------------------------------------------------------
    def look(self, pos, target, roll=0.0):
        self.obj.location = Vector(pos)
        d = Vector(target) - Vector(pos)
        q = d.to_track_quat("-Z", "Y")
        self.obj.rotation_euler = q.to_euler()
        if roll:
            self.obj.rotation_euler.rotate_axis("Z", roll)
        return self

    def focus_on(self, target, offset: float = 0.0):
        """Focus by geometry, not by eye: the distance from the lens to a point."""
        d = (Vector(target) - self.obj.location).length + offset
        self.obj.data.dof.focus_distance = max(0.02, d)
        return d

    def key(self, frame: int, pos, target, *, focus=None, lens=None, roll=0.0, label: str = ""):
        """A stop. Every move is a list of stops; there is no drift between films."""
        self.look(pos, target, roll)
        self.obj.keyframe_insert("location", frame=frame)
        self.obj.keyframe_insert("rotation_euler", frame=frame)
        if lens is not None:
            self.obj.data.lens = lens
            self.obj.data.keyframe_insert("lens", frame=frame)
        d = self.focus_on(focus if focus is not None else target)
        self.obj.data.dof.keyframe_insert("focus_distance", frame=frame)
        self.moves.append(dict(frame=frame, pos=tuple(round(v, 3) for v in pos), focus=round(d, 3), label=label))
        return self

    def lock(self, pos, target, frames: int, *, focus=None, roll=0.0, label="locked"):
        """The default: the camera does not move. Two identical stops, so the export is uniform."""
        self.key(0, pos, target, focus=focus, roll=roll, label=label)
        self.key(frames - 1, pos, target, focus=focus, roll=roll, label=label)
        return self

    # -- the record ---------------------------------------------------------
    def spec(self) -> dict:
        cd = self.obj.data
        return dict(
            family=self.family, lens=round(cd.lens, 1), fstop=round(cd.dof.aperture_fstop, 2),
            height=round(self.obj.location.z, 2), subject=self.subject, foreground=self.foreground,
            background=self.background, motivation=self.motivation,
            stops=[m["label"] or f"f{m['frame']}" for m in self.moves],
            focus=[m["focus"] for m in self.moves],
        )


def ease_camera(cam_obj, hold_in=0.62, hold_out=0.78):
    """Camera moves start and stop on rest. Never linear, never a constant drift."""
    ad = cam_obj.animation_data
    if not ad or not ad.action:
        return
    for fc in _fcurves(ad.action):
        pts = fc.keyframe_points
        for kp in pts:
            kp.interpolation = "BEZIER"
            kp.handle_left_type = kp.handle_right_type = "FREE"
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            span = b.co.x - a.co.x
            a.handle_right = (a.co.x + span * hold_in, a.co.y)
            b.handle_left = (b.co.x - span * hold_out, b.co.y)
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
