#!/usr/bin/env python3
"""Verify/normalize the rendered master, create web encodes and review sheets.

Cloud Linux only. Requires a human/critic's selected poster candidate; never
chooses a poster before watching the completed film. No new render is hidden.
"""
import argparse
import json
from pathlib import Path
import platform
import re
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/film-rd/acquisition/final'


def run(args,capture=False):
    return subprocess.run([str(x) for x in args],cwd=ROOT,check=True,text=True,capture_output=capture)


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--poster',choices=['external','return','network'],required=True);args=parser.parse_args()
    if platform.system()!='Linux':raise RuntimeError('Run final finishing on the cloud worker')
    master=OUT/'uptick-growth-master-1080p.mp4'
    run(['node','scripts/acquisition-validate.mjs',master])
    measured=run(['ffmpeg','-hide_banner','-i',master,'-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'],True)
    match=re.findall(r'\{\s*"input_i".*?\}',measured.stderr,re.S)
    if not match:raise RuntimeError('No loudness measurement returned')
    levels=json.loads(match[-1]);(OUT/'loudness-before.json').write_text(json.dumps(levels,indent=2))
    norm='loudnorm=I=-16:TP=-1.5:LRA=9:linear=true:'+':'.join(f'{key}={levels[value]}' for key,value in [('measured_I','input_i'),('measured_TP','input_tp'),('measured_LRA','input_lra'),('measured_thresh','input_thresh'),('offset','target_offset')])
    normalized=OUT/'uptick-growth-master-normalized.mp4'
    run(['ffmpeg','-y','-v','error','-i',master,'-c:v','copy','-af',norm,'-ar','48000','-c:a','aac','-b:a','256k','-movflags','+faststart',normalized])
    run(['node','scripts/acquisition-validate.mjs',normalized])
    run(['ffmpeg','-y','-v','error','-i',normalized,'-c:v','libx264','-crf','22','-preset','slow','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',OUT/'uptick-growth-web.mp4'])
    run(['ffmpeg','-y','-v','error','-i',normalized,'-c:v','libvpx-vp9','-crf','32','-b:v','0','-row-mt','1','-c:a','libopus','-b:a','128k',OUT/'uptick-growth-web.webm'])
    after=run(['ffmpeg','-hide_banner','-i',normalized,'-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'],True)
    checks=json.loads(re.findall(r'\{\s*"input_i".*?\}',after.stderr,re.S)[-1])
    (OUT/'loudness-after.json').write_text(json.dumps(checks,indent=2))
    if abs(float(checks['input_i'])+16)>1 or float(checks['input_tp'])>-.9:raise RuntimeError('Normalized master missed loudness/peak tolerance')
    # Freeze/black reports are review evidence, not automatic creative failures:
    # authored holds and the ending may legitimately trigger detection.
    diagnostic=run(['ffmpeg','-hide_banner','-i',normalized,'-vf','blackdetect=d=0.2:pix_th=0.05,freezedetect=n=-50dB:d=2','-an','-f','null','-'],True)
    (OUT/'freeze-black-review.txt').write_text(diagnostic.stderr)
    sheet=OUT/'contact';sheet.mkdir(exist_ok=True)
    run(['ffmpeg','-y','-v','error','-i',normalized,'-vf','fps=1/3,scale=480:270,tile=4x6:padding=8:margin=8','-frames:v','1',sheet/'full-film.png'])
    candidate=OUT/f'poster-candidate-{args.poster}.png'
    if not candidate.is_file():raise FileNotFoundError(candidate)
    shutil.copyfile(candidate,OUT/'uptick-growth-poster.png')
    run(['ffmpeg','-y','-v','error','-i',candidate,'-frames:v','1','-q:v','2',OUT/'uptick-growth-poster.jpg'])
    (OUT/'FINISH.json').write_text(json.dumps({'technicalValidation':'PASS','posterSelection':args.poster,'primaryMaster':normalized.name,'creativeReview':'Must be documented separately; encoding is not creative approval'},indent=2))


if __name__=='__main__':main()
