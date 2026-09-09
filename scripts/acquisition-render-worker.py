#!/usr/bin/env python3
"""Cloud-only acquisition render queue with validated, resumable plate manifests.

Commands: preflight | stills | plates. The export script assembles the edit.
No credentials, installation, cloud purchasing, or personal-file cleanup.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'film/render/acquisition-shots.json').read_text())
DECOMPOSITION=ROOT/'film/render/acquisition-decomposition.json'


def decomposition(current_hash):
    """The measured plan, but only if it was measured against these sources.

    A stale plan is ignored rather than trusted: every shot then renders in full,
    which costs time and never costs an image.
    """
    if not DECOMPOSITION.is_file(): return {}
    record=json.loads(DECOMPOSITION.read_text())
    if record.get('sourceHash')!=current_hash:
        print('Decomposition was measured against different sources; ignoring it. '
              'Rerun: acquisition-render-worker.py decompose',flush=True)
        return {}
    return {entry['shot']:entry for entry in record['shots']}


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def run(command):
    subprocess.run([str(item) for item in command],cwd=ROOT,check=True)


def source_hash():
    digest=hashlib.sha256()
    paths=sorted((ROOT/'blender/scripts').glob('*.py'))
    paths+=sorted((ROOT/'film/compositions/acquisition').glob('*.tsx'))
    paths += [ROOT/'film/data/acquisition.json',ROOT/'film/render/acquisition-shots.json',ROOT/'blender/assets/rocketbox/SOURCE.json',ROOT/'film/tokens.ts',ROOT/'film/Root.tsx',ROOT/'scripts/acquisition-bake.mjs']
    for path in paths:
        digest.update(str(path.relative_to(ROOT)).encode());digest.update(path.read_bytes())
    return digest.hexdigest()


def validate_bakes():
    directory=ROOT/'blender/screens/acquisition'
    manifest=json.loads((directory/'manifest.json').read_text())
    for name,expected in manifest['sourceHashes'].items():
        if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=expected:
            raise RuntimeError(f'Stale screen bake: {name}; rerun node scripts/acquisition-bake.mjs')
    frames=sorted((directory/'permission').glob('*.png'))
    if len(frames)!=144 or [path.name for path in frames]!=[f'{i:04d}.png' for i in range(144)]:
        raise RuntimeError('Permission sequence must contain exactly 0000.png through 0143.png')
    for state in ['placement','pass','redeemed','friday','paid','placement-quick-lube','placement-ridge-tire','placement-uptick-screen']:
        if not (directory/f'{state}.png').is_file(): raise FileNotFoundError(state)


def require_gate(name,current_hash):
    path=ROOT/f'film/review/acquisition/{name}.json'
    if not path.is_file(): raise RuntimeError(f'Missing independent review approval: {path}')
    gate=json.loads(path.read_text())
    if gate.get('status')!='PASS' or gate.get('sourceHash')!=current_hash or not gate.get('evidence'):
        raise RuntimeError(f'{name} is not approved against these exact sources and evidence')
    for evidence in gate['evidence']:
        if not (ROOT/evidence).is_file(): raise RuntimeError(f'Review evidence missing: {evidence}')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('phase',choices=['preflight','decompose','stills','prototypes','plates'])
    parser.add_argument('--lane',choices=['proxy','final'],default='proxy')
    parser.add_argument('--device',choices=['CPU','OPTIX','CUDA'],default='CPU')
    parser.add_argument('--shots',nargs='+')
    parser.add_argument('--frames',help='A:B inclusive frame range, to shard one shot across workers')
    parser.add_argument('--blender',default=os.environ.get('BLENDER','blender'))
    args=parser.parse_args()
    if platform.system()!='Linux': raise RuntimeError('This queue is for cloud Linux. Use isolated 640×360 prototypes on the Mac.')
    run(['node','scripts/acquisition-fixture-check.mjs'])
    if not shutil.which(args.blender): raise RuntimeError('Blender is not installed on this worker')
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'): raise RuntimeError('Install ffmpeg and ffprobe on the worker')
    current_hash=source_hash()
    if args.phase=='preflight':
        run([args.blender,'--background','--factory-startup','--python-exit-code','2','--python','scripts/acquisition-worker-check.py'])
        print(json.dumps({'sourceHash':current_hash,'freeBytes':shutil.disk_usage(ROOT).free,'status':'CAPABILITIES ONLY'},indent=2));return
    if args.phase=='decompose':
        entries=[]
        for shot in CONFIG['shots']:
            result=subprocess.run([args.blender,'--background','--factory-startup','--python-exit-code','1',
                '--python','scripts/acquisition-motion-audit.py','--',shot['id']],
                cwd=ROOT,check=True,capture_output=True,text=True)
            line=next(l for l in result.stdout.splitlines() if l.startswith('ACQUISITION_MOTION_AUDIT'))
            audit=json.loads(line.split(' ',1)[1])
            audit['still']=audit['nothingMoves'] and not audit['animatedScreenSequences']
            entries.append(audit)
            print(f"{shot['id']:17s} fresh={audit['freshCyclesFrames']:4d}/{audit['frames']:4d}  {audit['plan']}",flush=True)
        DECOMPOSITION.write_text(json.dumps({'sourceHash':current_hash,
            'note':'Measured over every frame, not sampled. "still" shots are proved again at render time before being held.',
            'shots':entries},indent=2))
        print(f'Wrote {DECOMPOSITION.relative_to(ROOT)}');return
    validate_bakes()
    if shutil.disk_usage(ROOT).free<12*1024**3: raise RuntimeError('Worker needs at least 12 GiB free before this queue')
    if args.phase=='plates':
        require_gate('gate-a-approval',current_hash)
        if args.lane=='final':
            require_gate('gate-b-approval',current_hash)
            require_gate('final-frame-approval',current_hash)
    decomposed=decomposition(current_hash)
    chosen=[s for s in CONFIG['shots'] if not args.shots or s['id'] in args.shots]
    if args.shots and len(chosen)!=len(set(args.shots)): raise RuntimeError('Unknown shot id')
    lane=CONFIG['lanes'][args.lane]
    if args.phase=='prototypes' and args.lane!='proxy':raise RuntimeError('Unapproved motion tests use only the proxy lane')
    output=ROOT/(f'film/review/acquisition/prototypes' if args.phase=='prototypes' else f'public/film-rd/acquisition/plates/{args.lane}');output.mkdir(parents=True,exist_ok=True)
    scratch=ROOT/'blender/.acquisition-frames';scratch.mkdir(exist_ok=True)
    for shot in chosen:
        command=[args.blender,'--background','--factory-startup','--python-exit-code','1','--python','blender/scripts/acquisition_production.py','--',shot['id'],
                 '--device',args.device,'--res',f"{lane['width']}x{lane['height']}",'--samples',str(lane['samples'])]
        if args.phase=='stills':
            evidence=ROOT/f'film/review/acquisition/{args.lane}-frames';evidence.mkdir(parents=True,exist_ok=True)
            for frame in sorted(set([0,shot['frames']//2,shot['frames']-1])):
                run(command+['--frame',str(frame),'--out',evidence/f"{shot['id']}-{frame:04d}.png"])
            continue
        video=output/f"{shot['id']}.mp4"; sidecar=video.with_suffix('.json')
        if video.is_file() and sidecar.is_file():
            old=json.loads(sidecar.read_text())
            if old.get('sourceHash')==current_hash and old.get('frames')==shot['frames']:
                print(f"Reuse validated {shot['id']}",flush=True);continue
        frames=scratch/shot['id'];frames.mkdir(exist_ok=True)
        plan=decomposed.get(shot['id'],{})
        last=shot['frames']-1
        held=False
        if plan.get('still'):
            # The decompose phase says this shot is one photograph. Prove it here
            # before relying on it: render the first and last frame and require
            # them byte-identical. If they are not, the declaration is wrong about
            # something the audit cannot see, so the shot renders in full and says
            # so. A shot that actually moves can never be silently frozen.
            run(command+['--frame','0','--out',frames/'0000.png'])
            run(command+['--frame',str(last),'--out',frames/f'{last:04d}.png'])
            held=digest(frames/'0000.png')==digest(frames/f'{last:04d}.png')
            if not held:
                print(f"{shot['id']}: declared still but frames 0 and {last} differ; rendering in full",flush=True)
                for path in frames.glob('*.png'): path.unlink()
        if held:
            report={'fps':24,'still':True,'framesRendered':2,'frameTimings':[]}
            run(['ffmpeg','-y','-v','error','-loop','1','-framerate','24','-i',frames/'0000.png','-frames:v',str(shot['frames']),'-c:v','libx264','-preset','slow','-crf','14' if args.lane=='final' else '20','-pix_fmt','yuv420p','-movflags','+faststart',video])
        else:
            def rendered():
                return sorted(int(path.stem) for path in frames.glob('[0-9]*.png'))
            if args.frames:
                # One worker's share. Frame numbers are absolute and the seed is
                # fixed, so shards from different machines merge by filename.
                first,final=(int(part) for part in args.frames.split(':'))
                run(command+['--frames',args.frames,'--sequence','--out',frames])
                done=set(rendered());missing=[f for f in range(shot['frames']) if f not in done]
                print(f"{shot['id']}: shard {first}-{final} rendered; {len(missing)} frames outstanding",flush=True)
                if missing: continue
            elif rendered()!=list(range(shot['frames'])):
                run(command+['--sequence','--out',frames])
            else:
                print(f"{shot['id']}: all frames already present from shards; assembling",flush=True)
            present=rendered()
            if present!=list(range(shot['frames'])):
                missing=sorted(set(range(shot['frames']))-set(present))
                raise RuntimeError(f"{shot['id']} is missing {len(missing)} frames (first {missing[:5]}); run the remaining shards")
            reports=sorted(frames.glob('render*.json'))
            if not reports: raise RuntimeError(f"{shot['id']} has frames but no render manifest")
            report=json.loads(reports[0].read_text())
            if report['fps']!=24: raise RuntimeError(f"Wrong frame rate for {shot['id']}")
            run(['ffmpeg','-y','-v','error','-framerate','24','-i',frames/'%04d.png','-frames:v',str(shot['frames']),'-c:v','libx264','-preset','slow','-crf','14' if args.lane=='final' else '20','-pix_fmt','yuv420p','-movflags','+faststart',video])
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',str(video)]))
        stream=next(s for s in probe['streams'] if s['codec_type']=='video')
        if int(stream['nb_read_frames'])!=shot['frames'] or stream['width']!=lane['width'] or stream['height']!=lane['height']:
            raise RuntimeError(f"Encoded plate verification failed: {video}")
        sidecar.write_text(json.dumps({'sourceHash':current_hash,'frames':shot['frames'],'fps':24,'lane':args.lane,
            'still':held,'declaredStill':bool(plan.get('still')),
            'freshCyclesFrames':2 if held else shot['frames'],'render':report},indent=2))
        # Only this queue's verified transient frames are removed; encoded plate,
        # manifest and review evidence survive. No user files are touched.
        shutil.rmtree(frames)
    print('Requested worker phase completed; no creative pass is implied.')


if __name__=='__main__': main()
