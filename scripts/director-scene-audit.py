"""Non-rendering audit: actual duration, camera, assets and every motion frame."""
import sys,json,hashlib
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'blender/scripts'))
import director as D

def main():
    name=sys.argv[sys.argv.index('--')+1]
    D.A.S.settings(640,360,8);world=D.B.build();shot=D.DIRECTOR_SHOTS[name](world)
    n=D.COUNTS[name];assert shot['frames']==n,f'{name}: actual duration mismatch'
    scene=bpy.context.scene;assert scene.camera==shot['cam'],'Wrong active camera'
    missing=[]
    # FBX retains unused source image datablocks. Only image nodes connected to
    # materials actually assigned to rendered objects can be live dependencies.
    materials={slot.material for o in bpy.data.objects if not o.hide_render for slot in o.material_slots if slot.material}
    trees=[m.node_tree for m in materials if m.node_tree]
    trees.extend(w.node_tree for w in bpy.data.worlds if w.node_tree)
    images=set()
    def visit(tree,seen):
        if tree in seen:return
        seen.add(tree)
        for node in tree.nodes:
            if node.type=='TEX_IMAGE' and node.image:images.add(node.image)
            if node.type=='GROUP' and node.node_tree:visit(node.node_tree,seen)
    for tree in trees:visit(tree,set())
    for image in images:
        if image.source in ('FILE','SEQUENCE') and image.filepath and not image.packed_file:
            path=Path(bpy.path.abspath(image.filepath))
            if not path.is_file():missing.append(str(path))
    assert not missing,f'Missing assets: {missing}'
    hashes=[]
    for frame in range(n):
        scene.frame_set(frame);bpy.context.view_layer.update()
        values=[]
        for o in bpy.data.objects:
            if not o.hide_render or o.type=='CAMERA':
                values.extend(v for row in o.matrix_world for v in row)
                if o.type=='ARMATURE':values.extend(v for b in o.pose.bones for row in b.matrix for v in row)
                if o.type=='LIGHT':values.append(o.data.energy)
        import math
        assert all(math.isfinite(v) for v in values),f'Nonfinite state at {frame}'
        values.extend([scene.camera.data.lens,scene.camera.data.dof.focus_distance,scene.camera.data.dof.aperture_fstop])
        hashes.append(hashlib.sha256(json.dumps(values).encode()).hexdigest())
    animated_shading=any(x.node_tree and x.node_tree.animation_data for x in list(bpy.data.materials)+list(bpy.data.worlds))
    sequence=any(i.source=='SEQUENCE' for i in bpy.data.images)
    output={'shot':name,'frames':n,'uniqueTransformStates':len(set(hashes)),'animatedShading':animated_shading,'screenSequence':sequence,
      'staticCandidate':len(set(hashes))==1 and not animated_shading and not sequence,'camera':shot['meta'],'status':'CONSTRUCTION ONLY; no creative approval'}
    print('DIRECTOR_AUDIT '+json.dumps(output),flush=True)

if __name__=='__main__':main()
