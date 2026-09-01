import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { boxGeometry } from "./materials";

/**
 * Static-geometry batcher. Everything that never moves is baked into one
 * buffer per material, so a street of ten buildings with all their sills,
 * fascias, canopies and mullions draws in a dozen calls rather than a
 * thousand.
 */
export class MergeBucket {
  private buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private scratch = new THREE.Matrix4();
  private euler = new THREE.Euler();
  private quat = new THREE.Quaternion();
  private one = new THREE.Vector3(1, 1, 1);
  private pos = new THREE.Vector3();

  add(geometry: THREE.BufferGeometry, material: THREE.Material, matrix: THREE.Matrix4, color?: THREE.Color) {
    const g = geometry.clone().applyMatrix4(matrix);
    g.clearGroups();
    if (color) {
      const n = g.getAttribute("position").count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        arr[i * 3] = color.r;
        arr[i * 3 + 1] = color.g;
        arr[i * 3 + 2] = color.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    }
    const list = this.buckets.get(material);
    if (list) list.push(g);
    else this.buckets.set(material, [g]);
  }

  addBox(
    w: number,
    h: number,
    d: number,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    rot?: { x?: number; y?: number; z?: number },
    color?: THREE.Color
  ) {
    this.euler.set(rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0);
    this.quat.setFromEuler(this.euler);
    this.pos.set(x, y, z);
    this.scratch.compose(this.pos, this.quat, this.one);
    this.add(boxGeometry(w, h, d), material, this.scratch, color);
  }

  /** Bakes every bucket into `parent`; returns the meshes for disposal. */
  flush(parent: THREE.Object3D, opts: { castShadow?: boolean; receiveShadow?: boolean } = {}): THREE.Mesh[] {
    const out: THREE.Mesh[] = [];
    this.buckets.forEach((list, material) => {
      const merged = list.length === 1 ? list[0] : mergeGeometries(list, false);
      if (list.length > 1) list.forEach((g) => g.dispose());
      if (!merged) return;
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = opts.castShadow ?? false;
      mesh.receiveShadow = opts.receiveShadow ?? false;
      mesh.matrixAutoUpdate = false;
      parent.add(mesh);
      out.push(mesh);
    });
    this.buckets.clear();
    return out;
  }
}
