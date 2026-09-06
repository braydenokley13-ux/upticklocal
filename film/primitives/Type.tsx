import type { CSSProperties } from "react";
import { COLOR, FONT, monoStyle } from "../tokens";

/**
 * The film's three voices. Numeral: Geist Light at display sizes, tight.
 * Line: Geist Regular for a sentence. Mono: the annotation on the drawing.
 */
export function Numeral({ value, size = 840, color = COLOR.ink, weight = 300, style }: { value: string | number; size?: number; color?: string; weight?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: FONT.sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 0.82,
        letterSpacing: "-0.06em",
        color,
        fontVariantNumeric: "lining-nums tabular-nums",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {value}
    </div>
  );
}

export function Line({ children, size = 44, color = COLOR.ink, weight = 400, style }: { children: React.ReactNode; size?: number; color?: string; weight?: number; style?: CSSProperties }) {
  return <div style={{ fontFamily: FONT.sans, fontWeight: weight, fontSize: size, lineHeight: 1.3, letterSpacing: "-0.018em", color, ...style }}>{children}</div>;
}

export function Mono({ children, color = COLOR.inkFaint, size = 22, style }: { children: React.ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return <div style={{ ...monoStyle(color, size), ...style }}>{children}</div>;
}

/** The customer's voice: the only serif in the film. */
export function Voice({ children, size = 44, color = COLOR.onMarine, style }: { children: React.ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, fontSize: size, lineHeight: 1.25, letterSpacing: "-0.005em", color, ...style }}>{children}</div>;
}

/** Words that arrive one at a time. `visible` is the index of the last visible word. */
export function Words({ text, visible, gap = "0.28em", style, wordStyle }: { text: string; visible: number; gap?: string; style?: CSSProperties; wordStyle?: (i: number) => CSSProperties }) {
  const words = text.split(" ");
  return (
    <span style={style}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", marginRight: i < words.length - 1 ? gap : 0, opacity: i <= visible ? 1 : 0, ...wordStyle?.(i) }}>
          {w}
        </span>
      ))}
    </span>
  );
}

/** A hairline rule. */
export function Rule({ x, y, w, color = COLOR.inkHair, thickness = 1.5, opacity = 1, rotate = 0, origin = "0 50%" }: { x: number; y: number; w: number; color?: string; thickness?: number; opacity?: number; rotate?: number; origin?: string }) {
  return <div style={{ position: "absolute", left: x, top: y - thickness / 2, width: w, height: thickness, background: color, opacity, transform: `rotate(${rotate}rad)`, transformOrigin: origin }} />;
}
