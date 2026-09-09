#!/usr/bin/env python3
"""Content-addressed, bounded director tests and deterministic Linux delivery.

No fleet provisioning. A render invocation operates on one explicit shot/range.
Every shard has pixel-file checksums and production settings; collection rejects
missing, stale, overlapping or mismatched work before an MP4 can be assembled.
"""
import argparse,hashlib,json,os,platform,shutil,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PLAN=json.loads((ROOT/'film/final-director/edit.json').read_text())
SHOTS={s['id']:s for s in PLAN['shots']}
LOCAL=ROOT/'node_modules/@remotion/compositor-darwin-arm64'
ENV={**os.environ,**({'DYLD_LIBRARY_PATH':str(LOCAL)} if LOCAL.exists() else {})}

def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def inputs():
    prefixes=['blender/scripts','blender/assets','film/compositions/director','film/compositions/acquisition',
              'film/primitives','film/typography','public/film-rd/fonts','public/film-rd/audio']
    paths=[]
    for prefix in prefixes:
        paths.extend(p for p in (ROOT/prefix).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix not in ('.pyc','.wav'))
    paths.extend(ROOT/p for p in ['film/final-director/edit.json','film/data/acquisition.json','film/data/acquisition.ts',
      'film/Root.tsx','film/tokens.ts','film/index.ts','package-lock.json','remotion.config.ts',
      'scripts/director-production.py','scripts/director-export.mjs','scripts/director-scene-audit.py',
      'scripts/acquisition-bake.mjs'])
    return sorted(set(paths))

def source_record():
    rows={str(p.relative_to(ROOT)):digest(p) for p in inputs()}
    return {'sourceHash':hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'inputs':rows}

def command(args):subprocess.run([str(x) for x in args],cwd=ROOT,env=ENV,check=True)
def binary(name):return os.environ.get(name.upper()) or shutil.which(name) or str(LOCAL/name)

def probe(path):
    data=json.loads(subprocess.check_output([binary('ffprobe'),'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(path)],env=ENV))
    return data,next(s for s in data['streams'] if s['codec_type']=='video')

def validate_video(path,frames,width,height,audio=False):
    data,s=probe(path)
    assert (s['width'],s['height'])==(width,height),f'Wrong dimensions: {path}'
    assert s['r_frame_rate']=='24/1' and s['avg_frame_rate']=='24/1',f'Wrong cadence: {path}'
    assert int(s['nb_read_frames'])==frames,f'Wrong frame count: {path}'
    assert abs(float(s['duration'])-frames/24)<1/24,f'Wrong duration: {path}'
    if audio:assert any(s['codec_type']=='audio' for s in data['streams']),f'No audio: {path}'
    return data

def verify_lock(record):
    path=ROOT/'film/final-director/creative-approval.json'
    if not path.is_file():raise RuntimeError('Creative lock has NOT passed. No expensive final render is permitted.')
    a=json.loads(path.read_text())
    assert a.get('status')=='PASS' and a.get('sourceHash')==record['sourceHash'],'Stale or failed creative approval'
    assert a.get('evidence'),'Missing approval evidence'
    for name,sha in a['evidence'].items():
        path=(ROOT/name).resolve();assert path.is_relative_to(ROOT) and path.is_file() and digest(path)==sha,f'Changed or missing evidence: {name}'
    return a

def baked_surfaces():
    p=ROOT/'blender/screens/acquisition/manifest.json'
    record=json.loads(p.read_text())
    for name,sha in record['sourceHashes'].items():assert digest(ROOT/name)==sha,f'Stale surface: {name}'
    names=[p.name for p in sorted((p.parent/'permission').glob('*.png'))]
    assert names==[f'{i:04d}.png' for i in range(144)],'Incomplete permission animation'

def cache(record,lane,name):return ROOT/'blender/.director-frames'/record['sourceHash']/lane/name

def validate_shards(directory,record,lane,name):
    settings=PLAN['lanes'][lane];rows={}
    for path in sorted(directory.glob('shard-*.json')):
        shard=json.loads(path.read_text())
        for key,val in {'sourceHash':record['sourceHash'],'lane':lane,'shot':name,'settings':settings,'fps':24}.items():
            assert shard.get(key)==val,f'{path}: incompatible {key}'
        for f,sha in shard['files'].items():
            frame=int(f);assert 0<=frame<SHOTS[name]['frames'],'Out-of-range shard frame'
            if frame in rows:assert rows[frame]==sha,f'Conflicting duplicate frame {frame}'
            file=directory/f'{frame:04d}.png'
            assert file.is_file() and digest(file)==sha,f'Missing/corrupt frame {file}'
            rows[frame]=sha
    return rows

def render(args,record):
    assert args.shot in SHOTS,'Choose one known --shot'
    assert args.range,'An explicit inclusive --range A:B is mandatory'
    a,b=map(int,args.range.split(':'));n=SHOTS[args.shot]['frames']
    assert 0<=a<=b<n,'Range outside declared shot'
    if platform.system()!='Linux':
        assert args.lane=='proxy' and b-a+1<=16,'Mac limit: at most 16 proxy frames per invocation; final production belongs to Opus on Linux'
    if args.lane=='final':verify_lock(record)
    baked_surfaces();directory=cache(record,args.lane,args.shot);directory.mkdir(parents=True,exist_ok=True)
    known=validate_shards(directory,record,args.lane,args.shot)
    missing=[f for f in range(a,b+1) if f not in known]
    if not missing:print('Requested range already verified');return
    settings=PLAN['lanes'][args.lane]
    # Contiguous missing runs resume without retracing already verified frames.
    runs=[]
    for frame in missing:
        if runs and runs[-1][1]+1==frame:runs[-1][1]=frame
        else:runs.append([frame,frame])
    for first,last in runs:
        command([args.blender,'-b','--factory-startup','--python-exit-code','1','--python','blender/scripts/director.py','--',args.shot,
          '--sequence','--frames',f'{first}:{last}','--res',f"{settings['width']}x{settings['height']}",
          '--samples',settings['samples'],'--device',args.device,'--out',directory])
        files={str(f):digest(directory/f'{f:04d}.png') for f in range(first,last+1)}
        payload={'sourceHash':record['sourceHash'],'lane':args.lane,'shot':args.shot,'fps':24,'settings':settings,'files':files}
        temp=directory/f'shard-{first:04d}-{last:04d}.tmp';temp.write_text(json.dumps(payload,indent=2));temp.replace(temp.with_suffix('.json'))
    print(f'Verified shard folder: {directory}')

def assemble(args,record):
    assert args.shot in SHOTS,'Choose one known --shot'
    if args.lane=='final':
        assert platform.system()=='Linux','Final assembly belongs to Linux'
        verify_lock(record)
    directory=cache(record,args.lane,args.shot);rows=validate_shards(directory,record,args.lane,args.shot)
    n=SHOTS[args.shot]['frames'];missing=sorted(set(range(n))-set(rows))
    assert not missing,f'{len(missing)} missing frames, beginning {missing[:12]}'
    settings=PLAN['lanes'][args.lane];out=ROOT/f'public/film-rd/director/plates/{args.lane}';out.mkdir(parents=True,exist_ok=True)
    video=out/f'{args.shot}.mp4';temp=out/f'{args.shot}.partial.mp4'
    command([binary('ffmpeg'),'-y','-v','error','-framerate','24','-start_number','0','-i',directory/'%04d.png',
      '-frames:v',n,'-an','-c:v','libx264','-preset','slow','-crf','14' if args.lane=='final' else '20','-pix_fmt','yuv420p','-movflags','+faststart',temp])
    validate_video(temp,n,settings['width'],settings['height']);temp.replace(video)
    video.with_suffix('.json').write_text(json.dumps({'sourceHash':record['sourceHash'],'lane':args.lane,'shot':args.shot,
      'frames':n,'fps':24,'settings':settings,'sha256':digest(video),'frameHashes':rows},indent=2))
    print(video)

def verify_plates(lane,record):
    for name,s in SHOTS.items():
        p=ROOT/f'public/film-rd/director/plates/{lane}/{name}.mp4';meta=json.loads(p.with_suffix('.json').read_text())
        assert meta['sourceHash']==record['sourceHash'] and meta['lane']==lane and meta['shot']==name,'Stale/mixed plate'
        assert meta['sha256']==digest(p),'Changed plate bytes'
        assert meta['settings']==PLAN['lanes'][lane] and meta['frames']==s['frames'],'Wrong plate settings'
        validate_video(p,s['frames'],PLAN['lanes'][lane]['width'],PLAN['lanes'][lane]['height'])
    print('All plates verified against current production inputs')

def main():
    p=argparse.ArgumentParser();p.add_argument('phase',choices=['hash','plan','render','assemble','verify-plates','verify-lock','verify-master'])
    p.add_argument('--lane',choices=['proxy','final'],default='proxy');p.add_argument('--shot');p.add_argument('--range')
    p.add_argument('--blender',default=os.environ.get('BLENDER','blender'));p.add_argument('--device',choices=['CPU','METAL','CUDA','OPTIX'],default='CPU')
    p.add_argument('--file');a=p.parse_args();record=source_record()
    if a.phase=='hash':print(json.dumps(record,indent=2))
    elif a.phase=='plan':
        jobs=[]
        for name,s in SHOTS.items():
            for start in range(0,s['frames'],24):jobs.append({'shot':name,'range':f"{start}:{min(start+23,s['frames']-1)}"})
        print(json.dumps({'sourceHash':record['sourceHash'],'lane':a.lane,'renderedFrames':sum(s['frames'] for s in SHOTS.values()),
          'editFrames':PLAN['frames'],'seconds':PLAN['frames']/24,'stillOptimization':'NONE APPROVED; conservative full frames',
          'jobs':jobs,'estimatedHours':None,'estimateNote':'New camera work requires a new benchmark; legacy costs are not measurements of this film'},indent=2))
    elif a.phase=='render':render(a,record)
    elif a.phase=='assemble':assemble(a,record)
    elif a.phase=='verify-plates':verify_plates(a.lane,record)
    elif a.phase=='verify-lock':verify_lock(record);print('Creative approval and all evidence hashes verified')
    elif a.phase=='verify-master':
        assert a.file,'--file required';data=validate_video(a.file,PLAN['frames'],1920,1080,True)
        print(json.dumps(data,indent=2))

if __name__=='__main__':main()
