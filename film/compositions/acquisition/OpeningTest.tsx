import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT, COLOR as C} from '../../tokens';
import {useFilmFonts} from '../../typography/fonts';

export type OpeningOrder = 'owner' | 'customer';
const image = (name:string) => staticFile(`film-rd/acquisition/review/${name}.jpg`);

/** Cheap editorial comparison. Held prototype frames are explicitly labeled;
 * this is neither a motion gate nor a finished full proxy. */
export function OpeningTest({order}:{order:OpeningOrder}) {
  useFilmFonts();
  const frame=useCurrentFrame();
  const beats=order==='owner'
    ? [{image:'owner',start:0,duration:96,line:''},
       {image:'carwash',start:96,duration:144,line:'Uptick reaches drivers at the places they already stop.'},
       {image:'route',start:240,duration:48,line:'And gives them a reason to choose Joe’s next.'}]
    : [{image:'carwash',start:0,duration:144,line:'This driver is at the car wash. Joe’s is the next stop.'},
       {image:'owner',start:144,duration:48,line:''},
       {image:'route',start:192,duration:96,line:'Uptick builds the network around your station.'}];
  return <AbsoluteFill style={{background:C.ink,fontFamily:FONT.sans,color:C.canvas}}>
    {beats.map(beat=><Sequence key={beat.start} from={beat.start} durationInFrames={beat.duration}>
      <AbsoluteFill><Img src={image(beat.image)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        {beat.line && <div style={{position:'absolute',left:0,right:0,bottom:0,padding:'48px 42px 26px',background:'linear-gradient(transparent,rgba(0,0,0,.88))',fontSize:27,lineHeight:1.2}}>{beat.line}</div>}
      </AbsoluteFill>
    </Sequence>)}
    <div style={{position:'absolute',left:12,top:10,padding:'5px 8px',background:'rgba(0,0,0,.75)',fontSize:10,letterSpacing:1.2}}>
      EDITORIAL TEST · {order.toUpperCase()} FIRST · HELD PROTOTYPE FRAMES · {(frame/24).toFixed(1)}s
    </div>
  </AbsoluteFill>;
}
