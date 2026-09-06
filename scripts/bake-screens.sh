#!/usr/bin/env bash
# Bake the phone's UI to PNG sequences Blender can emit from a screen.
#
#   scripts/bake-screens.sh                 all of them
#   scripts/bake-screens.sh Device-Pass     one
#
# The product is not composited over the world in the physical acts. It is a
# texture on a panel inside the shot, so it is lit, reflected, blurred and
# occluded correctly. This script is the bridge: Remotion renders the panel's
# content, Blender renders the panel.
set -euo pipefail
cd "$(dirname "$0")/.."
export FILM_CHROME=${FILM_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
OUT=blender/screens
mkdir -p "$OUT"
IDS=${*:-"Device-Pass Device-Offer Device-Text"}
for id in $IDS; do
  d="$OUT/$(echo "$id" | tr 'A-Z' 'a-z')"
  rm -rf "$d"; mkdir -p "$d"
  echo "baking $id → $d"
  nice -n 10 npx remotion render "$id" "$d" --sequence --image-format=png --log=error
  # Remotion writes element-N.png; Blender wants a zero-padded sequence from 0000.
  python3 - "$d" <<'PY'
import os, re, sys
d = sys.argv[1]
for f in sorted(os.listdir(d)):
    m = re.match(r"element-(\d+)\.png$", f)
    if m:
        os.rename(os.path.join(d, f), os.path.join(d, f"{int(m.group(1)):04d}.png"))
print(f"  {len([f for f in os.listdir(d) if f.endswith('.png')])} frames")
PY
done
