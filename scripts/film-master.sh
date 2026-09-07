#!/usr/bin/env bash
# The finished film's deliverables, from the Film composition:
#   scripts/film-master.sh            # master, web MP4/WebM, poster, teaser loop, contact sheet
#   scripts/film-master.sh master     # any subset: master web poster teaser sheet
#
#   public/film-rd/final/uptick-growth-master-1080p.mp4   H.264 CRF 15, PNG frames, 24 fps, AAC 256k       (A)
#   public/film-rd/final/uptick-growth-1080p.mp4          H.264 CRF 20, faststart, AAC 160k                (B)
#   public/film-rd/final/uptick-growth-1080p.webm         VP9 CRF 31, Opus 128k                            (B)
#   public/film-rd/final/uptick-growth-poster.jpg         the poster frame                                 (B, D)
#   public/film-rd/final/uptick-growth-loop-poster.jpg    the loop's first frame, for the hero <video poster>
#   public/film-rd/final/uptick-growth-loop.mp4           the silent 6.9 s loop                            (C)
#   public/film-rd/final/contact/                         one frame every 2 s, nine to a sheet             (F)
#
# The picture is rendered muted and the mix is rendered as PCM; every deliverable is cut from
# those two, so the sound is encoded exactly once on its way to each of them.
#
# 4K: the project renders at 3840×2160 with `--scale=2` (SCALE=2 scripts/film-master.sh master); the Blender
# plates are 1280×720 and upscale, the typography and the composited pages are vector and do not.
set -e
cd "$(dirname "$0")/.."
export FILM_CHROME=${FILM_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
# OUT is overridable so the whole chain can be rehearsed at a small --scale into a scratch
# directory without touching the real deliverables
OUT=${OUT:-public/film-rd/final}
mkdir -p "$OUT"
SCALE=${SCALE:-1}
STEPS=("$@"); [ ${#STEPS[@]} -eq 0 ] && STEPS=(master web poster teaser sheet)
has() { for s in "${STEPS[@]}"; do [ "$s" = "$1" ] && return 0; done; return 1; }
FF() { npx remotion ffmpeg -y -loglevel error "$@"; }

# The picture and the mix are rendered separately and married once, so the sound reaches
# every deliverable through exactly one lossy encode. Rendering them together would put
# Remotion's own AAC in the middle: decode it to measure the peak, apply the gain, encode
# AAC again — two generations on a mix whose whole argument is its dynamics. The audio-only
# pass costs 35 s and the gain is then measured on PCM, where a true peak is exact.
VID="$OUT/uptick-growth-picture.mp4"
MIX="$OUT/uptick-growth-mix.wav"
if has master; then
  echo "== picture"
  npx remotion render Film "$VID" --codec=h264 --crf=15 --image-format=png --muted --scale="$SCALE" --log=error
  echo "== mix"
  npx remotion render Film "$MIX" --codec=wav --log=error
  # the cues are mastered quiet on purpose (film/audio/CUES.md); the mix is lifted once, here,
  # so its true peak sits at -1 dBTP with the dynamics untouched — no compression, no limiting
  GAIN=$(python3 scripts/film-peak.py "$MIX" -1.0)
  echo "mix gain ${GAIN} dB"
  FF -i "$VID" -i "$MIX" -shortest -map 0:v:0 -map 1:a:0 -c:v copy -af "volume=${GAIN}dB" -c:a aac -b:a 256k "$OUT/uptick-growth-master-1080p.mp4"
fi
if has web; then
  echo "== web"
  [ -f "$VID" ] || { echo "web needs the picture and the mix from the master step" >&2; exit 1; }
  GAIN=${GAIN:-$(python3 scripts/film-peak.py "$MIX" -1.0)}
  FF -i "$VID" -i "$MIX" -shortest -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -af "volume=${GAIN}dB" -c:a aac -b:a 160k "$OUT/uptick-growth-1080p.mp4"
  FF -i "$VID" -i "$MIX" -shortest -map 0:v:0 -map 1:a:0 -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -pix_fmt yuv420p -af "volume=${GAIN}dB" -c:a libopus -b:a 128k "$OUT/uptick-growth-1080p.webm"
fi
if has poster; then
  # frame 200: the settle. The painted 3 on the pavement beside JOE'S · 07:00-10:00,
  # the block behind it, the line on the road. The one frame that is the whole film.
  echo "== poster"
  npx remotion still Film "$OUT/uptick-growth-poster.png" --frame="${POSTER_FRAME:-200}" --scale="$SCALE" --log=error
  FF -i "$OUT/uptick-growth-poster.png" -q:v 2 "$OUT/uptick-growth-poster.jpg"
  # and the loop's own first frame. The site uses a poster image behind the silent loop while
  # it buffers; if that image is a different frame from the one the loop opens on, the page
  # visibly jumps the moment playback starts. This is that frame exactly, so it does not.
  npx remotion still Teaser "$OUT/uptick-growth-loop-poster.png" --frame=0 --scale="$SCALE" --log=error
  FF -i "$OUT/uptick-growth-loop-poster.png" -q:v 2 "$OUT/uptick-growth-loop-poster.jpg"
  rm -f "$OUT/uptick-growth-loop-poster.png"
fi
if has teaser; then
  echo "== teaser"
  npx remotion render Teaser "$OUT/uptick-growth-loop.mp4" --codec=h264 --crf=18 --muted --scale="$SCALE" --log=error
fi
if has sheet; then
  echo "== contact sheet"
  python3 scripts/film-review.py Film --every 48 --per-sheet 9 --out "$OUT/contact" --mp4 "$OUT/uptick-growth-master-1080p.mp4"
fi
# the picture and the mix are intermediates; every deliverable has been cut from them by here
if has master && has web; then rm -f "$VID" "$MIX"; fi
ls -la "$OUT"
