import { staticFile, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../tokens";

/**
 * A film grain: one tile of monochrome noise, re-offset every frame, laid
 * over the picture in overlay. Cheap, deterministic, and it takes the
 * rendered plate off the "clean render" register without touching Blender.
 */
export function Grain({ opacity = 0.07, tile = 512 }: { opacity?: number; tile?: number }) {
  const frame = useCurrentFrame();
  // a fixed pseudo-random walk so every render is identical
  const ox = ((frame * 197) % tile) + ((frame * 31) % 7);
  const oy = ((frame * 131) % tile) + ((frame * 17) % 5);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: WIDTH,
        height: HEIGHT,
        pointerEvents: "none",
        backgroundImage: `url(${staticFile("film-rd/grain.png")})`,
        backgroundSize: `${tile}px ${tile}px`,
        backgroundPosition: `${-ox}px ${-oy}px`,
        mixBlendMode: "overlay",
        opacity,
      }}
    />
  );
}
