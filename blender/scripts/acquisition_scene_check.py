"""Construct one production shot and validate frames/assets without rendering."""
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
import acquisition_production as P
import acquisition as A

name=sys.argv[sys.argv.index('--')+1]
plan=json.loads((A.ROOT/'film/render/acquisition-shots.json').read_text())
expected=next(shot['frames'] for shot in plan['shots'] if shot['id']==name)
A.S.settings(640,360,8)
world=A.B.build()
shot=A.SHOTS[name](world)
assert shot['frames']==expected,(name,shot['frames'],expected)
assert bpy.context.scene.camera==shot['cam'],f'{name}: camera not active'
for image in bpy.data.images:
    if image.users and image.source=='FILE' and not image.packed_file:
        assert Path(bpy.path.abspath(image.filepath)).is_file(),f'Missing live image: {image.filepath}'
checks=[]
for frame in (0,expected//2,expected-1):
    bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
    for obj in bpy.data.objects:
        if obj.name.startswith('acq_customer_rig'):
            assert all(math.isfinite(v) for bone in obj.pose.bones for row in bone.matrix for v in row),'Nonfinite customer pose'
    checks.append(frame)
interaction=None
if name=='external':
    target=bpy.data.objects.get('acq_handset_target');rig=bpy.data.objects.get('acq_customer_rig')
    evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
    interaction={'target':list(target.matrix_world.translation),'hand':list((evaluated.matrix_world @ evaluated.pose.bones['Bip01 L Hand'].matrix).translation),'influence':rig.pose.bones['Bip01 L Forearm'].constraints[-1].influence}
print('ACQUISITION_SCENE_CHECK',json.dumps({'shot':name,'frames':expected,'checkedFrames':checks,'status':'PASS','interaction':interaction,'scope':'Scene construction and live dependencies; not rendered quality'}),flush=True)
