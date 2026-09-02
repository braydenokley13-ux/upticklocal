import ClaimUI from "@/components/home/ClaimUI";
import Device from "@/components/home/Device";
import Sms from "@/components/home/Sms";
import { CLAIM, OFFER_SHORT } from "@/lib/content";

/** Chapter 5 — the ten seconds after someone scans. */
export default function ClaimChapter() {
  return (
    <section className="chapter chapter--claim" data-theme="light" aria-labelledby="claim-heading">
      <div className="chapter__inner chapter__inner--split">
        <div className="chapter__copy">
          <p className="mono-tag mono-tag--ink">Uptick Growth · 05 · The claim</p>
          <h2 id="claim-heading" className="chapter__title">
            With Growth, a customer scans. The claim arrives by text.
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
            <ClaimUI />
          </Device>
          <Sms from="Uptick Local" time="7:02 PM" label="The claim link, delivered by text">
            Your {OFFER_SHORT} claim from {CLAIM.merchant} is ready. Open it when you visit: <span className="sms__link">{CLAIM.link}</span>
          </Sms>
        </div>
      </div>
    </section>
  );
}
