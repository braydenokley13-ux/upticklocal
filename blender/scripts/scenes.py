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
def skin_mat(name: str):
    """Skin, not orange plastic.

    A flat diffuse tube at 0.6 roughness under a warm practical reads as a moulded toy, and the
    hand is the second-largest object in the redemption. So: a little subsurface so light carries
    through the finger edges, a low specular so the practicals do not put a hard rim on every
    tube, and a fine noise on the roughness so the highlight breaks up the way skin does."""
    if name in B._MATS:
        return B._MATS[name]
    m, p, nt = B._new_mat(name)
    # Value, not hue, is what was making this read as plastic. At #9d8272 under a warm practical
    # the hand came back brighter than the white screen it is holding, and the eye reads the
    # brightest thing in a macro frame as the subject: the shot was about a hand. Two stops of
    # value down puts the phone back in charge, and the subsurface comes down with it because at
    # 0.22 the red bleed was lighting the finger edges from inside like a gummy sweet.
    p.inputs["Base Color"].default_value = B.srgb("#7a6355")
    p.inputs["Roughness"].default_value = 0.74
    p.inputs["Specular IOR Level"].default_value = 0.11
    p.inputs["Subsurface Weight"].default_value = 0.15
    try:
        p.inputs["Subsurface Radius"].default_value = (0.016, 0.007, 0.004)
        p.inputs["Subsurface Scale"].default_value = 0.012
    except KeyError:
        pass
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 220.0
    noise.inputs["Detail"].default_value = 4.0
    rmp = nt.nodes.new("ShaderNodeMapRange")
    rmp.inputs["To Min"].default_value = 0.62
    rmp.inputs["To Max"].default_value = 0.86
    nt.links.new(noise.outputs["Fac"], rmp.inputs["Value"])
    nt.links.new(rmp.outputs["Result"], p.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.10
    bump.inputs["Distance"].default_value = 0.0008
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    B._MATS[name] = m
    return m


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
        skin=skin_mat("dv_skin"),
        cloth=B.mat_surface("dv_cloth", "#3d4448", rough=0.80),
        # NOT #6c6156. That was (108,97,86); the skin material is (122,99,85) — the same colour —
        # so a figure wearing it read as a nude mannequin rather than as a person in a coat, which
        # is exactly what it looked like on the `rise` plate at 1:1. Two things had to change, and
        # the first attempt only fixed one of them. Hue: a *warm* mid-tone in direct morning sun
        # lands on skin whatever value it starts at, so every garment here is cool. Value: at
        # 0.25 albedo the sun put the legs at 164/255 against 190 paving, which is a figure with
        # no silhouette. The response is steeply non-linear — dv_cloth_dark renders at 60 and a
        # value four times its albedo renders at 159 — so this is solved from the numbers rather
        # than by eye: dark enough to hold a silhouette in full sun, a different hue from
        # dv_cloth_dark, so two people in one frame still read as two people.
        cloth2=B.mat_surface("dv_cloth2", "#2d3531", rough=0.80),
        # Front-lit at 24 degrees of sun, dv_cloth comes back at 64% of the pump beside it: a lit
        # grey volume, which is the band where this figure system stops reading as a person and
        # starts reading as a chess piece. morning_door works because its figure sits at 37 against
        # a 44 door -- darker than what is behind it, so light does the work. This is that value,
        # for the shots the sun is in front of.
        cloth_dark=B.mat_surface("dv_cloth_dark", "#1c2124", rough=0.85),
        wood=B.mat_surface("dv_wood", "#6b5744", rough=0.46),
        rubber=B.mat_surface("dv_rubber", "#1c1f21", rough=0.86),
    )
    W._look = m
    return m


# --------------------------------------------------------------------------
# Joe's counter, dressed
# --------------------------------------------------------------------------
JOES = dict(counter_x=3.99, counter_y=22.10, top_z=0.95, door=(-1.72, 20.30), back_y=27.15)


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

    # a warm strip over the back bar: at f/2.8 the deep background of the counter shots is
    # this light, not the wall behind it
    bt = bpy.data.lights.new("jd_bar_prac", "AREA")
    bt.shape = "RECTANGLE"
    bt.size, bt.size_y = 4.4, 0.14
    bt.energy = 120.0
    bt.color = B.srgb(B.P.warm)[:3]
    bo = bpy.data.objects.new("jd_bar_prac", bt)
    bo.location = (cx - 0.2, 26.30, 2.05)
    bo.rotation_euler = (math.radians(-64), 0, 0)
    B._link(bo, g)

    # the counter's own top, a till, and a mat in front of it
    B.box("jd_counter_top", (3.5, 0.78, 0.045), (cx, cy, tz + 0.02), m["top"], bevel=0.006, group=g)
    B.box("jd_till_base", (0.40, 0.34, 0.10), (cx - 1.05, cy + 0.06, tz + 0.09), m["alu_dark"], bevel=0.008, group=g)
    B.box("jd_till_screen", (0.34, 0.03, 0.24), (cx - 1.05, cy + 0.16, tz + 0.26), m["lid"], bevel=0.004, group=g, rot=(math.radians(-14), 0, 0))
    # the change mat sits to the till side, not under the lens: at 75 mm it was a black void
    # across the bottom of the counter shot, and the shot's foreground is meant to be laminate
    B.box("jd_mat", (0.86, 0.30, 0.010), (cx + 0.66, cy - 0.44, tz + 0.045), m["rubber"], bevel=0.003, group=g)
    B.box("jd_stand", (0.13, 0.09, 0.20), (cx + 1.05, cy + 0.08, tz + 0.14), m["alu_dark"], bevel=0.006, group=g)
    fl = bpy.data.lights.new("jd_counter_fill", "AREA")
    fl.shape = "RECTANGLE"
    fl.size, fl.size_y = 3.2, 1.2
    fl.energy = 26.0
    fl.color = B.srgb(B.P.warm)[:3]
    fo = bpy.data.objects.new("jd_counter_fill", fl)
    fo.location = (cx - 0.1, cy - 0.55, 2.30)
    fo.rotation_euler = (0.0, 0.0, 0.0)
    B._link(fo, g)

    # Joe's own unit, live behind the counter: a practical, and the reason the pass exists
    B.set_screen(W, "joes", 1.0, image=os.path.join(HERE, "..", "assets", "screens", "joes-own.png"))

    # two pendants over the customer's side of the room: at f/2.2 these are the only shapes in
    # the background of the device shot, so they are what stops it being a grey mush
    for i, x in enumerate((cx - 2.6, cx - 0.4)):
        sh = B.cylinder(f"jd_pend{i}", 0.085, 0.14, (x, cy - 1.9, 2.42), m["alu_dark"], group=g)
        gl = B.cylinder(f"jd_pend_gl{i}", 0.072, 0.02, (x, cy - 1.9, 2.42), B.mat_emissive(f"jd_pend_em{i}", B.P.lamp, 26.0), group=g)
        pl = bpy.data.lights.new(f"jd_pend_l{i}", "POINT")
        pl.energy, pl.shadow_soft_size = 34.0, 0.07
        pl.color = B.srgb(B.P.lamp)[:3]
        po = bpy.data.objects.new(f"jd_pend_l{i}", pl)
        po.location = (x, cy - 1.9, 2.36)
        B._link(po, g)

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
    # the panel is a lit object in the room, not a dark slab: this is the whole point of the café
    B.set_screen(W, "cafe", 1.0, image=os.path.join(HERE, "..", "assets", "screens", "cafe-joes.png"))


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

    # Four fingers over the near edge, longest in the middle, tips just onto the glass.
    # The pitch is a little under a finger's width so they touch: separated tubes read as four
    # sausages, and at 95 mm the hand is the second-largest thing in the frame. Each tip carries
    # a nail, because the pad is against the glass and the nail is the side facing the lens.
    # Four fingers, only two of which really crest the glass: an even rank of four reads as a
    # rank of four, and a hand does not do that. The index rides the edge, the middle comes
    # furthest over, the ring follows it, the little finger stays on the rim.
    # The fingers stay BEHIND the glass. They used to crest the near edge and rest their pads on
    # the front, which is what a hand does when it is presenting a phone to a camera and not what
    # it does when it is holding one: a one-handed grip wraps the back and puts only the thumb on
    # the face. Cresting also put four fingertips broadside to the lens, and four procedural tubes
    # cannot survive that -- they are separate meshes, so Cycles renders their intersections as
    # hard V-grooves where skin would fold, and no amount of radius or material tuning removes a
    # groove. Ending the wrap at the side leaves one soft edge along the handset's silhouette
    # instead of four pads, and the shot stops asking the geometry a question it cannot answer.
    for i, (z, reach, r) in enumerate(((0.0300, -0.0026, 0.0092), (0.0142, 0.0034, 0.0098), (-0.0018, 0.0022, 0.0094), (-0.0170, -0.0032, 0.0080))):
        z *= s
        reach *= s
        rr = r * s
        path = [
            (0.014 * s, hd + 0.030 * s, z - 0.004 * s),
            (-0.014 * s, hd + 0.028 * s, z - 0.002 * s),
            (-hw - 0.006 * s, hd + 0.016 * s, z),
            (-hw - 0.009 * s, hd * 0.15 + reach, z + 0.002 * s),
            (-hw - 0.007 * s, -hd * 0.30 + reach, z + 0.003 * s),
        ]
        fg = BD.tube(f"{name}_f{i}", path, [rr * 1.21, rr * 0.94, rr * 1.15, rr * 0.96, rr * 0.86], m["skin"], group="device")
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
    th = BD.tube(f"{name}_thumb", path, [0.0118 * s, 0.0112 * s, 0.0102 * s, 0.0092 * s, 0.0079 * s], m["skin"], group="device")
    th.parent = pivot
    parts["thumb_pivot"] = pivot
    parts["thumb"] = th
    return parts


def cup_grip(W, name, parent, scale=1.0):
    """A hand carrying a cup, built in the cup's own frame.

    Same principle as `grip`: a posed rig reads as a mitt, so each finger is a swept tube whose
    path starts behind the cup, crosses its shoulder and ends with the pad against the sleeve.
    The hand is on the far side, so the cup occludes most of it and what is left is a wrist and
    four knuckles — which is all a hand needs to be at this distance."""
    m = look(W)
    s = scale
    parts = {}
    root = B.empty(f"{name}_root", (0, 0, 0), group="device")
    root.parent = parent
    palm = BD.ellipsoid(f"{name}_palm", (0.033 * s, 0.021 * s, 0.046 * s), m["skin"], group="device")
    palm.location = (0.012 * s, 0.084 * s, 0.082 * s)
    palm.parent = root
    parts["palm"] = palm
    for i, (z, r) in enumerate(((0.104, 0.0079), (0.086, 0.0083), (0.068, 0.0080), (0.050, 0.0071))):
        path = [(0.006 * s, 0.086 * s, z * s), (0.028 * s, 0.074 * s, z * s), (0.046 * s, 0.052 * s, (z - 0.002) * s),
                (0.052 * s, 0.022 * s, (z - 0.003) * s), (0.046 * s, 0.000 * s, (z - 0.004) * s)]
        fg = BD.tube(f"{name}_f{i}", path, [r * 1.18 * s, r * 1.10 * s, r * s, r * 0.92 * s, r * 0.76 * s], m["skin"], group="device")
        fg.parent = root
        parts[f"f{i}"] = fg
    th = BD.tube(f"{name}_thumb", [(0.008 * s, 0.082 * s, 0.062 * s), (-0.024 * s, 0.070 * s, 0.072 * s),
                                   (-0.044 * s, 0.044 * s, 0.080 * s), (-0.048 * s, 0.016 * s, 0.084 * s)],
                 [0.0122 * s, 0.0116 * s, 0.0104 * s, 0.0086 * s], m["skin"], group="device")
    th.parent = root
    parts["thumb"] = th
    fa_root, _ = BD.forearm(f"{name}_a", m["skin"], group="device", scale=scale)
    fa_root.parent = root
    fa_root.location = (0.022 * s, 0.104 * s, 0.062 * s)
    fa_root.rotation_euler = (math.radians(116), 0.0, math.radians(10))
    parts["forearm"] = fa_root
    return root, parts


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
    # the sleeve runs most of the way to the wrist: a bare tube of skin from wrist to elbow
    # reads as a prosthetic, and at 75 mm the forearm is half the frame
    cuff = BD.tube(f"{name}_cuff", [(0.0, 0.0, -0.334 * scale), (0.0, 0.0, -0.132 * scale)],
                   [0.061 * scale, 0.0485 * scale], m["cloth"], group="device")
    cuff.parent = fa_root

    return root, {"forearm": fa_root, "phone": ph_root, "screen": ph["screen"], **gp, **{f"p_{k}": v for k, v in ph.items()}}


def press_thumb(pivot, t0, *, swing=-0.492, dip=0.0042, hold=7, ease=4, park=0.30):
    """The press. The thumb the pass is already held with swings onto the block, dips against
    the glass, and comes back to the edge. `swing` is the angle that puts its pad on the button
    for a handset held in the standard grip; `dip` is how far the finger actually presses in.

    `park` is where the thumb lives when it is not pressing: on the phone's rim, not lying
    across the glass. A thumb parked on the face covers a quarter of the screen and makes the
    redeemed state look obstructed, and after the tap the point is that the tap is over."""
    for f, (a, y) in (
        (max(0, t0 - ease - 5), (park, 0.0)),
        (t0, (swing, 0.0)),
        (t0 + 3, (swing, -dip)),
        (t0 + 3 + hold, (swing, -dip)),
        (t0 + 3 + hold + 9, (park, 0.0)),
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


def track_screen(W, key, parts):
    """Register a held phone's four screen corners as a tracked quad.

    The crossing out of the physical world is a scale into the glass we have been looking at,
    so Remotion needs the screen's actual homography, not a centre point."""
    for c in ("tl", "tr", "br", "bl"):
        W.tracks[f"{key}_{c}"] = parts[f"p_{c}"]


# ==========================================================================
# ACT VIII · redemption, as six shots
# ==========================================================================
def shot_approach(W: B.World):
    """A · exterior Joe's, 7:42. A customer crosses the forecourt toward the door. No UI.

    lens      street 50 mm, f/2.8      height 1.34 m
    fore      the customer themself, a metre from the lens and far outside focus: a dark mass
              that walks out of the frame's foreground and into its subject
    subject   the doorway they are walking to
    back      the store front and the canopy over it
    focus     the door, 14.5 m out. Nothing near the lens is sharp and nothing needs to be.
    start/end f/2.8 throughout
    move      locked. The subject moves; the camera does not.

    A locked wide of an empty forecourt with a figure in the middle of it is a rendering of a
    petrol station. The same camera with the person a metre in front of it is a shot: they
    resolve out of their own blur as they arrive, and the doorway is what the frame is for.
    """
    m = look(W)
    B.set_state(W, "morning")
    frames = 34
    fig, parts = BD.figure("ap_walker", (-1.55, 6.55, 0.0), m["cloth_dark"], height=1.78, yaw=math.radians(2))
    for f, y in ((0, 6.55), (frames - 1, 17.20)):
        fig.location = (-1.55 - (y - 6.55) * 0.029, y, 0.0)
        fig.keyframe_insert("location", frame=f)
    for fc in _fc(fig):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    BD.gait(parts, frames, speed=1.05, height=1.78)
    track(W, "walker", B.empty("ap_t", (0, 0, 1.0)))
    W.tracks["walker"].parent = fig
    W.tracks["walker"].location = (0, 0, 1.0)

    cam = CAM.Cam("street", fstop=2.8, subject="the doorway the customer is walking to",
                  foreground="the customer themself, a metre from the lens and far outside focus",
                  background="the store front and the canopy over it",
                  motivation="locked")
    cam.lock((-1.15, 5.40, 1.34), (-1.80, 19.90, 1.52), frames, focus=(-1.72, 20.10, 1.45), label="in the lane, behind them")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["walker", "door_joes"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", cross=27, spec=cam.spec()),
                comp=dict(mist=0.30, glare=0.10))


def shot_threshold(W: B.World):
    """B · inside the store, down the aisle opposite the door. The morning walks in.

    lens      block 40 mm, f/4.0       height 1.52 m (standing in the aisle opposite the door)
    fore      the two shelf runs the aisle passes between, dark, closing left and right
    subject   the doorway at the end of the aisle, and the figure that comes through it
    back      the forecourt, two stops brighter than the room it lets into
    focus     the threshold, 4.8 m out; the shelf runs fall off toward the lens
    start/end f/4.0 throughout — the stop never moves
    move      locked. The event is the crossing; a moving camera would steal it.

    The room is lit two thirds down so the doorway is the brightest thing in it, and the
    figure is read against that light: a body in a doorway, not a face. The near leaf
    swings ahead of them, so the door is a thing that moves rather than a hole in a wall.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning", exposure=-2.55, interior_w=980)
    frames = 40

    # the near leaf, hinged on its own stile, swings in ahead of the person
    leaf = B.empty("th_leaf", (-0.52, 20.30, 0.0))
    bpy.context.view_layer.update()
    for n in ("lot_joes_doorglass1", "lot_joes_doorframe1", "lot_joes_doorbar1"):
        o = bpy.data.objects.get(n)
        if o is not None:
            o.parent = leaf
            o.matrix_parent_inverse = leaf.matrix_world.inverted()
    for f, a in ((0, 0.0), (7, -3.0), (19, -62.0), (32, -64.0), (frames - 1, -48.0)):
        leaf.rotation_euler = (0.0, 0.0, math.radians(a))
        leaf.keyframe_insert("rotation_euler", frame=f)

    path = ((0, -2.10, 19.20), (18, -1.52, 20.42), (frames - 1, -0.44, 21.62))
    fig, parts = BD.figure("th_walker", (path[0][1], path[0][2], 0.0), m["cloth"], height=1.78, yaw=math.radians(26))
    for f, x, y in path:
        fig.location = (x, y, 0.0)
        fig.keyframe_insert("location", frame=f)
    for f, yaw in ((0, 26.0), (18, 30.0), (frames - 1, 46.0)):
        fig.rotation_euler = (0.0, 0.0, math.radians(yaw))
        fig.keyframe_insert("rotation_euler", frame=f)
    for fc in _fc(fig):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    BD.gait(parts, frames, speed=1.05, height=1.78)
    track(W, "walker", B.empty("th_t", (0, 0, 1.0)))
    W.tracks["walker"].parent = fig
    W.tracks["walker"].location = (0, 0, 1.0)

    cam = CAM.Cam("block", subject="the doorway, and the person who comes through it",
                  foreground="the two shelf runs the aisle passes between, dark, closing left and right",
                  background="the forecourt, two stops brighter than the room",
                  motivation="locked", fstop=4.0)
    cam.lock((-1.18, 25.20, 1.52), (-1.72, 20.45, 1.02), frames, focus=(-1.60, 20.70, 1.10), label="in the aisle opposite the door")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["walker", "door_joes"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", cross=19, spec=cam.spec()),
                comp=dict(mist=0.20, glare=0.20))


def shot_counter(W: B.World):
    """C · the staff's own side. A hand comes up holding a phone; nobody reaches for it.

    lens      human 75 mm, f/2.8       height 1.55 m (standing behind the counter)
    fore      the counter's own laminate, running out of the bottom of frame
    subject   the customer's forearm and phone, raised across the counter
    back      the store's doorway, soft
    focus     the phone's face
    move      locked.

    The customer is cropped: a shoulder at the frame's edge and the arm that comes out of it.
    Nothing here is a whole figure standing in the middle of a shot.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning")
    frames = 32
    cx, cy = JOES["counter_x"], JOES["counter_y"]

    # the customer: a real body, placed so the frame keeps a shoulder and loses the rest
    # placed on the axis the phone rig's own forearm runs down, so the arm belongs to the body
    torso, tp = BD.figure("ct_cust", (cx - 0.37, cy - 1.08, 0.0), m["cloth"], height=1.76, yaw=math.radians(160))
    tp["arm_l"].hide_render = True  # the reaching arm is the phone rig's own forearm, not a second one
    # a second customer, further back, waiting: the store is not empty
    q, qp = BD.figure("ct_queue", (cx - 1.04, cy - 1.75, 0.0), m["cloth"], height=1.71, yaw=math.radians(172))
    BD.gait(qp, frames, speed=0.14, height=1.71)
    ph_root, ph = held_phone(W, "ct_phone", (cx - 0.52, cy - 0.62, 1.02), yaw=math.radians(198), tilt=math.radians(-17), screen="device-pass", first=0, strength=3.4)
    for f, z, pitch in ((0, 0.90, -36), (11, 1.19, -20), (frames - 1, 1.23, -17)):
        ph_root.location = (cx - 0.52, cy - 0.62, z)
        ph_root.rotation_euler = (math.radians(pitch), 0.0, math.radians(198))
        ph_root.keyframe_insert("location", frame=f)
        ph_root.keyframe_insert("rotation_euler", frame=f)
    CAM.ease_camera(ph_root)
    track(W, "phone", B.empty("ct_pt", (0, 0, 0)))
    W.tracks["phone"].parent = ph["phone"]
    track_screen(W, "glass", ph)

    cam = CAM.Cam("human", subject="the customer's forearm and phone, raised across the counter",
                  foreground="the counter's own laminate, running out of the bottom of frame", background="the store's doorway, soft",
                  motivation="locked")
    cam.lock((cx + 0.46, cy + 0.86, 1.58), (cx - 0.46, cy - 0.50, 1.22), frames, focus=(cx - 0.52, cy - 0.62, 1.21), label="behind the counter, where the till is worked")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["phone", "glass_tl", "glass_tr", "glass_br", "glass_bl"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", spec=cam.spec()),
                comp=dict(mist=0.10, glare=0.14))


def shot_device(W: B.World):
    """D+E · the phone, close. Redeem now, one press, and the state that follows it.

    Reframed after proof cut 2. The 95 mm original stood 0.715 m off the glass with the handset
    square to the lens, which made a procedural hand the second-largest object in the frame and
    invited exactly the anatomical inspection it cannot survive. The beat is unchanged -- one
    customer press, no interstitial, the live state -- but the hierarchy is not: the screen is the
    subject, the person is context, the hand is evidence that someone is holding it.

    85 mm from 0.80 m with the handset raked 32 degrees off the lens. The rake is the whole trick:
    it collapses the four fingers into one overlapping dark mass at the phone's edge instead of a
    rank of four presented broadside. Swept on the proxy lane at 118/132/148/162/176 -- below 148
    the grip swings back toward the lens and reads worse; above it the fingers separate again and
    the frame drifts back toward the original mistake.

    lens      device 85 mm, f/2.0      height 1.44 m
    fore      the counter's edge, out of focus along the bottom
    subject   the handset's face, raked, lit chiefly by its own screen
    back      the store's back bar, warm and thrown far out of focus
    focus     the glass. It never changes; nothing else in the shot is sharp.
    move      locked. The only movement is a thumb and the seconds.
    """
    return _device_variant(W, lens=85.0, dist=0.80, yaw=148.0, rise=0.06, fstop=2.0,
                           subject="the handset's face, raked, its own screen the key",
                           fore="the counter's edge, dark and close along the bottom",
                           back="the store's back bar, warm and far out of focus",
                           motive="locked; the grip is raked so the hand reads as one dark mass")


def _device_variant(W: B.World, *, lens, dist, yaw, rise, fstop, subject, fore, back, motive, frames=84):
    """The redemption close-up, parameterised so three genuinely different solutions to the same
    beat can be cut against each other on the proxy lane instead of argued about.

    The beat never changes: Redeem now, one customer press, the live state. What changes is where
    the camera stands and how much of a hand it asks to survive inspection. The 95 mm original
    made a procedural hand the second-largest object in frame, which is a hierarchy mistake, not
    a modelling one: the screen is the subject, the person is context, and finger anatomy is
    tertiary. If a joint can be inspected, the lens is too long.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning")
    cx, cy = JOES["counter_x"], JOES["counter_y"]
    px, py, pz = cx - 0.30, cy - 0.60, 1.26

    ph_root, ph = held_phone(W, "dv_phone", (px, py, pz), yaw=math.radians(yaw), tilt=math.radians(-14),
                             screen="device-pass", first=0, strength=5.4)
    # the hand is alive: it does not sit on a tripod. NOTE the yaw is re-stated on every key --
    # the original hard-coded 182 here, which silently overrode the yaw argument above.
    for f, dz, dp in ((0, 0.0, 0.0), (26, -0.004, 0.6), (34, 0.003, -0.4), (56, -0.002, 0.3), (frames - 1, 0.0, 0.0)):
        ph_root.location = (px, py, pz + dz)
        ph_root.rotation_euler = (math.radians(-14 + dp), 0.0, math.radians(yaw))
        ph_root.keyframe_insert("location", frame=f)
        ph_root.keyframe_insert("rotation_euler", frame=f)
    CAM.ease_camera(ph_root)
    press_thumb(ph["thumb_pivot"], 25)
    track(W, "phone", B.empty("dv_pt", (0, 0, 0)))
    W.tracks["phone"].parent = ph["phone"]
    track_screen(W, "glass", ph)

    cam = CAM.Cam("device", lens=lens, fstop=fstop, subject=subject, foreground=fore, background=back, motivation=motive)
    cam.lock((px - 0.014, py + dist, pz + rise), (px, py - 0.004, pz), frames, focus=(px, py + 0.004, pz), label="on the glass")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["phone", "glass_tl", "glass_tr", "glass_br", "glass_bl"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", press=26, redeemed=46, spec=cam.spec()),
                comp=dict(mist=0.06, glare=0.20))


def shot_coffee(W: B.World):
    """F · the reward, as an object. A large coffee crosses the counter to the customer.

    lens      human 65 mm, f/2.8       height 1.17 m — just above the counter, not the height of a person
    fore      the counter's laminate, running away under the cup
    subject   the cup, entering from the right and settling in front of the customer
    back      the brewer and the back bar, soft
    focus     the cup, with a small pull as it comes forward
    move      locked; the cup does the moving.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning")
    frames = 30
    cx, cy, tz = JOES["counter_x"], JOES["counter_y"], 1.00
    x0, y0 = cx + 0.44, cy + 0.24
    x1, y1 = cx - 0.21, cy - 0.18
    cup, _ = DV.coffee("cf_cup", (x0, y0, tz), m["paper"], m["lid"], m["board"])
    for f, x, y in ((0, x0, y0), (frames - 1, x1, y1)):
        cup.location = (x, y, tz)
        cup.keyframe_insert("location", frame=f)
    CAM.ease_camera(cup)
    # the staff's hand: it carries the cup in, sets it down and goes. By the time the cup
    # settles the hand is out of frame, so the last thing we hold on is the drink itself.
    hd, _ = cup_grip(W, "cf_hand", cup)
    for f, o in ((0, 0.0), (5, 0.0), (18, 1.0), (frames - 1, 1.0)):
        hd.location = (0.175 * o, 0.680 * o, 0.075 * o)
        hd.rotation_euler = (math.radians(14 * o), 0.0, 0.0)
        hd.keyframe_insert("location", frame=f)
        hd.keyframe_insert("rotation_euler", frame=f)
    CAM.ease_camera(hd)
    track(W, "cup", B.empty("cf_t", (0, 0, 0.10)))
    W.tracks["cup"].parent = cup

    cam = CAM.Cam("human", lens=65.0, subject="the cup crossing the counter",
                  foreground="the counter's laminate, running away under the cup", background="the brewer and the back bar, soft",
                  motivation="locked")
    # the eye is on the line from where the cup lands to the brewer, so the thing behind the
    # cup is the machine that made it and the bar's own warm strip, not the back wall
    eye = (cx - 0.46, cy - 1.18, 1.17)
    aim = (cx - 0.16, cy - 0.10, tz + 0.06)
    cam.key(0, eye, aim, focus=(x0, y0, tz + 0.07), label="the cup comes in from the right")
    cam.key(frames - 1, eye, aim, focus=(x1, y1, tz + 0.07), label="focus follows it forward")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["cup"], people=None,
                meta=dict(state="morning", clock="Friday · 7:42 AM", spec=cam.spec()),
                comp=dict(mist=0.06, glare=0.18))


def _fc(obj):
    ad = obj.animation_data
    if not ad or not ad.action:
        return []
    return CAM._fcurves(ad.action)


# ==========================================================================
# ACT VI · the café: a physical panel, and the crossing into the relationship
# ==========================================================================
CAFE = dict(unit=(21.28, 10.68, 1.19), counter=(19.93, 10.80), door=(23.97, 8.25))


def shot_cafe(W: B.World):
    """The café at 7:04, and the Uptick screen on the end of its counter.

    lens      human 75 mm, f/2.8      height 1.50 m — someone standing where you queue
    fore      the corner of a table, soft, left of frame
    subject   the panel on the counter, with Joe's morning on it
    back      the back bar and the light off the front windows
    focus     the panel
    move      locked.
    """
    m = look(W)
    dress_cafe(W)
    B.set_state(W, "morning")
    frames = 26
    ux, uy, uz = CAFE["unit"]
    fig, parts = BD.figure("cf_stand", (20.90, 11.62, 0.0), m["cloth2"], height=1.74, yaw=math.radians(196))
    BD.gait(parts, frames, speed=0.20, height=1.74)
    q, qp = BD.figure("cf_queue", (22.05, 9.05, 0.0), m["cloth"], height=1.70, yaw=math.radians(122))
    BD.gait(qp, frames, speed=0.12, height=1.70)
    track(W, "screen_c", B.empty("cf_sc", (ux, uy, uz)))

    cam = CAM.Cam("human", subject="the Uptick panel on the end of the café's counter",
                  foreground="the corner of a table, soft, left of frame", background="the back bar, and the light off the front windows",
                  motivation="locked")
    cam.lock((23.15, 8.95, 1.50), (ux - 0.10, uy + 0.02, uz), frames, focus=(ux, uy, uz), label="where you queue")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["screen_c", "screen_cafe_tl", "screen_cafe_tr", "screen_cafe_br", "screen_cafe_bl"], people=None,
                meta=dict(state="morning", clock="Friday · 7:04 AM", spec=cam.spec()),
                comp=dict(mist=0.14, glare=0.16))


def shot_scan(W: B.World):
    """The crossing from the street into the relationship, authored rather than dissolved.

    A stranger holds their own phone up to the panel. We stand at their shoulder, so the glass
    is raked hard away from us and the café's screen reads past it. The code is taken; the phone
    comes down and levels toward its owner, which turns the glass square to us, and the offer is
    on it. Remotion takes the frame from here — by then the handset is the frame, so the crossing
    into the relationship is a scale into a screen we have been looking at, not a fade.

    lens      human 75 mm → device 95 mm, f/2.4     height 1.48 m
    fore      the back of the customer's phone, low in frame
    subject   the panel, then the phone
    back      the café's front windows, blown
    focus     the panel, pulled to the phone and landed by the turn, not still travelling
              through it: at f/2.4 and 90 mm nothing between the two is sharp
    move      the camera stands where the owner stands and does not travel; it reframes with the
              handset it is following, and the lens goes long as the handset comes back to them.
    """
    m = look(W)
    dress_cafe(W)
    B.set_state(W, "morning")
    frames = 46
    ux, uy, uz = CAFE["unit"]
    eye = (22.80, 9.10, 1.48)
    # far enough from the lens to be a whole handset in a landscape frame, and off the
    # camera-to-panel line so it does not cover the thing it is reading
    px, py, pz = 22.05, 9.68, 1.27

    # the phone starts with its back to us, aimed at the panel; it turns over and comes back to its owner
    ph_root, ph = held_phone(W, "sc_phone", (px, py, pz), yaw=math.radians(-42), tilt=math.radians(-8),
                             screen="device-offer", first=0, strength=2.1)
    # yaw 8° rakes the glass ~44° off the lens; yaw 52° turns it square to us at the end
    for f, yaw, tilt, loc in ((0, 8, -6, (px, py, pz - 0.015)), (16, 8, -6, (px, py, pz)),
                              (30, 30, -13, (px + 0.06, py - 0.04, pz + 0.02)), (frames - 1, 52, -20, (px + 0.11, py - 0.08, pz + 0.04))):
        ph_root.location = loc
        ph_root.rotation_euler = (math.radians(tilt), 0.0, math.radians(yaw))
        ph_root.keyframe_insert("location", frame=f)
        ph_root.keyframe_insert("rotation_euler", frame=f)
    CAM.ease_camera(ph_root)
    track(W, "phone", B.empty("sc_pt", (0, 0, 0)))
    W.tracks["phone"].parent = ph["phone"]
    track_screen(W, "glass", ph)
    track(W, "screen_c", B.empty("sc_sc", (ux, uy, uz)))

    cam = CAM.Cam("human", lens=75.0, fstop=2.4, subject="the panel, and then the phone that takes it",
                  foreground="the back of the customer's phone, low left", background="the café's front windows, blown",
                  motivation="we follow the offer from the panel that published it to the handset that received it")
    cam.key(0, eye, (ux - 0.02, uy, uz + 0.02), lens=75.0, focus=(ux, uy, uz), label="on the panel")
    cam.key(16, eye, (ux - 0.02, uy, uz + 0.02), lens=75.0, focus=(ux, uy, uz), label="hold; the code is taken")
    cam.key(30, eye, (px + 0.05, py - 0.03, pz + 0.02), lens=88.0, focus=(px + 0.06, py - 0.04, pz + 0.02), label="the pull lands on the handset")
    cam.key(frames - 1, eye, (px + 0.11, py - 0.08, pz + 0.04), lens=95.0, focus=(px + 0.11, py - 0.08, pz + 0.04), label="the handset is the frame")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["phone", "screen_c", "glass_tl", "glass_tr", "glass_br", "glass_bl"], people=None,
                meta=dict(state="morning", clock="Friday · 7:04 AM", scan=18, turn=22, spec=cam.spec()),
                comp=dict(mist=0.12, glare=0.18))


# ==========================================================================
# ACTS IX–XI · the morning builds, as physical life
# ==========================================================================
def _crowd(W, name, routes, frames, mats, heights=None):
    out = []
    for i, (pts, speed, delay, yaw) in enumerate(routes):
        h = (heights or [1.74, 1.68, 1.80, 1.72, 1.76])[i % 5]
        fig, parts = BD.figure(f"{name}{i}", pts[0] + (0.0,), mats[i % len(mats)], height=h, yaw=yaw)
        total = 0.0
        legs = [((pts[k + 1][0] - pts[k][0]) ** 2 + (pts[k + 1][1] - pts[k][1]) ** 2) ** 0.5 for k in range(len(pts) - 1)]
        for k, p in enumerate(pts):
            f = delay + int(total / max(0.01, speed) * 24)
            fig.location = (p[0], p[1], 0.0)
            fig.keyframe_insert("location", frame=max(0, min(frames - 1, f)))
            if k < len(legs):
                total += legs[k]
        for fc in _fc(fig):
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
        BD.gait(parts, frames, speed=speed / 1.4, phase=i * 0.37, height=h)
        out.append(fig)
    return out


def shot_morning_pump(W: B.World):
    """Beat: someone finishes at the pump and walks in. Under the canopy, 8:05.

    lens      street 50 mm, f/4       height 1.55 m
    fore      the near pump's shoulder, dark, left
    subject   a person leaving a car and crossing to the store
    back      the store front, its door lit
    focus     the crossing, two thirds back
    move      locked.
    """
    m = look(W)
    B.set_state(W, "morning", elev=24.0, exposure=-3.0)
    frames = 28
    _crowd(W, "mp", [([(2.9, 12.2), (1.2, 15.6), (-1.2, 18.6)], 1.35, 0, math.radians(-28))], frames, [m["cloth_dark"], m["cloth2"]])
    cam = CAM.Cam("street", subject="a person leaving the pump and crossing to the store",
                  foreground="the near pump's shoulder, dark, left of frame", background="the store front, its door lit",
                  motivation="locked")
    cam.lock((4.9, 9.4, 1.55), (-0.6, 17.6, 1.42), frames, focus=(0.2, 16.4, 1.4), label="beside the east island")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["door_joes"], people=None,
                meta=dict(state="morning", clock="Friday · 8:05 AM", spec=cam.spec()), comp=dict(mist=0.28, glare=0.12))


def shot_morning_walk(W: B.World):
    """Beat: two people come along the frontage from the café end. 8:26.

    lens      block 40 mm, f/5.6      height 1.60 m
    fore      a lamp post on the near curb, 6.4 m out, a dark vertical closing the right of frame
    subject   two people walking the sidewalk toward Joe's
    back      the block: the café's awning, the parked cars, the lot
    focus     the sidewalk at the middle distance
    move      locked.
    """
    m = look(W)
    B.set_state(W, "morning", elev=31.0, exposure=-2.85)
    frames = 30
    # a 30-frame beat holds about two metres of walking. The old routes ran nineteen metres
    # through it, which is not a walk, it is a smear.
    _crowd(W, "mw", [
        ([(4.6, 9.4), (2.7, 10.5)], 1.50, 0, math.radians(-120)),
        ([(6.4, 8.4), (4.6, 9.5)], 1.38, 4, math.radians(-120)),
    ], frames, [m["cloth_dark"], m["cloth"]])
    # The shot declared the curb as its foreground, which is the ground the camera looks across,
    # not an object it looks past: everything sat on one plane at f/5.6 and the frame read as
    # archviz. The first fix put a parked car six metres out; it closed the frame but at that crop
    # it read as an ambiguous dark pod rather than a car, which is the kind of object the brief
    # warns against. A lamp post is unambiguous at any crop and is the dark vertical a wide lens
    # actually wants: at 40 mm a foreground at six metres computes to under a pixel of circle of
    # confusion, so it cannot be softened into a shape -- it has to already be one.
    _post = B.mat_surface("post", "#2f3335", rough=0.45, metallic=0.4)
    B.cylinder("mw_post", 0.09, 6.4, (-2.90, 4.62, 3.2 + B.CURB_H), _post, group="street", verts=14)
    B.cylinder("mw_postbase", 0.19, 0.5, (-2.90, 4.62, 0.25 + B.CURB_H), _post, group="street", verts=14)
    cam = CAM.Cam("block", subject="two people walking the frontage toward Joe's",
                  foreground="a lamp post on the near curb, 6.4 m out and 80% of the way to the right edge, a dark vertical from the bottom of frame to the top", background="the café's awning, the cars, the lot",
                  motivation="locked")
    cam.lock((-9.6, 3.2, 1.60), (3.0, 11.0, 1.55), frames, focus=(2.0, 9.6, 1.5), label="across the road")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["door_joes"], people=None,
                meta=dict(state="morning", clock="Friday · 8:26 AM", spec=cam.spec()), comp=dict(mist=0.36, glare=0.10))


def shot_morning_door(W: B.World):
    """Beat: the door, later. The light has moved; the room behind it is busier. 9:12.

    lens      human 75 mm, f/2.8      height 1.48 m
    fore      nothing; the door is close
    subject   the doorway, and a person going through it
    back      the store's interior, warm
    focus     the threshold
    move      locked.
    """
    m = look(W)
    dress_joes(W)
    B.set_state(W, "morning", elev=41.0, exposure=-2.7)
    frames = 26
    _crowd(W, "md", [([(-2.35, 18.55), (-1.88, 19.45), (-1.70, 20.35)], 1.7, 0, math.radians(-14))], frames, [m["cloth"]])
    cam = CAM.Cam("human", subject="the doorway, and a person going through it",
                  foreground="none; the door is close", background="the store's interior, warm",
                  motivation="locked")
    cam.lock((0.95, 13.60, 1.52), (-1.72, 20.30, 1.38), frames, focus=(-1.72, 20.30, 1.38), label="out on the forecourt, clear of the island")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["door_joes"], people=None,
                meta=dict(state="morning", clock="Friday · 9:12 AM", spec=cam.spec()), comp=dict(mist=0.22, glare=0.14))


def shot_rise(W: B.World):
    """The crossing back to the page. The same lane the first customer walked up, later, with
    the morning gone high — and the line where the store meets its forecourt running level
    across the frame. That line is the residue: it straightens into the rule under the 21.

    lens      street 50 mm, f/5.6     height 1.58 m rising to 2.30 m
    fore      the lane's asphalt
    subject   the store front, square on, its base line level
    back      the sky over the parapet
    focus     the store front
    move      a slow rise, motivated by the morning going over: the geometry simplifies as we
              climb until only the base line and the doorway are left to see.
    """
    m = look(W)
    B.set_state(W, "morning", elev=46.0, exposure=-2.55)
    frames = 40
    _crowd(W, "rs", [
        ([(-4.2, 9.0), (-2.6, 14.0), (-1.8, 18.8)], 1.25, 0, math.radians(-10)),
        ([(1.6, 8.2), (0.2, 13.0), (-1.3, 18.4)], 1.10, 9, math.radians(-22)),
    ], frames, [m["cloth_dark"], m["cloth2"]])
    for key, x in (("base_l", -12.0), ("base_r", 9.0)):
        track(W, key, B.empty(f"rs_{key}", (x, 19.70, 0.02)))
    cam = CAM.Cam("street", fstop=5.6, subject="the store front, square on, its base line level",
                  foreground="the lane's asphalt", background="the sky over the parapet",
                  motivation="the morning goes over; we climb until only the base line and the doorway are left")
    cam.key(0, (-1.72, 2.6, 1.58), (-1.72, 19.70, 1.44), focus=(-1.72, 19.70, 1.4), label="in the lane")
    cam.key(frames - 1, (-1.72, 2.2, 2.30), (-1.72, 19.70, 1.62), focus=(-1.72, 19.70, 1.5), label="up, and level")
    CAM.ease_camera(cam.obj)
    return dict(frames=frames, cam=cam.obj, names=["door_joes", "base_l", "base_r"], people=None,
                meta=dict(state="morning", clock="Friday · 9:40 AM", spec=cam.spec()), comp=dict(mist=0.30, glare=0.10))
