#!/usr/bin/env bash
# A proof cut: a range of the assembled film, rendered in motion, then read as stills.
#
#   scripts/film-proof.sh <name> <first> <last> [every]
#
# The physical layer is not frozen until three of these pass (film/review/PROOF.md):
# the café panel → the scan → the relationship; Joe's threshold → the phone →
# the redemption → the coffee; the physical morning → the editorial 21. Each one
# is judged in motion first and then frame by frame, because a cut can hide what a
# still cannot.
set -e
cd "$(dirname "$0")/.."
export FILM_CHROME=${FILM_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
name=$1; a=$2; b=$3; every=${4:-6}
OUT=film/review/proof
mkdir -p "$OUT"
echo "== proof $name · film frames $a–$b ($(python3 -c "print(f'{($b-$a+1)/24:.2f}')") s)"
# one worker, and well back in the queue: the plate render is the critical path and this must not slow it
nice -n 15 npx remotion render film/index.ts Film "$OUT/$name.mp4" --frames="$a-$b" --codec=h264 --crf=16 --concurrency=1 --log=error
python3 scripts/film-review.py "$name" --mp4 "$OUT/$name.mp4" --every "$every" --per-sheet 9 --out "$OUT/$name"
