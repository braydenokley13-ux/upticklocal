#!/usr/bin/env python3
"""Contact sheet from rendered prototype evidence, not from storyboard guesses."""
import argparse
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

parser=argparse.ArgumentParser()
parser.add_argument('directory',type=Path)
parser.add_argument('--out',type=Path,required=True)
parser.add_argument('--files',nargs='+',help='Selected filenames, in comparison order')
parser.add_argument('--columns',type=int,default=2)
args=parser.parse_args()
files=[args.directory/name for name in args.files] if args.files else sorted(p for p in args.directory.glob('*.png') if p.resolve()!=args.out.resolve())
if not files: raise SystemExit('No rendered PNG frames found')
root=Path(__file__).resolve().parents[1]
font=ImageFont.truetype(str(root/'blender/assets/fonts/Geist-Medium.ttf'),17)
width,height,pad,columns=480,270,16,args.columns
if columns<1:raise SystemExit('Columns must be positive')
rows=math.ceil(len(files)/columns)
sheet=Image.new('RGB',(columns*(width+pad)+pad,rows*(height+42+pad)+pad),'#0a1820')
draw=ImageDraw.Draw(sheet)
for i,path in enumerate(files):
    x=pad+(i%columns)*(width+pad); y=pad+(i//columns)*(height+42+pad)
    frame=Image.open(path).convert('RGB'); frame.thumbnail((width,height))
    sheet.paste(frame,(x,y))
    label=f'{path.stem} · {int(path.stem)/24:.2f}s' if path.stem.isdigit() else path.stem
    draw.text((x,y+height+10),label,fill='#f3f0e9',font=font)
args.out.parent.mkdir(parents=True,exist_ok=True)
sheet.save(args.out)
print(f'{len(files)} evidence frames → {args.out}')
