#!/usr/bin/env python3
"""Cheap editorial bridge from the old, explicitly unapproved review movie.

This is NOT a new physical proxy. Every plate carries that fact in provenance;
the review-only composition adds a persistent watermark. No final path is used.
"""
import hashlib,json,os,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PLAN=json.loads((ROOT/'film/final-director/edit.json').read_text())
SOURCE=ROOT/'film/review/acquisition/full-proxy/review-customer.mp4'
LOCAL=ROOT/'node_modules/@remotion/compositor-darwin-arm64'
FFMPEG=os.environ.get('FFMPEG') or shutil.which('ffmpeg') or str(LOCAL/'ffmpeg')
ENV={**os.environ,'DYLD_LIBRARY_PATH':str(LOCAL)} if LOCAL.exists() else os.environ.copy()
OUT=ROOT/'public/film-rd/director/plates/review'
# Actual old edit ranges. Inclusive source frame endpoints, 24 fps.
RANGES={'station':(1248,1319),'wash':(112,135),'lube':(276,299),'tire':(300,323),
 'encounter':(72,167),'invitation':(168,263),'depart':(312,335),'turn':(360,383),
 'arrive':(408,431),'first':(480,527),'coffee':(528,575),'permission':(624,767),
 'offer':(768,911),'return':(960,1007),'paid':(1008,1151),'neighborhood':(1248,1319)}

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 digest=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
 rows=[]
 for shot in PLAN['shots']:
  a,b=RANGES[shot['id']];n=shot['frames'];count=b-a+1
  raw=subprocess.check_output([FFMPEG,'-v','error','-ss',str(a/24),'-i',str(SOURCE),'-frames:v',str(count),
   '-an','-vf','crop=960:430:0:0,scale=640:360','-pix_fmt','rgb24','-f','rawvideo','-'],env=ENV)
  size=640*360*3;actual=len(raw)//size
  if actual<count:raise RuntimeError(f'{shot["id"]}: short source decode {actual} < {count}')
  output=OUT/f'{shot["id"]}.mp4'
  proc=subprocess.Popen([FFMPEG,'-y','-v','error','-f','rawvideo','-pixel_format','rgb24','-video_size','640x360',
   '-framerate','24','-i','-','-an','-c:v','libx264','-preset','ultrafast','-crf','21','-pix_fmt','yuv420p','-frames:v',str(n),str(output)],stdin=subprocess.PIPE,env=ENV)
  for frame in range(n):
   src=round(frame*(count-1)/(n-1));proc.stdin.write(raw[src*size:(src+1)*size])
  proc.stdin.close()
  if proc.wait()!=0:raise RuntimeError(output)
  row={'id':shot['id'],'frames':n,'fps':24,'source':str(SOURCE.relative_to(ROOT)),'sourceSha256':digest,
   'sourceRange':[a,b],'resampledForEditorialTiming':n!=count,'status':'TEMPORARY OLD-CUT IMAGERY — NOT NEW CAMERA OR MOTION EVIDENCE'}
  output.with_suffix('.json').write_text(json.dumps(row,indent=2));rows.append(row)
  print(f'Editorial bridge: {shot["id"]} ({n} frames)',flush=True)
 (ROOT/'film/final-director/review/editorial-provenance.json').write_text(json.dumps(rows,indent=2))

if __name__=='__main__':main()
