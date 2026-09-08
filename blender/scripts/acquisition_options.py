"""Three action-based acquisition compositions, kept separate for direct comparison."""
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
import acquisition as A
B,CAM,DV,SC,CUSTOMER=A.B,A.CAM,A.DV,A.SC,A.CUSTOMER


from acquisition_unit import next_stop_unit


def wash_details():
    wet=B.mat_surface('acq_water','#596462',rough=.08,coat=.65)
    foam=B.mat_surface('acq_foam','#c2c6b9',rough=.84)
    steel=B.mat_surface('acq_vacuum_steel','#6d8083',rough=.29,metallic=.85)
    for index,(x,y,sx,sy) in enumerate(((-4,11,2,1),(3,12,1.4,.7),(-5,16,1.6,.6))):
        patch=B.cylinder(f'acq_water_patch{index}',1,.006,(A.WASH_X+x,y,.083),wet,verts=40)
        patch.scale=(sx,sy,1)
        for i in range(6):
            residue=B.cylinder(f'acq_residue{index}{i}',.11,.003,(A.WASH_X+x+sx*.7,y-.36+i*.13,.088),foam,verts=16)
            residue.scale.y=.35
    for x in (-10.4,10.4):
        B.cylinder(f'acq_vacuum_motor{x}',.34,.4,(A.WASH_X+x,11,1.85),steel,verts=32)
        B.box(f'acq_vacuum_hanger{x}',(.06,.40,.07),(A.WASH_X+x+.37,11,1.50),steel,bevel=.02)
    for x in (-4,4):
        data=bpy.data.lights.new(f'acq_wash_practical{x}','AREA');data.energy=320;data.shape='RECTANGLE';data.size=3;data.size_y=5
        obj=bpy.data.objects.new(data.name,data);bpy.context.scene.collection.objects.link(obj);obj.location=(A.WASH_X+x,18,3.8)


def hide_billboard():
    for name in ('acq_sign_foot','acq_sign_post','acq_sign_body','acq_sign_screen'):
        bpy.data.objects[name].hide_render=True


def attach_phone(customer,frames):
    rig=next(obj for obj in customer.children_recursive if obj.type=='ARMATURE')
    # FBX forearm tail is beyond the wrist joint; the control is above the
    # desired handset height, which is checked from the actual hand matrix.
    target=B.empty('acq_handset_target',(-.12,-.10,1.34));target.parent=customer
    constraint=rig.pose.bones['Bip01 L Forearm'].constraints.new('IK')
    constraint.name='Raise handset after noticing';constraint.target=target;constraint.chain_count=2;constraint.use_stretch=False
    for frame,influence in ((0,0),(104,0),(120,1),(frames-1,1)):
        constraint.influence=influence;constraint.keyframe_insert('influence',frame=frame)
    phone=B.box('acq_customer_handset',(.069,.009,.14),(0,0,0),B.mat_surface('acq_handset','#14212b',rough=.3),bevel=.009)
    for frame in range(frames):
        bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
        hand=evaluated.matrix_world @ evaluated.pose.bones['Bip01 L Hand'].matrix
        phone.location=hand.translation
        phone.rotation_euler=(.1,0,customer.rotation_euler.z+math.pi)
        phone.scale=(0,0,0) if frame<104 else (1,1,1)
        phone.keyframe_insert('location',frame=frame);phone.keyframe_insert('rotation_euler',frame=frame);phone.keyframe_insert('scale',frame=frame)


def composition(W,option):
    car=A.carwash(W);car.location.y=13.0
    hide_billboard();wash_details();B.set_state(W,'morning',exposure=-2.25)
    frames=144
    if option=='vacuum':
        # Vacuum bay -> installed unit -> a deliberate pause -> handset.
        next_stop_unit(A.WASH_X-7.5,8.8)
        path=((0,A.WASH_X-9.2,10.7),(24,A.WASH_X-9.2,10.7),(72,A.WASH_X-8.7,7.2),(143,A.WASH_X-8.7,7.2))
        walk_yaw=.14;notice_yaw=2.50
        camera=(A.WASH_X-17,-5,1.8);target=(A.WASH_X-3.5,14,2)
        subject='the vacuum task ends beside an Uptick Next Stop unit; the customer pauses and raises a handset'
    elif option=='exit':
        # Architecture, not a freestanding poster: the unit belongs to the bay.
        next_stop_unit(A.WASH_X-7.5,13.6)
        path=((0,A.WASH_X-5.8,15.3),(72,A.WASH_X-6.4,11.7),(143,A.WASH_X-6.4,11.7))
        walk_yaw=-.16;notice_yaw=3.67
        camera=(A.WASH_X-13,-3,1.8);target=(A.WASH_X-1.9,15,2.2)
        subject='the customer leaving the wash bay encounters the Next Stop unit mounted at its exit'
    else:
        # Decision island: customer, vehicle and network unit share one triangle.
        next_stop_unit(A.WASH_X-5.8,7.6)
        path=((0,A.WASH_X-.5,8.0),(72,A.WASH_X-3.9,6.0),(143,A.WASH_X-3.9,6.0))
        walk_yaw=-1.04;notice_yaw=4.01
        camera=(A.WASH_X-13,-6,1.8);target=(A.WASH_X-1,14,2.15)
        subject='the customer leaves the vehicle, notices the network unit and makes the next-stop decision'
    customer=CUSTOMER.customer(path,frames,yaw=walk_yaw,stop_walking=72,notice_at=80,walk_from=24 if option=='vacuum' else 0)
    for frame,yaw in ((0,walk_yaw),(72,walk_yaw),(88,notice_yaw),(143,notice_yaw)):
        customer.rotation_euler.z=yaw;customer.keyframe_insert('rotation_euler',frame=frame)
    attach_phone(customer,frames)
    cam=CAM.Cam('block',lens=38,fstop=5.6,subject=subject,
        foreground='the vacuum equipment and wet source-business apron',background='the complete named car wash and open wash bays',
        motivation='let the customer action change the frame, while the source stays unmistakable')
    cam.lock(camera,target,frames,focus=(A.WASH_X-5,11,1.6),label=f'{option}: source and customer remain together')
    return dict(frames=frames,cam=cam.obj,names=[],meta={'spec':cam.spec(),'option':option,'actionFrames':{'finish':24,'encounter':72,'notice':80,'phone':104},'sourceId':'car-wash','gate':'UNAPPROVED COMPARISON'})


for option in ('vacuum','exit','island'):
    A.SHOTS[f'option-{option}']=lambda W,option=option:composition(W,option)

if __name__=='__main__':A.main()
