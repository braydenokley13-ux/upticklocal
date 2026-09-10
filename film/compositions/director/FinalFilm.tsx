import {useMemo, type CSSProperties, type ReactNode} from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence,
  interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import edit from '../../final-director/final-edit.json';
import drop from '../../data/weekly-drop.json';
import {homographyMatrix3d, type Quad} from '../../block/homography';
import {COLOR as C, FONT} from '../../tokens';
import {useFilmFonts} from '../../typography/fonts';

/**
 * "The Weekly Drop" — the locked photographic cut.
 *
 * The film sells one thing: Uptick runs promotions on indoor TVs in businesses
 * around a station, gives nearby drivers a reason to come in, and then
 * keeps that audience on the merchant's Weekly Drop, where there is always
 * something free.
 *
 * Every picture is a photograph. Every product surface — the screen at the car
 * wash, the fuel receipt, all four phone states — is drawn here, because copy
 * this exact cannot be handed to an image model. The car wash screen is
 * projected onto the normal wall-mounted TV inside the car-wash waiting room.
 * The real television bezel and room remain visible around the composited face.
 */

type Rect = [x: number, y: number, w: number, h: number];
type Insert = 'redeem1' | 'join' | 'drop' | 'redeem2';
type Shot = {
  id: string; from: number; duration: number;
  media?: string; srcFrom?: number;
  crop?: {from: Rect; to: Rect};
  copy?: string; eyebrow?: string; copyDelay?: number;
  insert?: Insert; layer?: 'network' | 'receipt' | 'proof' | 'close';
  screen?: 'soft' | 'focus'; field?: 'evening';
  dim?: number; blur?: number;
};
type Media = {kind: 'video' | 'still'; src: string; srcFrames?: number; srcW?: number; srcH?: number};
type Cue = {at: number; frames: number; file: string; gain: number; offset?: number};
type Edit = {
  fps: number; width: number; height: number; frames: number; disclaimer: string;
  shots: Shot[]; media: Record<string, Media>; sound: Cue[];
  screenQuad: {corners: [number, number][]; inset: number; plateBlurPx: number};
  beats: Record<string, Record<string, number | number[]>>;
};

const EDIT = edit as unknown as Edit;
const D = drop;
export const FINAL_FILM_FRAMES = EDIT.frames;
export type FinalFilmProps = {sound: boolean};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = EDIT.width;
const H = EDIT.height;
const glide = (t: number) => t * t * (3 - 2 * t);
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** The film may not name a host business the fixture does not carry. */
const NETWORK = D.network.map((n) => ({...n, distance: `${n.distanceMiles} mi`}));
const HOST = NETWORK.find((n) => n.id === D.screen.hostId);
if (!HOST) throw new Error('The screen names a host business that is not in the Weekly Drop fixture.');

// ---------------------------------------------------------------- geometry

/** Where a shot's crop rectangle sits at this frame, in source pixels. */
function cropAt(crop: {from: Rect; to: Rect}, frame: number, duration: number): Rect {
  const t = glide(interpolate(frame, [0, Math.max(1, duration - 1)], [0, 1], CLAMP));
  return crop.from.map((a, i) => a + (crop.to[i] - a) * t) as Rect;
}

/** Source pixels to output pixels, for the crop in force this frame. */
function project(rect: Rect, x: number, y: number): [number, number] {
  const scale = W / rect[2];
  return [(x - rect[0]) * scale, (y - rect[1]) * scale];
}

// ---------------------------------------------------------------- pictures

function CropPicture({media, crop, duration, srcFrom = 0}: {media: Media; crop: {from: Rect; to: Rect}; duration: number; srcFrom?: number}) {
  const frame = useCurrentFrame();
  const [x, y, w] = cropAt(crop, frame, duration);
  const scale = W / w;
  const style: CSSProperties = {
        position: 'absolute',
        width: (media.srcW ?? W) * scale,
        height: (media.srcH ?? H) * scale,
        left: -x * scale, top: -y * scale, maxWidth: 'none',
  };
  return media.kind === 'video'
    ? <OffthreadVideo muted src={staticFile(media.src)} startFrom={srcFrom} style={style} />
    : <Img src={staticFile(media.src)} style={style} />;
}

function Picture({shot}: {shot: Shot}) {
  const media = shot.media ? EDIT.media[shot.media] : undefined;
  if (!media) return <AbsoluteFill style={{background: C.marineDeep}} />;
  return (
    <AbsoluteFill style={{background: C.marineDeep, overflow: 'hidden'}}>
      {shot.crop
        ? <CropPicture media={media} crop={shot.crop} duration={shot.duration} srcFrom={shot.srcFrom} />
        : media.kind === 'video'
        ? <OffthreadVideo muted src={staticFile(media.src)} startFrom={shot.srcFrom ?? 0}
            style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
        : <Img src={staticFile(media.src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />}
    </AbsoluteFill>
  );
}

function EveningField() {
  return <AbsoluteFill style={{background: 'radial-gradient(78% 62% at 71% 40%, #4a3520 0%, #24211f 34%, #0c141a 68%, #050b10 100%)'}} />;
}

// ------------------------------------------------------------ uptick screen

/** Landscape creative displayed on an ordinary wall-mounted waiting-room TV. */
const SCREEN_W = 1600;
const SCREEN_H = 900;

function UptickScreen({lit = 1}: {lit?: number}) {
  const s = D.screen;
  return (
    <div style={{width: SCREEN_W, height: SCREEN_H, boxSizing: 'border-box',
      position: 'relative', padding: '70px 86px', overflow: 'hidden', color: '#e9ede5',
      background: '#153a34', fontFamily: FONT.sans,
      backgroundImage: `linear-gradient(125deg, rgba(220,232,220,${0.07 * lit}), transparent 60%)`}}>
      <div style={{fontSize: 74, fontWeight: 500, letterSpacing: '0.015em'}}>{s.merchant}</div>
      <div style={{width: 100, height: 3, background: C.mint, opacity: .65, marginTop: 38}} />
      <div style={{fontSize: 101, fontWeight: 400, lineHeight: 1.14, marginTop: 42, letterSpacing: '-.025em'}}>{s.action}</div>
      <div style={{fontSize: 108, fontWeight: 500, lineHeight: 1.14, marginTop: 14, letterSpacing: '-.025em', color: '#a2dfc3'}}>{s.reward}</div>
      <div style={{fontSize: 36, marginTop: 38, color: '#d3ddd4'}}>{s.instruction}</div>
      <div style={{position: 'absolute', left: 86, right: 86, bottom: 62, paddingTop: 28,
        borderTop: '2px solid rgba(231,237,226,.25)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
        <div>
          <div style={{fontSize: 27, color: '#c2cec6', marginBottom: 12}}>{s.footer}</div>
          <div style={{fontFamily: FONT.mono, fontSize: 43, letterSpacing: '.09em', color: '#e5d4ac'}}>{s.product}</div>
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 27, color: '#c2cec6'}}>{s.wayfinding}</div>
      </div>
    </div>
  );
}

/**
 * Controlled offer typography sitting inside the photographed TV bezel.
 *
 * The quad is measured off the plate once, in source pixels; here it is carried
 * through whatever crop the shot is running and turned into a CSS matrix3d. The
 * inset preserves the thin black bezel. The photograph supplies the ordinary
 * hardware, wall shadow and room; Remotion supplies only the display's pixels.
 */
function ScreenOnPlate({shot}: {shot: Shot}) {
  const frame = useCurrentFrame();
  const media = EDIT.media[shot.media!];
  const rect = cropAt(shot.crop!, frame, shot.duration);
  const {corners, inset, plateBlurPx} = EDIT.screenQuad;
  // The locked-camera motion inherits the still's geometry at its native size.
  const reference = EDIT.media.washPlate;
  const sx = media.srcW! / reference.srcW!;
  const sy = media.srcH! / reference.srcH!;

  // Inset inside the measured face, in source pixels, then project.
  const [tl, tr, br, bl] = corners;
  const inner: [number, number][] = [
    [tl[0] + inset, tl[1] + inset], [tr[0] - inset, tr[1] + inset],
    [br[0] - inset, br[1] - inset], [bl[0] + inset, bl[1] - inset],
  ];
  const quad = inner.map(([x, y]) => project(rect, x * sx, y * sy)) as Quad;
  const scale = W / rect[2];
  const blur = plateBlurPx * sx * scale;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{
        position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: SCREEN_H,
        transformOrigin: '0 0', transform: homographyMatrix3d(SCREEN_W, SCREEN_H, quad),
        filter: `blur(${blur.toFixed(2)}px)`,
      }}>
        <UptickScreen />
      </div>
    </AbsoluteFill>
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

// ----------------------------------------------------------------- receipt

/** The proof of the qualifying purchase, set the way a pump prints it. */
function ReceiptLayer({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const f = D.fuel;
  const on = interpolate(frame, [2, 16], [0, 1], CLAMP);
  const out = interpolate(frame, [duration - 10, duration - 2], [1, 0], CLAMP);
  const rise = interpolate(frame, [2, 22], [26, 0], CLAMP);
  const row: CSSProperties = {display: 'flex', justifyContent: 'space-between', marginTop: 12};
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: on * out}}>
      <div style={{
        width: 540, background: '#f4f1e8', color: '#1b1a16', padding: '46px 46px 54px',
        transform: `translate(430px, ${rise}px) rotate(-1.6deg)`,
        fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.5,
        boxShadow: '0 44px 120px rgba(2,7,11,.66)',
        clipPath: 'polygon(0 0,100% 0,100% calc(100% - 14px),92% 100%,84% calc(100% - 14px),76% 100%,68% calc(100% - 14px),60% 100%,52% calc(100% - 14px),44% 100%,36% calc(100% - 14px),28% 100%,20% calc(100% - 14px),12% 100%,4% calc(100% - 14px),0 100%)',
      }}>
        <div style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em'}}>
          {D.merchant}
        </div>
        <div style={{marginTop: 22, height: 1, background: 'rgba(27,26,22,.28)'}} />
        <div style={row}><span>PUMP</span><span>{f.pump}</span></div>
        <div style={row}><span>{f.grade}</span><span>{f.gallons} GAL</span></div>
        <div style={{...row, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(27,26,22,.28)',
          fontSize: 32, fontWeight: 500}}>
          <span>TOTAL</span><span>{money(f.totalCents)}</span>
        </div>
        <div style={{...row, fontSize: 20, color: 'rgba(27,26,22,.62)'}}>
          <span>{f.card}</span><span>{f.when.split('· ')[1]}</span>
        </div>
        <div style={{
          marginTop: 26, paddingTop: 18, borderTop: '1px dashed rgba(27,26,22,.34)',
          fontSize: 20, color: '#0f6f5c', letterSpacing: '0.06em',
        }}>QUALIFIES · UPTICK OFFER</div>
      </div>
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------- phone

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
      <span style={{width: 22, height: 11, borderRadius: 3, border: `1.5px solid ${C.onMarineFaint}`}} />
    </div>
  );
}

function Brandline({text = 'UPTICK'}: {text?: string}) {
  return (
    <div style={{
      marginTop: 'auto', padding: '0 34px 32px', fontFamily: FONT.mono, fontSize: 15,
      letterSpacing: '0.2em', color: C.onMarineFaint,
    }}>{text}</div>
  );
}

const clock = (when: string) => when.split('· ')[1].replace(/\s?(AM|PM)$/, '');

/** A redeem button that is pressed and then done — never done without pressing. */
function RedeemButton({label, done, doneLabel, press}: {label: string; done: boolean; doneLabel: string; press: number}) {
  return (
    <div style={{
      background: done ? 'rgba(95,214,187,.13)' : C.mint,
      color: done ? C.mint : '#04231d',
      border: done ? `1.5px solid ${C.mint}` : '1.5px solid transparent',
      borderRadius: 15, padding: '20px 0', textAlign: 'center',
      fontFamily: FONT.mono, fontSize: 19, fontWeight: 500, letterSpacing: '0.16em',
      transform: `scale(${1 - press * 0.035})`,
    }}>{done ? doneLabel : label}</div>
  );
}

function useBeat(name: Insert) {
  const frame = useCurrentFrame();
  const b = EDIT.beats[name] as Record<string, number>;
  return {
    frame,
    done: frame >= b.doneFrame,
    press: interpolate(frame, [b.pressFrame - 2, b.pressFrame, b.pressFrame + 5], [0, 1, 0], CLAMP),
    doneFrame: b.doneFrame,
  };
}

/** First redemption: the gas receipt is what unlocks it. */
function Redeem1Screen() {
  const {frame, done, press, doneFrame} = useBeat('redeem1');
  const r = D.firstRedemption;
  const fade = interpolate(frame, [8, 24], [0, 1], CLAMP);
  const after = interpolate(frame, [doneFrame, doneFrame + 9], [0, 1], CLAMP);
  return (
    <Phone glow={done ? 1.9 : 1}>
      <StatusBar time={clock(r.when)} />
      <div style={{padding: '46px 34px 0', opacity: fade}}>
        <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.2em', color: C.mint, marginBottom: 26}}>
          {r.merchant.toUpperCase()}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 50, fontWeight: 500, lineHeight: 1.08, color: C.onMarine, letterSpacing: '-0.02em'}}>
          {r.title}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 24, color: C.onMarineSoft, marginTop: 24, lineHeight: 1.4}}>
          {r.qualifier}
        </div>
        <div style={{
          marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 10,
          fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.08em', color: C.mint,
          border: `1px solid rgba(95,214,187,.4)`, borderRadius: 9, padding: '9px 14px',
        }}>VERIFIED {money(D.fuel.totalCents)}</div>
      </div>
      <div style={{padding: '38px 34px 0'}}>
        <RedeemButton label={r.action} doneLabel={r.done} done={done} press={press} />
        {done ? (
          <div style={{fontFamily: FONT.sans, fontSize: 21, color: C.onMarineSoft, marginTop: 22, textAlign: 'center', opacity: after}}>
            Hand it over. No charge.
          </div>
        ) : null}
      </div>
      <Brandline />
    </Phone>
  );
}

/** The Weekly Drop opt-in. Offered, pressed, accepted — in that order. */
function JoinScreen() {
  const {frame, done, press, doneFrame} = useBeat('join');
  const j = D.join;
  const fade = interpolate(frame, [8, 24], [0, 1], CLAMP);
  const after = interpolate(frame, [doneFrame, doneFrame + 9], [0, 1], CLAMP);
  return (
    <Phone glow={done ? 1.9 : 1}>
      <StatusBar time={clock(j.when)} />
      <div style={{padding: '46px 34px 0', opacity: fade}}>
        <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.2em', color: C.amber, marginBottom: 26}}>
          {D.product.toUpperCase()}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 38, fontWeight: 400, lineHeight: 1.14, color: C.onMarine, letterSpacing: '-0.02em'}}>
          {j.headline}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 24, color: C.onMarineSoft, marginTop: 24, lineHeight: 1.42}}>
          {j.detail}
        </div>
      </div>
      <div style={{padding: '40px 34px 0'}}>
        <RedeemButton label={j.action} doneLabel={j.accepted} done={done} press={press} />
        {done ? (
          <div style={{fontFamily: FONT.sans, fontSize: 21, color: C.onMarineSoft, marginTop: 22, textAlign: 'center', opacity: after}}>
            {j.confirm}
          </div>
        ) : null}
      </div>
      <Brandline text="BY TEXT · ANY TIME" />
    </Phone>
  );
}

/** The Drop itself, arriving the way it actually arrives: as a text message. */
function DropScreen() {
  const frame = useCurrentFrame();
  const b = EDIT.beats.drop as {buzzFrame: number; lineFrames: number[]};
  const d = D.drop;
  const shake = interpolate(frame, [b.buzzFrame, b.buzzFrame + 3, b.buzzFrame + 7], [0, 1, 0], CLAMP);
  const fade = interpolate(frame, [4, 16], [0, 1], CLAMP);
  return (
    <div style={{transform: `translateX(${(shake * 7).toFixed(2)}px)`}}>
      <Phone glow={1 + shake}>
        <StatusBar time={clock(d.when)} />
        <div style={{padding: '38px 30px 0', opacity: fade}}>
          <div style={{
            fontFamily: FONT.mono, fontSize: 15, letterSpacing: '0.18em',
            color: C.onMarineFaint, textAlign: 'center', marginBottom: 22,
          }}>{d.channel.toUpperCase()}</div>
          <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.16em', color: C.amber, marginBottom: 16}}>
            {d.sender}
          </div>
          {d.lines.map((line, i) => {
            const at = b.lineFrames[i] ?? 0;
            const o = interpolate(frame, [at, at + 10], [0, 1], CLAMP);
            const y = interpolate(frame, [at, at + 14], [12, 0], CLAMP);
            const reward = i === d.lines.length - 1;
            return (
              <div key={line} style={{
                opacity: o, transform: `translateY(${y}px)`, marginBottom: 12,
                background: reward ? 'rgba(95,214,187,.14)' : 'rgba(241,237,229,.07)',
                border: reward ? '1px solid rgba(95,214,187,.42)' : '1px solid rgba(241,237,229,.10)',
                borderRadius: 18, borderBottomLeftRadius: 6, padding: '18px 20px',
                fontFamily: FONT.sans, fontSize: 25, lineHeight: 1.3,
                color: reward ? C.mint : C.onMarine, fontWeight: reward ? 500 : 400,
              }}>{line}</div>
            );
          })}
        </div>
        <Brandline text={D.merchant.toUpperCase()} />
      </Phone>
    </div>
  );
}

/** The second redemption. The Drop is not a coupon that applies itself. */
function Redeem2Screen() {
  const {frame, done, press} = useBeat('redeem2');
  const r = D.returnRedemption;
  const fade = interpolate(frame, [4, 18], [0, 1], CLAMP);
  return (
    <Phone glow={done ? 1.9 : 1}>
      <StatusBar time={clock(r.when)} />
      <div style={{padding: '46px 34px 0', opacity: fade}}>
        <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.2em', color: C.amber, marginBottom: 26}}>
          {r.title}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 34, fontWeight: 300, lineHeight: 1.2, color: C.onMarine, letterSpacing: '-0.015em'}}>
          {r.actionLine}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 40, fontWeight: 500, lineHeight: 1.15, color: C.mint, marginTop: 14, letterSpacing: '-0.015em'}}>
          {r.rewardLine}
        </div>
      </div>
      <div style={{padding: '40px 34px 0'}}>
        <RedeemButton label={r.action} doneLabel={r.done} done={done} press={press} />
      </div>
      <Brandline text={D.product.toUpperCase()} />
    </Phone>
  );
}

const SCREENS: Record<Insert, () => ReactNode> = {
  redeem1: Redeem1Screen, join: JoinScreen, drop: DropScreen, redeem2: Redeem2Screen,
};

function PhoneInsert({state}: {state: Insert}) {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 16], [0, 1], CLAMP);
  const drift = interpolate(frame, [0, 90], [10, -10], CLAMP);
  const Screen = SCREENS[state];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `translate(430px, ${drift}px) scale(${0.965 + enter * 0.035})`, opacity: enter}}>
        <Screen />
      </div>
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------ layers

function NetworkLayer({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [duration - 10, duration - 2], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: 'linear-gradient(270deg,rgba(4,12,18,.80) 0%,rgba(4,12,18,.62) 34%,rgba(4,12,18,.10) 62%,rgba(4,12,18,0) 78%)'}} />
      <div style={{position: 'absolute', right: 104, top: 158, width: 660}}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.22em', color: C.mint,
          paddingBottom: 20, borderBottom: `1px solid ${C.onMarineHair}`,
          opacity: interpolate(frame, [6, 20], [0, 1], CLAMP),
        }}>INDOOR TVs · NEAR JOE&rsquo;S</div>
        {NETWORK.map((entry, i) => {
          const at = 20 + i * 13;
          const o = interpolate(frame, [at, at + 14], [0, 1], CLAMP);
          const x = interpolate(frame, [at, at + 18], [24, 0], CLAMP);
          return (
            <div key={entry.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '20px 0', borderBottom: `1px solid ${C.onMarineHair}`,
              opacity: o, transform: `translateX(${x}px)`,
            }}>
              <span style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <span style={{
                  width: 30, height: 17, borderRadius: 2, border: `1.5px solid ${C.mint}`,
                  background: 'rgba(95,214,187,.22)', display: 'inline-block',
                }} />
                <span style={{fontFamily: FONT.sans, fontSize: 31, fontWeight: 300, color: C.onMarine, letterSpacing: '-0.01em'}}>
                  {entry.name}
                </span>
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

/** The whole system, as the five things that actually happened to one person. */
function ProofLayer({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [duration - 12, duration - 2], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity: out, padding: '0 140px', justifyContent: 'center'}}>
      <div style={{
        fontFamily: FONT.mono, fontSize: 19, letterSpacing: '0.22em', color: C.mint, marginBottom: 36,
        opacity: interpolate(frame, [2, 16], [0, 1], CLAMP),
      }}>ONE CUSTOMER · ONE PATH THROUGH THE NETWORK</div>
      {D.journey.map((step, i) => {
        const at = 8 + i * 11;
        const o = interpolate(frame, [at, at + 13], [0, 1], CLAMP);
        const x = interpolate(frame, [at, at + 18], [20, 0], CLAMP);
        return (
          <div key={step.label} style={{
            display: 'flex', alignItems: 'baseline', gap: 26, padding: '14px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${C.onMarineHair}`,
            opacity: o, transform: `translateX(${x}px)`,
          }}>
            <span style={{fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.14em', color: C.amber, width: 250}}>
              {step.label}
            </span>
            <span style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 300, color: C.onMarine, flex: 1, letterSpacing: '-0.012em'}}>
              {step.detail}
            </span>
            <span style={{fontFamily: FONT.mono, fontSize: 16, color: C.onMarineSoft, letterSpacing: '0.07em'}}>
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
  const rule = interpolate(frame, [26, 48], [0, 1], CLAMP);
  const brand = interpolate(frame, [30, 46], [0, 1], CLAMP);
  const detail = interpolate(frame, [42, 58], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      <div>
        {D.closing.lines.map((line, i) => {
          const at = 2 + i * 8;
          const o = interpolate(frame, [at, at + 12], [0, 1], CLAMP);
          const y = interpolate(frame, [at, at + 16], [14, 0], CLAMP);
          return (
            <div key={line} style={{
              fontFamily: FONT.sans, fontSize: 58, fontWeight: 300, color: C.onMarine,
              letterSpacing: '-0.02em', lineHeight: 1.22, opacity: o, transform: `translateY(${y}px)`,
              textShadow: '0 2px 26px rgba(3,9,14,.6)',
            }}>{line}</div>
          );
        })}
      </div>
      <div style={{height: 1, background: C.mint, margin: '44px auto 0', width: 300 * rule, opacity: 0.75,
        boxShadow: '0 0 22px rgba(95,214,187,.55)'}} />
      <div style={{
        marginTop: 40, opacity: brand, fontFamily: FONT.sans, fontSize: 66, fontWeight: 300,
        color: C.onMarine, letterSpacing: '0.14em',
      }}>{D.closing.brand}</div>
      <div style={{
        marginTop: 26, opacity: detail, fontFamily: FONT.sans, fontSize: 27, fontWeight: 300,
        color: C.onMarineSoft, letterSpacing: '-0.01em',
      }}>{D.closing.detail}</div>
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------ finish

const GRAIN_TILE = `data:image/svg+xml;utf8,${encodeURIComponent(
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
  const sideCopy = Boolean(shot.insert) || shot.layer === 'network' || shot.layer === 'receipt';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={blur ? {filter: `blur(${blur}px)`, transform: 'scale(1.06)'} : undefined}>
        {shot.field === 'evening' ? <EveningField /> : <Picture shot={shot} />}
        {shot.screen ? <ScreenOnPlate shot={shot} /> : null}
      </AbsoluteFill>
      {dim ? <AbsoluteFill style={{background: `rgba(4,12,18,${dim})`}} /> : null}
      {shot.layer === 'network' ? <NetworkLayer duration={shot.duration} /> : null}
      {shot.layer === 'receipt' ? <ReceiptLayer duration={shot.duration} /> : null}
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
          <Audio src={staticFile(`film-rd/audio/${cue.file}.ogg`)} volume={cue.gain} startFrom={cue.offset ?? 0} />
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
 * Fifteen seconds: the screen, the offer, the door, the Drop, the return.
 * The teaser borrows finished shots rather than re-cutting them, so nothing
 * can drift away from the film.
 */
export const TEASER_FRAMES = 360;
const TEASER: {shot: string; from: number; duration: number; srcOffset?: number}[] = [
  {shot: 'station', from: 0, duration: 48},
  {shot: 'offer', from: 48, duration: 62},
  {shot: 'turn', from: 110, duration: 44, srcOffset: 14},
  {shot: 'first', from: 154, duration: 52, srcOffset: 26},
  {shot: 'drop', from: 206, duration: 62},
  {shot: 'return', from: 268, duration: 32},
  {shot: 'close', from: 300, duration: 60},
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
          <Sequence from={0} durationInFrames={206} name="snd:street-morning">
            <Audio src={staticFile('film-rd/audio/street-morning.ogg')} volume={1.6} />
          </Sequence>
          <Sequence from={206} durationInFrames={62} name="snd:kitchen-evening">
            <Audio src={staticFile('film-rd/audio/kitchen-evening.ogg')} volume={0.72} />
          </Sequence>
          <Sequence from={210} durationInFrames={4} name="snd:notify">
            <Audio src={staticFile('film-rd/audio/notify.ogg')} volume={0.79} />
          </Sequence>
          <Sequence from={268} durationInFrames={40} name="snd:cafe-interior">
            <Audio src={staticFile('film-rd/audio/cafe-interior.ogg')} volume={2.3} startFrom={324} />
          </Sequence>
          <Sequence from={300} durationInFrames={60} name="snd:chord-root">
            <Audio src={staticFile('film-rd/audio/chord-root.ogg')} volume={0.49} />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
