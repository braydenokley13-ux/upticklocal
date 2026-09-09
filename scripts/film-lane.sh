#!/usr/bin/env bash
# Flip which plate lane the edit reads, and run something on it.
#
#   scripts/film-lane.sh proxy                       # flip and leave it flipped
#   scripts/film-lane.sh final                       # put it back
#   scripts/film-lane.sh proxy npx remotion render … # flip, run, restore even on failure
#
# The lane lives in film/block/lane.ts rather than in an environment variable because Remotion
# caches its webpack bundle and inlines process.env at bundle time: whichever invocation built
# the bundle first decided the lane for every later one that reused it. As source, the lane is
# part of the bundle's hash, so the two lanes cannot share a cache.
set -e
cd "$(dirname "$0")/.."
LANE=$1; shift || true
case "$LANE" in proxy|final) ;; *) echo "usage: film-lane.sh proxy|final [command…]" >&2; exit 2;; esac
FILE=film/block/lane.ts
set_lane() { python3 - "$1" <<'PY'
import re, sys
p = "film/block/lane.ts"
s = open(p).read()
s = re.sub(r'(export const PLATE_LANE: "final" \| "proxy" = ")(final|proxy)(")', lambda m: m.group(1) + sys.argv[1] + m.group(3), s)
open(p, "w").write(s)
PY
}
if [ $# -eq 0 ]; then set_lane "$LANE"; echo "lane → $LANE"; exit 0; fi
trap 'set_lane final' EXIT
set_lane "$LANE"
echo "lane → $LANE (restored to final on exit)"
"$@"
