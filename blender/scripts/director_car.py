"""Licensed detailed vehicle comparison; isolated from the historical film."""
import math
from pathlib import Path
import bpy
import block as B

ASSET=Path(__file__).resolve().parents[1]/'assets/director-car/car.glb'

def hero_car(x,y,yaw=0):
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(ASSET))
    imported=set(bpy.data.objects)-before
    root=B.empty('director_vehicle',(x,y,.1),group='acquisition')
    root.rotation_euler.z=yaw
    alignment=B.empty('director_vehicle_alignment',(0,0,0),group='acquisition')
    alignment.parent=root
    alignment.rotation_euler.z=math.pi/2  # glTF front -Y -> production front +X
    paint=B.mat_surface('director_marine_car','#183443',rough=.29,metallic=.65,coat=.5)
    trim=B.mat_surface('director_car_trim','#171b1e',rough=.42)
    plate=B.mat_surface('director_plain_plate','#a4aaa9',rough=.58)
    for obj in imported:
        if not obj.parent:obj.parent=alignment
        if 'emblem' in obj.name.lower():obj.hide_render=True
        for slot in obj.material_slots:
            if not slot.material:continue
            name=slot.material.name.replace(' ','')
            if name.startswith('Paint1'):slot.material=paint
            elif name.startswith('Paint2'):slot.material=trim
            elif name in ('License','PanelSides','Material_2'):slot.material=plate if name=='License' else trim
        if obj.name in ('WheelFrontL','WheelFrontR','WheelRearL','WheelRearR'):
            obj['director_roll_axis']='X'
    return root
