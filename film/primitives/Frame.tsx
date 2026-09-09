import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { COLOR, FONT } from "../tokens";
import { useFilmFonts } from "../typography/fonts";

/**
 * The film's stage: full-bleed, with the film fonts loaded and the base
 * colour set. Every composition sits inside one of these.
 */
export function Frame({ children, bg = COLOR.canvas, style }: { children?: ReactNode; bg?: string; style?: CSSProperties }) {
  useFilmFonts();
  return (
    <AbsoluteFill
      style={{
        background: bg,
        fontFamily: FONT.sans,
        color: COLOR.ink,
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
