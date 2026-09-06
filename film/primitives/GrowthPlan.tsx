import type { CSSProperties } from "react";
import { ECONOMICS, PLAN } from "../data/joes";
import { COLOR, FONT } from "../tokens";
import { Mono } from "./Type";

/**
 * ONE GROWTH PLAN — the owner-facing object, at film size. Six lines and a
 * decision. Every row's visibility is a 0–1 reveal so a composition can
 * deliver rows one at a time, or lift one row off the sheet (Hero 4).
 *
 * The sheet is the only tactile object in Direction 1: a warm surface with
 * a faint contact shadow, hairlines between rows, nothing boxed.
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
export const PLAN_ROWS = { title: 0, window: 132, offer: 214, fuel: 296, audience: 366, limit: 448, approve: 560 } as const;
export const PLAN_H = 660;

export const PLAN_LINES = {
  window: PLAN.windowShort,
  offer: PLAN.offer,
  fuel: `Fuel · ${PLAN.fuel.line}`,
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
  scale?: number;
  style?: CSSProperties;
  fuelStyle?: CSSProperties;
  hideFuel?: boolean;
}) {
  const ink = dark ? COLOR.onMarine : COLOR.ink;
  const faint = dark ? COLOR.onMarineFaint : COLOR.inkFaint;
  const hair = dark ? COLOR.onMarineHair : COLOR.inkHair;
  const sheet = reveal.sheet ?? 1;
  const line = (label: string, value: string, key: keyof typeof PLAN_ROWS, big = false, extra?: CSSProperties) => (
    <div style={{ position: "absolute", left: PLAN_PAD, right: PLAN_PAD, top: PLAN_ROWS[key], ...row(reveal[key]), ...extra }}>
      <Mono color={faint} size={13} style={{ marginBottom: 10 }}>
        {label}
      </Mono>
      <div style={{ fontFamily: FONT.sans, fontWeight: 400, fontSize: big ? 36 : 30, letterSpacing: "-0.02em", lineHeight: 1.15, color: ink, whiteSpace: "nowrap" }}>{value}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: big ? 78 : 70, height: 1, background: hair }} />
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: PLAN_W,
        height: PLAN_H,
        transform: `scale(${scale})`,
        transformOrigin: "50% 0%",
        ...style,
      }}
    >
      {/* the sheet */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dark ? "rgba(241,237,229,0.06)" : "#faf8f4",
          borderRadius: 3,
          boxShadow: dark ? "none" : `0 0 0 1px rgba(23,32,31,${0.08 * sheet}), 0 ${28 * sheet}px ${60 * sheet}px -${30 * sheet}px rgba(23,32,31,${0.35 * sheet})`,
          opacity: sheet,
        }}
      />
      <div style={{ position: "absolute", left: PLAN_PAD, right: PLAN_PAD, top: 44, ...row(reveal.title, 18) }}>
        <Mono color={faint} size={13} style={{ marginBottom: 12 }}>
          Growth plan · ready for your approval
        </Mono>
        <div style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 56, letterSpacing: "-0.03em", lineHeight: 1.0, color: ink, whiteSpace: "nowrap" }}>{PLAN.title}</div>
      </div>
      {line("Window", PLAN_LINES.window, "window", true)}
      {line("Offer", PLAN_LINES.offer, "offer", true)}
      {!hideFuel && line("Qualifies", PLAN_LINES.fuel, "fuel", false, fuelStyle)}
      {line("Who", PLAN_LINES.audience, "audience")}
      {line("Limit", PLAN_LINES.limit, "limit")}
      {/* Approve */}
      <div style={{ position: "absolute", left: PLAN_PAD, top: PLAN_ROWS.approve, ...row(reveal.approve, 18) }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 34px",
            borderRadius: 3,
            border: `1.5px solid ${fill > 0.5 ? COLOR.mint : dark ? COLOR.onMarineSoft : COLOR.ink}`,
            background: `rgba(95,214,187,${fill})`,
            color: fill > 0.5 ? COLOR.marine : ink,
            fontFamily: FONT.sans,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            transform: `scale(${1 - 0.04 * press})`,
            transformOrigin: "50% 50%",
          }}
        >
          {PLAN.approve}
        </div>
      </div>
      <div style={{ position: "absolute", right: PLAN_PAD, top: PLAN_ROWS.approve + 24, ...row(reveal.approve, 18), textAlign: "right" }}>
        <Mono color={faint} size={13}>
          {ECONOMICS.fuelRule} {ECONOMICS.fuelRuleTag}
        </Mono>
      </div>
    </div>
  );
}
