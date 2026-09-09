// Assemble the whole edit from proxy plates, for review only.
//
// acquisition-export.mjs refuses to run without a matching gate approval, and
// that refusal is the point: it is what stops an unreviewed cut being presented
// as a finished film. This script does not touch those files and cannot produce
// a master. It exists so the cut can be watched -- muted, with sound, and
// against the owner comprehension checks -- before anyone claims a gate.
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const config = JSON.parse(await readFile(path.join(root, 'film/render/acquisition-shots.json'), 'utf8'));
// Frame budgets are enforced -- a plate that no longer fits its slot is a real
// error. Mixed source revisions are reported rather than refused: an editorial
// change to the act boundaries moves the source hash without touching a single
// physical shot, and re-rendering fourteen plates to watch a cut is a poor
// trade. acquisition-export.mjs still refuses outright, which is what protects
// the master; this cannot produce one.
const revisions = new Map();
for (const shot of config.shots) {
  const meta = JSON.parse(await readFile(path.join(root, `public/film-rd/acquisition/plates/proxy/${shot.id}.json`), 'utf8'));
  if (meta.frames !== shot.frames || meta.fps !== 24) {
    throw new Error(`Wrong plate: ${shot.id} is ${meta.frames} frames at ${meta.fps} fps, the edit wants ${shot.frames} at 24`);
  }
  revisions.set(meta.sourceHash, [...(revisions.get(meta.sourceHash) ?? []), shot.id]);
}
const hash = [...revisions.keys()][0];
if (revisions.size > 1) {
  console.warn(`NOTE: ${revisions.size} source revisions across the plates, which is expected after an editorial change:`);
  for (const [rev, shots] of revisions) console.warn(`  ${rev.slice(0, 12)}  ${shots.join(' ')}`);
}
const output = path.join(root, 'film/review/acquisition/full-proxy');
await mkdir(output, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'film/index.ts'), publicDir: path.join(root, 'public')});
let browser;
try {
  browser = await openBrowser('chrome', {browserExecutable: process.env.FILM_CHROME});
  for (const opening of ['customer', 'owner']) {
    for (const sound of [true, false]) {
      if (opening === 'owner' && !sound) continue;   // the muted pass only needs one opening
      const inputProps = {lane: 'proxy', opening, sound};
      const composition = await selectComposition({serveUrl, id: 'Acquisition-Film', inputProps, puppeteerInstance: browser});
      const name = `review-${opening}${sound ? '' : '-muted'}.mp4`;
      await renderMedia({serveUrl, composition, inputProps, puppeteerInstance: browser, codec: 'h264',
        audioCodec: sound ? 'aac' : undefined, crf: 23, scale: 1 / 2, concurrency: 2,
        outputLocation: path.join(output, name)});
      console.log('wrote', name);
    }
  }
  await writeFile(path.join(output, 'review.json'), JSON.stringify({
    sourceHash: hash, lane: 'proxy', frames: 1608, fps: 24, seconds: 67,
    revisions: Object.fromEntries([...revisions].map(([rev, shots]) => [rev.slice(0, 12), shots])),
    status: 'REVIEW CUT ONLY. No gate is approved and this is not a master.',
  }, null, 2));
} finally {
  if (browser) await browser.close({silent: true});
  await rm(serveUrl, {recursive: true, force: true});
}
