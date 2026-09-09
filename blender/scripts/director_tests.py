"""Bounded competing camera treatments. These do not change the selected edit."""
import sys,math
from pathlib import Path
import bpy
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
import director as D
B,A,CAM=D.B,D.A,D.CAM

def pair(W,mode,friday=False):
    shot=D.doorway(W,friday)
    n=96 if friday else 72
    if mode=='inside':
        eye=(-1.18,25.2,1.5);target=(-1.45,20.5,1.13);lens=42
        cam=CAM.Cam('human',lens=lens,fstop=2.8,subject='a customer enters a working local store',foreground='dark shelf edges',background='morning beyond the door',motivation='hold for the doorway action')
        cam.lock(eye,target,n,focus=(-1.5,20.6,1.25))
    elif mode=='follow':
        cam=CAM.Cam('human',lens=40,fstop=2.8,subject='the familiar shoulder takes us into Joe’s',foreground='soft shoulder and worn cotton',background='coffee counter and store interior',motivation='follow the customer through the same entrance on both days')
        cam.key(0,(-2.6,17.5,1.53),(-1.0,22,1.4),focus=(-.5,23,1.4))
        cam.key(n-1,(-1.4,19.4,1.53),(-.4,23,1.4),focus=(-.5,23,1.4))
    else:
        cam=CAM.Cam('human',lens=85,fstop=2.8,subject='sleeve and opening door, no exposed face',foreground='aluminum door edge',background='warm counter through glass',motivation='one tactile gesture becomes the visual rhyme')
        cam.lock((-3.05,18.6,1.10),(-1.45,20.4,1.05),n,focus=(-1.45,20.4,1.05))
    B.set_state(W,'morning',elev=9 if friday else 19,rot=188 if friday else 195,exposure=-2.5,interior_w=800)
    return D.finish(cam,n,treatment=mode,friday=friday)

def fragment(W,kind):
    shot=D.road_beat(W,'depart' if kind=='wheel' else 'arrive' if kind=='canopy' else 'turn')
    n=24
    if kind=='wheel':
        cam=CAM.Cam('human',lens=75,fstop=2.8,shutter=.25,subject='wet tire follows the curb out of the wash',foreground='wet curb with real depth',background='soft source architecture',motivation='keep wheel legible while pavement begins moving')
        cam.key(0,(A.WASH_X-8.6,2.4,.56),(A.WASH_X-6.49,5.7,.38),focus=(A.WASH_X-6.49,5.7,.38))
        cam.key(23,(A.WASH_X-12.6,1.2,.56),(A.WASH_X-10.49,4.5,.38),focus=(A.WASH_X-10.49,4.5,.38))
    elif kind=='curb':
        cam=CAM.Cam('street',lens=55,fstop=2.8,subject='one curb and its changing tree shadow',foreground='asphalt aggregate',background='edge of the next block',motivation='carry left-to-right movement through a match cut without exposing the whole car')
        cam.key(0,(18,1.4,.56),(17,4.55,.12),focus=(17,4.55,.12))
        cam.key(23,(12,1.4,.56),(11,4.55,.12),focus=(11,4.55,.12))
    elif kind=='canopy':
        cam=CAM.Cam('street',lens=65,fstop=4,subject='Joe’s canopy resolves the local journey',foreground='moving car window edge',background='destination name and canopy lights',motivation='the diagonal road line resolves as destination architecture')
        cam.key(0,(-13,4,1.35),(-1,16,3.5),focus=(-1,16,3.5))
        cam.key(23,(-12,6,1.35),(-1,16,3.5),focus=(-1,16,3.5))
    else:
        # This is a distinct passenger-POV composition, not an exterior orbit.
        car=next(o for o in bpy.data.objects if o.name=='director_vehicle')
        for o in car.children_recursive:
            if o.name.startswith(('BodyRoof','BodyWindshield','BodyHood')):o.hide_render=True
        cam=CAM.Cam('street',lens=35,fstop=5.6,subject='the destination through the passenger’s view',foreground='side glass and dashboard edge',background='the short local block',motivation='carry the viewer with the driver')
        cam.key(0,(16,-2,1.02),(3,-2,1.25),focus=(3,-2,1.25))
        cam.key(23,(10,-2,1.02),(-3,-2,1.25),focus=(-3,-2,1.25))
    return D.finish(cam,n,treatment=kind)

TESTS={**{f'pair-{mode}-{day}':(lambda W,m=mode,d=day:pair(W,m,d=='return')) for mode in ('inside','follow','detail') for day in ('first','return')},
       **{f'route-{kind}':(lambda W,k=kind:fragment(W,k)) for kind in ('wheel','curb','canopy','pov')}}
if __name__=='__main__':
    A.SHOTS.clear();A.SHOTS.update(TESTS);A.main()
