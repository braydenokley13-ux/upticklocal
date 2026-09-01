import * as THREE from "three";

/**
 * Camera choreography.
 *
 * Every shot answers a question the visitor has at that moment, in order:
 * where are we → which one is mine → who else is on this block → where does
 * the offer go → which screen is showing it → what does the customer see.
 * There is no orbiting and no movement that is not doing that work.
 */
export type Shot = {
  /** Scroll progress through the pinned stage, 0–1. */
  p: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** Used by the reduced-motion path and for authoring clarity. */
  note: string;
};

export const SHOTS: Shot[] = [
  { p: 0.0, pos: [17, 10, -23], target: [-4, 4.4, 8], fov: 32, note: "The block, from above the far corner" },
  { p: 0.11, pos: [10, 7.5, -18], target: [-4, 4.0, 8], fov: 32, note: "Down onto Your Business" },
  // Down the street, not over it. From overhead a block is a set of roofs, and
  // from across it the near row hides the far one — the storefronts on both
  // sides are the argument of this chapter, so the camera sits in the roadway
  // and lets the street recede.
  // Raking along the host row rather than across the roadway. These are the
  // storefronts that will carry the offer, so the shot is a run of lit
  // shopfronts and counters, not a view of the tarmac between them.
  { p: 0.23, pos: [-30, 9, 6], target: [-6, 3.8, -6], fov: 33, note: "The neighbours arrive" },
  { p: 0.34, pos: [-58, 15, 3], target: [12, 3.2, 0], fov: 34, note: "The whole block as one network" },
  { p: 0.46, pos: [-17, 5.2, -3.5], target: [-5, 4.4, 8], fov: 30, note: "Street level, the offer leaves" },
  { p: 0.58, pos: [-33, 12, 2], target: [-6, 4.2, -2], fov: 34, note: "The offer travels the block" },
  { p: 0.71, pos: [-12.4, 4.8, 7.5], target: [-12.4, 2.3, -8.6], fov: 30, note: "Approaching the host store" },
  { p: 0.83, pos: [-12.5, 3.4, 1.0], target: [-12.5, 2.1, -9.2], fov: 31, note: "Through the glazing" },
  { p: 0.93, pos: [-12.5, 1.9, -7.4], target: [-12.5, 1.45, -10.2], fov: 29, note: "At the counter" },
  // Close enough that the panel carries roughly two thirds of the frame width;
  // any further back and the shelving behind it takes the shot.
  { p: 1.0, pos: [-12.5, 1.5, -9.17], target: [-12.52, 1.4, -10.1], fov: 30, note: "The screen, full frame" },
];

/** The closing pass: a slow lateral drift back across the finished block. */
export const FINALE_SHOTS: Shot[] = [
  { p: 0, pos: [-27, 6.5, 3.5], target: [-7, 3.6, -7], fov: 33, note: "Finale, entering the block" },
  { p: 1, pos: [7, 6.5, 3.5], target: [27, 3.6, -7], fov: 33, note: "Finale, leaving the block" },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const scratchPos = new THREE.Vector3();
const scratchTarget = new THREE.Vector3();

/**
 * Places the camera for a given progress value.
 *
 * `snap` is the reduced-motion path: instead of easing between shots we hold
 * the nearest one exactly. The visitor still gets all ten compositions, they
 * just arrive as cuts rather than as moves.
 */
/**
 * Shots are framed for a wide viewport. On a narrower one a fixed vertical FOV
 * quietly crops the block at the sides, so instead we hold the horizontal
 * field and let the frame grow taller — and spend nearly all of that extra
 * height below the horizon, because on a street the ground is the subject and
 * the sky is not.
 */
const REFERENCE_ASPECT = 1.6;
const DEG = Math.PI / 180;

function verticalFov(authored: number, aspect: number) {
  if (aspect >= REFERENCE_ASPECT) return authored;
  const halfHorizontal = Math.atan(Math.tan((authored / 2) * DEG) * REFERENCE_ASPECT);
  return (2 * Math.atan(Math.tan(halfHorizontal) / aspect)) / DEG;
}

export function applyShot(
  camera: THREE.PerspectiveCamera,
  shots: Shot[],
  p: number,
  opts: { snap?: boolean; breathe?: number; time?: number } = {}
) {
  let i = 0;
  while (i < shots.length - 2 && p > shots[i + 1].p) i++;
  const a = shots[i];
  const b = shots[i + 1];

  let from = a;
  let t: number;

  if (opts.snap) {
    // Nearest keyframe wins; the camera never sits between two compositions.
    const mid = (a.p + b.p) / 2;
    from = p < mid ? a : b;
    t = 0;
  } else {
    t = easeInOutCubic(smoothstep(a.p, b.p, p));
  }

  const to = opts.snap ? from : b;
  scratchPos.set(
    lerp(from.pos[0], to.pos[0], t),
    lerp(from.pos[1], to.pos[1], t),
    lerp(from.pos[2], to.pos[2], t)
  );
  scratchTarget.set(
    lerp(from.target[0], to.target[0], t),
    lerp(from.target[1], to.target[1], t),
    lerp(from.target[2], to.target[2], t)
  );

  const breathe = opts.breathe ?? 0;
  if (breathe > 0) {
    const time = opts.time ?? 0;
    // A hand-held float, small enough to read as life rather than drift.
    scratchPos.y += Math.sin(time * 0.32) * breathe;
    scratchPos.x += Math.cos(time * 0.24) * breathe * 1.4;
  }

  const authored = lerp(from.fov, to.fov, t);
  const fov = verticalFov(authored, camera.aspect);

  // Push the added coverage downward so a tall viewport gains street, not sky.
  if (fov > authored) {
    const extra = (fov - authored) * DEG;
    const distance = scratchPos.distanceTo(scratchTarget);
    // 0 would split the extra coverage evenly; 1 would put all of it below.
    // A third biases towards the ground without dropping the subject out of
    // the upper half of frame.
    scratchTarget.y -= distance * Math.tan(extra / 2) * 0.35;
  }

  camera.position.copy(scratchPos);
  camera.lookAt(scratchTarget);

  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}
