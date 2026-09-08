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
    parser.add_argument('phase',choices=['preflight','stills','prototypes','plates'])
    parser.add_argument('--lane',choices=['proxy','final'],default='proxy')
    parser.add_argument('--device',choices=['CPU','OPTIX','CUDA'],default='CPU')
    parser.add_argument('--shots',nargs='+')
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
    validate_bakes()
    if shutil.disk_usage(ROOT).free<12*1024**3: raise RuntimeError('Worker needs at least 12 GiB free before this queue')
    if args.phase=='plates':
        require_gate('gate-a-approval',current_hash)
        if args.lane=='final':
            require_gate('gate-b-approval',current_hash)
            require_gate('final-frame-approval',current_hash)
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
        run(command+['--sequence','--out',frames])
        report=json.loads((frames/'render.json').read_text())
        if report['fps']!=24 or [f['frame'] for f in report['frameTimings']]!=list(range(shot['frames'])):
            raise RuntimeError(f"Incomplete frame sequence for {shot['id']}")
        run(['ffmpeg','-y','-v','error','-framerate','24','-i',frames/'%04d.png','-frames:v',str(shot['frames']),'-c:v','libx264','-preset','slow','-crf','14' if args.lane=='final' else '20','-pix_fmt','yuv420p','-movflags','+faststart',video])
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',str(video)]))
        stream=next(s for s in probe['streams'] if s['codec_type']=='video')
        if int(stream['nb_read_frames'])!=shot['frames'] or stream['width']!=lane['width'] or stream['height']!=lane['height']:
            raise RuntimeError(f"Encoded plate verification failed: {video}")
        sidecar.write_text(json.dumps({'sourceHash':current_hash,'frames':shot['frames'],'fps':24,'lane':args.lane,'render':report},indent=2))
        # Only this queue's verified transient frames are removed; encoded plate,
        # manifest and review evidence survive. No user files are touched.
        shutil.rmtree(frames)
    print('Requested worker phase completed; no creative pass is implied.')


if __name__=='__main__': main()
