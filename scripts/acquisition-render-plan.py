#!/usr/bin/env python3
"""Turn measured per-shot cost and the decomposition into a render plan.

Reads the decomposition (which shots are one photograph) and a cost table of
measured seconds per frame, and prints what the final queue actually costs:
fresh Cycles frames, frames held from a still, single-worker time, and wall
clock once shots and frame ranges are spread over N workers.

  python3 scripts/acquisition-render-plan.py --cost costs.jsonl [--workers 1 4 8]
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'film/render/acquisition-shots.json').read_text())


def load_decomposition():
    path = ROOT / 'film/render/acquisition-decomposition.json'
    if not path.is_file():
        return {}
    return {entry['shot']: entry for entry in json.loads(path.read_text())['shots']}


def shard(costs, workers):
    """Wall clock when shots are split into per-frame units across workers.

    Frame ranges are independently renderable, so the bound is the total divided
    by the workers, never worse than the single longest indivisible unit (one
    frame) — plus one scene build per worker per shot it touches.
    """
    total = sum(costs.values())
    if workers <= 1:
        return total
    return max(total / workers, max(costs.values()) / max(1, len(costs)))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cost', required=True, help='JSONL of {shot, renderSeconds, buildSeconds}')
    parser.add_argument('--workers', nargs='+', type=int, default=[1, 4, 8, 16])
    parser.add_argument('--scale', type=float, default=1.0,
                        help='multiply measured seconds/frame, to price a cheaper lane')
    parser.add_argument('--lane-name', default='1920x1080 / 64 spp')
    args = parser.parse_args()

    measured = {}
    for line in Path(args.cost).read_text().splitlines():
        if line.strip():
            row = json.loads(line)
            measured[row['shot']] = row
    decomposition = load_decomposition()

    print(f'Lane: {args.lane_name}   (measured seconds x {args.scale:g})\n')
    header = f"{'shot':17s} {'edit':>5s} {'fresh':>6s} {'held':>5s} {'s/frame':>8s} {'render':>10s}  plan"
    print(header); print('-' * len(header))
    per_shot_seconds = {}
    total_edit = total_fresh = total_held = 0
    for shot in CONFIG['shots']:
        name = shot['id']; frames = shot['frames']
        row = measured.get(name)
        seconds = (row['renderSeconds'] * args.scale) if row else None
        entry = decomposition.get(name, {})
        still = entry.get('still')
        fresh = 2 if still else entry.get('freshCyclesFrames', frames)
        held = frames - fresh
        cost = (seconds * fresh + row['buildSeconds']) if row else 0
        per_shot_seconds[name] = cost
        total_edit += frames; total_fresh += fresh; total_held += max(0, held)
        note = entry.get('plan', 'not yet decomposed')
        print(f"{name:17s} {frames:5d} {fresh:6d} {max(0,held):5d} "
              f"{(f'{seconds:.1f}' if seconds else '?'):>8s} {cost/3600:9.2f}h  {note[:52]}")
    print('-' * len(header))
    total = sum(per_shot_seconds.values())
    print(f"{'TOTAL':17s} {total_edit:5d} {total_fresh:6d} {total_held:5d} {'':>8s} {total/3600:9.2f}h")
    print()
    naive = sum((measured[s['id']]['renderSeconds'] * args.scale * s['frames'])
                for s in CONFIG['shots'] if s['id'] in measured)
    print(f"Undecomposed (every frame re-traced): {naive/3600:.2f} h")
    print(f"Decomposed:                           {total/3600:.2f} h "
          f"({100*(1-total/naive):.0f}% less)" if naive else '')
    print()
    for workers in args.workers:
        print(f"  {workers:3d} worker(s): {shard(per_shot_seconds, workers)/3600:6.2f} h wall clock")
    frame_bytes = 1.5 * 1024 ** 2
    print(f"\nPeak transient frames per shot: {max(s['frames'] for s in CONFIG['shots'])} "
          f"x ~1.5 MB = {max(s['frames'] for s in CONFIG['shots'])*frame_bytes/1024**3:.2f} GB")
    print(f"Fresh frames written in total:  {total_fresh} x ~1.5 MB = {total_fresh*frame_bytes/1024**3:.2f} GB")


if __name__ == '__main__':
    main()
