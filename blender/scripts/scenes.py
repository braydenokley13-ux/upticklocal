"""
THE PHYSICAL ACTS · dressed sets and authored shots.

Every shot in here declares its camera through `camera.Cam`, so it cannot exist
without a lens family, a height, a foreground, a subject, a background, a focal
plane and — if it moves — a motivation and two stops. See film/CINEMATOGRAPHY.md.

The product is never composited into these shots. Where Uptick appears it is
because a physical panel is emitting a baked PNG sequence (blender/screens/),
so it is lit by the room, reflected in the glass, blurred by the lens and
covered by the thumb that presses it.
"""
from __future__ import annotations

import math
import os

import bpy

import block as B
import body as BD
import camera as CAM
import device as DV

HERE = os.path.dirname(os.path.abspath(__file__))
SCREENS = os.path.join(HERE, "..", "screens")


def seq(name: str):
    """The first frame of a baked UI sequence, and how many frames it has."""
    d = os.path.join(SCREENS, name)
    if not os.path.isdir(d):
        return None, 0
    fs = sorted(f for f in os.listdir(d) if f.endswith(".png"))
    return (os.path.join(d, fs[0]), len(fs)) if fs else (None, 0)


# --------------------------------------------------------------------------
# Materials the physical acts add to the block's language
# --------------------------------------------------------------------------
def look(W):
    """One material set, defined once and used by every physical shot.

    Roughness ranges the whole film holds to:
        painted metal  0.34–0.42     brushed aluminium 0.22
        laminate top   0.28          ceramic 0.16      paper 0.62
        board sleeve   0.78          rubber/matte 0.86
    Nothing in the block is a colour; everything is a material at a value."""
    if getattr(W, "_look", None):
        return W._look
    m = dict(
        alu=B.mat_surface("dv_alu", "#8e9095", rough=0.22, metallic=1.0, spec=0.5),
        alu_dark=B.mat_surface("dv_alu_dark", "#33383c", rough=0.30, metallic=1.0, spec=0.5),
        paint=B.mat_surface("dv_paint", "#2b3033", rough=0.38),
        top=B.mat_surface("dv_top", "#cdc6ba", rough=0.28, spec=0.5),
        steel=B.mat_surface("dv_steel", "#a8aab0", rough=0.26, metallic=1.0),
        ceramic=B.mat_surface("dv_ceramic", "#e7e3da", rough=0.16, spec=0.6, coat=0.35),
        paper=B.mat_surface("dv_paper", "#efeadf", rough=0.62),
        board=B.mat_surface("dv_board", "#b39b7c", rough=0.78),
        lid=B.mat_surface("dv_lid", "#22262a", rough=0.42),
        skin=B.mat_surface("dv_skin", "#c19277", rough=0.62, spec=0.22),
        cloth=B.mat_surface("dv_cloth", "#3d4448", rough=0.80),
        cloth2=B.mat_surface("dv_cloth2", "#6c6156", rough=0.80),
        wood=B.mat_surface("dv_wood", "#6b5744", rough=0.46),
        rubber=B.mat_surface("dv_rubber", "#1c1f21", rough=0.86),
    )
    W._look = m
    return m


# --------------------------------------------------------------------------
# Joe's counter, dressed
# --------------------------------------------------------------------------
JOES = dict(counter_x=3.99, counter_y=22.10, top_z=0.95, door=(-1.72, 19.75), back_y=27.15)


def dress_joes(W):
    """The store's counter as somewhere a person actually buys coffee: a back bar, a brewer,
    a stack of cups, a till, a mat. Without this the redemption happens in an empty box."""
    if getattr(W, "_joes_dressed", False):
        return
    W._joes_dressed = True
    m = look(W)
    g = "joes_int"
    cx, cy, tz = JOES["counter_x"], JOES["counter_y"], JOES["top_z"]

    # the back bar, against the rear wall, with the machine on it
    B.box(f"jd_backbar", (5.2, 0.62, 0.9), (cx - 0.2, 26.6, 0.45), m["paint"], bevel=0.012, group=g)
    B.box(f"jd_backtop", (5.3, 0.68, 0.05), (cx - 0.2, 26.6, 0.925), m["top"], bevel=0.006, group=g)
    for i in range(3):
        B.box(f"jd_shelf{i}", (4.6, 0.30, 0.035), (cx - 0.2, 26.9, 1.42 + i * 0.42), m["wood"], bevel=0.004, group=g)
        for j in range(9):
            x = cx - 2.3 + 0.28 + j * 0.50
            B.box(f"jd_goods{i}_{j}", (0.16, 0.16, 0.24), (x, 26.9, 1.44 + i * 0.42 + 0.12), B.mat_surface(f"jd_gm{i}{j}", B.P.goods[(i * 3 + j) % len(B.P.goods)], rough=0.66), bevel=0.006, group=g)

    # the brewer: a machine, not a box
    bx = cx + 1.55
    B.box("jd_brew_body", (0.52, 0.44, 0.62), (bx, 26.62, 1.24), m["alu_dark"], bevel=0.010, group=g)
    B.box("jd_brew_head", (0.56, 0.48, 0.10), (bx, 26.62, 1.60), m["steel"], bevel=0.008, group=g)
    for s in (-1, 1):
        B.cylinder(f"jd_brew_spout{s}", 0.018, 0.10, (bx + s * 0.10, 26.44, 1.02), m["steel"], group=g)
        B.cylinder(f"jd_brew_pot{s}", 0.085, 0.20, (bx + s * 0.10, 26.44, 0.98), m["lid"], group=g)
    # cups, stacked, where a large coffee comes from
    for i, s in enumerate((0, 1)):
        B.cylinder(f"jd_cups{i}", 0.048, 0.34, (bx - 0.44 - i * 0.13, 26.5, 0.94), m["paper"], group=g)

    # the counter's own top, a till, and a mat in front of it
    B.box("jd_counter_top", (3.5, 0.78, 0.045), (cx, cy, tz + 0.02), m["top"], bevel=0.006, group=g)
    B.box("jd_till_base", (0.40, 0.34, 0.10), (cx - 1.05, cy + 0.06, tz + 0.09), m["alu_dark"], bevel=0.008, group=g)
    B.box("jd_till_screen", (0.34, 0.03, 0.24), (cx - 1.05, cy + 0.16, tz + 0.26), m["lid"], bevel=0.004, group=g, rot=(math.radians(-14), 0, 0))
    B.box("jd_mat", (1.30, 0.34, 0.010), (cx - 0.15, cy - 0.52, tz + 0.045), m["rubber"], bevel=0.003, group=g)
    B.box("jd_stand", (0.13, 0.09, 0.20), (cx + 1.05, cy + 0.08, tz + 0.14), m["alu_dark"], bevel=0.006, group=g)

    # two practicals over the counter: the light the close shots are lit by
    for i, x in enumerate((cx - 1.4, cx + 1.2)):
        lt = bpy.data.lights.new(f"jd_prac{i}", "AREA")
        lt.shape = "RECTANGLE"
        lt.size, lt.size_y = 1.5, 0.16
        lt.energy = 90.0
        lt.color = B.srgb(B.P.warm)[:3]
        ob = bpy.data.objects.new(f"jd_prac{i}", lt)
        ob.location = (x, cy + 0.9, 2.85)
        ob.rotation_euler = (math.radians(14), 0, 0)
        B._link(ob, g)
        B.box(f"jd_prac_body{i}", (1.6, 0.22, 0.07), (x, cy + 0.9, 2.92), m["alu"], bevel=0.006, group=g)


def dress_cafe(W):
    """The café's counter end where the Uptick screen lives, so the panel has a place to be."""
    if getattr(W, "_cafe_dressed", False):
        return
    W._cafe_dressed = True
    m = look(W)
    g = "cafe_int"
    B.box("cd_top", (3.7, 0.78, 0.045), (19.93, 10.80, 0.97), m["top"], bevel=0.006, group=g)
    B.box("cd_grinder", (0.22, 0.26, 0.46), (18.6, 10.9, 1.22), m["alu_dark"], bevel=0.008, group=g)
    B.cylinder("cd_hopper", 0.075, 0.20, (18.6, 10.9, 1.45), m["lid"], group=g)
    B.box("cd_tray", (0.34, 0.24, 0.03), (19.35, 10.72, 1.01), m["steel"], bevel=0.004, group=g)
    for i in range(3):
        B.cylinder(f"cd_cup{i}", 0.043, 0.10, (19.30 + i * 0.10, 10.86, 1.04), m["paper"], group=g)
    lt = bpy.data.lights.new("cd_prac", "AREA")
    lt.shape = "RECTANGLE"
    lt.size, lt.size_y = 2.2, 0.18
    lt.energy = 70.0
    lt.color = B.srgb(B.P.warm)[:3]
    ob = bpy.data.objects.new("cd_prac", lt)
    ob.location = (20.2, 11.4, 2.75)
    ob.rotation_euler = (math.radians(-12), 0, 0)
    B._link(ob, g)


# --------------------------------------------------------------------------
# The hand that holds the phone, and the thumb that presses it
# --------------------------------------------------------------------------
def grip(W, name, parent, scale=1.0):
    """A hand holding a phone, built in the phone's own frame.

    A rigged hand posed by rotations reads as a mitt beside the object. So the fingers are
    placed here instead: each one is a tube whose path starts behind the handset, crosses its
    left edge, and ends with the pad of the fingertip resting on the front. The palm sits
    behind the glass and is mostly unseen. Everything is in the phone's local metres, with the
    handset 0.0715 wide and 0.1465 tall, so the grip is the size of a real hand on a real phone.
    """
    m = look(W)
    s = scale
    hw, hh, hd = DV.PHONE["w"] / 2 * s, DV.PHONE["h"] / 2 * s, DV.PHONE["d"] / 2 * s
    parts = {}
    palm = BD.ellipsoid(f"{name}_palm", (0.036 * s, 0.017 * s, 0.052 * s), m["skin"], group="device")
    palm.parent = parent
    palm.location = (-0.004 * s, hd + 0.017 * s, -0.020 * s)
    palm.rotation_euler = (0.0, 0.0, math.radians(-5))
    parts["palm"] = palm

    # four fingers over the near edge, longest in the middle, tips just onto the glass
    for i, (z, reach, r) in enumerate(((0.0305, 0.005, 0.0078), (0.0115, 0.0075, 0.0082), (-0.0075, 0.007, 0.0079), (-0.0265, 0.005, 0.0070))):
        z *= s
        reach *= s
        rr = r * s
        path = [
            (0.014 * s, hd + 0.030 * s, z - 0.004 * s),
            (-0.014 * s, hd + 0.028 * s, z - 0.002 * s),
            (-hw - 0.007 * s, hd + 0.017 * s, z),
            (-hw - 0.010 * s, 0.0, z + 0.002 * s),
            (-hw + 0.004 * s, -hd - 0.006 * s, z + 0.003 * s),
            (-hw + reach, -hd - 0.007 * s, z + 0.003 * s),
        ]
        fg = BD.tube(f"{name}_f{i}", path, [rr * 1.14, rr * 1.10, rr, rr, rr * 0.94, rr * 0.80], m["skin"], group="device")
        fg.parent = parent
        parts[f"f{i}"] = fg

    # the thumb up the far edge, its pad on the glass. It hangs off a pivot at its own knuckle
    # so it can swing onto the button: the hand that holds the pass is the hand that redeems it.
    base = (0.026 * s, hd + 0.036 * s, -0.074 * s)
    pivot = B.empty(f"{name}_thumb_pivot", base, group="device")
    pivot.parent = parent
    path = [
        (0.0, 0.0, 0.0),
        (0.014 * s, -0.012 * s, 0.012 * s),
        (hw + 0.006 * s - base[0], hd * 0.4 - base[1], 0.026 * s),
        (hw - 0.001 * s - base[0], -hd - 0.005 * s - base[1], 0.038 * s),
        (hw - 0.011 * s - base[0], -hd - 0.006 * s - base[1], 0.044 * s),
    ]
    th = BD.tube(f"{name}_thumb", path, [0.0122 * s, 0.0118 * s, 0.0110 * s, 0.0100 * s, 0.0086 * s], m["skin"], group="device")
    th.parent = pivot
    parts["thumb_pivot"] = pivot
    parts["thumb"] = th
    return parts


def held_phone(W, name, loc, yaw=math.pi, tilt=-0.22, screen="device-pass", scale=1.0, first=0, strength=2.4):
    """A phone in a hand, authored from the phone outward.

    The handset's pose is what the shot is about, so the handset leads: place it, and the grip
    and the forearm follow it. `yaw` turns the face toward the lens; `tilt` leans the top away
    from the holder, which is how a person holds something up for someone else to read.

    The returned root's local frame is the phone's own: +X across the face, +Z up it, -Y out of
    the screen. Button positions for `pressing_thumb` are given in that frame.
    """
    m = look(W)
    img, n = seq(screen)
    smat = DV.screen_mat(f"{name}_scr", img, frames=n, first=first, strength=strength)
    root = B.empty(name, loc, group="device")
    root.rotation_euler = (tilt, 0.0, yaw)

    ph_root, ph = DV.phone(f"{name}_p", m["alu"], smat, group="device", scale=scale)
    ph_root.parent = root
    gp = grip(W, f"{name}_g", root, scale=scale)

    # the forearm leaves the wrist going back and down, out of the shot
    fa_root, fa = BD.forearm(f"{name}_a", m["skin"], group="device", scale=scale)
    fa_root.parent = root
    fa_root.location = (0.010 * scale, DV.PHONE["d"] / 2 * scale + 0.030 * scale, -0.072 * scale)
    fa_root.rotation_euler = (math.radians(56), 0.0, math.radians(-6))

    return root, {"forearm": fa_root, "phone": ph_root, "screen": ph["screen"], **gp, **{f"p_{k}": v for k, v in ph.items()}}


def press_thumb(pivot, t0, *, swing=-0.492, dip=0.0042, hold=7, ease=4):
    """The press. The thumb the pass is already held with swings onto the block, dips against
    the glass, and comes back to the edge. `swing` is the angle that puts its pad on the button
    for a handset held in the standard grip; `dip` is how far the finger actually presses in."""
    for f, (a, y) in (
        (max(0, t0 - ease - 5), (0.0, 0.0)),
        (t0, (swing, 0.0)),
        (t0 + 3, (swing, -dip)),
        (t0 + 3 + hold, (swing, -dip)),
        (t0 + 3 + hold + 9, (0.0, 0.0)),
    ):
        pivot.rotation_euler = (0.0, a, 0.0)
        pivot.location = (pivot.location.x, pivot.location.y + 0.0, pivot.location.z)
        pivot.delta_location = (0.0, y, 0.0)
        pivot.keyframe_insert("rotation_euler", frame=f)
        pivot.keyframe_insert("delta_location", frame=f)
    CAM.ease_camera(pivot)
    return pivot


def track(W, key, obj):
    W.tracks[key] = obj
    return obj


# ==========================================================================
# ACT VIII · redemption, as six shots
# ==========================================================================
def shot_approach(W: B.World):
    """A · exterior Joe's, 7:42. A customer crosses the forecourt toward the door. No UI.

    lens      street 50 mm, f/4        height 1.58 m
    fore      the west pump island, dark, right of frame
    subject   a person walking the lane between the islands
    back      the store front and the lit doorway
    focus     the door, so the walker resolves as they arrive
    move      locked. The subject moves; the camera does not.
    """
    m = look(W)
    B.set_state(W, "morning")
    frames = 34
    fig, parts = BD.figure("ap_walker", (-3.4, 6.2, 0.0), m["cloth"], height=1.76, yaw=math.radians(4))
    for f, y in ((0, 6.2), (frames - 1, 15.4)):
        fig.location = (-3.4 + (y - 6.2) * 0.10, y, 0.0)
        fig.keyframe_insert("location", frame=f)
    for fc in _fc(fig):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    BD.gait(parts, frames, speed=1.05, height=1.76)
    track(W, "walker", B.empty("ap_t", (0, 0, 1.0)))
    W.tracks["walker"].parent = fig
    W.tracks["walker"].location = (0, 0, 1.0)

    cam = CAM.Cam("street", subject="a person walking the lane between the pump islands",
                  foreground="the west island, dark, right of frame", background="the store front and the lit doorway",
                  motivation="locked")
    cam.lock((-2.6, 2.4, 1.58), (-1.9, 19.0, 1.62), frames, focus=(-1.72, 19.75, 1.5), label="the lane")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["walker", "door_joes"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", cross=27, spec=cam.spec()),
                comp=dict(mist=0.30, glare=0.10))


def shot_threshold(W: B.World):
    """B · from inside the store, looking out. The customer crosses the threshold into the room.

    lens      street 50 mm, f/4        height 1.52 m
    fore      the end of the counter, dark, left of frame
    subject   the doorway and the person entering it
    back      the forecourt, blown two stops brighter than the room
    focus     the threshold itself
    move      locked. The event is the crossing; a moving camera would steal it.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning")
    frames = 30
    fig, parts = BD.figure("th_walker", (-1.9, 17.4, 0.0), m["cloth"], height=1.76, yaw=math.radians(9))
    for f, y in ((0, 17.4), (frames - 1, 21.1)):
        fig.location = (-1.9 + (y - 17.4) * 0.16, y, 0.0)
        fig.keyframe_insert("location", frame=f)
    for fc in _fc(fig):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    BD.gait(parts, frames, speed=1.0, height=1.76)
    track(W, "walker", B.empty("th_t", (0, 0, 1.0)))
    W.tracks["walker"].parent = fig
    W.tracks["walker"].location = (0, 0, 1.0)

    cam = CAM.Cam("street", subject="the doorway, and the person who comes through it",
                  foreground="the end of the counter, dark, left of frame", background="the forecourt, two stops brighter than the room",
                  motivation="locked", fstop=3.5)
    cam.lock((1.55, 23.6, 1.52), (-1.72, 19.2, 1.46), frames, focus=(-1.72, 19.75, 1.4), label="inside, at the counter's end")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["walker", "door_joes"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", cross=17, spec=cam.spec()),
                comp=dict(mist=0.16, glare=0.16))


def shot_counter(W: B.World):
    """C · the staff's own side. A hand comes up holding a phone; nobody reaches for it.

    lens      human 75 mm, f/2.8       height 1.55 m (standing behind the counter)
    fore      the till's shoulder, soft, right of frame
    subject   the customer's forearm and phone, raised across the counter
    back      the store's doorway, soft
    focus     the phone's face
    move      locked.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning")
    frames = 32
    cx, cy = JOES["counter_x"], JOES["counter_y"]

    # the customer: cropped by the counter, a shoulder and an arm, no whole mannequin
    torso, _ = BD.figure("ct_cust", (cx - 0.30, cy - 0.92, 0.0), m["cloth2"], height=1.74, yaw=math.radians(184), legs=False, arms=False)
    ph_root, ph = held_phone(W, "ct_phone", (cx - 0.34, cy - 0.66, 1.02), yaw=math.radians(186), tilt=math.radians(-17), screen="device-pass", first=0)
    for f, z, pitch in ((0, 0.86, -34), (10, 1.16, -18), (frames - 1, 1.21, -15)):
        ph_root.location = (cx - 0.34, cy - 0.66, z)
        ph_root.rotation_euler = (math.radians(pitch), 0.0, math.radians(186))
        ph_root.keyframe_insert("location", frame=f)
        ph_root.keyframe_insert("rotation_euler", frame=f)
    CAM.ease_camera(ph_root)
    track(W, "phone", B.empty("ct_pt", (0, 0, 0)))
    W.tracks["phone"].parent = ph["phone"]

    cam = CAM.Cam("human", subject="the customer's forearm and phone, raised across the counter",
                  foreground="the till's shoulder, soft, right of frame", background="the store's doorway, soft",
                  motivation="locked")
    cam.lock((cx + 0.42, cy + 0.92, 1.55), (cx - 0.30, cy - 0.70, 1.24), frames, focus=(cx - 0.34, cy - 0.66, 1.22), label="behind the counter")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["phone"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", spec=cam.spec()),
                comp=dict(mist=0.10, glare=0.14))


def shot_device(W: B.World):
    """D+E · the phone, close. Redeem now, one press, and the state that follows it.

    lens      device 95 mm, f/2.2      height 1.44 m
    fore      the counter's edge, out of focus along the bottom
    subject   the handset's face, three quarters of frame height
    back      the store's back bar, thrown far out of focus
    focus     the glass. It never changes; nothing else in the shot is sharp.
    move      locked. The only movement is a thumb and the seconds.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning")
    frames = 84
    cx, cy = JOES["counter_x"], JOES["counter_y"]
    px, py, pz = cx - 0.30, cy - 0.60, 1.26

    ph_root, ph = held_phone(W, "dv_phone", (px, py, pz), yaw=math.radians(182), tilt=math.radians(-14), screen="device-pass", first=0, strength=5.4)
    # the hand is alive: it does not sit on a tripod
    for f, dz, dp in ((0, 0.0, 0.0), (26, -0.004, 0.6), (34, 0.003, -0.4), (56, -0.002, 0.3), (frames - 1, 0.0, 0.0)):
        ph_root.location = (px, py, pz + dz)
        ph_root.rotation_euler = (math.radians(-14 + dp), 0.0, math.radians(182))
        ph_root.keyframe_insert("location", frame=f)
        ph_root.keyframe_insert("rotation_euler", frame=f)
    CAM.ease_camera(ph_root)
    # the press: the other thumb, once, at the same frame the baked UI presses
    press_thumb(ph["thumb_pivot"], 25)
    track(W, "phone", B.empty("dv_pt", (0, 0, 0)))
    W.tracks["phone"].parent = ph["phone"]

    cam = CAM.Cam("device", subject="the handset's face", foreground="the counter's edge, out of focus along the bottom",
                  background="the front glass and the bright forecourt, far out of focus", motivation="locked")
    cam.lock((px - 0.014, py + 0.715, pz + 0.082), (px, py - 0.004, pz), frames, focus=(px, py + 0.004, pz), label="on the glass")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["phone"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", press=26, redeemed=46, spec=cam.spec()),
                comp=dict(mist=0.06, glare=0.20))


def shot_coffee(W: B.World):
    """F · the reward, as an object. A large coffee crosses the counter to the customer.

    lens      human 85 mm, f/2.8       height 1.16 m — the height of the counter, not of a person
    fore      the counter's laminate, running away under the cup
    subject   the cup, moving left to right across the frame
    back      the brewer and the shelves, soft
    focus     the cup, followed by a small focus pull as it comes forward
    move      locked; the cup does the moving.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning")
    frames = 30
    cx, cy, tz = JOES["counter_x"], JOES["counter_y"], 1.00
    cup, _ = DV.coffee("cf_cup", (cx + 0.62, cy + 0.20, tz), m["paper"], m["lid"], m["board"])
    for f, x, y in ((0, cx + 0.62, cy + 0.20), (frames - 1, cx - 0.34, cy - 0.24)):
        cup.location = (x, y, tz)
        cup.keyframe_insert("location", frame=f)
    CAM.ease_camera(cup.obj if hasattr(cup, "obj") else cup)
    # the staff's hand, guiding it, and leaving
    hd, _ = BD.hand("cf_hand", m["skin"], group="device", closed=0.42)
    hd.parent = cup
    hd.location = (0.055, 0.075, 0.052)
    hd.rotation_euler = (math.radians(112), 0.0, math.radians(-46))
    for f, o in ((0, 0.0), (18, 0.0), (frames - 1, 0.30)):
        hd.location = (0.055, 0.075 + o, 0.052 + o * 0.5)
        hd.keyframe_insert("location", frame=f)
    track(W, "cup", B.empty("cf_t", (0, 0, 0.10)))
    W.tracks["cup"].parent = cup

    cam = CAM.Cam("human", lens=85.0, subject="the cup crossing the counter",
                  foreground="the counter's laminate, running away under the cup", background="the brewer and the shelves, soft",
                  motivation="locked")
    cam.key(0, (cx - 0.55, cy - 1.02, 1.16), (cx + 0.30, cy + 0.02, tz + 0.09), focus=(cx + 0.55, cy + 0.16, tz + 0.09), label="the cup is set down")
    cam.key(frames - 1, (cx - 0.55, cy - 1.02, 1.16), (cx + 0.30, cy + 0.02, tz + 0.09), focus=(cx - 0.30, cy - 0.20, tz + 0.09), label="focus follows it forward")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["cup"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", spec=cam.spec()),
                comp=dict(mist=0.06, glare=0.18))


def _fc(obj):
    ad = obj.animation_data
    if not ad or not ad.action:
        return []
    return CAM._fcurves(ad.action)
