import * as THREE from "three";
import { buildInterior, type InteriorKind } from "./interiors";
import { MergeBucket } from "./merge";
import {
  box,
  createMaterials,
  planeGeometry,
  trackGeometry,
  type Materials,
} from "./materials";
import {
  backgroundTexture,
  counterScreenTexture,
  glowTexture,
  heroScreenTexture,
  signTexture,
} from "./textures";

/* -------------------------------------------------------------------------
   The block
   ---------------------------------------------------------------------- */

export const ROAD_HALF = 5.5;
export const WALK = 3;
export const FRONT_N = -8.5;
export const FRONT_S = 8.5;

/** Facade materials a building may be clad in. */
type SurfaceKey = "plasterLight" | "plasterYou" | "plasterMid" | "stone" | "brick";

type BuildingDef = {
  id: string;
  sign: string;
  x: number;
  w: number;
  d: number;
  h: number;
  side: "N" | "S";
  mat: SurfaceKey;
  awning?: "wood" | "metal";
  interior?: InteriorKind;
  /** Carries an Uptick screen. */
  host?: boolean;
  /** The store the camera walks into at the end of the sequence. */
  hero?: boolean;
  /** The advertiser. */
  you?: boolean;
};

const BUILDINGS: BuildingDef[] = [
  { id: "you", sign: "YOUR BUSINESS", x: -4, w: 11, d: 9, h: 9.6, side: "S", mat: "plasterYou", awning: "metal", interior: "generic", you: true },
  { id: "cafe", sign: "CAFÉ", x: 9, w: 9, d: 9, h: 8.2, side: "S", mat: "brick", awning: "wood", interior: "cafe" },
  { id: "well", sign: "WELLNESS", x: -18, w: 10, d: 9, h: 11.2, side: "S", mat: "stone", interior: "wellness" },
  { id: "conv", sign: "CONVENIENCE", x: -12, w: 12, d: 10, h: 8.6, side: "N", mat: "plasterMid", awning: "metal", interior: "market", host: true, hero: true },
  { id: "rest", sign: "RESTAURANT", x: 2, w: 11, d: 10, h: 11.6, side: "N", mat: "brick", awning: "wood", interior: "restaurant", host: true },
  { id: "salon", sign: "SALON", x: 15, w: 9, d: 9, h: 8.4, side: "N", mat: "plasterLight", interior: "salon", host: true },
  { id: "bout", sign: "BOUTIQUE", x: 26, w: 10, d: 10, h: 9.8, side: "N", mat: "stone", awning: "metal", interior: "boutique", host: true },
  { id: "gym", sign: "FITNESS", x: -26, w: 12, d: 11, h: 12.6, side: "N", mat: "stone", interior: "fitness", host: true },
  { id: "auto", sign: "AUTO SERVICE", x: 22, w: 11, d: 10, h: 7.6, side: "S", mat: "plasterMid", awning: "metal", interior: "auto" },
  { id: "far1", sign: "", x: -31, w: 9, d: 9, h: 10.4, side: "S", mat: "brick" },
  { id: "far2", sign: "", x: 37, w: 10, d: 10, h: 11.4, side: "N", mat: "plasterMid" },
  { id: "far3", sign: "", x: -40, w: 11, d: 10, h: 8.8, side: "N", mat: "stone" },
];

/** Order matters: the offer travels to these in sequence. */
export const HOSTS = ["conv", "rest", "salon", "bout", "gym"] as const;

/** Order the block builds itself in, nearest first. */
export const RISE_ORDER = ["conv", "rest", "salon", "bout", "gym", "auto", "far1", "far2", "far3"];

export type QualityTier = "high" | "medium";

export type ScreenRef = {
  id: string;
  face: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  halo: THREE.Sprite;
  idle: THREE.Texture;
  offer?: THREE.Texture;
  hero: boolean;
  group: THREE.Group;
  on?: boolean;
};

export type RouteRef = {
  id: string;
  curve: THREE.QuadraticBezierCurve3;
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  halo: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  count: number;
  haloCount: number;
};

export type LabelRef = {
  id: string;
  text: string;
  you: boolean;
  host: boolean;
  position: THREE.Vector3;
};

export type World = {
  scene: THREE.Scene;
  groups: Record<string, THREE.Group>;
  screens: ScreenRef[];
  routes: RouteRef[];
  chip: THREE.Group;
  labels: LabelRef[];
  heroGroup: THREE.Group;
  /** The glazing the camera dissolves through to enter the host store. */
  heroGlass?: { mesh: THREE.Object3D; material: THREE.MeshPhysicalMaterial };
  dispose: () => void;
};

/* -------------------------------------------------------------------------
   Assembly
   ---------------------------------------------------------------------- */

export function buildWorld(
  env: THREE.Texture,
  offerText: string,
  quality: QualityTier
): World {
  const scene = new THREE.Scene();
  scene.background = backgroundTexture();
  scene.environment = env;
  // Fog starts beyond the block itself, so the wide shot stays crisp and only
  // the far end of the street falls away into blue-hour haze. Starting it too
  // near is what greys out an establishing shot.
  scene.fog = new THREE.Fog(0x0e2731, 80, 300);

  const M = createMaterials();
  const glow = glowTexture();
  const spriteMaterials: THREE.SpriteMaterial[] = [];
  const extraGeometry: THREE.BufferGeometry[] = [];
  const lights: THREE.Light[] = [];

  const sprite = (color: number, size: number, opacity: number) => {
    const mat = new THREE.SpriteMaterial({
      map: glow,
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    spriteMaterials.push(mat);
    const s = new THREE.Sprite(mat);
    s.scale.set(size, size, 1);
    return s;
  };

  /* --- presentation plinth ------------------------------------------------
     The model is a model. It sits on a base with a visible rim, which is what
     stops the whole thing reading as a video-game street. */
  const plinthW = 108;
  const plinthD = 52;
  const plinth = box(plinthW, 6, plinthD, M.plinth);
  plinth.position.y = -3;
  scene.add(plinth);
  const rim = box(plinthW + 0.9, 0.5, plinthD + 0.9, M.plinthTop);
  rim.position.y = -0.28;
  scene.add(rim);

  /* --- ground ----------------------------------------------------------- */
  const road = box(plinthW, 0.1, ROAD_HALF * 2, M.road);
  road.position.y = 0.02;
  road.receiveShadow = true;
  scene.add(road);

  const ground = new MergeBucket();
  for (let x = -plinthW / 2 + 3; x < plinthW / 2; x += 7) {
    ground.addBox(3.2, 0.04, 0.28, M.lineWhite, x, 0.08, 0);
  }
  ([[-1, FRONT_N], [1, FRONT_S]] as const).forEach(([s, front]) => {
    const walk = box(plinthW, 0.18, WALK, M.walk);
    walk.position.set(0, 0.09, front - s * (WALK / 2));
    walk.receiveShadow = true;
    scene.add(walk);
    ground.addBox(plinthW, 0.22, 0.3, M.base, 0, 0.11, s < 0 ? -ROAD_HALF - 0.15 : ROAD_HALF + 0.15);
  });
  ground.flush(scene, { receiveShadow: true }).forEach((m) => extraGeometry.push(m.geometry));

  /* --- buildings --------------------------------------------------------- */
  const groups: Record<string, THREE.Group> = {};
  const screens: ScreenRef[] = [];
  const labels: LabelRef[] = [];
  let heroGlass: World["heroGlass"];

  const SF = 3.4; // shopfront floor-to-soffit
  const PIER = 0.95;

  BUILDINGS.forEach((b, i) => {
    const g = new THREE.Group();
    const north = b.side === "N";
    const front = north ? FRONT_N : FRONT_S;
    const cz = north ? front - b.d / 2 : front + b.d / 2;
    const faceZ = front - cz; // storefront plane, in group space
    const nz = north ? 1 : -1; // outward normal
    g.position.set(b.x, 0, cz);
    g.userData = { h: b.h, id: b.id };

    const mainMat = M[b.mat] as THREE.Material;
    const detail = new MergeBucket();
    const emissive = new MergeBucket();

    // Recess depth. Real storefronts are deep; the depth is what lets the
    // interiors read at all.
    const open = b.hero ? 4.8 : b.interior ? 3.4 : 1.6;
    const frontClear = b.hero ? 2.2 : 1.6;

    /* Ground floor is genuinely cut open: two piers plus a rear volume. */
    const upper = box(b.w, b.h - SF, b.d, mainMat);
    upper.position.y = SF + (b.h - SF) / 2;
    upper.castShadow = true;
    upper.receiveShadow = true;
    g.add(upper);

    [-1, 1].forEach((sx) => {
      const pier = box(PIER, SF, b.d, mainMat);
      pier.position.set(sx * (b.w / 2 - PIER / 2), SF / 2, 0);
      pier.castShadow = true;
      pier.receiveShadow = true;
      g.add(pier);
    });

    const rearDepth = b.d - open;
    if (rearDepth > 0.4) {
      const rear = box(b.w - PIER * 2 + 0.02, SF, rearDepth, mainMat);
      rear.position.set(0, SF / 2, north ? -b.d / 2 + rearDepth / 2 : b.d / 2 - rearDepth / 2);
      rear.receiveShadow = true;
      g.add(rear);
    }

    /* Cornice steps, parapet, roof cap — the profile that reads as architecture
       rather than an extruded rectangle. */
    detail.addBox(b.w + 0.16, 0.3, b.d + 0.16, M.base, 0, 0.15, 0);
    detail.addBox(b.w + 0.5, 0.3, b.d + 0.5, i % 3 === 0 ? M.stone : M.trim, 0, b.h + 0.06, 0);
    detail.addBox(b.w + 0.3, 0.16, b.d + 0.3, M.base, 0, b.h - 0.14, 0);
    detail.addBox(b.w + 0.2, 0.55, b.d + 0.2, mainMat, 0, b.h + 0.58, 0);
    detail.addBox(b.w + 0.1, 0.08, b.d + 0.1, M.roof, 0, b.h + 0.34, 0);
    detail.addBox(b.w + 0.22, 0.26, b.d + 0.22, M.base, 0, SF + 1.5, 0);

    const bulk = box(2.2, 1.1, 2.0, M.roof);
    bulk.position.set(-b.w * 0.22, b.h + 0.9, nz * b.d * 0.12);
    bulk.castShadow = true;
    g.add(bulk);
    const hvac = box(1.6, 0.7, 1.2, M.roof);
    hvac.position.set(b.w * 0.18, b.h + 0.75, -nz * b.d * 0.2);
    hvac.castShadow = true;
    g.add(hvac);

    /* Pilasters between bays. */
    const bays = Math.max(2, Math.round(b.w / 3.4));
    for (let q = 1; q < bays; q++) {
      detail.addBox(
        0.34,
        b.h - SF - 1.9,
        0.22,
        mainMat,
        -b.w / 2 + (b.w / bays) * q,
        SF + 1.75 + (b.h - SF - 1.9) / 2,
        faceZ + nz * 0.1
      );
    }

    /* --- shopfront ------------------------------------------------------- */
    const sfH = SF - 0.35;
    const sfW = b.w - PIER * 2;

    const floorSlab = new THREE.Mesh(planeGeometry(sfW, open), M.interior);
    floorSlab.rotation.x = -Math.PI / 2;
    floorSlab.position.set(0, 0.31, faceZ - nz * (open / 2));
    floorSlab.receiveShadow = true;
    g.add(floorSlab);

    const ceilSlab = new THREE.Mesh(planeGeometry(sfW, open), M.plasterMid);
    ceilSlab.rotation.x = Math.PI / 2;
    ceilSlab.position.set(0, SF - 0.02, faceZ - nz * (open / 2));
    g.add(ceilSlab);

    if (b.interior) {
      // Real set dressing, held back behind the counter zone.
      const room = buildInterior(b.interior, {
        width: sfW - 0.1,
        depth: open - frontClear,
        height: sfH,
        M,
      });
      room.position.set(0, 0.31, faceZ - nz * frontClear);
      room.rotation.y = north ? 0 : Math.PI;
      g.add(room);
    } else {
      // Anonymous tenancy: a warm plane is all the depth this ever needs.
      const inner = new THREE.Mesh(planeGeometry(sfW - 0.1, sfH - 0.3), M.warm);
      inner.position.set(0, 0.35 + sfH / 2, faceZ - nz * (open - 0.06));
      inner.rotation.y = north ? 0 : Math.PI;
      g.add(inner);
    }

    /* Interior light. Only the storefronts that carry the story get a real
       point light; the rest are lit by their emissive strips and the hemisphere,
       which keeps the forward-renderer light count sane. */
    if (b.sign) {
      const roomLight = new THREE.PointLight(
        b.you ? 0xffc48a : 0xffb673,
        b.you ? 13 : b.hero ? 7 : 7.5,
        16,
        2
      );
      roomLight.position.set(0, 2.1, faceZ - nz * (open * 0.5));
      g.add(roomLight);
      lights.push(roomLight);
    }

    /* Sky spilling in through the glazing. Small, but it is the only cool
       light inside these rooms — without it the close shots go entirely
       orange and the room loses its depth. */
    if (b.hero) {
      const skySpill = new THREE.PointLight(0x9fd0e4, 3.2, 9, 2);
      skySpill.position.set(0, 2.4, faceZ - nz * 0.6);
      g.add(skySpill);
      lights.push(skySpill);
    }

    /* Light spilling onto the pavement — the thing that actually separates
       one storefront from the next at a distance. */
    const pool = sprite(0xffb163, b.you ? 12 : 9, b.you ? 0.36 : 0.24);
    pool.position.set(0, 0.3, faceZ + nz * 1.6);
    g.add(pool);

    if (b.you) {
      // Your Business wins on light, not on a marker: a soft overhead wash
      // down the facade and a wider pool at the door.
      const wash = new THREE.SpotLight(0xffe4c4, 26, 26, 0.5, 0.75, 2);
      wash.position.set(0, 15, faceZ + nz * 7);
      wash.target.position.set(0, 3.4, faceZ);
      g.add(wash, wash.target);
      lights.push(wash);
    }

    /* Glazing. */
    const glassMaterial = M.glass.clone();
    const glass = new THREE.Mesh(planeGeometry(sfW, sfH), glassMaterial);
    glass.position.set(0, 0.35 + sfH / 2, faceZ + nz * 0.05);
    glass.rotation.y = north ? 0 : Math.PI;
    g.add(glass);
    if (b.hero) heroGlass = { mesh: glass, material: glassMaterial };

    const sheenMat = new THREE.MeshBasicMaterial({
      color: 0x9fd0e4,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sheen = new THREE.Mesh(planeGeometry(sfW * 0.42, sfH * 0.95), sheenMat);
    sheen.position.set(-sfW * 0.2, 0.35 + sfH / 2, faceZ + nz * 0.07);
    sheen.rotation.y = north ? 0 : Math.PI;
    g.add(sheen);

    const cols = Math.max(2, Math.round(sfW / 2.6));
    for (let c = 1; c < cols; c++) {
      detail.addBox(0.12, sfH, 0.2, M.trim, -sfW / 2 + (sfW / cols) * c, 0.35 + sfH / 2, faceZ + nz * 0.06);
    }
    detail.addBox(b.w - 1.2, 0.34, 0.55, M.trim, 0, SF + 0.12, faceZ + nz * 0.12);

    /* --- sign box -------------------------------------------------------- */
    if (b.sign) {
      const sw = Math.min(b.w - 2.2, b.sign.length * 0.62 + 1.2);
      const tex = signTexture(b.sign);
      const signMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.7,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: b.you ? 0.78 : 0.42,
      });
      const sign = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(sw, sw / 5.4, 0.18)), signMat);
      sign.position.set(0, SF + 0.95, faceZ + nz * 0.3);
      sign.rotation.y = north ? 0 : Math.PI;
      g.add(sign);
      detail.addBox(sw + 0.16, sw / 5.4 + 0.16, 0.1, M.trim, 0, SF + 0.95, faceZ + nz * 0.24);
    }

    /* --- awning ---------------------------------------------------------- */
    if (b.awning) {
      const awning = box(b.w - 1.4, 0.14, 2.0, M[b.awning] as THREE.Material);
      awning.position.set(0, SF + 0.42, faceZ + nz * 1.0);
      awning.rotation.x = -nz * 0.1;
      awning.castShadow = true;
      g.add(awning);
      detail.addBox(b.w - 1.4, 0.26, 0.06, M[b.awning] as THREE.Material, 0, SF + 0.28, faceZ + nz * 1.98);
      [-1, 1].forEach((sx) =>
        detail.addBox(0.08, 0.5, 0.08, M.trim, sx * (b.w / 2 - 1.1), SF + 0.68, faceZ + nz * 0.35)
      );
    }

    /* --- upper windows ---------------------------------------------------
       An architrave, a four-bar frame, a lintel and a projecting sill. The
       frame has to be a real surround rather than a solid panel — a solid one
       simply buries the glazing behind it and the facade goes blank. All of it
       is static trim, so it bakes into the merge bucket. */
    const rows = Math.max(1, Math.floor((b.h - SF - 2.2) / 1.9));
    const wc = Math.max(2, Math.round(b.w / 2.8));
    const OPEN_W = 1.12;
    const OPEN_H = 1.4;
    const BAR = 0.1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < wc; c++) {
        const wx = -b.w / 2 + (b.w / wc) * (c + 0.5);
        const wy = SF + 2.1 + r * 1.9;
        const lit = (i * 7 + r * 3 + c * 5) % 3 === 0;

        // Raised architrave around the opening.
        detail.addBox(OPEN_W + 0.5, OPEN_H + 0.5, 0.06, mainMat, wx, wy, faceZ + nz * 0.03);

        // Glazing, just proud of the wall so it cannot z-fight.
        emissive.addBox(
          OPEN_W,
          OPEN_H,
          0.02,
          lit ? ((r + c) % 2 ? M.warm : M.warmDim) : M.glass,
          wx,
          wy,
          faceZ + nz * 0.07
        );

        // Frame: four bars, sitting proud of the glass.
        detail.addBox(OPEN_W + BAR * 2, BAR, 0.12, M.trim, wx, wy + OPEN_H / 2, faceZ + nz * 0.1);
        detail.addBox(OPEN_W + BAR * 2, BAR, 0.12, M.trim, wx, wy - OPEN_H / 2, faceZ + nz * 0.1);
        detail.addBox(BAR, OPEN_H, 0.12, M.trim, wx - OPEN_W / 2, wy, faceZ + nz * 0.1);
        detail.addBox(BAR, OPEN_H, 0.12, M.trim, wx + OPEN_W / 2, wy, faceZ + nz * 0.1);
        // A single glazing bar, so the opening is not one blank sheet.
        detail.addBox(0.05, OPEN_H, 0.08, M.trim, wx, wy, faceZ + nz * 0.09);

        // Lintel over, sill under — the two elements that actually catch the
        // raking light and give the facade its relief.
        detail.addBox(
          OPEN_W + 0.62,
          0.16,
          0.26,
          i % 3 === 0 ? M.stone : M.base,
          wx,
          wy + OPEN_H / 2 + 0.28,
          faceZ + nz * 0.12
        );
        detail.addBox(OPEN_W + 0.42, 0.14, 0.32, mainMat, wx, wy - OPEN_H / 2 - 0.22, faceZ + nz * 0.15);
      }
    }

    detail.flush(g, { castShadow: quality === "high", receiveShadow: true }).forEach((m) =>
      extraGeometry.push(m.geometry)
    );
    emissive.flush(g).forEach((m) => extraGeometry.push(m.geometry));

    /* --- the Uptick screen on the counter -------------------------------- */
    if (b.host) {
      const unit = new THREE.Group();
      const idle = counterScreenTexture("idle");
      const faceMat = new THREE.MeshBasicMaterial({ map: idle });
      const face = new THREE.Mesh(planeGeometry(0.52, 0.3), faceMat);
      const stand = box(0.3, 0.07, 0.2, M.teal);
      stand.position.y = -0.17;
      unit.add(face, stand);
      const halo = sprite(0x6fe0c6, 2.2, 0);
      halo.position.z = -0.05;
      unit.add(halo);

      const counterZ = faceZ - nz * (b.hero ? 1.6 : 1.15);
      const counterW = b.hero ? 2.6 : 1.9;
      const counter = new THREE.Group();
      const top = box(counterW, 0.07, 0.62, M.counterTop);
      top.position.y = 0.92;
      const body = box(counterW, 0.9, 0.58, M.counter);
      body.position.y = 0.45;
      body.castShadow = true;
      counter.add(top, body);
      counter.position.set(b.hero ? 0.4 : 0, 0.31, counterZ);
      g.add(counter);

      unit.position.set((b.hero ? 0.4 : 0) - (b.hero ? 0.75 : 0.3), 1.45, faceZ - nz * (b.hero ? 1.45 : 1.0));
      unit.rotation.y = north ? 0.06 : Math.PI - 0.06;
      g.add(unit);

      screens.push({
        id: b.id,
        face: face as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>,
        halo,
        idle,
        hero: !!b.hero,
        group: unit,
      });

      const warmL = new THREE.PointLight(0xffb972, b.hero ? 3.2 : 2.6, 12, 2);
      warmL.position.set(0, 2.1, faceZ - nz * 2.4);
      g.add(warmL);
      lights.push(warmL);
    }

    groups[b.id] = g;
    scene.add(g);

    if (b.sign) {
      labels.push({
        id: b.id,
        text: b.sign,
        you: !!b.you,
        host: !!b.host,
        position: new THREE.Vector3(b.x, b.h + 1.6, cz),
      });
    }
  });

  /* --- street furniture ---------------------------------------------------
     Every lamp, bollard and tree grate on the block bakes into three meshes. */
  const street = new MergeBucket();
  const streetWarm = new MergeBucket();
  const treeGroup = new THREE.Group();
  scene.add(treeGroup);

  for (let x = -46; x <= 46; x += 11.5) {
    ([[-1, FRONT_N], [1, FRONT_S]] as const).forEach(([s, front]) => {
      const lx = x + (s > 0 ? 4 : 5.5);
      const lz = front - s * (WALK - 0.9);

      // Slim luminaire on a tapered pole with a short outreach arm.
      const pole = new THREE.Mesh(
        trackGeometry(new THREE.CylinderGeometry(0.09, 0.12, 5.4, 8)),
        M.trim
      );
      pole.position.set(lx, 0.18 + 2.7, lz);
      pole.castShadow = quality === "high";
      scene.add(pole);
      street.addBox(1.5, 0.1, 0.12, M.trim, lx - s * 0.7, 0.18 + 5.3, lz);
      street.addBox(0.52, 0.12, 0.26, M.trim, lx - s * 1.4, 0.18 + 5.24, lz);
      streetWarm.addBox(0.16, 0.05, 0.16, M.warm, lx - s * 1.4, 0.18 + 5.14, lz);

      const halo = sprite(0xffc07a, 3.4, 0.42);
      halo.position.set(lx - s * 1.4, 0.18 + 5.14, lz);
      scene.add(halo);

      street.addBox(0.26, 0.8, 0.26, M.trim, x + 2.4, 0.55, front - s * (WALK - 0.4));

      if (Math.round(x) % 23 === 0 && Math.abs(x + 18.2) > 9) {
        const tx = x + 6.2;
        const tz = front - s * (WALK - 1.4);
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(
          trackGeometry(new THREE.CylinderGeometry(0.11, 0.19, 2.9, 8)),
          M.trunk
        );
        trunk.position.y = 1.45;
        trunk.castShadow = quality === "high";
        tree.add(trunk);

        // Real branching, then a canopy built from overlapping masses rather
        // than one sphere.
        ([[0.35, 3.1, 0.5], [-0.3, 3.4, -0.4], [0.1, 3.7, 0.5]] as const).forEach(([dx, y, dz]) => {
          const br = new THREE.Mesh(
            trackGeometry(new THREE.CylinderGeometry(0.05, 0.08, 1.3, 6)),
            M.trunk
          );
          br.position.set(dx * 0.6, y, dz * 0.6);
          br.rotation.set(dz * 0.5, 0, -dx * 0.55);
          tree.add(br);
        });
        ([
          [0, 4.15, 0.6, 0], [0.62, 3.95, 0.46, 0.22], [-0.58, 4.05, 0.44, -0.2],
          [0.2, 4.7, 0.44, -0.34], [-0.3, 4.55, 0.42, 0.3], [0.4, 4.35, 0.4, -0.5],
          [-0.15, 3.85, 0.5, 0.5],
        ] as const).forEach(([dx, y, r, dz], k) => {
          const cn = new THREE.Mesh(trackGeometry(new THREE.SphereGeometry(r, 10, 8)), M.canopy);
          cn.position.set(dx, y, dz);
          cn.scale.set(1.15, 0.92, 1.1);
          cn.rotation.set(k * 0.37, k * 1.1, k * 0.21);
          cn.castShadow = quality === "high";
          tree.add(cn);
        });
        tree.position.set(tx, 0.18, tz);
        tree.rotation.y = (x % 7) * 0.4;
        treeGroup.add(tree);
        street.addBox(1.5, 0.06, 1.5, M.trim, tx, 0.2, tz);
      }
    });
  }
  street.flush(scene, { castShadow: false, receiveShadow: true }).forEach((m) =>
    extraGeometry.push(m.geometry)
  );
  streetWarm.flush(scene).forEach((m) => extraGeometry.push(m.geometry));

  /* --- offer travel -------------------------------------------------------
     Thin, warm and translucent. This is a pulse of commercial activity moving
     through a physical model, not a routing diagram. */
  const doorOf = (id: string) => {
    const b = BUILDINGS.find((v) => v.id === id)!;
    return new THREE.Vector3(b.x, 1.2, b.side === "N" ? FRONT_N + 1.1 : FRONT_S - 1.1);
  };
  const origin = doorOf("you");
  const routes: RouteRef[] = HOSTS.map((id) => {
    const end = doorOf(id);
    const mid = origin.clone().add(end).multiplyScalar(0.5);
    mid.y = 6.5 + Math.abs(end.x - origin.x) * 0.09;
    const curve = new THREE.QuadraticBezierCurve3(origin.clone(), mid, end);

    const geo = trackGeometry(new THREE.TubeGeometry(curve, 150, 0.034, 8, false));
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0xf6cf9a, transparent: true, opacity: 0.6 })
    );
    mesh.geometry.setDrawRange(0, 0);

    const haloGeo = trackGeometry(new THREE.TubeGeometry(curve, 150, 0.17, 8, false));
    const halo = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({
        color: 0xe8a24a,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    halo.geometry.setDrawRange(0, 0);

    scene.add(mesh, halo);
    return {
      id,
      curve,
      mesh: mesh as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>,
      halo: halo as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>,
      count: geo.index!.count,
      haloCount: haloGeo.index!.count,
    };
  });

  const chip = new THREE.Group();
  const chipCore = new THREE.Mesh(
    trackGeometry(new THREE.SphereGeometry(0.085, 12, 10)),
    new THREE.MeshBasicMaterial({ color: 0xffe6c2 })
  );
  chip.add(chipCore, sprite(0xf0b878, 1.5, 0.7));
  chip.visible = false;
  scene.add(chip);

  /* --- the hero 21" unit --------------------------------------------------
     The one object the camera gets close enough to inspect, so it is the one
     object modelled with a real extruded profile and a rounded bezel. */
  const heroGroup = buildHeroUnit(M, offerText, sprite);
  const conv = BUILDINGS.find((b) => b.id === "conv")!;
  const convFaceZ = conv.d / 2; // storefront plane, in the conv group's space
  // Sits on the counter top: recess floor (0.31) + counter height (0.92).
  heroGroup.position.set(-0.35, 1.235, convFaceZ - 1.5);
  heroGroup.rotation.y = 0.1;
  groups.conv.add(heroGroup);
  // The generic host plate stands down for the store we walk into.
  const heroPlate = screens.find((s) => s.hero);
  if (heroPlate) heroPlate.group.visible = false;

  /* --- lighting -----------------------------------------------------------
     Cool ambient environment, one cold key from behind, warm bounce from the
     shopfronts. Dark values are lifted so shadow reads as blue-hour shadow. */
  const ambient = new THREE.AmbientLight(0x2b4b58, 0.3);
  const hemi = new THREE.HemisphereLight(0x3d84a4, 0x101c20, 0.66);
  scene.add(ambient, hemi);
  lights.push(ambient, hemi);

  const moon = new THREE.DirectionalLight(0xb6dcef, 1.25);
  moon.position.set(-38, 34, -26);
  moon.castShadow = true;
  moon.shadow.mapSize.set(quality === "high" ? 2048 : 1024, quality === "high" ? 2048 : 1024);
  const sc = moon.shadow.camera;
  sc.left = -62;
  sc.right = 62;
  sc.top = 46;
  sc.bottom = -46;
  sc.near = 1;
  sc.far = 170;
  moon.shadow.bias = -0.0006;
  moon.shadow.normalBias = 0.04;
  scene.add(moon);
  lights.push(moon);

  const fill = new THREE.DirectionalLight(0xffb27a, 0.35);
  fill.position.set(30, 12, 40);
  // Cold rim from behind the block, so the far facades keep a lit edge
  // against the fog instead of dissolving into it.
  const rimLight = new THREE.DirectionalLight(0x86c4dd, 0.42);
  rimLight.position.set(20, 8, -46);
  scene.add(fill, rimLight);
  lights.push(fill, rimLight);

  // Tight, low key on the unit itself. Any hotter and the counter behind it
  // blows out and the screen stops being the brightest thing in frame.
  const heroSpot = new THREE.SpotLight(0xffc79a, 8, 8, 0.7, 0.5, 2);
  heroSpot.position.set(conv.x - 0.1, 3.1, FRONT_N - conv.d / 2 + 1.4);
  heroSpot.target.position.set(conv.x - 0.35, 1.35, FRONT_N - 1.5);
  heroSpot.castShadow = quality === "high";
  heroSpot.shadow.mapSize.set(1024, 1024);
  scene.add(heroSpot, heroSpot.target);
  lights.push(heroSpot);

  const dispose = () => {
    M.dispose();
    spriteMaterials.forEach((m) => m.dispose());
    extraGeometry.forEach((g) => g.dispose());
    routes.forEach((r) => {
      r.mesh.material.dispose();
      r.halo.material.dispose();
    });
    screens.forEach((s) => s.face.material.dispose());
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    lights.forEach((l) => l.dispose?.());
  };

  return { scene, groups, screens, routes, chip, labels, heroGroup, heroGlass, dispose };
}

/* -------------------------------------------------------------------------
   The 21" host unit
   ---------------------------------------------------------------------- */

function buildHeroUnit(
  M: Materials,
  offerText: string,
  sprite: (color: number, size: number, opacity: number) => THREE.Sprite
): THREE.Group {
  const group = new THREE.Group();

  const roundedRect = (w: number, h: number, r: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  };

  // Wedge base, drawn as a profile and extruded — a real product silhouette
  // rather than a rotated box.
  const prof = new THREE.Shape();
  const D = 0.2;
  const hB = 0.058;
  const hF = 0.014;
  prof.moveTo(-D / 2, 0);
  prof.lineTo(D / 2, 0);
  prof.lineTo(D / 2, hB);
  prof.lineTo(-D / 2 + 0.012, hF);
  prof.quadraticCurveTo(-D / 2, hF, -D / 2, hF - 0.006);
  prof.lineTo(-D / 2, 0.004);
  prof.closePath();

  const W = 0.27;
  const wedge = trackGeometry(
    new THREE.ExtrudeGeometry(prof, {
      depth: W,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 3,
      curveSegments: 8,
    })
  );
  wedge.rotateY(Math.PI / 2);
  wedge.translate(-W / 2, 0, 0);
  const base = new THREE.Mesh(wedge, M.teal);
  base.castShadow = true;
  group.add(base);

  const display = new THREE.Group();
  const encW = 0.492;
  const encH = 0.3;
  const encT = 0.03;

  const enc = trackGeometry(
    new THREE.ExtrudeGeometry(roundedRect(encW, encH, 0.02), {
      depth: encT,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 4,
      curveSegments: 12,
    })
  );
  enc.translate(0, encH / 2, -encT);
  const enclosure = new THREE.Mesh(enc, M.teal);
  enclosure.castShadow = true;
  display.add(enclosure);

  const glassGeo = trackGeometry(
    new THREE.ExtrudeGeometry(roundedRect(encW - 0.012, encH - 0.012, 0.016), {
      depth: 0.0025,
      bevelEnabled: false,
      curveSegments: 12,
    })
  );
  glassGeo.translate(0, encH / 2, 0.0045);
  display.add(
    new THREE.Mesh(
      glassGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0x05100f,
        roughness: 0.04,
        metalness: 0,
        transparent: true,
        opacity: 0.5,
        envMapIntensity: 2.2,
        clearcoat: 1,
      })
    )
  );

  const panel = new THREE.Mesh(
    planeGeometry(0.465, 0.2615),
    new THREE.MeshBasicMaterial({ map: heroScreenTexture(offerText) })
  );
  panel.position.set(0, encH / 2, 0.0075);
  display.add(panel);

  const chin = box(0.05, 0.0022, 0.001, M.mint);
  chin.position.set(0, 0.011, 0.0076);
  display.add(chin);

  display.position.set(0, 0.026, 0.02);
  display.rotation.x = -0.14;
  group.add(display);

  const spill = sprite(0xffb972, 1.5, 0.35);
  spill.position.set(0, 0.18, 0.12);
  group.add(spill);

  return group;
}
