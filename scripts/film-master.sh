#!/usr/bin/env bash
# The finished film's deliverables, from the Film composition:
#   scripts/film-master.sh            # master, web MP4/WebM, poster, teaser loop, contact sheet
#   scripts/film-master.sh master     # any subset: master web poster teaser sheet
#
#   public/film-rd/final/uptick-growth-master-1080p.mp4   H.264 CRF 15, PNG frames, 24 fps, with the mix   (A)
#   public/film-rd/final/uptick-growth-1080p.mp4          H.264 CRF 20, faststart, web                     (B)
#   public/film-rd/final/uptick-growth-1080p.webm         VP9 CRF 31, web                                  (B)
#   public/film-rd/final/uptick-growth-poster.jpg         the poster frame                                 (B, D)
#   public/film-rd/final/uptick-growth-loop.mp4           the silent 10 s loop                              (C)
#   public/film-rd/final/contact/                         one frame every 2 s, nine to a sheet             (F)
#
# 4K: the project renders at 3840×2160 with `--scale=2` (SCALE=2 scripts/film-master.sh master); the Blender
# plates are 1280×720 and upscale, the typography and the composited pages are vector and do not.
set -e
cd "$(dirname "$0")/.."
export FILM_CHROME=${FILM_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
OUT=public/film-rd/final
mkdir -p "$OUT"
SCALE=${SCALE:-1}
STEPS=("$@"); [ ${#STEPS[@]} -eq 0 ] && STEPS=(master web poster teaser sheet)
has() { for s in "${STEPS[@]}"; do [ "$s" = "$1" ] && return 0; done; return 1; }
FF() { npx remotion ffmpeg -y -loglevel error "$@"; }

if has master; then
  echo "== master"
  npx remotion render Film "$OUT/uptick-growth-master-raw.mp4" --codec=h264 --crf=15 --image-format=png --scale="$SCALE" --log=error
  # the cues are mastered quiet on purpose (film/audio/CUES.md); the mix is lifted once, here, so its true peak sits at -1 dBTP with the dynamics untouched
  GAIN=$(python3 scripts/film-peak.py "$OUT/uptick-growth-master-raw.mp4" -1.0)
  echo "mix gain ${GAIN} dB"
  FF -i "$OUT/uptick-growth-master-raw.mp4" -c:v copy -af "volume=${GAIN}dB" -c:a aac -b:a 256k "$OUT/uptick-growth-master-1080p.mp4"
  rm -f "$OUT/uptick-growth-master-raw.mp4"
fi
if has web; then
  echo "== web"
  FF -i "$OUT/uptick-growth-master-1080p.mp4" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 160k "$OUT/uptick-growth-1080p.mp4"
  FF -i "$OUT/uptick-growth-master-1080p.mp4" -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -pix_fmt yuv420p -c:a libopus -b:a 128k "$OUT/uptick-growth-1080p.webm"
fi
if has poster; then
  echo "== poster"
  npx remotion still Film "$OUT/uptick-growth-poster.png" --frame="${POSTER_FRAME:-240}" --scale="$SCALE" --log=error
  FF -i "$OUT/uptick-growth-poster.png" -q:v 2 "$OUT/uptick-growth-poster.jpg"
fi
if has teaser; then
  echo "== teaser"
  npx remotion render Teaser "$OUT/uptick-growth-loop.mp4" --codec=h264 --crf=18 --muted --scale="$SCALE" --log=error
fi
if has sheet; then
  echo "== contact sheet"
  python3 scripts/film-review.py Film --every 48 --per-sheet 9 --out "$OUT/contact" --mp4 "$OUT/uptick-growth-master-1080p.mp4"
fi
ls -la "$OUT"
