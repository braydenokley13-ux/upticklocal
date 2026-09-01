import * as THREE from "three";
import { MergeBucket } from "./merge";
import { boxGeometry, createMaterials, planeGeometry, trackGeometry, type Materials } from "./materials";
import { glowTexture, interiorTexture, poolTexture, signTexture, waveTexture } from "./textures";
import { buildUnit, PANEL_H, type Unit } from "./unit";
import { smoothstep } from "./shots";

/* -------------------------------------------------------------------------
   The block. One street, two rows of buildings, on a plinth.
   ---------------------------------------------------------------------- */

export const ROAD_HALF = 4.5;
export const WALK = 2.6;
export const FRONT = ROAD_HALF + WALK; // storefront line, either side
const SF = 3.7; // ground storey, floor to the top of the fascia
const FLOOR_H = 3.05; // upper storeys
const PIER = 0.72;
const BASE = 0.45; // stall riser / base band
const PLINTH_W = 96;
const PLINTH_D = 40;

type Tone = "you" | "ivory" | "sand" | "stone";

type BuildingDef = {
  id: string;
  sign: string;
  w: number;
  d: number;
  /** Upper storeys above the shopfront. */
  floors: number;
  side: "N" | "S";
  tone: Tone;
  host?: boolean;
  hero?: boolean;
  you?: boolean;
  canopy?: boolean;
  fascia?: "bronze" | "wood";
  /** Extra gap before this building (an alley). */
  gap?: number;
};

type Building = BuildingDef & { x: number };

// South row faces the road at -z and carries Your Business at x = 0.
const SOUTH: BuildingDef[] = [
  { id: "s3", sign: "", w: 9.6, d: 10, floors: 2, side: "S", tone: "sand" },
  { id: "well", sign: "WELLNESS", w: 9.8, d: 10, floors: 3, side: "S", tone: "stone" },
  { id: "you", sign: "YOUR BUSINESS", w: 12.4, d: 11, floors: 2, side: "S", tone: "you", you: true, canopy: true, fascia: "bronze" },
  { id: "cafe", sign: "CAFÉ", w: 8.4, d: 10, floors: 2, side: "S", tone: "sand", host: true, canopy: true, fascia: "wood" },
  { id: "s2", sign: "", w: 10.2, d: 10, floors: 3, side: "S", tone: "ivory", gap: 1.4 },
];

// North row faces the road at +z. The convenience store is the host we enter.
const NORTH: BuildingDef[] = [
  { id: "gym", sign: "FITNESS", w: 11.8, d: 11, floors: 3, side: "N", tone: "stone", host: true },
  { id: "conv", sign: "CONVENIENCE", w: 11, d: 11, floors: 2, side: "N", tone: "ivory", host: true, hero: true, canopy: true, fascia: "bronze" },
  { id: "rest", sign: "RESTAURANT", w: 10.6, d: 10, floors: 3, side: "N", tone: "sand", host: true, canopy: true, fascia: "wood" },
  { id: "salon", sign: "SALON", w: 8.4, d: 10, floors: 2, side: "N", tone: "stone", host: true, gap: 1.2 },
  { id: "n2", sign: "", w: 10.4, d: 10, floors: 2, side: "N", tone: "ivory" },
];

function layoutRow(defs: BuildingDef[], anchorId: string, anchorX: number): Building[] {
  let x = 0;
  const out: Building[] = [];
  defs.forEach((def, i) => {
    x += i === 0 ? 0 : (def.gap ?? 0.22);
    out.push({ ...def, x: x + def.w / 2 });
    x += def.w;
  });
  const shift = anchorX - out.find((b) => b.id === anchorId)!.x;
  out.forEach((b) => (b.x += shift));
  return out;
}

export const BUILDINGS: Building[] = [...layoutRow(SOUTH, "you", 0), ...layoutRow(NORTH, "conv", -7.8)];

const heightOf = (b: BuildingDef) => SF + b.floors * FLOOR_H;

/* -------------------------------------------------------------------------
   Types
   ---------------------------------------------------------------------- */

export type HostScreen = {
  id: string;
  /** Distance from Your Business' door, along the ground. */
  distance: number;
  face: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  halo: THREE.Sprite;
  on: boolean;
};

export type WorldState = { p: number; finale: boolean };

export type Label = { id: string; text: string; position: THREE.Vector3 };

export type World = {
  scene: THREE.Scene;
  /** Every named storefront, Your Business first, plus the screen itself. */
  labels: Label[];
  anchors: { you: THREE.Vector3; host: THREE.Vector3; unit: THREE.Vector3 };
  unitFrame: () => { position: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3; normal: THREE.Vector3 };
  update: (state: WorldState) => void;
  /** Compiles every material, including the ones that only show mid-story. */
  warm: (renderer: THREE.WebGLRenderer, camera: THREE.Camera) => void;
  dispose: () => void;
};

/* -------------------------------------------------------------------------
   Assembly
   ---------------------------------------------------------------------- */

export function buildWorld(env: THREE.Texture, sky: THREE.Texture, special: { line1: string; line2: string; tag: string }): World {
  const scene = new THREE.Scene();
  scene.background = sky;
  scene.environment = env;
  scene.fog = new THREE.Fog(0x0f2230, 70, 190);

  const M = createMaterials();
  const own: (THREE.Material | THREE.BufferGeometry)[] = [];
  const shadowed = new MergeBucket(); // casts + receives
  const ground = new MergeBucket(); // receives
  const unlit = new MergeBucket(); // emissive cards
  const glazing = new MergeBucket(); // transparent storefront glass
  const color = new THREE.Color();

  /* --- plinth and street -------------------------------------------------- */
  const plinth = new THREE.Mesh(boxGeometry(PLINTH_W, 5, PLINTH_D), M.plinth);
  plinth.position.y = -2.5;
  plinth.matrixAutoUpdate = false;
  plinth.updateMatrix();
  scene.add(plinth);
  ground.addBox(PLINTH_W + 0.5, 0.28, PLINTH_D + 0.5, M.plinthTop, 0, -0.14, 0);
  ground.addBox(PLINTH_W, 0.06, ROAD_HALF * 2, M.road, 0, 0.03, 0);
  [-1, 1].forEach((s) => {
    ground.addBox(PLINTH_W, 0.16, WALK, M.walk, 0, 0.08, s * (ROAD_HALF + WALK / 2));
    ground.addBox(PLINTH_W, 0.2, 0.14, M.kerb, 0, 0.1, s * (ROAD_HALF + 0.07));
  });
  for (let x = -PLINTH_W / 2 + 3; x < PLINTH_W / 2 - 2; x += 5.2) {
    ground.addBox(2.2, 0.012, 0.11, M.marking, x, 0.064, 0);
  }

  /* --- buildings ---------------------------------------------------------- */
  const hosts: HostScreen[] = [];
  const sprites: THREE.SpriteMaterial[] = [];
  const glow = glowTexture();
  const sprite = (hex: number, size: number, opacity: number) => {
    const mat = new THREE.SpriteMaterial({ map: glow, color: hex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
    sprites.push(mat);
    const s = new THREE.Sprite(mat);
    s.scale.set(size, size, 1);
    return s;
  };
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTexture(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  own.push(poolMat);
  const pools = new MergeBucket();
  const cardTex = interiorTexture();
  M.warmCard.map = cardTex;

  const anchors = { you: new THREE.Vector3(), host: new THREE.Vector3(), unit: new THREE.Vector3() };
  const labels: Label[] = [];
  let heroGlass: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial> | null = null;
  let unit: Unit | null = null;
  const yourDoor = new THREE.Vector3(0, 0, FRONT - 0.9);

  BUILDINGS.forEach((b, i) => {
    const north = b.side === "N";
    const nz = north ? 1 : -1; // outward normal, toward the road
    const H = heightOf(b);
    const cz = north ? -FRONT - b.d / 2 : FRONT + b.d / 2;
    const faceZ = cz + nz * (b.d / 2); // world z of the storefront plane
    const wall = M[b.tone] as THREE.Material;
    const fitting = b.fascia === "wood" ? M.wood : b.fascia === "bronze" ? M.bronze : M.metal;
    const sfW = b.w - PIER * 2;
    const open = b.hero ? 5.6 : b.you ? 3.6 : b.host ? 3.0 : 2.2;
    const glassBottom = BASE;
    const glassTop = SF - 0.55;
    const glassH = glassTop - glassBottom;
    const yaw = north ? 0 : Math.PI;

    // --- massing ---------------------------------------------------------
    shadowed.addBox(b.w + 0.06, BASE, b.d + 0.06, M.limestone, b.x, BASE / 2, cz);
    [-1, 1].forEach((sx) => shadowed.addBox(PIER, SF - BASE, b.d, wall, b.x + sx * (b.w / 2 - PIER / 2), BASE + (SF - BASE) / 2, cz));
    const rearD = b.d - open;
    shadowed.addBox(sfW + 0.02, SF - BASE, rearD, wall, b.x, BASE + (SF - BASE) / 2, faceZ - nz * (open + rearD / 2));
    shadowed.addBox(b.w, H - SF, b.d, wall, b.x, SF + (H - SF) / 2, cz);
    shadowed.addBox(b.w + 0.14, 0.14, b.d + 0.14, M.limestone, b.x, SF + 0.37, cz);
    shadowed.addBox(b.w + 0.26, 0.22, b.d + 0.26, M.limestone, b.x, H - 0.11, cz);
    // parapet ring and roof membrane
    shadowed.addBox(b.w, 0.5, 0.3, wall, b.x, H + 0.25, cz + nz * (b.d / 2 - 0.15));
    shadowed.addBox(b.w, 0.5, 0.3, wall, b.x, H + 0.25, cz - nz * (b.d / 2 - 0.15));
    [-1, 1].forEach((sx) => shadowed.addBox(0.3, 0.5, b.d - 0.6, wall, b.x + sx * (b.w / 2 - 0.15), H + 0.25, cz));
    ground.addBox(b.w - 0.6, 0.04, b.d - 0.6, M.roof, b.x, H + 0.02, cz);

    // --- upper windows ---------------------------------------------------
    const cols = Math.max(2, Math.round(b.w / 2.7));
    const spacing = b.w / cols;
    for (let k = 0; k < b.floors; k++) {
      const yc = SF + k * FLOOR_H + FLOOR_H * 0.52;
      for (let c = 0; c < cols; c++) {
        const xc = b.x - b.w / 2 + spacing * (c + 0.5);
        const seed = k * 3 + c * 5 + i * 7;
        const lit = b.you ? seed % 2 === 0 : b.sign ? seed % 4 === 0 : seed % 5 === 0;
        if (lit) {
          color.set(b.you ? 0xffd7a6 : 0xe7b57c).multiplyScalar(b.sign ? 1 : 0.7);
          unlit.addBox(1.05, 1.55, 0.05, M.warmCard, xc, yc, faceZ + nz * 0.01, undefined, color);
        } else {
          shadowed.addBox(1.05, 1.55, 0.05, M.glassDark, xc, yc, faceZ + nz * 0.01);
        }
        shadowed.addBox(1.27, 0.1, 0.18, M.limestone, xc, yc - 0.83, faceZ + nz * 0.06);
        // the back of the block reads from the model shot, so it gets the same rhythm
        const backZ = cz - nz * (b.d / 2);
        if ((seed + 1) % 5 === 0) {
          color.set(0xe7b57c).multiplyScalar(0.7);
          unlit.addBox(1.05, 1.55, 0.05, M.warmCard, xc, yc, backZ - nz * 0.01, undefined, color);
        } else {
          shadowed.addBox(1.05, 1.55, 0.05, M.glassDark, xc, yc, backZ - nz * 0.01);
        }
        shadowed.addBox(1.27, 0.1, 0.18, M.limestone, xc, yc - 0.83, backZ - nz * 0.06);
      }
    }

    // --- shopfront -------------------------------------------------------
    shadowed.addBox(sfW + 0.3, 0.85, 0.2, fitting, b.x, SF - 0.125, faceZ + nz * 0.1);
    [-1, 1].forEach((sx) => shadowed.addBox(0.05, glassH, 0.08, b.you ? M.bronze : M.metal, b.x + sx * (sfW / 6), glassBottom + glassH / 2, faceZ + nz * 0.05));
    if (b.canopy) {
      shadowed.addBox(sfW - 0.5, 0.06, b.you ? 1.6 : 1.3, fitting, b.x, SF - 0.66, faceZ + nz * (0.12 + (b.you ? 0.8 : 0.65)));
    }
    // recess floor, ceiling, warm back wall
    const floor = new THREE.Mesh(planeGeometry(sfW, open), M.interiorFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(b.x, BASE + 0.01, faceZ - nz * (open / 2));
    floor.receiveShadow = true;
    floor.matrixAutoUpdate = false;
    floor.updateMatrix();
    scene.add(floor);
    const ceiling = new THREE.Mesh(planeGeometry(sfW, open), M.limestone);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(b.x, glassTop, faceZ - nz * (open / 2));
    ceiling.matrixAutoUpdate = false;
    ceiling.updateMatrix();
    scene.add(ceiling);
    color.set(b.you ? 0xffe4c0 : b.host ? 0xf6d6ac : b.sign ? 0xdcbc95 : 0xa88b6a);
    unlit.addBox(sfW - 0.04, glassH, 0.04, M.warmCard, b.x, glassBottom + glassH / 2, faceZ - nz * (open - 0.03), undefined, color);

    // a counter, so the room has a silhouette
    if (b.sign) {
      const cw = Math.min(sfW * 0.42, 2.6);
      const cx = b.x - sfW * 0.14;
      const czz = faceZ - nz * (b.hero ? 2.0 : open * 0.62);
      shadowed.addBox(cw, 0.9, 0.58, M.counter, cx, BASE + 0.45, czz);
      shadowed.addBox(cw + 0.06, 0.06, 0.64, M.counterTop, cx, BASE + 0.93, czz);
      if (b.host && !b.hero) {
        // the host's counter screen, idle in mint until the offer arrives
        const faceMat = new THREE.MeshBasicMaterial({ color: 0x2f7a6e });
        own.push(faceMat);
        const face = new THREE.Mesh(planeGeometry(0.5, 0.28), faceMat) as HostScreen["face"];
        face.position.set(cx + 0.55, BASE + 0.96 + 0.19, czz + nz * 0.2);
        face.rotation.y = yaw;
        scene.add(face);
        const stand = new THREE.Mesh(boxGeometry(0.16, 0.05, 0.14), M.enclosure);
        stand.position.set(cx + 0.55, BASE + 0.985, czz + nz * 0.18);
        stand.matrixAutoUpdate = false;
        stand.updateMatrix();
        scene.add(stand);
        const halo = sprite(0x6fe0c6, 1.6, 0);
        halo.position.copy(face.position);
        scene.add(halo);
        const door = new THREE.Vector3(b.x, 0, faceZ + nz * 0.9);
        hosts.push({ id: b.id, distance: door.distanceTo(yourDoor), face, halo, on: false });
      }
    }

    // glazing — the hero store's is its own mesh because it dissolves
    if (b.hero) {
      const mat = M.glass.clone() as THREE.MeshPhysicalMaterial;
      own.push(mat);
      heroGlass = new THREE.Mesh(planeGeometry(sfW - 0.02, glassH), mat);
      heroGlass.position.set(b.x, glassBottom + glassH / 2, faceZ + nz * 0.02);
      heroGlass.rotation.y = yaw;
      scene.add(heroGlass);
    } else {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(b.x, glassBottom + glassH / 2, faceZ + nz * 0.02),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)),
        new THREE.Vector3(1, 1, 1)
      );
      glazing.add(planeGeometry(sfW - 0.02, glassH), M.glass, m);
    }

    // fascia lettering
    if (b.sign) {
      const tex = signTexture(b.sign, !!b.you);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      own.push(mat);
      const sw = Math.min(sfW - 0.8, b.sign.length * 0.44 + 0.9);
      const sign = new THREE.Mesh(planeGeometry(sw, sw / 8), mat);
      sign.position.set(b.x, SF - 0.125, faceZ + nz * 0.205);
      sign.rotation.y = yaw;
      sign.matrixAutoUpdate = false;
      sign.updateMatrix();
      scene.add(sign);
    }

    // light on the pavement
    if (b.sign) {
      color.set(0xffb56a).multiplyScalar(b.you ? 0.62 : b.host ? 0.34 : 0.2);
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(b.x, 0.175, faceZ + nz * 1.3),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
        new THREE.Vector3(1, 1, 1)
      );
      pools.add(planeGeometry(b.w * 0.95, 2.6), poolMat, m, color);
    }

    // --- the host we enter: a room the camera can stand in ----------------
    if (b.hero) {
      const roomZ = (z: number) => faceZ - nz * z;
      shadowed.addBox(sfW * 0.86, 0.05, 0.12, M.lampHead, b.x, glassTop - 0.16, roomZ(open - 0.2));
      unlit.addBox(sfW * 0.86, 0.05, 0.12, M.lampHead, b.x, glassTop - 0.16, roomZ(open - 0.2), undefined, color.set(0xffe2bf));
      shadowed.addBox(sfW * 0.62, 0.04, 0.26, M.counter, b.x + 0.6, 2.05, roomZ(open - 0.16));
      const cw = 2.8;
      const cx = b.x + 0.3;
      const czz = roomZ(2.0);
      shadowed.addBox(cw, 0.9, 0.62, M.counter, cx, BASE + 0.45, czz);
      shadowed.addBox(cw + 0.06, 0.06, 0.68, M.counterTop, cx, BASE + 0.93, czz);
      unit = buildUnit(M, special);
      unit.group.position.set(cx - 0.15, BASE + 0.96, czz + nz * 0.04);
      const contactMat = new THREE.MeshBasicMaterial({ map: poolTexture(), color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false });
      own.push(contactMat);
      const contact = new THREE.Mesh(planeGeometry(0.62, 0.34), contactMat);
      contact.rotation.x = -Math.PI / 2;
      contact.position.set(cx - 0.15, BASE + 0.964, czz + nz * 0.02);
      scene.add(contact);
      unit.group.rotation.y = yaw + (north ? -0.14 : 0.14);
      scene.add(unit.group);
      anchors.host.set(b.x, H + 1.0, cz);
    }
    if (b.you) anchors.you.set(b.x, H + 1.0, cz);
    if (b.sign) {
      const text = b.you ? "Your business" : b.sign.charAt(0) + b.sign.slice(1).toLowerCase();
      labels[b.you ? "unshift" : "push"]({ id: b.id, text, position: new THREE.Vector3(b.x, H + 1.0, cz) });
    }
  });

  /* --- street lamps ------------------------------------------------------- */
  const lampGeo = trackGeometry(new THREE.CylinderGeometry(0.045, 0.06, 4.4, 8));
  const lamps: [number, number][] = [
    [-25, -1],
    [-3, -1],
    [17, -1],
    [-14, 1],
    [8.5, 1],
    [29, 1],
  ];
  const m4 = new THREE.Matrix4();
  lamps.forEach(([x, s]) => {
    const z = s * (ROAD_HALF + WALK - 0.55);
    const toRoad = -s;
    m4.makeTranslation(x, 0.16 + 2.2, z);
    shadowed.add(lampGeo, M.metal, m4);
    shadowed.addBox(0.75, 0.05, 0.08, M.metal, x + toRoad * 0.32, 4.6, z);
    unlit.addBox(0.32, 0.06, 0.14, M.lampHead, x + toRoad * 0.6, 4.54, z, undefined, color.set(0xffd9ae));
    const g = sprite(0xffcf9a, 2.2, 0.26);
    g.position.set(x + toRoad * 0.6, 4.5, z);
    scene.add(g);
  });

  /* --- the offer signal ---------------------------------------------------
     A single soft ring of light that leaves Your Business and crosses the
     block. Not a path, not a particle: light, moving over a model. */
  const waveMat = new THREE.MeshBasicMaterial({ map: waveTexture(), color: 0xf2b46a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  own.push(waveMat);
  const wave = new THREE.Mesh(planeGeometry(2, 2), waveMat);
  wave.rotation.x = -Math.PI / 2;
  wave.position.set(yourDoor.x, 0.19, yourDoor.z);
  wave.visible = false;
  scene.add(wave);
  const origin = sprite(0xffc48a, 2.4, 0);
  origin.position.set(yourDoor.x, 0.9, yourDoor.z);
  scene.add(origin);

  /* --- flush the static geometry ------------------------------------------ */
  const meshes = [
    ...shadowed.flush(scene, { castShadow: true, receiveShadow: true }),
    ...ground.flush(scene, { receiveShadow: true }),
    ...unlit.flush(scene),
    ...glazing.flush(scene),
    ...pools.flush(scene),
  ];
  meshes.forEach((m) => own.push(m.geometry));

  /* --- light --------------------------------------------------------------
     One cool key from high behind the block, a hemisphere for the sky, and a
     faint warm fill standing in for the bounce off the lit shopfronts. No
     point lights: every interior and window is an emissive card. */
  const hemi = new THREE.HemisphereLight(0x9cbcd0, 0x232f37, 1.5);
  const key = new THREE.DirectionalLight(0xd6e8f4, 2.1);
  key.position.set(-30, 40, -26);
  key.castShadow = true;
  const sc = key.shadow.camera;
  sc.left = -44;
  sc.right = 44;
  sc.top = 30;
  sc.bottom = -30;
  sc.near = 5;
  sc.far = 130;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.05;
  const fill = new THREE.DirectionalLight(0xf3c89c, 0.6);
  fill.position.set(22, 9, 36);
  scene.add(hemi, key, fill);

  /* --- per-frame state ---------------------------------------------------- */
  const unitPanel = unit!.panel;
  const heroGlassMesh = heroGlass!;
  const frame = { position: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), normal: new THREE.Vector3() };
  const q = new THREE.Quaternion();
  const unitFrame = () => {
    unitPanel.updateWorldMatrix(true, false);
    unitPanel.getWorldPosition(frame.position);
    unitPanel.getWorldQuaternion(q);
    frame.right.set(1, 0, 0).applyQuaternion(q);
    frame.up.set(0, 1, 0).applyQuaternion(q);
    frame.normal.set(0, 0, 1).applyQuaternion(q);
    return frame;
  };
  anchors.unit.copy(unitFrame().position).addScaledVector(frame.up, PANEL_H * 0.5 + 0.12);
  labels.push({ id: "unit", text: "Uptick screen", position: anchors.unit });

  const ON = new THREE.Color(0xf2b36a);
  const IDLE = new THREE.Color(0x2f7a6e);
  const REACH = 27;

  const update = ({ p, finale }: WorldState) => {
    // The signal: one ring leaving Your Business and crossing the block.
    const s = finale ? 1 : smoothstep(0.44, 0.62, p);
    const r = s * REACH;
    const live = !finale && r > 0.3 && r < REACH - 0.01;
    wave.visible = live;
    if (live) {
      wave.scale.set(r, r, 1);
      waveMat.opacity = 0.9 * smoothstep(0, 0.08, s) * (1 - smoothstep(0.82, 1, s));
    }
    const originAlpha = finale ? 0 : smoothstep(0.4, 0.45, p) * (1 - smoothstep(0.5, 0.6, p));
    origin.material.opacity = 0.7 * originAlpha;
    origin.visible = originAlpha > 0.01;

    hosts.forEach((h) => {
      const on = finale || r >= h.distance;
      if (on !== h.on) {
        h.on = on;
        h.face.material.color.copy(on ? ON : IDLE);
      }
      h.halo.material.opacity = on ? (finale ? 0.28 : 0.42) : 0;
      h.halo.material.color.copy(on ? ON : IDLE);
    });

    // The glazing dissolves so the camera can step inside.
    const dive = finale ? 0 : smoothstep(0.7, 0.8, p);
    heroGlassMesh.material.opacity = 0.26 * (1 - dive);
    heroGlassMesh.visible = dive < 0.995;
  };

  const warm = (renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {
    wave.visible = true;
    origin.visible = true;
    renderer.compile(scene, camera);
    wave.visible = false;
    origin.visible = false;
  };

  const dispose = () => {
    M.dispose();
    sprites.forEach((m) => m.dispose());
    own.forEach((o) => o.dispose());
    unit?.dispose();
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    key.dispose();
    hemi.dispose();
    fill.dispose();
  };

  return { scene, labels, anchors, unitFrame, update, warm, dispose };
}
