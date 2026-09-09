import {useMemo, type CSSProperties, type ReactNode} from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence,
  interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import edit from '../../final-director/final-edit.json';
import {ACQUISITION as A} from '../../data/acquisition';
import {COLOR as C, FONT} from '../../tokens';
import {useFilmFonts} from '../../typography/fonts';

/**
 * "From Nearby to Yours" — the locked photographic cut.
 *
 * Every picture here is a photograph. The Blender lane is deliberately absent:
 * its forecourts, vehicles and customer could not sit in the same film as the
 * Higgsfield material without giving the whole thing away. What the CG lane used
 * to carry — exact product copy — is drawn here instead, where it can be spelled
 * correctly and timed to the frame.
 */

type Rect = [x: number, y: number, w: number, h: number];
type Insert = 'invitation' | 'permission' | 'offer';
type Shot = {
  id: string; from: number; duration: number;
  media?: string; srcFrom?: number;
  crop?: {from: Rect; to: Rect};
  copy?: string; eyebrow?: string; copyDelay?: number;
  insert?: Insert; layer?: 'network' | 'proof' | 'close'; field?: 'evening';
  dim?: number; blur?: number;
};
type Media = {kind: 'video' | 'still'; src: string; srcFrames?: number; srcFps?: number; srcW?: number; srcH?: number};
type Cue = {at: number; frames: number; file: string; gain: number; offset?: number};
type Edit = {
  fps: number; width: number; height: number; frames: number; disclaimer: string;
  shots: Shot[]; media: Record<string, Media>; sound: Cue[];
  proofSteps: {label: string; detail: string; when: string}[];
  network: {sourceId: string; name: string; distance: string}[];
  permissionBeat: {pressFrame: number; acceptedFrame: number};
};

const EDIT = edit as unknown as Edit;
export const FINAL_FILM_FRAMES = EDIT.frames;
export type FinalFilmProps = {sound: boolean};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = EDIT.width;
const H = EDIT.height;

/** Gentle at both ends, honest in the middle: a dolly, not a whip. */
const glide = (t: number) => t * t * (3 - 2 * t);

const price = `$${(A.returnOffer.priceCents / 100).toFixed(2)}`;

/** Every network name in the film must exist in the repository fixture. */
const NETWORK = EDIT.network.map((entry) => {
  const source = A.sources.find((item) => item.id === entry.sourceId);
  if (!source) throw new Error(`Network entry ${entry.sourceId} is not in the acquisition fixture.`);
  if (source.name !== entry.name) throw new Error(`Network name for ${entry.sourceId} disagrees with the fixture.`);
  if (`${source.distanceMiles} mi` !== entry.distance) throw new Error(`Network distance for ${entry.sourceId} disagrees with the fixture.`);
  return entry;
});

// ---------------------------------------------------------------- pictures

/**
 * A crop rectangle in source pixels, moved across the shot and blown up to the
 * frame. Working in source space keeps the move honest: nothing is ever
 * magnified past what the file actually holds.
 */
function CropStill({media, crop, duration}: {media: Media; crop: {from: Rect; to: Rect}; duration: number}) {
  const frame = useCurrentFrame();
  const t = glide(interpolate(frame, [0, Math.max(1, duration - 1)], [0, 1], CLAMP));
  const [x, y, w] = crop.from.map((a, i) => a + (crop.to[i] - a) * t) as Rect;
  const scale = W / w;
  return (
    <Img
      src={staticFile(media.src)}
      style={{
        position: 'absolute',
        width: (media.srcW ?? W) * scale,
        height: (media.srcH ?? H) * scale,
        left: -x * scale,
        top: -y * scale,
        maxWidth: 'none',
      }}
    />
  );
}

function VideoPicture({media, srcFrom}: {media: Media; srcFrom: number}) {
  return (
    <OffthreadVideo
      muted
      src={staticFile(media.src)}
      startFrom={srcFrom}
      style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}}
    />
  );
}

function Picture({shot}: {shot: Shot}) {
  const media = shot.media ? EDIT.media[shot.media] : undefined;
  if (!media) return <AbsoluteFill style={{background: C.marineDeep}} />;
  return (
    <AbsoluteFill style={{background: C.marineDeep, overflow: 'hidden'}}>
      {media.kind === 'video'
        ? <VideoPicture media={media} srcFrom={shot.srcFrom ?? 0} />
        : shot.crop
          ? <CropStill media={media} crop={shot.crop} duration={shot.duration} />
          : <Img src={staticFile(media.src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />}
    </AbsoluteFill>
  );
}

/** The warm dark field the Thursday phone lives in. No location is claimed. */
function EveningField() {
  return (
    <AbsoluteFill style={{background: 'radial-gradient(78% 62% at 71% 40%, #4a3520 0%, #24211f 34%, #0c141a 68%, #050b10 100%)'}} />
  );
}

// ------------------------------------------------------------------- type

const scrim = (side: boolean): CSSProperties => ({
  position: 'absolute', inset: 0,
  background: side
    ? 'linear-gradient(90deg,rgba(4,12,18,.94) 0%,rgba(4,12,18,.74) 38%,rgba(4,12,18,.18) 66%,rgba(4,12,18,0) 84%)'
    : 'linear-gradient(transparent 34%,rgba(4,12,18,.34) 58%,rgba(4,12,18,.90) 100%)',
});

function Copy({shot, side = false}: {shot: Shot; side?: boolean}) {
  const frame = useCurrentFrame();
  const delay = shot.copyDelay ?? 0;
  const on = interpolate(frame, [delay, delay + 12], [0, 1], CLAMP);
  const out = interpolate(frame, [shot.duration - 10, shot.duration - 2], [1, 0], CLAMP);
  const lift = interpolate(frame, [delay, delay + 18], [16, 0], CLAMP);
  if (!shot.copy && !shot.eyebrow) return null;
  return (
    <AbsoluteFill style={{opacity: on * out}}>
      <div style={scrim(side)} />
      <div style={{position: 'absolute', left: 104, bottom: side ? 236 : 132, width: side ? 900 : 1420, color: C.onMarine}}>
        {shot.eyebrow ? (
          <div style={{
            fontFamily: FONT.mono, color: C.mint, fontSize: 23, fontWeight: 500,
            letterSpacing: '0.22em', marginBottom: 22, transform: `translateY(${lift * 0.4}px)`,
            textShadow: '0 2px 14px rgba(3,9,14,.8)',
          }}>{shot.eyebrow}</div>
        ) : null}
        {shot.copy ? (
          <div style={{
            fontFamily: FONT.sans, fontSize: 70, fontWeight: 300, letterSpacing: '-0.022em',
            lineHeight: 1.14, whiteSpace: 'pre-line', transform: `translateY(${lift}px)`,
            textShadow: '0 2px 12px rgba(3,9,14,.72), 0 6px 44px rgba(3,9,14,.55)',
          }}>{shot.copy}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------ phone

const PHONE_W = 470;
const PHONE_H = 862;

function Phone({children, glow = 1}: {children: ReactNode; glow?: number}) {
  return (
    <div style={{
      position: 'relative', width: PHONE_W, height: PHONE_H, borderRadius: 54,
      background: '#050d13', padding: 12,
      boxShadow: `0 60px 140px rgba(2,7,11,.72), 0 0 0 1.5px rgba(241,237,229,.16), 0 0 ${70 * glow}px rgba(95,214,187,${0.10 * glow})`,
    }}>
      <div style={{
        position: 'absolute', inset: 12, borderRadius: 43, overflow: 'hidden',
        background: '#0a141b', display: 'flex', flexDirection: 'column',
      }}>{children}</div>
    </div>
  );
}

function StatusBar({time}: {time: string}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '26px 34px 0', fontFamily: FONT.mono, fontSize: 19,
      color: C.onMarineSoft, letterSpacing: '0.04em',
    }}>
      <span>{time}</span>
      <span style={{display: 'flex', gap: 7, alignItems: 'center'}}>
        <span style={{width: 22, height: 11, borderRadius: 3, border: `1.5px solid ${C.onMarineFaint}`, display: 'inline-block'}} />
      </span>
    </div>
  );
}

function Brandline() {
  return (
    <div style={{
      marginTop: 'auto', padding: '0 34px 32px', fontFamily: FONT.mono, fontSize: 15,
      letterSpacing: '0.2em', color: C.onMarineFaint,
    }}>UPTICK</div>
  );
}

/** The first-visit offer. Free, because it is buying a first visit. */
function InvitationScreen() {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [10, 30], [26, 0], CLAMP);
  const fade = interpolate(frame, [10, 30], [0, 1], CLAMP);
  const cta = interpolate(frame, [34, 48], [0, 1], CLAMP);
  return (
    <Phone>
      <StatusBar time="8:08" />
      <div style={{padding: '46px 34px 0', opacity: fade, transform: `translateY(${rise}px)`}}>
        <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.2em', color: C.mint, marginBottom: 26}}>
          NEARBY OFFER
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 42, fontWeight: 400, lineHeight: 1.12, color: C.onMarine, letterSpacing: '-0.02em'}}>
          {A.acquisitionOffer.headline}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 25, color: C.onMarineSoft, marginTop: 26, lineHeight: 1.4}}>
          {A.acquisitionOffer.detail}
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 19, color: C.amber, marginTop: 18, letterSpacing: '0.09em'}}>
          {A.acquisitionOffer.distance}
        </div>
      </div>
      <div style={{padding: '38px 34px 0', opacity: cta}}>
        <div style={{
          background: C.mint, color: '#04231d', borderRadius: 15, padding: '20px 0',
          textAlign: 'center', fontFamily: FONT.mono, fontSize: 19, fontWeight: 500, letterSpacing: '0.16em',
        }}>GET IT</div>
        <div style={{
          marginTop: 30, paddingTop: 24, borderTop: `1px solid ${C.onMarineHair}`,
          fontFamily: FONT.mono, fontSize: 15, letterSpacing: '0.1em', color: C.onMarineFaint, lineHeight: 1.7,
        }}>
          MAIN STREET CAR WASH<br />&darr;<br />JOE&rsquo;S FUEL &amp; GO
        </div>
      </div>
      <Brandline />
    </Phone>
  );
}

/** Permission. Offered, pressed, accepted — in that order, always. */
function PermissionScreen() {
  const frame = useCurrentFrame();
  const {pressFrame, acceptedFrame} = EDIT.permissionBeat;
  const accepted = frame >= acceptedFrame;
  const press = interpolate(frame, [pressFrame - 2, pressFrame, pressFrame + 5], [0, 1, 0], CLAMP);
  const fade = interpolate(frame, [8, 24], [0, 1], CLAMP);
  const inFade = interpolate(frame, [acceptedFrame, acceptedFrame + 9], [0, 1], CLAMP);
  return (
    <Phone glow={accepted ? 1.9 : 1}>
      <StatusBar time="8:18" />
      <div style={{padding: '46px 34px 0', opacity: fade}}>
        <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.2em', color: C.mint, marginBottom: 26}}>
          JOE'S FUEL &amp; GO
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 38, fontWeight: 400, lineHeight: 1.14, color: C.onMarine, letterSpacing: '-0.02em'}}>
          {A.permission.headline}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 24, color: C.onMarineSoft, marginTop: 24, lineHeight: 1.42}}>
          {A.permission.detail}
        </div>
      </div>
      <div style={{padding: '40px 34px 0', position: 'relative'}}>
        <div style={{
          background: accepted ? 'rgba(95,214,187,.13)' : C.mint,
          color: accepted ? C.mint : '#04231d',
          border: accepted ? `1.5px solid ${C.mint}` : '1.5px solid transparent',
          borderRadius: 15, padding: '20px 0', textAlign: 'center',
          fontFamily: FONT.mono, fontSize: 19, fontWeight: 500, letterSpacing: '0.16em',
          transform: `scale(${1 - press * 0.035})`,
        }}>{accepted ? A.permission.accepted : A.permission.action}</div>
        {accepted ? (
          <div style={{
            fontFamily: FONT.sans, fontSize: 21, color: C.onMarineSoft, marginTop: 24,
            textAlign: 'center', opacity: inFade,
          }}>Joe can reach him again.</div>
        ) : null}
      </div>
      <Brandline />
    </Phone>
  );
}

/** The Friday offer. Paid — this is demand, not another giveaway. */
function OfferScreen() {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [8, 24], [0, 1], CLAMP);
  const rise = interpolate(frame, [8, 26], [22, 0], CLAMP);
  const p = interpolate(frame, [28, 42], [0, 1], CLAMP);
  return (
    <Phone>
      <StatusBar time="4:42" />
      <div style={{padding: '46px 34px 0', opacity: fade, transform: `translateY(${rise}px)`}}>
        <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.2em', color: C.amber, marginBottom: 26}}>
          {A.returnOffer.headline}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 38, fontWeight: 400, lineHeight: 1.14, color: C.onMarine, letterSpacing: '-0.02em'}}>
          {A.returnOffer.detail}
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 30, opacity: p}}>
          <span style={{fontFamily: FONT.sans, fontSize: 62, fontWeight: 400, color: C.onMarine, letterSpacing: '-0.03em'}}>{price}</span>
          <span style={{fontFamily: FONT.mono, fontSize: 17, color: C.onMarineFaint, letterSpacing: '0.12em'}}>PAID</span>
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 18, color: C.onMarineSoft, marginTop: 20, letterSpacing: '0.09em'}}>
          {A.returnOffer.window}
        </div>
        <div style={{
          marginTop: 34, paddingTop: 24, borderTop: `1px solid ${C.onMarineHair}`,
          fontFamily: FONT.mono, fontSize: 15, letterSpacing: '0.1em', color: C.onMarineFaint,
        }}>JOE&rsquo;S FUEL &amp; GO &middot; 0.7 MI</div>
      </div>
      <Brandline />
    </Phone>
  );
}

const SCREENS: Record<Insert, () => ReactNode> = {
  invitation: InvitationScreen,
  permission: PermissionScreen,
  offer: OfferScreen,
};

function PhoneInsert({state}: {state: Insert}) {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 16], [0, 1], CLAMP);
  const drift = interpolate(frame, [0, 90], [10, -10], CLAMP);
  const Screen = SCREENS[state];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{
        transform: `translate(430px, ${drift}px) scale(${0.965 + enter * 0.035})`,
        opacity: enter,
      }}>
        <Screen />
      </div>
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------ layers

/** Same system, several local businesses — said once, in one place. */
function NetworkLayer({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [duration - 10, duration - 2], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: 'linear-gradient(270deg,rgba(4,12,18,.80) 0%,rgba(4,12,18,.62) 34%,rgba(4,12,18,.10) 62%,rgba(4,12,18,0) 78%)'}} />
      <div style={{position: 'absolute', right: 104, top: 168, width: 620}}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.22em', color: C.mint,
          paddingBottom: 20, borderBottom: `1px solid ${C.onMarineHair}`,
          opacity: interpolate(frame, [6, 20], [0, 1], CLAMP),
        }}>UPTICK NETWORK · NEAR JOE'S</div>
        {NETWORK.map((entry, i) => {
          const at = 20 + i * 13;
          const o = interpolate(frame, [at, at + 14], [0, 1], CLAMP);
          const x = interpolate(frame, [at, at + 18], [24, 0], CLAMP);
          return (
            <div key={entry.sourceId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '22px 0', borderBottom: `1px solid ${C.onMarineHair}`,
              opacity: o, transform: `translateX(${x}px)`,
            }}>
              <span style={{fontFamily: FONT.sans, fontSize: 31, fontWeight: 300, color: C.onMarine, letterSpacing: '-0.01em'}}>
                {entry.name}
              </span>
              <span style={{fontFamily: FONT.mono, fontSize: 19, color: C.amber, letterSpacing: '0.08em'}}>
                {entry.distance}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/** The proof is the journey we just watched. No aggregate is implied. */
function ProofLayer({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [duration - 12, duration - 2], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity: out, padding: '0 150px', justifyContent: 'center'}}>
      <div style={{
        fontFamily: FONT.mono, fontSize: 19, letterSpacing: '0.22em', color: C.mint, marginBottom: 44,
        opacity: interpolate(frame, [2, 16], [0, 1], CLAMP),
      }}>ONE CUSTOMER · ONE WEEK</div>
      {EDIT.proofSteps.map((step, i) => {
        const at = 10 + i * 12;
        const o = interpolate(frame, [at, at + 14], [0, 1], CLAMP);
        const x = interpolate(frame, [at, at + 20], [20, 0], CLAMP);
        return (
          <div key={step.label} style={{
            display: 'flex', alignItems: 'baseline', gap: 30, padding: '17px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${C.onMarineHair}`,
            opacity: o, transform: `translateX(${x}px)`,
          }}>
            <span style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: '0.16em', color: C.amber, width: 236}}>
              {step.label}
            </span>
            <span style={{fontFamily: FONT.sans, fontSize: 33, fontWeight: 300, color: C.onMarine, flex: 1, letterSpacing: '-0.012em'}}>
              {step.detail}
            </span>
            <span style={{fontFamily: FONT.mono, fontSize: 17, color: C.onMarineSoft, letterSpacing: '0.07em'}}>
              {step.when}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function CloseLayer() {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [4, 20], [0, 1], CLAMP);
  const rise = interpolate(frame, [4, 26], [18, 0], CLAMP);
  const line = interpolate(frame, [24, 40], [0, 1], CLAMP);
  const rule = interpolate(frame, [16, 40], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      <div style={{opacity: o, transform: `translateY(${rise}px)`}}>
        <div style={{
          fontFamily: FONT.sans, fontSize: 78, fontWeight: 300, color: C.onMarine,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>{A.closing.brand}</div>
        <div style={{
          height: 1, background: C.mint, margin: '38px auto 0', boxShadow: '0 0 22px rgba(95,214,187,.55)',
          width: 300 * rule, opacity: 0.75,
        }} />
      </div>
      <div style={{opacity: line, marginTop: 38}}>
        <div style={{fontFamily: FONT.sans, fontSize: 32, fontWeight: 300, color: C.onMarineSoft, letterSpacing: '-0.01em'}}>
          {A.closing.detail}
        </div>
        <div style={{
          fontFamily: FONT.mono, fontSize: 19, color: C.amber, marginTop: 30, letterSpacing: '0.2em',
        }}>{A.closing.line.toUpperCase()}</div>
      </div>
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------ finish

/**
 * One grain and one vignette over everything, so stills and motion share a
 * skin. The grain is an inline turbulence tile — no asset to go missing, and
 * its offset is a pure function of the frame, so two renders agree exactly.
 */
const GRAIN_TILE =
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">` +
    `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>` +
    `<feColorMatrix type="saturate" values="0"/></filter>` +
    `<rect width="220" height="220" filter="url(#g)"/></svg>`
  )}`;

function Finish() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{
        background: 'radial-gradient(128% 108% at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,.30) 84%, rgba(0,0,0,.52) 100%)',
        mixBlendMode: 'multiply',
      }} />
      <AbsoluteFill style={{
        opacity: 0.055, mixBlendMode: 'overlay',
        backgroundImage: `url("${GRAIN_TILE}")`,
        backgroundPosition: `${(frame * 61) % 220}px ${(frame * 97) % 220}px`,
      }} />
    </AbsoluteFill>
  );
}

function Disclaimer() {
  return (
    <div style={{
      position: 'absolute', right: 104, bottom: 52, zIndex: 40,
      fontFamily: FONT.mono, fontSize: 21, letterSpacing: '0.055em',
      color: 'rgba(241,237,229,.60)', textShadow: '0 1px 12px rgba(3,9,14,.85)',
    }}>{EDIT.disclaimer}</div>
  );
}

// -------------------------------------------------------------------- film

function ShotBody({shot}: {shot: Shot}) {
  const dim = shot.dim ?? 0;
  const blur = shot.blur ?? 0;
  const sideCopy = Boolean(shot.insert) || shot.layer === 'network';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={blur ? {filter: `blur(${blur}px)`, transform: 'scale(1.06)'} : undefined}>
        {shot.field === 'evening' ? <EveningField /> : <Picture shot={shot} />}
      </AbsoluteFill>
      {dim ? <AbsoluteFill style={{background: `rgba(4,12,18,${dim})`}} /> : null}
      {shot.layer === 'network' ? <NetworkLayer duration={shot.duration} /> : null}
      {shot.layer === 'proof' ? <ProofLayer duration={shot.duration} /> : null}
      {shot.layer === 'close' ? <CloseLayer /> : null}
      {shot.insert ? <PhoneInsert state={shot.insert} /> : null}
      <Copy shot={shot} side={sideCopy} />
    </AbsoluteFill>
  );
}

function SoundBed() {
  return (
    <>
      {EDIT.sound.map((cue, i) => (
        <Sequence key={`${cue.file}-${cue.at}-${i}`} from={cue.at} durationInFrames={cue.frames} name={`snd:${cue.file}`}>
          <Audio
            src={staticFile(`film-rd/audio/${cue.file}.ogg`)}
            volume={cue.gain}
            startFrom={cue.offset ?? 0}
          />
        </Sequence>
      ))}
    </>
  );
}

export const FinalFilm: React.FC<FinalFilmProps> = ({sound}) => {
  useFilmFonts();
  const shots = useMemo(() => EDIT.shots as Shot[], []);
  return (
    <AbsoluteFill style={{background: C.marineDeep}}>
      {shots.map((shot) => (
        <Sequence key={shot.id} from={shot.from} durationInFrames={shot.duration} name={shot.id}>
          <ShotBody shot={shot} />
        </Sequence>
      ))}
      <Finish />
      <Disclaimer />
      {sound ? <SoundBed /> : null}
    </AbsoluteFill>
  );
};

/**
 * Fifteen seconds: the network, the door, the return, the close. The teaser
 * borrows finished shots rather than re-cutting them, so nothing can drift.
 */
export const TEASER_FRAMES = 360;
const TEASER: {shot: string; from: number; duration: number; srcOffset?: number}[] = [
  {shot: 'station', from: 0, duration: 60},
  {shot: 'network', from: 60, duration: 72},
  {shot: 'turn', from: 132, duration: 54, srcOffset: 12},
  {shot: 'first', from: 186, duration: 60, srcOffset: 30},
  {shot: 'return', from: 246, duration: 34},
  {shot: 'paid-face', from: 280, duration: 32, srcOffset: 20},
  {shot: 'close', from: 312, duration: 48},
];

export const FinalTeaser: React.FC<FinalFilmProps> = ({sound}) => {
  useFilmFonts();
  return (
    <AbsoluteFill style={{background: C.marineDeep}}>
      {TEASER.map((cut) => {
        const base = EDIT.shots.find((s) => s.id === cut.shot);
        if (!base) throw new Error(`Teaser references unknown shot ${cut.shot}`);
        const shot: Shot = {
          ...base,
          duration: cut.duration,
          srcFrom: (base.srcFrom ?? 0) + (cut.srcOffset ?? 0),
          copyDelay: Math.min(base.copyDelay ?? 0, 8),
        };
        return (
          <Sequence key={cut.shot} from={cut.from} durationInFrames={cut.duration} name={`teaser:${cut.shot}`}>
            <ShotBody shot={shot} />
          </Sequence>
        );
      })}
      <Finish />
      <Disclaimer />
      {sound ? (
        <>
          <Sequence from={0} durationInFrames={246} name="snd:street-morning">
            <Audio src={staticFile('film-rd/audio/street-morning.ogg')} volume={0.34} />
          </Sequence>
          <Sequence from={246} durationInFrames={66} name="snd:cafe-interior">
            <Audio src={staticFile('film-rd/audio/cafe-interior.ogg')} volume={0.30} startFrom={288} />
          </Sequence>
          <Sequence from={300} durationInFrames={60} name="snd:chord-root">
            <Audio src={staticFile('film-rd/audio/chord-root.ogg')} volume={0.26} />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
