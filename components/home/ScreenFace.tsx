import { CAMPAIGN, GROWTH_EXAMPLE, SPECIAL, type WayId } from "@/lib/content";

/**
 * What the Uptick screen shows for each way in. Laid out with container
 * units, so the same face fits the 16:9 panel at any width — over the baked
 * screen, filling a phone, in the selector, or as the Anchor in Growth.
 */
export default function ScreenFace({ way }: { way: WayId }) {
  if (way === "host") {
    return (
      <div className="face face--host">
        <p className="face__tag">{SPECIAL.tag}</p>
        <p className="face__big">{SPECIAL.line1}</p>
        <p className="face__sub">{SPECIAL.line2}</p>
        <p className="face__where">{SPECIAL.where}</p>
      </div>
    );
  }
  if (way === "advertise") {
    return (
      <div className="face face--advertise">
        <p className="face__tag">Nearby · {CAMPAIGN.who}</p>
        <p className="face__big">{CAMPAIGN.line1}</p>
        <p className="face__sub">{CAMPAIGN.line2}</p>
        <p className="face__where">{CAMPAIGN.where}</p>
      </div>
    );
  }
  const a = GROWTH_EXAMPLE.anchor;
  return (
    <div className="face face--growth">
      <p className="face__tag">{a.tag}</p>
      <p className="face__big">
        {a.line1}
        <br />
        <span className="face__arrow" aria-hidden="true">
          →
        </span>{" "}
        {a.line2}
      </p>
      <p className="face__where">{a.scan}</p>
      <span className="face__code" aria-hidden="true" />
    </div>
  );
}

/** The same face, as a sentence, for readers who do not see it. */
export function describeFace(way: WayId): string {
  if (way === "host") return `The screen shows the host store's own special: ${SPECIAL.line1}, ${SPECIAL.line2}. ${SPECIAL.where}.`;
  if (way === "advertise") return `The screen shows a nearby business's campaign: ${CAMPAIGN.who}, ${CAMPAIGN.line1}, ${CAMPAIGN.line2}. ${CAMPAIGN.where}.`;
  const a = GROWTH_EXAMPLE.anchor;
  return `The screen shows the Monthly Anchor for ${GROWTH_EXAMPLE.merchant}: ${a.line1}, ${a.line2}. ${a.scan}. A code to scan.`;
}
