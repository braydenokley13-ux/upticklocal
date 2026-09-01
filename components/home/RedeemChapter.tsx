import OfferPass from "@/components/home/OfferPass";

/** Chapter 6 — the visit, and how little the merchant has to do. */
export default function RedeemChapter() {
  return (
    <section className="chapter chapter--redeem" aria-labelledby="redeem-heading">
      <div className="chapter__inner chapter__inner--split">
        <div>
          <p className="mono-tag">06 / Visit + redeem</p>
          <h2 id="redeem-heading" className="chapter__title">
            They walk in and redeem <em>on their phone.</em>
          </h2>
          <p className="chapter__body">
            The customer opens the claim at your counter, taps redeem, and shows the confirmed
            screen to your staff. That is the entire interaction.
          </p>

          <ul className="badges">
            <li>No POS integration</li>
            <li>No code entry</li>
            <li>No new software</li>
          </ul>

          {/* Reserved for a real photograph of a redemption at a host counter.
              Nothing goes in here until there is one to put in. */}
          <figure className="photoslot">
            <div className="photoslot__frame" aria-hidden="true">
              <span className="photoslot__label">Photography &mdash; redemption at the counter</span>
            </div>
            <figcaption>To be replaced with a photograph from a live host store.</figcaption>
          </figure>
        </div>

        <OfferPass />
      </div>
    </section>
  );
}
