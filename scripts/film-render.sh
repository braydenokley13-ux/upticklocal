#!/usr/bin/env bash
# Renders hero-shot previews: MP4 + five stills + a contact sheet per shot, and the lab's manifest.
#   scripts/film-render.sh Hero1 Hero2 ...      (no args = all five)
set -e
cd "$(dirname "$0")/.."
export FILM_CHROME=${FILM_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
OUT=public/film-rd/renders
mkdir -p "$OUT/stills"
SHOTS=("$@")
if [ ${#SHOTS[@]} -eq 0 ]; then SHOTS=(Hero1 Hero2 Hero3 Hero4 Hero5); fi
for id in "${SHOTS[@]}"; do
  echo "== $id"
  npx remotion render "$id" "$OUT/$id.mp4" --codec=h264 --crf=18 --log=error
  python3 scripts/film-sheet.py "$id" "$OUT/$id.mp4"
done
python3 scripts/film-manifest.py
