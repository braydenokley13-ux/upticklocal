import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ACQUISITION as A} from '../../data/acquisition';
import {COLOR as C, FONT} from '../../tokens';
import {useFilmFonts} from '../../typography/fonts';
import {QrMark} from '../../primitives/ScreenContent';

export type AcquisitionSurface = 'placement' | 'pass' | 'redeemed' | 'permission' | 'friday' | 'paid';

/** Bake these exact surfaces before rendering any physical screen that uses them. */
export function AcquisitionSurface({state}: {state: AcquisitionSurface}) {
  useFilmFonts();
  const frame = useCurrentFrame();
  if (state === 'placement') return <AbsoluteFill style={{background:C.marine, color:C.canvas, fontFamily:FONT.sans, padding:88, boxSizing:'border-box'}}>
    <div style={{fontSize:30, letterSpacing:4}}>UPTICK GROWTH</div>
    <div style={{fontSize:110, letterSpacing:-4, lineHeight:1.02, marginTop:95}}>Your next stop<br/>is on us.</div>
    <div style={{fontSize:49, marginTop:42}}>Free coffee at Joe’s Fuel &amp; Go</div>
    <div style={{display:'flex', alignItems:'end', justifyContent:'space-between', marginTop:60}}>
      <div style={{fontSize:76, letterSpacing:-2}}>0.7 mi <span style={{fontSize:40}}>away</span></div>
      <QrMark size={104}/>
    </div>
  </AbsoluteFill>;
  const accepted = state === 'permission' && frame >= 78;
  const paid = state === 'paid';
  const isFriday = state === 'friday' || paid;
  const done = state === 'redeemed' || accepted || paid;
  const title = state === 'permission' ? (accepted ? A.permission.accepted : A.permission.headline)
    : isFriday ? (paid ? A.returnOffer.returned : 'Breakfast sandwich\n+ coffee')
    : state === 'redeemed' ? A.acquisitionOffer.redeemed : 'Your next stop\nis on us.';
  return <AbsoluteFill style={{background:C.canvas, color:C.ink, fontFamily:FONT.sans, padding:62, boxSizing:'border-box'}}>
    <div style={{fontSize:25, letterSpacing:3}}>UPTICK GROWTH</div>
    <div style={{fontSize:34, marginTop:134}}>{A.merchant}</div>
    <div style={{fontSize:78, fontWeight:500, letterSpacing:-3, lineHeight:1.07, marginTop:36, whiteSpace:'pre-line'}}>{title}</div>
    <div style={{fontSize:36, lineHeight:1.4, marginTop:45, color:C.inkSoft}}>
      {state === 'permission' ? (accepted ? 'Joe’s Friday offer.\nOnly because you said yes.' : A.permission.detail)
        : isFriday ? (paid ? 'Breakfast sandwich + coffee' : A.returnOffer.window)
        : state === 'redeemed' ? 'Tuesday · 8:17 AM' : 'Free coffee at Joe’s Fuel & Go'}
    </div>
    {isFriday && <div style={{fontSize:142, letterSpacing:-6, marginTop:48}}>$4.99</div>}
    {state === 'friday' && <div style={{fontSize:27, letterSpacing:3, marginTop:35}}>{A.returnOffer.headline}</div>}
    {!isFriday && state !== 'permission' && <div style={{marginTop:75, borderTop:`2px solid ${C.inkHair}`, paddingTop:30}}>
      <div style={{fontSize:25, color:C.inkSoft}}>SOURCE</div>
      <div style={{fontSize:39, marginTop:14}}>Main Street Car Wash</div>
      {state === 'pass' && <div style={{fontSize:102, letterSpacing:-4, marginTop:50}}>0.7 mi <span style={{fontSize:36}}>away</span></div>}
    </div>}
    <div style={{position:'absolute', left:62, right:62, bottom:230, background:done?C.mintDeep:C.ink, color:C.canvas, padding:'36px 28px', fontSize:37, textAlign:'center', borderRadius:6,
      transform:state === 'permission' && frame >=70 && frame <78 ? 'scale(.975)' : undefined}}>
      {state === 'permission' ? (accepted ? '✓  You’re in.' : A.permission.action)
        : state === 'redeemed' ? '✓  Coffee redeemed' : paid ? '✓  Paid at Joe’s' : isFriday ? 'Friday · 6–10 AM' : 'Save my coffee pass'}
    </div>
    <div style={{position:'absolute', left:62, right:62, bottom:120, fontSize:25, lineHeight:1.4, color:C.inkSoft}}>
      {state === 'permission' ? 'Your choice. Unsubscribe any time.' : paid ? 'Friday · 7:36 AM' : state === 'friday' ? 'Thursday · 4:42 PM' : 'One coffee · One visit · Joe’s Fuel & Go'}
    </div>
    {state === 'permission' && frame >=70 && frame <87 && <div style={{position:'absolute', left:365, bottom:274, width:48+(frame-70)*4, height:48+(frame-70)*4, border:`3px solid ${C.mint}`, borderRadius:'50%', opacity:1-(frame-70)/17}}/>}
  </AbsoluteFill>;
}
