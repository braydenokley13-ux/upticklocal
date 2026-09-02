"use client";

import { useId, useState } from "react";
import { CONSENT, GROWTH_EXAMPLE } from "@/lib/content";

/**
 * The customer's claim page, the ten seconds after they scan the Anchor.
 * The number field and the send action are pictures of controls — there is
 * no backend to send to, and a form that drops what you typed is worse than
 * none. The two consent boxes are real controls, so a reader can see that
 * nothing is pre-ticked and that the claim goes through without them.
 */
export default function ClaimUI({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [merchant, setMerchant] = useState(false);
  const [network, setNetwork] = useState(false);

  return (
    <div className={`claimui${compact ? " claimui--compact" : ""}`}>
      <p className="claimui__brand">
        <span className="claimui__dot" aria-hidden="true" />
        uptick local
      </p>
      <p className="claimui__merchant">{GROWTH_EXAMPLE.merchant}</p>
      <p className="claimui__offer">{GROWTH_EXAMPLE.offerShort}</p>
      <p className="claimui__terms">This month · Show your pass at the counter</p>

      <p className="claimui__label">Mobile number</p>
      <p className="claimui__field" aria-label="Mobile number field, example">
        (201) 555&#8209;0183
      </p>
      <p className="claimui__cta">{CONSENT.claim}</p>

      <div className="consent">
        <p className="consent__head">Optional</p>
        <div className="consent__row">
          <input id={`${id}-m`} type="checkbox" className="consent__box" checked={merchant} onChange={(e) => setMerchant(e.target.checked)} />
          <label htmlFor={`${id}-m`} className="consent__label">
            {CONSENT.merchant}
          </label>
        </div>
        <div className="consent__row">
          <input id={`${id}-n`} type="checkbox" className="consent__box" checked={network} onChange={(e) => setNetwork(e.target.checked)} />
          <label htmlFor={`${id}-n`} className="consent__label">
            {CONSENT.network}
          </label>
        </div>
        <p className="consent__fine">{CONSENT.fine}</p>
      </div>
    </div>
  );
}
