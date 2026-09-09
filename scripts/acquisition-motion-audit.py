"""What each physical shot actually needs from Cycles, measured rather than assumed.

Builds a production shot and walks **every** frame of its range, comparing the
scene against frame 0: camera transform and lens, light energy and position,
world shading, every object's world matrix and every pose bone. Nothing is
sampled, so a shot reported static cannot be moving between samples.

A shot whose camera, lights, world and geometry never change is one photograph
with, at most, a screen playing inside it. Re-tracing its whole world once per
frame buys nothing, and at 1920x1080 costs one to five minutes a frame.

  blender -b --factory-startup --python scripts/acquisition-motion-audit.py -- SHOT
"""
import json
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'blender/scripts'))
import acquisition_production as P  # noqa: F401  (registers the production shots)
import acquisition as A

EPS = 1e-5

VEHICLE = ('acq_vehicle', 'acq_partner_lift')
HUMAN = ('acq_customer', 'Bip01', 'm002_hipoly')
HANDSET = ('acq_customer_handset', 'acq_saved_pass')


def role(name):
    if name.startswith(HUMAN):
        return 'human'
    if name.startswith(HANDSET) or 'phone' in name or 'handset' in name:
        return 'handset'
    if name.startswith(VEHICLE):
        return 'vehicle'
    if name.startswith('next_stop'):
        return 'unit'
    return 'background'


def flat(matrix):
    return [matrix[r][c] for r in range(4) for c in range(4)]


def diff(a, b):
    return max(abs(x - y) for x, y in zip(a, b))


def main():
    name = sys.argv[sys.argv.index('--') + 1]
    plan = json.loads((A.ROOT / 'film/render/acquisition-shots.json').read_text())
    frames = next(shot['frames'] for shot in plan['shots'] if shot['id'] == name)
    A.S.settings(640, 360, 8)
    world = A.B.build()
    shot = A.SHOTS[name](world)
    camera = shot['cam']
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 0, frames - 1

    lights = [o for o in bpy.data.objects if o.type == 'LIGHT']
    rigs = [o for o in bpy.data.objects if o.type == 'ARMATURE']
    others = [o for o in bpy.data.objects if o.type not in ('CAMERA',)]

    def snapshot():
        bpy.context.view_layer.update()
        return {
            'camera': flat(camera.matrix_world) + [camera.data.lens, camera.data.dof.focus_distance],
            'objects': {o.name: flat(o.matrix_world) for o in others},
            'lights': {o.name: [o.data.energy] + flat(o.matrix_world) for o in lights},
            'poses': {(r.name, b.name): flat(b.matrix) for r in rigs for b in r.pose.bones},
        }

    scene.frame_set(0)
    base = snapshot()
    camera_move = 0.0
    light_move = 0.0
    moved = {}
    for frame in range(1, frames):
        scene.frame_set(frame)
        now = snapshot()
        camera_move = max(camera_move, diff(base['camera'], now['camera']))
        for light_name, values in now['lights'].items():
            light_move = max(light_move, diff(base['lights'][light_name], values))
        for obj_name, values in now['objects'].items():
            d = diff(base['objects'][obj_name], values)
            if d > EPS:
                moved[obj_name] = max(moved.get(obj_name, 0.0), d)
        for key, values in now['poses'].items():
            d = diff(base['poses'][key], values)
            if d > EPS:
                moved[key[0]] = max(moved.get(key[0], 0.0), d)

    world_animated = any(w.node_tree and w.node_tree.animation_data and w.node_tree.animation_data.action
                         for w in bpy.data.worlds)
    material_animated = sorted(m.name for m in bpy.data.materials
                               if m.node_tree and m.node_tree.animation_data and m.node_tree.animation_data.action)
    sequences = sorted({i.name for i in bpy.data.images if i.source == 'SEQUENCE'})

    by_role = {}
    for obj_name in moved:
        by_role.setdefault(role(obj_name), []).append(obj_name)

    camera_static = camera_move <= EPS
    lighting_static = light_move <= EPS and not world_animated
    background_static = not by_role.get('background') and not by_role.get('unit')
    nothing_moves = camera_static and lighting_static and not moved and not material_animated

    if nothing_moves and not sequences:
        fresh, plan_note = 1, 'one plate held for the shot; nothing in the world changes'
    elif nothing_moves and sequences:
        fresh, plan_note = 1, 'one plate; the screen sequence is composited over it'
    elif camera_static and lighting_static and background_static:
        fresh, plan_note = frames, 'static world with moving subjects: background is reusable, subjects are not'
    else:
        fresh, plan_note = frames, 'camera, lighting or set changes: full world per frame'

    print('ACQUISITION_MOTION_AUDIT', json.dumps({
        'shot': name, 'frames': frames, 'framesCompared': frames,
        'cameraStatic': camera_static, 'cameraMove': round(camera_move, 6),
        'lightingStatic': lighting_static, 'lightMove': round(light_move, 6),
        'backgroundStatic': background_static,
        'movingByRole': {k: sorted(v)[:8] for k, v in sorted(by_role.items())},
        'movingCount': len(moved),
        'animatedMaterials': material_animated[:10],
        'animatedScreenSequences': sequences,
        'nothingMoves': nothing_moves,
        'freshCyclesFrames': fresh, 'plan': plan_note,
    }), flush=True)


if __name__ == '__main__':
    main()
