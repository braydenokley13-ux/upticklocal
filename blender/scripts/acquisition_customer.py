"""One licensed, rigged customer shared by both visits.

Microsoft Rocketbox, MIT; license shipped beside the source FBX and textures.
The walking take is baked onto the matching named skeleton at 24 fps.
"""
from pathlib import Path
import math
import hashlib
import json
import bisect
import bpy
from mathutils import Matrix, Vector

ASSETS=Path(__file__).resolve().parents[1]/'assets/rocketbox'


def validate_assets():
    manifest=json.loads((ASSETS/'SOURCE.json').read_text())
    for name,expected in manifest['files'].items():
        asset=ASSETS/name
        if not asset.is_file(): raise FileNotFoundError(f'Required customer asset missing: {asset}')
        if hashlib.sha256(asset.read_bytes()).hexdigest()!=expected:
            raise RuntimeError(f'Customer asset differs from licensed source manifest: {asset}')


def customer(path,frames,yaw=math.pi,stop_walking=None,notice_at=None,phone_at=None,handset_at=None,walk_from=0,distance_driven=False,orient_path=False):
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
    def path_position(frame):
        for (a,x0,y0),(b,x1,y1) in zip(path,path[1:]):
            if frame<=b:
                u=max(0,min(1,(frame-a)/(b-a)))
                return Vector((x0+(x1-x0)*u,y0+(y1-y0)*u,0))
        return Vector((path[-1][1],path[-1][2],0))
    travel=[0.0]
    for frame in range(1,frames):travel.append(travel[-1]+(path_position(frame)-path_position(frame-1)).length)
    if distance_driven:
        hips=[]
        for frame in range(1,34):
            scene.frame_set(frame);bpy.context.view_layer.update()
            hips.append((source.matrix_world@source.pose.bones['Bip01 Pelvis'].matrix).translation.copy())
        forward=hips[-1]-hips[0];forward.z=0;stride=forward.length;forward.normalize()
        distances=[max(0,(p-hips[0]).dot(forward)) for p in hips]
        assert stride>1 and all(a<=b for a,b in zip(distances,distances[1:])), 'Unexpected walk take/root trajectory'
    # Target rest geometry and take share Rocketbox bone names. Full armature-
    # space poses carry the A-pose-to-walk change, not only local Euler angles.
    for f in range(frames):
        walk_frame=min(f,stop_walking) if stop_walking is not None else f
        walk_frame=max(0,walk_frame-walk_from)
        source_frame=1+(walk_frame*source_fps/output_fps)%32
        if distance_driven:
            distance=max(0,travel[min(frames-1,walk_frame+walk_from)]-travel[min(frames-1,walk_from)])
            phase_distance=distance%stride
            ix=min(31,max(0,bisect.bisect_right(distances,phase_distance)-1))
            fraction=(phase_distance-distances[ix])/(distances[ix+1]-distances[ix])
            source_frame=1+ix+fraction
        scene.frame_set(int(source_frame),subframe=source_frame%1)
        bpy.context.view_layer.update()
        if distance_driven:
            hip=(source.matrix_world@source.pose.bones['Bip01 Pelvis'].matrix).translation
            displacement=forward*(hip-hips[0]).dot(forward)
            # This take carries locomotion on the armature OBJECT, not the
            # pelvis bone. Preserve its body sway/bob, remove forward travel,
            # and let the authored path supply only the forward displacement.
            # The matched skeleton uses the donor's complete object frame.
            # Normalizing by its animated frame 1 would remove real body pitch.
            rig.matrix_world=Matrix.Translation(-displacement)@source.matrix_world
            rig.rotation_mode='QUATERNION'
            rig.keyframe_insert('location',frame=f)
            rig.keyframe_insert('rotation_quaternion',frame=f)
            rig.keyframe_insert('scale',frame=f)
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
                # These bones run along local X, so X is the twist axis and a
                # rotation about it never moves the hand. The elbow folds about
                # local Z; measured on the rig, -1.4 rad brings the hand to
                # chest height with the elbow still at the side.
                if phone_at is not None and bone.name=='Bip01 R Forearm':
                    amount=max(0,min(1,(f-phone_at)/16))
                    bone.matrix_basis=bone.matrix_basis @ Matrix.Rotation(1.4*amount,4,'Z')
                if handset_at is not None and bone.name=='Bip01 L Forearm':
                    amount=max(0,min(1,(f-handset_at)/16))
                    bone.matrix_basis=bone.matrix_basis @ Matrix.Rotation(-1.4*amount,4,'Z')
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
    if orient_path:
        for f in range(frames):
            tangent=path_position(min(frames-1,f+3))-path_position(max(0,f-3))
            if tangent.length>.0001:
                root.rotation_euler=(0,0,math.atan2(tangent.x,-tangent.y))
                root.keyframe_insert('rotation_euler',frame=f)
    if distance_driven:
        from camera import _fcurves
        for curve in _fcurves(root.animation_data.action):
            for key in curve.keyframe_points:key.interpolation='LINEAR'
        root['locomotion']='Distance-driven native root removal; 1.496m measured stride'
    return root
