import ClaimUI from "@/components/home/ClaimUI";
import OfferPass from "@/components/home/OfferPass";
import Sms from "@/components/home/Sms";
import { CLAIM, OFFER_SHORT, PHONE_STORY } from "@/lib/content";

/**
 * Growth, on the customer's phone — which is the phone in the reader's hand.
 * So the claim page and the pass are shown at full width, as software, not
 * as pictures of a phone. An editorial break in front makes clear this is
 * the premium layer, not what every Uptick customer does.
 */
export default function MobileGrowth() {
  return (
    <>
      <section className="m-handoff" data-theme="light" aria-labelledby="m-handoff-h">
        <p className="mono-tag mono-tag--ink">{PHONE_STORY.handoff.tag}</p>
        <h2 id="m-handoff-h" className="m-display">
          {PHONE_STORY.handoff.title}
        </h2>
        <p className="m-body m-body--ink">{PHONE_STORY.handoff.body}</p>
        <ol className="m-loop" aria-label="The Growth loop">
          <li>Offer</li>
          <li>Claim</li>
          <li>Visit</li>
          <li>Redeem</li>
          <li>Measure</li>
        </ol>
      </section>

      <section className="m-claim" data-theme="light" aria-labelledby="m-claim-h">
        <div className="m-claim__copy">
          <p className="mono-tag mono-tag--ink">06 · The claim</p>
          <h2 id="m-claim-h" className="m-title m-title--ink">
            A customer scans. The claim arrives by text.
          </h2>
        </div>
        <div className="m-claim__ui">
          <ClaimUI />
        </div>
        <p className="m-caption">The customer&rsquo;s screen after scanning. Future offers by text are a separate, optional choice; leaving it unchecked never affects the claim.</p>
        <div className="m-sms">
          <Sms from="Uptick Local" time="7:02 PM" label="The claim link, delivered by text">
            Your {OFFER_SHORT} claim from {CLAIM.merchant} is ready. Open it when you visit: <span className="sms__link">{CLAIM.link}</span>
          </Sms>
        </div>
      </section>

      <section className="m-pass" data-theme="light" aria-labelledby="m-pass-h">
        <div className="m-pass__copy">
          <p className="mono-tag mono-tag--ink">07 · The visit</p>
          <h2 id="m-pass-h" className="m-title m-title--ink">
            They walk in and redeem on their phone.
          </h2>
        </div>
        <OfferPass frame="none" />
        <ul className="quietlist m-quiet">
          <li>No POS integration</li>
          <li>No code entry</li>
          <li>No new software</li>
        </ul>
      </section>

      <section className="m-follow" data-theme="light" aria-labelledby="m-follow-h">
        <p className="mono-tag mono-tag--ink">08 · The follow-up</p>
        <h2 id="m-follow-h" className="m-title m-title--ink">
          Customers who opt in can hear from you again.
        </h2>
        <div className="m-sms m-sms--follow">
          <Sms from={CLAIM.merchant} time="Thu 11:15 AM" fine="Reply STOP to opt out." label="A follow-up offer, sent by text">
            Thanks for coming in on Tuesday. Here is a follow-up offer: half off any second item. <span className="sms__link">{CLAIM.followUp}</span>
          </Sms>
        </div>
        <p className="m-body m-body--ink">
          Uptick delivers the follow-up, tracks the claims and redemptions it brings back, and reports them alongside the first visit.
        </p>
      </section>
    </>
  );
}
