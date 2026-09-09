#!/usr/bin/env python3
"""The plate table for film/REPORT.md, generated from what Blender actually exported.

    python3 scripts/film-plate-table.py            # markdown rows, in the film's order

Every plate writes blender/exports/<shot>.json beside its frames, and that file
carries the camera the shot was rendered with — lens, stop, height, subject,
foreground, background and the motivation a viewer could say back. Writing the
report's table by hand is how a document drifts from the film; this reads it.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORTS = os.path.join(ROOT, "blender", "exports")

# shot: (act, the length the edit uses — the plate may be longer)
ORDER = [
    ("hero1a", "I", 144),
    ("hero3a", "V", 144),
    ("cafe", "VI", 26),
    ("scan", "VI", 46),
    ("approach", "VIII", 30),
    ("threshold", "VIII", 26),
    ("counter", "VIII", 28),
    ("device", "VIII", 78),
    ("coffee", "VIII", 26),
    ("morning_pump", "IX", 27),
    ("morning_walk", "IX", 28),
    ("morning_door", "X", 24),
    ("rise", "XI", 40),
]


def main():
    print("| plate | frames | act | the camera |")
    print("| --- | ---: | --- | --- |")
    missing = []
    total = 0
    locked = 0
    for shot, act, used in ORDER:
        p = os.path.join(EXPORTS, f"{shot}.json")
        if not os.path.exists(p):
            missing.append(shot)
            continue
        d = json.load(open(p))
        spec = d.get("meta", {}).get("spec") or {}
        total += used
        lens = spec.get("lens")
        fstop = spec.get("fstop")
        h = spec.get("height")
        lenses = spec.get("lenses") or ([lens] if lens else [])
        heights = spec.get("heights") or ([h] if h else [])
        bits = []
        if lenses:
            lo, hi = min(lenses), max(lenses)
            rng = f"{lo:.0f} mm" if abs(hi - lo) < 0.6 else f"{lo:.0f}–{hi:.0f} mm"
            bits.append(rng + (f" f/{fstop:.1f}" if fstop else ""))
        if heights:
            a, b = heights[0], heights[-1]
            bits.append(f"{a:.2f} m" if abs(b - a) < 0.02 else f"{a:.2f} → {b:.2f} m")
        if spec.get("motivation"):
            bits.append(spec["motivation"])
        if spec.get("motivation") == "locked":
            locked += 1
        head = " · ".join(bits)
        subject = spec.get("subject", "")
        fg = spec.get("foreground")
        tail = f"{subject}" + (f"; foreground: {fg}" if fg else "")
        print(f"| `{shot}` | {used} | {act} | {head} — {tail} |")
    print(f"\n{total} frames · {locked} of {len(ORDER)} locked" + (f" · missing exports: {', '.join(missing)}" if missing else ""))
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
