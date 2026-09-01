/** Chapter 8 — the objection killer. */
export default function ResponsibilityChapter() {
  return (
    <section className="chapter chapter--handles" data-theme="light" aria-labelledby="system-heading">
      <div className="chapter__inner">
        <h2 id="system-heading" className="chapter__title chapter__title--display">
          You don&rsquo;t need another system.
        </h2>
        <div className="handles">
          <div>
            <p className="mono-tag mono-tag--ink">Uptick handles</p>
            <ul className="handles__list">
              <li>Screens</li>
              <li>QR + claim flow</li>
              <li>Customer texts</li>
              <li>Tracking</li>
              <li>Reporting</li>
            </ul>
          </div>
          <div>
            <p className="mono-tag mono-tag--ink">Your business handles</p>
            <p className="handles__yours">
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
