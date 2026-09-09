#!/usr/bin/env bash
# Provision a clean Linux worker and render one shard of the acquisition film.
#
#   scripts/render-worker-bootstrap.sh --shot approach --range 0:47 --quality final --device CPU
#
# Everything the render needs is in the repository or is downloaded here against
# a published checksum: the character and its textures, the fonts, the fixture,
# the scene source. The baked phone surfaces are rebuilt from the Remotion
# compositions rather than shipped, so a worker never depends on someone's
# machine having them. No absolute path outside this checkout is read or
# written, and nothing outside the repository and the pinned tool directories is
# created.
set -euo pipefail

BLENDER_VERSION=5.0.1
BLENDER_SERIES=Blender5.0
BLENDER_ROOT=${BLENDER_ROOT:-/opt/blender}
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

SHOT=""; RANGE=""; QUALITY=final; DEVICE=CPU; PHASE=plates
while [ $# -gt 0 ]; do
  case "$1" in
    --shot) SHOT=$2; shift 2;;
    --range) RANGE=$2; shift 2;;
    --quality) QUALITY=$2; shift 2;;
    --device) DEVICE=$2; shift 2;;
    --phase) PHASE=$2; shift 2;;
    --setup-only) PHASE=setup; shift;;
    *) echo "unknown argument: $1" >&2; exit 2;;
  esac
done

[ "$(uname -s)" = "Linux" ] || { echo "This worker is for Linux. It never runs on a contributor's own machine." >&2; exit 2; }

echo "== worker =="
nproc; free -h | head -2; df -h "$ROOT" | tail -1
if command -v nvidia-smi >/dev/null 2>&1; then nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader; else echo "no nvidia-smi"; fi

if [ ! -x "$BLENDER_ROOT/blender" ]; then
  echo "== installing Blender $BLENDER_VERSION =="
  work=$(mktemp -d)
  curl -sSL --retry 4 --retry-delay 2 -o "$work/blender.tar.xz" \
    "https://download.blender.org/release/$BLENDER_SERIES/blender-$BLENDER_VERSION-linux-x64.tar.xz"
  curl -sSL --retry 4 --retry-delay 2 -o "$work/checksums" \
    "https://download.blender.org/release/$BLENDER_SERIES/blender-$BLENDER_VERSION.sha256"
  expected=$(grep "blender-$BLENDER_VERSION-linux-x64.tar.xz" "$work/checksums" | cut -d' ' -f1)
  actual=$(sha256sum "$work/blender.tar.xz" | cut -d' ' -f1)
  [ "$expected" = "$actual" ] || { echo "Blender checksum mismatch: $actual != $expected" >&2; exit 1; }
  echo "checksum verified: $actual"
  mkdir -p "$BLENDER_ROOT"
  tar -xJf "$work/blender.tar.xz" -C "$BLENDER_ROOT" --strip-components=1
  rm -rf "$work"
fi
export BLENDER="$BLENDER_ROOT/blender"
"$BLENDER" --version | head -1

command -v ffmpeg >/dev/null || { echo "ffmpeg is required on the worker" >&2; exit 2; }
command -v ffprobe >/dev/null || { echo "ffprobe is required on the worker" >&2; exit 2; }

cd "$ROOT"
[ -d node_modules ] || npm ci
# Remotion needs a browser to bake the phone surfaces; it fetches its own.
export FILM_CHROME=${FILM_CHROME:-$(npx remotion browser ensure 2>/dev/null | sed -n 's/.*browser at //p' | tail -1)}
[ -n "${FILM_CHROME:-}" ] && [ -x "$FILM_CHROME" ] || { echo "no Chrome for Remotion" >&2; exit 2; }

# Baked surfaces are deterministic, so every worker rebuilds rather than syncing.
if [ ! -f blender/screens/acquisition/manifest.json ]; then
  echo "== baking phone surfaces =="
  node scripts/acquisition-bake.mjs
fi

echo "== commit =="
git rev-parse HEAD
git status --porcelain | head -5

[ "$PHASE" = "setup" ] && { echo "setup complete"; exit 0; }

echo "== render: shot=$SHOT range=${RANGE:-whole} quality=$QUALITY device=$DEVICE =="
args=(python3 scripts/acquisition-render-worker.py "$PHASE" --lane "$QUALITY" --device "$DEVICE" --blender "$BLENDER")
[ -n "$SHOT" ] && args+=(--shots "$SHOT")
[ -n "$RANGE" ] && args+=(--frames "$RANGE")
"${args[@]}"
