"""Acquisition Gate-A physical prototypes, in the existing Main Street world.

Blender --background --python blender/scripts/acquisition.py -- carwash --frame 48
No legacy plate is overwritten. New outputs and camera declarations are separate.
"""
from __future__ import annotations
import argparse
import json
import math
import os
from pathlib import Path
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
import block as B
import body as BD
import camera as CAM
import device as DV
import scenes as SC
import shots as S
import acquisition_customer as CUSTOMER

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = json.loads((ROOT / 'film/data/acquisition.json').read_text())
SURFACES = ROOT / 'blender/screens/acquisition'
# Canonical Joe's remains at the original location. The car-wash endpoint is
# 0.7 miles along Main Street; the camera uses explicit cuts to compress travel.
WASH_X = 0.7 * 1609.344


def tex(state):
    path = SURFACES / f'{state}.png'
    if not path.exists():
        raise FileNotFoundError(f'Bake Acquisition-{state} before rendering: {path}')
    return str(path)


def hero_materials():
    return (B.mat_surface('acq_coat', '#996c39', rough=.82),
            B.mat_surface('acq_trousers', '#202b30', rough=.9))


def driver(name, location, frames=96):
    coat, trousers = hero_materials()
    root, parts = BD.figure(name, location, coat, height=1.72)
    for key in ('leg_l', 'leg_r'):
        parts[key].data.materials[0] = trousers
    # This remains a distance/silhouette asset; it is not approved for facial acting.
    BD.gait(parts, frames, speed=.8, height=1.72)
    return root


def road_extension():
    asphalt = B.mat_asphalt()
    grass = B.mat_surface('acq_land', '#596050', rough=1, bump=.2)
    B.plane('acq_terrain', (3000, 900), (900, 0, -.025), grass)
    B.plane('acq_MainStreet', (WASH_X + 80, 9), ((WASH_X + 80)/2, 0, .002), asphalt)
    paint = B.mat_surface('acq_road_paint', '#cfc8b5', rough=.95)
    for x in range(110, int(WASH_X)+50, 12):
        B.box(f'acq_dash_{x}', (3, .10, .006), (x, 0, .009), paint, bevel=0)
    for y in (-4.2, 4.2):
        B.box(f'acq_edge_{y}', (WASH_X, .1, .006), (WASH_X/2, y, .009), paint, bevel=0)


def hero_car(x,y,yaw=0):
    """A recognisable estate-car silhouette, with glass, pillars and wheel detail.
    Still requires a final-resolution asset gate before it is a hero object.
    """
    root=B.empty('acq_vehicle',(x,y,.1),group='acquisition')
    root.rotation_euler.z=yaw
    paint=B.mat_surface('acq_vehicle_paint','#183443',rough=.38,metallic=.2,coat=.25)
    glass=B.mat_surface('acq_vehicle_glass','#15222b',rough=.14,metallic=.25,coat=.4)
    trim=B.mat_surface('acq_vehicle_trim','#17191a',rough=.45)
    alloy=B.mat_surface('acq_vehicle_alloy','#435055',rough=.38,metallic=.65)
    head=B.mat_surface('acq_vehicle_headlamp','#d5dcd6',rough=.13,metallic=.35)
    tail=B.mat_surface('acq_vehicle_tail','#752a21',rough=.25,coat=.3)
    def part(name,size,loc,material,bevel=.025):
        obj=B.box('acq_vehicle_'+name,size,loc,material,bevel=bevel,group='acquisition',shade_smooth=True)
        obj.parent=root
        return obj
    part('lower',(4.55,1.86,.51),(0,0,.58),paint,.15)
    part('hood',(1.25,1.77,.18),(1.35,0,.91),paint,.10)
    part('cabin',(2.78,1.57,.57),(-.34,0,1.19),glass,.17)
    part('roof',(2.42,1.51,.075),(-.39,0,1.49),paint,.07)
    part('front_bumper',(.12,1.77,.22),(2.27,0,.53),trim,.04)
    part('grille',(.018,.87,.19),(2.335,0,.70),trim,.004)
    part('rear_bumper',(.13,1.80,.18),(-2.25,0,.48),trim,.035)
    for side in (-1,1):
        part(f'sill{side}',(3.22,.055,.10),(-.12,side*.94,.35),trim)
        part(f'mirror{side}',(.20,.23,.12),(.67,side*.93,1.09),paint,.06)
        for px in (-1.37,-.40,.66):
            part(f'pillar{side}{px}',(.075,.04,.49),(px,side*.77,1.23),paint,.008)
        for px in (-.95,.27):
            part(f'handle{side}{px}',(.19,.035,.03),(px,side*.94,.90),alloy,.005)
        part(f'head{side}',(.035,.43,.15),(2.275,side*.60,.85),head,.03)
        part(f'tail{side}',(.04,.32,.25),(-2.265,side*.64,.83),tail,.02)
        for px in (-1.45,1.45):
            wheel=B.cylinder(f'acq_vehicle_tyre{px}{side}',.34,.25,(px,side*.84,.34),trim,rot=(math.pi/2,0,0),verts=40,group='acquisition'); wheel.parent=root
            rim=B.cylinder(f'acq_vehicle_rim{px}{side}',.24,.012,(px,side*.972,.34),alloy,rot=(math.pi/2,0,0),verts=32,group='acquisition'); rim.parent=root
            hub=B.cylinder(f'acq_vehicle_hub{px}{side}',.06,.025,(px,side*.983,.34),trim,rot=(math.pi/2,0,0),verts=24,group='acquisition'); hub.parent=root
    return root


def carwash(W):
    road_extension()
    x = WASH_X
    cream = B.mat_surface('acq_wash_wall', '#c3bcb0', rough=.8, bump=.28, dirt=.15)
    metal = B.mat_surface('acq_wash_metal', '#273c40', rough=.36, metallic=.3)
    rubber = B.mat_surface('acq_wash_brush', '#243f45', rough=.95)
    pale = B.mat_surface('acq_wash_type', '#eee7d7', rough=.55)
    wet = B.mat_surface('acq_wet', '#3f4544', rough=.16, coat=.25)
    B.box('acq_wash_apron', (26, 26, .10), (x, 17, .02), B.mat_concrete('acq_wash_concrete', '#8c8b81'), bevel=.04)
    # Two deep wash bays, open to the apron, framed by piers and a full fascia.
    for dx in (-8, 0, 8):
        B.box(f'acq_wash_pier{dx}', (.8, 14, 4.4), (x+dx, 21, 2.2), cream, bevel=.06)
    B.box('acq_wash_roof', (17.4, 14.4, .32), (x, 21, 4.5), metal)
    B.box('acq_wash_fascia', (17.4, .40, 1.25), (x, 13.95, 4.32), metal)
    B.text('acq_wash_name', 'MAIN STREET CAR WASH', .60, (x, 13.72, 4.13), pale, extrude=.003)
    for bay in (-4, 4):
        B.box(f'acq_wet_lane{bay}', (5.7, 12, .009), (x+bay, 19, .078), wet, bevel=0)
        for off in (-2.1, 2.1):
            B.cylinder(f'acq_brush{bay}{off}', .62, 2.8, (x+bay+off, 19, 1.65), rubber, verts=40)
            for z in range(12):
                B.cylinder(f'acq_brush_rib{bay}{off}{z}', .65, .025, (x+bay+off, 19, .34+z*.22), metal, verts=32)
        B.text(f'acq_exit{bay}', 'EXIT', .36, (x+bay, 13.71, 3.69), pale, extrude=.002)
    # Vacuum machines, hose loops, trench grate and a near bollard establish use.
    for dx in (-10.4, 10.4):
        B.box(f'acq_vacuum{dx}', (.75, .68, 1.6), (x+dx, 11, .87), metal, bevel=.12)
        B.text(f'acq_vaclabel{dx}', 'VACUUM', .12, (x+dx, 10.65, 1.25), pale, extrude=.001)
        curve = bpy.data.curves.new(f'acq_hose{dx}', 'CURVE')
        curve.dimensions='3D'; curve.bevel_depth=.035; curve.bevel_resolution=3
        spline=curve.splines.new('POLY'); spline.points.add(24)
        for i, point in enumerate(spline.points):
            a=i/24*math.pi*1.8
            point.co=(x+dx+.50+.45*math.sin(a), 10.9, .85+.65*math.cos(a), 1)
        hose=bpy.data.objects.new(f'acq_hose{dx}', curve); B._link(hose,'acquisition'); curve.materials.append(rubber)
    for i in range(45):
        B.box(f'acq_drain{i}', (.085, .45, .014), (x-6+i*.28, 12.8, .08), metal, bevel=0)
    # Placement is an emitted surface inside a real, grounded exit panel.
    sx, sy = x-8.7, 7.8
    B.box('acq_sign_foot', (1.4, .8, .10), (sx, sy, .10), metal, bevel=.04)
    B.box('acq_sign_post', (.14, .16, 1.30), (sx, sy, .78), metal)
    B.box('acq_sign_body', (2.8, .18, 1.62), (sx, sy, 2.12), metal, bevel=.04)
    B.plane('acq_sign_screen', (2.68, 1.5075), (sx, sy-.097, 2.12), DV.screen_mat('acq_placement', tex('placement'), strength=3.5), rot=(math.pi/2,0,0))
    B.cylinder('acq_near_bollard', .10, 1.15, (x-11.8, 3.2, .6), metal, verts=20)
    vehicle=hero_car(x-3,10.5,yaw=-math.pi/2)
    return vehicle


def external(W):
    carwash(W)
    B.set_state(W,'morning', exposure=-2.25)
    CUSTOMER.customer(((0,WASH_X-4.7,11),(119,WASH_X-6.7,9)),120,yaw=-math.pi/2)
    cam=CAM.Cam('block', lens=40, fstop=5.6, subject='a customer at Main Street Car Wash, beside the exit placement',
        foreground='a near vacuum bollard, cropped at the left edge', background='open wash bays, brushes and the EXIT fascia',
        motivation='settle beside the exit to discover the next-stop placement')
    cam.key(0,(WASH_X-13,-7,1.8),(WASH_X-2,14,2.3),focus=(WASH_X-6,10,2),label='car wash first')
    cam.key(119,(WASH_X-10,1.4,1.9),(WASH_X-8.1,8,2.12),focus=(WASH_X-8.7,7.8,2.12),label='readable placement, car wash behind')
    CAM.ease_camera(cam.obj)
    return dict(frames=120,cam=cam.obj,names=[],meta={'spec':cam.spec(),'source':FIXTURE['hero']['sourceId']})


def external_exit(W):
    """Alternative: the offer is encountered from inside the source's exit lane."""
    vehicle=carwash(W)
    vehicle.hide_render=True
    for obj in vehicle.children_recursive: obj.hide_render=True
    B.set_state(W,'morning',exposure=-2.25)
    pivot=B.empty('acq_exit_placement',(WASH_X-8.7,7.8,0))
    bpy.context.view_layer.update()
    for name in ('acq_sign_foot','acq_sign_post','acq_sign_body','acq_sign_screen'):
        obj=bpy.data.objects[name]
        saved=obj.matrix_world.copy(); obj.parent=pivot; obj.matrix_world=saved
    pivot.rotation_euler.z=math.pi
    metal=B.mat_surface('acq_exit_dash','#14212a',rough=.65)
    # A cropped dashboard establishes the customer's viewpoint without exposing
    # a face or a hand. The camera and dashboard travel together out of the bay.
    rig=B.empty('acq_exit_camera_car',(0,0,0))
    dash=B.box('acq_exit_dashboard',(2.0,.5,.2),(WASH_X-4,14.8,.83),metal,bevel=.09)
    dash.parent=rig
    cam=CAM.Cam('block',lens=32,fstop=8,subject='Joe’s placement encountered while leaving the wash',
        foreground='dashboard and wet wash-bay pavement',background='the exit-mounted placement and the real road beyond',
        motivation='the driver’s next decision occurs at the source’s exit')
    cam.key(0,(WASH_X-4,17,1.45),(WASH_X-8.5,7.8,2.0),focus=(WASH_X-8.7,7.8,2.12),label='inside the wash exit')
    cam.key(71,(WASH_X-4.8,13,1.45),(WASH_X-8.7,7.8,2.12),focus=(WASH_X-8.7,7.8,2.12),label='the next stop enters the driving decision')
    CAM.ease_camera(cam.obj)
    return dict(frames=72,cam=cam.obj,names=[],meta={'spec':cam.spec(),'alternative':'exit-driver-view','source':FIXTURE['hero']['sourceId']})


def route_geography(W):
    carwash(W)
    SC.dress_joes(W)
    B.set_state(W,'morning',exposure=-2.25)
    car=hero_car(WASH_X-10,2.1,yaw=math.pi)
    for frame,x in ((0,WASH_X-10),(119,1)):
        car.location.x=x; car.keyframe_insert('location',frame=frame)
    cam=CAM.Cam('block',lens=32,fstop=8,subject='the external source and Joe’s joined by the same physical Main Street',
        foreground='the wash exit at the start, Joe’s canopy at the end',background='the full seven-tenths-mile road between businesses',
        motivation='compress travel while preserving both physical endpoints')
    cam.obj.data.clip_end=2400
    cam.key(0,(WASH_X-18,-25,14),(WASH_X-3,14,2),focus=(WASH_X-3,14,2),label='source business')
    cam.key(48,(WASH_X*.58,-125,155),(WASH_X*.50,0,0),focus=(WASH_X*.50,0,0),label='one continuous road')
    cam.key(119,(-18,-25,12),(0,18,2),focus=(0,18,2),label='Joe’s is the destination')
    CAM.ease_camera(cam.obj)
    return dict(frames=120,cam=cam.obj,names=[],meta={'spec':cam.spec(),'routeMiles':.7,'alternative':'continuous-geography','travelCompression':'120 frames cover the full road, not real-time driving'})


def route(W):
    carwash(W)
    B.set_state(W,'morning',exposure=-2.25)
    # A painted distance is photographed on the road, never a map over the road.
    paint=B.mat_surface('acq_distance_paint','#ddd6c4',rough=.94,bump=.15)
    B.text('acq_distance','0.7 mi',1.25,(WASH_X-18,1.65,.019),paint,rot=(0,0,0),extrude=0)
    car=hero_car(WASH_X-22,2.1,yaw=math.pi)
    for f,px in ((0,WASH_X-22),(167,WASH_X-90)):
        car.location.x=px; car.keyframe_insert('location',frame=f)
    cam=CAM.Cam('page',lens=40,fstop=7.1,subject='0.7 mi physically painted on Main Street, then the car taking that road',
        foreground='road paint and asphalt aggregate',background='the car-wash exit receding along Main Street',
        motivation='the distance stops being text as the camera lifts enough to reveal the road beneath it')
    cam.obj.data.clip_end=2200
    cam.key(0,(WASH_X-18,2.1,9),(WASH_X-18,2.1,0),focus=9,label='distance on pavement')
    cam.key(36,(WASH_X-18,2.1,9),(WASH_X-18,2.1,0),focus=9,label='hold the full distance for reading')
    cam.key(82,(WASH_X-42,-20,19),(WASH_X-33,2,0),focus=(WASH_X-33,2,0),label='car enters the physical route')
    cam.key(167,(WASH_X-102,-20,17),(WASH_X-83,3,0),focus=(WASH_X-83,3,0),label='follow west toward Joes')
    CAM.ease_camera(cam.obj)
    return dict(frames=168,cam=cam.obj,names=[],meta={'spec':cam.spec(),'routeMiles':.7,'travelCompression':'cuts required between source road and Joe endpoint'})


def threshold(W, friday=False):
    shot=SC.shot_threshold(W)
    for obj in bpy.data.objects:
        if obj.name.startswith('th_walker'): obj.hide_render=True
    CUSTOMER.customer(((0,-2.10,19.2),(18,-1.52,20.42),(39,-.44,21.62)),40)
    B.set_state(W,'morning',elev=12 if friday else 21,rot=105 if friday else 132,exposure=-2.55,interior_w=980)
    shot['meta']['clock']='Friday · 7:36 AM' if friday else 'Tuesday · 8:17 AM'
    shot['meta']['customerId']=FIXTURE['hero']['customerId']
    return shot


def permission(W):
    m=SC.look(W); SC.dress_joes(W); B.set_state(W,'morning')
    frames=144
    first=SURFACES/'permission'/'0000.png'
    if not first.exists(): raise FileNotFoundError('Bake permission sequence before physical permission shot')
    screen=DV.screen_mat('acq_permission',str(first),frames=frames,strength=5.4)
    root,parts=DV.phone('acq_permission_phone',m['alu'],screen)
    root.location=(3.6,21.96,1.001); root.rotation_euler=(-math.pi/2,0,0)
    cam=CAM.Cam('device',lens=85,fstop=5.6,subject='the explicit KEEP ME POSTED choice becoming You are in',
        foreground='the chamfer of the handset resting on the counter',background='the actual counter laminate around the handset',motivation='locked on the customer choice')
    cam.lock((3.6,21.75,1.60),(3.6,21.96,1.001),frames,focus=(3.6,21.96,1.005),label='same phone, after redemption')
    return dict(frames=frames,cam=cam.obj,names=[],meta={'spec':cam.spec(),'permissionFrame':78})


def network(W):
    # Gate-A tests the physical pullback, not final P1 network asset finish.
    B.set_state(W,'morning',exposure=-2.5)
    cam=CAM.Cam('block',lens=40,fstop=8,subject='Joe’s and the Main Street businesses around it',
        foreground='the canopy and near street lamps',background='the continuous local street',
        motivation='expand from the customer destination to the district around it')
    cam.key(0,(-18,-25,12),(0,12,2),focus=(0,12,2),label='Joe’s destination')
    cam.key(143,(-26,-56,38),(0,9,0),focus=(0,9,0),label='the local district')
    CAM.ease_camera(cam.obj)
    return dict(frames=144,cam=cam.obj,names=[],meta={'spec':cam.spec(),'gateAOnly':True})


SHOTS={'carwash':external,'carwash-exit':external_exit,'route':route,'route-geography':route_geography,'first':threshold,'second':lambda W:threshold(W,True),'permission':permission,'network':network}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('shot',choices=SHOTS)
    parser.add_argument('--frame',type=int,default=0)
    parser.add_argument('--sequence',action='store_true')
    parser.add_argument('--step',type=int,default=1,help='Sparse motion inspection only; final plates use 1')
    parser.add_argument('--res',default='640x360')
    parser.add_argument('--samples',type=int,default=8)
    parser.add_argument('--device',choices=['CPU','METAL','CUDA','OPTIX'],default='CPU')
    parser.add_argument('--out',required=True)
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:])
    w,h=map(int,args.res.split('x')); S.settings(w,h,args.samples)
    scene=bpy.context.scene
    scene.render.threads_mode='FIXED'; scene.render.threads=2
    if args.device!='CPU':
        prefs=bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type=args.device; prefs.refresh_devices()
        gpu=[device for device in prefs.devices if device.type==args.device]
        if not gpu: raise RuntimeError(f'{args.device} requested but no matching GPU is available')
        for device in prefs.devices: device.use=device.type==args.device
        scene.cycles.device='GPU'
    start=time.monotonic(); world=B.build()
    if args.shot in ('carwash','carwash-exit','external','pass') or args.shot.startswith('option-') or (args.shot=='route' and SHOTS[args.shot] is route):
        # Joe's is more than a kilometre outside these cameras. Its detailed
        # shelves, glazing and props must not consume this shot's render memory.
        for obj in list(bpy.data.objects):
            if obj.type in ('MESH','FONT','CURVE'):
                obj.hide_render=True
    shot=SHOTS[args.shot](world)
    scene.render.fps=FIXTURE['fps']; scene.render.fps_base=1
    scene.frame_start=0; scene.frame_end=shot['frames']-1
    if args.frame<0 or args.frame>=shot['frames']: raise ValueError('Frame outside shot')
    S.compositor(**shot.get('comp',{'mist':.06,'glare':.08}))
    if args.step<1: raise ValueError('Step must be positive')
    out=Path(args.out)
    if args.sequence: out.mkdir(parents=True,exist_ok=True)
    else: out.parent.mkdir(parents=True,exist_ok=True)
    timings=[]
    frames=range(0,shot['frames'],args.step) if args.sequence else [args.frame]
    for frame in frames:
        scene.frame_set(frame)
        destination=out/f'{frame:04d}.png' if args.sequence else out
        scene.render.filepath=str(destination.resolve())
        frame_start=time.monotonic()
        bpy.ops.render.render(write_still=True)
        timings.append({'frame':frame,'seconds':round(time.monotonic()-frame_start,3)})
        print('ACQUISITION_FRAME',json.dumps(timings[-1]),flush=True)
    report={'shot':args.shot,'frame':args.frame,'width':w,'height':h,'fps':scene.render.fps,'samples':args.samples,
            'device':args.device,'seconds':round(time.monotonic()-start,3),'camera':shot['meta'],
            'sequence':args.sequence,'step':args.step,'frameTimings':timings}
    report_path=out/'render.json' if args.sequence else out.with_suffix('.json')
    report_path.write_text(json.dumps(report,indent=2))
    print('ACQUISITION_RENDER',json.dumps(report),flush=True)


if __name__=='__main__': main()
