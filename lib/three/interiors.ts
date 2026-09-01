import * as THREE from "three";
import { box, boxGeometry, trackGeometry } from "./materials";
import type { Materials } from "./materials";

export type InteriorKind =
  | "cafe"
  | "salon"
  | "fitness"
  | "market"
  | "restaurant"
  | "boutique"
  | "wellness"
  | "auto"
  | "generic"
  | "office";

type Ctx = {
  /** Clear width between the piers. */
  width: number;
  /** Depth of the recess, glass plane to rear wall. */
  depth: number;
  /** Floor-to-ceiling height of the shopfront. */
  height: number;
  M: Materials;
};

/**
 * Set dressing, not architecture. Each room is a handful of silhouettes placed
 * so the category reads through the glazing once the camera is close enough to
 * see past the reflections — an espresso machine, a styling chair, a squat
 * rack. At the wide shots they resolve into warm depth behind the glass, which
 * is exactly what they are there to do.
 *
 * Returned group is oriented so local +Z faces the street and -Z runs back
 * into the shop; callers position it on the glazing plane.
 */
export function buildInterior(kind: InteriorKind, ctx: Ctx): THREE.Group {
  const room = new THREE.Group();
  const { width: w, depth: d, height: h, M } = ctx;

  // Rear wall in a warm diffuse tone. The room's point light washes it, which
  // gives every object in front of it a silhouette to read against — the whole
  // reason these interiors survive at cinematic distance.
  const rear = box(w, h, 0.12, M.interior);
  rear.position.set(0, h / 2, -d + 0.06);
  room.add(rear);

  /** Cylinder helper — the only primitive that is not a cached box. */
  const cyl = (rt: number, rb: number, ht: number, seg: number, m: THREE.Material) =>
    new THREE.Mesh(trackGeometry(new THREE.CylinderGeometry(rt, rb, ht, seg)), m);

  const place = (mesh: THREE.Mesh, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z);
    room.add(mesh);
    return mesh;
  };

  /** A run of counter with a hard top — the spine of most of these rooms. */
  const counterRun = (cw: number, x: number, z: number, ch = 0.95) => {
    place(box(cw, ch, 0.62, M.counter), x, ch / 2, z);
    place(box(cw + 0.06, 0.07, 0.68, M.counterTop), x, ch + 0.035, z);
  };

  /** Warm strip light, the thing that actually sells "open" from the street. */
  const strip = (sw: number, x: number, z: number, y = h - 0.22) =>
    place(box(sw, 0.05, 0.16, M.warm), x, y, z);

  /** Simple pendant on a drop. */
  const pendant = (x: number, z: number, drop = 0.75) => {
    place(box(0.02, drop, 0.02, M.trim), x, h - drop / 2, z);
    const shade = cyl(0.11, 0.055, 0.16, 10, M.metal);
    place(shade, x, h - drop - 0.08, z);
    place(box(0.1, 0.02, 0.1, M.warm), x, h - drop - 0.17, z);
  };

  switch (kind) {
    case "cafe": {
      counterRun(w * 0.66, -w * 0.1, -d * 0.55);
      // Espresso machine: two-group silhouette with a chrome hopper beside it.
      const body = place(box(0.72, 0.42, 0.44, M.chrome), -w * 0.26, 1.16, -d * 0.55);
      body.castShadow = true;
      place(box(0.72, 0.1, 0.5, M.trim), -w * 0.26, 1.42, -d * 0.55);
      place(cyl(0.09, 0.09, 0.34, 10, M.trim), -w * 0.05, 1.12, -d * 0.55);
      place(cyl(0.1, 0.13, 0.24, 10, M.chrome), 0.16, 1.07, -d * 0.55);
      // Back bar with cups and a menu board above it.
      place(box(w * 0.6, 0.06, 0.28, M.trim), -w * 0.05, 1.85, -d + 0.24);
      place(box(w * 0.55, 0.14, 0.2, M.interior), -w * 0.05, 1.96, -d + 0.24);
      place(box(w * 0.42, 0.5, 0.05, M.interiorDark), w * 0.06, h - 0.75, -d + 0.14);
      pendant(-w * 0.2, -d * 0.28);
      pendant(w * 0.16, -d * 0.28);
      // Stools at the window.
      for (let i = -1; i <= 1; i++) {
        place(cyl(0.16, 0.16, 0.06, 12, M.upholstery), i * 0.62 + w * 0.18, 0.74, -0.5);
        place(cyl(0.04, 0.05, 0.72, 8, M.trim), i * 0.62 + w * 0.18, 0.36, -0.5);
      }
      strip(w * 0.62, -w * 0.05, -d + 0.4);
      break;
    }

    case "salon": {
      // Mirrors down one wall with station counters under them.
      for (let i = 0; i < 3; i++) {
        const x = -w * 0.32 + i * (w * 0.32);
        place(box(0.62, 1.1, 0.04, M.mirror), x, 1.75, -d + 0.15);
        place(box(0.72, 0.07, 0.4, M.counterTop), x, 1.02, -d + 0.3);
        place(box(0.66, 0.5, 0.34, M.counter), x, 0.75, -d + 0.3);
        // Styling chair, back to the mirror.
        const seat = place(box(0.46, 0.1, 0.46, M.upholstery), x, 0.62, -d + 0.95);
        seat.castShadow = true;
        place(box(0.44, 0.55, 0.1, M.upholstery), x, 0.92, -d + 1.16);
        place(cyl(0.07, 0.16, 0.56, 10, M.chrome), x, 0.3, -d + 0.95);
      }
      // Product shelving by the window.
      for (let s = 0; s < 3; s++) {
        place(box(w * 0.22, 0.05, 0.24, M.trim), w * 0.36, 0.9 + s * 0.42, -0.4);
        place(box(w * 0.2, 0.22, 0.16, M.interior), w * 0.36, 1.03 + s * 0.42, -0.4);
      }
      strip(w * 0.7, 0, -d * 0.5);
      break;
    }

    case "fitness": {
      // Squat rack: two uprights, a crossmember, a loaded bar.
      const rackX = -w * 0.22;
      [-0.42, 0.42].forEach((dx) => {
        const post = place(box(0.1, 2.1, 0.1, M.trim), rackX + dx, 1.05, -d * 0.62);
        post.castShadow = true;
      });
      place(box(0.94, 0.08, 0.1, M.trim), rackX, 2.05, -d * 0.62);
      place(box(1.7, 0.05, 0.05, M.chrome), rackX, 1.42, -d * 0.62 + 0.12);
      [-0.72, 0.72].forEach((dx) => {
        place(cyl(0.19, 0.19, 0.07, 14, M.rubber), rackX + dx, 1.42, -d * 0.62 + 0.12).rotation.z =
          Math.PI / 2;
      });
      // Flat bench in front of the rack.
      place(box(0.34, 0.09, 1.15, M.upholstery), rackX + 0.05, 0.5, -d * 0.32);
      [-0.42, 0.42].forEach((dz) => place(box(0.28, 0.44, 0.08, M.trim), rackX + 0.05, 0.24, -d * 0.32 + dz));
      // Dumbbell rack down the far side.
      place(box(w * 0.3, 0.07, 0.46, M.trim), w * 0.3, 0.72, -d * 0.55);
      place(box(w * 0.3, 0.07, 0.46, M.trim), w * 0.3, 0.38, -d * 0.55);
      for (let i = 0; i < 4; i++) {
        place(box(0.22, 0.14, 0.14, M.rubber), w * 0.3 - w * 0.11 + i * (w * 0.075), 0.82, -d * 0.55);
      }
      // Restrained wall mark rather than gym signage clutter.
      place(box(w * 0.3, 0.05, 0.04, M.mint), w * 0.18, h - 0.55, -d + 0.1);
      strip(w * 0.72, 0, -d * 0.45);
      break;
    }

    case "market": {
      // The camera ends up inside this room, so it is the one interior built
      // at a scale that survives close framing: real shelf bays, individually
      // sized stock, and a chiller that reads cool against the warm room.
      const bayW = w * 0.26;
      for (let bay = 0; bay < 2; bay++) {
        const bx = -w * 0.3 + bay * (w * 0.32);
        place(box(0.05, 2.1, 0.52, M.trim), bx - bayW / 2, 1.05, -d * 0.55);
        place(box(0.05, 2.1, 0.52, M.trim), bx + bayW / 2, 1.05, -d * 0.55);
        for (let s = 0; s < 4; s++) {
          const y = 0.5 + s * 0.5;
          place(box(bayW, 0.05, 0.5, M.trim), bx, y, -d * 0.55);
          // Five packs per shelf, each a different width and tone, so the run
          // reads as stock rather than as one lit panel.
          let cursor = bx - bayW / 2 + 0.05;
          for (let g = 0; g < 5; g++) {
            const gw = bayW * (0.13 + ((s + g) % 3) * 0.035);
            const gh = 0.2 + ((g + s) % 3) * 0.06;
            place(
              box(gw, gh, 0.3, M.goods[(bay * 7 + s * 3 + g) % M.goods.length]),
              cursor + gw / 2,
              y + 0.025 + gh / 2,
              -d * 0.55 + 0.06
            );
            cursor += gw + bayW * 0.025;
          }
        }
      }

      // Glass-front chiller. The one cool light in the room, so its lit back
      // panel has to sit in front of the cabinet body, not inside it.
      const coolerBody = place(box(w * 0.26, 2.05, 0.5, M.cooler), w * 0.32, 1.02, -d + 0.28);
      coolerBody.castShadow = true;
      place(box(w * 0.21, 1.6, 0.02, M.coolerLight), w * 0.32, 1.05, -d + 0.56);
      for (let s = 0; s < 3; s++) {
        place(box(w * 0.2, 0.05, 0.2, M.trim), w * 0.32, 0.5 + s * 0.52, -d + 0.6);
      }
      place(box(w * 0.22, 1.66, 0.02, M.glass), w * 0.32, 1.05, -d + 0.64);

      // Checkout counter facing the door, with a till.
      counterRun(w * 0.4, -w * 0.24, -0.72, 1.0);
      place(box(0.3, 0.22, 0.24, M.trim), -w * 0.34, 1.14, -0.72);
      place(box(0.26, 0.02, 0.18, M.coolerLight), -w * 0.34, 1.26, -0.72);
      strip(w * 0.66, 0, -d * 0.5);
      break;
    }

    case "restaurant": {
      // Booth seating one side, pass-through window at the back.
      for (let i = 0; i < 2; i++) {
        const z = -d * 0.35 - i * 1.25;
        place(box(w * 0.34, 0.08, 0.85, M.counterTop), -w * 0.24, 0.76, z);
        place(box(0.1, 0.7, 0.1, M.trim), -w * 0.24, 0.38, z);
        [-0.62, 0.62].forEach((dz) => {
          place(box(w * 0.34, 0.1, 0.42, M.upholstery), -w * 0.24, 0.46, z + dz);
          place(box(w * 0.34, 0.72, 0.1, M.upholstery), -w * 0.24, 0.85, z + dz + Math.sign(dz) * 0.2);
        });
      }
      place(box(w * 0.34, 0.5, 0.12, M.interiorDark), w * 0.28, h - 0.7, -d + 0.16);
      place(box(w * 0.32, 0.06, 0.44, M.chrome), w * 0.28, 1.12, -d + 0.34);
      place(box(w * 0.3, 0.36, 0.3, M.warm), w * 0.28, 1.5, -d + 0.2);
      pendant(-w * 0.24, -d * 0.35, 0.9);
      pendant(-w * 0.24, -d * 0.35 - 1.25, 0.9);
      break;
    }

    case "boutique": {
      // Hanging rails and a plinth of folded stock.
      [-w * 0.3, w * 0.3].forEach((x) => {
        place(cyl(0.025, 0.025, w * 0.34, 8, M.chrome), x, 1.55, -d * 0.5).rotation.z = Math.PI / 2;
        for (let i = 0; i < 5; i++) {
          place(box(0.13, 0.72, 0.26, i % 2 ? M.interior : M.upholstery), x - w * 0.13 + i * (w * 0.065), 1.16, -d * 0.5);
        }
      });
      place(box(w * 0.3, 0.5, 0.7, M.interior), 0, 0.25, -d * 0.3);
      place(box(w * 0.28, 0.12, 0.6, M.upholstery), 0, 0.56, -d * 0.3);
      counterRun(w * 0.28, w * 0.3, -d + 0.5, 0.98);
      strip(w * 0.6, 0, -d * 0.55);
      break;
    }

    case "wellness": {
      counterRun(w * 0.42, -w * 0.18, -d + 0.45, 1.05);
      // Waiting seats along the window.
      for (let i = -1; i <= 1; i++) {
        place(box(0.5, 0.1, 0.48, M.upholstery), i * 0.66 + w * 0.2, 0.44, -0.62);
        place(box(0.5, 0.5, 0.1, M.upholstery), i * 0.66 + w * 0.2, 0.72, -0.86);
      }
      place(box(w * 0.34, 0.6, 0.06, M.interiorDark), -w * 0.18, h - 0.8, -d + 0.14);
      strip(w * 0.6, 0, -d * 0.5);
      break;
    }

    case "auto": {
      // Service desk and a parts wall — read as workshop, not showroom.
      counterRun(w * 0.36, -w * 0.2, -d + 0.5, 1.05);
      for (let s = 0; s < 3; s++) {
        place(box(w * 0.34, 0.06, 0.3, M.trim), w * 0.28, 0.8 + s * 0.5, -d + 0.28);
        place(box(w * 0.3, 0.3, 0.22, M.interiorDark), w * 0.28, 0.98 + s * 0.5, -d + 0.28);
      }
      [-0.5, 0.5].forEach((dx) =>
        place(cyl(0.3, 0.3, 0.2, 16, M.rubber), w * 0.05 + dx, 0.3, -d * 0.35).rotation.x = Math.PI / 2
      );
      strip(w * 0.55, 0, -d * 0.5);
      break;
    }

    case "generic": {
      // Your Business. Deliberately category-neutral — a good counter, a wall
      // of stock, warm pendants. It should read as a well-kept small business
      // without ever telling you what it sells.
      counterRun(w * 0.46, -w * 0.16, -d * 0.5, 1.0);
      for (let s = 0; s < 4; s++) {
        place(box(w * 0.66, 0.06, 0.34, M.trim), w * 0.04, 0.72 + s * 0.52, -d + 0.24);
        place(box(w * 0.62, 0.3, 0.24, s % 2 ? M.interior : M.upholstery), w * 0.04, 0.91 + s * 0.52, -d + 0.24);
      }
      pendant(-w * 0.22, -d * 0.3, 0.7);
      pendant(w * 0.18, -d * 0.3, 0.7);
      strip(w * 0.7, 0, -d + 0.42);
      break;
    }

    default: {
      // Anonymous upper-street tenancy: a lit desk plane and nothing more.
      place(box(w * 0.7, 0.06, 0.6, M.counterTop), 0, 0.95, -d * 0.5);
      strip(w * 0.5, 0, -d * 0.5);
      break;
    }
  }

  // Cheap ambient occlusion for the room: a dark band where wall meets floor.
  const skirt = new THREE.Mesh(boxGeometry(w, 0.12, d), M.interiorDark);
  skirt.position.set(0, 0.06, -d / 2);
  room.add(skirt);

  room.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).receiveShadow = true;
  });

  return room;
}
