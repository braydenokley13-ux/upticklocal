import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const lane=process.argv[2];
if(!['proxy','final'].includes(lane)) throw new Error('Usage: node scripts/acquisition-export.mjs proxy|final');
if(process.platform!=='linux') throw new Error('Full acquisition exports run on cloud Linux, not the constrained Mac.');
const config=JSON.parse(await readFile(path.join(root,'film/render/acquisition-shots.json'),'utf8'));
let hash;
for(const shot of config.shots) {
  const meta=JSON.parse(await readFile(path.join(root,`public/film-rd/acquisition/plates/${lane}/${shot.id}.json`),'utf8'));
  if(meta.frames!==shot.frames || meta.lane!==lane || meta.fps!==24) throw new Error(`Wrong plate: ${shot.id}`);
  if(hash && meta.sourceHash!==hash) throw new Error(`Mixed source revisions: ${shot.id}`);
  hash=meta.sourceHash;
}
const probe=spawnSync('python3',['-c',"import runpy; x=runpy.run_path('scripts/acquisition-render-worker.py'); print(x['source_hash']())"],{cwd:root,encoding:'utf8'});
if(probe.status!==0 || probe.stdout.trim()!==hash) throw new Error('Plate manifests do not match current source files');
let opening='customer';
for(const gate of lane==='final'?['gate-a-approval','gate-b-approval','final-frame-approval']:['gate-a-approval']) {
  const approval=JSON.parse(await readFile(path.join(root,`film/review/acquisition/${gate}.json`),'utf8'));
  if(approval.status!=='PASS' || approval.sourceHash!==hash) throw new Error(`Stale or missing ${gate}`);
  if(gate==='gate-b-approval') opening=approval.opening;
}
if(!['customer','owner'].includes(opening)) throw new Error('Gate B must select the opening');
const output=path.join(root,lane==='proxy'?'film/review/acquisition/full-proxy':'public/film-rd/acquisition/final');
await mkdir(output,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'film/index.ts'),publicDir:path.join(root,'public')});
let browser;
try {
  browser=await openBrowser('chrome',{browserExecutable:process.env.FILM_CHROME});
  for(const choice of lane==='proxy'?['owner','customer']:[opening]) {
    const inputProps={lane,opening:choice,sound:true};
    const composition=await selectComposition({serveUrl,id:'Acquisition-Film',inputProps,puppeteerInstance:browser});
    await renderMedia({serveUrl,composition,inputProps,puppeteerInstance:browser,codec:'h264',audioCodec:'aac',
      crf:lane==='proxy'?24:16,scale:lane==='proxy'?1/3:1,concurrency:2,outputLocation:path.join(output,lane==='proxy'?`uptick-${choice}-proxy.mp4`:'uptick-growth-master-1080p.mp4')});
  }
  if(lane==='final') {
    const inputProps={lane};
    const composition=await selectComposition({serveUrl,id:'Acquisition-Teaser',inputProps,puppeteerInstance:browser});
    await renderMedia({serveUrl,composition,inputProps,puppeteerInstance:browser,codec:'h264',crf:18,concurrency:2,outputLocation:path.join(output,'uptick-growth-teaser-15s.mp4')});
    const filmProps={lane,opening,sound:false};
    const film=await selectComposition({serveUrl,id:'Acquisition-Film',inputProps:filmProps,puppeteerInstance:browser});
    for(const [name,frame] of [['external',110],['return',1070],['network',1300]]) {
      await renderStill({serveUrl,composition:film,inputProps:filmProps,puppeteerInstance:browser,frame,imageFormat:'png',output:path.join(output,`poster-candidate-${name}.png`)});
    }
  }
  await writeFile(path.join(output,'export.json'),JSON.stringify({sourceHash:hash,lane,opening,frames:1608,fps:24,seconds:67,
    status:'RENDERED; playback, final validation, sound measurement and poster selection still required'},null,2));
} finally {
  if(browser) await browser.close({silent:true});
  await rm(serveUrl,{recursive:true,force:true});
}
