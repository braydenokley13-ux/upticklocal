"use client";

import { useId, useState } from "react";

/**
 * The distinction the product rests on: the number is required to deliver
 * the claim; promotional texts from that one business are a separate box,
 * unchecked by default. It is a real control so you can see nothing forces it.
 */
export default function ConsentToggle() {
  const id = useId();
  const [on, setOn] = useState(false);

  return (
    <div className="consent">
      <div className="consent__row">
        <input id={id} type="checkbox" className="consent__box" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <label htmlFor={id} className="consent__label">
          <span className="consent__tag">Optional</span>
          Also send me future offers from Your Business by text.
        </label>
      </div>
      <p className="consent__fine">Msg &amp; data rates may apply. Reply STOP any time. Unchecked does not affect your claim.</p>
    </div>
  );
}
