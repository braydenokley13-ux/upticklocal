#!/usr/bin/env python3
"""
Preflight for the locked photographic cut.

Everything here is a claim the edit makes about itself that a render would
either honour silently or break invisibly: a shot reaching past the end of its
source clip, a crop magnifying a still further than the file can carry, a sound
cue running off the end of its stem, a business name that drifted away from the
fixture. Each is cheap to check and expensive to find in a master.

    scripts/final-preflight.py            # human readable
    scripts/final-preflight.py --json     # machine readable

Exit status is non-zero if any check fails.
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EDIT = ROOT / "film" / "final-director" / "final-edit.json"
FIXTURE = ROOT / "film" / "data" / "acquisition.json"
PUBLIC = ROOT / "public"

# A still may be enlarged this much past its own pixels before it stops being a
# photograph and starts being a guess.
MAX_MAGNIFICATION = 1.45

# No single sound cue may reach past this on its own. Cues overlap, and the
# master is loudness-normalised afterwards, so each one needs room to sum.
PEAK_CEILING_DB = -6.0


class Checks:
    def __init__(self) -> None:
        self.rows: list[dict] = []

    def add(self, name: str, ok: bool, detail: str = "") -> None:
        self.rows.append({"check": name, "pass": bool(ok), "detail": detail})

    @property
    def ok(self) -> bool:
        return all(r["pass"] for r in self.rows)


def probe_frames(path: Path) -> tuple[int | None, float | None]:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=nb_frames,duration", "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        return None, None
    streams = json.loads(out.stdout).get("streams") or [{}]
    s = streams[0]
    frames = int(s["nb_frames"]) if s.get("nb_frames") else None
    dur = float(s["duration"]) if s.get("duration") else None
    return frames, dur


def probe_peak_db(path: Path) -> float | None:
    """The stem's own peak, so a cue's gain can be checked for headroom."""
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    line = [l for l in out.splitlines() if "max_volume" in l]
    return float(line[0].split()[-2]) if line else None


def probe_duration(path: Path) -> float | None:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        return None
    return float(json.loads(out.stdout)["format"]["duration"])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    edit = json.loads(EDIT.read_text())
    fixture = json.loads(FIXTURE.read_text())
    c = Checks()
    fps = edit["fps"]

    # ---- timeline is contiguous, gapless and exactly as long as it claims
    cursor = 0
    for shot in edit["shots"]:
        c.add(f"timeline:{shot['id']}:starts_where_the_last_one_ended",
              shot["from"] == cursor, f"from={shot['from']} expected={cursor}")
        c.add(f"timeline:{shot['id']}:positive_duration", shot["duration"] > 0, str(shot["duration"]))
        cursor += shot["duration"]
    c.add("timeline:total_frames", cursor == edit["frames"], f"{cursor} vs {edit['frames']}")
    c.add("timeline:runtime_seconds", abs(edit["frames"] / fps - 52.0) < 0.001,
          f"{edit['frames'] / fps:.3f}s")

    # ---- every picture the edit names is on disk, and long enough
    for key, media in edit["media"].items():
        path = PUBLIC / media["src"]
        c.add(f"media:{key}:exists", path.exists(), media["src"])
        if not path.exists():
            continue
        if media["kind"] == "video":
            frames, _ = probe_frames(path)
            c.add(f"media:{key}:declared_frames", frames == media.get("srcFrames"),
                  f"file={frames} declared={media.get('srcFrames')}")

    for shot in edit["shots"]:
        key = shot.get("media")
        if not key:
            continue
        media = edit["media"][key]
        if media["kind"] == "video":
            need = (shot.get("srcFrom", 0)) + shot["duration"]
            have = media.get("srcFrames", 0)
            c.add(f"shot:{shot['id']}:within_source_clip", need <= have,
                  f"needs {need} of {have} frames")
        crop = shot.get("crop")
        if crop:
            src_w, src_h = media.get("srcW"), media.get("srcH")
            worst = 0.0
            for rect in (crop["from"], crop["to"]):
                x, y, w, h = rect
                inside = x >= 0 and y >= 0 and x + w <= src_w and y + h <= src_h
                c.add(f"shot:{shot['id']}:crop_inside_source", inside,
                      f"{rect} in {src_w}x{src_h}")
                # The frame is 16:9; a crop that is not wastes or stretches pixels.
                c.add(f"shot:{shot['id']}:crop_is_16x9", abs(w / h - 16 / 9) < 0.02,
                      f"{w}x{h} = {w / h:.4f}")
                worst = max(worst, 1920 / w)
            c.add(f"shot:{shot['id']}:magnification", worst <= MAX_MAGNIFICATION,
                  f"{worst:.3f}x (limit {MAX_MAGNIFICATION})")

    # ---- sound cues fit inside the stems they draw from
    for cue in edit["sound"]:
        path = PUBLIC / "film-rd" / "audio" / f"{cue['file']}.ogg"
        c.add(f"sound:{cue['file']}@{cue['at']}:exists", path.exists(), str(path.name))
        if not path.exists():
            continue
        dur = probe_duration(path) or 0.0
        need = (cue.get("offset", 0) + cue["frames"]) / fps
        c.add(f"sound:{cue['file']}@{cue['at']}:within_stem", need <= dur + 0.02,
              f"needs {need:.2f}s of {dur:.2f}s")
        c.add(f"sound:{cue['file']}@{cue['at']}:within_film",
              cue["at"] + cue["frames"] <= edit["frames"],
              f"ends at {cue['at'] + cue['frames']}")
        # Gains above 1.0 are legitimate — the ambience stems were synthesised
        # 20 dB below the transients — so what matters is the peak each cue can
        # actually reach, not the multiplier's size.
        peak = probe_peak_db(path)
        c.add(f"sound:{cue['file']}@{cue['at']}:positive_gain", cue["gain"] > 0, str(cue["gain"]))
        if peak is not None:
            reached = peak + 20 * math.log10(cue["gain"])
            c.add(f"sound:{cue['file']}@{cue['at']}:peak_headroom", reached <= PEAK_CEILING_DB,
                  f"{reached:.1f} dBFS (ceiling {PEAK_CEILING_DB})")

    # ---- every claim on screen still agrees with the repository fixture
    by_id = {s["id"]: s for s in fixture["sources"]}
    for entry in edit["network"]:
        src = by_id.get(entry["sourceId"])
        c.add(f"fixture:{entry['sourceId']}:exists", src is not None, entry["sourceId"])
        if src:
            c.add(f"fixture:{entry['sourceId']}:name", src["name"] == entry["name"], entry["name"])
            c.add(f"fixture:{entry['sourceId']}:distance",
                  f"{src['distanceMiles']} mi" == entry["distance"], entry["distance"])

    events = {e["kind"]: e for e in fixture["hero"]["events"]}
    step_when = [s["when"] for s in edit["proofSteps"]]
    for kind, when in (("claim", events["claim"]["label"]),
                       ("first-redemption", events["first-redemption"]["label"]),
                       ("permission", events["permission"]["label"]),
                       ("return-redemption", events["return-redemption"]["label"])):
        c.add(f"fixture:proof_timestamp:{kind}", when in step_when, when)

    price = f"${fixture['returnOffer']['priceCents'] / 100:.2f}"
    goods = next(s for s in edit["shots"] if s["id"] == "paid-goods")
    c.add("fixture:return_price_on_screen", price in goods["eyebrow"],
          f"{price} in {goods['eyebrow']!r}")
    c.add("fixture:return_is_paid", fixture["returnOffer"]["priceCents"] > 0,
          f"{fixture['returnOffer']['priceCents']} cents")
    c.add("fixture:first_visit_is_free",
          events["first-redemption"]["priceCents"] == 0, "0 cents")

    # ---- the qualification never leaves the picture
    c.add("truth:disclaimer_present",
          edit["disclaimer"] == "Illustrative customer journey. Outcomes are not guaranteed.",
          edit["disclaimer"])

    # ---- no CG plate may re-enter the photographic cut
    cg = [s["id"] for s in edit["shots"]
          if s.get("media") and "photographic" not in edit["media"][s["media"]]["src"]]
    c.add("lane:every_picture_is_photographic", not cg, ", ".join(cg) or "all photographic")

    report = {"pass": c.ok, "checks": c.rows,
              "counts": {"total": len(c.rows), "failed": sum(1 for r in c.rows if not r["pass"])}}
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        for row in c.rows:
            if not row["pass"]:
                print(f"FAIL  {row['check']}  {row['detail']}")
        print(f"\n{report['counts']['total']} checks, {report['counts']['failed']} failed — "
              f"{'PASS' if c.ok else 'FAIL'}")
    return 0 if c.ok else 1


if __name__ == "__main__":
    sys.exit(main())
