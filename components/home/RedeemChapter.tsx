import OfferPass from "@/components/home/OfferPass";

/** Chapter 6 — the visit, and how little the merchant has to do. */
export default function RedeemChapter() {
  return (
    <section className="chapter chapter--pass" data-theme="light" aria-labelledby="redeem-heading">
      <div className="chapter__inner chapter__inner--split">
        <div className="chapter__copy">
          <p className="mono-tag mono-tag--ink">06 · The visit</p>
          <h2 id="redeem-heading" className="chapter__title">
            They walk in and redeem on their phone.
          </h2>
          <p className="chapter__body">
            The customer opens the claim at your counter, shows it to staff, and taps redeem. The state change is the
            receipt.
          </p>
          <ul className="quietlist">
            <li>No POS integration</li>
            <li>No code entry</li>
            <li>No new software</li>
          </ul>
        </div>
        <OfferPass />
      </div>
    </section>
  );
}
