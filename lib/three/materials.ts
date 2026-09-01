import * as THREE from "three";

/**
 * Geometry cache. Everything on the block is a box or a plane keyed by its
 * dimensions, so the whole model shares a few dozen buffers.
 */
const boxCache = new Map<string, THREE.BoxGeometry>();
const planeCache = new Map<string, THREE.PlaneGeometry>();
const tracked: THREE.BufferGeometry[] = [];

export function boxGeometry(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `${w.toFixed(3)}:${h.toFixed(3)}:${d.toFixed(3)}`;
  let g = boxCache.get(key);
  if (!g) {
    g = new THREE.BoxGeometry(w, h, d);
    boxCache.set(key, g);
    tracked.push(g);
  }
  return g;
}

export function planeGeometry(w: number, h: number): THREE.PlaneGeometry {
  const key = `${w.toFixed(3)}:${h.toFixed(3)}`;
  let g = planeCache.get(key);
  if (!g) {
    g = new THREE.PlaneGeometry(w, h);
    planeCache.set(key, g);
    tracked.push(g);
  }
  return g;
}

export function trackGeometry<T extends THREE.BufferGeometry>(g: T): T {
  tracked.push(g);
  return g;
}

export function disposeGeometry() {
  tracked.forEach((g) => g.dispose());
  tracked.length = 0;
  boxCache.clear();
  planeCache.clear();
}

export type Materials = ReturnType<typeof createMaterials>;

/**
 * One material language for the whole model: chalky plaster in three close
 * tones, pale limestone for the horizontals, dark architectural bronze and
 * metal for everything that is fitted rather than built, and glass. Nothing
 * is textured — the variation is massing, rhythm and light, the way it would
 * be on a museum model.
 */
export function createMaterials() {
  const made: THREE.Material[] = [];
  const reg = <T extends THREE.Material>(m: T): T => {
    made.push(m);
    return m;
  };
  const std = (o: THREE.MeshStandardMaterialParameters) => reg(new THREE.MeshStandardMaterial(o));

  const M = {
    // --- walls -----------------------------------------------------------
    you: std({ color: 0xe9e2d3, roughness: 0.94, envMapIntensity: 0.35 }),
    ivory: std({ color: 0xd4ccbb, roughness: 0.95, envMapIntensity: 0.3 }),
    sand: std({ color: 0xc4b59d, roughness: 0.95, envMapIntensity: 0.3 }),
    stone: std({ color: 0xb2ada0, roughness: 0.92, envMapIntensity: 0.3 }),
    /** Horizontals — cornices, sills, base bands, the stall riser. */
    limestone: std({ color: 0xc9c4b6, roughness: 0.9, envMapIntensity: 0.3 }),
    roof: std({ color: 0xa9a49a, roughness: 0.98 }),

    // --- fittings --------------------------------------------------------
    bronze: std({ color: 0x4a423c, roughness: 0.6, metalness: 0.35, envMapIntensity: 0.8 }),
    metal: std({ color: 0x4a5056, roughness: 0.45, metalness: 0.6, envMapIntensity: 0.8 }),
    wood: std({ color: 0x5a3f2c, roughness: 0.7, envMapIntensity: 0.4 }),
    /** Unlit upper windows: flush dark panels with a blue-hour sheen. */
    glassDark: std({ color: 0x2b4552, roughness: 0.35, metalness: 0.2, envMapIntensity: 1.0 }),

    // --- ground ----------------------------------------------------------
    walk: std({ color: 0x9b978c, roughness: 0.96, envMapIntensity: 0.25 }),
    kerb: std({ color: 0x7c7a72, roughness: 0.94 }),
    road: std({ color: 0x24282b, roughness: 0.62, metalness: 0.08, envMapIntensity: 0.5 }),
    marking: std({ color: 0x4d4b45, roughness: 0.95 }),
    plinth: std({ color: 0x131a1f, roughness: 0.6, metalness: 0.15, envMapIntensity: 0.6 }),
    plinthTop: std({ color: 0x232a30, roughness: 0.85 }),

    // --- interiors ------------------------------------------------------
    interiorDark: std({ color: 0x5a4a3c, roughness: 0.95 }),
    interiorFloor: std({ color: 0x8b7f70, roughness: 0.9 }),
    counter: std({ color: 0x7a6552, roughness: 0.75, envMapIntensity: 0.4 }),
    counterTop: std({ color: 0xb9b3a7, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.6 }),

    // --- the screen unit --------------------------------------------------
    enclosure: std({ color: 0x14181b, roughness: 0.38, metalness: 0.55, envMapIntensity: 1.2 }),

    // --- glazing ----------------------------------------------------------
    glass: reg(
      new THREE.MeshPhysicalMaterial({
        color: 0x0c2129,
        roughness: 0.05,
        metalness: 0,
        transparent: true,
        opacity: 0.26,
        envMapIntensity: 1.2,
        depthWrite: false,
      })
    ),

    // --- emissive stand-ins (unlit on purpose: these are the light sources)
    warmCard: reg(new THREE.MeshBasicMaterial({ vertexColors: true })),
    lampHead: reg(new THREE.MeshBasicMaterial({ color: 0xffd6a0 })),
    mintLed: reg(new THREE.MeshBasicMaterial({ color: 0x6fe0c6 })),
  };

  const dispose = () => made.forEach((m) => m.dispose());
  return { ...M, dispose };
}
