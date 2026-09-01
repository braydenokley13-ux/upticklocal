import * as THREE from "three";
import { planeGeometry, trackGeometry, type Materials } from "./materials";
import { screenTexture } from "./textures";

/** Active panel of the 21" unit, in metres. 16:9. */
export const PANEL_W = 0.465;
export const PANEL_H = PANEL_W * (9 / 16);

function roundedRect(w: number, h: number, r: number) {
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
}

export type Unit = {
  group: THREE.Group;
  /** The active panel, for the camera to aim at. */
  panel: THREE.Mesh;
  dispose: () => void;
};

/**
 * The Uptick screen as a product: a thin dark slab with a hairline bezel,
 * a glass face, and a low wedge foot. It is the one object on the block the
 * camera gets close enough to inspect, so it is the one object built with a
 * real profile. Local +Z faces the viewer; the panel centre is the origin of
 * `panel`.
 */
export function buildUnit(M: Materials, special: { line1: string; line2: string; tag: string }): Unit {
  const group = new THREE.Group();
  const own: THREE.Material[] = [];

  const BEZEL = 0.011;
  const encW = PANEL_W + BEZEL * 2;
  const encH = PANEL_H + BEZEL * 2;
  const encT = 0.022;

  // Enclosure — a rounded slab with a soft bevel on the front edge.
  const encGeo = trackGeometry(
    new THREE.ExtrudeGeometry(roundedRect(encW, encH, 0.014), {
      depth: encT,
      bevelEnabled: true,
      bevelThickness: 0.0035,
      bevelSize: 0.0035,
      bevelSegments: 3,
      curveSegments: 10,
    })
  );
  encGeo.translate(0, 0, -encT);
  const enclosure = new THREE.Mesh(encGeo, M.enclosure);
  enclosure.castShadow = true;

  // Glass face, fractionally proud of the bezel.
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x030a0a,
    roughness: 0.03,
    metalness: 0,
    transparent: true,
    opacity: 0.26,
    envMapIntensity: 2,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    depthWrite: false,
  });
  own.push(glassMat);
  const glass = new THREE.Mesh(planeGeometry(encW - 0.004, encH - 0.004), glassMat);
  glass.position.z = 0.0062;

  // The panel itself.
  const panelMat = new THREE.MeshBasicMaterial({ map: screenTexture(special), toneMapped: false });
  own.push(panelMat);
  const panel = new THREE.Mesh(planeGeometry(PANEL_W, PANEL_H), panelMat);
  panel.position.z = 0.0044;

  // Status LED under the panel.
  const led = new THREE.Mesh(planeGeometry(0.014, 0.0016), M.mintLed);
  led.position.set(0, -PANEL_H / 2 - BEZEL * 0.55, 0.0046);

  const display = new THREE.Group();
  display.add(enclosure, glass, panel, led);
  display.rotation.x = -0.12; // tilted back, the way a counter unit sits
  display.position.set(0, encH / 2 + 0.03, 0.02);

  // Foot: a low wedge in the same dark finish.
  const prof = new THREE.Shape();
  const D = 0.19;
  prof.moveTo(-D / 2, 0);
  prof.lineTo(D / 2, 0);
  prof.lineTo(D / 2, 0.05);
  prof.lineTo(-D / 2 + 0.02, 0.013);
  prof.quadraticCurveTo(-D / 2, 0.012, -D / 2, 0.006);
  prof.closePath();
  const W = 0.24;
  const wedgeGeo = trackGeometry(
    new THREE.ExtrudeGeometry(prof, { depth: W, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 })
  );
  wedgeGeo.rotateY(Math.PI / 2);
  wedgeGeo.translate(-W / 2, 0, 0);
  const foot = new THREE.Mesh(wedgeGeo, M.enclosure);
  foot.castShadow = true;

  group.add(foot, display);

  return {
    group,
    panel,
    dispose: () => own.forEach((m) => m.dispose()),
  };
}
