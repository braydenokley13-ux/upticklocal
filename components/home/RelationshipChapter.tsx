import Sms from "@/components/home/Sms";
import { CLAIM } from "@/lib/content";

/** Chapter 7 — what an opted-in customer makes possible after the first visit. */
export default function RelationshipChapter() {
  return (
    <section className="chapter chapter--follow" data-theme="light" aria-labelledby="follow-heading">
      <div className="chapter__inner chapter__inner--split chapter__inner--reverse">
        <Sms className="sms--large" from={CLAIM.merchant} time="Thu 11:15 AM" fine="Reply STOP to opt out." label="A follow-up offer, sent by text">
          Thanks for coming in on Tuesday. Here is a follow-up offer: half off any second item. <span className="sms__link">{CLAIM.followUp}</span>
        </Sms>
        <div className="chapter__copy">
          <p className="mono-tag mono-tag--ink">07 · The follow-up</p>
          <h2 id="follow-heading" className="chapter__title">
            Customers who opt in can hear from you again.
          </h2>
          <p className="chapter__body">
            Send a follow-up offer by text to the customers who chose to receive one. Uptick delivers it, tracks the
            claims and redemptions it brings back, and reports them alongside the first visit.
          </p>
        </div>
      </div>
    </section>
  );
}
