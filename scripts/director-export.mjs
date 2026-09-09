import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const lane=process.argv[2]??'review';
if(!['review','proxy','final'].includes(lane))throw Error('Usage: director-export.mjs review|proxy|final [network|customer|owner]');
const opening=process.argv[3]??'network';
if(!['network','customer','owner'].includes(opening))throw Error('Unknown opening');
const plan=JSON.parse(await readFile(path.join(root,'film/final-director/edit.json'),'utf8'));
if(lane!=='review'){
 const r=spawnSync('python3',['scripts/director-production.py','verify-plates','--lane',lane],{cwd:root,stdio:'inherit'});
 if(r.status!==0)throw Error('Fresh, complete plates are required');
}
if(lane==='final'){
 if(process.platform!=='linux')throw Error('The expensive final master belongs on the Opus Linux worker.');
 const r=spawnSync('python3',['scripts/director-production.py','verify-lock'],{cwd:root,stdio:'inherit'});
 if(r.status!==0)throw Error('Creative lock is not approved');
}
const out=path.join(root,lane==='final'?'public/film-rd/director/final':'film/final-director/review');
await mkdir(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'film/index.ts'),publicDir:path.join(root,'public')});
let browser;
try{
 browser=await openBrowser('chrome',{browserExecutable:process.env.FILM_CHROME});
 const inputProps={lane,opening,sound:true};
 const composition=await selectComposition({serveUrl,id:'Director-Film',inputProps,puppeteerInstance:browser});
 const filename=`director-${lane}-${opening}.mp4`;
 await renderMedia({serveUrl,composition,inputProps,puppeteerInstance:browser,codec:'h264',audioCodec:'aac',
  crf:lane==='final'?16:23,scale:lane==='final'?1:.5,concurrency:1,outputLocation:path.join(out,filename)});
 for(const frame of [24,180,312,396,546,648,756,840,972,1080,1176]){
  await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,frame,scale:.5,imageFormat:'jpeg',output:path.join(out,`${lane}-${String(frame).padStart(4,'0')}.jpg`)});
 }
 await writeFile(path.join(out,`export-${lane}-${opening}.json`),JSON.stringify({lane,opening,frames:plan.frames,fps:24,
  seconds:plan.frames/24,file:filename,status:lane==='review'?'EDITORIAL ONLY; TEMPORARY IMAGERY':'RENDERED; inspection required'},null,2));
}finally{if(browser)await browser.close({silent:true});await rm(serveUrl,{recursive:true,force:true});}
