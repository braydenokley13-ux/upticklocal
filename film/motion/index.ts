import { Easing, interpolate } from "remotion";
import { FPS } from "../tokens";

/** The one plane bezier. Every tilt, every slide, every settle. */
export const PLANE = Easing.bezier(0.7, 0, 0.2, 1);
/** Softer for arrivals, ease-in cubic for collapses. */
export const OUT = Easing.bezier(0.2, 0.7, 0.2, 1);
export const IN = Easing.bezier(0.55, 0, 1, 0.45);

/** 76 beats per minute. */
export const BPM = 76;
export const BEAT = (60 / BPM) * FPS; // frames per beat (24 fps → 18.95)

export const sec = (s: number) => Math.round(s * FPS);
export const beats = (n: number) => Math.round(n * BEAT);

/** 0→1 over [start, start+dur] frames, eased, clamped. */
export function ramp(frame: number, start: number, dur: number, easing: (t: number) => number = PLANE): number {
  if (dur <= 0) return frame >= start ? 1 : 0;
  return interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

/** A hold that rises and falls: in over `inDur`, holds, out over `outDur`. */
export function window(frame: number, start: number, end: number, inDur: number, outDur: number, easing = PLANE): number {
  const a = ramp(frame, start, inDur, easing);
  const b = 1 - ramp(frame, end - outDur, outDur, easing);
  return Math.min(a, b);
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** Word-by-word typesetting: index of the last visible word at `frame`. */
export function typeset(frame: number, start: number, count: number, perWord: number): number {
  if (frame < start) return -1;
  return Math.min(count - 1, Math.floor((frame - start) / perWord));
}

/** Character-level typing. Returns how many characters are visible. */
export function typed(frame: number, start: number, length: number, perChar: number, pauses: Record<number, number> = {}): number {
  if (frame < start) return 0;
  let f = start;
  for (let i = 0; i < length; i++) {
    f += perChar + (pauses[i] ?? 0);
    if (frame < f) return i;
  }
  return length;
}
