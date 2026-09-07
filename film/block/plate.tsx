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
  /** Tracks are normalised 0-1; the composite scales them by the composition, never the plate. */
  basis?: string;
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

/**
 * Which lane the edit is reading.
 *
 * `proxy` plates are the same cameras, the same figures, the same timing and the same screen
 * content, rendered small and cheap so a cut can be judged in minutes instead of hours. They
 * live beside the final plates under the same names, so nothing in a composition changes:
 * every question about camera, blocking, pacing and a world crossing can be answered on the
 * proxy lane, and only a locked shot is worth a final frame.
 *
 *   REMOTION_PLATE_QUALITY=proxy npx remotion render …
 */
export const PLATE_QUALITY = process.env.REMOTION_PLATE_QUALITY === "proxy" ? "proxy" : "final";
const DIR = PLATE_QUALITY === "proxy" ? "film-rd/plates/proxy" : "film-rd/plates";
const plate = (name: string) => `${DIR}/${name}.mp4`;

export const PLATES = {
  /* the physical acts, rebuilt: one authored camera each, the product emitting from a real panel */
  approach: plate("approach"),
  threshold: plate("threshold"),
  counter: plate("counter"),
  device: plate("device"),
  coffee: plate("coffee"),
  cafe: plate("cafe"),
  scan: plate("scan"),
  morningPump: plate("morning_pump"),
  morningWalk: plate("morning_walk"),
  morningDoor: plate("morning_door"),
  rise: plate("rise"),
  /* Act I's rise, and Act V's block at dusk */
  hero1a: plate("hero1a"),
  hero3a: plate("hero3a"),
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

/**
 * One cut in an edit: the plate is on screen for `len` frames starting at `at`, and the frame
 * it opens on is the plate's own frame `head`.
 *
 * The difference matters. Placing the plate `head` frames earlier so it "starts before the cut"
 * does not skip its head — it moves the cut, and shortens the shot before it by exactly that
 * many frames. This puts the head back where it belongs: inside the shot.
 */
export function PlateCut({ src, at, len, head = 0, opacity = 1, style }: { src: string; at: number; len: number; head?: number; opacity?: number; style?: React.CSSProperties }) {
  return (
    <Sequence from={at} durationInFrames={len} layout="none">
      <Plate src={src} from={-head} frames={head + len} opacity={opacity} style={style} />
    </Sequence>
  );
}

/** Frame within a plate that starts at `from`; clamped so it never runs off the end. */
export function usePlateFrame(from: number, frames: number): number {
  const f = useCurrentFrame();
  return Math.max(0, Math.min(frames - 1, f - from));
}
