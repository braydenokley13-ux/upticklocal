import ConsentToggle from "@/components/home/ConsentToggle";
import Device from "@/components/home/Device";
import { OFFER_SHORT } from "@/lib/content";

/** Chapter 5 — the ten seconds after someone scans. */
export default function ClaimChapter() {
  return (
    <section className="chapter chapter--claim" data-theme="light" aria-labelledby="claim-heading">
      <div className="chapter__inner chapter__inner--split">
        <div className="chapter__copy">
          <p className="mono-tag mono-tag--ink">05 · The claim</p>
          <h2 id="claim-heading" className="chapter__title">
            A customer scans. The claim arrives by text.
          </h2>
          <ol className="flow">
            <li>
              <span>01</span>Scan the code on the screen.
            </li>
            <li>
              <span>02</span>Enter a phone number.
            </li>
            <li>
              <span>03</span>The claim link arrives by text.
            </li>
          </ol>
          <p className="chapter__body">
            Future offers by text are a separate, optional choice. Leaving it unchecked never affects the claim.
          </p>
        </div>

        <div className="claimdemo">
          <Device caption="The customer's screen after scanning. Illustration.">
            <div className="claimui">
              <p className="claimui__brand">
                <span className="claimui__dot" aria-hidden="true" />
                uptick local
              </p>
              <p className="claimui__merchant">Your Business</p>
              <p className="claimui__offer">{OFFER_SHORT}</p>
              <p className="claimui__label">Phone number</p>
              <p className="claimui__field">(555) 000&#8209;0000</p>
              <p className="claimui__help">Used once, to text you the claim link.</p>
              <p className="claimui__cta">Send my claim</p>
              <ConsentToggle />
            </div>
          </Device>
          <div className="sms" aria-label="The claim link, delivered by text">
            <p className="sms__from">
              Uptick Local <span>7:02 PM</span>
            </p>
            <p className="sms__body">
              Your {OFFER_SHORT} claim from Your Business is ready. Open it when you visit:{" "}
              <span className="sms__link">upticklocal.com/c/4KQ2</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
