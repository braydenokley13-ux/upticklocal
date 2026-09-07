/**
 * The render manifest, derived from the cut rather than from the render script.
 *
 *   npx tsx scripts/film-manifest.ts        # → film/render/manifest.json
 *
 * Every physical plate's required frame range comes from the composition that uses it, so the
 * queue can never drift into rendering frames the edit does not show. The encoded plate is
 * indexed from its own frame 0, so a shot's head frames must exist even when the edit skips
 * them; only the tail is free.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { SHOTS8 } from "../film/compositions/acts/Act8Redeem";
import { SHOTS9 } from "../film/compositions/acts/Act9Return";
import { ACT6_FRAMES } from "../film/compositions/acts/Act6TwoWays";
import { HERO1A_FRAMES } from "../film/compositions/hero1/Hero1A";
import { ACT5_FRAMES } from "../film/compositions/acts/Act5Approve";
import { PLATES } from "../film/block/plate";

const nameOf = (src: string) => src.replace(/^.*\//, "").replace(/\.mp4$/, "");

type Row = { shot: string; act: string; first: number; last: number; frames: number; engine: string };
const rows: Row[] = [];
const push = (shot: string, act: string, first: number, last: number) =>
  rows.push({ shot, act, first, last, frames: last + 1, engine: "CYCLES" });

push("cafe", "VI", 0, 25);
push("scan", "VI", 0, 45);
for (const s of SHOTS8) push(nameOf(s.src), "VIII", s.head, s.head + s.len - 1);
for (const s of SHOTS9) push(nameOf(s.src), "IX–XI", s.head, s.head + s.len - 1);
push("hero3a", "V", 0, 143);
push("hero1a", "I", 0, 143);

const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  note: "frames = the length the encoded plate must have; first/last = the range the cut shows",
  fps: 24,
  lanes: {
    proxy: { resolution: "640x360", samples: 8, secondsPerFrame: 7.3, dir: "public/film-rd/plates/proxy" },
    final: { resolution: "1280x720", samples: 18, secondsPerFrame: 50, dir: "public/film-rd/plates" },
  },
  actFrames: { VI: ACT6_FRAMES, V: ACT5_FRAMES, I: HERO1A_FRAMES },
  plates: rows,
  totals: { frames: rows.reduce((n, r) => n + r.frames, 0), shots: rows.length },
};
mkdirSync("film/render", { recursive: true });
writeFileSync("film/render/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`${manifest.totals.shots} shots · ${manifest.totals.frames} frames → film/render/manifest.json`);
for (const r of rows) console.log(`  ${r.shot.padEnd(14)} ${String(r.frames).padStart(4)}  ${r.first}–${r.last}  ${r.act}`);
