#!/usr/bin/env python3
"""
Derive the delivery set from the rendered master.

The master is the one file Remotion produces; everything else in
`public/film-rd/final/` is a deterministic transform of it, so a re-run after a
re-render cannot leave a stale web cut or poster behind. Every step records what
it made, and `validate` reads the results back with ffprobe rather than trusting
the encoder's exit code.

    scripts/final-deliver.py master     # colour-correct Remotion's master output
    scripts/final-deliver.py teaser     # the same, for the 15-second cut
    scripts/final-deliver.py encodes    # web mp4 + webm, from the corrected master
    scripts/final-deliver.py posters    # six candidates + the chosen frame
    scripts/final-deliver.py contact    # four sheets of nine
    scripts/final-deliver.py validate   # ffprobe every delivered file
    scripts/final-deliver.py all        # all of the above, in order

`master` and `teaser` read the intermediates Remotion writes beside them
(`*-src.mp4`), so run them straight after a render. `scripts/film-final.sh`
drives the whole sequence, preflight included.

Poster candidates are extracted but never auto-chosen: the frame is picked by a
person (or a director agent) looking at them, and recorded in POSTER.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FINAL = ROOT / "public" / "film-rd" / "final"
CONTACT = FINAL / "contact"
REVIEW = ROOT / "film" / "review" / "final"

MASTER = FINAL / "uptick-growth-final-master-1080p.mp4"
# What Remotion hands over before colour is corrected. Not a deliverable.
MASTER_SRC = FINAL / "uptick-growth-final-master-src.mp4"
TEASER_SRC = FINAL / "uptick-growth-final-teaser-src.mp4"
MASTER_AUDIO = FINAL / "uptick-growth-final-master-src.wav"
TEASER_AUDIO = FINAL / "uptick-growth-final-teaser-src.wav"

# Web/broadcast delivery loudness. The synthesised stems sit around -45 dBFS
# mean, so without this the film plays 25 dB under everything else the viewer
# has open and reads as silent.
LOUDNESS_I = "-16.0"
LOUDNESS_TP = "-1.5"
LOUDNESS_LRA = "11.0"
WEB = FINAL / "uptick-growth-final-web-1080p.mp4"
WEBM = FINAL / "uptick-growth-final-1080p.webm"
TEASER = FINAL / "uptick-growth-final-teaser.mp4"
POSTER_PNG = FINAL / "uptick-growth-final-poster.png"
POSTER_JPG = FINAL / "uptick-growth-final-poster.jpg"

# The frame chosen as the poster, in composition frames at 24 fps. Frame 245 is
# indoor car-wash waiting room: the customer looks toward an ordinary wall TV
# advertising Joe's. The wash-bay window, chairs and screen share one frame,
# making the host-business placement clear without suggesting outdoor hardware.
POSTER = 245

# Six honest alternatives, one per act. Written out so the choice above can be
# re-argued against the same set instead of being taken on trust.
POSTER_CANDIDATES = {
    "a-station": 36,
    "b-screen": 245,
    "c-offer": 300,
    "d-first": 610,
    "e-drop": 930,
    "f-counter": 1105,
}

FPS = 24


def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr[-4000:])
        raise SystemExit(f"failed: {' '.join(cmd[:6])} ...")


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json",
         "-show_format", "-show_streams", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return json.loads(out)


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def summarise(path: Path) -> dict:
    if not path.exists():
        return {"file": str(path.relative_to(ROOT)), "present": False}
    info = probe(path)
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    audio = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    fmt = info["format"]
    row = {
        "file": str(path.relative_to(ROOT)),
        "present": True,
        "bytes": path.stat().st_size,
        "sha256": digest(path),
    }
    # Stills have no container duration; only the moving deliverables do.
    if fmt.get("duration") is not None:
        row["container_seconds"] = round(float(fmt["duration"]), 3)
    if video:
        num, den = (video.get("r_frame_rate") or "0/1").split("/")
        row |= {
            "video_codec": video["codec_name"],
            "width": video["width"],
            "height": video["height"],
            "fps": round(int(num) / int(den), 3) if int(den) else None,
            "pix_fmt": video.get("pix_fmt"),
            "video_frames": int(video["nb_frames"]) if video.get("nb_frames") else None,
            "color_range": video.get("color_range"),
            "color_space": video.get("color_space"),
        }
    if audio:
        row |= {
            "audio_codec": audio["codec_name"],
            "sample_rate": int(audio["sample_rate"]),
            "channels": audio["channels"],
        }
        measured = measure_loudness(path, None)
        if measured:
            row |= {"integrated_lufs": float(measured["input_i"]),
                    "true_peak_dbtp": float(measured["input_tp"])}
    else:
        row["audio_codec"] = None
    return row


# ------------------------------------------------------------------ encodes

def measure_loudness(src: Path, audio: Path | None) -> dict | None:
    """First loudnorm pass: measure, so the second pass can correct exactly."""
    target = audio or src
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(target), "-vn",
         "-af", f"loudnorm=I={LOUDNESS_I}:TP={LOUDNESS_TP}:LRA={LOUDNESS_LRA}:print_format=json",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    tail = proc.stderr[proc.stderr.rfind("{"):proc.stderr.rfind("}") + 1]
    try:
        return json.loads(tail)
    except (ValueError, json.JSONDecodeError):
        return None


def finish_master(src: Path, dst: Path | None = None, crf: str = "14",
                  audio: Path | None = None) -> None:
    """
    Correct the master's colour and its loudness before anything is derived.

    Colour: Remotion renders from JPEG frames, so ffmpeg hands back yuvj420p
    tagged full range with BT.470BG (625-line PAL) coefficients. That is the
    wrong description of an HD deliverable twice over: a player that honours the
    tag uses PAL luma coefficients, and one that ignores it crushes the blacks.
    This converts range and matrix honestly — full to limited, BT.601 to BT.709 —
    and tags the result, rather than relabelling the same samples.

    Loudness: two-pass loudnorm to -16 LUFS with a -1.5 dBTP ceiling. Measuring
    first and feeding the numbers back means the correction is exact instead of
    the single-pass estimate, which matters here because the film is mostly
    quiet ambience with a few transients.

    `audio` swaps in a separately rendered track, so a change to the sound edit
    does not cost a second video render.

    One re-encode at CRF 14 from a CRF 15 source is visually transparent and is
    the price of a master that behaves the same in every player. The teaser is a
    distribution asset rather than a master and takes a lighter CRF.
    """
    measured = measure_loudness(src, audio)
    norm = (f"loudnorm=I={LOUDNESS_I}:TP={LOUDNESS_TP}:LRA={LOUDNESS_LRA}"
            f":measured_I={measured['input_i']}:measured_TP={measured['input_tp']}"
            f":measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}"
            f":offset={measured['target_offset']}:linear=true:print_format=summary"
            if measured else
            f"loudnorm=I={LOUDNESS_I}:TP={LOUDNESS_TP}:LRA={LOUDNESS_LRA}")

    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(src)]
    if audio:
        cmd += ["-i", str(audio), "-map", "0:v:0", "-map", "1:a:0"]
    else:
        cmd += ["-map", "0:v:0", "-map", "0:a:0"]
    cmd += [
        "-vf", "scale=in_range=full:out_range=limited:"
               "in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p",
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.2",
        "-crf", crf, "-preset", "slow",
        "-color_range", "tv", "-colorspace", "bt709",
        "-color_primaries", "bt709", "-color_trc", "bt709",
        "-af", f"{norm},aresample=48000",
        "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart", str(dst or MASTER),
    ]
    run(cmd)


def align_loudness(path: Path, tolerance: float = 0.5) -> dict:
    """
    Check the loudness of the file that actually exists, and correct it if the
    first pass missed.

    loudnorm's gated integration is not exact on a short programme — the
    15-second teaser came out 2.8 dB hot — and a lossy audio encode can drift the
    true peak either way. Rather than trust the filter, this measures the
    delivered file and, if it is off, applies a flat trim with a limiter behind
    it, copying the video so the picture never pays for an audio fix.
    """
    measured = measure_loudness(path, None)
    if not measured:
        return {"file": str(path.relative_to(ROOT)), "corrected": False, "reason": "unmeasurable"}
    got = float(measured["input_i"])
    delta = float(LOUDNESS_I) - got
    if abs(delta) <= tolerance:
        return {"file": str(path.relative_to(ROOT)), "corrected": False,
                "integrated_lufs": got}
    tmp = path.with_suffix(".align.mp4" if path.suffix == ".mp4" else ".align.webm")
    audio = ["-c:a", "libopus", "-b:a", "128k"] if path.suffix == ".webm" else \
            ["-c:a", "aac", "-b:a", "256k"]
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(path),
        "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
        "-af", f"volume={delta:.2f}dB,alimiter=limit={10 ** (float(LOUDNESS_TP) / 20):.4f}:level=disabled",
        *audio, "-ar", "48000", "-ac", "2",
        *(["-movflags", "+faststart"] if path.suffix == ".mp4" else []),
        str(tmp),
    ])
    tmp.replace(path)
    after = measure_loudness(path, None)
    return {"file": str(path.relative_to(ROOT)), "corrected": True,
            "was_lufs": got, "applied_db": round(delta, 2),
            "integrated_lufs": float(after["input_i"]) if after else None}


def encode_web(master: Path) -> None:
    """A single-file web cut: same picture, streamable, a quarter of the size."""
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(master),
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.0",
        "-crf", "21", "-preset", "slow", "-pix_fmt", "yuv420p",
        "-x264-params", "keyint=48:min-keyint=24:scenecut=0",
        "-color_range", "tv", "-colorspace", "bt709",
        "-color_primaries", "bt709", "-color_trc", "bt709",
        # The master's audio is already normalised, 256k and 48 kHz. Re-encoding
        # it would be a second lossy pass that only moves the true peak up.
        "-c:a", "copy",
        "-movflags", "+faststart", str(WEB),
    ])


def encode_webm(master: Path) -> None:
    """
    VP9 for browsers that prefer it. `cpu-used 2` with `deadline good` is the
    normal VOD setting: libvpx-vp9 defaults to cpu-used 0, which on four cores
    spends the better part of an hour to buy a couple of percent of bitrate
    efficiency nobody will see.
    """
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(master),
        "-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0",
        "-deadline", "good", "-cpu-used", "4",
        "-row-mt", "1", "-tile-columns", "2", "-threads", "4",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv", "-colorspace", "bt709",
        "-color_primaries", "bt709", "-color_trc", "bt709",
        "-c:a", "libopus", "-b:a", "128k",
        str(WEBM),
    ])


# ------------------------------------------------------------------ posters

def posters(master: Path) -> dict:
    REVIEW.mkdir(parents=True, exist_ok=True)
    made = {}
    for name, frame in POSTER_CANDIDATES.items():
        out = REVIEW / f"poster-{name}.jpg"
        run(["ffmpeg", "-y", "-v", "error", "-i", str(master),
             "-vf", f"select=eq(n\\,{frame})", "-vsync", "0", "-frames:v", "1",
             "-q:v", "3", str(out)])
        made[name] = {"frame": frame, "seconds": round(frame / FPS, 3),
                      "file": str(out.relative_to(ROOT))}
    # The chosen frame, delivered full quality in both formats.
    run(["ffmpeg", "-y", "-v", "error", "-i", str(master),
         "-vf", f"select=eq(n\\,{POSTER})", "-vsync", "0", "-frames:v", "1",
         str(POSTER_PNG)])
    run(["ffmpeg", "-y", "-v", "error", "-i", str(master),
         "-vf", f"select=eq(n\\,{POSTER})", "-vsync", "0", "-frames:v", "1",
         "-q:v", "2", str(POSTER_JPG)])
    return {"chosen": POSTER, "chosen_seconds": round(POSTER / FPS, 3), "candidates": made}


# ------------------------------------------------------------ contact sheets

def contact(master: Path, frames: int) -> list[str]:
    """
    Four sheets of nine, evenly spanning the cut. The sheets are the review
    record; the stills they are laid from are not kept (see .gitignore).
    """
    CONTACT.mkdir(parents=True, exist_ok=True)
    # Remove both historical naming schemes so an obsolete film cannot remain
    # beside the freshly generated review sheets.
    for pattern in ("final-sheet*.png", "sheet[1-4].png"):
        for old in CONTACT.glob(pattern):
            old.unlink()
    per, sheets = 9, 4
    total = per * sheets
    step = frames / total
    picked = [min(frames - 1, int(i * step + step / 2)) for i in range(total)]
    tmp = CONTACT / "_tmp"
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir()
    for i, frame in enumerate(picked):
        run(["ffmpeg", "-y", "-v", "error", "-i", str(master),
             "-vf", f"select=eq(n\\,{frame}),scale=640:-1", "-vsync", "0",
             "-frames:v", "1", str(tmp / f"f{i:02d}.png")])
    made = []
    for s in range(sheets):
        chunk = [tmp / f"f{s * per + i:02d}.png" for i in range(per)]
        out = CONTACT / f"final-sheet{s + 1}.png"
        cmd = ["ffmpeg", "-y", "-v", "error"]
        for c in chunk:
            cmd += ["-i", str(c)]
        filt = "".join(f"[{i}:v]" for i in range(per)) + f"xstack=inputs={per}:layout="
        filt += "|".join(
            f"{'0' if i % 3 == 0 else 'w0' if i % 3 == 1 else 'w0+w1'}_"
            f"{'0' if i // 3 == 0 else 'h0' if i // 3 == 1 else 'h0+h1'}"
            for i in range(per)
        )
        cmd += ["-filter_complex", filt, "-frames:v", "1", str(out)]
        run(cmd)
        made.append(str(out.relative_to(ROOT)))
    shutil.rmtree(tmp)
    return made


# ----------------------------------------------------------------- validate

def _expected() -> dict:
    """Read the film's own shape from the locked edit rather than restating it."""
    edit = json.loads((ROOT / "film" / "final-director" / "final-edit.json").read_text())
    return {
        "frames": edit["frames"], "fps": float(edit["fps"]),
        "width": edit["width"], "height": edit["height"],
        "seconds": round(edit["frames"] / edit["fps"], 3),
        "teaser_frames": 360, "teaser_seconds": 15.0,
    }


EXPECT = _expected()


def validate() -> dict:
    report = {"expected": EXPECT, "artifacts": {}, "checks": []}
    for key, path in [("master", MASTER), ("web", WEB), ("webm", WEBM),
                      ("teaser", TEASER), ("poster_png", POSTER_PNG), ("poster_jpg", POSTER_JPG)]:
        report["artifacts"][key] = summarise(path)

    def check(name: str, ok: bool, detail: str) -> None:
        report["checks"].append({"check": name, "pass": bool(ok), "detail": detail})

    for key in ("master", "web", "webm"):
        a = report["artifacts"][key]
        check(f"{key}:present", a.get("present"), a["file"])
        if not a.get("present"):
            continue
        check(f"{key}:resolution", (a.get("width"), a.get("height")) == (1920, 1080),
              f"{a.get('width')}x{a.get('height')}")
        check(f"{key}:fps", a.get("fps") == 24.0, str(a.get("fps")))
        check(f"{key}:duration",
              a.get("container_seconds") is not None
              and abs(a["container_seconds"] - EXPECT["seconds"]) <= 0.30,
              f"{a.get('container_seconds')}s vs {EXPECT['seconds']}s")
        check(f"{key}:audio", a.get("audio_codec") is not None, str(a.get("audio_codec")))
        if a.get("integrated_lufs") is not None:
            check(f"{key}:loudness", abs(a["integrated_lufs"] - float(LOUDNESS_I)) <= 1.5,
                  f"{a['integrated_lufs']} LUFS (target {LOUDNESS_I})")
            check(f"{key}:true_peak", a["true_peak_dbtp"] <= -0.9,
                  f"{a['true_peak_dbtp']} dBTP")
        check(f"{key}:pix_fmt", a.get("pix_fmt") == "yuv420p", str(a.get("pix_fmt")))
        check(f"{key}:color_range", a.get("color_range") in (None, "tv"), str(a.get("color_range")))
        check(f"{key}:colorspace", a.get("color_space") == "bt709", str(a.get("color_space")))

    m = report["artifacts"]["master"]
    if m.get("present") and m.get("video_frames"):
        check("master:frame_count", m["video_frames"] == EXPECT["frames"],
              f"{m['video_frames']} frames")

    t = report["artifacts"]["teaser"]
    if t.get("present"):
        check("teaser:duration",
              t.get("container_seconds") is not None
              and abs(t["container_seconds"] - EXPECT["teaser_seconds"]) <= 0.30,
              f"{t.get('container_seconds')}s")
        check("teaser:resolution", (t.get("width"), t.get("height")) == (1920, 1080),
              f"{t.get('width')}x{t.get('height')}")
        if t.get("integrated_lufs") is not None:
            check("teaser:loudness", abs(t["integrated_lufs"] - float(LOUDNESS_I)) <= 1.5,
                  f"{t['integrated_lufs']} LUFS (target {LOUDNESS_I})")
            check("teaser:true_peak", t["true_peak_dbtp"] <= -0.9, f"{t['true_peak_dbtp']} dBTP")

    for key in ("poster_png", "poster_jpg"):
        p = report["artifacts"][key]
        check(f"{key}:resolution", p.get("present") and (p.get("width"), p.get("height")) == (1920, 1080),
              f"{p.get('width')}x{p.get('height')}")

    web = report["artifacts"]["web"]
    if m.get("present") and web.get("present"):
        check("web:smaller_than_master", web["bytes"] < m["bytes"],
              f"{web['bytes']} < {m['bytes']}")

    current_sheets = [CONTACT / f"final-sheet{i}.png" for i in range(1, 5)]
    check("contact:four_current_sheets", all(p.exists() for p in current_sheets),
          "final-sheet1.png through final-sheet4.png")
    legacy = list(CONTACT.glob("sheet[1-4].png"))
    check("contact:no_legacy_sheets", not legacy,
          ", ".join(p.name for p in legacy) or "no obsolete review sheets")

    report["pass"] = all(c["pass"] for c in report["checks"])
    return report


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("stage", choices=["all", "master", "teaser", "encodes", "align", "posters", "contact", "validate"])
    ap.add_argument("--master", default=str(MASTER))
    args = ap.parse_args()
    master = Path(args.master)

    out: dict = {}
    if args.stage in ("all", "master"):
        if not MASTER_SRC.exists():
            raise SystemExit(f"remotion output not found: {MASTER_SRC}")
        finish_master(MASTER_SRC, audio=MASTER_AUDIO if MASTER_AUDIO.exists() else None)
        out["master"] = str(MASTER.relative_to(ROOT))

    if args.stage in ("all", "teaser"):
        if not TEASER_SRC.exists():
            raise SystemExit(f"remotion teaser output not found: {TEASER_SRC}")
        finish_master(TEASER_SRC, TEASER, crf="18",
                      audio=TEASER_AUDIO if TEASER_AUDIO.exists() else None)
        out["teaser"] = str(TEASER.relative_to(ROOT))

    if args.stage in ("all", "encodes", "posters", "contact") and not master.exists():
        raise SystemExit(f"master not found: {master}")
    if args.stage in ("all", "encodes"):
        encode_web(master)
        encode_webm(master)
        out["encodes"] = ["web", "webm"]
    if args.stage in ("all", "align"):
        out["align"] = [align_loudness(p) for p in (MASTER, WEB, WEBM, TEASER) if p.exists()]

    if args.stage in ("all", "posters"):
        out["posters"] = posters(master)
    if args.stage in ("all", "contact"):
        frames = probe(master)["streams"][0].get("nb_frames")
        out["contact"] = contact(master, int(frames) if frames else EXPECT["frames"])
    if args.stage in ("all", "validate"):
        report = validate()
        out["validation"] = report
        REVIEW.mkdir(parents=True, exist_ok=True)
        (REVIEW / "VALIDATION.json").write_text(json.dumps(report, indent=2) + "\n")

    print(json.dumps(out, indent=2))
    if "validation" in out and not out["validation"]["pass"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
