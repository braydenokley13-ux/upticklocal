import Phone from "@/components/home/Phone";
import { OFFER_SHORT } from "@/lib/content";

/** Chapter 7 — what an opted-in customer is worth after the first visit. */
export default function RelationshipChapter() {
  return (
    <section className="chapter chapter--relationship" aria-labelledby="relationship-heading">
      <div className="chapter__inner">
        <header className="chapter__centre">
          <p className="mono-tag">07 / The relationship</p>
          <h2 id="relationship-heading" className="chapter__title chapter__title--big">
            One claim can start <em>a customer relationship.</em>
          </h2>
        </header>

        <div className="relationship__grid">
          <Phone size="lg" tone="messages">
            <div className="thread">
              <p className="thread__from">Your Business &middot; via Uptick</p>
              <p className="thread__day">Tue 7:02 PM</p>
              <div className="bubble bubble--in">
                Your {OFFER_SHORT} claim is ready:{" "}
                <span className="bubble__link">upticklocal.com/c/4KQ2</span>
              </div>
              <div className="bubble bubble--out">On my way</div>
              <p className="thread__day">Later &middot; Thu 11:15 AM</p>
              <div className="bubble bubble--in">
                Thanks for coming in. Here is another offer: half off any second item.{" "}
                <span className="bubble__link">upticklocal.com/c/8RM1</span>
              </div>
            </div>
          </Phone>

          <div className="relationship__copy">
            <p className="relationship__lead">
              Build your customer text list.
              <br />
              <em>Bring them back.</em>
            </p>
            <ul className="plainlist">
              <li>Customers who opt in can join your text list for future offers.</li>
              <li>Send follow-up offers by text and give them another reason to visit.</li>
              <li>
                Uptick tracks signups, redemptions, and repeat offer activity, and sends you a
                simple report.
              </li>
            </ul>
          </div>
        </div>

        <p className="chapter__note">Illustration of the customer experience.</p>
      </div>
    </section>
  );
}
