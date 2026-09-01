"use client";

import { useState } from "react";
import Phone from "@/components/home/Phone";
import { OFFER_SHORT } from "@/lib/content";

type State = "ready" | "confirming" | "redeemed";

function stamp(date: Date) {
  return date
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toUpperCase()
    .replace(/\s/g, " ");
}

/**
 * The customer's claim, as a working demonstration.
 *
 * Two taps and it is done — open, redeem, show the confirmed screen. There is
 * no code to key in, no cashier app, no POS hook, which is the whole point of
 * the section this sits in. The redeemed state is terminal, exactly as it is
 * in the product.
 */
export default function OfferPass() {
  const [state, setState] = useState<State>("ready");
  const [time, setTime] = useState<string | null>(null);

  const redeem = () => {
    setTime(stamp(new Date()));
    setState("redeemed");
  };

  return (
    <div className="pass">
      <Phone
        size="lg"
        tone="green"
        caption={
          state === "redeemed" ? (
            <>
              The claim stays in this state.{" "}
              <button type="button" className="linkbtn" onClick={() => setState("ready")}>
                Show it again
              </button>
            </>
          ) : (
            "Try it — this is the customer's screen"
          )
        }
      >
        <div className="pass__card" data-state={state}>
          <header className="pass__head">
            <span className="pass__brand">Your Business</span>
            <span className="pass__code">Claim 4KQ2</span>
          </header>

          <p className="pass__value">{OFFER_SHORT}</p>
          <p className="pass__where">118 Main St &middot; 0.4 mi from here</p>

          {/* The pass's own face. A wallet pass earns its middle — without
              something here the card is a headline and a button with a hole
              between them. */}
          <div className="pass__art" aria-hidden="true">
            <span className="pass__mark">YB</span>
            <span className="pass__arttext">
              Your Business
              <em>Claim 4KQ2</em>
            </span>
          </div>

          <p className="pass__terms">One per customer. Valid at this location.</p>

          <div className="pass__rule" aria-hidden="true" />

          <div className="pass__status" role="status" aria-live="polite">
            {state === "redeemed" ? (
              <>
                <span className="pass__dot pass__dot--done" aria-hidden="true" />
                REDEEMED &middot; {time}
              </>
            ) : (
              <>
                <span className="pass__dot" aria-hidden="true" />
                READY TO REDEEM
              </>
            )}
          </div>

          <div className="pass__foot">
            {state === "ready" && (
              <button type="button" className="pass__btn" onClick={() => setState("confirming")}>
                REDEEM OFFER
              </button>
            )}

            {state === "confirming" && (
              <div className="pass__confirm">
                <p>Redeem now, with staff watching?</p>
                <div className="pass__confirmrow">
                  <button type="button" className="pass__btn" onClick={redeem}>
                    YES, REDEEM
                  </button>
                  <button
                    type="button"
                    className="pass__btn pass__btn--quiet"
                    onClick={() => setState("ready")}
                  >
                    NOT YET
                  </button>
                </div>
              </div>
            )}

            {state === "redeemed" && (
              <p className="pass__done">
                Show this screen to the staff.
                <span>Uptick recorded the redemption.</span>
              </p>
            )}
          </div>

          <p className="pass__by">
            <span className="pass__bydot" aria-hidden="true" />
            via Uptick Local
          </p>
        </div>
      </Phone>
    </div>
  );
}
