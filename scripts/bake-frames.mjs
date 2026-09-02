/**
 * Bakes the phone's still frames from the same model the desktop renders live.
 *
 *   1. start the site:   npm run dev   (or npm run build && npm run start)
 *   2. bake:             node scripts/bake-frames.mjs [http://localhost:3000] [frame ...]
 *
 * Needs Playwright with a Chromium (a global install is fine: set NODE_PATH to
 * its node_modules). Each frame in lib/three/shots.ts `MOBILE` is rendered at
 * its own size, then encoded at two widths so a 375px phone at 2× and a 430px
 * phone at 3× each get a file that fits. The screen frame also records where
 * the panel sits in the picture, so the page can lay live DOM over it.
 *
 * Output: public/frames/<name>-<width>.webp and lib/frames.json.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const { chromium } = createRequire(import.meta.url)("playwright");

const base = process.argv[2] ?? "http://localhost:3000";
const only = process.argv.slice(3);
const out = new URL("../public/frames/", import.meta.url).pathname;
const manifestPath = new URL("../lib/frames.json", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

/** The frames and their bake sizes, read off the source so the two never drift. */
const shots = readFileSync(new URL("../lib/three/shots.ts", import.meta.url), "utf8");
const FRAMES = [...shots.matchAll(/^\s+(\w+): \{ shot:.*size: \[(\d+), (\d+)\] \}/gm)].map((m) => ({ name: m[1], width: Number(m[2]), height: Number(m[3]) }));
if (FRAMES.length === 0) throw new Error("no MOBILE frames found in lib/three/shots.ts");

const WIDTHS = [780, 1170];
const QUALITY = 0.84;

let manifest = {};
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch {}

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

for (const frame of FRAMES) {
  if (only.length && !only.includes(frame.name)) continue;
  const page = await browser.newPage({ viewport: { width: frame.width, height: frame.height }, deviceScaleFactor: 1 });
  await page.goto(`${base}/?still=m:${frame.name}&q=high`, { waitUntil: "load" });
  await page.waitForFunction(() => document.documentElement.dataset.still === "ready", null, { timeout: 180000 });
  await page.waitForTimeout(300);
  const png = await page.screenshot({ type: "png" });
  const panel = await page.evaluate(() => window.__still?.panel);
  // Encode in the browser: Chromium writes WebP, so no image library is needed here.
  const encoded = await page.evaluate(
    async ([b64, widths, quality]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      return widths.map((w) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = Math.round((img.height * w) / img.width);
        const g = c.getContext("2d");
        g.imageSmoothingQuality = "high";
        g.drawImage(img, 0, 0, c.width, c.height);
        return c.toDataURL("image/webp", quality).split(",")[1];
      });
    },
    [png.toString("base64"), WIDTHS, QUALITY]
  );
  const sizes = [];
  encoded.forEach((b64, i) => {
    const file = join(out, `${frame.name}-${WIDTHS[i]}.webp`);
    writeFileSync(file, Buffer.from(b64, "base64"));
    sizes.push(`${WIDTHS[i]}w ${Math.round(Buffer.byteLength(b64, "base64") / 1024)} KB`);
  });
  manifest[frame.name] = { width: frame.width, height: frame.height, ...(frame.name === "screen" ? { panel } : {}) };
  console.log(`${frame.name}  ${sizes.join("  ")}`);
  await page.close();
}
await browser.close();

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${manifestPath}`);
