"""
THE DEVICE · the phone, the Uptick screen, and the coffee.

The film's hard rule is that no software floats in the physical world. The
consequence is this module: when the product appears on Main Street it appears
because a physical panel is emitting it. The UI is rendered by Remotion to a
PNG sequence, that sequence is the emission texture of a screen inside the
Blender shot, and it therefore gets the room's reflections, the lens's depth of
field, the shot's motion blur, and occlusion from the thumb in front of it —
free and correct, because it is really there.
"""
from __future__ import annotations

import math
import os

import bpy

import block as B

# A phone, in metres. Roughly a 6.1" handset.
PHONE = dict(w=0.0715, h=0.1465, d=0.0079, bezel=0.0035, corner=0.0115)


# --------------------------------------------------------------------------
# Screen materials
# --------------------------------------------------------------------------
def screen_mat(name: str, image_path: str | None = None, *, frames: int = 1, first: int = 0,
               strength=2.2, tint="#0b1c22", roughness=0.06):
    """An emissive panel behind glass. `image_path` may be a single PNG or the first frame of a
    sequence (0000.png); with frames > 1 it plays one image per scene frame."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")

    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.09
        bsdf.inputs["Coat Roughness"].default_value = 0.015
    bsdf.inputs["Base Color"].default_value = B.srgb("#05090b")
    if image_path and os.path.exists(image_path):
        tex = nt.nodes.new("ShaderNodeTexImage")
        img = bpy.data.images.load(os.path.abspath(image_path), check_existing=True)
        tex.image = img
        tex.interpolation = "Cubic"
        tex.extension = "EXTEND"
        if frames > 1:
            img.source = "SEQUENCE"
            iu = tex.image_user
            iu.frame_duration = frames
            iu.frame_start = 0
            iu.frame_offset = first - 1
            iu.use_auto_refresh = True
        # the panel emits the image and reflects almost nothing: a bright pixel is bright
        # because it is lit from behind, and an ink block stays ink instead of catching the room
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Base Color"].default_value = B.srgb("#04070a")
    else:
        bsdf.inputs["Emission Color"].default_value = B.srgb(tint)
    bsdf.inputs["Emission Strength"].default_value = strength
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


# --------------------------------------------------------------------------
# The phone
# --------------------------------------------------------------------------
def phone(name: str, mat_body, screen_material, group="device", scale=1.0):
    """A handset: a chamfered aluminium body, a glass front, an emissive panel inset in it.
    Returns (root, parts). The screen's four corners are `tl/tr/br/bl` empties for tracking;
    the film does not need them when the UI is baked, but a wide shot may still use them.

    Local frame: +X right across the face, +Y out of the screen, +Z up the face."""
    s = scale
    w, h, d = PHONE["w"] * s, PHONE["h"] * s, PHONE["d"] * s
    bz = PHONE["bezel"] * s
    root = B.empty(f"{name}", (0, 0, 0), group=group)

    body = _rounded_slab(f"{name}_body", w, d, h, PHONE["corner"] * s, mat_body, group)
    body.parent = root
    # the front glass sits a hair proud of the aluminium and carries the coat

    panel = B.plane(f"{name}_screen", (w - 2 * bz, h - 2 * bz), (0.0, -(d / 2 + 0.0003 * s), 0.0), screen_material, group=group, rot=(math.pi / 2, 0, 0))
    panel.parent = root

    parts = {"body": body, "screen": panel}
    pw, ph = (w - 2 * bz) / 2, (h - 2 * bz) / 2
    for key, (x, z) in (("tl", (-pw, ph)), ("tr", (pw, ph)), ("br", (pw, -ph)), ("bl", (-pw, -ph))):
        e = B.empty(f"{name}_{key}", (x, -(d / 2 + 0.0004 * s), z), group="track")
        e.parent = root
        parts[key] = e
    return root, parts


def _glass_mat(name):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (1, 1, 1, 1)
    b.inputs["Roughness"].default_value = 0.015
    b.inputs["Metallic"].default_value = 0.0
    b.inputs["IOR"].default_value = 1.52
    b.inputs["Transmission Weight"].default_value = 1.0
    if "Coat Weight" in b.inputs:
        b.inputs["Coat Weight"].default_value = 1.0
        b.inputs["Coat Roughness"].default_value = 0.01
    mat.use_backface_culling = False
    return mat


def _rounded_slab(name, w, d, h, r, mat, group, segs=8):
    """A slab with rounded left/right edges in the XZ face and a chamfered rim — the phone's
    silhouette. Built as a lofted extrusion so it bevels cleanly without a modifier stack."""
    mesh = bpy.data.meshes.new(name)
    prof = []
    n = segs
    for cx, cz, a0 in ((w / 2 - r, h / 2 - r, 0.0), (-(w / 2 - r), h / 2 - r, math.pi / 2),
                       (-(w / 2 - r), -(h / 2 - r), math.pi), (w / 2 - r, -(h / 2 - r), 3 * math.pi / 2)):
        for i in range(n + 1):
            a = a0 + (math.pi / 2) * i / n
            prof.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    m = len(prof)
    vs, fs = [], []
    # a chamfered rim: three rings in Y, the middle one full width
    rings = ((-d / 2, 0.86), (-d / 2 * 0.55, 1.0), (d / 2 * 0.55, 1.0), (d / 2, 0.86))
    for y, k in rings:
        for x, z in prof:
            vs.append((x * k, y, z * k))
    for j in range(len(rings) - 1):
        for i in range(m):
            i2 = (i + 1) % m
            fs.append((j * m + i, j * m + i2, (j + 1) * m + i2, (j + 1) * m + i))
    for base, flip in ((0, True), ((len(rings) - 1) * m, False)):
        c = len(vs)
        vs.append((0.0, rings[0][0] if flip else rings[-1][0], 0.0))
        for i in range(m):
            i2 = (i + 1) % m
            fs.append((c, base + i2, base + i) if flip else (c, base + i, base + i2))
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    for p in mesh.polygons:
        p.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    mesh.materials.append(mat)
    return B._link(obj, group)


# --------------------------------------------------------------------------
# The Uptick screen: a real panel on a real counter
# --------------------------------------------------------------------------
def counter_screen(name: str, loc, yaw, screen_material, mat_body, group="block", diag_m=0.34):
    """A 15-inch panel on a machined foot. Thickness, bezel, support — a thing a café would own."""
    w = diag_m * 0.87
    h = w * 9 / 16
    root = B.empty(name, loc, group=group)
    root.rotation_euler = (0.0, 0.0, yaw)
    shell = B.box(f"{name}_shell", (w + 0.016, 0.0135, h + 0.016), (0, 0, h / 2 + 0.055), mat_body, bevel=0.0022, group=group)
    shell.parent = root
    panel = B.plane(f"{name}_face", (w, h), (0, -0.0072, h / 2 + 0.055), screen_material, group=group, rot=(math.pi / 2, 0, 0))
    panel.parent = root
    neck = B.box(f"{name}_neck", (0.052, 0.020, 0.062), (0, 0.004, 0.030), mat_body, bevel=0.002, group=group)
    neck.parent = root
    foot = B.box(f"{name}_foot", (0.150, 0.098, 0.011), (0, 0.010, 0.0055), mat_body, bevel=0.003, group=group)
    foot.parent = root
    parts = {"shell": shell, "face": panel, "neck": neck, "foot": foot}
    for key, (x, z) in (("tl", (-w / 2, h)), ("tr", (w / 2, h)), ("br", (w / 2, 0.055)), ("bl", (-w / 2, 0.055))):
        e = B.empty(f"{name}_{key}", (x, -0.0075, z + 0.055 - 0.055), group="track")
        e.parent = root
        parts[key] = e
    return root, parts


# --------------------------------------------------------------------------
# The reward, as an object
# --------------------------------------------------------------------------
def coffee(name: str, loc, mat_cup, mat_lid, mat_sleeve, group="block", scale=1.0):
    """A large takeaway coffee: tapered paper cup, a board sleeve, a domed lid. The film sells
    this drink for seventy seconds; it should be able to look at it."""
    s = scale
    root = B.empty(name, loc, group=group)
    cup = loft_cup(f"{name}_cup", [
        (0.0345 * s, 0.0),
        (0.0352 * s, 0.006 * s),
        (0.0392 * s, 0.048 * s),
        (0.0436 * s, 0.098 * s),
        (0.0452 * s, 0.126 * s),
        (0.0455 * s, 0.132 * s),
    ], mat_cup, group)
    cup.parent = root
    sleeve = loft_cup(f"{name}_sleeve", [
        (0.0402 * s, 0.036 * s),
        (0.0414 * s, 0.052 * s),
        (0.0436 * s, 0.086 * s),
        (0.0442 * s, 0.096 * s),
    ], mat_sleeve, group, cap=False)
    sleeve.parent = root
    # a real lid is nearly flat with a raised sip lip, not a dome: a dome reads as a cartoon
    lid = loft_cup(f"{name}_lid", [
        (0.0468 * s, 0.1280 * s),
        (0.0474 * s, 0.1345 * s),
        (0.0466 * s, 0.1390 * s),
        (0.0430 * s, 0.1428 * s),
        (0.0330 * s, 0.1466 * s),
        (0.0180 * s, 0.1488 * s),
        (0.0062 * s, 0.1497 * s),
    ], mat_lid, group)
    lid.parent = root
    return root, {"cup": cup, "sleeve": sleeve, "lid": lid}


def loft_cup(name, profile, mat, group, segs=28, cap=True):
    mesh = bpy.data.meshes.new(name)
    vs, fs = [], []
    for r, z in profile:
        for i in range(segs):
            a = 2 * math.pi * i / segs
            vs.append((r * math.cos(a), r * math.sin(a), z))
    for j in range(len(profile) - 1):
        for i in range(segs):
            i2 = (i + 1) % segs
            fs.append((j * segs + i, j * segs + i2, (j + 1) * segs + i2, (j + 1) * segs + i))
    if cap:
        for base, z, flip in ((0, profile[0][1], True), ((len(profile) - 1) * segs, profile[-1][1], False)):
            c = len(vs)
            vs.append((0.0, 0.0, z))
            for i in range(segs):
                i2 = (i + 1) % segs
                fs.append((c, base + i2, base + i) if flip else (c, base + i, base + i2))
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    for p in mesh.polygons:
        p.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    mesh.materials.append(mat)
    return B._link(obj, group)
