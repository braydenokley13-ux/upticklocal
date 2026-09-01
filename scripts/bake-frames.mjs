/**
 * Bakes the still frames the site shows where the live model does not run
 * (phones, portrait tablets, browsers without WebGL).
 *
 *   1. start the site:   npm run build && npm run start
 *   2. bake:             node scripts/bake-frames.mjs [http://localhost:3000] [wide|portrait]
 *
 * Needs Playwright with a Chromium (globally installed is fine: set NODE_PATH
 * to its node_modules). Frames are rendered by the same scene the live
 * cinematic uses, so the stills and the live model never drift apart.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// CommonJS resolution so a globally installed Playwright (NODE_PATH) works too.
const { chromium } = createRequire(import.meta.url)("playwright");

const base = process.argv[2] ?? "http://localhost:3000";
const only = process.argv[3]; // optional: "wide" or "portrait"
const out = new URL("../public/frames/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const FRAMES = ["hero", "model", "signal", "screen", "finale"];
const SIZES = {
  wide: { width: 1600, height: 1000 },
  portrait: { width: 1080, height: 1350 },
};

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

for (const [orientation, viewport] of Object.entries(SIZES)) {
  if (only && only !== orientation) continue;
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  for (const name of FRAMES) {
    await page.goto(`${base}/?still=${name}&q=high`, { waitUntil: "load" });
    await page.waitForFunction(() => document.documentElement.dataset.still === "ready", null, { timeout: 180000 });
    await page.waitForTimeout(300);
    // Encode in the browser: Chromium writes WebP, so no image library is needed here.
    const png = await page.screenshot({ type: "png" });
    const webp = await page.evaluate(
      async ([b64, w, h]) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0);
        return c.toDataURL("image/webp", 0.86).split(",")[1];
      },
      [png.toString("base64"), viewport.width, viewport.height]
    );
    const file = join(out, `${name}-${orientation}.webp`);
    writeFileSync(file, Buffer.from(webp, "base64"));
    console.log(`${name}-${orientation}.webp  ${Math.round(Buffer.byteLength(webp, "base64") / 1024)} KB`);
  }
  await page.close();
}
await browser.close();
