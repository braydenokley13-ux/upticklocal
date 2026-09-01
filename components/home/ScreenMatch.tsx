import { SPECIAL } from "@/lib/content";

/**
 * The DOM surface the screen content hands over to. Laid out to the same
 * proportions as the panel texture, so at the end of the dolly the WebGL
 * frame and this element are the same picture — then this one stays, and it
 * is real text.
 */
export default function ScreenMatch() {
  return (
    <div className="screenmatch" aria-hidden="true">
      <div className="screenmatch__inner">
        <p className="screenmatch__eyebrow">{SPECIAL.tag}</p>
        <p className="screenmatch__offer">{SPECIAL.line1}</p>
        <p className="screenmatch__sub">{SPECIAL.line2}</p>
        <p className="screenmatch__where">Convenience · 118 Main St</p>
        <p className="screenmatch__mark">
          <span className="screenmatch__dot" />
          uptick local
        </p>
      </div>
    </div>
  );
}
