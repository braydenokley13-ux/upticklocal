"""Pulls representative stills out of a rendered preview and lays a contact sheet. Usage: film-sheet.py Hero1 path.mp4"""
import os, subprocess, sys, json
from PIL import Image, ImageDraw, ImageFont

shot, video = sys.argv[1], sys.argv[2]
out = "public/film-rd/renders"
stills = os.path.join(out, "stills")
os.makedirs(stills, exist_ok=True)
# frame count from the registry via remotion compositions listing is slow; read the mp4's frame count with ffprobe
probe = subprocess.run(["npx", "remotion", "ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", video], capture_output=True, text=True)
n = int(probe.stdout.strip().splitlines()[-1].strip().strip(',')) if probe.stdout.strip() else 0
picks = [int(round(n * t)) for t in (0.04, 0.24, 0.46, 0.68, 0.88, 0.99)] if n else []
files = []
for f in picks:
    path = os.path.join(stills, f"{shot}-{f:04d}.png")
    subprocess.run(["npx", "remotion", "ffmpeg", "-y", "-v", "error", "-ss", f"{f / 24:.4f}", "-i", video, "-frames:v", "1", path], check=True)
    files.append(path)
# contact sheet, 3 × 2
if files:
    ims = [Image.open(p).convert("RGB") for p in files]
    w, h = 640, 360
    sheet = Image.new("RGB", (w * 3 + 4 * 16, h * 2 + 3 * 16 + 40), (16, 19, 21))
    d = ImageDraw.Draw(sheet)
    for k, (im, f) in enumerate(zip(ims, picks)):
        x = 16 + (k % 3) * (w + 16)
        y = 16 + (k // 3) * (h + 16)
        sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y))
        d.text((x + 8, y + h - 22), f"{shot} · frame {f} · {f/24:.2f}s", fill=(232, 228, 220))
    sheet.save(os.path.join(out, f"{shot}-contact.png"))
    print(f"{shot}: {n} frames, stills {picks}, contact sheet written")
