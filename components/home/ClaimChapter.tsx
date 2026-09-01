import ConsentToggle from "@/components/home/ConsentToggle";
import Phone from "@/components/home/Phone";
import { OFFER_SHORT, OFFER_TEXT } from "@/lib/content";

/** Chapter 5 — what happens in the ten seconds after someone scans. */
export default function ClaimChapter() {
  return (
    <section className="chapter chapter--claim" aria-labelledby="claim-heading">
      <div className="chapter__inner">
        <header className="chapter__head">
          <div>
            <p className="mono-tag">05 / The claim</p>
            <h2 id="claim-heading" className="chapter__title">
              A customer at the counter <em>scans.</em>
            </h2>
          </div>
          <p className="chapter__lead">
            They enter their phone number and receive the claim link by text. Opting into future
            offers from that business is a separate, optional choice.
          </p>
        </header>

        <ol className="claimflow">
          <li>
            <Phone caption="01 — Scanned from the screen">
              <div className="screenui">
                <p className="screenui__brand">
                  <span className="screenui__dot" aria-hidden="true" />
                  uptick local
                </p>
                <div className="screenui__body">
                  <p className="mono-tag mono-tag--gold">Example offer</p>
                  <p className="screenui__offer">{OFFER_TEXT}</p>
                  <p className="screenui__meta">At Your Business &middot; 0.4 mi from here</p>
                </div>
                <p className="screenui__cta">CLAIM THIS OFFER</p>
                <p className="screenui__url">upticklocal.com/claim</p>
              </div>
            </Phone>
          </li>

          <li>
            <Phone caption="02 — Number, then claim link">
              <div className="screenui">
                <p className="screenui__ask">Where should we send your claim link?</p>
                <p className="mono-tag mono-tag--ink">Required</p>
                <p className="screenui__field">(555) 000&#8209;0000</p>
                <p className="screenui__help">
                  Your claim link arrives by text. That is all this number is used for.
                </p>
                <ConsentToggle />
                <p className="screenui__cta">TEXT ME THE CLAIM LINK</p>
              </div>
            </Phone>
          </li>

          <li>
            <Phone tone="messages" caption="03 — Claim link by text">
              <div className="thread">
                <p className="thread__from">+1 (555) 019&#8209;4477</p>
                <div className="bubble bubble--in">
                  Your {OFFER_SHORT} claim from <strong>Your Business</strong> is ready. Open it when
                  you visit: <span className="bubble__link">upticklocal.com/c/4KQ2</span>
                </div>
                <p className="thread__meta">Delivered &middot; 7:02 PM</p>
              </div>
            </Phone>
          </li>
        </ol>

        <p className="chapter__note">Illustration of the customer experience.</p>
      </div>
    </section>
  );
}
