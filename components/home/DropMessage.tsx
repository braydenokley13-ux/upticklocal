import { GROWTH_EXAMPLE } from "@/lib/content";

/**
 * An Uptick Drop, as it lands: a text from the business, in Uptick's own
 * voice rather than an imitation of any phone's messaging app. The window
 * is the point — it is the one thing on the page that says "now".
 */
export default function DropMessage({ large = false }: { large?: boolean }) {
  const d = GROWTH_EXAMPLE.drop;
  return (
    <div className={`drop${large ? " drop--large" : ""}`} aria-label="An Uptick Drop, delivered by text">
      <p className="drop__from">
        {GROWTH_EXAMPLE.merchant} <span>{d.sent}</span>
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
