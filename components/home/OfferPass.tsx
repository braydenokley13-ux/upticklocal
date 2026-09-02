"use client";

import { useState } from "react";
import { GROWTH_EXAMPLE } from "@/lib/content";

type State = "ready" | "confirming" | "redeemed";

function stamp(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toUpperCase();
}

/**
 * The customer's pass, as a working demonstration. Open it, show staff, tap
 * redeem, confirm: no code to key in, no cashier app, no POS hook. The
 * redeemed state is terminal, as it is in the product; a small link resets
 * the demonstration.
 */
export default function OfferPass({ caption = true }: { caption?: boolean }) {
  const [state, setState] = useState<State>("ready");
  const [time, setTime] = useState<string | null>(null);

  const redeem = () => {
    setTime(stamp(new Date()));
    setState("redeemed");
  };

  return (
    <figure className="passfig">
      <div className="pass" data-state={state}>
        <div className="pass__top">
          <span className="pass__merchant">{GROWTH_EXAMPLE.merchant}</span>
          <span className="pass__id">Claim {GROWTH_EXAMPLE.claim.code}</span>
        </div>

        <div className="pass__body">
          <p className="pass__offer">{GROWTH_EXAMPLE.offerShort}</p>
          <p className="pass__meta">{GROWTH_EXAMPLE.address}</p>
          <p className="pass__terms">This month · One per customer · Show staff</p>
        </div>

        <div className="pass__state" role="status" aria-live="polite">
          <span className="pass__dot" aria-hidden="true" />
          {state === "redeemed" ? `Redeemed · ${time}` : "Active · Show this to staff"}
        </div>

        <div className="pass__actions">
          {state === "ready" && (
            <button type="button" className="pass__btn" onClick={() => setState("confirming")}>
              Redeem offer
            </button>
          )}
          {state === "confirming" && (
            <>
              <p className="pass__ask">Redeem now, with staff watching?</p>
              <button type="button" className="pass__btn" onClick={redeem}>
                Yes, redeem
              </button>
              <button type="button" className="pass__btn pass__btn--quiet" onClick={() => setState("ready")}>
                Not yet
              </button>
            </>
          )}
          {state === "redeemed" && <p className="pass__done">Uptick recorded the redemption and the time. That is the receipt.</p>}
        </div>

        <p className="pass__by">
          <span className="pass__bydot" aria-hidden="true" />
          via Uptick Local
        </p>
      </div>
      {caption ? (
        <figcaption className="passfig__caption">
          {state === "redeemed" ? (
            <>
              The pass stays like this.{" "}
              <button type="button" className="linkbtn" onClick={() => setState("ready")}>
                Show it again
              </button>
            </>
          ) : (
            "Try it. This is the customer's screen at your counter."
          )}
        </figcaption>
      ) : null}
    </figure>
  );
}
