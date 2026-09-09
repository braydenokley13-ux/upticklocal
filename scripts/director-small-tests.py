#!/usr/bin/env python3
"""Exactly one tiny midpoint frame per selected scene, sequentially, two cores.
This never calls the production queue. It cannot produce a full film or PASS.
"""
import argparse,json,os,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import importlib.util
spec=importlib.util.spec_from_file_location('production',ROOT/'scripts/director-production.py');P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)

def main():
 p=argparse.ArgumentParser();p.add_argument('--blender',required=True);p.add_argument('--shots',nargs='+');a=p.parse_args()
 record=P.source_record();out=ROOT/'film/final-director/review/camera-tests';out.mkdir(parents=True,exist_ok=True)
 chosen=a.shots or list(P.SHOTS)
 assert len(chosen)<=16 and all(s in P.SHOTS for s in chosen)
 rows=[]
 for i,name in enumerate(chosen):
  print(f'Small test {i+1}/{len(chosen)}: {name}',flush=True)
  base=[a.blender,'-b','--factory-startup','--python-exit-code','1']
  env={**os.environ,'FILM_THREADS':'2','PYTHONHASHSEED':'0'}
  audit=subprocess.run(base+['--python','scripts/director-scene-audit.py','--',name],cwd=ROOT,env=env,capture_output=True,text=True)
  lines=[l for l in audit.stdout.splitlines() if l.startswith('DIRECTOR_AUDIT ')]
  if audit.returncode or not lines:
   rows.append({'shot':name,'status':'CONSTRUCTION FAILED','log':audit.stdout[-5000:]+audit.stderr[-5000:]});print(rows[-1],flush=True);continue
  row=json.loads(lines[-1].split(' ',1)[1]);row['sourceHash']=record['sourceHash']
  frame=P.SHOTS[name]['frames']//2;image=out/f'{name}.png'
  render=subprocess.run(base+['--python','blender/scripts/director.py','--',name,'--frame',str(frame),'--res','640x360','--samples','8','--device','CPU','--out',str(image)],cwd=ROOT,env=env,capture_output=True,text=True)
  row['renderExitCode']=render.returncode
  if render.returncode:row['log']=render.stdout[-5000:]+render.stderr[-5000:]
  else:row['image']=str(image.relative_to(ROOT));row['imageSha256']=P.digest(image)
  rows.append(row)
  (out/'results.json').write_text(json.dumps(rows,indent=2))
  print(f'{name}: construction checked; midpoint render exit={render.returncode}',flush=True)
 if P.source_record()['sourceHash']!=record['sourceHash']:raise RuntimeError('Production inputs changed during tests; evidence is stale')
 (out/'results.json').write_text(json.dumps(rows,indent=2))
 assert len(rows)==len(chosen) and all(r.get('renderExitCode')==0 for r in rows),'One or more small tests failed'

if __name__=='__main__':main()
