import { GROWTH_EXAMPLE } from "@/lib/content";

/**
 * An example featured-benefit notice through the optional Uptick Local SMS
 * channel. The message is illustrative and does not create a live offer.
 */
export default function DropMessage({ large = false }: { large?: boolean }) {
  const d = GROWTH_EXAMPLE.drop;
  return (
    <div
      className={`drop${large ? " drop--large" : ""}`}
      aria-label="An optional Uptick Local benefit notice by text"
    >
      <p className="drop__from">
        Uptick Local <span>{d.sent}</span>
      </p>
      <p className="drop__kind">
        <span className="drop__pulse" aria-hidden="true" />
        Uptick Drop · {d.kind}
      </p>
      <p className="drop__body">{d.line}</p>
      <p className="drop__window">{d.window}</p>
      <p className="drop__link">
        Claim: <span>{GROWTH_EXAMPLE.claim.dropLink}</span>
      </p>
      <p className="drop__fine">Reply STOP to opt out.</p>
    </div>
  );
}
