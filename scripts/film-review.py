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

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 24


def _tool(name):
    """Remotion's ffmpeg/ffprobe, called directly when a build of it actually runs here.

    `npx remotion ffmpeg` spends about 1.3 s starting node before it does any work,
    and this script runs it once a frame; a hundred-frame critic pass is then two
    minutes of start-up. The binary underneath is the same one. Several compositor
    packages can be installed at once (gnu and musl), all of them executable and only
    one of them loadable — exec'ing a musl build on glibc fails with ENOENT, which
    reads as "the file is missing" and is not — so each candidate is asked for its
    version before it is trusted.
    """
    for h in sorted(glob.glob(os.path.join(ROOT, "node_modules", "@remotion", "compositor-*", name))):
        try:
            if subprocess.run([h, "-version"], capture_output=True).returncode == 0:
                return [h]
        except OSError:
            pass
    return ["npx", "remotion", name]


FFMPEG, FFPROBE = _tool("ffmpeg"), _tool("ffprobe")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("frames", nargs="*", type=int)
    ap.add_argument("--every", type=int, default=None)
    ap.add_argument("--out", default=None)
    ap.add_argument("--per-sheet", type=int, default=4, choices=(4, 6, 9))
    ap.add_argument("--mp4", default=None, help="an explicit video (default: public/film-rd/renders/<Id>.mp4)")
    a = ap.parse_args()

    mp4 = a.mp4 or os.path.join(ROOT, "public", "film-rd", "renders", f"{a.id}.mp4")
    if not os.path.exists(mp4):
        sys.exit(f"no preview at {mp4}; render it first (scripts/film-render.sh {a.id})")
    out = a.out or os.path.join(ROOT, "film", "review", "frames", a.id)
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out, exist_ok=True)

    frames = list(a.frames)
    if a.every:
        n = int(subprocess.run(FFPROBE + ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", mp4], capture_output=True, text=True, cwd=ROOT).stdout.strip().strip(","))
        frames = list(range(0, n, a.every)) + [n - 1]
    if not frames:
        sys.exit("give frames, or --every N")

    for f in frames:
        subprocess.run(FFMPEG + ["-y", "-loglevel", "error", "-ss", f"{f / FPS:.6f}", "-i", mp4, "-frames:v", "1", os.path.join(out, f"f{f:04d}.png")], check=True, cwd=ROOT)
    files = sorted(glob.glob(os.path.join(out, "f*.png")))
    if len(files) != len(frames):
        sys.exit(f"asked for {len(frames)} frames, got {len(files)} — check the range against the video's length")

    cols = {4: 2, 6: 3, 9: 3}[a.per_sheet]
    rows = a.per_sheet // cols
    tw, th = 1920 // cols, 1080 // rows
    for si in range(0, len(files), a.per_sheet):
        sheet = Image.new("RGB", (1920, 1080), (20, 20, 20))
        draw = ImageDraw.Draw(sheet)
        for k, path in enumerate(files[si : si + a.per_sheet]):
            im = Image.open(path).convert("RGB").resize((tw, th))
            x, y = (k % cols) * tw, (k // cols) * th
            sheet.paste(im, (x, y))
            # the frame number on the tile: a critic has to be able to cite what they are looking at
            tag = os.path.basename(path)[1:-4].lstrip("0") or "0"
            tag = f"{tag}  ·  {int(tag) / FPS:.2f}s"
            draw.rectangle((x + 6, y + 6, x + 12 + 8 * len(tag), y + 26), fill=(0, 0, 0))
            draw.text((x + 10, y + 11), tag, fill=(235, 235, 235))
        sheet.save(os.path.join(out, f"sheet{si // a.per_sheet + 1}.png"))
    print(f"{len(files)} frames, {(len(files) + a.per_sheet - 1) // a.per_sheet} sheets → {out}")


if __name__ == "__main__":
    main()
