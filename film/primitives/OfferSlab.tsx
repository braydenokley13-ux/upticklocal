import type { CSSProperties } from "react";
import { BUSINESS, OFFER, PASS } from "../data/joes";
import { COLOR, FONT } from "../tokens";
import { Mono } from "./Type";

/**
 * Message, Offer and Pass are one slab at different sizes. This is the Offer
 * (claim + permission) and, in `pass` mode, the Pass the customer shows at
 * the counter. Warm surface, ink type, one mint moment (the permission's
 * Yes, or the redemption sweep). 560 × 720 at rest.
 */
export const SLAB_W = 560;
export const SLAB_H = 720;

export type SlabReveal = { head?: number; body?: number; rows?: number; permission?: number; yes?: number; save?: number };

export function OfferSlab({ reveal = {}, style, savePress = 0 }: { reveal?: SlabReveal; style?: CSSProperties; savePress?: number }) {
  const r = (v?: number) => ({ opacity: v ?? 1, transform: `translateY(${(1 - (v ?? 1)) * 10}px)` });
  return (
    <div style={{ width: SLAB_W, height: SLAB_H, background: "#f6f3ec", color: COLOR.ink, borderRadius: 22, padding: "40px 40px 36px", boxSizing: "border-box", position: "relative", fontFamily: FONT.sans, boxShadow: "0 40px 90px -40px rgba(0,0,0,0.6)", ...style }}>
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
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 36, ...r(reveal.save) }}>
        <div style={{ background: COLOR.ink, color: COLOR.canvas, textAlign: "center", padding: "18px 0", borderRadius: 4, fontSize: 21, fontWeight: 500, transform: `scale(${1 - 0.04 * savePress})` }}>{OFFER.save}</div>
        <Mono color={COLOR.inkFaint} size={11} style={{ marginTop: 14, textAlign: "center" }}>
          {OFFER.fine}
        </Mono>
      </div>
    </div>
  );
}

/** The Pass at Joe's counter, before and after the sweep. `redeemed` 0–1 drives the state band. */
export function PassSlab({ redeemed = 0, sweep = 0, style }: { redeemed?: number; sweep?: number; style?: CSSProperties }) {
  const on = redeemed > 0.5;
  return (
    <div style={{ width: SLAB_W, height: SLAB_H, background: "#f6f3ec", color: COLOR.ink, borderRadius: 22, padding: "40px 40px 36px", boxSizing: "border-box", position: "relative", fontFamily: FONT.sans, overflow: "hidden", boxShadow: "0 40px 90px -40px rgba(0,0,0,0.6)", ...style }}>
      {/* status band */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Mono color={on ? COLOR.mintDeep : COLOR.inkFaint} size={13}>
          {on ? PASS.redeemedLine.replace(".", "") + " · " + PASS.redeemedAt : "Pass · " + BUSINESS.short}
        </Mono>
        <Mono color={COLOR.inkFaint} size={13}>
          {PASS.id}
        </Mono>
      </div>
      <div style={{ fontSize: 54, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.02, marginTop: 40 }}>{on ? PASS.redeemedLine : PASS.title}</div>
      <div style={{ fontSize: 24, lineHeight: 1.35, color: COLOR.inkSoft, marginTop: 16, maxWidth: 420 }}>{on ? PASS.redeemedDetail : PASS.instruction}</div>
      <div style={{ marginTop: 40, borderTop: `1px solid ${COLOR.inkHair}`, paddingTop: 16 }}>
        <Mono color={COLOR.inkFaint} size={12}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
        <Mono color={COLOR.inkFaint} size={12} style={{ marginTop: 10 }}>
          {on ? PASS.confirmed : "Friday · 7–10 AM · one per customer"}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: 40, bottom: 36, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: on ? COLOR.mintDeep : COLOR.amber, display: "inline-block" }} />
        <Mono color={COLOR.inkFaint} size={11}>
          {on ? `${PASS.ordinal} · via Uptick Local` : "Active · show this to staff"}
        </Mono>
      </div>
      {/* the sweep: one mint plane, top to bottom, once */}
      {sweep > 0 && sweep < 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: `${sweep * 100}%`, height: 3, background: COLOR.mint, boxShadow: `0 0 24px 6px rgba(95,214,187,0.35)` }} />
      )}
      {sweep > 0 && sweep < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${sweep * 100}%`, background: "rgba(95,214,187,0.06)" }} />}
    </div>
  );
}
