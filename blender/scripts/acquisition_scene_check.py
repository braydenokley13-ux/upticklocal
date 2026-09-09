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
    # The handset is no longer driven by an IK constraint; the arm is posed in
    # the retarget bake and the handset follows the hand. So check the thing
    # that has to be true on screen: by the end of the shot the hand is raised
    # well above where it hangs at the start, and the handset is on it.
    rig=bpy.data.objects.get('acq_customer_rig');handset=bpy.data.objects.get('acq_customer_handset')
    assert rig is not None and handset is not None,'external: customer rig and handset are required'
    def hand_at(frame):
        bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
        return (evaluated.matrix_world @ evaluated.pose.bones['Bip01 L Hand'].matrix).translation.copy()
    start,end=hand_at(0),hand_at(expected-1)
    bpy.context.scene.frame_set(expected-1);bpy.context.view_layer.update()
    held=(handset.matrix_world.translation-end).length
    assert end.z-start.z>.15,f'external: handset never rises ({start.z:.3f} -> {end.z:.3f})'
    assert held<.12,f'external: handset is {held:.3f}m from the hand holding it'
    assert handset.scale.x>0,'external: handset is hidden on the final frame'
    interaction={'handStartZ':round(start.z,3),'handEndZ':round(end.z,3),'handsetToHand':round(held,3)}
print('ACQUISITION_SCENE_CHECK',json.dumps({'shot':name,'frames':expected,'checkedFrames':checks,'status':'PASS','interaction':interaction,'scope':'Scene construction and live dependencies; not rendered quality'}),flush=True)
