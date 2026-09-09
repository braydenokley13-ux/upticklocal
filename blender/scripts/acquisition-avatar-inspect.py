"""Inspect the licensed replacement rig before touching the acquisition shot."""
from pathlib import Path
import bpy
root=Path(__file__).resolve().parents[1]/'assets/rocketbox'
for name in ('Male_Adult_01.fbx','walk.fbx'):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(root/name))
    print('ASSET',name,flush=True)
    for obj in bpy.data.objects:
        print('OBJECT',obj.name,obj.type,tuple(obj.dimensions),tuple(obj.scale),flush=True)
        if obj.type=='ARMATURE':
            print('BONES',[(b.name,tuple(b.head_local),tuple(b.tail_local)) for b in list(obj.data.bones)[:24]],flush=True)
        if obj.type=='MESH':
            print('MATERIALS',[m.name for m in obj.data.materials],flush=True)
    for action in bpy.data.actions:
        print('ACTION',action.name,tuple(action.frame_range),flush=True)
