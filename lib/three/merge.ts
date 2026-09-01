import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { boxGeometry } from "./materials";

/**
 * Static-detail batcher.
 *
 * The block is mostly repeated trim — window reveals, sills, lintels, lamp
 * posts, bollards. Left as individual meshes that is well over a thousand draw
 * calls for geometry that never moves relative to its parent. Anything added
 * here is baked into one merged buffer per material, which takes the facade
 * kit from ~60 meshes per building to ~6 and the whole street furniture run
 * from ~150 to 3.
 *
 * Only use it for geometry that is static within its parent group; the parent
 * itself can still move (buildings rise, so each building batches separately).
 */
export class MergeBucket {
  private buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private scratch = new THREE.Matrix4();
  private euler = new THREE.Euler();
  private quat = new THREE.Quaternion();
  private one = new THREE.Vector3(1, 1, 1);
  private pos = new THREE.Vector3();

  add(geometry: THREE.BufferGeometry, material: THREE.Material, matrix: THREE.Matrix4) {
    const g = geometry.clone().applyMatrix4(matrix);
    // Merged output is drawn with one material, so per-face groups are noise.
    g.clearGroups();
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
    rot?: { x?: number; y?: number; z?: number }
  ) {
    this.euler.set(rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0);
    this.quat.setFromEuler(this.euler);
    this.pos.set(x, y, z);
    this.scratch.compose(this.pos, this.quat, this.one);
    this.add(boxGeometry(w, h, d), material, this.scratch);
  }

  /**
   * Bakes every bucket into `parent` and empties the batcher. Returns the
   * created meshes so the caller can dispose their geometry on teardown.
   */
  flush(
    parent: THREE.Object3D,
    opts: { castShadow?: boolean; receiveShadow?: boolean } = {}
  ): THREE.Mesh[] {
    const out: THREE.Mesh[] = [];
    this.buckets.forEach((list, material) => {
      const merged = list.length === 1 ? list[0] : mergeGeometries(list, false);
      if (list.length > 1) list.forEach((g) => g.dispose());
      if (!merged) return;
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = opts.castShadow ?? false;
      mesh.receiveShadow = opts.receiveShadow ?? false;
      parent.add(mesh);
      out.push(mesh);
    });
    this.buckets.clear();
    return out;
  }
}
