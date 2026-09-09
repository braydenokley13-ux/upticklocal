import bpy,json,sys,math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender/scripts'))
import acquisition_customer as C
out=[]
for corrected in (False,True):
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.scene.render.fps=24
 root=C.customer(((0,0,0),(71,0,2.7)),72,distance_driven=corrected)
 rig=bpy.data.objects['acq_customer_rig'];rows=[]
 for f in range(72):
  bpy.context.scene.frame_set(f);bpy.context.view_layer.update()
  rows.append({'f':f,'hips':list((rig.matrix_world@rig.pose.bones['Bip01 Pelvis'].matrix).translation),'left':list((rig.matrix_world@rig.pose.bones['Bip01 L Toe0'].matrix).translation),'right':list((rig.matrix_world@rig.pose.bones['Bip01 R Toe0'].matrix).translation)})
 jumps=[math.dist(a['hips'],b['hips']) for a,b in zip(rows,rows[1:])]
 out.append({'corrected':corrected,'maximumHipStepMetres':max(jumps),'rows':rows})
 print('GAIT_RESULT',corrected,max(jumps),flush=True)
Path('film/final-director/review/alternatives/gait-comparison.json').write_text(json.dumps(out,indent=2))
assert out[1]['maximumHipStepMetres']<.12
assert out[1]['maximumHipStepMetres']<.06
# This checks motion continuity, not photorealism or a final acting approval.
