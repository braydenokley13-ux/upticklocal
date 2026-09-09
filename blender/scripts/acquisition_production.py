"""The full acquisition edit's physical shots. Shares the Gate-A camera world.

Cloud worker entry: Blender -b --python-exit-code 1 --python this_file -- SHOT ...
No legacy plate is used as a substitute for a missing acquisition render.
"""
import math
from pathlib import Path
import sys
import bpy
sys.path.insert(0,str(Path(__file__).resolve().parent))
import acquisition as A

B,SC,DV,CAM,CUSTOMER=A.B,A.SC,A.DV,A.CAM,A.CUSTOMER


def external(W):
    """The acquisition shot, resolved against rendered comparisons.

    'island' was the provisional pick from stills alone and is superseded. At
    1280x720 it, 'vacuum' and 'exit' all failed the same way: the unit stood
    against the wash building, so the offer read as a screen inside a garage
    rather than as equipment Uptick installed on the forecourt. 'forecourt'
    keeps the island's causal triangle -- customer, vehicle, unit -- and stands
    the unit clear of the building. It is authored at the edit's 168 frames
    rather than having a 144-frame animation relabelled to 168.
    """
    from acquisition_options import composition
    return composition(W,'forecourt')


def approach(W,friday=False):
    SC.look(W); SC.dress_joes(W)
    B.set_state(W,'morning',elev=12 if friday else 21,rot=105 if friday else 132,exposure=-2.55)
    CUSTOMER.customer(((0,-2.05,16.7),(47,-2.10,19.2)),48)
    cam=CAM.Cam('street',lens=50,fstop=4,subject='the same customer approaching Joe’s doorway',
        foreground='striped shoulder and the near forecourt edge',background='the door used on both visits',
        motivation='hold the destination while the customer chooses to enter')
    cam.lock((-1.15,10.4,1.34),(-1.80,19.9,1.52),48,focus=(-1.72,20.1,1.45),label='shared first/return approach')
    return dict(frames=48,cam=cam.obj,names=[],meta={'spec':cam.spec(),'day':'Friday' if friday else 'Tuesday','customerId':A.FIXTURE['hero']['customerId']})


def threshold(W,friday=False):
    # A.threshold is authored at the edit's length; nothing is relabelled here.
    return A.threshold(W,friday)


def route(W):
    # route_geography is authored at the edit's length; nothing is relabelled.
    return A.route_geography(W)


def counter(W,state,frames):
    """Identical phone and counter anchor persist from redemption to permission.
    The paid visit adds a wrapped breakfast; it is not another free reward.
    """
    m=SC.look(W); SC.dress_joes(W)
    B.set_state(W,'morning',elev=12 if state=='paid' else 21,rot=105 if state=='paid' else 132,exposure=-2.55,interior_w=980)
    path=A.SURFACES/'permission'/'0000.png' if state=='permission' else A.SURFACES/f'{state}.png'
    if not path.is_file(): raise FileNotFoundError(f'Required baked surface missing: {path}')
    screen=DV.screen_mat(f'acq_{state}_screen',str(path),frames=144 if state=='permission' else 1,strength=6.2)
    root,_=DV.phone(f'acq_{state}_phone',m['alu_dark'],screen)
    root.location=(3.6,21.96,1.008); root.rotation_euler=(-math.pi/2,0,0)
    DV.coffee(f'acq_{state}_coffee',(3.48,22.025,1.003),m['paper'],m['lid'],m['board'])
    if state=='paid':
        wrapper=B.mat_surface('acq_breakfast_wrapper','#c8b894',rough=.91,bump=.2)
        B.box('acq_wrapped_breakfast',(.125,.095,.055),(3.46,21.90,1.032),wrapper,bevel=.025)
        B.box('acq_wrapper_fold',(.115,.012,.005),(3.46,21.90,1.062),m['paper'],bevel=.003)
    cam=CAM.Cam('device',lens=75 if state=='paid' else 85,fstop=8,subject=f'{state}: the customer’s choice on the same handset',
        foreground='the edge of the acquired coffee, and breakfast on the paid return',background='Joe’s physical counter surface',
        motivation='keep the visit object in frame as its relationship state changes')
    cam.lock((3.57,21.75,1.60),(3.58,21.96,1.008),frames,focus=(3.6,21.96,1.013),label='shared counter axis')
    return dict(frames=frames,cam=cam.obj,names=[],meta={'spec':cam.spec(),'state':state,'sourceId':A.FIXTURE['hero']['sourceId'],'permissionFrame':78 if state=='permission' else None})


def pass_shot(W):
    A.carwash(W); B.set_state(W,'morning',exposure=-2.25)
    m=SC.look(W)
    root,_=DV.phone('acq_saved_pass',m['alu_dark'],DV.screen_mat('acq_saved_pass_screen',A.tex('pass'),strength=6.2))
    # The handset rests on the same car's bonnet at the source business.
    root.location=(A.WASH_X-3,9.15,1.13); root.rotation_euler=(-math.pi/2,0,0)
    cam=CAM.Cam('device',lens=85,fstop=8,subject='Main Street Car Wash remains the source on Joe’s coffee pass',
        foreground='the dark handset edge',background='the marine car bonnet at the wash exit',
        motivation='carry the installed offer into the customer’s own next-stop pass')
    cam.lock((A.WASH_X-3,8.94,1.72),(A.WASH_X-3,9.15,1.13),96,focus=(A.WASH_X-3,9.15,1.135),label='source-specific pass')
    return dict(frames=96,cam=cam.obj,names=[],meta={'spec':cam.spec(),'sourceId':'car-wash'})


def friday(W):
    # A new environment and a different clock make the elapsed days explicit.
    for obj in bpy.data.objects:
        if obj.type in ('MESH','FONT','CURVE'): obj.hide_render=True
    m=SC.look(W); B.set_state(W,'dusk',exposure=-1.6)
    oak=B.mat_surface('acq_kitchen_oak','#655347',rough=.7,bump=.15)
    B.box('acq_kitchen_table',(2.2,1.1,.05),(0,0,.76),oak,bevel=.02)
    root,_=DV.phone('acq_friday_phone',m['alu_dark'],DV.screen_mat('acq_friday_screen',A.tex('friday'),strength=6.2))
    root.location=(0,0,.794);root.rotation_euler=(-math.pi/2,0,0)
    B.box('acq_key_fob',(.033,.056,.013),(.13,.05,.794),m['paint'],bevel=.009)
    B.box('acq_key_blade',(.009,.04,.003),(.13,.096,.79),m['steel'],bevel=.001)
    light=bpy.data.lights.new('acq_kitchen_practical','AREA');light.energy=45;light.shape='DISK';light.size=.8
    lamp=bpy.data.objects.new('acq_kitchen_practical',light);bpy.context.scene.collection.objects.link(lamp);lamp.location=(-.4,.2,1.8)
    cam=CAM.Cam('device',lens=85,fstop=8,subject='a paid Friday breakfast offer reaching the permissioned customer days later',
        foreground='phone rim and familiar car keys',background='a home table, outside the station',motivation='a restrained callback before the physical return')
    cam.lock((0,-.21,1.39),(0,0,.794),144,focus=(0,0,.799),label='Thursday evening, the same handset')
    return dict(frames=144,cam=cam.obj,names=[],meta={'spec':cam.spec(),'clock':'Thursday · 4:42 PM','priceCents':499})


def partner_panel(name,x,y,z,source):
    from acquisition_unit import next_stop_unit
    return next_stop_unit(x,y,source=source)


def source_location(W,kind):
    # Source inserts show the operated installation grammar in distinct trades.
    # These are illustrative locations, not geocoded real businesses.
    for obj in bpy.data.objects:
        if obj.type in ('MESH','FONT','CURVE'): obj.hide_render=True
    m=SC.look(W); B.set_state(W,'morning',exposure=-2.25)
    B.plane('acq_partner_apron',(40,40),(0,10,0),B.mat_concrete('acq_partner_concrete','#9b978c'))
    wall=B.mat_surface('acq_partner_wall','#aba89e',rough=.85,bump=.2)
    name='QUICK LUBE' if kind=='quick-lube' else 'RIDGE TIRE'
    for x in (-5,5): B.box(f'acq_partner_pier{x}',(1,10,4),(x,14,2),wall,bevel=.04)
    B.box('acq_partner_roof',(11,10,.3),(0,14,4.15),m['paint'])
    B.box('acq_partner_fascia',(11,.3,.8),(0,8.95,3.8),m['paint'])
    B.text('acq_partner_name',name,.66,(0,8.78,3.57),m['paper'])
    if kind=='quick-lube':
        # The car sits on a two-post lift. Rendered with only two thin posts
        # behind it, it read as a car hovering in mid-air, so the lift is built
        # to be seen: base plates on the floor, posts either side, and carrying
        # arms reaching in under the sills.
        car=A.hero_car(0,14,yaw=math.pi/2);car.location.z=1.1
        steel=B.mat_surface('acq_lift_steel','#8d959a',rough=.42,metallic=.6)
        amber=B.mat_surface('acq_lift_amber','#b8823c',rough=.6)
        for x in (-2.15,2.15):
            B.box(f'acq_lift_base{x}',(1.10,1.30,.10),(x,14,.05),steel,bevel=.03)
            B.box(f'acq_lift_post{x}',(.46,.46,2.55),(x,14,1.28),steel,bevel=.05)
            B.box(f'acq_lift_cap{x}',(.54,.54,.10),(x,14,2.60),amber,bevel=.03)
            for dy in (-1.35,1.35):
                inward=-.62 if x>0 else .62
                B.box(f'acq_lift_arm{x}{dy}',(1.15,.20,.13),(x+inward,14+dy,1.02),steel,bevel=.03)
                B.box(f'acq_lift_pad{x}{dy}',(.26,.26,.10),(x+inward*1.55,14+dy,1.10),steel,bevel=.02)
    else:
        for x in (-3,-2.1,2.4):
            for i in range(5): B.cylinder(f'acq_tyre_{x}_{i}',.39,.20,(x,11.5,.10+i*.21),m['paint'],verts=32)
    partner_panel('acq_partner',-4.8,8.5,2.2,kind)
    cam=CAM.Cam('block',lens=40,fstop=5.6,subject=f'the same Uptick network operating at {name}',foreground='installed placement and service equipment',background='an open driver-serving business',motivation='repeat the system, change the source')
    cam.key(0,(-9,-2,1.7),(-2,10,2.3),focus=(-4.8,8.5,2.2),label='a different source')
    cam.key(47,(-8,0,1.7),(-2,10,2.3),focus=(-4.8,8.5,2.2),label='the same operated placement')
    CAM.ease_camera(cam.obj)
    return dict(frames=48,cam=cam.obj,names=[],meta={'spec':cam.spec(),'sourceId':kind})


def network(W):
    # This ending returns to the real destination after physical partner inserts.
    result=A.network(W);result['frames']=72
    result['cam'].animation_data_clear()
    cam=CAM.Cam('block',lens=40,fstop=8,subject='multiple arrivals converging at Joe’s after the source inserts',
        foreground='Joe’s canopy and the near road edge',background='the continuous local district',motivation='reveal the station as the shared destination')
    cam.key(0,(-18,-25,12),(0,12,2),focus=(0,12,2),label='the shared destination')
    cam.key(71,(-26,-48,28),(0,9,0),focus=(0,9,0),label='the network surrounds the station')
    for index,(x,y) in enumerate(((-23,-2),(21,2),(-14,-2))):
        car=A.hero_car(x,y,yaw=0 if x<0 else math.pi)
        for frame,at in ((0,(x,y,.1)),(71,(x*.25,y,.1))):
            car.location=at;car.keyframe_insert('location',frame=frame)
    CAM.ease_camera(cam.obj)
    return dict(frames=72,cam=cam.obj,names=[],meta={'spec':cam.spec(),'illustrative':True,'sourceInserts':['quick-lube','ridge-tire'],'notLiteralCustomerCount':True})


A.SHOTS.update({'external':external,'pass':pass_shot,'route':route,'approach':approach,'first':threshold,
    'redeemed':lambda W:counter(W,'redeemed',96),'permission':lambda W:counter(W,'permission',144),
    'friday':friday,'return-approach':lambda W:approach(W,True),'second':lambda W:threshold(W,True),
    'paid':lambda W:counter(W,'paid',144),'network-lube':lambda W:source_location(W,'quick-lube'),
    'network-tire':lambda W:source_location(W,'ridge-tire'),'network':network})

if __name__=='__main__': A.main()
