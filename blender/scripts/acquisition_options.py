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


def forecourt_wet():
    """The apron in front of the bays reads wet, so the source business shows
    a task that has just finished. The bays' own lanes are already wet; this is
    the water the vehicle carried out with it."""
    sheet=B.mat_surface('acq_forecourt_wet','#4b5350',rough=.07,coat=.8)
    film=B.mat_surface('acq_forecourt_film','#5a625e',rough=.19,coat=.45)
    for index,(x,y,sx,sy,mat) in enumerate((
            (-4,10.4,5.6,3.4,sheet),(4,10.6,5.4,3.2,sheet),
            (-4,7.0,4.4,2.0,film),(3.4,7.2,4.0,1.8,film),(-0.4,12.4,7.0,1.6,sheet))):
        patch=B.plane(f'acq_forecourt_wet{index}',(sx,sy),(A.WASH_X+x,y,.0781+index*.0004),mat)
    # Two tyre trails carry the water from the bay mouth to where the car stands,
    # drying as they get further from the bay.
    for lane,lane_x in enumerate((-4.05,-2.35)):
        for step in range(9):
            t=step/8
            B.plane(f'acq_trail{lane}{step}',(.62,1.15),
                (A.WASH_X+lane_x,13.4-step*1.05,.0797),
                B.mat_surface(f'acq_trail_mat{lane}{step}','#525a57',rough=.10+t*.42,coat=.75-t*.5))


def clear_sightline():
    """Move forecourt equipment that was authored for a wider camera and now
    lands between the customer and the offer they are reading. Nothing is
    deleted: the bollard and the near vacuum stay in shot, further left, where
    they still say the apron is in use."""
    bollard=bpy.data.objects.get('acq_near_bollard')
    if bollard is not None: bollard.location=(A.WASH_X-14.2,1.6,.6)
    for obj in bpy.data.objects:
        if obj.name.startswith(('acq_vacuum','acq_vaclabel','acq_hose')) and '-10.4' in obj.name:
            obj.location.x-=2.2


def hide_billboard():
    for name in ('acq_sign_foot','acq_sign_post','acq_sign_body','acq_sign_screen'):
        bpy.data.objects[name].hide_render=True


def attach_phone(customer,frames,phone_at=104):
    """Place the handset in whatever pose the bake produced.

    A two-bone IK was tried here first and flattened the arm at 1:1: the solver
    fought the per-frame matrix_basis keys the retarget writes on the same
    bones. The arm is posed inside the bake instead (customer(handset_at=...)),
    and this function only follows the resulting hand.
    """
    rig=next(obj for obj in customer.children_recursive if obj.type=='ARMATURE')
    phone=B.box('acq_customer_handset',(.069,.009,.14),(0,0,0),B.mat_surface('acq_handset','#14212b',rough=.3),bevel=.009)
    # At this distance an unlit 14cm slab is a few pixels of shadow. The screen
    # face is what a viewer actually notices, so it is emissive here, matching
    # the pass shot the edit cuts to next.
    face=B.plane('acq_customer_handset_face',(.058,.118),(0,0,0),
        DV.screen_mat('acq_customer_handset_screen',A.tex('pass'),strength=2.4),rot=(math.pi/2,0,0))
    face.parent=phone;face.location=(0,-.0055,0)
    for frame in range(frames):
        bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
        hand=evaluated.matrix_world @ evaluated.pose.bones['Bip01 L Hand'].matrix
        phone.location=hand.translation
        phone.rotation_euler=(.1,0,customer.rotation_euler.z+math.pi)
        phone.scale=(0,0,0) if frame<phone_at else (1,1,1)
        phone.keyframe_insert('location',frame=frame);phone.keyframe_insert('rotation_euler',frame=frame);phone.keyframe_insert('scale',frame=frame)


def composition(W,option):
    car=A.carwash(W);car.location.y=13.0
    hide_billboard();wash_details()
    frames=144
    if option=='forecourt':
        return forecourt(W,car)
    B.set_state(W,'morning',exposure=-2.25)
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
    customer=CUSTOMER.customer(path,frames,yaw=walk_yaw,stop_walking=72,notice_at=80,handset_at=104,walk_from=24 if option=='vacuum' else 0)
    for frame,yaw in ((0,walk_yaw),(72,walk_yaw),(88,notice_yaw),(143,notice_yaw)):
        customer.rotation_euler.z=yaw;customer.keyframe_insert('rotation_euler',frame=frame)
    attach_phone(customer,frames)
    cam=CAM.Cam('block',lens=38,fstop=5.6,subject=subject,
        foreground='the vacuum equipment and wet source-business apron',background='the complete named car wash and open wash bays',
        motivation='let the customer action change the frame, while the source stays unmistakable')
    cam.lock(camera,target,frames,focus=(A.WASH_X-5,11,1.6),label=f'{option}: source and customer remain together')
    return dict(frames=frames,cam=cam.obj,names=[],meta={'spec':cam.spec(),'option':option,'actionFrames':{'finish':24,'encounter':72,'notice':80,'phone':104},'sourceId':'car-wash','gate':'UNAPPROVED COMPARISON'})


def forecourt(W,car):
    """Revision after inspecting the first three comparisons.

    All three shared the same defeat: the unit stood inside or against the wash
    building, so the offer read as a screen hung in a garage rather than as
    equipment Uptick installed on the forecourt. Here the unit stands clear of
    the building's left edge, silhouetted against open ground, at a distance
    where its body -- base, spine, hood and side fin -- is legible as hardware.
    The full car wash stays in frame behind it; this is not a billboard push-in.
    """
    frames=168
    forecourt_wet();clear_sightline()
    # A raking morning sun side-lights the unit and lets the wet apron carry a
    # specular. The earlier comparisons were flatly lit from too high.
    B.set_state(W,'morning',elev=14,rot=118,exposure=-2.3)
    # The washed vehicle stands out on the apron in daylight instead of being
    # swallowed by an unlit bay, which is what made it unreadable before.
    car.location=(A.WASH_X-3.2,9.8,.1);car.rotation_euler.z=-.30
    unit=next_stop_unit(A.WASH_X-10.8,6.8,yaw=.45)
    # Finish at the car, cross the apron, stop at the unit's face, then the
    # handset. The customer is read from behind: the asset supports silhouette,
    # gait and blocking, not a portrait.
    start=(A.WASH_X-6.3,7.8);end=(A.WASH_X-8.8,4.9)
    path=((0,)+start,(24,)+start,(96,)+end,(frames-1,)+end)
    walk_yaw=-.876;notice_yaw=-2.331
    customer=CUSTOMER.customer(path,frames,yaw=walk_yaw,stop_walking=96,notice_at=104,handset_at=112,walk_from=24)
    for frame,yaw in ((0,walk_yaw),(96,walk_yaw),(116,notice_yaw),(frames-1,notice_yaw)):
        customer.rotation_euler.z=yaw;customer.keyframe_insert('rotation_euler',frame=frame)
    attach_phone(customer,frames,phone_at=112)
    cam=CAM.Cam('block',lens=32,fstop=5.6,
        subject='a customer finishing at Main Street Car Wash stops at an installed Next Stop unit and takes the offer on their handset',
        foreground='the wet forecourt the vehicle has just carried water across',
        background='the complete named car wash, its open bays and brushes',
        motivation='hold source, customer, vehicle and installed unit in one frame, and let the walk change it')
    # A three-metre drift, not a push-in: the wash is as readable at the end.
    cam.key(0,(A.WASH_X-9.6,-7.6,1.62),(A.WASH_X-5.4,12,2.4),focus=(A.WASH_X-10.8,6.8,1.94),label='the source business, whole')
    cam.key(frames-1,(A.WASH_X-8.6,-4.6,1.50),(A.WASH_X-5.4,12,2.4),focus=(A.WASH_X-10.8,6.8,1.94),label='the installed unit, and the decision at it')
    CAM.ease_camera(cam.obj)
    return dict(frames=frames,cam=cam.obj,names=[],meta={'spec':cam.spec(),'option':'forecourt',
        'actionFrames':{'finish':24,'encounter':96,'notice':104,'phone':112},
        'sourceId':'car-wash','gate':'UNAPPROVED COMPARISON'})


for option in ('vacuum','exit','island','forecourt'):
    A.SHOTS[f'option-{option}']=lambda W,option=option:composition(W,option)

if __name__=='__main__':A.main()
