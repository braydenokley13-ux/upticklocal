"use client";

import { useId, useState } from "react";
import { CONSENT, GROWTH_EXAMPLE } from "@/lib/content";

/**
 * The member's benefit page, shown as a product example.
 * The access field and action are pictures of controls; this public site has
 * no membership backend. The SMS consent box is a real control, so a reader
 * can see that it is not pre-ticked and web access works without it.
 */
export default function ClaimUI({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [sms, setSms] = useState(false);

  return (
    <div className={`claimui${compact ? " claimui--compact" : ""}`}>
      <p className="claimui__brand">
        <span className="claimui__dot" aria-hidden="true" />
        uptick local
      </p>
      <p className="claimui__merchant">{GROWTH_EXAMPLE.merchant}</p>
      <p className="claimui__offer">{GROWTH_EXAMPLE.offerShort}</p>
      <p className="claimui__terms">
        Featured benefit · Show your pass at the counter
      </p>

      <p className="claimui__label">Member access</p>
      <p className="claimui__field" aria-label="Member access, example">
        Private web link
      </p>
      <p className="claimui__cta">{CONSENT.claim}</p>

      <div className="consent">
        <p className="consent__head">Optional</p>
        <div className="consent__row">
          <input
            id={`${id}-sms`}
            type="checkbox"
            className="consent__box"
            checked={sms}
            onChange={(e) => setSms(e.target.checked)}
          />
          <label htmlFor={`${id}-sms`} className="consent__label">
            {CONSENT.sms}
          </label>
        </div>
        <p className="consent__fine">{CONSENT.fine}</p>
      </div>
    </div>
  );
}
