#!/usr/bin/env bash
# Renders every Blender plate in sequence, then encodes each. Resumable: frames already on disk are skipped.
set -e
cd "$(dirname "$0")/.."
RES=${RES:-1280x720}
SAMPLES=${SAMPLES:-32}
for shot in "$@"; do
  python3 blender/scripts/render.py "$shot" --seq --res "$RES" --samples "$SAMPLES" --out "public/film-rd/plates/seq/$shot"
  node scripts/film-encode.mjs "$shot"
done
