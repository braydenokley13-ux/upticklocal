import * as THREE from "three";
import { patternTexture, type PatternKind } from "./textures";

/**
 * Geometry cache. The block puts ~1,400 boxes on screen and most of them are
 * repeats — window reveals, sills, mullions, shelves. Keying by dimensions
 * collapses that to a few dozen buffers.
 */
const boxCache = new Map<string, THREE.BoxGeometry>();
const planeCache = new Map<string, THREE.PlaneGeometry>();
const geometries: THREE.BufferGeometry[] = [];

export function boxGeometry(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `${w.toFixed(3)}:${h.toFixed(3)}:${d.toFixed(3)}`;
  let g = boxCache.get(key);
  if (!g) {
    g = new THREE.BoxGeometry(w, h, d);
    boxCache.set(key, g);
    geometries.push(g);
  }
  return g;
}

export function planeGeometry(w: number, h: number): THREE.PlaneGeometry {
  const key = `${w.toFixed(3)}:${h.toFixed(3)}`;
  let g = planeCache.get(key);
  if (!g) {
    g = new THREE.PlaneGeometry(w, h);
    planeCache.set(key, g);
    geometries.push(g);
  }
  return g;
}

/** Convenience: a cached box under a shared material. */
export function box(w: number, h: number, d: number, m: THREE.Material): THREE.Mesh {
  return new THREE.Mesh(boxGeometry(w, h, d), m);
}

export function trackGeometry<T extends THREE.BufferGeometry>(g: T): T {
  geometries.push(g);
  return g;
}

export function disposeGeometry() {
  geometries.forEach((g) => g.dispose());
  geometries.length = 0;
  boxCache.clear();
  planeCache.clear();
}

export type Materials = ReturnType<typeof createMaterials>;

/**
 * One palette for the whole block. Dark values are deliberately lifted: at
 * blue hour the shadow side of a building is still lit by a large blue sky,
 * so nothing here bottoms out at black.
 */
export function createMaterials() {
  const made: THREE.Material[] = [];
  const reg = <T extends THREE.Material>(m: T): T => {
    made.push(m);
    return m;
  };

  const std = (o: THREE.MeshStandardMaterialParameters) =>
    reg(new THREE.MeshStandardMaterial(o));

  const surf = (
    color: number,
    kind: PatternKind,
    rx: number,
    ry: number,
    roughness: number,
    bumpScale: number
  ) =>
    std({
      color,
      roughness,
      map: patternTexture(kind, rx, ry),
      bumpMap: patternTexture(kind, rx, ry),
      bumpScale,
    });

  const M = {
    // --- facades -----------------------------------------------------------
    plasterLight: surf(0xcbc4b4, "plaster", 5, 5, 0.92, 0.05),
    /** Your Business reads lighter than its neighbours before any light hits it. */
    plasterYou: surf(0xdcd5c4, "plaster", 5, 5, 0.88, 0.05),
    plasterMid: surf(0xa6a193, "plaster", 5, 5, 0.94, 0.05),
    stone: surf(0x8e8b81, "stone", 5, 5, 0.86, 0.07),
    brick: surf(0x7a5f52, "brick", 6, 6, 0.9, 0.09),
    base: surf(0x494741, "stone", 3, 1.2, 0.84, 0.05),

    // --- ground ------------------------------------------------------------
    walk: surf(0x585c60, "pave", 36, 1, 0.93, 0.06),
    road: std({
      color: 0x22282b,
      roughness: 0.52,
      metalness: 0.1,
      map: patternTexture("asphalt", 26, 2),
      bumpMap: patternTexture("asphalt", 26, 2),
      bumpScale: 0.03,
      envMapIntensity: 0.55,
    }),
    lineWhite: std({ color: 0xb9b1a1, roughness: 0.9 }),

    // --- the presentation plinth the model sits on -------------------------
    plinth: std({ color: 0x0c1417, roughness: 0.7, metalness: 0.1 }),
    plinthTop: std({ color: 0x1b2529, roughness: 0.9 }),

    // --- trim & fittings ---------------------------------------------------
    wood: std({ color: 0x6a4f3a, roughness: 0.78 }),
    metal: std({ color: 0x555f63, roughness: 0.34, metalness: 0.85 }),
    trim: std({ color: 0x3b4347, roughness: 0.42, metalness: 0.6 }),
    roof: std({ color: 0x343a3d, roughness: 0.96 }),
    teal: std({ color: 0x15353a, roughness: 0.5, metalness: 0.3 }),

    glass: reg(
      new THREE.MeshPhysicalMaterial({
        color: 0x0b1f24,
        roughness: 0.06,
        metalness: 0,
        transparent: true,
        opacity: 0.3,
        envMapIntensity: 1.1,
      })
    ),

    // --- emissive stand-ins (unlit on purpose — these are light sources) ----
    warm: reg(new THREE.MeshBasicMaterial({ color: 0xffc888 })),
    warmDim: reg(new THREE.MeshBasicMaterial({ color: 0xd39a5f })),
    mint: reg(new THREE.MeshBasicMaterial({ color: 0x6fe0c6 })),

    // --- planting ----------------------------------------------------------
    canopy: std({ color: 0x2c3a31, roughness: 1 }),
    trunk: std({ color: 0x2b2721, roughness: 1 }),

    // --- interiors ---------------------------------------------------------
    counter: std({ color: 0x8a6a4b, roughness: 0.72 }),
    counterTop: std({ color: 0x2a3033, roughness: 0.35, metalness: 0.3 }),
    interior: std({ color: 0x8d8172, roughness: 0.96 }),
    interiorDark: std({ color: 0x4a453d, roughness: 0.9 }),
    chrome: std({ color: 0x9aa3a6, roughness: 0.22, metalness: 0.9 }),
    mirror: std({ color: 0x6f8590, roughness: 0.12, metalness: 0.7, envMapIntensity: 1.6 }),
    upholstery: std({ color: 0x3a3f43, roughness: 0.86 }),
    cooler: std({ color: 0x1d3b42, roughness: 0.2, metalness: 0.35 }),
    /** Chiller interior — cool, so the store is not monochrome warm. */
    coolerLight: reg(new THREE.MeshBasicMaterial({ color: 0x9fd8dc })),
    rubber: std({ color: 0x22262a, roughness: 0.95 }),

    /**
     * Packaged goods. Muted and varied on purpose: one flat tone across a
     * whole shelf reads as a backlit panel, four quiet ones read as stock.
     */
    goods: [
      std({ color: 0x6b4a3e, roughness: 0.9 }),
      std({ color: 0x4a5560, roughness: 0.88 }),
      std({ color: 0x7d6f57, roughness: 0.92 }),
      std({ color: 0x53604a, roughness: 0.9 }),
      std({ color: 0x8a5a4a, roughness: 0.88 }),
    ] as THREE.MeshStandardMaterial[],
  };

  const dispose = () => made.forEach((m) => m.dispose());
  return { ...M, dispose };
}
