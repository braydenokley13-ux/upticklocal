import {bundle} from '@remotion/bundler';
import {openBrowser, renderFrames, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'blender/screens/acquisition');
const browserExecutable = process.env.FILM_CHROME || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
await mkdir(output, {recursive:true});
const serveUrl = await bundle({entryPoint:path.join(root,'film/index.ts'),publicDir:path.join(root,'public')});
const browser = await openBrowser('chrome', {browserExecutable});
try {
  for (const state of ['placement','pass','redeemed','permission','friday','paid']) {
    const composition=await selectComposition({serveUrl,id:`Acquisition-${state}`,puppeteerInstance:browser});
    await renderStill({serveUrl,composition,puppeteerInstance:browser,
      output:path.join(output,`${state}.png`),imageFormat:'png',frame:0,logLevel:'error'});
    if (state === 'permission') {
      const sequenceDir=path.join(output,'permission');
      await rm(sequenceDir,{recursive:true,force:true});
      await mkdir(sequenceDir,{recursive:true});
      await renderFrames({serveUrl,composition,puppeteerInstance:browser,
        outputDir:null,imageFormat:'png',
        onFrameBuffer:(buffer,frame)=>writeFile(path.join(sequenceDir,`${String(frame).padStart(4,'0')}.png`),buffer),
        inputProps:{state},concurrency:1,muted:true,logLevel:'error',
        onStart:()=>{},onFrameUpdate:()=>{}});
      await renderStill({serveUrl,composition,puppeteerInstance:browser,
        output:path.join(output,'permission-accepted.png'),imageFormat:'png',frame:100,logLevel:'error'});
    }
    console.log(`Baked ${state}`);
  }
  for(const sourceId of ['quick-lube','ridge-tire','uptick-screen']) {
    const composition=await selectComposition({serveUrl,id:`Acquisition-Placement-${sourceId}`,puppeteerInstance:browser});
    await renderStill({serveUrl,composition,puppeteerInstance:browser,output:path.join(output,`placement-${sourceId}.png`),imageFormat:'png',frame:0,logLevel:'error'});
  }
  const files=['film/data/acquisition.json','film/compositions/acquisition/Surfaces.tsx'];
  const hashes={};
  for (const file of files) hashes[file]=createHash('sha256').update(await readFile(path.join(root,file))).digest('hex');
  await writeFile(path.join(output,'manifest.json'),JSON.stringify({sourceHashes:hashes,permissionFrames:144},null,2));
} finally {
  await browser.close({silent:true});
  await rm(serveUrl,{recursive:true,force:true});
}
