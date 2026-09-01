import * as THREE from "three";

/**
 * Every texture in the model is drawn once into a canvas: the sky, the light
 * pools, the fascia lettering, and the screen content. No image downloads.
 */

const cache = new Map<string, THREE.Texture>();
const disposables: THREE.Texture[] = [];

function track<T extends THREE.Texture>(t: T): T {
  disposables.push(t);
  return t;
}

export function disposeTextures() {
  disposables.forEach((t) => t.dispose());
  disposables.length = 0;
  cache.clear();
}

function canvasOf(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

/** The site's fonts, as the canvas sees them. Resolved from the CSS variables next/font sets. */
export function fontFamilies() {
  const css = getComputedStyle(document.documentElement);
  const sans = css.getPropertyValue("--font-sans").trim() || "system-ui, sans-serif";
  const mono = css.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
  return { sans, mono };
}

/** Blue-hour dome: used as the PMREM source, the backdrop and the fog colour. */
export function skyEquirect(): THREE.Texture {
  const { c, g } = canvasOf(1024, 512);
  const v = g.createLinearGradient(0, 0, 0, 512);
  v.addColorStop(0, "#050c12");
  v.addColorStop(0.36, "#0b1c28");
  v.addColorStop(0.5, "#153447");
  v.addColorStop(0.545, "#2b5a6c"); // the last light, low on the horizon
  v.addColorStop(0.58, "#1b3542");
  v.addColorStop(0.7, "#0e1b22");
  v.addColorStop(1, "#070d11");
  g.fillStyle = v;
  g.fillRect(0, 0, 1024, 512);
  const t = track(new THREE.CanvasTexture(c));
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Soft radial falloff for light pools and lamp glow. */
export function glowTexture(): THREE.Texture {
  const hit = cache.get("glow");
  if (hit) return hit;
  const { c, g } = canvasOf(128, 128);
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.3, "rgba(255,255,255,.5)");
  r.addColorStop(0.65, "rgba(255,255,255,.1)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set("glow", t);
  return t;
}

/** A flat elliptical pool for the pavement in front of a lit shopfront. */
export function poolTexture(): THREE.Texture {
  const hit = cache.get("pool");
  if (hit) return hit;
  const { c, g } = canvasOf(256, 128);
  const r = g.createRadialGradient(128, 64, 0, 128, 64, 128);
  r.addColorStop(0, "rgba(255,255,255,.9)");
  r.addColorStop(0.45, "rgba(255,255,255,.28)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 128);
  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set("pool", t);
  return t;
}

/** The signal: a soft ring of light, drawn radially so it stays soft as it scales. */
export function waveTexture(): THREE.Texture {
  const hit = cache.get("wave");
  if (hit) return hit;
  const { c, g } = canvasOf(512, 512);
  const r = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  r.addColorStop(0, "rgba(255,255,255,0)");
  r.addColorStop(0.84, "rgba(255,255,255,0)");
  r.addColorStop(0.93, "rgba(255,255,255,.55)");
  r.addColorStop(0.965, "rgba(255,255,255,1)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 512, 512);
  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set("wave", t);
  return t;
}

/** Warm interior card: the light inside a shop, seen through the glazing. */
export function interiorTexture(): THREE.Texture {
  const hit = cache.get("interior");
  if (hit) return hit;
  const { c, g } = canvasOf(16, 128);
  const v = g.createLinearGradient(0, 0, 0, 128);
  v.addColorStop(0, "#ffffff");
  v.addColorStop(0.4, "#f7eee0");
  v.addColorStop(1, "#a99783");
  g.fillStyle = v;
  g.fillRect(0, 0, 16, 128);
  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set("interior", t);
  return t;
}

/** Fascia lettering. Ivory on a transparent ground; the fascia itself is geometry. */
export function signTexture(text: string, bright = false): THREE.Texture {
  const key = `sign:${text}:${bright}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { c, g } = canvasOf(1024, 128);
  const { sans } = fontFamilies();
  g.clearRect(0, 0, 1024, 128);
  g.fillStyle = bright ? "rgba(246,240,230,.98)" : "rgba(236,229,216,.82)";
  g.font = `500 62px ${sans}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.letterSpacing = "16px";
  g.fillText(text, 512 + 8, 66);
  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/**
 * The 21" unit's content. Rendered at 1600×900; the final shot puts this
 * panel across the whole viewport, and the DOM surface that takes over from
 * it is laid out to the same proportions (see ScreenMatch).
 */
export function screenTexture(offerText: string): THREE.Texture {
  const key = `screen:${offerText}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const W = 1600;
  const H = 900;
  const { c, g } = canvasOf(W, H);
  const { sans, mono } = fontFamilies();

  const grad = g.createLinearGradient(0, 0, W * 0.4, H);
  grad.addColorStop(0, "#0f2a2d");
  grad.addColorStop(1, "#061416");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * 0.2, H * 0.15, 20, W * 0.2, H * 0.15, W * 0.7);
  glow.addColorStop(0, "rgba(232,172,92,.16)");
  glow.addColorStop(1, "rgba(232,172,92,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);

  g.textBaseline = "alphabetic";
  g.textAlign = "left";

  // eyebrow
  g.fillStyle = "#e7a94f";
  g.font = `500 30px ${mono}`;
  g.letterSpacing = "8px";
  g.fillText("EXAMPLE OFFER", 112, 150);
  g.letterSpacing = "0px";

  // offer, two lines
  g.fillStyle = "#f4efe6";
  g.font = `500 136px ${sans}`;
  g.letterSpacing = "-4px";
  const words = offerText.split(" ");
  const cut = Math.min(3, words.length);
  g.fillText(words.slice(0, cut).join(" "), 104, 400);
  g.fillText(words.slice(cut).join(" "), 104, 546);
  g.letterSpacing = "0px";

  g.fillStyle = "rgba(244,239,230,.62)";
  g.font = `400 40px ${sans}`;
  g.fillText("Scan to claim. Redeem on your phone.", 112, 660);

  // the code — a finder-pattern stand-in, deliberately not scannable
  const qs = 240;
  const qx = W - 112 - qs;
  const qy = H / 2 - qs / 2 - 30;
  g.fillStyle = "#f4efe6";
  g.beginPath();
  g.roundRect(qx, qy, qs, qs, 14);
  g.fill();
  g.fillStyle = "#061416";
  ([
    [qx + 26, qy + 26],
    [qx + qs - 26 - 56, qy + 26],
    [qx + 26, qy + qs - 26 - 56],
  ] as const).forEach(([x, y]) => {
    g.fillRect(x, y, 56, 56);
    g.fillStyle = "#f4efe6";
    g.fillRect(x + 10, y + 10, 36, 36);
    g.fillStyle = "#061416";
    g.fillRect(x + 18, y + 18, 20, 20);
  });
  for (let i = 0; i < 9; i++) {
    const x = qx + 108 + (i % 3) * 30;
    const y = qy + 108 + Math.floor(i / 3) * 30;
    if ((i * 7) % 3 !== 1) g.fillRect(x, y, 18, 18);
  }
  g.fillStyle = "rgba(244,239,230,.62)";
  g.font = `500 24px ${mono}`;
  g.letterSpacing = "6px";
  g.textAlign = "center";
  g.fillText("SCAN TO CLAIM", qx + qs / 2 + 3, qy + qs + 56);
  g.letterSpacing = "0px";
  g.textAlign = "left";

  // the mark
  g.fillStyle = "#6fe0c6";
  g.beginPath();
  g.arc(122, H - 112, 9, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(244,239,230,.86)";
  g.font = `500 34px ${sans}`;
  g.fillText("uptick local", 146, H - 100);

  const t = track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}
