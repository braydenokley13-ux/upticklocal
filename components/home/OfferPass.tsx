"use client";

import { useState } from "react";
import Device from "@/components/home/Device";
import { OFFER_SHORT } from "@/lib/content";

type State = "ready" | "confirming" | "redeemed";

function stamp(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toUpperCase();
}

/**
 * The customer's claim, as a working demonstration. Open, redeem, show the
 * confirmed screen: no code to key in, no cashier app, no POS hook. The
 * redeemed state is terminal, as it is in the product.
 */
export default function OfferPass() {
  const [state, setState] = useState<State>("ready");
  const [time, setTime] = useState<string | null>(null);

  const redeem = () => {
    setTime(stamp(new Date()));
    setState("redeemed");
  };

  return (
    <Device
      tone="pass"
      className="device--pass"
      caption={
        state === "redeemed" ? (
          <>
            The claim stays like this.{" "}
            <button type="button" className="linkbtn" onClick={() => setState("ready")}>
              Show it again
            </button>
          </>
        ) : (
          "Try it. This is the customer's screen."
        )
      }
    >
      <div className="pass" data-state={state}>
        <header className="pass__top">
          <span className="pass__merchant">Your Business</span>
          <span className="pass__id">Claim 4KQ2</span>
        </header>

        <div className="pass__body">
          <p className="pass__offer">{OFFER_SHORT}</p>
          <p className="pass__meta">118 Main St</p>
          <p className="pass__terms">One per customer · Valid at this location</p>
        </div>

        <div className="pass__state" role="status" aria-live="polite">
          <span className="pass__dot" aria-hidden="true" />
          {state === "redeemed" ? `Redeemed · ${time}` : "Ready to redeem"}
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
          {state === "redeemed" && <p className="pass__done">Show this screen to staff. Uptick recorded the redemption.</p>}
        </div>

        <p className="pass__by">
          <span className="pass__bydot" aria-hidden="true" />
          via Uptick Local
        </p>
      </div>
    </Device>
  );
}
