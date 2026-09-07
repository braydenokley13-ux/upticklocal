#!/usr/bin/env python3
"""Checks the film has everything it needs before a master render is started.

    python3 scripts/film-preflight.py            # the final lane
    LANE=proxy python3 scripts/film-preflight.py

The master is the most expensive thing this project does, and every way it has
actually failed so far was knowable beforehand: a plate that was deleted when a
shot went stale, a plate encoded shorter than the cut asks for, a cue whose .ogg
was never written. None of those announce themselves until the render is running.
This reads film/render/manifest.json (generated from the cut, not from guesses)
and film/audio/cues.ts, and says what is missing.

Exit status is 0 only if every plate and every cue is present and long enough.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANE = os.environ.get("LANE", "final")
MAN = json.load(open(os.path.join(ROOT, "film", "render", "manifest.json")))
PLATE_DIR = os.path.join(ROOT, MAN["lanes"][LANE]["dir"])


def frame_count(path):
    """Frames in an mp4, counted rather than derived from duration × fps."""
    p = subprocess.run(
        ["npx", "remotion", "ffprobe", "-v", "error", "-select_streams", "v:0",
         "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path],
        capture_output=True, text=True, cwd=ROOT)
    out = [l.strip().strip(",") for l in p.stdout.strip().splitlines() if l.strip().strip(",").isdigit()]
    return int(out[-1]) if out else 0


def main():
    bad = []
    print(f"plates · {LANE} lane · {MAN['lanes'][LANE]['resolution']}")
    for p in MAN["plates"]:
        path = os.path.join(PLATE_DIR, p["shot"] + ".mp4")
        if not os.path.exists(path):
            print(f"  MISSING  {p['shot']:14s} needs {p['frames']:3d}")
            bad.append(p["shot"])
            continue
        n = frame_count(path)
        flag = "ok      " if n >= p["frames"] else "SHORT   "
        if n < p["frames"]:
            bad.append(p["shot"])
        print(f"  {flag} {p['shot']:14s} {n:3d} frames, cut needs {p['frames']:3d}  ({p['act']})")

    # every cue the sound edit names has to have an .ogg beside it
    cues = open(os.path.join(ROOT, "film", "audio", "cues.ts")).read()
    names = {m for m in re.findall(r'file:\s*"([^"]+)"', cues)} | {"key", "key2", "key3", "key-last"}
    audio = os.path.join(ROOT, "public", "film-rd", "audio")
    print("cues")
    missing = [n for n in sorted(names) if not os.path.exists(os.path.join(audio, n + ".ogg"))]
    for n in missing:
        print(f"  MISSING  {n}.ogg")
    bad += [n + ".ogg" for n in missing]
    if not missing:
        print(f"  ok       all {len(names)} cues present")

    if bad:
        print(f"\nnot ready: {', '.join(bad)}", file=sys.stderr)
        return 1
    print("\nready")
    return 0


if __name__ == "__main__":
    sys.exit(main())
