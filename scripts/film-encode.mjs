/**
 * Encodes a Blender PNG sequence into the MP4 plate Remotion composites.
 *
 *   node scripts/film-encode.mjs hero1            # public/film-rd/plates/seq/hero1/*.png → public/film-rd/plates/hero1.mp4
 *
 * Uses Remotion's bundled ffmpeg so no system install is needed. Keyframes
 * every 12 frames keep seeking exact in the browser lab; CRF 15 keeps the
 * plate visually lossless for the composite.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const shot = process.argv[2];
if (!shot) throw new Error("usage: node scripts/film-encode.mjs <shot>");
const seq = join("public/film-rd/plates/seq", shot);
const frames = readdirSync(seq).filter((f) => f.endsWith(".png")).sort();
if (frames.length === 0) throw new Error(`no frames in ${seq}`);
const out = join("public/film-rd/plates", `${shot}.mp4`);
const args = ["ffmpeg", "-y", "-framerate", "24", "-i", join(seq, "%04d.png"), "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-g", "12", "-movflags", "+faststart", out];
execFileSync("npx", ["remotion", ...args], { stdio: "inherit" });
console.log(`${frames.length} frames → ${out}${existsSync(out) ? "" : " (missing!)"}`);
