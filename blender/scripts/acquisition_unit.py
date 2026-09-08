"""The same installed Next Stop acquisition unit across source businesses."""
import math
import acquisition as A
B,DV=A.B,A.DV


def next_stop_unit(x,y,source='car-wash',yaw=0):
    """One reusable installed unit: sun hood, angled side fin, bolted base,
    permanent Next Stop identity and a replaceable merchant offer surface."""
    marine=B.mat_surface('next_stop_marine','#153541',rough=.48,metallic=.3)
    trim=B.mat_surface('next_stop_trim','#77918d',rough=.35,metallic=.75)
    amber=B.mat_surface('next_stop_amber','#c99047',rough=.6)
    cream=B.mat_surface('next_stop_cream','#f3f0e9',rough=.7)
    root=B.empty('next_stop_unit',(x,y,0));root.rotation_euler.z=yaw
    def part(obj):obj.parent=root;return obj
    part(B.box('next_stop_base',(1.45,.68,.10),(0,0,.08),marine,bevel=.035))
    part(B.box('next_stop_spine',(.30,.26,1.35),(0,0,.78),marine,bevel=.05))
    part(B.box('next_stop_body',(2.12,.23,1.54),(0,0,1.96),marine,bevel=.085))
    part(B.box('next_stop_hood',(2.25,.52,.10),(0,-.10,2.77),marine,bevel=.035))
    part(B.box('next_stop_fin',(.12,.31,1.70),(-1.13,0,1.98),amber,bevel=.025))
    part(B.text('next_stop_identity','NEXT STOP',.19,(0,-.126,2.52),cream,extrude=.001))
    part(B.text('next_stop_operator','BY UPTICK',.080,(0,-.127,1.32),cream,extrude=.001))
    for dx in (-.52,.52):
        for dy in (-.21,.21):part(B.cylinder(f'next_stop_bolt{dx}{dy}',.025,.014,(dx,dy,.137),trim,verts=6))
    image=A.tex('placement' if source=='car-wash' else f'placement-{source}')
    part(B.plane('next_stop_offer',(1.94,1.09125),(0,-.123,1.94),DV.screen_mat('next_stop_offer_screen',image,strength=4.2),rot=(math.pi/2,0,0)))
    return root
