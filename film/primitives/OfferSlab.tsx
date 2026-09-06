import type { CSSProperties } from "react";
import { BUSINESS, OFFER, PASS } from "../data/joes";
import { COLOR, FONT } from "../tokens";
import { Mono } from "./Type";

/**
 * Message, Offer and Pass are one slab at different sizes. This is the Offer
 * (claim + permission) and the Pass the customer opens at Joe's. Warm
 * surface, ink type, mint only where the system marks an event. 560 × 720
 * at rest.
 */
export const SLAB_W = 560;
export const SLAB_H = 720;
const PAD = 40;

export type SlabReveal = { head?: number; body?: number; rows?: number; permission?: number; yes?: number; save?: number };

const slabBase: CSSProperties = {
  width: SLAB_W,
  height: SLAB_H,
  background: "#f6f3ec",
  color: COLOR.ink,
  borderRadius: 22,
  padding: `${PAD}px ${PAD}px 36px`,
  boxSizing: "border-box",
  position: "relative",
  fontFamily: FONT.sans,
  boxShadow: "0 40px 90px -40px rgba(0,0,0,0.6)",
  overflow: "hidden",
};

export function OfferSlab({ reveal = {}, style, savePress = 0 }: { reveal?: SlabReveal; style?: CSSProperties; savePress?: number }) {
  const r = (v?: number) => ({ opacity: v ?? 1, transform: `translateY(${(1 - (v ?? 1)) * 10}px)` });
  return (
    <div style={{ ...slabBase, ...style }}>
      <div style={r(reveal.head)}>
        <Mono color={COLOR.inkFaint} size={13}>
          {OFFER.merchant} · {OFFER.address}
        </Mono>
        <div style={{ fontSize: 54, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.02, marginTop: 22 }}>{OFFER.headline}</div>
      </div>
      <div style={{ fontSize: 24, lineHeight: 1.35, color: COLOR.inkSoft, marginTop: 16, ...r(reveal.body) }}>{OFFER.line}</div>
      <div style={{ marginTop: 30, ...r(reveal.rows) }}>
        {OFFER.rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "13px 0", borderTop: `1px solid ${COLOR.inkHair}` }}>
            <Mono color={COLOR.inkFaint} size={12}>
              {k}
            </Mono>
            <span style={{ fontSize: 21, letterSpacing: "-0.01em" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30, ...r(reveal.permission) }}>
        <span style={{ fontSize: 21, color: COLOR.inkSoft }}>{OFFER.permission}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 500 }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${COLOR.ink}`, background: `rgba(95,214,187,${reveal.yes ?? 0})`, borderColor: (reveal.yes ?? 0) > 0.5 ? COLOR.mintDeep : COLOR.ink, display: "inline-block", boxSizing: "border-box" }} />
          {OFFER.yes}
        </span>
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 36, ...r(reveal.save) }}>
        <div style={{ background: COLOR.ink, color: COLOR.canvas, textAlign: "center", padding: "18px 0", borderRadius: 4, fontSize: 21, fontWeight: 500, transform: `scale(${1 - 0.04 * savePress})` }}>{OFFER.save}</div>
        <Mono color={COLOR.inkFaint} size={11} style={{ marginTop: 14, textAlign: "center" }}>
          {OFFER.fine}
        </Mono>
      </div>
    </div>
  );
}

/**
 * The Pass and its redemption, as one object. At rest: the reward, the
 * instruction, one ink block — Redeem now. A tap turns the block into the
 * confirmation; a second tap sends the block up the pass, where it becomes
 * the redeemed state: the merchant, the current time running in seconds,
 * one detail that could only exist now. Mint marks the event — a drawn
 * tick and a live dot — and nothing else on the pass is mint.
 *
 * All inputs are 0–1 and the caller owns the timeline:
 *   press         the first tap on Redeem now (a 4 % press)
 *   confirm       the block becomes "Confirm — this can't be undone"; Not yet appears
 *   confirmPress  the second tap
 *   redeemed      the block travels up and becomes the redeemed state
 *   tick          the mint tick draws
 *   clockFrames   frames since the redemption; the seconds run from PASS.redeemedClock
 */
export const PASS_BLOCK = {
  rest: { top: 586, h: 68 },
  done: { top: 172, h: 136 },
  /** centre of the block at rest, in slab space — where the taps land */
  tapX: SLAB_W / 2,
  tapY: 586 + 34,
} as const;

export function passClock(clockFrames: number, fps = 24) {
  const { h, m, s } = PASS.redeemedClock;
  const total = h * 3600 + m * 60 + s + Math.max(0, Math.floor(clockFrames / fps));
  const hh = Math.floor(total / 3600) % 24;
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
}

export function PassSlab({
  press = 0,
  confirm = 0,
  confirmPress = 0,
  redeemed = 0,
  tick = 0,
  clockFrames = 0,
  style,
}: {
  press?: number;
  confirm?: number;
  confirmPress?: number;
  redeemed?: number;
  tick?: number;
  clockFrames?: number;
  style?: CSSProperties;
}) {
  const up = redeemed; // 0 at rest, 1 in the redeemed state
  const top = PASS_BLOCK.rest.top + (PASS_BLOCK.done.top - PASS_BLOCK.rest.top) * up;
  const h = PASS_BLOCK.rest.h + (PASS_BLOCK.done.h - PASS_BLOCK.rest.h) * up;
  const restLabel = Math.max(0, 1 - up * 2.5);
  const doneLabel = Math.max(0, (up - 0.6) / 0.4);
  const confirmOn = confirm * (1 - Math.min(1, up * 3));
  const instructionOn = 1 - Math.min(1, up * 3);
  const detailOn = Math.max(0, (up - 0.75) / 0.25);
  const pressScale = 1 - 0.04 * Math.max(press, confirmPress);
  const live = tick >= 1 ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((clockFrames / 24) * Math.PI * 2)) : 0;
  const tickLen = 46;
  const done = up > 0.99;
  return (
    <div style={{ ...slabBase, ...style }}>
      {/* status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Mono color={COLOR.inkFaint} size={13}>
          {done ? `Pass · ${PASS.redeemedLine.replace(".", "")}` : `Pass · ${BUSINESS.short}`}
        </Mono>
        <Mono color={COLOR.inkFaint} size={13}>
          {PASS.id}
        </Mono>
      </div>
      {/* the reward */}
      <div style={{ fontSize: 54, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.02, marginTop: 40 }}>{PASS.title}</div>
      {/* the instruction, until the block arrives in its place */}
      <div style={{ position: "absolute", left: PAD, top: 168, width: 440, fontSize: 24, lineHeight: 1.35, color: COLOR.inkSoft, opacity: instructionOn }}>{PASS.instruction}</div>
      {/* after: the detail that could only exist now */}
      <div style={{ position: "absolute", left: PAD, top: PASS_BLOCK.done.top + PASS_BLOCK.done.h + 26, width: 480, fontSize: 24, lineHeight: 1.35, color: COLOR.ink, opacity: detailOn, transform: `translateY(${(1 - detailOn) * 8}px)` }}>{PASS.redeemedDetail}</div>
      {/* the fixed facts */}
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 300 + 240 * up, borderTop: `1px solid ${COLOR.inkHair}`, paddingTop: 16 }}>
        <Mono color={COLOR.inkFaint} size={12}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
        <Mono color={COLOR.inkFaint} size={12} style={{ marginTop: 10 }}>
          {PASS.window}
        </Mono>
      </div>
      {/* the block: Redeem now → Confirm → Redeemed */}
      <div style={{ position: "absolute", left: PAD, right: PAD, top, height: h, background: COLOR.ink, color: COLOR.canvas, borderRadius: 4, transform: `scale(${pressScale})`, transformOrigin: "50% 50%", overflow: "hidden" }}>
        {/* at rest */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, fontWeight: 500, opacity: restLabel * (1 - confirmOn), whiteSpace: "nowrap" }}>{PASS.redeemNow}</div>
        {/* the confirmation, in the same block */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 500, opacity: restLabel * confirmOn, whiteSpace: "nowrap" }}>{PASS.confirm}</div>
        {/* redeemed */}
        <div style={{ position: "absolute", left: 28, top: 26, opacity: doneLabel, display: "flex", alignItems: "center", gap: 16 }}>
          <svg width={36} height={36} viewBox="0 0 36 36" style={{ display: "block" }}>
            <path d="M 6 19 L 14 27 L 30 9" fill="none" stroke={COLOR.mint} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={tickLen} strokeDashoffset={tickLen * (1 - tick)} />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>{PASS.redeemedLine}</div>
        </div>
        <div style={{ position: "absolute", left: 28, right: 28, top: 84, opacity: doneLabel * Math.min(1, tick * 2), display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: COLOR.mint, opacity: live, display: "inline-block", flex: "none" }} />
          <Mono color={COLOR.canvas} size={14} style={{ letterSpacing: "0.12em" }}>
            {BUSINESS.short} · Fri · {passClock(clockFrames)}
          </Mono>
        </div>
      </div>
      {/* under the block */}
      <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 36, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ position: "relative", height: 24 }}>
          <div style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 10, opacity: (1 - confirmOn) * (1 - up), whiteSpace: "nowrap" }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: COLOR.amber, display: "inline-block" }} />
            <Mono color={COLOR.inkFaint} size={11}>
              Active · one per customer
            </Mono>
          </div>
          <div style={{ position: "absolute", left: 0, top: -2, fontSize: 19, fontWeight: 400, color: COLOR.inkSoft, opacity: confirmOn, whiteSpace: "nowrap" }}>{PASS.confirmNo}</div>
          <div style={{ position: "absolute", left: 0, top: 4, opacity: doneLabel, whiteSpace: "nowrap" }}>
            <Mono color={COLOR.inkFaint} size={11}>
              {PASS.live}
            </Mono>
          </div>
        </div>
        <Mono color={COLOR.inkFaint} size={11}>
          {PASS.ordinal}
        </Mono>
      </div>
    </div>
  );
}
