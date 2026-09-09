import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';
import {cp, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const scratch=await mkdtemp(path.join(tmpdir(),'uptick-opening-'));
const publicDir=path.join(scratch,'public');
await mkdir(path.join(publicDir,'film-rd/acquisition'),{recursive:true});
await cp(path.join(root,'public/film-rd/acquisition/review'),path.join(publicDir,'film-rd/acquisition/review'),{recursive:true});
await cp(path.join(root,'public/film-rd/fonts'),path.join(publicDir,'film-rd/fonts'),{recursive:true});
let serveUrl;
let browser;
try {
  serveUrl=await bundle({entryPoint:path.join(root,'film/index.ts'),publicDir});
  browser=await openBrowser('chrome',{browserExecutable:process.env.FILM_CHROME || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined)});
  for(const order of ['owner','customer']) {
    const composition=await selectComposition({serveUrl,id:`Acquisition-Opening-${order}`,puppeteerInstance:browser});
    await renderMedia({serveUrl,composition,puppeteerInstance:browser,codec:'h264',crf:24,concurrency:1,
      outputLocation:path.join(root,`film/review/acquisition/opening-${order}.mp4`),muted:true,logLevel:'error'});
    console.log(`Rendered 12-second ${order}-first editorial test (held frames; not full proxy).`);
  }
} finally {
  if(browser) await browser.close({silent:true});
  if(serveUrl) await rm(serveUrl,{recursive:true,force:true});
  await rm(scratch,{recursive:true,force:true});
}
