"""
The Uptick Block — one authored neighbourhood, built procedurally in Blender.

    Main St, one block. Six lots on the far (north) side face the camera:
    Gym · Pharmacy · Joe's Fuel & Go · Café · Barber · Restaurant.
    A near (south) row gives the street its other wall. Cross streets close
    both ends. Everything beyond fades into the morning.

Axes: X runs along the street (east positive), Y across it (north positive),
Z is up. The road is |y| < 4.5, the sidewalks 4.5 < |y| < 8.2, the frontage
line |y| = 8.2. Units are metres.

This module only builds geometry, materials and lighting states. Cameras,
people schedules and renders live in shots.py; the CLI is render.py.
"""
from __future__ import annotations

import math
import os
from dataclasses import dataclass, field

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "..", "assets", "fonts")

# --------------------------------------------------------------------------
# Street geometry
# --------------------------------------------------------------------------
ROAD_HALF = 4.5
WALK = 3.7
FRONT = ROAD_HALF + WALK  # 8.2
CURB_H = 0.13
STOREY = 3.25
GROUND = 4.1  # shopfront storey, floor to top of fascia
BLOCK_X0, BLOCK_X1 = -48.0, 48.0  # cross streets at the block ends
CROSS_W = 12.0


# --------------------------------------------------------------------------
# Colour and material helpers
# --------------------------------------------------------------------------
def srgb(hexstr: str, a: float = 1.0):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))

    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (lin(r), lin(g), lin(b), a)


_MATS: dict[str, bpy.types.Material] = {}


def _new_mat(name: str) -> tuple[bpy.types.Material, bpy.types.ShaderNodeBsdfPrincipled, bpy.types.NodeTree]:
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    return m, p, nt


def mat_surface(name: str, hexstr: str, rough=0.85, metallic=0.0, spec=0.4, bump=0.0, scale=8.0, coat=0.0, dirt=0.0, courses=0.0) -> bpy.types.Material:
    """A matte mineral surface with optional fine procedural bump, a dirt gradient at the base, and brick-like coursing."""
    if name in _MATS:
        return _MATS[name]
    m, p, nt = _new_mat(name)
    p.inputs["Base Color"].default_value = srgb(hexstr)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Specular IOR Level"].default_value = spec
    p.inputs["Coat Weight"].default_value = coat
    if dirt > 0:
        # darker toward the ground: world z through a ramp, multiplied into the colour
        tc = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
        # object coordinates for a box are centred; use Generated z instead (0 at the bottom, 1 at the top)
        sepg = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(tc.outputs["Generated"], sepg.inputs["Vector"])
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = (1 - dirt, 1 - dirt, 1 - dirt, 1)
        ramp.color_ramp.elements[1].position = 0.35
        ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
        nt.links.new(sepg.outputs["Z"], ramp.inputs["Fac"])
        mixd = nt.nodes.new("ShaderNodeMix")
        mixd.data_type = "RGBA"
        mixd.blend_type = "MULTIPLY"
        mixd.inputs["Factor"].default_value = 1.0
        mixd.inputs[6].default_value = srgb(hexstr)
        nt.links.new(ramp.outputs["Color"], mixd.inputs[7])
        nt.links.new(mixd.outputs[2], p.inputs["Base Color"])
    if courses > 0:
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.wave_type = "BANDS"
        wave.bands_direction = "Z"
        wave.wave_profile = "SAW"
        wave.inputs["Scale"].default_value = 13.0
        wave.inputs["Distortion"].default_value = 0.0
        tcw = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(tcw.outputs["Object"], wave.inputs["Vector"])
        bw = nt.nodes.new("ShaderNodeBump")
        bw.inputs["Strength"].default_value = courses
        bw.inputs["Distance"].default_value = 0.01
        nt.links.new(wave.outputs["Fac"], bw.inputs["Height"])
        nt.links.new(bw.outputs["Normal"], p.inputs["Normal"])
    if bump > 0:
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = scale
        noise.inputs["Detail"].default_value = 6.0
        noise.inputs["Roughness"].default_value = 0.6
        b = nt.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = bump
        b.inputs["Distance"].default_value = 0.02
        nt.links.new(noise.outputs["Fac"], b.inputs["Height"])
        if courses > 0:
            nt.links.new(b.outputs["Normal"], bw.inputs["Normal"])
        else:
            nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
        # a little tonal variation so large walls never read as one flat value
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (0.9, 0.9, 0.9, 1)
        ramp.color_ramp.elements[1].color = (1.08, 1.08, 1.08, 1)
        big = nt.nodes.new("ShaderNodeTexNoise")
        big.inputs["Scale"].default_value = 0.35
        big.inputs["Detail"].default_value = 2.0
        nt.links.new(big.outputs["Fac"], ramp.inputs["Fac"])
        mixn = nt.nodes.new("ShaderNodeMix")
        mixn.data_type = "RGBA"
        mixn.blend_type = "MULTIPLY"
        mixn.inputs["Factor"].default_value = 1.0
        if dirt > 0:
            nt.links.new(mixd.outputs[2], mixn.inputs[6])
        else:
            mixn.inputs[6].default_value = srgb(hexstr)
        nt.links.new(ramp.outputs["Color"], mixn.inputs[7])
        nt.links.new(mixn.outputs[2], p.inputs["Base Color"])
    _MATS[name] = m
    return m


def mat_asphalt(name="asphalt") -> bpy.types.Material:
    if name in _MATS:
        return _MATS[name]
    m, p, nt = _new_mat(name)
    p.inputs["Roughness"].default_value = 0.78
    p.inputs["Specular IOR Level"].default_value = 0.35
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 60.0
    fine.inputs["Detail"].default_value = 8.0
    fine.inputs["Roughness"].default_value = 0.7
    broad = nt.nodes.new("ShaderNodeTexNoise")
    broad.inputs["Scale"].default_value = 0.25
    broad.inputs["Detail"].default_value = 3.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = srgb("#26292b")
    ramp.color_ramp.elements[1].color = srgb("#383c3e")
    nt.links.new(broad.outputs["Fac"], ramp.inputs["Fac"])
    # wheel tracks: two slightly darker, slightly smoother bands per lane
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    absy = nt.nodes.new("ShaderNodeMath")
    absy.operation = "ABSOLUTE"
    nt.links.new(sep.outputs["Y"], absy.inputs[0])
    tracks = nt.nodes.new("ShaderNodeValToRGB")
    cr = tracks.color_ramp
    cr.interpolation = "EASE"
    cr.elements[0].position = 0.0
    cr.elements[0].color = (1, 1, 1, 1)
    e1 = cr.elements.new(0.24)
    e1.color = (0.86, 0.86, 0.86, 1)
    e2 = cr.elements.new(0.42)
    e2.color = (1, 1, 1, 1)
    e3 = cr.elements.new(0.7)
    e3.color = (0.86, 0.86, 0.86, 1)
    e4 = cr.elements.new(0.9)
    e4.color = (1, 1, 1, 1)
    scale = nt.nodes.new("ShaderNodeMath")
    scale.operation = "DIVIDE"
    scale.inputs[1].default_value = 4.5
    nt.links.new(absy.outputs[0], scale.inputs[0])
    nt.links.new(scale.outputs[0], tracks.inputs["Fac"])
    mixt = nt.nodes.new("ShaderNodeMix")
    mixt.data_type = "RGBA"
    mixt.blend_type = "MULTIPLY"
    mixt.inputs["Factor"].default_value = 1.0
    nt.links.new(ramp.outputs["Color"], mixt.inputs[6])
    nt.links.new(tracks.outputs["Color"], mixt.inputs[7])
    nt.links.new(mixt.outputs[2], p.inputs["Base Color"])
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.12
    b.inputs["Distance"].default_value = 0.01
    nt.links.new(fine.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    _MATS[name] = m
    return m


def mat_concrete(name: str, hexstr: str, score=True, score_scale=(1.5, 1.5)) -> bpy.types.Material:
    """Sidewalk concrete with faint score lines and a little grain."""
    if name in _MATS:
        return _MATS[name]
    m, p, nt = _new_mat(name)
    p.inputs["Roughness"].default_value = 0.92
    p.inputs["Specular IOR Level"].default_value = 0.3
    base = srgb(hexstr)
    grain = nt.nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 40.0
    grain.inputs["Detail"].default_value = 6.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = tuple(c * 0.93 for c in base[:3]) + (1,)
    ramp.color_ramp.elements[1].color = tuple(min(1, c * 1.06) for c in base[:3]) + (1,)
    nt.links.new(grain.outputs["Fac"], ramp.inputs["Fac"])
    color_out = ramp.outputs["Color"]
    # broad stains (metres) and a fine aggregate speckle, both multiplied in
    stain = nt.nodes.new("ShaderNodeTexNoise")
    stain.inputs["Scale"].default_value = 0.35
    stain.inputs["Detail"].default_value = 4.0
    stain.inputs["Roughness"].default_value = 0.75
    sramp = nt.nodes.new("ShaderNodeValToRGB")
    sramp.color_ramp.elements[0].position = 0.35
    sramp.color_ramp.elements[0].color = (0.74, 0.73, 0.71, 1)
    sramp.color_ramp.elements[1].position = 0.62
    sramp.color_ramp.elements[1].color = (1.03, 1.03, 1.02, 1)
    nt.links.new(stain.outputs["Fac"], sramp.inputs["Fac"])
    smul = nt.nodes.new("ShaderNodeMix")
    smul.data_type = "RGBA"
    smul.blend_type = "MULTIPLY"
    smul.inputs["Factor"].default_value = 1.0
    nt.links.new(color_out, smul.inputs[6])
    nt.links.new(sramp.outputs["Color"], smul.inputs[7])
    color_out = smul.outputs[2]
    agg = nt.nodes.new("ShaderNodeTexVoronoi")
    agg.inputs["Scale"].default_value = 90.0
    agg.inputs["Randomness"].default_value = 1.0
    aramp = nt.nodes.new("ShaderNodeValToRGB")
    aramp.color_ramp.elements[0].position = 0.0
    aramp.color_ramp.elements[0].color = (0.9, 0.9, 0.9, 1)
    aramp.color_ramp.elements[1].position = 0.25
    aramp.color_ramp.elements[1].color = (1, 1, 1, 1)
    nt.links.new(agg.outputs["Distance"], aramp.inputs["Fac"])
    amul = nt.nodes.new("ShaderNodeMix")
    amul.data_type = "RGBA"
    amul.blend_type = "MULTIPLY"
    amul.inputs["Factor"].default_value = 1.0
    nt.links.new(color_out, amul.inputs[6])
    nt.links.new(aramp.outputs["Color"], amul.inputs[7])
    color_out = amul.outputs[2]
    if score:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (1 / score_scale[0], 1 / score_scale[1], 1)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        brick = nt.nodes.new("ShaderNodeTexBrick")
        brick.offset = 0.0
        brick.inputs["Scale"].default_value = 1.0
        brick.inputs["Mortar Size"].default_value = 0.012
        brick.inputs["Mortar Smooth"].default_value = 0.4
        brick.inputs["Color1"].default_value = (1, 1, 1, 1)
        brick.inputs["Color2"].default_value = (0.955, 0.955, 0.95, 1)
        brick.inputs["Mortar"].default_value = (0.94, 0.94, 0.94, 1)
        brick.inputs["Bias"].default_value = 0.0
        nt.links.new(mp.outputs["Vector"], brick.inputs["Vector"])
        mul = nt.nodes.new("ShaderNodeMix")
        mul.data_type = "RGBA"
        mul.blend_type = "MULTIPLY"
        mul.inputs["Factor"].default_value = 1.0
        nt.links.new(color_out, mul.inputs[6])
        nt.links.new(brick.outputs["Color"], mul.inputs[7])
        color_out = mul.outputs[2]
        b = nt.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = 0.2
        b.inputs["Distance"].default_value = 0.01
        nt.links.new(brick.outputs["Fac"], b.inputs["Height"])
        b.invert = True
        nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    nt.links.new(color_out, p.inputs["Base Color"])
    _MATS[name] = m
    return m


def mat_glass(name="archglass", tint="#b9c9cb", alpha_tint=0.86, rough=0.02) -> bpy.types.Material:
    """Architectural glass: a Fresnel mix of glossy reflection and tinted transparency. No refraction, no noise."""
    if name in _MATS:
        return _MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    mix = nt.nodes.new("ShaderNodeMixShader")
    fres = nt.nodes.new("ShaderNodeFresnel")
    fres.inputs["IOR"].default_value = 1.48
    glossy = nt.nodes.new("ShaderNodeBsdfGlossy")
    glossy.inputs["Roughness"].default_value = rough
    glossy.inputs["Color"].default_value = (1, 1, 1, 1)
    trans = nt.nodes.new("ShaderNodeBsdfTransparent")
    t = srgb(tint)
    trans.inputs["Color"].default_value = (t[0] * alpha_tint, t[1] * alpha_tint, t[2] * alpha_tint, 1)
    nt.links.new(fres.outputs[0], mix.inputs[0])
    nt.links.new(trans.outputs[0], mix.inputs[1])
    nt.links.new(glossy.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    m.blend_method = "BLEND"
    _MATS[name] = m
    return m


def mat_emissive(name: str, hexstr: str, strength: float, base: str | None = None) -> bpy.types.Material:
    m, p, nt = _new_mat(name)
    p.inputs["Base Color"].default_value = srgb(base or hexstr)
    p.inputs["Emission Color"].default_value = srgb(hexstr)
    p.inputs["Emission Strength"].default_value = strength
    p.inputs["Roughness"].default_value = 0.6
    return m


def mat_screen(name: str, image_path: str | None, hexstr="#0b1c22", strength=1.0) -> bpy.types.Material:
    """A display panel: emissive image (or colour), glossy face. Animate Emission Strength to switch it on."""
    m, p, nt = _new_mat(name)
    p.inputs["Base Color"].default_value = (0, 0, 0, 1)
    p.inputs["Roughness"].default_value = 0.08
    p.inputs["Specular IOR Level"].default_value = 0.6
    p.inputs["Emission Strength"].default_value = strength
    if image_path and os.path.exists(image_path):
        img = bpy.data.images.load(image_path)
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = img
        tex.extension = "CLIP"
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(tc.outputs["UV"], tex.inputs["Vector"])
        nt.links.new(tex.outputs["Color"], p.inputs["Emission Color"])
    else:
        p.inputs["Emission Color"].default_value = srgb(hexstr)
    return m


# --------------------------------------------------------------------------
# Geometry helpers
# --------------------------------------------------------------------------
_COLL: dict[str, bpy.types.Collection] = {}


def coll(name: str) -> bpy.types.Collection:
    if name not in _COLL:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
        _COLL[name] = c
    return _COLL[name]


def _link(obj: bpy.types.Object, group: str):
    coll(group).objects.link(obj)
    return obj


def box(name: str, size, loc, mat, bevel=0.02, group="block", rot=(0, 0, 0), uv=True, shade_smooth=False) -> bpy.types.Object:
    """A beveled box. `loc` is the centre of the box."""
    w, d, h = size
    mesh = bpy.data.meshes.new(name)
    x, y, z = w / 2, d / 2, h / 2
    verts = [(-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z), (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]
    faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    if uv:
        mesh.uv_layers.new(name="UVMap")
        uvl = mesh.uv_layers.active.data
        # box-project each face on its own plane so textures never stretch
        for poly in mesh.polygons:
            n = poly.normal
            for li in poly.loop_indices:
                v = mesh.vertices[mesh.loops[li].vertex_index].co
                if abs(n.z) > 0.5:
                    uvl[li].uv = (v.x, v.y)
                elif abs(n.x) > 0.5:
                    uvl[li].uv = (v.y, v.z)
                else:
                    uvl[li].uv = (v.x, v.z)
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.rotation_euler = rot
    if mat is not None:
        mesh.materials.append(mat)
    if bevel and bevel > 0:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = min(bevel, min(w, d, h) * 0.3)
        mod.segments = 2
        mod.limit_method = "ANGLE"
    if shade_smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    return _link(obj, group)


def plane(name: str, size, loc, mat, group="block", rot=(0, 0, 0)) -> bpy.types.Object:
    w, d = size
    mesh = bpy.data.meshes.new(name)
    x, y = w / 2, d / 2
    mesh.from_pydata([(-x, -y, 0), (x, -y, 0), (x, y, 0), (-x, y, 0)], [], [(0, 1, 2, 3)])
    mesh.update()
    mesh.uv_layers.new(name="UVMap")
    uvl = mesh.uv_layers.active.data
    for li, uv in zip(range(4), [(0, 0), (1, 0), (1, 1), (0, 1)]):
        uvl[li].uv = uv
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.rotation_euler = rot
    if mat is not None:
        mesh.materials.append(mat)
    return _link(obj, group)


def cylinder(name: str, r, h, loc, mat, group="block", verts=24, rot=(0, 0, 0)) -> bpy.types.Object:
    mesh = bpy.data.meshes.new(name)
    vs, fs = [], []
    for i in range(verts):
        a = 2 * math.pi * i / verts
        vs.append((r * math.cos(a), r * math.sin(a), -h / 2))
        vs.append((r * math.cos(a), r * math.sin(a), h / 2))
    for i in range(verts):
        j = (i + 1) % verts
        fs.append((2 * i, 2 * j, 2 * j + 1, 2 * i + 1))
    fs.append(tuple(2 * i for i in range(verts))[::-1])
    fs.append(tuple(2 * i + 1 for i in range(verts)))
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    for poly in mesh.polygons:
        poly.use_smooth = abs(poly.normal.z) < 0.5
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.rotation_euler = rot
    if mat is not None:
        mesh.materials.append(mat)
    return _link(obj, group)


def capsule(name: str, r, h, loc, mat, group="people", segs=16, rings=6) -> bpy.types.Object:
    """A person: a capsule standing on the ground, origin at the feet."""
    mesh = bpy.data.meshes.new(name)
    vs, fs = [], []
    body = max(0.0, h - 2 * r)
    rows = []
    # bottom cap
    for k in range(rings, 0, -1):
        t = k / rings
        a = t * math.pi / 2
        rows.append((r * math.cos(a), r - r * math.sin(a)))
    rows.append((r, r))
    rows.append((r, r + body))
    for k in range(1, rings + 1):
        t = k / rings
        a = t * math.pi / 2
        rows.append((r * math.cos(a), r + body + r * math.sin(a)))
    for rr, z in rows:
        for i in range(segs):
            a = 2 * math.pi * i / segs
            vs.append((rr * math.cos(a), rr * math.sin(a), z))
    n = len(rows)
    for j in range(n - 1):
        for i in range(segs):
            i2 = (i + 1) % segs
            fs.append((j * segs + i, j * segs + i2, (j + 1) * segs + i2, (j + 1) * segs + i))
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    mesh.materials.append(mat)
    return _link(obj, group)


def figure(name: str, loc, mat, height=1.72, group="people", segs=16, rings=6) -> bpy.types.Object:
    """A person as an architect's scale figure: a slim capsule body, a neck, a head. One mesh, origin at the feet."""
    mesh = bpy.data.meshes.new(name)
    vs, fs = [], []

    def ring_rows(rows, close_bottom=False, close_top=False):
        base = len(vs)
        for rr, z in rows:
            for i in range(segs):
                a = 2 * math.pi * i / segs
                vs.append((rr * math.cos(a), rr * math.sin(a), z))
        n = len(rows)
        for j in range(n - 1):
            for i in range(segs):
                i2 = (i + 1) % segs
                fs.append((base + j * segs + i, base + j * segs + i2, base + (j + 1) * segs + i2, base + (j + 1) * segs + i))

    # body: a capsule to the shoulders, a shade narrower at the top
    r = 0.17
    top = height - 0.33
    body = max(0.0, top - 2 * r)
    rows = []
    for k in range(rings, 0, -1):
        a = k / rings * math.pi / 2
        rows.append((r * math.cos(a), r - r * math.sin(a)))
    rows.append((r, r))
    rows.append((r * 0.88, r + body))
    for k in range(1, rings + 1):
        a = k / rings * math.pi / 2
        rows.append((r * 0.88 * math.cos(a), r + body + r * 0.88 * math.sin(a)))
    ring_rows(rows)
    # neck
    ring_rows([(0.055, top - 0.02), (0.055, height - 0.2)])
    # head: a sphere whose top is the height
    hr = 0.115
    hz = height - hr
    rows = []
    for k in range(-rings, rings + 1):
        a = k / rings * math.pi / 2
        rows.append((max(0.004, hr * math.cos(a)), hz + hr * math.sin(a)))
    ring_rows(rows)
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    mesh.materials.append(mat)
    return _link(obj, group)


def hose(name: str, a, b, sag: float, mat, group: str, r=0.018) -> bpy.types.Object:
    """A fuel hose: a bezier from the boot to the nozzle holster that sags under its own weight."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 3
    cu.resolution_u = 8
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(2)
    mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, min(a[2], b[2]) - sag)
    for p, co in zip(sp.bezier_points, (a, mid, b)):
        p.co = co
        p.handle_left_type = p.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, cu)
    cu.materials.append(mat)
    return _link(ob, group)


_FONTS: dict[str, bpy.types.VectorFont] = {}


def font(name="Geist-Medium") -> bpy.types.VectorFont:
    if name not in _FONTS:
        _FONTS[name] = bpy.data.fonts.load(os.path.join(FONT_DIR, f"{name}.ttf"))
    return _FONTS[name]


def text(name: str, body: str, size, loc, mat, rot=(math.pi / 2, 0, 0), group="block", extrude=0.012, spacing=1.12, fontname="Geist-Medium", align="CENTER") -> bpy.types.Object:
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.font = font(fontname)
    cu.size = size
    cu.extrude = extrude
    cu.space_character = spacing
    cu.align_x = align
    cu.align_y = "CENTER"
    cu.materials.append(mat)
    obj = bpy.data.objects.new(name, cu)
    obj.location = loc
    obj.rotation_euler = rot
    return _link(obj, group)


def empty(name: str, loc, group="track") -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.location = loc
    obj.empty_display_size = 0.3
    return _link(obj, group)


# --------------------------------------------------------------------------
# The palette (one place)
# --------------------------------------------------------------------------
@dataclass
class Palette:
    body: list[str] = field(default_factory=lambda: ["#6e4b41", "#cbc3b4", "#8c7d6a", "#b7b1a5", "#5e6b64", "#3f4345"])
    trim: str = "#8e8a82"  # sills, cornices, pale stone
    riser: str = "#6c6862"  # stall risers: darker stone
    gutter: str = "#8e8b84"
    fascia: str = "#262a2c"
    fascia_pale: str = "#e9e4da"
    awning: list[str] = field(default_factory=lambda: ["#3a3f3e", "#2f3b37", "#45403a"])
    sign: str = "#efeae0"
    walk: str = "#9c988f"
    forecourt: str = "#a39f96"
    curb: str = "#8f8c85"
    marking: str = "#6f6c65"
    door: str = "#2a2d2f"
    frame: str = "#2c2f31"
    interior_floor: str = "#8f8477"
    counter: str = "#4a3f36"
    counter_top: str = "#c9c2b6"
    shelf: str = "#5a5550"
    goods: list[str] = field(default_factory=lambda: ["#b7a894", "#8f8a7f", "#a29d92", "#c1b6a4"])
    amber: str = "#e2a24f"
    mint: str = "#5fd6bb"
    lamp: str = "#ffe3bd"
    warm: str = "#ffd6a4"
    cool_white: str = "#f0f2f5"
    car: list[str] = field(default_factory=lambda: ["#3b3e40", "#5a5d60", "#46494c", "#2c2f31", "#6b6862"])


P = Palette()


# --------------------------------------------------------------------------
# The world
# --------------------------------------------------------------------------
@dataclass
class Lot:
    id: str
    name: str
    x0: float
    x1: float
    depth: float
    storeys: int
    body: str
    sign: str = ""
    awning: str | None = None
    interior: str = "shop"
    screen: bool = False
    you: bool = False
    bulkhead: bool = False

    @property
    def w(self):
        return self.x1 - self.x0

    @property
    def cx(self):
        return (self.x0 + self.x1) / 2


LOTS = [
    Lot("gym", "FORM", -46.5, -31.0, 16, 3, P.body[2], sign="FORM", interior="gym", bulkhead=True),
    Lot("pharmacy", "PHARMACY", -31.0, -18.0, 14, 2, P.body[3], sign="PHARMACY", interior="pharmacy", screen=True),
    Lot("joes", "JOE'S FUEL & GO", -18.0, 16.0, 16, 1, P.body[1], interior="joes", you=True),
    Lot("cafe", "ALDER", 16.0, 27.5, 14, 2, P.body[0], sign="ALDER", awning="#5a3a2e", interior="cafe", screen=True),
    Lot("barber", "BARBER", 27.5, 35.0, 14, 2, P.body[4], sign="BARBER", awning=P.awning[2], interior="barber"),
    Lot("restaurant", "OSTERIA", 35.0, 46.5, 15, 3, P.body[5], sign="OSTERIA", awning="#3a3f3e", interior="restaurant", bulkhead=True),
]


class World:
    """Holds handles the shots need: doors, screens, lights, people material."""

    def __init__(self):
        self.doors: dict[str, Vector] = {}
        self.screens: dict[str, dict] = {}
        self.interior_lights: dict[str, list[bpy.types.Object]] = {}
        self.interior_emissives: dict[str, list[bpy.types.Material]] = {}
        self.upper_windows: dict[str, list[bpy.types.Object]] = {}
        self.lamps: list[bpy.types.Object] = []
        self.lamp_mat: bpy.types.Material | None = None
        self.tracks: dict[str, bpy.types.Object] = {}
        self.sun: bpy.types.ShaderNodeTexSky | None = None
        self.sky_bg: bpy.types.ShaderNodeBackground | None = None
        self.person_mat: bpy.types.Material | None = None
        self.joes_canopy_mat: bpy.types.Material | None = None
        self.joes_sign_mat: bpy.types.Material | None = None
        self.forecourt_light: bpy.types.Object | None = None
        self.plaques: dict[str, bpy.types.Material] = {}
        self.spills: dict[str, bpy.types.Object] = {}
        self.entrance_mat: bpy.types.Material | None = None
        self.security: bpy.types.Object | None = None
        self.canopy_strip: bpy.types.Material | None = None
        self.pump_points: list = []
        self.joes_canopy_lights: list = []


def build(screen_images: dict[str, str] | None = None, cars=True, people_mat=True) -> World:
    W = World()
    screen_images = screen_images or {}
    scene = bpy.context.scene
    # a clean scene: the factory cube, light and camera live in a child collection
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        if c.name not in _COLL.values() and c.name == "Collection":
            bpy.data.collections.remove(c)

    asphalt = mat_asphalt()
    walk = mat_concrete("walk", P.walk, score_scale=(3.6, 3.6))
    forecourt = mat_concrete("forecourt", P.forecourt, score=True, score_scale=(4.5, 4.5))
    curb = mat_surface("curb", P.curb, rough=0.9)
    marking = mat_surface("marking", P.marking, rough=0.85)
    trim = mat_surface("trim", P.trim, rough=0.85, bump=0.15)
    fascia = mat_surface("fascia", P.fascia, rough=0.55, spec=0.5)
    frame = mat_surface("frame", P.frame, rough=0.45, metallic=0.3)
    door = mat_surface("door", P.door, rough=0.5, metallic=0.2)
    glass = mat_glass()
    dark_glass = mat_glass("upperglass", tint="#9db2b8", alpha_tint=0.5, rough=0.06)
    sign = mat_emissive("sign", P.sign, 0.35, base="#e2ddd2")
    W.person_mat = mat_emissive("person", "#f0a64a", 1.3, base="#e2a24f")
    W.person_mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.55
    W.lamp_mat = mat_emissive("lamphead", P.lamp, 0.0, base="#cfc8b8")

    # --- ground -----------------------------------------------------------
    plane("ground_far", (600, 600), (0, 0, -0.02), mat_surface("ground_far", "#3a3d3f", rough=0.95), group="ground")
    plane("road", (BLOCK_X1 - BLOCK_X0 + 2 * CROSS_W + 120, ROAD_HALF * 2), (0, 0, 0.0), asphalt, group="ground")
    gutter = mat_surface("gutter", P.gutter, rough=0.8, spec=0.45)
    iron = mat_surface("iron", "#2e3032", rough=0.55, metallic=0.4)
    for s in (-1, 1):
        # sidewalk slab, a curb with a chamfer, a concrete gutter strip against the asphalt
        box(f"walk{s}", (BLOCK_X1 - BLOCK_X0, WALK, CURB_H), (0, s * (ROAD_HALF + WALK / 2), CURB_H / 2), walk, bevel=0.0, group="ground")
        box(f"curb{s}", (BLOCK_X1 - BLOCK_X0, 0.24, CURB_H + 0.005), (0, s * (ROAD_HALF + 0.12), CURB_H / 2 + 0.0025), curb, bevel=0.035, group="ground")
        box(f"gutter{s}", (BLOCK_X1 - BLOCK_X0, 0.42, 0.012), (0, s * (ROAD_HALF - 0.21), 0.006), gutter, bevel=0, group="ground")
        # storm drains at the curb, a few along the block
        for gx in (-33.0, 3.2, 19.0, 44.0):
            box(f"drain{s}{gx}", (0.9, 0.3, 0.05), (gx, s * (ROAD_HALF - 0.18), -0.02), mat_surface("drainpit", "#0f1112", rough=1.0), bevel=0, group="ground")
            for bi in range(6):
                box(f"drainbar{s}{gx}{bi}", (0.9, 0.028, 0.02), (gx, s * (ROAD_HALF - 0.18) - 0.125 + bi * 0.05, 0.008), iron, bevel=0.003, group="ground")
    for mx, my in ((-20.0, 1.6), (14.0, -2.2), (38.0, 1.2)):
        cylinder(f"manhole{mx}", 0.42, 0.02, (mx, my, 0.008), iron, group="ground", verts=32)
    # a crosswalk by the café end of the block
    for k in range(7):
        box(f"xwalk{k}", (0.6, 0.9, 0.004), (26.5, -ROAD_HALF + 0.9 + k * 1.2, 0.003), marking, bevel=0, group="ground")
    # lane markings: a broken centre line and the stop bars at each end
    for x in range(int(BLOCK_X0) + 2, int(BLOCK_X1) - 2, 6):
        box(f"mark{x}", (2.4, 0.12, 0.004), (x + 1.2, 0, 0.003), marking, bevel=0, group="ground")
    for x in (BLOCK_X0 - 0.6, BLOCK_X1 + 0.6):
        for k in range(8):
            box(f"zebra{x}_{k}", (0.9, 0.55, 0.004), (x, -ROAD_HALF + 0.6 + k * 1.1, 0.003), marking, bevel=0, group="ground")
    # cross streets: asphalt already covers; add far-side sidewalks and the corner curbs beyond the block
    for s in (-1, 1):
        for cx0 in (BLOCK_X0 - CROSS_W - 40, BLOCK_X1 + CROSS_W):
            box(f"walk_beyond{s}{cx0}", (40, WALK, CURB_H), (cx0 + 20, s * (ROAD_HALF + WALK / 2), CURB_H / 2), walk, bevel=0, group="ground")
            box(f"curb_beyond{s}{cx0}", (40, 0.24, CURB_H + 0.005), (cx0 + 20, s * (ROAD_HALF + 0.12), CURB_H / 2 + 0.0025), curb, bevel=0.03, group="ground")

    # --- the far row (north) ---------------------------------------------
    for i, lot in enumerate(LOTS):
        if lot.interior == "joes":
            _build_joes(W, lot, forecourt, trim, fascia, frame, door, glass, sign, screen_images)
        else:
            _build_shop(W, lot, i, trim, fascia, frame, door, glass, dark_glass, sign, screen_images)

    # --- the near row (south): backs and roofs, the street's other wall ----
    near = [(-47, -35, 1, P.body[3]), (-35, -22, 0, P.body[0]), (21, 33, 1, P.body[1]), (33, 47, 0, P.body[3])]
    for k, (x0, x1, st, col) in enumerate(near):
        _build_near(W, k, x0, x1, st, col, trim, glass, dark_glass, fascia, frame, door, sign)
    _parking_lot(W, -22.0, 21.0, trim)

    # --- beyond the cross streets: quieter masses, so the block is a block --
    beyond = mat_surface("beyond", "#5f6365", rough=0.95, bump=0.2, scale=4)
    beyond2 = mat_surface("beyond2", "#7a6d62", rough=0.95, bump=0.2, scale=4, courses=0.1)
    beyond3 = mat_surface("beyond3", "#a29a8d", rough=0.95, bump=0.2, scale=4)
    beyond_trim = mat_surface("beyond_trim", "#8e8a82", rough=0.9)
    masses = [
        (BLOCK_X0 - CROSS_W - 40, BLOCK_X0 - CROSS_W, FRONT, FRONT + 18, 9.5),
        (BLOCK_X0 - CROSS_W - 40, BLOCK_X0 - CROSS_W, -FRONT - 16, -FRONT, 8.0),
        (BLOCK_X1 + CROSS_W, BLOCK_X1 + CROSS_W + 40, FRONT, FRONT + 18, 11.0),
        (BLOCK_X1 + CROSS_W, BLOCK_X1 + CROSS_W + 40, -FRONT - 16, -FRONT, 7.0),
    ]
    # the street behind the far row: a second row of varied buildings, set back with a service lane between
    x = BLOCK_X0 - 30
    k = 0
    while x < BLOCK_X1 + 30:
        w = 11 + (k * 7) % 9
        h = 8.5 + ((k * 5) % 4) * 2.2
        masses.append((x, x + w, FRONT + 24 + (k % 3) * 1.1, FRONT + 24 + 14 + (k % 3) * 3, h))
        x += w + 0.4
        k += 1
    masses.append((BLOCK_X0 - 30, BLOCK_X1 + 30, -FRONT - 30, -FRONT - 50, 9.0))
    for k, (x0, x1, y0, y1, h) in enumerate(masses):
        m = (beyond, beyond2, beyond3)[k % 3]
        box(f"beyond{k}", (x1 - x0, abs(y1 - y0), h), ((x0 + x1) / 2, (y0 + y1) / 2, h / 2), m, bevel=0.05, group="beyond")
        box(f"beyond{k}_cap", (x1 - x0 + 0.3, abs(y1 - y0) + 0.3, 0.32), ((x0 + x1) / 2, (y0 + y1) / 2, h - 0.16), beyond_trim, bevel=0.03, group="beyond")
        box(f"beyond{k}_course", (x1 - x0 + 0.16, abs(y1 - y0) + 0.16, 0.14), ((x0 + x1) / 2, (y0 + y1) / 2, 3.6), beyond_trim, bevel=0.01, group="beyond")
        # window rhythm on the faces that look at the block
        if y0 >= FRONT + 20:
            cols = max(2, int((x1 - x0) / 3.2))
            for f in range(int(h / 3.2)):
                for c in range(cols):
                    xc = x0 + (x1 - x0) * (c + 0.5) / cols
                    box(f"beyond{k}_w{f}{c}", (1.1, 0.2, 1.5), (xc, y0 - 0.02, 1.9 + f * 3.2), mat_surface("reveal", "#3a3d3f"), bevel=0, group="beyond")
                    box(f"beyond{k}_s{f}{c}", (1.3, 0.16, 0.08), (xc, y0 - 0.08, 1.1 + f * 3.2), beyond_trim, bevel=0.01, group="beyond")

    # --- street furniture --------------------------------------------------
    _furniture(W, frame, trim)
    if cars:
        _cars(glass)

    # --- world / sky ---------------------------------------------------------
    world = bpy.data.worlds.new("MainSt")
    world.use_nodes = True
    nt = world.node_tree
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "SINGLE_SCATTERING"
    sky.sun_disc = True
    sky.sun_size = math.radians(0.45)
    sky.altitude = 40
    sky.air_density = 1.2
    sky.aerosol_density = 2.2
    sky.ozone_density = 1.6
    bg = nt.nodes["Background"]
    nt.links.new(sky.outputs[0], bg.inputs[0])
    scene.world = world
    W.sun = sky
    W.sky_bg = bg
    return W


# --------------------------------------------------------------------------
# A shopfront building
# --------------------------------------------------------------------------
def _build_shop(W: World, lot: Lot, i: int, trim, fascia, frame, door, glass, dark_glass, sign, screen_images):
    body = mat_surface(f"body_{lot.id}", lot.body, rough=0.88, bump=0.25, scale=6, dirt=0.16, courses=0.12 if lot.id in ("pharmacy", "barber", "gym") else 0.0)
    riser = mat_surface("riser", P.riser, rough=0.7, spec=0.5, bump=0.15, scale=10)
    x0, x1, w, cx = lot.x0, lot.x1, lot.w, lot.cx
    y0 = FRONT  # frontage plane
    y1 = FRONT + lot.depth
    cy = (y0 + y1) / 2
    H = GROUND + lot.storeys * STOREY
    g = f"lot_{lot.id}"
    pier = 0.7
    open_w = w - 2 * pier

    # ground storey: two piers and the body behind the shop (the room is a real box)
    for sx, px in ((-1, x0 + pier / 2), (1, x1 - pier / 2)):
        box(f"{g}_pier{sx}", (pier, lot.depth, GROUND), (px, cy, GROUND / 2), body, bevel=0.03, group=g)
    room_d = 7.5
    box(f"{g}_rear", (open_w + 0.02, lot.depth - room_d, GROUND), (cx, y0 + room_d + (lot.depth - room_d) / 2, GROUND / 2), body, bevel=0.03, group=g)
    # upper storeys as one mass with a string course between floors
    box(f"{g}_upper", (w, lot.depth, H - GROUND), (cx, cy, GROUND + (H - GROUND) / 2), body, bevel=0.04, group=g)
    box(f"{g}_string", (w + 0.16, lot.depth + 0.16, 0.16), (cx, cy, GROUND + 0.02), trim, bevel=0.02, group=g)
    box(f"{g}_cornice", (w + 0.36, lot.depth + 0.36, 0.34), (cx, cy, H - 0.17), trim, bevel=0.03, group=g)
    box(f"{g}_cornice2", (w + 0.2, lot.depth + 0.2, 0.1), (cx, cy, H - 0.5), trim, bevel=0.01, group=g)
    # parapet, roof, rooftop plant
    for (bx, by, bw, bd) in ((cx, y0 + 0.2, w, 0.4), (cx, y1 - 0.2, w, 0.4), (x0 + 0.2, cy, 0.4, lot.depth), (x1 - 0.2, cy, 0.4, lot.depth)):
        box(f"{g}_parapet{bx}{by}", (bw, bd, 0.55), (bx, by, H + 0.275), body, bevel=0.02, group=g)
    plane(f"{g}_roof", (w - 0.8, lot.depth - 0.8), (cx, cy, H + 0.02), mat_surface("roofgravel", "#66696a", rough=1.0, bump=0.6, scale=60), group=g)
    hv = mat_surface("hvac", "#8e8d88", rough=0.6, metallic=0.4)
    box(f"{g}_hvac", (1.6, 1.2, 0.9), (cx + w * 0.22, cy + 1.0, H + 0.45), hv, bevel=0.03, group=g)
    vent = mat_surface("vent", "#7a7b78", rough=0.5, metallic=0.5)
    for vi in range(2 + i % 2):
        vx = x0 + 1.4 + vi * (w - 2.8) / 2
        cylinder(f"{g}_vent{vi}", 0.14, 0.7 + 0.2 * vi, (vx, cy - lot.depth * 0.28 + vi * 0.9, H + 0.4), vent, group=g, verts=10)
        cylinder(f"{g}_ventcap{vi}", 0.2, 0.06, (vx, cy - lot.depth * 0.28 + vi * 0.9, H + 0.78 + 0.2 * vi), vent, group=g, verts=10)
    if i % 2 == 1:
        box(f"{g}_skylight", (2.2, 1.4, 0.3), (cx - w * 0.2, cy + lot.depth * 0.2, H + 0.16), mat_glass("skylightglass", tint="#8fa3a8", alpha_tint=0.6), bevel=0.02, group=g)
    # downpipes at the party walls, and an AC unit in one upper window
    pipe = mat_surface("pipe", "#55585a", rough=0.6, metallic=0.3)
    cylinder(f"{g}_downpipe", 0.06, H - 0.4, (x0 + 0.34, y0 - 0.09, (H - 0.4) / 2 + 0.2), pipe, group=g, verts=8)
    if lot.bulkhead:
        box(f"{g}_bulkhead", (3.0, 3.6, 2.6), (cx - w * 0.2, y1 - 3.0, H + 1.3), body, bevel=0.03, group=g)
    # upper windows: recessed reveals with pale sills, warm cards behind some
    cols = max(2, round(w / 3.1))
    sp = w / cols
    W.upper_windows[lot.id] = []
    for k in range(lot.storeys):
        zc = GROUND + k * STOREY + STOREY * 0.52
        for c in range(cols):
            xc = x0 + sp * (c + 0.5)
            box(f"{g}_reveal{k}{c}", (1.15, 0.42, 1.7), (xc, y0 + 0.2, zc), mat_surface("reveal", "#3a3d3f", rough=0.9), bevel=0, group=g)
            wg = plane(f"{g}_wglass{k}{c}", (1.15, 1.7), (xc, y0 + 0.32, zc), dark_glass, group=g, rot=(math.pi / 2, 0, 0))
            box(f"{g}_sill{k}{c}", (1.35, 0.22, 0.08), (xc, y0 - 0.06, zc - 0.9), trim, bevel=0.01, group=g)
            if (k * 3 + c * 5 + i) % 7 == 2:
                box(f"{g}_ac{k}{c}", (0.7, 0.5, 0.45), (xc, y0 - 0.22, zc - 0.55), mat_surface("acunit", "#c9c6bd", rough=0.6), bevel=0.02, group=g)
            card = plane(f"{g}_wcard{k}{c}", (1.1, 1.65), (xc, y0 + 0.28, zc), mat_emissive(f"{g}_wcard{k}{c}", P.warm, 0.0, base="#8a8479" if (k * 3 + c * 5 + i) % 3 == 0 else "#5e574f"), group=g, rot=(math.pi / 2, 0, 0))
            W.upper_windows[lot.id].append(card)
            W.tracks[f"win_{lot.id}_{k}_{c}"] = empty(f"track_win_{lot.id}_{k}_{c}", (xc, y0 - 0.05, zc))
    # the shopfront: stall riser, glass, mullions, transom, fascia with the sign
    riser_h = 0.55
    box(f"{g}_riser", (open_w, 0.3, riser_h), (cx, y0 + 0.15, riser_h / 2), riser, bevel=0.02, group=g)
    glass_top = GROUND - 0.85
    glass_h = glass_top - riser_h
    # a transom rail two thirds of the way up, so the glass has a top light
    box(f"{g}_transom", (open_w, 0.1, 0.06), (cx, y0 + 0.12, riser_h + glass_h * 0.72), frame, bevel=0.005, group=g)
    door_w = 1.6
    # door on the right third, recessed
    dx = cx + open_w * 0.22 if lot.interior != "pharmacy" else cx - open_w * 0.22
    recess = 0.7
    for side, gx0, gx1 in (("L", x0 + pier, dx - door_w / 2 - 0.35), ("R", dx + door_w / 2 + 0.35, x1 - pier)):
        gw = gx1 - gx0
        if gw > 0.2:
            plane(f"{g}_glass{side}", (gw, glass_h), ((gx0 + gx1) / 2, y0 + 0.12, riser_h + glass_h / 2), glass, group=g, rot=(math.pi / 2, 0, 0))
            # a mullion or two so the glass has rhythm
            n = max(1, round(gw / 2.4))
            for m in range(1, n):
                box(f"{g}_mull{side}{m}", (0.06, 0.1, glass_h), (gx0 + gw * m / n, y0 + 0.12, riser_h + glass_h / 2), frame, bevel=0.005, group=g)
    # door reveal walls, the door itself set back, a transom over it
    for sx in (-1, 1):
        box(f"{g}_jamb{sx}", (0.35, recess, glass_top), (dx + sx * (door_w / 2 + 0.175), y0 + recess / 2, glass_top / 2), body, bevel=0.01, group=g)
    box(f"{g}_door", (door_w, 0.06, 2.3), (dx, y0 + recess, 1.15), door, bevel=0.005, group=g)
    plane(f"{g}_doorglass", (door_w - 0.3, 1.5), (dx, y0 + recess - 0.03, 1.35), glass, group=g, rot=(math.pi / 2, 0, 0))
    box(f"{g}_doorhead", (door_w + 0.7, recess, glass_top - 2.3), (dx, y0 + recess / 2, 2.3 + (glass_top - 2.3) / 2), body, bevel=0.01, group=g)
    plane(f"{g}_recessfloor", (door_w + 0.7, recess), (dx, y0 + recess / 2, 0.015), mat_concrete("recess", "#9a958c", score=False), group=g)
    box(f"{g}_mat", (door_w - 0.2, 0.7, 0.012), (dx, y0 - 0.45, CURB_H + 0.006), mat_surface("doormat", "#3a3733", rough=1.0), bevel=0, group=g)
    # a planter beside the door; bistro tables for the café; an A-board for the restaurant
    pot = mat_surface("planter", "#4a4744", rough=0.8)
    leaf = mat_surface("leaf", "#4b5a48", rough=0.95)
    px_ = dx + (door_w / 2 + 0.95) * (1 if dx > lot.cx else -1)
    box(f"{g}_planter", (0.55, 0.55, 0.6), (px_, y0 - 0.5, 0.3 + CURB_H), pot, bevel=0.02, group=g)
    o = box(f"{g}_plant", (0.7, 0.7, 0.5), (px_, y0 - 0.5, 0.85 + CURB_H), leaf, bevel=0.22, group=g, shade_smooth=True)
    o.modifiers["bevel"].segments = 5
    if lot.interior == "cafe":
        for k, tx in enumerate((lot.x0 + 2.6, lot.x0 + 4.4)):
            cylinder(f"{g}_bistro{k}", 0.3, 0.025, (tx, y0 - 1.5, 0.72 + CURB_H), mat_surface("bistro", "#c9c2b6", rough=0.35, spec=0.6), group=g)
            cylinder(f"{g}_bistropost{k}", 0.025, 0.7, (tx, y0 - 1.5, 0.35 + CURB_H), mat_surface("black", "#1e2021", rough=0.5, metallic=0.5), group=g, verts=8)
            for a in (-0.55, 0.55):
                box(f"{g}_bchair{k}{a}", (0.38, 0.38, 0.42), (tx + a, y0 - 1.5, 0.21 + CURB_H), mat_surface("black", "#1e2021"), bevel=0.02, group=g)
    if lot.interior == "restaurant":
        mesh = bpy.data.meshes.new(f"{g}_aboard")
        ax = lot.x0 + 2.2
        v = [(ax - 0.3, y0 - 1.0, CURB_H), (ax + 0.3, y0 - 1.0, CURB_H), (ax, y0 - 0.7, CURB_H + 1.0), (ax - 0.3, y0 - 0.4, CURB_H), (ax + 0.3, y0 - 0.4, CURB_H)]
        mesh.from_pydata(v, [], [(0, 1, 2), (3, 2, 4)])
        mesh.update()
        ob = bpy.data.objects.new(f"{g}_aboard", mesh)
        mesh.materials.append(mat_surface("aboard", "#2b2d2e", rough=0.9))
        _link(ob, g)
    W.doors[lot.id] = Vector((dx, y0 + recess, 0))
    W.tracks[f"door_{lot.id}"] = empty(f"track_door_{lot.id}", (dx, y0 + 0.05, 0.0))
    if lot.screen:
        pm = mat_emissive(f"plaque_{lot.id}", P.mint, 0.0, base="#243330")
        px = dx + (door_w / 2 + 0.175) * (1 if dx > lot.cx else -1)
        box(f"{g}_plaque", (0.16, 0.03, 0.22), (px, y0 - 0.015, 1.45), pm, bevel=0.004, group=g)
        W.plaques[lot.id] = pm
        W.tracks[f"plaque_{lot.id}"] = empty(f"track_plaque_{lot.id}", (px, y0 - 0.03, 1.45))
    # fascia and sign
    box(f"{g}_fascia", (open_w + 0.1, 0.22, GROUND - glass_top), (cx, y0 + 0.11, glass_top + (GROUND - glass_top) / 2), fascia, bevel=0.01, group=g)
    if lot.sign:
        text(f"{g}_sign", lot.sign, 0.42, (cx, y0 - 0.01, glass_top + (GROUND - glass_top) / 2 - 0.02), sign, group=g, spacing=1.25)
    # awning: a fabric wedge with a valance
    if lot.awning:
        aw = mat_surface(f"awning_{lot.id}", lot.awning, rough=0.95)
        proj = 1.9
        z_top = glass_top + 0.1
        z_bot = z_top - 0.75
        mesh = bpy.data.meshes.new(f"{g}_awning")
        ax0, ax1 = x0 + pier + 0.15, x1 - pier - 0.15
        zm = z_top - 0.75 * 0.55 - 0.05
        ym = y0 - proj * 0.5
        v = [(ax0, y0, z_top), (ax1, y0, z_top), (ax1, ym, zm), (ax0, ym, zm), (ax1, y0 - proj, z_bot), (ax0, y0 - proj, z_bot), (ax0, y0 - proj, z_bot - 0.26), (ax1, y0 - proj, z_bot - 0.26)]
        mesh.from_pydata(v, [], [(0, 1, 2, 3), (3, 2, 4, 5), (5, 4, 7, 6), (0, 3, 5, 6), (1, 7, 4, 2)])
        mesh.update()
        ob = bpy.data.objects.new(f"{g}_awning", mesh)
        mesh.materials.append(aw)
        _link(ob, g)
        for ax in (ax0 + 0.05, ax1 - 0.05):
            cylinder(f"{g}_awnarm{ax}", 0.02, proj * 1.1, (ax, y0 - proj / 2, z_top - 0.35), frame, group=g, rot=(-math.atan2(0.75, proj) + math.pi / 2, 0, 0))
    # interior: floor, walls, ceiling with light, counter, shelves, and the Uptick screen
    _interior(W, lot, g, dx, open_w, room_d, glass_top, screen_images)


def _interior(W: World, lot: Lot, g: str, dx: float, open_w: float, room_d: float, ceiling: float, screen_images):
    x0, x1, cx = lot.x0 + 0.7, lot.x1 - 0.7, lot.cx
    y0, y1 = FRONT, FRONT + room_d
    floor = mat_surface("interior_floor", P.interior_floor, rough=0.7, spec=0.5)
    if lot.interior == "pharmacy":
        floor = mat_surface("interior_floor_pale", "#c9c4ba", rough=0.55, spec=0.6)
    wall = mat_surface("interior_wall", "#cdc6b9", rough=0.9)
    plane(f"{g}_floor", (open_w, room_d), (cx, (y0 + y1) / 2, 0.02), floor, group=g)
    plane(f"{g}_ceiling", (open_w, room_d), (cx, (y0 + y1) / 2, ceiling), mat_surface("ceiling", "#e6e1d6", rough=0.9), group=g, rot=(math.pi, 0, 0))
    plane(f"{g}_backwall", (open_w, ceiling), (cx, y1 - 0.05, ceiling / 2), wall, group=g, rot=(-math.pi / 2, 0, 0))
    for sx, wx in ((-1, x0 + 0.02), (1, x1 - 0.02)):
        plane(f"{g}_sidewall{sx}", (room_d, ceiling), (wx, (y0 + y1) / 2, ceiling / 2), wall, group=g, rot=(math.pi / 2, 0, sx * math.pi / 2))
    warm = P.warm if lot.interior not in ("pharmacy", "gym") else P.cool_white
    strength = {"cafe": 2.2, "restaurant": 1.8, "pharmacy": 2.6, "gym": 1.2, "barber": 2.0}.get(lot.interior, 2.0)
    lights, ems = [], []
    # ceiling fixtures: two or three emissive troughs, plus one area light that does the real work
    n = 2 if open_w < 9 else 3
    for k in range(n):
        lx = x0 + open_w * (k + 0.5) / n
        em = mat_emissive(f"{g}_trough{k}", warm, 0.0, base="#efe9dd")
        box(f"{g}_trough{k}", (min(2.4, open_w / n - 0.8), 0.18, 0.05), (lx, y0 + room_d * 0.45, ceiling - 0.05), em, bevel=0.005, group=g)
        ems.append(em)
    ld = bpy.data.lights.new(f"{g}_light", "AREA")
    ld.shape = "RECTANGLE"
    ld.size = open_w * 0.8
    ld.size_y = room_d * 0.6
    ld.energy = 0.0
    ld.color = srgb(warm)[:3]
    lo = bpy.data.objects.new(f"{g}_light", ld)
    lo.location = (cx, y0 + room_d * 0.5, ceiling - 0.08)
    _link(lo, g)
    lights.append(lo)
    # spill: a soft light in the glass line facing the street, so the pavement in front of a lit shop pools
    sd = bpy.data.lights.new(f"{g}_spill", "AREA")
    sd.shape = "RECTANGLE"
    sd.size = open_w * 0.9
    sd.size_y = ceiling * 0.6
    sd.energy = 0.0
    sd.color = srgb(warm)[:3]
    sd.spread = math.radians(110)
    so = bpy.data.objects.new(f"{g}_spill", sd)
    so.location = (cx, y0 + 0.3, ceiling * 0.55)
    so.rotation_euler = (math.radians(90), 0, math.pi)
    _link(so, g)
    W.spills[lot.id] = so
    W.interior_lights[lot.id] = lights
    W.interior_emissives[lot.id] = ems
    counter = mat_surface("counter", P.counter, rough=0.6)
    ctop = mat_surface("countertop", P.counter_top, rough=0.35, spec=0.6)
    shelf = mat_surface("shelf", P.shelf, rough=0.8)
    # the counter sits across from the door so the room has a silhouette; the screen sits at its end
    counter_w = min(3.6, open_w * 0.45)
    ccx = cx - open_w * 0.18 if dx > cx else cx + open_w * 0.18
    ccy = y0 + (2.6 if lot.interior == "cafe" else 2.2)
    if lot.interior in ("cafe", "barber", "restaurant"):
        # counter along the side wall, parallel to the street
        box(f"{g}_counter", (counter_w, 0.7, 0.95), (ccx, ccy, 0.475), counter, bevel=0.015, group=g)
        box(f"{g}_ctop", (counter_w + 0.06, 0.78, 0.05), (ccx, ccy, 0.975), ctop, bevel=0.01, group=g)
    else:
        box(f"{g}_counter", (counter_w, 0.7, 0.95), (ccx, ccy, 0.475), counter, bevel=0.015, group=g)
        box(f"{g}_ctop", (counter_w + 0.06, 0.78, 0.05), (ccx, ccy, 0.975), ctop, bevel=0.01, group=g)
    if lot.interior == "cafe":
        # espresso machine, pastry case, pendants, two small tables
        box(f"{g}_espresso", (0.8, 0.5, 0.45), (ccx - counter_w * 0.05, ccy + 0.05, 1.22), mat_surface("steel", "#b9bcc0", rough=0.25, metallic=0.8), bevel=0.02, group=g)
        box(f"{g}_case", (1.1, 0.55, 0.42), (ccx - counter_w * 0.34, ccy - 0.05, 1.21), mat_glass("caseglass", tint="#dfe6e6", alpha_tint=0.9), bevel=0.0, group=g)
        for k, tx in enumerate((cx + open_w * 0.28, cx + open_w * 0.28, cx + open_w * 0.05)):
            ty = y0 + 1.9 + k * 2.1
            cylinder(f"{g}_table{k}", 0.35, 0.03, (tx, ty, 0.74), ctop, group=g)
            cylinder(f"{g}_tablepost{k}", 0.03, 0.72, (tx, ty, 0.37), mat_surface("black", "#1e2021", rough=0.5, metallic=0.5), group=g)
            for a in (0.55, -0.55):
                box(f"{g}_chair{k}{a}", (0.4, 0.4, 0.45), (tx + a, ty, 0.225), counter, bevel=0.01, group=g)
        for k in range(3):
            px = x0 + open_w * (k + 0.5) / 3
            em = mat_emissive(f"{g}_pendant{k}", P.warm, 0.0, base="#d9c9a8")
            cylinder(f"{g}_pendant{k}", 0.09, 0.14, (px, y0 + 2.6, ceiling - 0.9), em, group=g)
            ems.append(em)
            cylinder(f"{g}_pendantcord{k}", 0.006, 0.8, (px, y0 + 2.6, ceiling - 0.45), mat_surface("black", "#1e2021"), group=g, verts=6)
    elif lot.interior == "pharmacy":
        for k in range(3):
            sy = y0 + 3.4 + k * 1.3
            box(f"{g}_gondola{k}", (open_w * 0.62, 0.5, 1.6), (cx, sy, 0.8), shelf, bevel=0.01, group=g)
            for j in range(6):
                gm = mat_surface(f"goods{j % 4}", P.goods[j % 4], rough=0.7)
                box(f"{g}_goods{k}{j}", (open_w * 0.62 / 6 - 0.1, 0.56, 0.22), (cx - open_w * 0.31 + open_w * 0.62 * (j + 0.5) / 6, sy, 1.1 + (j % 2) * 0.35), gm, bevel=0.005, group=g)
        # a quiet cross, off-white, not neon
        cross = mat_emissive("cross", "#efeae0", 0.5, base="#dcd7cc")
        box(f"{g}_crossv", (0.18, 0.06, 0.62), (lot.cx - open_w * 0.36, y0 - 0.32, GROUND + 0.9), cross, bevel=0.005, group=g)
        box(f"{g}_crossh", (0.62, 0.06, 0.18), (lot.cx - open_w * 0.36, y0 - 0.32, GROUND + 0.9), cross, bevel=0.005, group=g)
        box(f"{g}_crossarm", (0.05, 0.36, 0.05), (lot.cx - open_w * 0.36, y0 - 0.16, GROUND + 0.9), mat_surface("frame", P.frame), bevel=0, group=g)
    elif lot.interior == "gym":
        for k in range(4):
            box(f"{g}_machine{k}", (0.7, 1.6, 1.3), (x0 + 1.2 + k * 2.3, y0 + 4.2, 0.65), mat_surface("black", "#1e2021"), bevel=0.02, group=g)
    elif lot.interior == "restaurant":
        for k in range(4):
            tx = x0 + 1.4 + (k % 2) * 3.2
            ty = y0 + 2.0 + (k // 2) * 2.6
            box(f"{g}_rtable{k}", (0.9, 0.9, 0.05), (tx, ty, 0.74), ctop, bevel=0.01, group=g)
            cylinder(f"{g}_rpost{k}", 0.04, 0.72, (tx, ty, 0.37), mat_surface("black", "#1e2021"), group=g)
    elif lot.interior == "barber":
        for k in range(2):
            box(f"{g}_chair{k}", (0.65, 0.65, 0.5), (x0 + 1.5 + k * 1.8, y0 + 3.4, 0.6), counter, bevel=0.03, group=g)
            plane(f"{g}_mirror{k}", (1.0, 1.2), (x0 + 1.5 + k * 1.8, y1 - 0.08, 1.7), mat_surface("mirror", "#ffffff", rough=0.02, metallic=1.0), group=g, rot=(-math.pi / 2, 0, 0))
    # shelving along one side for every shop, so the rooms are not empty
    if lot.interior in ("cafe", "barber", "restaurant"):
        box(f"{g}_backbar", (open_w * 0.5, 0.35, 2.1), (cx - open_w * 0.2, y1 - 0.25, 1.05), shelf, bevel=0.01, group=g)
        for j in range(3):
            box(f"{g}_shelfline{j}", (open_w * 0.48, 0.32, 0.03), (cx - open_w * 0.2, y1 - 0.25, 0.5 + j * 0.5), ctop, bevel=0, group=g)
    # the Uptick screen on the counter, facing the queue
    if lot.screen:
        sx = ccx + counter_w / 2 - 0.45
        sy = ccy - (0.12 if lot.interior == "cafe" else 0.12)
        _uptick_unit(W, lot.id, (sx, sy, 1.0), yaw=math.radians(56) if lot.interior == "cafe" else math.radians(-45), screen_image=screen_images.get(lot.id), group=g)


def _uptick_unit(W: World, key: str, loc, yaw: float, screen_image, group: str):
    """The 21" counter unit: a dark slab on a wedge foot, the panel a 16:9 emissive plane."""
    PW, PH = 0.465, 0.465 * 9 / 16
    enclosure = mat_surface("enclosure", "#15181b", rough=0.35, metallic=0.5, coat=0.4)
    root = bpy.data.objects.new(f"unit_{key}", None)
    root.location = loc
    root.rotation_euler = (0, 0, yaw)
    _link(root, group)
    foot = box(f"unit_{key}_foot", (0.24, 0.17, 0.035), (0, 0, 0.0175), enclosure, bevel=0.006, group=group)
    slab = box(f"unit_{key}_slab", (PW + 0.024, 0.02, PH + 0.024), (0, 0.03, 0.045 + PH / 2 + 0.012), enclosure, bevel=0.005, group=group, rot=(math.radians(-8), 0, 0))
    mat = mat_screen(f"screen_{key}", screen_image, hexstr="#0b1c22", strength=0.0)
    panel = plane(f"unit_{key}_panel", (PW, PH), (0, 0.03 - 0.0115, 0.045 + PH / 2 + 0.012), mat, group=group, rot=(math.radians(90 - 8), 0, 0))
    led = plane(f"unit_{key}_led", (0.014, 0.0018), (0, 0.03 - 0.012, 0.045 + 0.006), mat_emissive(f"led_{key}", P.mint, 0.0, base="#2b3a37"), group=group, rot=(math.radians(90 - 8), 0, 0))
    for o in (foot, slab, panel, led):
        o.parent = root
    # four corner empties on the panel, for the homography track
    corners = []
    for name, (ux, uz) in (("tl", (-PW / 2, PH / 2)), ("tr", (PW / 2, PH / 2)), ("br", (PW / 2, -PH / 2)), ("bl", (-PW / 2, -PH / 2))):
        e = empty(f"track_screen_{key}_{name}", (0, 0, 0))
        e.parent = panel
        e.location = (ux, uz, 0.0)
        corners.append(e)
        W.tracks[f"screen_{key}_{name}"] = e
    W.screens[key] = {"root": root, "panel": panel, "mat": mat, "led": led, "corners": corners}


# --------------------------------------------------------------------------
# Joe's Fuel & Go
# --------------------------------------------------------------------------
def _build_joes(W: World, lot: Lot, forecourt, trim, fascia, frame, door, glass, sign, screen_images):
    g = "lot_joes"
    x0, x1, cx = lot.x0, lot.x1, lot.cx
    y0 = FRONT
    body = mat_surface("body_joes", lot.body, rough=0.88, bump=0.25, scale=6)
    # forecourt slab with a shallow apron to the sidewalk; a low kerb to the neighbours
    fc_d = 12.0
    box(f"{g}_forecourt", (lot.w, fc_d, CURB_H + 0.01), (cx, y0 + fc_d / 2 - 0.5, (CURB_H + 0.01) / 2), forecourt, bevel=0, group=g)
    for sx, px in ((-1, x0 + 0.2), (1, x1 - 0.2)):
        box(f"{g}_kerb{sx}", (0.4, fc_d, 0.42), (px, y0 + fc_d / 2 - 0.5, 0.21), trim, bevel=0.02, group=g)
    # the store, at the rear of the lot
    store_w, store_d, store_h = 15.0, 9.0, 4.4
    sy0 = y0 + fc_d - 0.5
    sy1 = sy0 + store_d
    scx = cx + 2.0
    room_d = 7.5
    pier = 0.7
    open_w = store_w - 2 * pier
    for sx, px in ((-1, scx - store_w / 2 + pier / 2), (1, scx + store_w / 2 - pier / 2)):
        box(f"{g}_pier{sx}", (pier, store_d, store_h), (px, (sy0 + sy1) / 2, store_h / 2), body, bevel=0.03, group=g)
    box(f"{g}_rear", (open_w + 0.02, store_d - room_d, store_h), (scx, sy0 + room_d + (store_d - room_d) / 2, store_h / 2), body, bevel=0.03, group=g)
    box(f"{g}_cornice", (store_w + 0.3, store_d + 0.3, 0.3), (scx, (sy0 + sy1) / 2, store_h - 0.15), trim, bevel=0.03, group=g)
    plane(f"{g}_roof", (store_w - 0.6, store_d - 0.6), (scx, (sy0 + sy1) / 2, store_h + 0.02), mat_surface("roof", "#5d605f", rough=0.98, bump=0.3, scale=30), group=g)
    box(f"{g}_hvac", (1.8, 1.3, 0.9), (scx + 4, sy0 + 6, store_h + 0.45), mat_surface("hvac", "#8e8d88", rough=0.6, metallic=0.4), bevel=0.03, group=g)
    # the rest of the lot behind the store: a service yard wall and a dumpster, so the lot is deep
    box(f"{g}_yardwall", (lot.w, 0.3, 2.4), (cx, y0 + lot.depth - 0.15, 1.2), body, bevel=0.02, group=g)
    # store front: riser, glass wall, door, fascia with the name, an ice box by the door
    riser_h = 0.55
    glass_top = store_h - 0.95
    glass_h = glass_top - riser_h
    box(f"{g}_riser", (open_w, 0.3, riser_h), (scx, sy0 + 0.15, riser_h / 2), trim, bevel=0.02, group=g)
    door_w = 2.4
    dx = scx - open_w * 0.2
    recess = 0.6
    for side, gx0, gx1 in (("L", scx - open_w / 2, dx - door_w / 2 - 0.3), ("R", dx + door_w / 2 + 0.3, scx + open_w / 2)):
        gw = gx1 - gx0
        plane(f"{g}_glass{side}", (gw, glass_h), ((gx0 + gx1) / 2, sy0 + 0.12, riser_h + glass_h / 2), glass, group=g, rot=(math.pi / 2, 0, 0))
        n = max(1, round(gw / 2.2))
        for m in range(1, n):
            box(f"{g}_mull{side}{m}", (0.06, 0.1, glass_h), (gx0 + gw * m / n, sy0 + 0.12, riser_h + glass_h / 2), frame, bevel=0.005, group=g)
    for sx in (-1, 1):
        box(f"{g}_jamb{sx}", (0.3, recess, glass_top), (dx + sx * (door_w / 2 + 0.15), sy0 + recess / 2, glass_top / 2), body, bevel=0.01, group=g)
    # a double glass door with a slim frame, a mat, and a light over the entrance
    for sx in (-1, 1):
        box(f"{g}_doorframe{sx}", (0.06, 0.06, 2.3), (dx + sx * (door_w / 2 - 0.03), sy0 + recess, 1.15), frame, bevel=0.003, group=g)
        plane(f"{g}_doorglass{sx}", (door_w / 2 - 0.12, 2.1), (dx + sx * door_w / 4, sy0 + recess, 1.15), glass, group=g, rot=(math.pi / 2, 0, 0))
        box(f"{g}_doorbar{sx}", (door_w / 2 - 0.3, 0.04, 0.04), (dx + sx * door_w / 4, sy0 + recess - 0.05, 1.05), mat_surface("steel", "#b9bcc0", rough=0.25, metallic=0.8), bevel=0.005, group=g)
    box(f"{g}_doormid", (0.06, 0.06, 2.3), (dx, sy0 + recess, 1.15), frame, bevel=0.003, group=g)
    box(f"{g}_doorhead", (door_w + 0.6, recess, glass_top - 2.3), (dx, sy0 + recess / 2, 2.3 + (glass_top - 2.3) / 2), body, bevel=0.01, group=g)
    box(f"{g}_mat", (door_w - 0.2, 0.8, 0.012), (dx, sy0 - 0.5, CURB_H + 0.006), mat_surface("doormat", "#3a3733", rough=1.0), bevel=0, group=g)
    W.entrance_mat = mat_emissive("joes_entrance", P.cool_white, 0.0, base="#d5d1c7")
    box(f"{g}_entrylight", (door_w, 0.3, 0.05), (dx, sy0 + recess / 2, glass_top - 0.05), W.entrance_mat, bevel=0, group=g)
    W.doors["joes"] = Vector((dx, sy0 + recess, 0))
    W.tracks["door_joes"] = empty("track_door_joes", (dx, sy0 + 0.05, 0.0))
    box(f"{g}_fascia", (open_w + 0.1, 0.22, store_h - glass_top), (scx, sy0 + 0.11, glass_top + (store_h - glass_top) / 2), fascia, bevel=0.01, group=g)
    W.joes_sign_mat = mat_emissive("joes_sign", P.sign, 0.0, base="#d9d4c9")
    box(f"{g}_signplate", (2.2, 0.03, 0.34), (scx, sy0 - 0.005, glass_top + (store_h - glass_top) / 2), W.joes_sign_mat, bevel=0.004, group=g)
    box(f"{g}_icebox", (1.2, 0.8, 1.7), (scx + open_w / 2 - 1.0, sy0 - 0.5, 0.85), mat_surface("icebox", "#dcd8cf", rough=0.5), bevel=0.02, group=g)
    # interior
    floor = mat_surface("interior_floor_joes", "#a39b8e", rough=0.6, spec=0.55)
    wall = mat_surface("interior_wall", "#cdc6b9", rough=0.9)
    ceiling = glass_top
    plane(f"{g}_floor", (open_w, room_d), (scx, sy0 + room_d / 2, 0.02), floor, group=g)
    plane(f"{g}_ceiling", (open_w, room_d), (scx, sy0 + room_d / 2, ceiling), mat_surface("ceiling", "#e6e1d6", rough=0.9), group=g, rot=(math.pi, 0, 0))
    plane(f"{g}_backwall", (open_w, ceiling), (scx, sy0 + room_d - 0.05, ceiling / 2), wall, group=g, rot=(-math.pi / 2, 0, 0))
    for sx, wx in ((-1, scx - open_w / 2 + 0.02), (1, scx + open_w / 2 - 0.02)):
        plane(f"{g}_sidewall{sx}", (room_d, ceiling), (wx, sy0 + room_d / 2, ceiling / 2), wall, group=g, rot=(math.pi / 2, 0, sx * math.pi / 2))
    ems, lights = [], []
    for k in range(3):
        lx = scx - open_w / 2 + open_w * (k + 0.5) / 3
        em = mat_emissive(f"{g}_trough{k}", P.warm, 0.0, base="#efe9dd")
        box(f"{g}_trough{k}", (2.6, 0.18, 0.05), (lx, sy0 + room_d * 0.45, ceiling - 0.05), em, bevel=0.005, group=g)
        ems.append(em)
    ld = bpy.data.lights.new(f"{g}_light", "AREA")
    ld.shape = "RECTANGLE"
    ld.size = open_w * 0.8
    ld.size_y = room_d * 0.6
    ld.energy = 0.0
    ld.color = srgb(P.warm)[:3]
    lo = bpy.data.objects.new(f"{g}_light", ld)
    lo.location = (scx, sy0 + room_d * 0.5, ceiling - 0.08)
    _link(lo, g)
    lights.append(lo)
    W.interior_lights["joes"] = lights
    sec = bpy.data.lights.new(f"{g}_security", "POINT")
    sec.energy = 0.0
    sec.color = srgb("#ffd9a8")[:3]
    sec.shadow_soft_size = 0.5
    seco = bpy.data.objects.new(f"{g}_security", sec)
    seco.location = (scx + open_w * 0.25, sy0 + room_d * 0.55, ceiling - 0.3)
    _link(seco, g)
    W.security = seco
    W.interior_emissives["joes"] = ems
    counter = mat_surface("counter", P.counter, rough=0.6)
    ctop = mat_surface("countertop", P.counter_top, rough=0.35, spec=0.6)
    shelf = mat_surface("shelf", P.shelf, rough=0.8)
    ccx = scx + open_w * 0.22
    ccy = sy0 + 2.4
    box(f"{g}_counter", (3.4, 0.7, 0.95), (ccx, ccy, 0.475), counter, bevel=0.015, group=g)
    box(f"{g}_ctop", (3.46, 0.78, 0.05), (ccx, ccy, 0.975), ctop, bevel=0.01, group=g)
    # coffee station: the reason the offer works
    box(f"{g}_coffee", (1.4, 0.5, 0.6), (ccx - 1.5, ccy + 0.02, 1.3), mat_surface("steel", "#b9bcc0", rough=0.25, metallic=0.8), bevel=0.015, group=g)
    for k in range(3):
        sy = sy0 + 3.6 + k * 1.25
        box(f"{g}_gondola{k}", (open_w * 0.55, 0.5, 1.5), (scx - open_w * 0.12, sy, 0.75), shelf, bevel=0.01, group=g)
        for j in range(7):
            gm = mat_surface(f"goods{j % 4}", P.goods[j % 4], rough=0.7)
            box(f"{g}_goods{k}{j}", (open_w * 0.55 / 7 - 0.1, 0.56, 0.2), (scx - open_w * 0.12 - open_w * 0.275 + open_w * 0.55 * (j + 0.5) / 7, sy, 1.05 + (j % 2) * 0.32), gm, bevel=0.005, group=g)
    box(f"{g}_cooler", (0.35, 4.0, 2.1), (scx + open_w / 2 - 0.3, sy0 + room_d - 2.6, 1.05), mat_glass("coolerglass", tint="#dfe6e6", alpha_tint=0.85), bevel=0, group=g)
    _uptick_unit(W, "joes", (ccx + 1.2, ccy - 0.1, 1.0), yaw=math.radians(-70), screen_image=screen_images.get("joes"), group=g)

    # the canopy: a deep slab on four columns, a pale fascia band, its own lights
    can_w, can_d, can_h, can_t = 17.0, 8.0, 5.4, 0.95
    can_cx, can_cy = cx - 1.0, y0 + 5.2
    W.joes_canopy_mat = mat_emissive("canopy_fascia", "#f0ebe1", 0.0, base="#e3ded3")
    box(f"{g}_canopy", (can_w, can_d, can_t), (can_cx, can_cy, can_h + can_t / 2), mat_surface("canopy_body", "#3f4345", rough=0.6, metallic=0.2), bevel=0.04, group=g)
    for side, (fx, fy, fw, fd) in {"S": (can_cx, can_cy - can_d / 2 - 0.05, can_w + 0.1, 0.1), "N": (can_cx, can_cy + can_d / 2 + 0.05, can_w + 0.1, 0.1), "E": (can_cx + can_w / 2 + 0.05, can_cy, 0.1, can_d + 0.1), "W": (can_cx - can_w / 2 - 0.05, can_cy, 0.1, can_d + 0.1)}.items():
        box(f"{g}_canopyband{side}", (fw, fd, can_t * 0.55), (fx, fy, can_h + can_t / 2), W.joes_canopy_mat, bevel=0.01, group=g)
        box(f"{g}_canopydrip{side}", (fw + 0.04, fd + 0.04, 0.06), (fx, fy, can_h + can_t * 0.225 - 0.03), mat_surface("canopy_body", "#3f4345"), bevel=0, group=g)
    text(f"{g}_canopyname", "JOE'S FUEL & GO", 0.32, (can_cx, can_cy - can_d / 2 - 0.05, can_h + can_t / 2 + 0.07), mat_surface("canopy_text", "#3b3f41", rough=0.6), group=g, spacing=1.3)
    stripe = mat_surface("brand_stripe", "#8f3a2f", rough=0.55, spec=0.45)
    for side, (fx, fy, fw, fd) in {"S": (can_cx, can_cy - can_d / 2 - 0.03, can_w, 0.05), "N": (can_cx, can_cy + can_d / 2 + 0.03, can_w, 0.05), "E": (can_cx + can_w / 2 + 0.03, can_cy, 0.05, can_d), "W": (can_cx - can_w / 2 - 0.03, can_cy, 0.05, can_d)}.items():
        box(f"{g}_canopystripe{side}", (fw, fd, 0.13), (fx, fy, can_h + can_t * 0.225 + 0.075), stripe, bevel=0, group=g)
    plane(f"{g}_canopysoffit", (can_w - 0.4, can_d - 0.4), (can_cx, can_cy, can_h - 0.005), mat_surface("soffit", "#e9e5dc", rough=0.9), group=g, rot=(math.pi, 0, 0))
    W.canopy_strip = mat_emissive("canopy_strip", "#f6f1e6", 0.0, base="#8d8a83")
    for side, (fx, fy, fw, fd) in {"S": (can_cx, can_cy - can_d / 2 - 0.05, can_w, 0.03), "N": (can_cx, can_cy + can_d / 2 + 0.05, can_w, 0.03), "E": (can_cx + can_w / 2 + 0.05, can_cy, 0.03, can_d), "W": (can_cx - can_w / 2 - 0.05, can_cy, 0.03, can_d)}.items():
        box(f"{g}_canopystrip{side}", (fw, fd, 0.05), (fx, fy, can_h + 0.06), W.canopy_strip, bevel=0, group=g)
    W.interior_emissives.setdefault("joes_canopy", []).append(W.canopy_strip)
    W.joes_canopy_lights = []
    for k in range(4):
        lx = can_cx - can_w / 2 + can_w * (k + 0.5) / 4
        for ly in (can_cy - 2.0, can_cy + 2.0):
            em = mat_emissive(f"{g}_canlight{k}{ly}", P.cool_white, 0.0, base="#ddd9cf")
            box(f"{g}_canlight{k}{ly}", (1.2, 0.5, 0.04), (lx, ly, can_h - 0.02), em, bevel=0, group=g)
            W.interior_emissives.setdefault("joes_canopy", []).append(em)
    ld = bpy.data.lights.new(f"{g}_canopylight", "AREA")
    ld.shape = "RECTANGLE"
    ld.size = can_w * 0.8
    ld.size_y = can_d * 0.7
    ld.energy = 0.0
    ld.color = srgb(P.cool_white)[:3]
    lo = bpy.data.objects.new(f"{g}_canopylight", ld)
    lo.location = (can_cx, can_cy, can_h - 0.1)
    _link(lo, g)
    W.interior_lights["joes_canopy"] = [lo]
    W.forecourt_light = lo
    col = mat_surface("column", "#3a3d3f", rough=0.55, metallic=0.2)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"{g}_col{sx}{sy}", (0.55, 0.55, can_h), (can_cx + sx * (can_w / 2 - 0.9), can_cy + sy * (can_d / 2 - 1.5), can_h / 2), col, bevel=0.02, group=g)
            box(f"{g}_colbase{sx}{sy}", (1.1, 1.1, 0.25), (can_cx + sx * (can_w / 2 - 0.9), can_cy + sy * (can_d / 2 - 1.5), 0.125 + CURB_H), trim, bevel=0.02, group=g)
    # two pump islands, two dispensers each
    pump = mat_surface("pump", "#bdbab2", rough=0.45, spec=0.5)
    pump_dark = mat_surface("pump_dark", "#2a2d2f", rough=0.4, metallic=0.3)
    W.pump_points = []
    for ix, isx in enumerate((-1, 1)):
        icx = can_cx + isx * 4.2
        box(f"{g}_island{ix}", (1.4, 6.0, 0.16), (icx, can_cy, CURB_H + 0.08), trim, bevel=0.02, group=g)
        for iy, py in enumerate((can_cy - 1.6, can_cy + 1.6)):
            box(f"{g}_pump{ix}{iy}", (0.95, 0.55, 1.95), (icx, py, CURB_H + 0.16 + 0.975), pump, bevel=0.02, group=g)
            box(f"{g}_pumpface{ix}{iy}", (0.7, 0.58, 0.55), (icx, py, CURB_H + 0.16 + 1.45), pump_dark, bevel=0.01, group=g)
            box(f"{g}_pumptop{ix}{iy}", (1.05, 0.65, 0.12), (icx, py, CURB_H + 0.16 + 1.95), pump_dark, bevel=0.01, group=g)
            box(f"{g}_pumpbase{ix}{iy}", (0.99, 0.59, 0.7), (icx, py, CURB_H + 0.16 + 0.35), pump_dark, bevel=0.01, group=g)
            box(f"{g}_pumpstripe{ix}{iy}", (0.99, 0.59, 0.07), (icx, py, CURB_H + 0.16 + 0.75), mat_surface("brand_stripe", "#8f3a2f"), bevel=0, group=g)
            box(f"{g}_pumpsign{ix}{iy}", (0.8, 0.12, 0.34), (icx, py, CURB_H + 0.16 + 2.2), mat_surface("pumpsign", "#e9e4da", rough=0.5), bevel=0.01, group=g)
            box(f"{g}_pumpscreen{ix}{iy}", (0.34, 0.02, 0.24), (icx, py - 0.29, CURB_H + 0.16 + 1.5), mat_screen(f"pumpscreen{ix}{iy}", None, hexstr="#0e1c22", strength=0.0), bevel=0, group=g)
            box(f"{g}_pumpscreen{ix}{iy}b", (0.34, 0.02, 0.24), (icx, py + 0.29, CURB_H + 0.16 + 1.5), mat_screen(f"pumpscreen{ix}{iy}b", None, hexstr="#0e1c22", strength=0.0), bevel=0, group=g)
            for sx in (-1, 1):
                box(f"{g}_boot{ix}{iy}{sx}", (0.12, 0.62, 0.5), (icx + sx * 0.53, py, CURB_H + 0.16 + 1.25), pump_dark, bevel=0.01, group=g)
                hose(f"{g}_hose{ix}{iy}{sx}", (icx + sx * 0.58, py + 0.12, CURB_H + 0.16 + 1.5), (icx + sx * 0.62, py - 0.22, CURB_H + 0.16 + 0.95), 0.55, pump_dark, g)
                box(f"{g}_nozzle{ix}{iy}{sx}", (0.07, 0.16, 0.08), (icx + sx * 0.62, py - 0.26, CURB_H + 0.16 + 0.98), mat_surface("steel", "#b9bcc0", rough=0.25, metallic=0.8), bevel=0.01, group=g)
            W.pump_points.append(Vector((icx - 1.6 * isx, py, 0)))
            W.tracks[f"pump_{ix}{iy}"] = empty(f"track_pump_{ix}{iy}", (icx, py - 0.3, CURB_H + 0.16 + 1.45))
        for sx in (-1, 1):
            plane(f"{g}_stain{ix}{sx}", (2.6, 3.0), (icx + sx * 1.5, can_cy - 0.4, CURB_H + 0.012), mat_surface("stain", "#9d9a92", rough=0.95), group=g)
        # painted bays either side of the island, and wheel stops
        for sx in (-1, 1):
            box(f"{g}_bayline{ix}{sx}", (0.1, 6.4, 0.004), (icx + sx * 2.4, can_cy, CURB_H + 0.012), mat_surface("marking", P.marking), bevel=0, group=g)
            box(f"{g}_wheelstop{ix}{sx}", (1.6, 0.16, 0.12), (icx + sx * 1.9, can_cy - 3.4, CURB_H + 0.06), mat_surface("wheelstop", "#c9c3b7", rough=0.8), bevel=0.02, group=g)
    # bollards at the forecourt mouth, and the price sign as a quiet monolith
    for bx in (x0 + 2.0, x1 - 2.0):
        cylinder(f"{g}_bollard{bx}", 0.12, 0.9, (bx, y0 + 1.2, 0.45 + CURB_H), mat_surface("bollard", "#5a5d5f", rough=0.5, metallic=0.3), group=g)
    box(f"{g}_pricesign", (0.5, 0.3, 3.6), (x1 - 1.6, y0 + 3.4, 1.8 + CURB_H), mat_surface("canopy_body", "#3f4345"), bevel=0.02, group=g)
    box(f"{g}_pricepanel", (1.5, 0.22, 1.2), (x1 - 1.6, y0 + 3.4, 3.5 + CURB_H), mat_surface("pricepanel", "#24272a", rough=0.5, spec=0.5), bevel=0.01, group=g)
    box(f"{g}_pricestripe", (1.5, 0.23, 0.08), (x1 - 1.6, y0 + 3.4, 4.06 + CURB_H), mat_surface("brand_stripe", "#8f3a2f"), bevel=0, group=g)
    box(f"{g}_priceplate", (1.5, 0.22, 0.4), (x1 - 1.6, y0 + 3.4, 4.3 + CURB_H), mat_surface("priceplate", "#e6e1d6", rough=0.6), bevel=0.01, group=g)
    text(f"{g}_pricename", "JOE'S", 0.24, (x1 - 1.6, y0 + 3.4 - 0.115, 4.3 + CURB_H - 0.085), mat_surface("canopy_text", "#3b3f41"), group=g, spacing=1.2, extrude=0.004)
    digits = mat_emissive("price_digits", "#ffe2b0", 2.6, base="#b89468")
    for k, line in enumerate(("REGULAR   3.49", "DIESEL    3.99")):
        text(f"{g}_price{k}", line, 0.19, (x1 - 1.6, y0 + 3.4 - 0.115, 3.72 + CURB_H - k * 0.42), digits, group=g, spacing=1.1, extrude=0.004)
    # tracked points: the lot anchor where the 3 lands (forecourt centre), the curb in front of Joe's
    W.tracks["joes_lot"] = empty("track_joes_lot", (can_cx, y0 + 2.6, CURB_H))
    W.tracks["joes_curb_w"] = empty("track_joes_curb_w", (x0, ROAD_HALF, CURB_H))
    W.tracks["joes_curb_e"] = empty("track_joes_curb_e", (x1, ROAD_HALF, CURB_H))
    W.tracks["joes_frontage_w"] = empty("track_joes_frontage_w", (x0, y0, CURB_H))
    W.tracks["joes_frontage_e"] = empty("track_joes_frontage_e", (x1, y0, CURB_H))
    W.tracks["joes_canopy"] = empty("track_joes_canopy", (can_cx, can_cy, can_h + can_t))
    W.tracks["joes_store"] = empty("track_joes_store", (scx, sy0, store_h))


# --------------------------------------------------------------------------
# The near row, seen mostly from behind and above
# --------------------------------------------------------------------------
def _build_near(W: World, k, x0, x1, storeys, col, trim, glass, dark_glass, fascia, frame, door, sign):
    g = f"near_{k}"
    depth = 14 + (k % 3) * 2
    w = x1 - x0
    cx = (x0 + x1) / 2
    y1 = -FRONT
    y0 = y1 - depth
    cy = (y0 + y1) / 2
    H = GROUND + storeys * STOREY + (0.9 if storeys == 0 else 0.0)
    body = mat_surface(f"body_near{k}", col, rough=0.9, bump=0.2, scale=6)
    box(f"{g}_mass", (w - 0.3, depth, H), (cx, cy, H / 2), body, bevel=0.04, group=g)
    box(f"{g}_cornice", (w + 0.06, depth + 0.36, 0.34), (cx, cy, H - 0.17), trim, bevel=0.03, group=g)
    plane(f"{g}_roof", (w - 1.0, depth - 0.8), (cx, cy, H + 0.02), mat_surface("roofgravel", "#66696a", rough=1.0, bump=0.6, scale=60), group=g)
    for (bx, by, bw, bd) in ((cx, y0 + 0.2, w - 0.3, 0.4), (cx, y1 - 0.2, w - 0.3, 0.4), (x0 + 0.35, cy, 0.4, depth), (x1 - 0.35, cy, 0.4, depth)):
        box(f"{g}_parapet{bx}{by}", (bw, bd, 0.55), (bx, by, H + 0.275), body, bevel=0.02, group=g)
    box(f"{g}_hvac", (1.5, 1.1, 0.8), (cx - w * 0.2, cy - 1.5, H + 0.4), mat_surface("hvac", "#8e8d88"), bevel=0.03, group=g)
    if k % 2 == 0:
        box(f"{g}_bulkhead", (2.8, 3.2, 2.5), (cx + w * 0.22, cy + 2.0, H + 1.25), body, bevel=0.03, group=g)
    # the street face: a shopfront band and upper windows, lit like the far row's
    glass_top = GROUND - 0.85
    open_w = w - 1.7
    plane(f"{g}_glass", (open_w, glass_top - 0.55), (cx, y1 - 0.12, 0.55 + (glass_top - 0.55) / 2), glass, group=g, rot=(math.pi / 2, 0, 0))
    box(f"{g}_riser", (open_w, 0.3, 0.55), (cx, y1 - 0.15, 0.275), trim, bevel=0.02, group=g)
    box(f"{g}_fascia", (open_w + 0.1, 0.22, GROUND - glass_top), (cx, y1 - 0.11, glass_top + (GROUND - glass_top) / 2), fascia, bevel=0.01, group=g)
    # a lit card behind the glass so the near shops are alive too
    em = mat_emissive(f"{g}_card", P.warm, 0.0, base="#6c645a")
    plane(f"{g}_card", (open_w - 0.2, glass_top - 0.6), (cx, y1 + 0.9, 0.55 + (glass_top - 0.55) / 2), em, group=g, rot=(math.pi / 2, 0, 0))
    W.interior_emissives[f"near{k}"] = [em]
    cols = max(2, round(w / 3.1))
    sp = w / cols
    W.upper_windows[f"near{k}"] = []
    for s in range(storeys):
        zc = GROUND + s * STOREY + STOREY * 0.52
        for c in range(cols):
            xc = x0 + sp * (c + 0.5)
            for face_y, sgn in ((y1 - 0.14, -1), (y0 + 0.14, 1)):
                box(f"{g}_reveal{s}{c}{sgn}", (1.15, 0.3, 1.7), (xc, face_y, zc), mat_surface("reveal", "#3a3d3f"), bevel=0, group=g)
                plane(f"{g}_wglass{s}{c}{sgn}", (1.15, 1.7), (xc, face_y - sgn * 0.06, zc), dark_glass, group=g, rot=(math.pi / 2, 0, 0))
                box(f"{g}_sill{s}{c}{sgn}", (1.35, 0.22, 0.08), (xc, face_y - sgn * 0.2, zc - 0.9), trim, bevel=0.01, group=g)
                card = plane(f"{g}_wcard{s}{c}{sgn}", (1.1, 1.65), (xc, face_y - sgn * 0.14 + sgn * 0.3, zc), mat_emissive(f"{g}_wcard{s}{c}{sgn}", P.warm, 0.0, base="#6c645a"), group=g, rot=(math.pi / 2, 0, 0))
                W.upper_windows[f"near{k}"].append(card)


# --------------------------------------------------------------------------
# Furniture, cars
# --------------------------------------------------------------------------
def _furniture(W: World, frame, trim):
    g = "furniture"
    post = mat_surface("post", "#2f3335", rough=0.45, metallic=0.4)
    for s in (-1, 1):
        for x in (-42, -26, -12, 30, 44):
            z = 0.0
            y = s * (ROAD_HALF + 0.75)
            cylinder(f"lamp{s}{x}", 0.06, 6.0, (x, y, 3.0 + CURB_H), post, group=g, verts=12)
            cylinder(f"lampbase{s}{x}", 0.16, 0.5, (x, y, 0.25 + CURB_H), post, group=g, verts=12)
            box(f"lamparm{s}{x}", (0.08, 1.2, 0.06), (x, y - s * 0.6, 6.0 + CURB_H), post, bevel=0.005, group=g)
            head = box(f"lamphead{s}{x}", (0.36, 0.5, 0.12), (x, y - s * 1.1, 5.94 + CURB_H), W.lamp_mat, bevel=0.01, group=g)
            ld = bpy.data.lights.new(f"lamplight{s}{x}", "POINT")
            ld.energy = 0.0
            ld.color = srgb(P.lamp)[:3]
            ld.shadow_soft_size = 0.3
            lo = bpy.data.objects.new(f"lamplight{s}{x}", ld)
            lo.location = (x, y - s * 1.1, 5.8 + CURB_H)
            _link(lo, g)
            W.lamps.append(lo)
    # a bench and a bike rack by the café, bollards by the pharmacy, a bin
    bench = mat_surface("bench", "#4a4237", rough=0.7)
    box("bench_seat", (1.8, 0.45, 0.06), (21.5, ROAD_HALF + 1.4, 0.45 + CURB_H), bench, bevel=0.01, group=g)
    for bx in (20.8, 22.2):
        box(f"bench_leg{bx}", (0.06, 0.4, 0.42), (bx, ROAD_HALF + 1.4, 0.21 + CURB_H), post, bevel=0, group=g)
    for k in range(3):
        cylinder(f"rack{k}", 0.02, 0.8, (24.5 + k * 0.6, ROAD_HALF + 1.0, 0.4 + CURB_H), post, group=g, verts=8)
    cylinder("bin", 0.3, 1.0, (-24.0, ROAD_HALF + 1.0, 0.5 + CURB_H), mat_surface("bin", "#3b3e40", rough=0.5, metallic=0.3), group=g)
    # a couple of slender trees in pits along the far sidewalk; abstract, quiet
    bark = mat_surface("bark", "#4a443c", rough=0.9)
    leaf = mat_surface("leaf", "#4b5a48", rough=0.95)
    for tx in (-38.0, 31.0, 44.0):
        box(f"treepit{tx}", (1.4, 1.4, 0.02), (tx, ROAD_HALF + 1.6, CURB_H + 0.01), mat_surface("pit", "#3a3632", rough=1.0), bevel=0, group=g)
        cylinder(f"trunk{tx}", 0.09, 3.2, (tx, ROAD_HALF + 1.6, 1.6 + CURB_H), bark, group=g, verts=10)
        for k, (r, z) in enumerate(((1.4, 4.6), (1.1, 5.7), (0.7, 6.5))):
            o = box(f"crown{tx}{k}", (r * 2, r * 2, r * 1.5), (tx, ROAD_HALF + 1.6, z), leaf, bevel=r * 0.6, group=g, shade_smooth=True)
            o.modifiers["bevel"].segments = 6


def car_at(x, y, ci=0, yaw=0.0, name=None, group="cars"):
    """A parked car: a low beveled body, a smoked cabin, four wheels. Reads as a car, never as a toy."""
    nm = name or f"car{x}_{y}"
    smoked = mat_surface("cabin", "#1a1d20", rough=0.28, spec=0.55, coat=0.15)
    tyre = mat_surface("tyre", "#141516", rough=0.9)
    paint = mat_surface(f"paint{ci}", P.car[ci % len(P.car)], rough=0.38, metallic=0.0, coat=0.12, spec=0.4)
    root = bpy.data.objects.new(nm, None)
    root.location = (x, y, 0)
    root.rotation_euler = (0, 0, yaw)
    _link(root, group)
    parts = []
    body = box(f"{nm}_body", (4.5, 1.85, 0.58), (0, 0, 0.33 + 0.26), paint, bevel=0.2, group=group, shade_smooth=True)
    body.modifiers["bevel"].segments = 5
    cabin = box(f"{nm}_cabin", (2.3, 1.62, 0.5), (-0.2, 0, 0.33 + 0.26 + 0.29 + 0.24), smoked, bevel=0.22, group=group, shade_smooth=True)
    cabin.modifiers["bevel"].segments = 5
    parts += [body, cabin]
    for wx in (-1.45, 1.45):
        for wy in (-0.82, 0.82):
            parts.append(cylinder(f"{nm}_wheel{wx}{wy}", 0.33, 0.22, (wx, wy, 0.33), tyre, group=group, rot=(math.pi / 2, 0, 0), verts=20))
    for o in parts:
        o.parent = root
    return root


def _cars(glass):
    specs = [(-36.0, -1, 0), (-14.5, -1, 1), (8.0, -1, 2), (30.0, -1, 3), (-30.0, 1, 4), (38.5, 1, 1)]
    for x, s, ci in specs:
        car_at(x, s * (ROAD_HALF - 1.15), ci, yaw=0.0 if s < 0 else math.pi)


# --------------------------------------------------------------------------
# Lighting states
# --------------------------------------------------------------------------
STATES = {
    # sun elevation (deg); rotation (deg clockwise from north: 90 = east); exposure; interior watts; emissive strength;
    # lamps on; Joe's on; upper-window density; canopy on
    "dawn": dict(elev=9.0, rot=112, exposure=-2.25, sun=0.62, interior_w=3800, emis=26.0, lamps=0.25, joes=0.4, windows=0.35, canopy=0.35),
    "morning": dict(elev=18.0, rot=128, exposure=-3.1, interior_w=2600, emis=20.0, lamps=0.0, joes=1.0, windows=0.2, canopy=0.7),
    "dusk": dict(elev=-3.5, rot=296, exposure=0.9, interior_w=520, emis=5.0, lamps=1.0, joes=0.0, windows=0.55, canopy=0.0),
    "night": dict(elev=-9.0, rot=310, exposure=1.8, interior_w=420, emis=4.0, lamps=1.0, joes=0.0, windows=0.6, canopy=0.0),
}


def _fac(seed: int, i: int):
    return ((seed * 7919 + i * 104729) % 1000) / 1000.0


def set_state(W: World, name: str, frame: int | None = None, **overrides):
    """Apply a lighting state, optionally as a keyframe at `frame` so states can cross-fade over time."""
    st = dict(STATES[name])
    st.update(overrides)
    scene = bpy.context.scene
    sky = W.sun
    el = math.radians(st["elev"])
    sky.sun_elevation = el
    sky.sun_rotation = math.radians(st["rot"])
    sky.sun_intensity = st.get("sun", 1.0)
    scene.view_settings.exposure = st["exposure"]
    # interiors
    for key, lights in W.interior_lights.items():
        on = 1.0
        if key == "joes":
            on = st["joes"]
        if key == "joes_canopy":
            on = st["canopy"]
        for lo in lights:
            lo.data.energy = 0.0 if on == 0 else (st["interior_w"] * 1.6 if key == "joes_canopy" else st["interior_w"]) * on
            if frame is not None:
                lo.data.keyframe_insert("energy", frame=frame)
    for key, ems in W.interior_emissives.items():
        on = 1.0
        if key == "joes":
            on = st["joes"]
        if key == "joes_canopy":
            on = st["canopy"]
        for em in ems:
            p = em.node_tree.nodes["Principled BSDF"]
            p.inputs["Emission Strength"].default_value = 0.0 if on == 0 else (st["emis"] * 1.4 if key == "joes_canopy" else st["emis"]) * on
            if frame is not None:
                p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
    for key, so in W.spills.items():
        so.data.energy = st["interior_w"] * 0.22
        if frame is not None:
            so.data.keyframe_insert("energy", frame=frame)
    if W.security:
        W.security.data.energy = st["interior_w"] * 0.06 * (1.0 - st["joes"])
        if frame is not None:
            W.security.data.keyframe_insert("energy", frame=frame)
    if W.entrance_mat:
        p = W.entrance_mat.node_tree.nodes["Principled BSDF"]
        p.inputs["Emission Strength"].default_value = st["emis"] * 0.8 * st["joes"]
        if frame is not None:
            p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
    if W.joes_sign_mat:
        p = W.joes_sign_mat.node_tree.nodes["Principled BSDF"]
        p.inputs["Emission Strength"].default_value = st["emis"] * 0.25 * st["joes"]
        if frame is not None:
            p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
    if W.joes_canopy_mat:
        p = W.joes_canopy_mat.node_tree.nodes["Principled BSDF"]
        p.inputs["Emission Strength"].default_value = st["emis"] * 0.05 * st["canopy"]
        if frame is not None:
            p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
    # upper windows: a deterministic scatter, denser at dusk
    for key, cards in W.upper_windows.items():
        for i, card in enumerate(cards):
            lit = _fac(hash(key) % 1000, i) < st["windows"]
            p = card.data.materials[0].node_tree.nodes["Principled BSDF"]
            p.inputs["Emission Strength"].default_value = (st["emis"] * (0.5 + 0.35 * _fac(i, 3))) if lit else 0.0
            if frame is not None:
                p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
    # street lamps
    for lo in W.lamps:
        lo.data.energy = st["interior_w"] * 0.5 * st["lamps"]
        if frame is not None:
            lo.data.keyframe_insert("energy", frame=frame)
    if W.lamp_mat:
        p = W.lamp_mat.node_tree.nodes["Principled BSDF"]
        p.inputs["Emission Strength"].default_value = st["emis"] * 0.5 * st["lamps"]
        if frame is not None:
            p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
    if frame is not None:
        sky.keyframe_insert("sun_elevation", frame=frame)
        sky.keyframe_insert("sun_rotation", frame=frame)
        scene.view_settings.keyframe_insert("exposure", frame=frame)


def set_screen(W: World, key: str, on: float, frame: int | None = None, image: str | None = None):
    """Switch a counter unit's panel (0 = dark glass, 1 = showing content) and its status LED."""
    s = W.screens[key]
    p = s["mat"].node_tree.nodes["Principled BSDF"]
    p.inputs["Emission Strength"].default_value = 2.2 * on
    led = s["led"].data.materials[0].node_tree.nodes["Principled BSDF"]
    led.inputs["Emission Strength"].default_value = 4.0 * (1.0 if on > 0 else 0.0)
    if frame is not None:
        p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
        led.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)
    if image and os.path.exists(image):
        nt = s["mat"].node_tree
        tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
        if tex is None:
            tex = nt.nodes.new("ShaderNodeTexImage")
            tex.extension = "CLIP"
            tc = nt.nodes.new("ShaderNodeTexCoord")
            nt.links.new(tc.outputs["UV"], tex.inputs["Vector"])
            nt.links.new(tex.outputs["Color"], p.inputs["Emission Color"])
        tex.image = bpy.data.images.load(image)


def set_plaque(W: World, key: str, on: float, frame: int | None = None):
    pm = W.plaques.get(key)
    if not pm:
        return
    p = pm.node_tree.nodes["Principled BSDF"]
    p.inputs["Emission Strength"].default_value = 6.0 * on
    if frame is not None:
        p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)


def set_window(W: World, key: str, index: int, on: float, frame: int | None = None, strength=12.0):
    card = W.upper_windows[key][index]
    p = card.data.materials[0].node_tree.nodes["Principled BSDF"]
    p.inputs["Emission Strength"].default_value = strength * on
    if frame is not None:
        p.inputs["Emission Strength"].keyframe_insert("default_value", frame=frame)


def _parking_lot(W: World, x0: float, x1: float, trim):
    """The lot opposite Joe's: a low wall along the sidewalk with an opening, asphalt, angled parked cars, two trees, a light."""
    g = "near_lot"
    y1 = -FRONT
    y0 = y1 - 22.0
    cx = (x0 + x1) / 2
    plane(f"{g}_asphalt", (x1 - x0, y1 - y0), (cx, (y0 + y1) / 2, 0.005), mat_asphalt("lot_asphalt"), group=g)
    wall = mat_surface("lotwall", "#8a857c", rough=0.9, bump=0.2, scale=6, dirt=0.2)
    # a low wall with a wide opening in the middle, capped
    for (wx0, wx1) in ((x0, cx - 5.0), (cx + 5.0, x1)):
        box(f"{g}_wall{wx0}", (wx1 - wx0, 0.3, 0.9), ((wx0 + wx1) / 2, y1 - 0.15, 0.45), wall, bevel=0.02, group=g)
        box(f"{g}_cap{wx0}", (wx1 - wx0 + 0.1, 0.4, 0.08), ((wx0 + wx1) / 2, y1 - 0.15, 0.94), trim, bevel=0.01, group=g)
    # painted bays and a few cars, nosed in toward the wall
    marking = mat_surface("marking", P.marking)
    for k in range(9):
        bx = x0 + 3.0 + k * 4.4
        box(f"{g}_bay{k}", (0.1, 5.0, 0.004), (bx, y1 - 3.2, 0.008), marking, bevel=0, group=g)
    for k, ci in ((1, 0), (2, 3), (5, 1)):
        bx = x0 + 3.0 + k * 4.4 + 2.2
        car_at(bx, y1 - 3.4, ci, yaw=math.pi / 2 + (0.03 if k % 2 else -0.03), name=f"lotcar{k}", group=g)
    # a second rank deeper in, sparser
    for k, ci in ((3, 2), (6, 0), (8, 4)):
        bx = x0 + 3.0 + k * 4.4 + 2.2
        car_at(bx, y0 + 6.0, ci, yaw=-math.pi / 2, name=f"lotcar2{k}", group=g)
    bark = mat_surface("bark", "#4a443c", rough=0.9)
    leaf = mat_surface("leaf", "#4b5a48", rough=0.95)
    for tx in (x0 + 1.5, x1 - 4.0):
        cylinder(f"{g}_trunk{tx}", 0.1, 3.4, (tx, y1 - 2.0, 1.7), bark, group=g, verts=10)
        for k, (r, z) in enumerate(((1.6, 4.4), (1.2, 5.6), (0.8, 6.5))):
            o = box(f"{g}_crown{tx}{k}", (r * 2, r * 2, r * 1.5), (tx, y1 - 2.0, z), leaf, bevel=r * 0.6, group=g, shade_smooth=True)
            o.modifiers["bevel"].segments = 6
    post = mat_surface("post", "#2f3335", rough=0.45, metallic=0.4)
    cylinder(f"{g}_lightpole", 0.07, 7.0, (cx, y0 + 10.0, 3.5), post, group=g, verts=10)
    box(f"{g}_lighthead", (0.5, 0.3, 0.12), (cx, y0 + 10.0, 7.0), W.lamp_mat, bevel=0.01, group=g)
