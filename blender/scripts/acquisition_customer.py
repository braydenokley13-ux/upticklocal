"""One licensed, rigged customer shared by both visits.

Microsoft Rocketbox, MIT; license shipped beside the source FBX and textures.
The walking take is baked onto the matching named skeleton at 24 fps.
"""
from pathlib import Path
import math
import hashlib
import json
import bpy
from mathutils import Matrix

ASSETS=Path(__file__).resolve().parents[1]/'assets/rocketbox'


def validate_assets():
    manifest=json.loads((ASSETS/'SOURCE.json').read_text())
    for name,expected in manifest['files'].items():
        asset=ASSETS/name
        if not asset.is_file(): raise FileNotFoundError(f'Required customer asset missing: {asset}')
        if hashlib.sha256(asset.read_bytes()).hexdigest()!=expected:
            raise RuntimeError(f'Customer asset differs from licensed source manifest: {asset}')


def customer(path,frames,yaw=math.pi,stop_walking=None,notice_at=None,phone_at=None,walk_from=0):
    validate_assets()
    scene=bpy.context.scene
    output_fps=scene.render.fps / scene.render.fps_base
    saved_fps, saved_base=scene.render.fps, scene.render.fps_base
    previous=set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=str(ASSETS/'Male_Adult_01.fbx'))
    imported=set(bpy.data.objects)-previous
    rig=next(o for o in imported if o.type=='ARMATURE')
    mesh=next(o for o in imported if o.type=='MESH')
    rig.name='acq_customer_rig'
    rig.animation_data_clear()
    for material in mesh.data.materials:
        material.use_nodes=True
        for node in list(material.node_tree.nodes):
            if node.type not in ('BSDF_PRINCIPLED','OUTPUT_MATERIAL'):
                material.node_tree.nodes.remove(node)
        shader=material.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Roughness'].default_value=.78
        shader.inputs['Metallic'].default_value=0
        shader.inputs['Specular IOR Level'].default_value=.20
        key=material.name.split('.')[0]
        image_path=ASSETS/f'{key}_color.tga'
        texture=material.node_tree.nodes.new('ShaderNodeTexImage')
        texture.image=bpy.data.images.load(str(image_path),check_existing=True)
        material.node_tree.links.new(texture.outputs['Color'],shader.inputs['Base Color'])
        if 'opacity' in key:
            material.node_tree.links.new(texture.outputs['Alpha'],shader.inputs['Alpha'])
    old=set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=str(ASSETS/'walk.fbx'))
    animation_objects=set(bpy.data.objects)-old
    source=next(o for o in animation_objects if o.type=='ARMATURE')
    source_fps=scene.render.fps / scene.render.fps_base
    # Target rest geometry and take share Rocketbox bone names. Full armature-
    # space poses carry the A-pose-to-walk change, not only local Euler angles.
    for f in range(frames):
        walk_frame=min(f,stop_walking) if stop_walking is not None else f
        walk_frame=max(0,walk_frame-walk_from)
        source_frame=1+(walk_frame*source_fps/output_fps)%32
        scene.frame_set(int(source_frame),subframe=source_frame%1)
        for bone in rig.pose.bones:
            if bone.name in source.pose.bones:
                bone.rotation_mode='QUATERNION'
                desired=source.pose.bones[bone.name].matrix.copy()
                # Solve each local pose against the desired parent pose, not
                # Blender's partially updated target hierarchy. Setting .matrix
                # while keying the same rig can stretch limbs in later cycles.
                parent_args={}
                if bone.parent:
                    parent_args={'parent_matrix':source.pose.bones[bone.parent.name].matrix.copy(),
                                 'parent_matrix_local':bone.parent.bone.matrix_local}
                bone.matrix_basis=bone.bone.convert_local_to_pose(desired,bone.bone.matrix_local,invert=True,**parent_args)
                if stop_walking is not None and f>stop_walking and (bone.name in ('Bip01','Bip01 Pelvis') or any(part in bone.name for part in ('Thigh','Calf','Foot','Toe'))):
                    settle=min(1,(f-stop_walking)/10)
                    bone.matrix_basis=bone.matrix_basis.lerp(Matrix.Identity(4),settle)
                if notice_at is not None and bone.name=='Bip01 Head':
                    amount=max(0,min(1,(f-notice_at)/12))
                    bone.matrix_basis=bone.matrix_basis @ Matrix.Rotation(-.3*amount,4,'Z')
                if phone_at is not None and bone.name=='Bip01 R Forearm':
                    amount=max(0,min(1,(f-phone_at)/16))
                    bone.matrix_basis=bone.matrix_basis @ Matrix.Rotation(-1.05*amount,4,'X')
                bone.keyframe_insert('location',frame=f)
                bone.keyframe_insert('rotation_quaternion',frame=f)
                bone.keyframe_insert('scale',frame=f)
    for obj in animation_objects: bpy.data.objects.remove(obj,do_unlink=True)
    scene.render.fps,scene.render.fps_base=saved_fps,saved_base
    # Preserve imported bind transforms; move the whole avatar under one root.
    root=bpy.data.objects.new('acq_customer',None)
    bpy.context.scene.collection.objects.link(root)
    for obj in imported:
        if obj.parent not in imported:
            obj.parent=root
    for f,x,y in path:
        root.location=(x,y,0)
        root.rotation_euler=(0,0,yaw)
        root.keyframe_insert('location',frame=f)
        root.keyframe_insert('rotation_euler',frame=f)
    return root
