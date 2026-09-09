#!/usr/bin/env bash
# LANE A · fast creative iteration.
#
#   scripts/film-proxy.sh                    # every shot the edit uses
#   scripts/film-proxy.sh device coffee      # just these
#
# The same cameras, the same figures, the same timing, the same screen content and — because
# blender/exports/*.json stores tracks NORMALISED and the composite scales them by the
# composition's own 1920x1080 — byte-identical composite geometry. Only the pixels are cheap.
# That is what makes a proxy worth trusting for a world crossing: the homography on a phone's
# glass lands in exactly the same place it will land in the final.
#
# Measured on this machine (4 CPU cores, no GPU, Cycles CPU + OIDN), one counter frame:
#
#   1280x720 @ 18spp   53.1 s   the final lane
#    960x540 @ 12spp   23.9 s   2.2x
#    640x360 @  8spp   11.1 s   4.8x   <- this lane
#    480x270 @  6spp    8.0 s   6.7x   (only 1.4x over 640x360: the 1.4 s scene build and the
#                                       denoise/composite/write floor dominate below this)
#
# A shot already finished at final quality is a better proxy than any proxy, so it is copied
# into this lane rather than re-rendered. Freshness is decided by the frame sequence: if the
# final mp4 is newer than its own seq/ directory, it is current.
set -e
cd "$(dirname "$0")/.."
RES=${RES:-640x360}
SAMPLES=${SAMPLES:-8}
export PLATE_RES_CAP=${PLATE_RES_CAP:-$RES}
FINAL=public/film-rd/plates
PROXY=$FINAL/proxy
mkdir -p "$PROXY/seq"

# shot:last-frame-the-edit-uses — the ranges film/render/manifest.json derives from the cut
ORDER=(
  cafe:25 scan:45
  threshold:23 counter:25 device:77 coffee:23 approach:25
  morning_pump:26 morning_walk:27 morning_door:23 rise:39
  hero3a:143 hero1a:143
)

want=("$@")
for entry in "${ORDER[@]}"; do
  shot=${entry%%:*}
  last=${entry##*:}
  if [ ${#want[@]} -gt 0 ]; then
    hit=0
    for w in "${want[@]}"; do [ "$w" = "$shot" ] && hit=1; done
    [ $hit -eq 1 ] || continue
  fi
  if [ -s "$FINAL/$shot.mp4" ] && [ -d "$FINAL/seq/$shot" ] && [ "$FINAL/$shot.mp4" -nt "$FINAL/seq/$shot" ]; then
    cp -f "$FINAL/$shot.mp4" "$PROXY/$shot.mp4"
    echo "=== PROXY $shot — final plate is current, copied ($(du -h "$PROXY/$shot.mp4" | cut -f1))"
    continue
  fi
  echo "=== PROXY $shot 0:$last @ $RES/$SAMPLES"
  nice -n 5 python3 blender/scripts/render.py "$shot" --seq --range "0:$last" \
    --res "$RES" --samples "$SAMPLES" --out "$PROXY/seq/$shot"
  node scripts/film-encode.mjs "$shot" proxy
done
echo "PROXY-DONE"
