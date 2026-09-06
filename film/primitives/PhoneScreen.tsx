import type { CSSProperties } from "react";
import { BUSINESS, MESSAGE, OFFER, PASS } from "../data/joes";
import { COLOR, FONT } from "../tokens";
import { useFilmFonts } from "../typography/fonts";
import { Mono } from "./Type";

/**
 * THE PHONE'S SCREEN · what the panel inside the Blender shot is actually emitting.
 *
 * This is rendered on its own, at the handset's aspect, and baked to a PNG
 * sequence that becomes the emission texture of the phone's screen in the
 * physical shots. It is therefore never composited on top of the world: it is
 * lit by the world, reflected in the world's glass, blurred by the lens, and
 * covered by the thumb that presses it.
 *
 * 780 × 1688 is 6.1" at 1170 × 2532, two-thirds size.
 */
export const PHONE_W = 780;
export const PHONE_H = 1688;
const PAD = 62;

/** The one transforming object. At rest it is the action; after the tap it is the state. */
export const BLOCK = {
  rest: { top: 1214, h: 122 },
  done: { top: 902, h: 434 },
} as const;

const face: CSSProperties = {
  width: PHONE_W,
  height: PHONE_H,
  background: COLOR.canvas,
  color: COLOR.ink,
  padding: `${PAD}px ${PAD}px ${PAD}px`,
  boxSizing: "border-box",
  position: "relative",
  fontFamily: FONT.sans,
  overflow: "hidden",
};

function Mark({ live = 0 }: { live?: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: COLOR.mint, opacity: 0.55 + 0.45 * live, display: "inline-block" }} />
        <Mono color={COLOR.inkFaint} size={21}>
          uptick
        </Mono>
      </div>
      <Mono color={COLOR.inkFaint} size={21}>
        {PASS.id}
      </Mono>
    </div>
  );
}

function Rows({ reveal = 1, opacity = 1 }: { reveal?: number; opacity?: number }) {
  const rows = OFFER.rows;
  return (
    <div style={{ position: "absolute", left: PAD, right: PAD, top: 596, opacity }}>
      {rows.map(([k, v], i) => (
        <div
          key={k}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: `1px solid ${COLOR.inkHair}`,
            padding: "28px 0 26px",
            opacity: Math.max(0, Math.min(1, reveal * 3 - i)),
          }}
        >
          <Mono color={COLOR.inkFaint} size={20}>
            {k}
          </Mono>
          <div style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>{v}</div>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${COLOR.inkHair}` }} />
    </div>
  );
}

/** The offer, as it arrives — from a text or from a code on a café counter. */
export function PhoneOffer({ reveal = 1, savePress = 0, saved = 0 }: { reveal?: number; savePress?: number; saved?: number }) {
  useFilmFonts();
  return (
    <div style={face}>
      <Mark />
      <div style={{ position: "absolute", left: PAD, top: 244, opacity: Math.min(1, reveal * 2) }}>
        <Mono color={COLOR.inkFaint} size={20}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 296, fontSize: 82, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.0, opacity: Math.min(1, reveal * 2) }}>{OFFER.headline}</div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 424, fontSize: 34, fontWeight: 400, lineHeight: 1.32, color: COLOR.inkSoft, opacity: Math.max(0, Math.min(1, reveal * 2 - 0.5)) }}>{OFFER.line}</div>
      <Rows reveal={reveal} />
      <div
        style={{
          position: "absolute",
          left: PAD,
          right: PAD,
          top: BLOCK.rest.top,
          height: BLOCK.rest.h,
          background: COLOR.ink,
          color: COLOR.canvas,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          fontWeight: 500,
          transform: `scale(${1 - 0.03 * savePress})`,
          opacity: Math.max(0, Math.min(1, reveal * 3 - 1.6)),
        }}
      >
        {saved > 0.5 ? "Saved to your phone" : "Save my pass"}
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: BLOCK.rest.top + BLOCK.rest.h + 34, fontSize: 28, color: COLOR.inkSoft, opacity: Math.max(0, Math.min(1, reveal * 3 - 2)) }}>{OFFER.fine}</div>
    </div>
  );
}

export function passClock(clockFrames: number, fps = 24) {
  const { h, m, s } = PASS.redeemedClock;
  const total = h * 3600 + m * 60 + s + Math.max(0, Math.floor(clockFrames / fps));
  const hh = Math.floor(total / 3600) % 24;
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/**
 * The pass. One customer action: Redeem now, and it is done.
 *
 * `press`      0–1, the finger is down
 * `redeemed`   0–1, the block travels from the action to the state
 * `tick`       0–1, the mint mark draws — the only mint in the shot
 * `clockFrames` frames since the redemption; the seconds are real
 */
export function PhonePass({ press = 0, redeemed = 0, tick = 0, clockFrames = 0 }: { press?: number; redeemed?: number; tick?: number; clockFrames?: number }) {
  useFilmFonts();
  const up = redeemed;
  const top = BLOCK.rest.top + (BLOCK.done.top - BLOCK.rest.top) * up;
  const h = BLOCK.rest.h + (BLOCK.done.h - BLOCK.rest.h) * up;
  const restLabel = Math.max(0, 1 - up * 4);
  const yield_ = Math.max(0, Math.min(1, (up - 0.22) / 0.4));
  const doneLabel = Math.max(0, (up - 0.55) / 0.45);
  const detail = Math.max(0, (up - 0.8) / 0.2);
  const live = tick >= 1 ? 0.5 + 0.5 * (0.5 + 0.5 * Math.sin((clockFrames / 24) * Math.PI * 2)) : 0;
  const tickLen = 62;
  return (
    <div style={face}>
      <Mark live={live} />
      <div style={{ position: "absolute", left: PAD, top: 244, opacity: 1 }}>
        <Mono color={COLOR.inkFaint} size={20}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 296, fontSize: 82, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.0 }}>{PASS.title}</div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 424, fontSize: 34, fontWeight: 400, lineHeight: 1.32, color: COLOR.inkSoft, opacity: 1 - yield_ }}>{PASS.instruction}</div>
      {/* the terms stay: they are what was redeemed, and they keep the card whole
          instead of leaving a hole between the headline and the state */}
      <Rows reveal={1} opacity={1 - 0.55 * yield_} />

      {/* the one object: the action becomes the state, in place */}
      <div style={{ position: "absolute", left: PAD, right: PAD, top, height: h, background: COLOR.ink, color: COLOR.canvas, borderRadius: 6, transform: `scale(${1 - 0.03 * press})`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 500, opacity: restLabel }}>{PASS.redeemNow}</div>
        <div style={{ position: "absolute", left: 44, top: 44, opacity: doneLabel, display: "flex", alignItems: "center", gap: 22 }}>
          <svg width={48} height={48} viewBox="0 0 48 48" style={{ display: "block" }}>
            <path d="M 8 25 L 19 36 L 40 12" fill="none" stroke={COLOR.mint} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={tickLen} strokeDashoffset={tickLen * (1 - tick)} />
          </svg>
          <div style={{ fontSize: 52, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>{PASS.redeemedLine}</div>
        </div>
        <div style={{ position: "absolute", left: 44, right: 44, top: 152, opacity: doneLabel * Math.min(1, tick * 2), display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: COLOR.mint, opacity: live, display: "inline-block", flex: "none" }} />
          <Mono color={COLOR.canvas} size={24}>
            {BUSINESS.short} · {passClock(clockFrames)} AM
          </Mono>
        </div>
        <div style={{ position: "absolute", left: 44, right: 44, top: 226, fontSize: 32, fontWeight: 400, opacity: detail, color: "rgba(243,240,233,0.74)" }}>{PASS.redeemedDetail}</div>
        <div style={{ position: "absolute", left: 44, right: 44, bottom: 40, opacity: detail, display: "flex", justifyContent: "space-between" }}>
          <Mono color="rgba(243,240,233,0.45)" size={20}>
            Pass {PASS.id}
          </Mono>
          <Mono color="rgba(243,240,233,0.45)" size={20}>
            {PASS.ordinal}
          </Mono>
        </div>
      </div>

      <div style={{ position: "absolute", left: PAD, right: PAD, top: BLOCK.rest.top + BLOCK.rest.h + 40, fontSize: 28, color: COLOR.inkSoft, opacity: 1 - Math.min(1, yield_ * 1.6) }}>{PASS.window}</div>
    </div>
  );
}

/** The text as it lands, Thursday evening: the phone at rest on a kitchen counter. */
export function PhoneText({ reveal = 1, press = 0 }: { reveal?: number; press?: number }) {
  useFilmFonts();
  return (
    <div style={{ ...face, background: COLOR.canvasDeep }}>
      <Mark />
      <div style={{ position: "absolute", left: PAD, top: 300 }}>
        <Mono color={COLOR.inkFaint} size={20}>
          {MESSAGE.text.when} · {MESSAGE.text.who}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 372, background: COLOR.canvas, borderRadius: 22, padding: 44, opacity: Math.min(1, reveal * 2) }}>
        <div style={{ fontSize: 42, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.26 }}>{MESSAGE.text.body}</div>
        <div style={{ fontSize: 30, color: COLOR.inkSoft, marginTop: 20, lineHeight: 1.3 }}>{MESSAGE.text.detail}</div>
        <div style={{ fontSize: 30, fontWeight: 500, marginTop: 30, display: "inline-block", borderBottom: `2px solid ${COLOR.ink}`, paddingBottom: 4, transform: `scale(${1 - 0.03 * press})` }}>{MESSAGE.text.link}</div>
      </div>
    </div>
  );
}
