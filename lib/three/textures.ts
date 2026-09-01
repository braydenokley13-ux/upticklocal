import * as THREE from "three";

/**
 * Every surface in the model is procedural — no image downloads, no CDN, no
 * layout-shifting asset waterfall. Patterns are drawn once at 256px in
 * grayscale and tinted by `material.color`, so a single canvas backs every
 * plaster wall on the block regardless of what colour it ends up.
 */

export type PatternKind = "plaster" | "brick" | "stone" | "pave" | "asphalt";

const patternCache = new Map<PatternKind, HTMLCanvasElement>();
const textureCache = new Map<string, THREE.Texture>();
const disposables: THREE.Texture[] = [];

function track<T extends THREE.Texture>(t: T): T {
  disposables.push(t);
  return t;
}

/** Frees every texture this module has handed out. Called on scene teardown. */
export function disposeTextures() {
  disposables.forEach((t) => t.dispose());
  disposables.length = 0;
  textureCache.clear();
}

function speckle(
  g: CanvasRenderingContext2D,
  count: number,
  alpha: number,
  dark: boolean
) {
  for (let i = 0; i < count; i++) {
    const a = (Math.random() * alpha).toFixed(3);
    g.fillStyle = dark ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function patternCanvas(kind: PatternKind): HTMLCanvasElement {
  const cached = patternCache.get(kind);
  if (cached) return cached;

  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;

  if (kind === "plaster") {
    // Fine-grain render plus faint vertical weathering streaks.
    g.fillStyle = "#f2f2f2";
    g.fillRect(0, 0, 256, 256);
    speckle(g, 14000, 0.07, true);
    speckle(g, 6000, 0.06, false);
    for (let i = 0; i < 22; i++) {
      g.strokeStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.03})`;
      g.lineWidth = 0.6 + Math.random();
      g.beginPath();
      g.moveTo(0, Math.random() * 256);
      g.lineTo(256, Math.random() * 256);
      g.stroke();
    }
  } else if (kind === "brick") {
    // 12 courses across the tile — at 6 repeats per facade this lands close to
    // a real 65mm brick course.
    g.fillStyle = "#8f8f8f";
    g.fillRect(0, 0, 256, 256);
    const bh = 256 / 12;
    const bw = 64;
    for (let r = 0; r < 12; r++) {
      const off = r % 2 ? bw / 2 : 0;
      for (let x = -bw; x < 256 + bw; x += bw) {
        g.fillStyle = `hsl(20 4% ${78 + Math.random() * 20}%)`;
        g.fillRect(x + off + 1.4, r * bh + 1.6, bw - 2.8, bh - 3.2);
      }
    }
    speckle(g, 9000, 0.09, true);
  } else if (kind === "stone") {
    // Ashlar coursing — larger, squarer, shallower joints than brick.
    g.fillStyle = "#8a8a8a";
    g.fillRect(0, 0, 256, 256);
    const bh = 256 / 6;
    const bw = 85;
    for (let r = 0; r < 6; r++) {
      const off = r % 2 ? bw / 3 : 0;
      for (let x = -bw; x < 256 + bw; x += bw) {
        g.fillStyle = `hsl(40 3% ${80 + Math.random() * 16}%)`;
        g.fillRect(x + off + 2, r * bh + 2.2, bw - 4, bh - 4.4);
      }
    }
    speckle(g, 11000, 0.08, true);
  } else if (kind === "pave") {
    // Four slabs per tile; at 36 repeats over a 108m plinth that is a ~3m slab.
    g.fillStyle = "#7d7d7d";
    g.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 2; r++) {
      for (let q = 0; q < 2; q++) {
        g.fillStyle = `hsl(210 4% ${82 + Math.random() * 10}%)`;
        g.fillRect(q * 128 + 2.5, r * 128 + 2.5, 123, 123);
      }
    }
    speckle(g, 13000, 0.1, true);
    speckle(g, 4000, 0.05, false);
  } else {
    // Damp asphalt: heavy grain plus soft patches that break up the sheen.
    g.fillStyle = "#d2d2d2";
    g.fillRect(0, 0, 256, 256);
    speckle(g, 26000, 0.22, true);
    speckle(g, 6000, 0.05, false);
    for (let i = 0; i < 5; i++) {
      g.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`;
      g.beginPath();
      g.ellipse(
        Math.random() * 256,
        Math.random() * 256,
        30 + Math.random() * 50,
        18 + Math.random() * 30,
        Math.random() * 3,
        0,
        Math.PI * 2
      );
      g.fill();
    }
  }

  patternCache.set(kind, c);
  return c;
}

/** Tiled surface map. Cached per (kind, repeat) so facades share GPU uploads. */
export function patternTexture(kind: PatternKind, rx: number, ry: number): THREE.Texture {
  const key = `${kind}:${rx}:${ry}`;
  const hit = textureCache.get(key);
  if (hit) return hit;

  const t = track(new THREE.CanvasTexture(patternCanvas(kind)));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  textureCache.set(key, t);
  return t;
}

/** Soft radial falloff used for every light pool, halo and bulb bloom. */
export function glowTexture(): THREE.Texture {
  const hit = textureCache.get("glow");
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.25, "rgba(255,255,255,.55)");
  r.addColorStop(0.6, "rgba(255,255,255,.12)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);

  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  textureCache.set("glow", t);
  return t;
}

/** Storefront fascia lettering, rendered into a sign box on the facade. */
export function signTexture(text: string): THREE.Texture {
  const key = `sign:${text}`;
  const hit = textureCache.get(key);
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 192;
  const g = c.getContext("2d")!;
  g.fillStyle = "#14181a";
  g.fillRect(0, 0, 1024, 192);
  g.fillStyle = "rgba(236,229,216,.92)";
  g.font = '600 74px Archivo, Helvetica, Arial, sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.letterSpacing = "14px";
  g.fillText(text, 512, 102);

  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  textureCache.set(key, t);
  return t;
}

/** Blue-hour dome, used both as PMREM source and as the scene backdrop. */
export function skyEquirect(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, "#071317");
  v.addColorStop(0.42, "#0e2a33");
  v.addColorStop(0.56, "#215063");
  v.addColorStop(0.63, "#6b5a49"); // the last of the sun, low on the horizon
  v.addColorStop(0.72, "#1a2224");
  v.addColorStop(1, "#080d0e");
  g.fillStyle = v;
  g.fillRect(0, 0, 512, 256);

  const t = track(new THREE.CanvasTexture(c));
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function backgroundTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 512;
  const g = c.getContext("2d")!;
  const v = g.createLinearGradient(0, 0, 0, 512);
  v.addColorStop(0, "#040d10");
  v.addColorStop(0.45, "#0a222a");
  v.addColorStop(0.78, "#123a48");
  v.addColorStop(1, "#1d4a52");
  g.fillStyle = v;
  g.fillRect(0, 0, 8, 512);

  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SANS = "Archivo, Helvetica, Arial, sans-serif";

/**
 * The small host-counter displays. Two states: the store's own specials, and
 * the advertiser's offer once it has travelled here.
 */
export function counterScreenTexture(kind: "idle" | "offer", offerText = ""): THREE.Texture {
  const key = `tiny:${kind}:${offerText}`;
  const hit = textureCache.get(key);
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 288;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 288);
  grad.addColorStop(0, "#0b2b30");
  grad.addColorStop(1, "#05171b");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 288);
  g.textBaseline = "middle";

  if (kind === "idle") {
    g.fillStyle = "#6fe0c6";
    g.font = `600 26px ${SANS}`;
    g.letterSpacing = "6px";
    g.fillText("TODAY AT THIS STORE", 34, 56);
    g.letterSpacing = "0px";
    g.fillStyle = "rgba(236,229,216,.85)";
    g.font = `600 54px ${SANS}`;
    g.fillText("STORE", 34, 150);
    g.fillText("SPECIALS", 34, 210);
  } else {
    g.fillStyle = "#e8a24a";
    g.font = `600 24px ${SANS}`;
    g.letterSpacing = "6px";
    g.fillText("EXAMPLE OFFER", 34, 50);
    g.letterSpacing = "0px";
    g.fillStyle = "#ece5d8";
    g.font = `600 46px ${SANS}`;
    const w = offerText.split(" ");
    g.fillText(w.slice(0, 3).join(" "), 34, 130);
    g.fillText(w.slice(3).join(" "), 34, 182);
    g.fillStyle = "#ece5d8";
    g.fillRect(392, 176, 86, 86);
    g.fillStyle = "#05171b";
    g.font = `600 15px ${SANS}`;
    g.textAlign = "center";
    g.fillText("SCAN", 435, 219);
    g.textAlign = "left";
  }

  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  textureCache.set(key, t);
  return t;
}

/**
 * The 21" host unit the camera ends on. Rendered at 1792×1008 because the
 * final shot puts the panel most of the way across the viewport.
 */
export function heroScreenTexture(offerText: string): THREE.Texture {
  const key = `hero:${offerText}`;
  const hit = textureCache.get(key);
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = 1792;
  c.height = 1008;
  const g = c.getContext("2d")!;

  const grad = g.createLinearGradient(0, 0, 0, 1008);
  grad.addColorStop(0, "#0d3238");
  grad.addColorStop(1, "#04161a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1792, 1008);

  const gl = g.createRadialGradient(430, 150, 20, 430, 150, 900);
  gl.addColorStop(0, "rgba(232,162,74,.14)");
  gl.addColorStop(1, "rgba(232,162,74,0)");
  g.fillStyle = gl;
  g.fillRect(0, 0, 1792, 1008);

  g.textBaseline = "middle";
  g.strokeStyle = "rgba(232,162,74,.9)";
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(110, 118, 400, 68, 34);
  g.stroke();
  g.fillStyle = "#e8a24a";
  g.font = `600 30px ${SANS}`;
  g.letterSpacing = "9px";
  g.fillText("EXAMPLE OFFER", 148, 154);
  g.letterSpacing = "0px";

  g.fillStyle = "#f2ede2";
  g.font = `600 138px ${SANS}`;
  const w = offerText.split(" ");
  const cut = Math.min(3, w.length);
  g.fillText(w.slice(0, cut).join(" "), 106, 348);
  g.fillText(w.slice(cut).join(" "), 106, 496);

  g.fillStyle = "rgba(242,237,226,.58)";
  g.font = `400 40px ${SANS}`;
  g.fillText("Scan to claim — redeem on your phone.", 112, 640);

  // Finder-pattern stand-in. Deliberately not a scannable code.
  const qx = 1330;
  const qy = 560;
  const qs = 250;
  g.fillStyle = "#f2ede2";
  g.beginPath();
  g.roundRect(qx, qy, qs, qs, 18);
  g.fill();
  g.lineWidth = 12;
  ([
    [qx + 30, qy + 30],
    [qx + qs - 86, qy + 30],
    [qx + 30, qy + qs - 86],
  ] as const).forEach(([x, y]) => {
    g.strokeStyle = "#04161a";
    g.strokeRect(x, y, 56, 56);
    g.fillStyle = "#04161a";
    g.fillRect(x + 18, y + 18, 20, 20);
  });
  g.fillStyle = "rgba(242,237,226,.55)";
  g.font = `600 24px ${SANS}`;
  g.textAlign = "center";
  g.letterSpacing = "5px";
  g.fillText("SCAN TO CLAIM", qx + qs / 2, qy + qs + 46);
  g.letterSpacing = "0px";
  g.textAlign = "left";

  g.fillStyle = "#6fe0c6";
  g.beginPath();
  g.arc(122, 880, 11, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(242,237,226,.8)";
  g.font = `600 38px ${SANS}`;
  g.fillText("uptick", 148, 882);
  g.fillStyle = "rgba(242,237,226,.34)";
  g.font = `400 30px ${SANS}`;
  g.fillText("upticklocal.com", 290, 884);

  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  textureCache.set(key, t);
  return t;
}
