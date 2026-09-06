import type { CSSProperties } from "react";
import { ECONOMICS, PLAN } from "../data/joes";
import { COLOR, FONT } from "../tokens";
import { Mono } from "./Type";

/**
 * ONE GROWTH PLAN — the owner-facing object, at film size. A title, five
 * lines and a decision. Every row's visibility is a 0–1 reveal so a
 * composition can deliver rows one at a time, or lift one row off the
 * sheet (Hero 4).
 *
 * On the page (Direction 1) it is set bare: hairlines, no box, no shadow,
 * no heavier than the owner's own sentence. `dark` renders it as a
 * translucent sheet for the focused-dark stage.
 */
export type PlanReveal = {
  sheet?: number;
  title?: number;
  window?: number;
  offer?: number;
  fuel?: number;
  audience?: number;
  limit?: number;
  approve?: number;
};

export const PLAN_W = 820;
export const PLAN_PAD = 56;
export const PLAN_ROWS = { title: 0, window: 152, offer: 240, fuel: 328, audience: 404, limit: 492, approve: 600 } as const;
export const PLAN_H = 700;

export const PLAN_LINES = {
  window: PLAN.windowShort,
  offer: PLAN.offer,
  fuel: `Fuel: ${PLAN.fuel.values.join(", ").replace(", Diesel", " or diesel").replace("Premium", "premium")}`,
  audience: PLAN.audience,
  limit: `${PLAN.limitLine} · ${PLAN.exposureLine}`,
} as const;

function row(v: number | undefined, dy = 14): CSSProperties {
  const o = v ?? 1;
  return { opacity: o, transform: `translateY(${(1 - o) * dy}px)` };
}

export function GrowthPlanCard({
  x,
  y,
  reveal = {},
  press = 0,
  fill = 0,
  dark = false,
  bare = false,
  approved = false,
  rules = true,
  labels = true,
  titleSize = 72,
  approveStyle = "box",
  scale = 1,
  style,
  fuelStyle,
  hideFuel = false,
}: {
  x: number;
  y: number;
  reveal?: PlanReveal;
  /** 0–1: the Approve block's 4% press. */
  press?: number;
  /** 0–1: mint fill of the Approve block. */
  fill?: number;
  dark?: boolean;
  /** Set directly on the page: no surface, no shadow. */
  bare?: boolean;
  /** Already approved: the header says so, the Approve block is gone. */
  approved?: boolean;
  /** Hairlines between rows. */
  rules?: boolean;
  /** Mono eyebrow labels on the rows (Window, Offer…). Off for the film's statement form. */
  labels?: boolean;
  titleSize?: number;
  /** "box": an outlined block. "underline": the word over a mint hairline — no closed shape. */
  approveStyle?: "box" | "underline";
  scale?: number;
  style?: CSSProperties;
  fuelStyle?: CSSProperties;
  hideFuel?: boolean;
}) {
  const ink = dark ? COLOR.onMarine : COLOR.ink;
  const faint = dark ? COLOR.onMarineFaint : COLOR.inkFaint;
  const hair = dark ? "rgba(241,237,229,0.22)" : COLOR.inkHair;
  const sheet = reveal.sheet ?? 1;
  const pad = bare ? 0 : PLAN_PAD;
  const line = (label: string, value: string, key: keyof typeof PLAN_ROWS, extra?: CSSProperties) => (
    <div style={{ position: "absolute", left: pad, right: pad, top: PLAN_ROWS[key], ...row(reveal[key]), ...extra }}>
      {labels && (
        <Mono color={faint} size={12} style={{ marginBottom: 10 }}>
          {label}
        </Mono>
      )}
      <div style={{ fontFamily: FONT.sans, fontWeight: 300, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.15, color: ink, whiteSpace: "nowrap", marginTop: labels ? 0 : 14 }}>{value}</div>
      {rules && <div style={{ position: "absolute", left: 0, right: 0, top: 74, height: 1, background: hair }} />}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, width: PLAN_W, height: PLAN_H, transform: `scale(${scale})`, transformOrigin: "50% 0%", ...style }}>
      {!bare && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: dark ? "rgba(241,237,229,0.05)" : "#faf8f4",
            borderRadius: 3,
            boxShadow: dark ? "none" : `0 0 0 1px rgba(23,32,31,${0.08 * sheet})`,
            opacity: sheet,
          }}
        />
      )}
      <div style={{ position: "absolute", left: pad, right: pad, top: bare ? 0 : 44, ...row(reveal.title, 18) }}>
        {labels && (
          <Mono color={faint} size={12} style={{ marginBottom: 14 }}>
            {approved ? `Growth plan · approved · ${PLAN.approvedAt}` : "Growth plan · ready for your approval"}
          </Mono>
        )}
        <div style={{ fontFamily: FONT.sans, fontWeight: titleSize > 80 ? 200 : 300, fontSize: titleSize, letterSpacing: "-0.035em", lineHeight: 1.0, color: ink, whiteSpace: "nowrap", position: "absolute", left: 0, bottom: 0 }}>{PLAN.title}</div>
      </div>
      {line("Window", PLAN_LINES.window, "window")}
      {line("Offer", PLAN_LINES.offer, "offer")}
      {!hideFuel && line("Qualifies", PLAN_LINES.fuel, "fuel", fuelStyle)}
      {line("Who", PLAN_LINES.audience, "audience")}
      {line("Limit", PLAN_LINES.limit, "limit")}
      {!approved && approveStyle === "underline" && (
        <div style={{ position: "absolute", left: pad, top: PLAN_ROWS.approve, ...row(reveal.approve, 18) }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 300, fontSize: 40, letterSpacing: "-0.02em", color: fill > 0.5 ? COLOR.mintDeep : ink, lineHeight: 1, paddingBottom: 12, transform: `scale(${1 - 0.04 * press})`, transformOrigin: "0 100%", display: "inline-block" }}>{PLAN.approve}</div>
          <div style={{ width: 150, height: 2, background: COLOR.mintDeep, opacity: 0.6 + 0.4 * fill }} />
        </div>
      )}
      {!approved && approveStyle === "box" && (
        <div style={{ position: "absolute", left: pad, top: PLAN_ROWS.approve, ...row(reveal.approve, 18), display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "18px 36px",
              borderRadius: 3,
              border: `1.5px solid ${fill > 0.5 ? COLOR.mint : dark ? COLOR.onMarineSoft : COLOR.ink}`,
              background: `rgba(95,214,187,${fill})`,
              color: fill > 0.5 ? COLOR.marine : ink,
              fontFamily: FONT.sans,
              fontSize: 26,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              transform: `scale(${1 - 0.04 * press})`,
              transformOrigin: "50% 50%",
            }}
          >
            {PLAN.approve}
          </div>
          <Mono color={faint} size={12}>
            {ECONOMICS.fuelRule} {ECONOMICS.fuelRuleTag}
          </Mono>
        </div>
      )}
    </div>
  );
}
