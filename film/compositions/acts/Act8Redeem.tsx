import { useCurrentFrame } from "remotion";
import tracksIn from "../../../blender/exports/hero5c.json";
import tracksOut from "../../../blender/exports/hero5.json";
import { PLATES, Plate, trackAt, type TrackData } from "../../block/plate";
import { BLOCK, BUSINESS, OFFER, PASS, PLAN } from "../../data/joes";
import { IN, OUT, PLANE, ramp } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { OfferSlab, PASS_BLOCK, PassSlab, SLAB_H, SLAB_W } from "../../primitives/OfferSlab";
import { Touch } from "../../primitives/Touch";
import { Mono } from "../../primitives/Type";
import { COLOR, FONT } from "../../tokens";
import { THREAD_PLANE } from "./Act6TwoWays";
import { BuildCount, DoorMark, WorldHeader } from "./Build";

const TO = tracksOut as unknown as TrackData; // the forecourt, from the near curb (hero5)
const TI = tracksIn as unknown as TrackData; // inside Joe's, the staff's side of the counter (hero5c)

/**
 * ACT VIII · OFFER → PASS → REDEEM NOW → LIVE
 *
 * 0–2.4 s   The Offer unfolds from the head of the thread and is saved: the
 *           same slab becomes the Pass. The café, 7:10.
 * 2.4–4.25 s Cut: Joe's forecourt, 7:42. The pass goes into a pocket — it
 *           shrinks onto the customer walking in from the pump — and they
 *           go through the door. 1.
 * 4.25–12 s Cut inside, to the staff's side of the counter. The customer
 *           holds the pass up to us; Redeem now; one confirmation that
 *           can't be undone; the block travels up the pass and becomes the
 *           live redeemed state — the merchant, the time running in
 *           seconds, one detail that could only exist now. Staff see it
 *           because they are looking at it. No PIN, no scanner, no second
 *           phone. The count stands at the left through all of it.
 */
const T = {
  unfold: 0,
  save: 26,
  toPass: 32,
  street: 58,
  pocket: 72,
  counter: 102,
  press: 128,
  confirm: 132,
  confirmPress: 156,
  transform: 162,
  tick: 188,
  end: 288,
};
export const ACT8_FRAMES = T.end;
/** The frame the redeemed clock starts. */
export const REDEEM_AT = T.tick;
/** Frames of the forecourt plate this act uses; Act IX continues the same plate from the next frame. */
export const STREET_FRAMES = T.counter - T.street; // 44
const FIRST_CROSSING = ((TO.meta.thresholds as number[]) ?? [30])[0];
/** The first person through the door, on the film's own frames within this act. */
export const FIRST_THRESHOLD = T.street + FIRST_CROSSING; // 88
export const CENTRE = { x: 960 - SLAB_W / 2, y: 540 - SLAB_H / 2 };
const COUNTER_FRAMES = T.end - T.counter; // 186 = the plate
/**
 * The slab, held up at the counter, relative to the phone track's own scale
 * on the first frame. The phone point is the hand; the slab sits to the right
 * of it and a little below, in slab-scale px, so the customer's head and
 * shoulder stay in view beside the pass: staff look at a person holding a
 * phone, not at a card hanging in the room.
 */
const HELD_SCALE = 0.7;
const HELD_OFFSET = { x: 136, y: 72 };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const Act8Redeem = () => {
  const frame = useCurrentFrame();

  // ---------------------------------------------------------------- A · the café: offer → pass
  const unfold = ramp(frame, T.unfold, 22, PLANE);
  const box = {
    x: THREAD_PLANE.x + (CENTRE.x - THREAD_PLANE.x) * unfold,
    y: THREAD_PLANE.y + (CENTRE.y - THREAD_PLANE.y) * unfold,
    w: THREAD_PLANE.w + (SLAB_W - THREAD_PLANE.w) * unfold,
    h: 150 + (SLAB_H - 150) * unfold,
  };
  const saveTouch = ramp(frame, T.save - 2, 12, OUT);
  const savePress = frame >= T.save && frame < T.save + 3 ? 1 : 0;
  const toPass = ramp(frame, T.toPass, 16, PLANE);
  const lampX = 760;
  const lampY = 430;
  const breathe = 0.9 + 0.1 * Math.sin(frame * 0.05);

  // ---------------------------------------------------------------- B · the forecourt: the pocket, the door
  const world = ramp(frame, T.street, 24, PLANE);
  const worldClear = ramp(frame, T.street + 8, 24, PLANE);
  const po = clamp(frame - T.street, 0, TO.frames - 1);
  const first = trackAt(TO, "first", po);
  const doorOut = trackAt(TO, "door_joes", po);
  const pocket = ramp(frame, T.pocket, 20, IN);
  const carried = ramp(frame, T.pocket + 16, 6, OUT) * (1 - ramp(frame, FIRST_THRESHOLD + 4, 10, IN));
  const outside = frame < T.counter;
  const passX = 960 + (first.x - 960) * pocket;
  const passY = 540 + (first.y - 540) * pocket;
  const passScale = 1 - 0.94 * pocket;

  // ---------------------------------------------------------------- C · the counter: the pass held up, redeemed
  const inside = frame >= T.counter;
  const pc = clamp(frame - T.counter, 0, TI.frames - 1);
  const phone = trackAt(TI, "phone", pc);
  const phoneTop = trackAt(TI, "phone_top", pc);
  const phone0 = trackAt(TI, "phone", 0);
  const phoneTop0 = trackAt(TI, "phone_top", 0);
  const depthScale = (phone.y - phoneTop.y) / Math.max(1, phone0.y - phoneTop0.y);
  const out = ramp(frame, T.counter + 2, 16, PLANE); // the pass comes out of the pocket, up into the hand
  const held = HELD_SCALE * depthScale;
  const s = held * (0.08 + 0.92 * out);
  const slabW = SLAB_W * s;
  const slabH = SLAB_H * s;
  const slabX = phone.x + HELD_OFFSET.x * s - slabW / 2;
  const slabY = phone.y + HELD_OFFSET.y * s - slabH / 2 + (1 - out) * 220;
  const pressTouch = ramp(frame, T.press, 12, OUT);
  const press = frame >= T.press && frame < T.press + 3 ? 1 : 0;
  const confirm = ramp(frame, T.confirm, 12, OUT);
  const confirmTouch = ramp(frame, T.confirmPress, 12, OUT);
  const confirmPress = frame >= T.confirmPress && frame < T.confirmPress + 3 ? 1 : 0;
  const redeemed = ramp(frame, T.transform, 26, PLANE);
  const tick = ramp(frame, T.tick, 12, OUT);
  const clockFrames = Math.max(0, frame - T.tick);
  const after = ramp(frame, T.tick + 30, 14, OUT);
  const tapX = slabX + PASS_BLOCK.tapX * s;
  const tapY = slabY + PASS_BLOCK.tapY * s;
  const headerIn = ramp(frame, T.street + 20, 12, OUT);
  const captionIn = ramp(frame, FIRST_THRESHOLD + 8, 12, OUT);

  return (
    <Frame bg="#040c10">
      {/* the café's field, until the world comes up */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - world, background: `radial-gradient(ellipse 980px 680px at ${lampX}px ${lampY}px, rgba(21,40,48,${(0.98 * breathe).toFixed(3)}) 0%, rgba(11,24,31,0.92) 48%, rgba(4,12,16,1) 100%)` }} />

      {/* the world: the forecourt, then the counter */}
      {frame >= T.street && (
        <div style={{ position: "absolute", inset: 0, opacity: world, filter: worldClear < 1 ? `blur(${10 * (1 - worldClear)}px)` : undefined }}>
          {outside && <Plate src={PLATES.hero5} from={T.street} frames={STREET_FRAMES} />}
          {inside && <Plate src={PLATES.hero5c} from={T.counter} frames={COUNTER_FRAMES} />}
          <div style={{ position: "absolute", inset: 0, background: COLOR.marine, opacity: 0.5 * (1 - worldClear) }} />
        </div>
      )}
      <Grain opacity={0.06 * world} />

      {/* header: the café; the street; the counter */}
      {frame < T.street + 12 && (
        <>
          <div style={{ position: "absolute", left: 96, top: 84, opacity: ramp(frame, 8, 10, OUT) * (1 - world) }}>
            <Mono color={COLOR.onMarineSoft}>Café · Friday · 7:10 AM</Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: ramp(frame, 8, 10, OUT) * (1 - world), textAlign: "right" }}>
            <Mono color={COLOR.onMarineSoft}>{toPass > 0.5 ? `Pass · ${PASS.id}` : "Offer · saved to the phone, nothing installed"}</Mono>
          </div>
        </>
      )}
      {frame >= T.street + 12 && (
        <WorldHeader
          left={inside ? `${BUSINESS.short} · counter · Friday · ${PASS.redeemedAt.replace("Fri · ", "")}` : `${BLOCK.street} · Friday · 07:42`}
          right={inside ? `Pass · ${PASS.id}` : `${PLAN.title} · live`}
          live={!inside}
          opacity={headerIn}
        />
      )}

      {/* A · the slab: the thread's head unfolds into the Offer, which becomes the Pass; B · it goes into the pocket */}
      {frame < T.counter && pocket < 1 && (
        <div
          style={{
            position: "absolute",
            left: frame < T.street ? box.x : passX - SLAB_W / 2,
            top: frame < T.street ? box.y : passY - SLAB_H / 2,
            width: frame < T.street ? box.w : SLAB_W,
            height: frame < T.street ? box.h : SLAB_H,
            transform: frame < T.street ? undefined : `scale(${passScale})`,
            transformOrigin: "50% 50%",
            overflow: "hidden",
            borderRadius: 2 + 20 * unfold,
            background: unfold < 0.5 ? "#edeae3" : "#f6f3ec",
            boxShadow: `0 ${40 * unfold}px ${90 * unfold}px -40px rgba(0,0,0,0.8)`,
            opacity: 1 - Math.max(0, (pocket - 0.7) / 0.3),
          }}
        >
          {unfold < 1 && (
            <div style={{ position: "absolute", left: 0, top: 0, width: THREAD_PLANE.w, padding: "26px 34px", color: COLOR.ink, opacity: 1 - Math.min(1, unfold * 2) }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{OFFER.headline}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: COLOR.inkSoft, marginTop: 8 }}>{OFFER.line}</div>
            </div>
          )}
          {toPass < 0.5 && (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: Math.max(0, (unfold - 0.5) * 2) * (1 - toPass * 2), transform: `scale(${box.w / SLAB_W})`, transformOrigin: "0 0" }}>
              <OfferSlab reveal={{ head: 1, body: 1, rows: 1, permission: 1, yes: 1, save: 1 }} savePress={savePress} style={{ boxShadow: "none" }} />
            </div>
          )}
          {toPass > 0.5 && (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: (toPass - 0.5) * 2 }}>
              <PassSlab press={0} confirm={0} confirmPress={0} redeemed={0} tick={0} clockFrames={0} style={{ boxShadow: "none" }} />
            </div>
          )}
        </div>
      )}
      <Touch x={960} y={CENTRE.y + SLAB_H - 36 - 25 - 14 - 29} t={saveTouch} dark />
      {carried > 0 && outside && <div style={{ position: "absolute", left: first.x - 5, top: first.y - 5, width: 10, height: 10, borderRadius: 5, background: COLOR.amber, opacity: 0.9 * carried, boxShadow: `0 0 18px 5px rgba(226,162,79,${0.45 * carried})` }} />}
      {outside && <DoorMark x={doorOut.x} y={doorOut.y} t={frame >= FIRST_THRESHOLD ? Math.max(0, 1 - (frame - FIRST_THRESHOLD) / 14) : 0} />}

      {/* C · the pass, out of the pocket and held up to us; two taps; the block becomes the live state */}
      {inside && (
        <div style={{ position: "absolute", left: slabX, top: slabY, width: SLAB_W, height: SLAB_H, transform: `scale(${s})`, transformOrigin: "0 0", opacity: 0.4 + 0.6 * out, borderRadius: 22, overflow: "hidden", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.35)" }}>
          <PassSlab press={press} confirm={confirm} confirmPress={confirmPress} redeemed={redeemed} tick={tick} clockFrames={clockFrames} style={{ boxShadow: "none" }} />
        </div>
      )}
      {inside && <Touch x={tapX} y={tapY} t={pressTouch} dark size={56 * s} />}
      {inside && <Touch x={tapX} y={tapY} t={confirmTouch} dark size={56 * s} />}

      {/* the count, through the door, from the first crossing on */}
      {frame >= FIRST_THRESHOLD && <BuildCount frame={frame} thresholds={[FIRST_THRESHOLD]} caption={captionIn} />}

      {/* what is and isn't happening: on a lower-third scrim, since the counter top is light and the till's base is dark */}
      {after > 0 && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: "linear-gradient(to top, rgba(4,12,16,0.62), rgba(4,12,16,0))", opacity: after }} />}
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: after }}>
        <Mono color={COLOR.onMarineSoft} size={16}>
          No PIN · No scanner · No second phone · No till
        </Mono>
      </div>
      <div style={{ position: "absolute", right: 96, bottom: 84, opacity: after, textAlign: "right" }}>
        <Mono color={COLOR.onMarineSoft} size={16}>
          Recorded · {PASS.ordinal} · {PASS.redeemedAt.replace("Fri · ", "")}
        </Mono>
      </div>
    </Frame>
  );
};
