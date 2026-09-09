import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ACQUISITION as A, ACQUISITION_TOTALS as TOTALS} from '../../data/acquisition';
import {COLOR as C, FONT} from '../../tokens';
import {useFilmFonts} from '../../typography/fonts';

export type AcquisitionLane='proxy'|'final';
export type AcquisitionFilmProps={lane:AcquisitionLane;opening:'customer'|'owner';sound:boolean};
export const ACQUISITION_FRAMES=1608;
const easing={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const acquisitionPlate=(lane:AcquisitionLane,name:string)=>staticFile(`film-rd/acquisition/plates/${lane}/${name}.mp4`);
const act=(name:string)=>{
  const value=A.acts.find(item=>item.id===name);
  if(!value) throw new Error(`Missing acquisition act: ${name}`);
  return value;
};

function Physical({name,lane,startFrom=0}:{name:string;lane:AcquisitionLane;startFrom?:number}) {
  return <OffthreadVideo src={acquisitionPlate(lane,name)} startFrom={startFrom} muted style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover'}}/>;
}

function Caption({children,clock,side=false}:{children:React.ReactNode;clock?:string;side?:boolean}) {
  if(side) return <div style={{position:'absolute',left:96,top:270,width:490,color:C.canvas,textShadow:'0 2px 20px rgba(0,0,0,.6)'}}>
    {clock && <div style={{fontFamily:FONT.mono,fontSize:25,lineHeight:1.4,marginBottom:25}}>{clock}</div>}
    <div style={{fontSize:57,lineHeight:1.12,letterSpacing:-1}}>{children}</div>
  </div>;
  return <div style={{position:'absolute',left:0,right:0,bottom:0,padding:'110px 108px 72px',background:'linear-gradient(transparent,rgba(3,12,15,.82))',color:C.canvas}}>
    {clock && <div style={{fontFamily:FONT.mono,fontSize:26,letterSpacing:3,marginBottom:22}}>{clock}</div>}
    <div style={{fontSize:58,lineHeight:1.12,letterSpacing:-1.3,maxWidth:1480}}>{children}</div>
  </div>;
}

function Proof({lane}:{lane:AcquisitionLane}) {
  const frame=useCurrentFrame();
  const paper=interpolate(frame,[0,24],[0,1],easing);
  const values=[TOTALS.firstVisits,TOTALS.optIns,TOTALS.returns];
  const labels=[A.proof.firstVisits,A.proof.optIns,A.proof.returns];
  return <AbsoluteFill style={{background:C.canvas,color:C.ink}}>
    {frame<24 && <div style={{position:'absolute',inset:0,opacity:1-paper}}><Physical lane={lane} name="network" startFrom={48}/></div>}
    <div style={{position:'absolute',inset:0,background:C.canvas,opacity:paper}}/>
    <div style={{position:'absolute',left:112,top:88,fontFamily:FONT.mono,fontSize:27,letterSpacing:3,opacity:paper}}>{A.proof.heading}</div>
    {values.map((value,column)=>{
      const reveal=interpolate(frame,[24+column*13,44+column*13],[0,1],easing);
      return <div key={labels[column]} style={{position:'absolute',left:112+column*575,top:285,width:510}}>
        <div style={{height:70,display:'flex',alignItems:'end',gap:8}}>
          {Array.from({length:value},(_,i)=><div key={i} style={{height:6,width:18,background:column===0?C.amberDeep:C.mintDeep,
            transform:`translateY(${(1-reveal)*(180+(i%3)*35)}px)`,opacity:reveal}}/>)}
        </div>
        <div style={{fontSize:246,letterSpacing:-12,lineHeight:1.1,opacity:reveal}}>{value}</div>
        <div style={{fontSize:42,lineHeight:1.2,maxWidth:440,opacity:reveal}}>{labels[column]}</div>
      </div>;
    })}
    <div style={{position:'absolute',left:112,bottom:80,fontSize:30,color:C.inkSoft,opacity:paper}}>{A.disclaimer} Source-specific redemptions · Explicit opt-ins · Paid Friday returns</div>
  </AbsoluteFill>;
}

export function AcquisitionClosing(){
  const frame=useCurrentFrame();
  const enter=interpolate(frame,[0,14],[0,1],easing);
  return <AbsoluteFill style={{background:C.marine,color:C.canvas,justifyContent:'center',paddingLeft:140,fontFamily:FONT.sans}}>
    <div style={{fontSize:38,letterSpacing:9,color:C.mint,opacity:enter}}>UPTICK GROWTH</div>
    <div style={{fontFamily:FONT.serif,fontSize:132,lineHeight:1.02,letterSpacing:-3,marginTop:55,opacity:enter}}>Bring them in.<br/>Bring them back.</div>
    <div style={{fontSize:38,marginTop:65,opacity:enter}}>We build and run the network around your station.</div>
  </AbsoluteFill>;
}

const cues=[
  {at:0,file:'music-bed',frames:1608,gain:.17},
  {at:0,file:'street-morning',frames:264,gain:.11},
  {at:168,file:'tick-soft',frames:6,gain:.22},
  {at:act('first').start,file:'chord-root',frames:72,gain:.16},
  {at:act('redeemed').start,file:'redeem',frames:24,gain:.20},
  {at:act('permission').start+70,file:'press',frames:5,gain:.20},
  {at:act('permission').start+78,file:'pad-mint',frames:66,gain:.10},
  {at:act('friday').start,file:'notify',frames:10,gain:.15},
  {at:960,file:'chord-root',frames:96,gain:.23},
  {at:1008,file:'tap-wood',frames:5,gain:.24},
  {at:act('proof').start,file:'unfold',frames:10,gain:.14},
];

export function AcquisitionFilm({lane='proxy',opening='customer',sound=true}:AcquisitionFilmProps){
  useFilmFonts();
  return <AbsoluteFill style={{background:C.marine,fontFamily:FONT.sans}}>
    {A.acts.filter(item=>!['seed','network','proof','closing'].includes(item.id)).map(item=><Sequence key={item.id} from={item.start} durationInFrames={item.end-item.start}>
      {item.id==='external' && opening==='owner' ? <>
        <Sequence durationInFrames={72}><Img src={staticFile('film-rd/acquisition/review/owner.jpg')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Sequence>
        <Sequence from={72} durationInFrames={96}><Physical name="external" lane={lane} startFrom={72}/></Sequence>
      </> : <Physical name={item.id} lane={lane}/>}
    </Sequence>)}
    <Sequence from={0} durationInFrames={72}><Caption>Your next customer is already nearby.</Caption></Sequence>
    <Sequence from={96} durationInFrames={72}><Caption>Uptick reaches drivers where they already stop.</Caption></Sequence>
    <Sequence from={act('seed').start} durationInFrames={24}><Physical name="network-lube" lane={lane} startFrom={12}/></Sequence>
    <Sequence from={act('seed').start+24} durationInFrames={24}><Physical name="network-tire" lane={lane} startFrom={12}/></Sequence>
    <Sequence from={act('seed').start} durationInFrames={48}><Caption>The same unit is installed where drivers already stop.</Caption></Sequence>
    <Sequence from={act('route').start} durationInFrames={48}><Caption>Joe’s is 0.7 miles away.</Caption></Sequence>
    <Sequence from={act('first').start} durationInFrames={48}><Caption clock="TUESDAY · 8:17 AM">A first visit.</Caption></Sequence>
    <Sequence from={act('permission').start+24} durationInFrames={120}><Caption side>They choose to stay connected.</Caption></Sequence>
    <Sequence from={act('friday').start} durationInFrames={72}><Caption side clock="THURSDAY · 4:42 PM">Days later, a reason to come back.</Caption></Sequence>
    <Sequence from={act('second').start} durationInFrames={48}><Caption clock="FRIDAY · 7:36 AM">The same customer. Back again.</Caption></Sequence>
    <Sequence from={act('paid').start+72} durationInFrames={72}><Caption side>A paid breakfast. A returning customer.</Caption></Sequence>
    <Sequence from={act('network').start} durationInFrames={48}><Physical name="network-lube" lane={lane}/></Sequence>
    <Sequence from={act('network').start+48} durationInFrames={48}><Physical name="network-tire" lane={lane}/></Sequence>
    <Sequence from={act('network').start+96} durationInFrames={72}><Physical name="network" lane={lane}/></Sequence>
    <Sequence from={act('network').start} durationInFrames={168}><Caption>One local network. Built and operated by Uptick.</Caption></Sequence>
    <Sequence from={act('proof').start} durationInFrames={192}><Proof lane={lane}/></Sequence>
    <Sequence from={act('closing').start} durationInFrames={96}><AcquisitionClosing/></Sequence>
    {sound && cues.map((cue,index)=><Sequence key={index} from={cue.at} durationInFrames={cue.frames}><Audio src={staticFile(`film-rd/audio/${cue.file}.ogg`)}
      volume={f=>cue.gain*Math.min(1,f/4,Math.max(0,(cue.frames-f)/12))}/></Sequence>)}
  </AbsoluteFill>;
}

export function AcquisitionTeaser({lane='final'}:{lane:AcquisitionLane}) {
  useFilmFonts();
  return <AbsoluteFill style={{background:C.marine,fontFamily:FONT.sans}}>
    <Sequence durationInFrames={72}><Physical name="external" lane={lane}/><Caption>Somewhere else.</Caption></Sequence>
    <Sequence from={72} durationInFrames={48}><Physical name="route" lane={lane}/><Caption>0.7 miles away.</Caption></Sequence>
    <Sequence from={120} durationInFrames={48}><Physical name="first" lane={lane}/><Caption>Joe’s. Tuesday.</Caption></Sequence>
    <Sequence from={168} durationInFrames={48}><Physical name="second" lane={lane}/><Caption>Back. Friday.</Caption></Sequence>
    <Sequence from={216} durationInFrames={48}><Physical name="paid" lane={lane}/><Caption>A paid return.</Caption></Sequence>
    <Sequence from={264} durationInFrames={96}><AcquisitionClosing/></Sequence>
  </AbsoluteFill>;
}
