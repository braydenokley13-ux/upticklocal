#!/usr/bin/env bash
# The eleven physical plates, in the order the film needs them most, at the length the edit
# actually uses. Resumable: a frame already on disk is skipped, so this can be stopped and
# restarted, and a shot can be re-rendered by deleting its directory under plates/seq.
#
#   bash scripts/film-plates.sh                 # all eleven
#   bash scripts/film-plates.sh device scan     # just these
#
# RES/SAMPLES are the film's plate settings: 1280x720 is scaled 1.5x into the 1920x1080
# master, and 18 samples with OpenImageDenoise is clean at this depth of field — measured
# against 28, the difference is not visible and the frame is 40% cheaper.
set -e
cd "$(dirname "$0")/.."
RES=${RES:-1280x720}
SAMPLES=${SAMPLES:-18}
export PLATE_RES_CAP=${PLATE_RES_CAP:-$RES}

# shot:last-frame-the-edit-uses
ORDER=(
  device:77      # the redemption, and the only place the product has to be read
  scan:45        # the crossing into the relationship
  cafe:25        # the panel that publishes the offer
  threshold:25   # the door
  counter:27     # the phone across the counter
  coffee:25      # the reward
  approach:29    # the walk up
  rise:39        # the crossing back to the page
  morning_door:23
  morning_pump:26
  morning_walk:27
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
  echo "=== PLATE $shot 0:$last @ $RES/$SAMPLES"
  nice -n 5 python3 blender/scripts/render.py "$shot" --seq --range "0:$last" \
    --res "$RES" --samples "$SAMPLES" --out "public/film-rd/plates/seq/$shot"
  node scripts/film-encode.mjs "$shot"
done
echo "PLATES-DONE"
