import * as THREE from "three";
import { PANEL_W } from "./unit";
import type { World } from "./world";

/**
 * Camera choreography: five beats, each a held composition, joined by short
 * authored moves. Nothing orbits and nothing floats; when the scroll stops the
 * frame is a still.
 *
 *   1. Your Business, from the street, the block receding behind it
 *   2. The block as a model, from above the far corner
 *   3. The offer leaves: the same elevated view, held, while the signal runs
 *   4. The camera enters the host store
 *   5. The Uptick screen, as a product
 *   →  the screen fills the frame and the page takes over
 */
export type Shot = {
  /** Progress through the pinned stage, 0–1. */
  p: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** Authored in the unit's local frame (right, up, normal) rather than world. */
  rel?: "unit";
  /** Fill the viewport width with the panel; distance is solved per aspect. */
  fill?: boolean;
};

const HERO: Pick<Shot, "pos" | "target" | "fov"> = { pos: [-15.5, 6.2, -4.6], target: [2.6, 4.6, 7.4], fov: 33 };
const MODEL: Pick<Shot, "pos" | "target" | "fov"> = { pos: [-52, 50, -36], target: [10, -2, 1], fov: 30 };
/** The lift out of the street, clear of the north row's roofs. */
const LIFT: Pick<Shot, "pos" | "target" | "fov"> = { pos: [-20, 20, -5.5], target: [2, 2, 4], fov: 31 };
const TRAVEL: Pick<Shot, "pos" | "target" | "fov"> = { pos: [-28, 11.5, 1.5], target: [6, 1.2, 1.5], fov: 33 };
const TRAVEL_END: Pick<Shot, "pos" | "target" | "fov"> = { pos: [-25, 10.8, 1], target: [5, 1.2, 1], fov: 33 };
const APPROACH: Pick<Shot, "pos" | "target" | "fov"> = { pos: [-11.2, 2.7, -0.8], target: [-8.0, 1.45, -9.4], fov: 30 };

export const STORY: Shot[] = [
  { p: 0.0, ...HERO },
  { p: 0.12, ...HERO },
  { p: 0.19, ...LIFT },
  { p: 0.27, ...MODEL },
  { p: 0.36, ...MODEL },
  { p: 0.44, ...TRAVEL },
  { p: 0.62, ...TRAVEL_END },
  { p: 0.7, ...APPROACH },
  { p: 0.78, rel: "unit", pos: [-0.9, 0.2, 1.02], target: [-0.3, -0.01, 0], fov: 24 },
  { p: 0.88, rel: "unit", pos: [-0.86, 0.19, 0.98], target: [-0.3, -0.01, 0], fov: 24 },
  { p: 1.0, rel: "unit", fill: true, pos: [0, 0, 1], target: [0, 0, 0], fov: 24 },
];

/**
 * The same beats composed for a vertical frame. These are not crops of the
 * wide shots: a phone gets its own camera.
 */
export const PORTRAIT: Record<string, Shot> = {
  hero: { p: 0, pos: [-9.5, 5.6, -0.2], target: [1.8, 4.6, 7.6], fov: 44 },
  model: { p: 0, pos: [-44, 56, -34], target: [6, -2, 0], fov: 36 },
  signal: { p: 0.56, pos: [-23, 12, 1.5], target: [4, 1, 1.5], fov: 46 },
  screen: { p: 0.83, rel: "unit", pos: [-0.5, 0.26, 1.12], target: [-0.04, -0.03, 0], fov: 30 },
  finale: { p: 0, pos: [-38, 14, 0], target: [10, 2.5, 0], fov: 44 },
};

/** The closing pass: a slow lateral drift across the finished block. */
export const FINALE: Shot[] = [
  { p: 0, pos: [-42, 14, 1.5], target: [10, 1, 0.5], fov: 34 },
  { p: 1, pos: [-38, 13, -1.5], target: [10, 1, -0.5], fov: 34 },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const DEG = Math.PI / 180;

/**
 * Shots are framed for a 16:10 viewport. Narrower than that we hold the
 * horizontal field and let the frame grow taller, spending most of the extra
 * height below the horizon — on a street the ground is the subject.
 */
const REFERENCE_ASPECT = 1.6;
function verticalFov(authored: number, aspect: number) {
  if (aspect >= REFERENCE_ASPECT) return authored;
  const halfHorizontal = Math.atan(Math.tan((authored / 2) * DEG) * REFERENCE_ASPECT);
  return (2 * Math.atan(Math.tan(halfHorizontal) / aspect)) / DEG;
}

/** Turns a unit-relative shot into world space. */
export function resolveShot(world: World, s: Shot, aspect: number): Shot {
  return resolveAll(world, [s], aspect)[0];
}

/** Turns the unit-relative shots into world-space shots for the current aspect. */
export function resolveStory(world: World, aspect: number): Shot[] {
  return resolveAll(world, STORY, aspect);
}

function resolveAll(world: World, shots: Shot[], aspect: number): Shot[] {
  const { position, right, up, normal } = world.unitFrame();
  const v = new THREE.Vector3();
  const toWorld = (o: [number, number, number]): [number, number, number] => {
    v.copy(position).addScaledVector(right, o[0]).addScaledVector(up, o[1]).addScaledVector(normal, o[2]);
    return [v.x, v.y, v.z];
  };
  return shots.map((s) => {
    if (s.rel !== "unit") return s;
    if (s.fill) {
      // Distance at which the panel spans the full viewport width (with a
      // hair of overscan so the bezel never shows at the edges).
      const halfH = Math.tan((s.fov / 2) * DEG);
      const dist = (PANEL_W * 0.5 * 1.03) / (halfH * aspect);
      return { ...s, rel: undefined, fill: undefined, pos: toWorld([0, 0, dist]), target: toWorld([0, 0, 0]) };
    }
    return { ...s, rel: undefined, pos: toWorld(s.pos), target: toWorld(s.target) };
  });
}

const scratchPos = new THREE.Vector3();
const scratchTarget = new THREE.Vector3();

/**
 * Places the camera for a progress value. With `snap` the nearest keyframe is
 * held exactly — the reduced-motion path: cuts, not moves.
 */
export function applyShot(camera: THREE.PerspectiveCamera, shots: Shot[], p: number, snap = false, exact = false) {
  if (shots.length === 1) {
    const s = shots[0];
    camera.position.set(s.pos[0], s.pos[1], s.pos[2]);
    camera.lookAt(s.target[0], s.target[1], s.target[2]);
    camera.fov = exact ? s.fov : verticalFov(s.fov, camera.aspect);
    camera.updateProjectionMatrix();
    return;
  }
  let i = 0;
  while (i < shots.length - 2 && p > shots[i + 1].p) i++;
  const a = shots[i];
  const b = shots[i + 1];
  let from = a;
  let to = b;
  let t: number;
  if (snap) {
    from = to = p < (a.p + b.p) / 2 ? a : b;
    t = 0;
  } else {
    t = easeInOut(smoothstep(a.p, b.p, p));
  }
  scratchPos.set(lerp(from.pos[0], to.pos[0], t), lerp(from.pos[1], to.pos[1], t), lerp(from.pos[2], to.pos[2], t));
  scratchTarget.set(
    lerp(from.target[0], to.target[0], t),
    lerp(from.target[1], to.target[1], t),
    lerp(from.target[2], to.target[2], t)
  );
  const authored = lerp(from.fov, to.fov, t);
  const fov = verticalFov(authored, camera.aspect);
  if (fov > authored) {
    const extra = (fov - authored) * DEG;
    const distance = scratchPos.distanceTo(scratchTarget);
    scratchTarget.y -= distance * Math.tan(extra / 2) * 0.3;
  }
  camera.position.copy(scratchPos);
  camera.lookAt(scratchTarget);
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}
