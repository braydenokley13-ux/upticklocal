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
FIXTURE = ROOT / "film" / "data" / "weekly-drop.json"
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
    # The Weekly Drop revision is allowed 52-58 s; story clarity beat the old
    # 52 s exactly. It must still be a whole number of frames at 24 fps.
    runtime = edit["frames"] / fps
    c.add("timeline:runtime_in_range", 52.0 <= runtime <= 58.0, f"{runtime:.3f}s")
    c.add("timeline:whole_frames", edit["frames"] == int(edit["frames"]), str(edit["frames"]))

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
    by_id = {n["id"]: n for n in fixture["network"]}
    for n in fixture["network"]:
        c.add(f"fixture:network:{n['id']}:has_a_screen", n.get("screens", 0) >= 1, str(n.get("screens")))
    c.add("fixture:screen_host_exists", fixture["screen"]["hostId"] in by_id,
          fixture["screen"]["hostId"])
    c.add("fixture:screen_host_is_the_hero_source",
          edit["continuity"]["hostId"] == fixture["screen"]["hostId"],
          edit["continuity"]["hostId"])

    # The offer on the screen must be the one the film's own timeline redeems.
    qual = fixture["screen"]["qualifyingCents"]
    c.add("fixture:qualifying_matches_fuel_total", qual == fixture["fuel"]["totalCents"],
          f"{qual} vs {fixture['fuel']['totalCents']}")
    c.add("fixture:screen_states_the_qualifier",
          f"${qual // 100}" in fixture["screen"]["action"], fixture["screen"]["action"])
    c.add("fixture:first_redemption_cites_the_qualifier",
          f"${qual // 100}" in fixture["firstRedemption"]["qualifier"],
          fixture["firstRedemption"]["qualifier"])

    # Something is always free — on the acquisition offer and on the Drop alike.
    c.add("product:acquisition_offer_is_free",
          "FREE" in fixture["screen"]["reward"].upper()
          and fixture["firstRedemption"]["priceCents"] == 0,
          fixture["screen"]["reward"])
    c.add("product:drop_offer_is_free",
          "free" in fixture["returnRedemption"]["rewardLine"].lower(),
          fixture["returnRedemption"]["rewardLine"])
    c.add("product:drop_message_says_free",
          any("free" in line.lower() for line in fixture["drop"]["lines"]),
          " / ".join(fixture["drop"]["lines"]))

    # The Drop reaches him by text, and the film has to say so.
    c.add("product:drop_channel_is_text", "text" in fixture["drop"]["channel"].lower(),
          fixture["drop"]["channel"])

    # Permission is offered, pressed, then accepted — never accepted first.
    for name in ("redeem1", "join", "redeem2"):
        beat = edit["beats"][name]
        c.add(f"beat:{name}:press_precedes_done", beat["pressFrame"] < beat["doneFrame"],
              f"press {beat['pressFrame']} < done {beat['doneFrame']}")
        shot = next(x for x in edit["shots"] if x.get("insert") == name)
        c.add(f"beat:{name}:done_inside_shot", beat["doneFrame"] < shot["duration"] - 6,
              f"done {beat['doneFrame']} of {shot['duration']}")

    # This copy revision intentionally uses an urgent Friday-only Drop. Keep the
    # phrase explicit and short enough to read inside the phone bubble.
    on_screen = []
    for shot in edit["shots"]:
        on_screen += [shot.get("copy", ""), shot.get("eyebrow", "")]
    def walk(node):
        if isinstance(node, str): on_screen.append(node)
        elif isinstance(node, dict):
            for v in node.values(): walk(v)
        elif isinstance(node, list):
            for v in node: walk(v)
    for key in ("screen", "firstRedemption", "join", "drop", "returnRedemption", "journey", "closing"):
        walk(fixture[key])
    c.add("product:friday_offer_is_explicit",
          any("friday only" in t.lower() for t in on_screen),
          "The Drop must make its Friday-only urgency explicit.")
    c.add("product:friday_offer_is_urgent",
          any("don't miss" in t.lower() for t in on_screen),
          "The Friday-only message must include an urgent call to action.")
    c.add("product:names_the_weekly_drop",
          any("weekly drop" in t.lower() for t in on_screen), fixture["screen"]["product"])

    # The journey panel is the film's only proof, and every row must be a real beat.
    whens = {fixture[k]["when"] for k in ("fuel", "firstRedemption", "join", "drop", "returnRedemption")}
    for step in fixture["journey"][1:]:
        c.add(f"fixture:journey_timestamp:{step['label']}", step["when"] in whens, step["when"])
    c.add("fixture:no_aggregate_on_screen",
          not any(ch.isdigit() and "of" in t for t in on_screen for ch in "")
          and not any(w in " ".join(on_screen).lower() for w in ("customers joined", "% ", "roi", "increase")),
          "no aggregate, percentage or ROI claim")

    # ---- the composited screen sits inside the plate it was measured from
    q = edit["screenQuad"]
    plate = edit["media"]["washPlate"]
    for i, (x, y) in enumerate(q["corners"]):
        c.add(f"screen:corner{i}:inside_plate",
              0 <= x <= plate["srcW"] and 0 <= y <= plate["srcH"], f"({x},{y})")
    xs = [p[0] for p in q["corners"]]; ys = [p[1] for p in q["corners"]]
    c.add("screen:quad_has_area", (max(xs) - min(xs)) > 100 and (max(ys) - min(ys)) > 200,
          f"{max(xs)-min(xs)}x{max(ys)-min(ys)}")
    c.add("screen:inset_leaves_a_bezel", 0 < q["inset"] < 40, str(q["inset"]))
    c.add("screen:plate_blur_declared", q["plateBlurPx"] > 0, str(q["plateBlurPx"]))
    c.add("screen:indoor_tv_placement", q.get("placement") == "indoor-wall-mounted-tv",
          q.get("placement", "missing placement"))
    c.add("screen:landscape_display", max(xs) - min(xs) > max(ys) - min(ys),
          "The measured display must be landscape, not the retired outdoor portrait panel.")
    c.add("screen:measured_plate_matches_source", q.get("plate") == Path(plate["src"]).name,
          f"{q.get('plate')} vs {Path(plate['src']).name}")
    used = [s2["id"] for s2 in edit["shots"] if s2.get("screen")]
    c.add("screen:appears_in_the_film", len(used) >= 2, ", ".join(used))
    wash = next(s for s in edit["shots"] if s["id"] == "wash")
    notice = next(s for s in edit["shots"] if s["id"] == "notice")
    c.add("screen:customer_motion_is_continuous",
          wash["media"] == notice["media"]
          and edit["media"][wash["media"]]["kind"] == "video"
          and wash.get("srcFrom", 0) + wash["duration"] == notice.get("srcFrom", 0),
          "The customer must keep moving through wash → notice without restarting the clip.")

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
