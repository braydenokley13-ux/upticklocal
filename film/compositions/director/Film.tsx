import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import edit from '../../final-director/edit.json';
import {FONT, COLOR as C} from '../../tokens';
import {useFilmFonts} from '../../typography/fonts';

export type DirectorProps = {lane:'review'|'proxy'|'final'; sound:boolean; opening:'network'|'customer'|'owner'};
export const DIRECTOR_FRAMES=edit.frames;
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

function Picture({name,lane,start=0,style}:{name:string;lane:DirectorProps['lane'];start?:number;style?:React.CSSProperties}) {
  return <OffthreadVideo muted src={staticFile(`film-rd/director/plates/${lane}/${name}.mp4`)} startFrom={start}
    style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',...style}}/>;
}

function Copy({headline,eyebrow,delay=0,side=false}:{headline:string;eyebrow?:string;delay?:number;side?:boolean}) {
  const f=useCurrentFrame();
  const a=interpolate(f,[delay,delay+8],[0,1],clamp);
  return <div style={{position:'absolute',inset:0,opacity:a,background:side?'linear-gradient(90deg,#030e14 0%,#030e14 32%,rgba(3,14,20,.15) 54%,transparent 66%)':'linear-gradient(transparent 42%,rgba(3,14,20,.76))'}}>
    <div style={{position:'absolute',left:104,bottom:148,width:side?560:1450,color:C.onMarine}}>
      {eyebrow&&<div style={{fontFamily:FONT.mono,fontSize:24,letterSpacing:3.2,marginBottom:22,color:C.mint}}>{eyebrow}</div>}
      <div style={{fontFamily:FONT.sans,fontWeight:400,fontSize:68,letterSpacing:-1.8,lineHeight:1.12,whiteSpace:'pre-line'}}>{headline}</div>
    </div>
  </div>;
}

function Proof({lane}:{lane:DirectorProps['lane']}) {
  const examples=[{name:'first',start:0},{name:'permission',start:72},{name:'paid',start:0}];
  return <AbsoluteFill style={{background:C.marine}}>
    {examples.map((s,i)=><div key={s.name} style={{position:'absolute',left:i*640+6,top:120,width:628,height:750,overflow:'hidden'}}>
      <Picture name={s.name} lane={lane} start={s.start} style={{objectFit:'cover'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(transparent 48%,rgba(3,14,20,.95))'}}/>
      <div style={{position:'absolute',left:38,bottom:52,fontSize:48,letterSpacing:-1,color:C.canvas}}>{edit.proofLabels[i]}</div>
    </div>)}
    <div style={{position:'absolute',left:104,bottom:130,color:C.onMarineSoft,fontSize:27}}>One illustrative journey. Three observable steps.</div>
  </AbsoluteFill>;
}

function Closing({lane}:{lane:DirectorProps['lane']}) {
  return <AbsoluteFill>
    <Picture name="station" lane={lane}/>
    <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(3,14,20,.92),rgba(3,14,20,.35))'}}/>
    <div style={{position:'absolute',left:104,top:230,color:C.onMarine}}>
      <div style={{color:C.mint,fontSize:32,letterSpacing:7}}>{edit.closing.brand}</div>
      <div style={{fontFamily:FONT.serif,fontStyle:'italic',fontSize:126,lineHeight:1.02,letterSpacing:-2,whiteSpace:'pre-line',marginTop:40}}>{edit.closing.headline}</div>
      <div style={{fontSize:33,marginTop:42,maxWidth:920,lineHeight:1.35}}>{edit.closing.detail}</div>
    </div>
  </AbsoluteFill>;
}

function Opening({lane,opening}:{lane:DirectorProps['lane'];opening:DirectorProps['opening']}) {
  if(opening==='customer') return <AbsoluteFill>
    <Sequence durationInFrames={96}><Picture name="encounter" lane={lane}/><Copy headline="Your next customer\nis already nearby." eyebrow="MAIN STREET CAR WASH"/></Sequence>
    <Sequence from={96} durationInFrames={24}><Picture name="lube" lane={lane}/></Sequence>
    <Sequence from={120} durationInFrames={24}><Picture name="tire" lane={lane}/></Sequence>
  </AbsoluteFill>;
  if(opening==='owner') return <AbsoluteFill>
    <Sequence durationInFrames={96}><Picture name="station" lane={lane}/><Copy headline="More drivers pass nearby.\nGive them a reason to stop." eyebrow="UPTICK GROWTH"/></Sequence>
    <Sequence from={96} durationInFrames={48}><Picture name="encounter" lane={lane}/></Sequence>
  </AbsoluteFill>;
  return <AbsoluteFill>
    {edit.edit.filter(s=>s.from<144).map(s=><Sequence key={s.id} from={s.from} durationInFrames={s.duration}>
      <Picture name={s.plate!} lane={lane}/>
      {s.copy&&<Copy headline={s.copy} eyebrow={s.eyebrow}/>}
    </Sequence>)}
    <Sequence from={72} durationInFrames={72}><Copy headline={edit.networkCopy}/></Sequence>
  </AbsoluteFill>;
}

export function DirectorFilm({lane='review',sound=true,opening='network'}:DirectorProps) {
  useFilmFonts();
  return <AbsoluteFill style={{fontFamily:FONT.sans,background:C.marine}}>
    <Sequence durationInFrames={144}><Opening lane={lane} opening={opening}/></Sequence>
    {edit.edit.filter(s=>s.from>=144).map(s=><Sequence key={s.id} from={s.from} durationInFrames={s.duration}>
      {s.id==='proof'?<Proof lane={lane}/>:s.id==='closing'?<Closing lane={lane}/>:<>
        <Picture name={s.plate!} lane={lane} start={s.start}/>
        {s.copy&&<Copy headline={s.copy} eyebrow={s.eyebrow} delay={s.copyDelay??0} side={['permission','offer','paid'].includes(s.id)}/>}
      </>}
    </Sequence>)}
    <Sequence from={288} durationInFrames={72}><Copy headline="0.7 mi. From nearby to Joe’s."/></Sequence>
    <div style={{position:'absolute',left:0,right:0,top:0,height:90,background:C.marine}}/>
    <div style={{position:'absolute',left:0,right:0,bottom:0,height:90,background:C.marine}}/>
    <div style={{position:'absolute',left:104,bottom:32,fontSize:22,color:C.onMarineSoft}}>{edit.disclaimer}</div>
    {lane==='review'&&<div style={{position:'absolute',right:60,top:32,color:C.amber,fontFamily:FONT.mono,fontSize:20}}>EDITORIAL REVIEW · TEMPORARY IMAGERY</div>}
    {sound&&edit.sound.map((s,i)=><Sequence key={i} from={s.at} durationInFrames={s.frames}>
      <Audio src={staticFile(`film-rd/audio/${s.file}.ogg`)} startFrom={s.offset??0}
        volume={f=>s.gain*Math.min(1,f/4,Math.max(0,(s.frames-f)/10))}/>
    </Sequence>)}
  </AbsoluteFill>;
}

export function DirectorTeaser({lane='review',sound=true,opening='network'}:DirectorProps) {
  useFilmFonts();
  const parts=[{at:0,n:24,plate:'wash',start:0,copy:'Somewhere else.'},{at:24,n:24,plate:'lube',start:0,copy:'Somewhere else.'},{at:48,n:48,plate:'encounter',start:48,copy:'Reached by Uptick.'},
    {at:96,n:48,plate:'first',start:24,copy:'A first visit.'},{at:144,n:48,plate:'permission',start:90,copy:'Their permission.'},
    {at:192,n:72,plate:'return',start:24,copy:'Back at Joe’s.'}];
  return <AbsoluteFill style={{background:C.marine,fontFamily:FONT.sans}}>
    {parts.map(p=><Sequence key={p.at} from={p.at} durationInFrames={p.n}><Picture name={p.plate} lane={lane} start={p.start}/><Copy headline={p.copy}/></Sequence>)}
    <Sequence from={264} durationInFrames={96}><Closing lane={lane}/></Sequence>
    {sound&&<Audio src={staticFile('film-rd/audio/street-morning.ogg')} volume={.3}/>}
    <div style={{position:'absolute',left:0,right:0,bottom:0,height:84,background:C.marine,padding:'25px 104px',fontSize:22,color:C.onMarineSoft}}>{edit.disclaimer}</div>
    {lane==='review'&&<div style={{position:'absolute',top:25,right:50,fontSize:22,color:C.amber}}>EDITORIAL REVIEW</div>}
  </AbsoluteFill>;
}
