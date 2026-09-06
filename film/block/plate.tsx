import { OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../tokens";

/**
 * A Blender plate: a rendered image sequence, encoded to MP4, composited
 * under the Direction 1 / phone layers. Tracks are exported by Blender
 * alongside the plate (blender/exports/<shot>.json): per-frame 2D positions
 * of named points in the world, so DOM objects can sit on physical things.
 */
export type TrackData = {
  fps: number;
  frames: number;
  width: number;
  height: number;
  tracks: Record<string, [number, number, number][]>;
  events: { frame: number; kind: string; who: string; lot: string }[];
  meta: Record<string, unknown>;
};

export type Pt = { x: number; y: number; depth: number };

export function trackAt(data: TrackData, name: string, plateFrame: number): Pt {
  const t = data.tracks[name];
  if (!t) return { x: WIDTH / 2, y: HEIGHT / 2, depth: 0 };
  const i = Math.max(0, Math.min(t.length - 1, Math.round(plateFrame)));
  const [u, v, depth] = t[i];
  return { x: u * WIDTH, y: v * HEIGHT, depth };
}

/** A linear blend between two tracked points along their segment. */
export function alongTrack(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, depth: a.depth + (b.depth - a.depth) * t };
}

/** The four corners of a tracked quad (tl, tr, br, bl). */
export function quadAt(data: TrackData, prefix: string, plateFrame: number): [Pt, Pt, Pt, Pt] {
  return [trackAt(data, `${prefix}_tl`, plateFrame), trackAt(data, `${prefix}_tr`, plateFrame), trackAt(data, `${prefix}_br`, plateFrame), trackAt(data, `${prefix}_bl`, plateFrame)];
}

export const PLATES = {
  hero1: "film-rd/plates/hero1.mp4",
  hero3a: "film-rd/plates/hero3a.mp4",
  hero3b: "film-rd/plates/hero3b.mp4",
  hero5: "film-rd/plates/hero5.mp4",
} as const;

/**
 * The plate itself, placed at `from` in the composition timeline. The video
 * fills the frame; a plate rendered at 1280×720 is scaled to 1920×1080.
 */
export function Plate({ src, from, frames, opacity = 1, scale = 1, style }: { src: string; from: number; frames: number; opacity?: number; scale?: number; style?: React.CSSProperties }) {
  return (
    <Sequence from={from} durationInFrames={frames} layout="none">
      <div style={{ position: "absolute", inset: 0, opacity, transform: `scale(${scale})`, transformOrigin: "50% 50%", ...style }}>
        <OffthreadVideo src={staticFile(src)} muted style={{ width: WIDTH, height: HEIGHT, objectFit: "cover", display: "block" }} />
      </div>
    </Sequence>
  );
}

/** Frame within a plate that starts at `from`; clamped so it never runs off the end. */
export function usePlateFrame(from: number, frames: number): number {
  const f = useCurrentFrame();
  return Math.max(0, Math.min(frames - 1, f - from));
}
