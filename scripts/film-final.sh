#!/usr/bin/env bash
#
# Build the whole delivery set for "From Nearby to Yours" from a clean checkout.
#
#   npm run film:final
#
# Preflight runs first and the script stops if it fails: there is no point
# spending half an hour of render on a timeline that already disagrees with its
# own sources. Remotion writes an intermediate, then final-deliver.py corrects
# the colour and derives everything else, so a re-run can never leave a stale
# web cut, poster or contact sheet behind.
#
# FILM_CHROME may point at a local Chromium; the remote environment's
# pre-installed headless shell is used by default.
set -euo pipefail

cd "$(dirname "$0")/.."

FINAL=public/film-rd/final
MASTER_SRC=$FINAL/uptick-growth-final-master-src.mp4
TEASER_SRC=$FINAL/uptick-growth-final-teaser-src.mp4

: "${FILM_CHROME:=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}"
export FILM_CHROME
CONCURRENCY="${FILM_CONCURRENCY:-3}"

RENDER_ARGS=(
  --codec=h264 --crf=15 --pixel-format=yuv420p
  --audio-codec=aac --audio-bitrate=256k
  --concurrency="$CONCURRENCY" --log=error
)
if [ -x "$FILM_CHROME" ]; then
  RENDER_ARGS+=(--browser-executable="$FILM_CHROME")
fi

echo "==> preflight"
python3 scripts/final-preflight.py

# Keep the source manifest describing the film that is about to be rendered,
# rather than the one that was rendered last time.
echo "==> source manifest"
python3 scripts/final-manifest.py

mkdir -p "$FINAL"

echo "==> master (1248 frames)"
npx remotion render film/index.ts Final-Film "$MASTER_SRC" "${RENDER_ARGS[@]}"

echo "==> teaser (360 frames)"
npx remotion render film/index.ts Final-Teaser "$TEASER_SRC" "${RENDER_ARGS[@]}"

# The sound edit is rendered on its own so that changing a gain costs an audio
# pass rather than a second half-hour of frames. final-deliver.py picks these up
# automatically when they exist.
echo "==> sound"
npx remotion render film/index.ts Final-Film "${MASTER_SRC%.mp4}.wav" \
  --codec=wav --concurrency="$CONCURRENCY" --log=error
npx remotion render film/index.ts Final-Teaser "${TEASER_SRC%.mp4}.wav" \
  --codec=wav --concurrency="$CONCURRENCY" --log=error

echo "==> colour-correct master and teaser"
python3 scripts/final-deliver.py master
python3 scripts/final-deliver.py teaser
rm -f "$MASTER_SRC" "$TEASER_SRC" "${MASTER_SRC%.mp4}.wav" "${TEASER_SRC%.mp4}.wav"

echo "==> web, webm, posters, contact sheets"
python3 scripts/final-deliver.py encodes >/dev/null
python3 scripts/final-deliver.py align
python3 scripts/final-deliver.py posters >/dev/null
python3 scripts/final-deliver.py contact >/dev/null

echo "==> validate"
python3 scripts/final-deliver.py validate >/dev/null
python3 - <<'PY'
import json, pathlib
r = json.loads(pathlib.Path("film/review/final/VALIDATION.json").read_text())
bad = [c for c in r["checks"] if not c["pass"]]
for c in bad:
    print(f"FAIL  {c['check']}  {c['detail']}")
print(f"{len(r['checks'])} delivery checks, {len(bad)} failed — {'PASS' if r['pass'] else 'FAIL'}")
raise SystemExit(0 if r["pass"] else 1)
PY

echo "==> done"
ls -la "$FINAL" | grep -E 'final-|contact'
