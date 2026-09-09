"""Director candidate's physical photography. No render starts on import.

Small tests: Blender -b --python this_file -- first --frame 36 --res 640x360
  --samples 8 --device CPU --out /tmp/first.png
Final ranges are dispatched by scripts/director-production.py on Linux only.
"""
import json
import math
from pathlib import Path
import sys
import bpy
from functools import partial
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
import acquisition_production as P
import acquisition as A
from director_car import hero_car
from camera import _fcurves

B,SC,CAM,DV=A.B,A.SC,A.CAM,A.DV
# Only this director module selects the new asset; legacy entry points retain theirs.
A.hero_car=hero_car
A.CUSTOMER.customer=partial(A.CUSTOMER.customer,distance_driven=True)
EDIT=json.loads((A.ROOT/'film/final-director/edit.json').read_text())
COUNTS={s['id']:s['frames'] for s in EDIT['shots']}


def hide_world():
    for obj in bpy.data.objects:
        if obj.type in ('MESH','FONT','CURVE'):obj.hide_render=True


def retime_world(old_frames,new_frames,offset=0):
    """Move actual keys, not just a shot's duration label. Screen timing is separate.

    With offset, retain a real consecutive tail of the original action. Without
    offset, preserve start/end poses and scale every in-between key and handle.
    """
    ratio=1 if offset else (new_frames-1)/(old_frames-1)
    for action in bpy.data.actions:
        for curve in _fcurves(action):
            for key in curve.keyframe_points:
                for v in (key.co,key.handle_left,key.handle_right):v.x=(v.x-offset)*ratio
    bpy.context.scene.frame_set(0)


def finish(cam,frames,**meta):
    return dict(frames=frames,cam=cam.obj,names=[],meta={'spec':cam.spec(),**meta},comp={'mist':.025,'glare':.08})


def neighborhood_detail():
    """Actual near-street details rather than hectares of distant filler."""
    brick=B.mat_surface('director_brick','#98634c',rough=.9,bump=.35)
    paper=B.mat_surface('director_paper','#e9d9b6',rough=.85)
    green=B.mat_surface('director_leaf','#374c30',rough=.95,bump=.6)
    bark=B.mat_surface('director_bark','#4b3d31',rough=.95,bump=.5)
    for i,(x,y) in enumerate(((-19,7),(20,9),(-26,24),(23,30))):
        B.box(f'director_planter{i}',(2,1.3,.5),(x,y,.25),brick,bevel=.045)
        B.cylinder(f'director_tree_trunk{i}',.13,3.3,(x,y,1.65),bark,verts=12)
        for j in range(7):
            a=j*2.399
            o=B.box(f'director_canopy{i}_{j}',(1.8,1.4,1.25),(x+math.cos(a)*.8,y+math.sin(a)*.65,3.2+(j%3)*.35),green,bevel=.5)
            o.rotation_euler.z=a
    # A small sidewalk sign, not a new source or an invented product promise.
    B.box('director_sidewalk_board',(.64,.08,.85),(4.8,18.8,.56),paper,bevel=.025)
    B.text('director_open','OPEN',.14,(4.8,18.75,.7),brick)


def clear_foreground():
    # These legacy proxy cars and near foliage obstruct the new camera corridor.
    for obj in bpy.data.objects:
        if any(c.name=='cars' for c in obj.users_collection) or obj.name.startswith(('crown','near_lot_crown','near_lot_trunk','director_canopy0','director_tree_trunk0')):
            obj.hide_render=True


def station(W):
    SC.look(W);SC.dress_joes(W);neighborhood_detail()
    clear_foreground()
    B.set_state(W,'dusk',exposure=.6,interior_w=520)
    cam=CAM.Cam('block',lens=38,fstop=4,subject="Joe's warm store and the active street around it",
        foreground='a cropped near tree and textured street',background='the same local shops used in the journey',
        motivation='a patient lateral reveal that resolves at the store')
    cam.key(0,(-23,-15,3.2),(0,18,2.3),focus=(0,18,2.3),label='the station belongs to this street')
    cam.key(119,(-20,-13,3.2),(0,18,2.3),focus=(0,18,2.3),label='arrive at the warm store')
    CAM.ease_camera(cam.obj)
    return finish(cam,120,illustrative=True)


def wash(W):
    hide_world();shot=P.external(W)
    # Establishing coverage comes from the moment of encounter, not another walk.
    retime_world(168,24,offset=96)
    shot['frames']=24;shot['meta']['directorSourceRange']=[96,119]
    return shot


def encounter(W):
    hide_world();shot=P.external(W)
    retime_world(168,96,offset=72)
    old=shot['cam'];old.hide_render=True
    cam=CAM.Cam('human',lens=34,fstop=4,subject='one customer stops and raises the same handset at the external source',
        foreground='the edge of the washed vehicle',background='Main Street Car Wash fascia, open bay and permanent Uptick unit',
        motivation='start within the decision; the customer owns the frame')
    cam.key(0,(A.WASH_X-7.7,-3.9,1.55),(A.WASH_X-6.8,10,2.25),focus=(A.WASH_X-8.8,4.9,1.35),label='notice')
    cam.key(95,(A.WASH_X-8.1,-3.2,1.55),(A.WASH_X-6.8,10,2.25),focus=(A.WASH_X-8.8,4.9,1.35),label='act')
    CAM.ease_camera(cam.obj)
    return finish(cam,96,sourceId='car-wash',actionFrames={'stop':24,'notice':32,'handset':40},customerId=A.FIXTURE['hero']['customerId'])


def partner(W,kind):
    shot=P.source_location(W,kind)
    retime_world(48,24)
    shot['frames']=24;shot['meta']['retimedFrom']=48
    return shot


def invitation(W):
    hide_world();shot=P.pass_shot(W)
    retime_world(96,48);shot['frames']=48
    return shot


def road_beat(W,kind):
    SC.look(W);SC.dress_joes(W);neighborhood_detail()
    B.set_state(W,'morning',elev=16,rot=126,exposure=-2.25)
    clear_foreground()
    n=24
    if kind=='depart':
        hide_world();A.carwash(W)
        from acquisition_options import forecourt_wet,wash_details
        forecourt_wet();wash_details()
        car=A.hero_car(A.WASH_X-5,5.7,yaw=math.pi)
        start=(A.WASH_X-5,5.7,.1);end=(A.WASH_X-9,4.5,.1)
        pos=(A.WASH_X-8.0,1.7,.57);target=(A.WASH_X-5,5.7,.5)
        subject='a wet wheel leaves the car-wash apron';background='the same wet curb and source building'
    elif kind=='turn':
        car=A.hero_car(16,-2,yaw=math.pi)
        start=(16,-2,.1);end=(10,-2,.1)
        pos=(7,-8,.72);target=(13,-2,.8)
        subject='the familiar wagon passes one real corner';background="Joe's neighboring shopfronts and street trees"
    else:
        car=A.hero_car(-9,2,yaw=math.pi/2)
        start=(-9,2,.1);end=(-9,7,.1)
        pos=(-17,-3,1.4);target=(-5,15,2)
        subject="the same car turns under Joe's canopy";background="Joe's door, the destination of both visits"
    for f,loc in ((0,start),(23,end)):
        car.location=loc;car.keyframe_insert('location',frame=f)
    for child in car.children_recursive:
        if child.get('director_roll_axis')=='X':
            child.rotation_euler.x=0;child.keyframe_insert('rotation_euler',frame=0)
            child.rotation_euler.x=(Vector(end)-Vector(start)).length/.35
            child.keyframe_insert('rotation_euler',frame=23)
    cam=CAM.Cam('street',lens=48 if kind!='arrive' else 35,fstop=4,subject=subject,foreground='road texture and the marine wagon',background=background,motivation='three spatial anchors compress the trip without pretending to show real-time driving')
    cam.lock(pos,target,n,focus=target,label=kind)
    return finish(cam,n,routeMiles=.7,travelCompression='editorial ellipsis',beat=kind,notRealTime=True)


def doorway(W,friday=False):
    n=96 if friday else 72
    # Regenerate the whole crossing at the declared duration, including the door.
    shot=SC.shot_threshold(W,frames=n)
    for obj in bpy.data.objects:
        if obj.name.startswith('th_walker'):obj.hide_render=True
    A.CUSTOMER.customer(((0,-2.10,19.2),(round(n*.45),-1.52,20.42),(n-1,-.44,21.62)),n,orient_path=True)
    B.set_state(W,'morning',elev=12 if friday else 21,rot=188 if friday else 195,exposure=-2.25,interior_w=430)
    cam=CAM.Cam('human',lens=50,fstop=3.5,subject='the familiar shirt, gait and doorway; the face never carries the shot',
        foreground='warm counter edge and shelf detail',background="Joe's recognizable door and bright forecourt",motivation='identical waist-height lens for Tuesday and Friday; return gets one more second')
    cam.lock((-1.18,25.20,.94),(-1.55,20.45,.70),n,focus=(-1.1,20.8,.95),label='shared Tuesday/Friday camera')
    return finish(cam,n,day='Friday' if friday else 'Tuesday',customerId=A.FIXTURE['hero']['customerId'],pairedCamera=True)


def coffee(W,paid=False):
    n=96 if paid else 48
    shot=P.counter(W,'paid' if paid else 'redeemed',n)
    # Remove the redundant receipt shot from the first visit. The real coffee
    # is the subject; paid return retains its source-specific handset evidence.
    if not paid:
        for obj in bpy.data.objects:
            if obj.name.startswith('acq_redeemed_phone'):obj.hide_render=True
    cam=CAM.Cam('human',lens=65,fstop=5.6,subject='coffee and a modest paid breakfast' if paid else 'the first coffee at Joe’s',
        foreground='counter grain and the cup sleeve',background='the warm real shop',motivation='a short camera move gives the physical purchase more weight than its screen')
    target=(3.54,21.99,1.065)
    cam.key(0,(3.50,21.15,1.60),target,focus=target,label='the physical visit')
    cam.key(n-1,(3.56,21.18,1.60),target,focus=target,label='breakfast and coffee' if paid else 'coffee at Joe’s')
    CAM.ease_camera(cam.obj)
    return finish(cam,n,priceCents=499 if paid else 0,sourceId='car-wash')


def offer(W):
    shot=P.friday(W);retime_world(144,96);shot['frames']=96
    return shot


def neighborhood(W):
    SC.look(W);SC.dress_joes(W);neighborhood_detail()
    clear_foreground()
    B.set_state(W,'dusk',exposure=.6,interior_w=520)
    cam=CAM.Cam('block',lens=40,fstop=5.6,subject='the station is one destination in a larger inhabited neighborhood',
        foreground='warm windows and canopy',background='the continuous street and surrounding local businesses',motivation='expand the scale only after the returning customer has earned the payoff')
    cam.key(0,(-18,-12,5.5),(0,18,2),focus=(0,18,2),label='the destination')
    cam.key(167,(-27,-36,17),(0,13,1),focus=(0,13,1),label='the surrounding neighborhood')
    CAM.ease_camera(cam.obj)
    return finish(cam,168,illustrative=True,notLiteralCustomerCount=True)


DIRECTOR_SHOTS={'station':station,'wash':wash,'lube':lambda W:partner(W,'quick-lube'),'tire':lambda W:partner(W,'ridge-tire'),
    'encounter':encounter,'invitation':invitation,'depart':lambda W:road_beat(W,'depart'),'turn':lambda W:road_beat(W,'turn'),
    'arrive':lambda W:road_beat(W,'arrive'),'first':doorway,'coffee':coffee,'permission':lambda W:P.counter(W,'permission',144),
    'offer':offer,'return':lambda W:doorway(W,True),'paid':lambda W:coffee(W,True),'neighborhood':neighborhood}


def register():
    A.SHOTS.clear();A.SHOTS.update(DIRECTOR_SHOTS)


if __name__=='__main__':
    register();A.main()
