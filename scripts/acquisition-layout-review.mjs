import {bundle} from '@remotion/bundler';
import {openBrowser,renderStill,selectComposition} from '@remotion/renderer';
import {rm} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const serveUrl=await bundle({entryPoint:path.join(root,'film/index.ts'),publicDir:path.join(root,'public')});
let browser;
try{
  browser=await openBrowser('chrome',{browserExecutable:process.env.FILM_CHROME || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined)});
  const inputProps={lane:'proxy',opening:'customer',sound:false};
  const composition=await selectComposition({serveUrl,id:'Acquisition-Film',inputProps,puppeteerInstance:browser});
  for(const [name,frame] of [['proof-layout',1430],['closing-layout',1550]]){
    await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,frame,output:path.join(root,`film/review/acquisition/${name}.png`),imageFormat:'png',logLevel:'error'});
  }
}finally{
  if(browser)await browser.close({silent:true});
  await rm(serveUrl,{recursive:true,force:true});
}
