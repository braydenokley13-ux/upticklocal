/**
 * The 3×3 projective transform that carries the rectangle (0,0)–(w,h) onto
 * four points, in order top-left, top-right, bottom-right, bottom-left. Used
 * to lay a real DOM panel exactly over the baked picture of the screen.
 */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

export function homography(w: number, h: number, to: [number, number][]): Mat3 {
  const src: [number, number][] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  // Eight equations in the eight unknowns a…h of [[a,b,c],[d,e,f],[g,h,1]].
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = to[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const s = solve(A, b);
  return [s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], 1];
}

/** Gaussian elimination with partial pivoting; the systems here are tiny and well conditioned. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[pivot][c])) pivot = r;
    [M[c], M[pivot]] = [M[pivot], M[c]];
    const p = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / p;
      if (!f) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}

export const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function translation(x: number, y: number): Mat3 {
  return [1, 0, x, 0, 1, y, 0, 0, 1];
}

export function lerpMat(a: Mat3, b: Mat3, t: number): Mat3 {
  return a.map((v, i) => v + (b[i] - v) * t) as Mat3;
}

/** A 2D projective matrix as the CSS `matrix3d()` that applies it to the x/y plane. */
export function toMatrix3d([a, b, c, d, e, f, g, h, i]: Mat3): string {
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,${i})`;
}
