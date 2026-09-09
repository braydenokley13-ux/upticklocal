#!/usr/bin/env python3
"""
Regenerate `film/final-director/SOURCE_MEDIA.json`.

Everything the delivered film is made from, checksummed: the timeline, the
composition, the fixture the on-screen claims are read from, each picture with
its dimensions and (for clips) its frame count, each sound stem with its
duration and measured level, and each font face. Run it whenever the edit, the
composition or the source media changes, so the manifest can never quietly
describe a film that no longer exists.

    scripts/final-manifest.py

The Higgsfield job records — model, mode, credit charge, prompt intent, and the
verdict on each generation — live separately in `HIGGSFIELD_MANIFEST.json`,
which is a hand-written record of what was asked for and what came back. This
script only describes files.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EDIT = ROOT / "film" / "final-director" / "final-edit.json"
COMPOSITION = ROOT / "film" / "compositions" / "director" / "FinalFilm.tsx"
FIXTURE = ROOT / "film" / "data" / "acquisition.json"
PICTURES = ROOT / "public" / "film-rd" / "director" / "photographic"
AUDIO = ROOT / "public" / "film-rd" / "audio"
FONTS = ROOT / "public" / "film-rd" / "fonts"
OUT = ROOT / "film" / "final-director" / "SOURCE_MEDIA.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def picture(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,nb_frames,r_frame_rate", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    s = json.loads(out)["streams"][0]
    row = {"file": rel(path), "sha256": sha256(path), "bytes": path.stat().st_size,
           "width": s["width"], "height": s["height"]}
    if path.suffix == ".mp4":
        num, den = s["r_frame_rate"].split("/")
        row |= {"frames": int(s["nb_frames"]), "fps": int(num) // int(den)}
    return row


def stem(path: Path) -> dict:
    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True,
    ).stdout.strip()
    levels = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    def find(key: str) -> float | None:
        hit = [l for l in levels.splitlines() if key in l]
        return float(hit[0].split()[-2]) if hit else None
    return {"file": rel(path), "sha256": sha256(path), "bytes": path.stat().st_size,
            "seconds": round(float(dur), 3),
            "mean_dbfs": find("mean_volume"), "peak_dbfs": find("max_volume")}


def main() -> None:
    edit = json.loads(EDIT.read_text())
    in_cut = {Path(m["src"]).name for m in edit["media"].values()}
    used_audio = sorted({c["file"] for c in edit["sound"]})
    on_disk = sorted(p.name for p in PICTURES.iterdir() if p.suffix in (".mp4", ".png"))

    doc = {
        "title": "Source media manifest — From Nearby to Yours",
        "generatedBy": "scripts/final-manifest.py",
        "edit": {"file": rel(EDIT), "sha256": sha256(EDIT)},
        "composition": {"file": rel(COMPOSITION), "sha256": sha256(COMPOSITION)},
        "fixture": {
            "file": rel(FIXTURE), "sha256": sha256(FIXTURE),
            "role": "Every business name, distance, timestamp and price on screen is read "
                    "from this file at render time; scripts/final-preflight.py fails the "
                    "build if any of them drift.",
        },
        "pictures": [
            picture(PICTURES / n) | {
                "role": next(k for k, v in edit["media"].items() if Path(v["src"]).name == n)
            }
            for n in on_disk if n in in_cut
        ],
        "picturesPresentButNotInTheCut": [
            picture(PICTURES / n) for n in on_disk if n not in in_cut
        ],
        "picturesPresentButNotInTheCutNote":
            "route-depart-v1.mp4 was rejected — the car waits before moving and changes "
            "shape in the closing frames. The two doorway stills are the OpenAI-generated "
            "inputs the Higgsfield doorway motion was grown from, kept so the lineage of "
            "the film's best clip stays checkable.",
        "audio": [stem(AUDIO / f"{n}.ogg") for n in used_audio],
        "fonts": [
            {"file": rel(p), "sha256": sha256(p), "bytes": p.stat().st_size}
            for p in sorted(FONTS.glob("*.woff2"))
        ],
        "rights": {
            "pictures": "AI-generated concept photography (Higgsfield; two doorway inputs "
                        "from OpenAI image generation). Not live-action footage, not "
                        "photographs of a real business, not real customers. Per-file "
                        "provenance in HIGGSFIELD_MANIFEST.json.",
            "audio": "Original procedural synthesis, film/audio/synth.py. No stock "
                     "recording and no third-party music.",
            "fonts": "Geist, Geist Mono and Newsreader under the SIL Open Font License; "
                     "the licence files are kept beside the faces in public/film-rd/fonts.",
            "blender": "The Rocketbox character and walk (Microsoft, MIT) and the "
                       "procedural sets remain in the repository under blender/ with their "
                       "LICENSE.md and SOURCE.json intact. None of it appears in this film.",
        },
    }
    OUT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
    print(f"{rel(OUT)}: {len(doc['pictures'])} pictures in the cut, "
          f"{len(doc['picturesPresentButNotInTheCut'])} held out, "
          f"{len(doc['audio'])} stems, {len(doc['fonts'])} font faces")


if __name__ == "__main__":
    main()
