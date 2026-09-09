import {useMemo, type CSSProperties} from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame} from 'remotion';
import photoEdit from '../../final-director/photo-edit.json';
import {ACQUISITION as A} from '../../data/acquisition';
import {COLOR as C, FONT} from '../../tokens';
import {useFilmFonts} from '../../typography/fonts';

type Insert = 'invitation' | 'permission' | 'offer' | 'paid' | 'closing';
type Shot = {id:string; from:number; duration:number; media:string; copy?:string; eyebrow?:string; insert?:Insert; copyDelay?:number};
type VideoSource = {src:string; sourceFrom?:number; sourceFrames?:number|null; sourceFps?:number|null; objectPosition?:string};
type MediaSource = Omit<VideoSource, 'src'> & {kind:'still'|'video'; src:string|null; fallback?:VideoSource};
type SoundCue = {at:number; frames:number; file:string; gain:number; offset?:number};
type PhotoEdit = {frames:number; fps:number; disclaimer:string; permission:{pressFrame:number; acceptedFrame:number}; shots:Shot[]; media:Record<string,MediaSource>; sound:SoundCue[]};

const EDIT = photoEdit as PhotoEdit;
export const DIRECTOR_PHOTO_FRAMES = EDIT.frames;
export type DirectorPhotoProps = {sound:boolean};
const clamp = {extrapolateLeft:'clamp', extrapolateRight:'clamp'} as const;
const pictureStyle:CSSProperties = {position:'absolute', width:'100%', height:'100%', objectFit:'cover'};
const source = A.sources.find(item => item.id === photoEdit.continuity.sourceId);
if (!source) throw new Error('The photographic candidate must identify an existing acquisition source.');
const sourceName = source.name;
const sourceDistance = source.distanceMiles;
const price = `$${(A.returnOffer.priceCents / 100).toFixed(2)}`;

function availableVideoFrames(media:VideoSource):number {
  if (!media.sourceFrames || !media.sourceFps) return 0;
  return Math.max(0, Math.floor(media.sourceFrames * EDIT.fps / media.sourceFps) - (media.sourceFrom ?? 0));
}

function VideoPicture({media}:{media:VideoSource}) {
  const frame = useCurrentFrame();
  const lastFrame = availableVideoFrames(media) - 1;
  // A short temporary plate is held honestly, never looped or silently slowed.
  return <Freeze frame={lastFrame} active={frame > lastFrame}>
    <OffthreadVideo muted src={staticFile(media.src)} startFrom={media.sourceFrom ?? 0}
      style={{...pictureStyle, objectPosition:media.objectPosition ?? '50% 50%'}}/>
  </Freeze>;
}

function MediaPicture({shot, files}:{shot:Shot; files:Set<string>}) {
  const frame = useCurrentFrame();
  const media = EDIT.media[shot.media];
  const candidateExists = Boolean(media?.src && files.has(media.src));
  const candidateReady = candidateExists && (media.kind === 'still' || availableVideoFrames(media as VideoSource) > 0);
  const fallbackReady = Boolean(media?.fallback && files.has(media.fallback.src) && availableVideoFrames(media.fallback) > 0);
  // Legacy screen plates contain burned-in copy and independently timed acceptance.
  // Keep those out of the deterministic phone sequence when no photo is supplied.
  const editorialFallback = !candidateReady && ['invitation','permission','offer'].includes(shot.insert ?? '');
  const video = candidateReady && media.kind === 'video' ? media as VideoSource : !candidateReady && fallbackReady ? media.fallback : undefined;
  const held = video ? frame >= availableVideoFrames(video) : false;
  const reason = !media?.src ? 'PHOTO NOT SUPPLIED' : candidateExists ? 'VIDEO METADATA MISSING' : 'PHOTO ASSET MISSING';
  const label = candidateReady
    ? media.kind === 'still' ? 'PHOTO STILL · MOTION NOT TESTED' : `PHOTO MOTION TEST · REVIEW PENDING${held ? ' · LAST FRAME HELD' : ''}`
    : editorialFallback ? `${reason} · EDITORIAL PHONE INSERT`
    : fallbackReady ? `${reason} · TEMP CG FOOTAGE${held ? ' · LAST FRAME HELD' : ''}` : `${reason} · NO USABLE MEDIA`;
  return <>
    <AbsoluteFill style={{background:C.marineDeep}}>
      {editorialFallback ? null : candidateReady && media.kind === 'still' && media.src ? <Img src={staticFile(media.src)} style={{...pictureStyle, objectPosition:media.objectPosition ?? '50% 50%'}}/> : video ? <VideoPicture media={video}/> :
        <div style={{margin:'240px 96px', color:C.onMarine, fontSize:42}}>Missing review media: {shot.id}<div style={{fontFamily:FONT.mono, fontSize:24, marginTop:24}}>{media?.src ?? 'No photographic source mapped.'}</div></div>}
    </AbsoluteFill>
    <div style={{position:'absolute', left:72, top:100, maxWidth:1776, zIndex:5, background:C.marineDeep, color:C.amber, padding:'12px 18px', fontFamily:FONT.mono, fontSize:21, letterSpacing:.4}}>{label}</div>
  </>;
}

function Caption({shot, side=false}:{shot:Shot; side?:boolean}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [shot.copyDelay ?? 0, (shot.copyDelay ?? 0) + 8], [0,1], clamp);
  return <div style={{position:'absolute', inset:0, opacity,
    background:side ? 'linear-gradient(90deg,rgba(6,17,26,.95),rgba(6,17,26,.75) 45%,rgba(6,17,26,.35))' : 'linear-gradient(transparent 42%,rgba(6,17,26,.80))'}}>
    <div style={{position:'absolute', left:96, bottom:side ? 256 : 144, width:side ? 780 : 1540, color:C.onMarine}}>
      {shot.eyebrow ? <div style={{fontFamily:FONT.mono, color:C.mint, fontSize:27, letterSpacing:2.3, marginBottom:24}}>{shot.eyebrow}</div> : null}
      {shot.copy ? <div style={{fontSize:72, fontWeight:400, letterSpacing:-2, lineHeight:1.1, whiteSpace:'pre-line'}}>{shot.copy}</div> : null}
    </div>
  </div>;
}

function PhoneInsert({state}:{state:'invitation'|'permission'|'offer'}) {
  const frame = useCurrentFrame();
  const accepted = state === 'permission' && frame >= EDIT.permission.acceptedFrame;
  const pressing = state === 'permission' && frame >= EDIT.permission.pressFrame && !accepted;
  const title = state === 'invitation' ? 'Free coffee\nat Joe’s.' : state === 'offer' ? 'Breakfast sandwich\n+ coffee' : accepted ? A.permission.accepted : A.permission.headline;
  return <div style={{position:'absolute', right:112, top:162, width:648, height:768, borderRadius:42, background:'#11181c', padding:15, boxShadow:'0 22px 75px rgba(0,0,0,.32)'}}>
    <div style={{position:'relative', height:'100%', boxSizing:'border-box', overflow:'hidden', borderRadius:29, background:C.canvas, color:C.ink, padding:'38px 42px'}}>
      <div style={{fontFamily:FONT.mono, fontSize:24, letterSpacing:2}}>UPTICK GROWTH</div>
      <div style={{fontSize:29, marginTop:26}}>{A.merchant}</div>
      <div style={{fontSize:23, color:C.inkSoft, marginTop:12}}>{state === 'invitation' ? `FROM ${sourceName.toUpperCase()}` : state === 'permission' ? 'OFFERS FROM JOE’S · YOUR CHOICE' : 'EXCLUSIVE OFFER FROM JOE’S'}</div>
      <div style={{fontSize:54, letterSpacing:-1.7, lineHeight:1.1, whiteSpace:'pre-line', marginTop:30}}>{title}</div>
      {state === 'invitation' ? <>
        <div style={{fontSize:94, letterSpacing:-3, marginTop:25}}>{sourceDistance} mi <span style={{fontSize:33, letterSpacing:0}}>away</span></div>
        <div style={{fontSize:29, marginTop:8}}>Your first coffee is on us.</div>
      </> : state === 'offer' ? <>
        <div style={{fontSize:106, letterSpacing:-4, marginTop:17}}>{price}</div>
        <div style={{fontSize:33, marginTop:5}}>{A.returnOffer.window}</div>
      </> : <div style={{fontSize:32, lineHeight:1.35, marginTop:31}}>{accepted ? 'Joe’s Friday offer. Only because you said yes.' : A.permission.detail}</div>}
      <div style={{position:'absolute', left:42, right:42, bottom:88, borderRadius:8, padding:'24px 12px', textAlign:'center', color:C.canvas,
        background:accepted ? C.mintDeep : C.ink, fontSize:30, transform:pressing ? 'scale(.975)' : undefined}}>
        {state === 'invitation' ? 'Your coffee pass · Ready at Joe’s' : state === 'offer' ? 'JOE’S FRIDAY DROP' : accepted ? '✓  You’re in.' : A.permission.action}
      </div>
      {pressing ? <div style={{position:'absolute', right:88, bottom:97, width:56, height:56, border:`4px solid ${C.mint}`, borderRadius:'50%'}}/> : null}
      <div style={{position:'absolute', bottom:32, left:42, right:42, fontSize:24, lineHeight:1.2, color:C.inkSoft}}>
        {state === 'permission' ? 'Your choice. Unsubscribe any time.' : state === 'offer' ? 'Thursday · 4:42 PM' : 'One coffee · One visit'}
      </div>
    </div>
  </div>;
}

function PaidReceipt() {
  return <div style={{position:'absolute', right:112, top:202, width:586, boxSizing:'border-box', background:C.canvas, color:C.ink, padding:'40px 44px', boxShadow:'0 16px 48px rgba(0,0,0,.22)'}}>
    <div style={{fontFamily:FONT.mono, fontSize:27, color:C.mintDeep, letterSpacing:1}}>✓ PAID AT JOE’S</div>
    <div style={{fontSize:88, letterSpacing:-3, margin:'18px 0'}}>{price}</div>
    <div style={{fontSize:31, lineHeight:1.25}}>{A.returnOffer.detail}</div>
    <div style={{borderTop:`1px solid ${C.inkHair}`, marginTop:28, paddingTop:23, fontSize:25}}>Friday · 7:36 AM</div>
    <div style={{fontSize:23, color:C.inkSoft, marginTop:12}}>From {sourceName}</div>
  </div>;
}

function Closing() {
  return <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(6,17,26,.94),rgba(6,17,26,.55))', color:C.onMarine}}>
    <div style={{position:'absolute', left:96, top:264}}>
      <div style={{fontFamily:FONT.mono, fontSize:31, letterSpacing:5, color:C.mint}}>UPTICK GROWTH</div>
      <div style={{fontFamily:FONT.serif, fontStyle:'italic', fontSize:130, lineHeight:1.02, marginTop:34, letterSpacing:-2}}>Bring them in.<br/>Bring them back.</div>
      <div style={{fontSize:33, marginTop:30}}>Local customer acquisition. Built and operated by Uptick.</div>
    </div>
  </AbsoluteFill>;
}

function PhotoShot({shot, files}:{shot:Shot; files:Set<string>}) {
  return <AbsoluteFill>
    <MediaPicture shot={shot} files={files}/>
    {shot.insert === 'closing' ? <Closing/> : <>
      {shot.copy || shot.eyebrow ? <Caption shot={shot} side={Boolean(shot.insert)}/> : null}
      {shot.insert === 'invitation' || shot.insert === 'permission' || shot.insert === 'offer' ? <PhoneInsert state={shot.insert}/> : null}
      {shot.insert === 'paid' ? <PaidReceipt/> : null}
    </>}
  </AbsoluteFill>;
}

export function DirectorPhotoFilm({sound=true}:DirectorPhotoProps) {
  useFilmFonts();
  const staticFiles = getStaticFiles();
  const files = useMemo(() => new Set(staticFiles.map(file => file.name)), [staticFiles]);
  const missingSound = sound ? EDIT.sound.filter(cue => !files.has(`film-rd/audio/${cue.file}.ogg`)) : [];
  return <AbsoluteFill style={{fontFamily:FONT.sans, background:C.marine}}>
    {EDIT.shots.map(shot => <Sequence key={shot.id} name={shot.id} from={shot.from} durationInFrames={shot.duration}>
      <PhotoShot shot={shot} files={files}/>
    </Sequence>)}
    <Sequence from={72} durationInFrames={72}>
      <Caption shot={{id:'network-copy', from:72, duration:72, media:'wash', copy:'We build and run your local customer network.'}}/>
    </Sequence>
    <div style={{position:'absolute', top:0, left:0, right:0, height:76, zIndex:20, background:C.marine, color:C.amber, padding:'25px 72px', boxSizing:'border-box', fontFamily:FONT.mono, fontSize:21, letterSpacing:.8}}>
      PHOTOGRAPHIC EDITORIAL CANDIDATE · PREVIEW ONLY
      <span style={{float:'right', color:C.onMarineSoft}}>52 SECONDS · 24 FPS</span>
    </div>
    <div style={{position:'absolute', bottom:0, left:0, right:0, height:96, zIndex:20, background:C.marine, color:C.onMarineSoft, padding:'32px 72px', boxSizing:'border-box', fontSize:26}}>{EDIT.disclaimer}</div>
    {missingSound.length ? <div style={{position:'absolute', right:72, top:152, color:C.amber, background:C.marineDeep, padding:12, fontSize:22}}>MISSING TEMP SOUND: {[...new Set(missingSound.map(cue => cue.file))].join(', ')}</div> : null}
    {sound ? EDIT.sound.filter(cue => files.has(`film-rd/audio/${cue.file}.ogg`)).map((cue,i) => <Sequence key={`${cue.at}-${i}`} from={cue.at} durationInFrames={cue.frames}>
      <Audio src={staticFile(`film-rd/audio/${cue.file}.ogg`)} startFrom={cue.offset ?? 0}
        volume={frame => cue.gain * Math.min(1, frame / 4, Math.max(0,(cue.frames - frame) / 10))}/>
    </Sequence>) : null}
  </AbsoluteFill>;
}
