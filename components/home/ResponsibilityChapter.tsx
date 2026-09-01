/** Chapter 8 — the objection killer, on warm paper. */
export default function ResponsibilityChapter() {
  return (
    <section className="chapter chapter--paper" aria-labelledby="system-heading">
      <div className="chapter__inner">
        <h2 id="system-heading" className="paper__title">
          You don&rsquo;t need <em>another system.</em>
        </h2>

        <ul className="badges badges--ink">
          <li>No POS integration</li>
          <li>No code entry</li>
          <li>No new cashier software</li>
        </ul>

        <div className="split-responsibility">
          <div>
            <p className="mono-tag mono-tag--ink">Uptick handles</p>
            <ul className="plainlist plainlist--ink">
              <li>Screens</li>
              <li>QR + claim flow</li>
              <li>Customer texts</li>
              <li>Tracking</li>
              <li>Reporting</li>
            </ul>
          </div>
          <div>
            <p className="mono-tag mono-tag--ink">Your business handles</p>
            <p className="responsibility__yours">
              Choose the offer.
              <br />
              Provide the reward.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
