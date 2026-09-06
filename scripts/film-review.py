#!/usr/bin/env python3
"""Review frames and sheets for a rendered hero preview.

    scripts/film-review.py Hero1 30 96 106 120 130 140      # explicit frames
    scripts/film-review.py Hero1 --every 12                  # every 12th frame
    scripts/film-review.py Hero1 --out /tmp/review/hero1     # elsewhere (default: film/review/frames/<Id>)

Extracts full-resolution frames from public/film-rd/renders/<Id>.mp4 with Remotion's
ffmpeg and lays them out four to a 1920×1080 sheet (2×2, in time order) so a
critic — human or model — can read a shot's beats at a glance. Frames are
git-ignored; sheets are the review record.
"""
from __future__ import annotations

import argparse
import glob
import os
import shutil
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 24


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("frames", nargs="*", type=int)
    ap.add_argument("--every", type=int, default=None)
    ap.add_argument("--out", default=None)
    ap.add_argument("--per-sheet", type=int, default=4, choices=(4, 6, 9))
    a = ap.parse_args()

    mp4 = os.path.join(ROOT, "public", "film-rd", "renders", f"{a.id}.mp4")
    if not os.path.exists(mp4):
        sys.exit(f"no preview at {mp4}; render it first (scripts/film-render.sh {a.id})")
    out = a.out or os.path.join(ROOT, "film", "review", "frames", a.id)
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out, exist_ok=True)

    frames = list(a.frames)
    if a.every:
        n = int(subprocess.run(["npx", "remotion", "ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", mp4], capture_output=True, text=True, cwd=ROOT).stdout.strip().strip(","))
        frames = list(range(0, n, a.every)) + [n - 1]
    if not frames:
        sys.exit("give frames, or --every N")

    for f in frames:
        subprocess.run(["npx", "remotion", "ffmpeg", "-y", "-loglevel", "error", "-ss", f"{f / FPS:.6f}", "-i", mp4, "-frames:v", "1", os.path.join(out, f"f{f:04d}.png")], check=True, cwd=ROOT)
    files = sorted(glob.glob(os.path.join(out, "f*.png")))

    cols = {4: 2, 6: 3, 9: 3}[a.per_sheet]
    rows = a.per_sheet // cols
    tw, th = 1920 // cols, 1080 // rows
    for si in range(0, len(files), a.per_sheet):
        sheet = Image.new("RGB", (1920, 1080), (20, 20, 20))
        for k, path in enumerate(files[si : si + a.per_sheet]):
            im = Image.open(path).convert("RGB").resize((tw, th))
            sheet.paste(im, ((k % cols) * tw, (k // cols) * th))
        sheet.save(os.path.join(out, f"sheet{si // a.per_sheet + 1}.png"))
    print(f"{len(files)} frames, {(len(files) + a.per_sheet - 1) // a.per_sheet} sheets → {out}")


if __name__ == "__main__":
    main()
