import { useCurrentFrame } from "remotion";
import { BUSINESS, OFFER, PASS } from "../../data/joes";
import { IN, OUT, PLANE, ramp } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { OfferSlab, PASS_BLOCK, PassSlab, SLAB_H, SLAB_W } from "../../primitives/OfferSlab";
import { Touch } from "../../primitives/Touch";
import { Mono } from "../../primitives/Type";
import { COLOR, FONT } from "../../tokens";
import { THREAD_PLANE } from "./Act6TwoWays";

/**
 * ACT VIII · OFFER → PASS → REDEEM NOW → LIVE
 *
 * The Offer unfolds from the head of the thread and is saved: the same
 * slab becomes the Pass. Half an hour later, at Joe's counter, staff see
 * it; the customer taps Redeem now, confirms once, and the block travels
 * up the pass to become the redeemed state — the merchant, the time
 * running in seconds, one detail that could only exist now. No PIN, no
 * scanner, no second phone.
 */
const T = {
  unfold: 0,
  save: 26,
  toPass: 32,
  counter: 58,
  press: 84,
  confirm: 88,
  confirmPress: 112,
  transform: 118,
  tick: 144,
  end: 228,
};
export const ACT8_FRAMES = T.end;
/** The frame the redeemed clock starts; Act IX continues it. */
export const REDEEM_AT = T.tick;
export const CENTRE = { x: 960 - SLAB_W / 2, y: 540 - SLAB_H / 2 };

export const Act8Redeem = () => {
  const frame = useCurrentFrame();
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
  const counter = ramp(frame, T.counter, 14, PLANE);
  const pressTouch = ramp(frame, T.press, 12, OUT);
  const press = frame >= T.press && frame < T.press + 3 ? 1 : 0;
  const confirm = ramp(frame, T.confirm, 12, OUT);
  const confirmTouch = ramp(frame, T.confirmPress, 12, OUT);
  const confirmPress = frame >= T.confirmPress && frame < T.confirmPress + 3 ? 1 : 0;
  const redeemed = ramp(frame, T.transform, 26, PLANE);
  const tick = ramp(frame, T.tick, 12, OUT);
  const clockFrames = Math.max(0, frame - T.tick);
  const after = ramp(frame, T.tick + 30, 14, OUT);
  const lampX = 760 + 200 * counter;
  const lampY = 430 + 60 * counter - 40 * redeemed;
  const breathe = 0.9 + 0.1 * Math.sin(frame * 0.05);
  const tapX = CENTRE.x + PASS_BLOCK.tapX;
  const tapY = CENTRE.y + PASS_BLOCK.tapY;

  return (
    <Frame bg="#040c10">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 980px 680px at ${lampX.toFixed(0)}px ${lampY.toFixed(0)}px, rgba(21,40,48,${(0.98 * breathe).toFixed(3)}) 0%, rgba(11,24,31,0.92) 48%, rgba(4,12,16,1) 100%)` }} />

      {/* header: the café, then Joe's counter */}
      <div style={{ position: "absolute", left: 96, top: 84, opacity: ramp(frame, 8, 10, OUT) * (1 - counter) }}>
        <Mono color={COLOR.onMarineSoft}>Café · Friday · 7:10 AM</Mono>
      </div>
      <div style={{ position: "absolute", left: 96, top: 84, opacity: counter }}>
        <Mono color={COLOR.onMarineSoft}>
          {BUSINESS.name} · counter · {PASS.redeemedAt.replace("Fri · ", "Friday · ").replace("7:42", "7:41")}
        </Mono>
      </div>
      <div style={{ position: "absolute", right: 96, top: 84, opacity: ramp(frame, 8, 10, OUT), textAlign: "right" }}>
        <Mono color={COLOR.onMarineSoft}>{toPass > 0.5 ? `Pass · ${PASS.id}` : "Offer · saved to the phone, nothing installed"}</Mono>
      </div>

      {/* the slab: the thread's head unfolds into the Offer, which becomes the Pass */}
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, overflow: "hidden", borderRadius: 2 + 20 * unfold, background: unfold < 0.5 ? "#edeae3" : "#f6f3ec", boxShadow: `0 ${40 * unfold}px ${90 * unfold}px -40px rgba(0,0,0,0.6)` }}>
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
            <PassSlab press={press} confirm={confirm} confirmPress={confirmPress} redeemed={redeemed} tick={tick} clockFrames={clockFrames} style={{ boxShadow: "none" }} />
          </div>
        )}
      </div>
      <Touch x={960} y={CENTRE.y + SLAB_H - 36 - 25 - 14 - 29} t={saveTouch} dark />
      <Touch x={tapX} y={tapY} t={pressTouch} dark />
      <Touch x={tapX} y={tapY} t={confirmTouch} dark />

      {/* what is and isn't happening */}
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: ramp(frame, T.counter + 16, 12, OUT) * (1 - ramp(frame, T.transform, 8, IN)) }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          Staff see the pass. That is the check.
        </Mono>
      </div>
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: after }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          No PIN · No scanner · No second phone · No till
        </Mono>
      </div>
      <div style={{ position: "absolute", right: 96, bottom: 84, opacity: after, textAlign: "right" }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          Recorded · {PASS.ordinal} · {PASS.redeemedAt.replace("Fri · ", "")}
        </Mono>
      </div>
    </Frame>
  );
};
