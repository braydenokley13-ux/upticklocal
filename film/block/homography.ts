/**
 * The projective transform that carries a w×h rectangle onto four points
 * (top-left, top-right, bottom-right, bottom-left), as a CSS matrix3d. Used
 * to sit a DOM object exactly on a tracked physical surface — the café's
 * counter screen — and then lift it off into a flat card.
 */
export type Quad = [[number, number], [number, number], [number, number], [number, number]];

/** The eight coefficients of the homography that maps the w×h rectangle onto `to`. */
export function homography(w: number, h: number, to: Quad): number[] {
  const src: [number, number][] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
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
  return solve(A, b);
}

/** Where a point of the rectangle lands under the homography. */
export function applyHomography(H: number[], x: number, y: number): [number, number] {
  const [a, b, c, d, e, f, g, h] = H;
  const w = g * x + h * y + 1;
  return [(a * x + b * y + c) / w, (d * x + e * y + f) / w];
}

export function homographyMatrix3d(w: number, h: number, to: Quad): string {
  const [a, bb, c, d, e, f, g, hh] = homography(w, h, to);
  // CSS matrix3d is column-major; the 3×3 homography maps (x, y, 1) → (u, v, w).
  const m = [a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(7))).join(",")})`;
}

/** Blend two quads. */
export function lerpQuad(a: Quad, b: Quad, t: number): Quad {
  return a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]) as Quad;
}

/** An axis-aligned rectangle as a quad. */
export function rectQuad(x: number, y: number, w: number, h: number): Quad {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const p = M[col][col] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / p;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}
