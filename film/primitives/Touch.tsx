import { COLOR } from "../tokens";

/**
 * A tap: one hairline ring that opens from the point of contact and thins
 * to nothing over ~10 frames. No hand, no cursor; the object itself
 * presses. `t` is 0–1.
 */
export function Touch({ x, y, t, dark = false, size = 56 }: { x: number; y: number; t: number; dark?: boolean; size?: number }) {
  if (t <= 0 || t >= 1) return null;
  const r = 8 + (size - 8) * t;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `1.5px solid ${dark ? COLOR.onMarine : COLOR.ink}`, opacity: 0.8 * (1 - t), pointerEvents: "none" }} />
  );
}
