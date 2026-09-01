import { OFFER_TEXT } from "@/lib/content";

/**
 * The DOM surface the screen content hands over to. Laid out to the same
 * proportions as the panel texture, so at the end of the dolly the WebGL
 * frame and this element are the same picture — then this one is the one that
 * stays, and it is real text.
 */
export default function ScreenMatch() {
  const words = OFFER_TEXT.split(" ");
  return (
    <div className="screenmatch" aria-hidden="true">
      <div className="screenmatch__inner">
        <p className="screenmatch__eyebrow">Example offer</p>
        <p className="screenmatch__offer">
          {words.slice(0, 3).join(" ")}
          <br />
          {words.slice(3).join(" ")}
        </p>
        <p className="screenmatch__sub">Scan to claim. Redeem on your phone.</p>
        <p className="screenmatch__mark">
          <span className="screenmatch__dot" />
          uptick local
        </p>
        <div className="screenmatch__code">
          <svg className="screenmatch__qr" viewBox="0 0 240 240" aria-hidden="true">
            <rect width="240" height="240" rx="14" fill="#f4efe6" />
            {[
              [26, 26],
              [158, 26],
              [26, 158],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`} fill="#061416">
                <rect x={x} y={y} width="56" height="56" />
                <rect x={x + 10} y={y + 10} width="36" height="36" fill="#f4efe6" />
                <rect x={x + 18} y={y + 18} width="20" height="20" />
              </g>
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8]
              .filter((i) => (i * 7) % 3 !== 1)
              .map((i) => (
                <rect key={i} x={108 + (i % 3) * 30} y={108 + Math.floor(i / 3) * 30} width="18" height="18" fill="#061416" />
              ))}
          </svg>
          <span className="screenmatch__scan">Scan to claim</span>
        </div>
      </div>
    </div>
  );
}
