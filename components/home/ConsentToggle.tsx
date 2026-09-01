"use client";

import { useId, useState } from "react";

/**
 * The distinction the whole product story rests on: the phone number is
 * required to *deliver* the claim; promotional texts from that one business
 * are a separate box, unchecked by default. Making it a real control rather
 * than a drawn tick is the point — you can see that nothing forces it.
 */
export default function ConsentToggle() {
  const id = useId();
  const [on, setOn] = useState(false);

  return (
    <div className="consent">
      <p className="consent__tag">Optional</p>
      <div className="consent__row">
        <input
          id={id}
          type="checkbox"
          className="consent__box"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
        />
        <label htmlFor={id} className="consent__label">
          Also send me future offers from Your Business.
        </label>
      </div>
      <p className="consent__fine">
        Msg &amp; data rates may apply. Reply STOP at any time. Leaving this unchecked does not
        affect your claim.
      </p>
    </div>
  );
}
