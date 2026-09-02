import { CAMPAIGN, OFFER_TEXT, SPECIAL, type WayId } from "@/lib/content";

/**
 * What the Uptick screen shows for each way in. Laid out with container
 * units, so the same face fits the 16:9 panel at any width — over the baked
 * screen, filling a phone, or in the selector.
 */
export default function ScreenFace({ way }: { way: WayId }) {
  if (way === "host") {
    return (
      <div className="face face--host">
        <p className="face__tag">{SPECIAL.tag}</p>
        <p className="face__big">{SPECIAL.line1}</p>
        <p className="face__sub">{SPECIAL.line2}</p>
        <p className="face__where">Convenience · 118 Main St</p>
      </div>
    );
  }
  if (way === "advertise") {
    return (
      <div className="face face--advertise">
        <p className="face__tag">Nearby · {CAMPAIGN.who}</p>
        <p className="face__big">{CAMPAIGN.line1}</p>
        <p className="face__sub">{CAMPAIGN.line2}</p>
        <p className="face__where">Showing at 4 locations on this block</p>
      </div>
    );
  }
  const words = OFFER_TEXT.split(" ");
  return (
    <div className="face face--growth">
      <p className="face__tag">Example offer · Your Business</p>
      <p className="face__big">
        {words.slice(0, 3).join(" ")}
        <br />
        {words.slice(3).join(" ")}
      </p>
      <p className="face__sub">Scan to claim. Redeem on your phone.</p>
      <span className="face__code" aria-hidden="true" />
    </div>
  );
}

/** The same face, as a sentence, for readers who do not see it. */
export function describeFace(way: WayId): string {
  if (way === "host") return `The screen shows the host store's own special: ${SPECIAL.line1}, ${SPECIAL.line2}. Convenience, 118 Main St.`;
  if (way === "advertise") return `The screen shows a nearby business's campaign: ${CAMPAIGN.who}, ${CAMPAIGN.line1}, ${CAMPAIGN.line2}. Showing at 4 locations on this block.`;
  return `The screen shows an example offer from Your Business: ${OFFER_TEXT}. Scan to claim, redeem on your phone.`;
}
