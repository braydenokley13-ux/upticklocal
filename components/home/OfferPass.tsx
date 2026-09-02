"use client";

import { useState, type ReactNode } from "react";
import Device from "@/components/home/Device";
import { CLAIM, OFFER_SHORT } from "@/lib/content";

type State = "ready" | "confirming" | "redeemed";

function stamp(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toUpperCase();
}

/**
 * The customer's claim, as a working demonstration. Open, redeem, show the
 * confirmed screen: no code to key in, no cashier app, no POS hook. The
 * redeemed state is terminal, as it is in the product.
 *
 * `frame="device"` sets it in a phone silhouette for wide screens; `"none"`
 * shows it at full width on a phone, where the reader already holds one.
 */
export default function OfferPass({ frame = "device" }: { frame?: "device" | "none" }) {
  const [state, setState] = useState<State>("ready");
  const [time, setTime] = useState<string | null>(null);

  const redeem = () => {
    setTime(stamp(new Date()));
    setState("redeemed");
  };

  const caption: ReactNode =
    state === "redeemed" ? (
      <>
        The claim stays like this.{" "}
        <button type="button" className="linkbtn" onClick={() => setState("ready")}>
          Show it again
        </button>
      </>
    ) : (
      "Try it. This is the customer's screen."
    );

  const pass = (
    <div className="pass" data-state={state}>
      <div className="pass__top">
        <span className="pass__merchant">{CLAIM.merchant}</span>
        <span className="pass__id">Claim {CLAIM.code}</span>
      </div>

      <div className="pass__body">
        <p className="pass__offer">{OFFER_SHORT}</p>
        <p className="pass__meta">{CLAIM.address}</p>
        <p className="pass__terms">One per customer · Valid at this location</p>
      </div>

      <div className="pass__state" role="status" aria-live="polite">
        <span className="pass__dot" aria-hidden="true" />
        {state === "redeemed" ? `Redeemed · ${time}` : "Active · Ready to redeem"}
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
  );

  if (frame === "none") {
    return (
      <figure className="passfig">
        {pass}
        <figcaption className="passfig__caption">{caption}</figcaption>
      </figure>
    );
  }

  return (
    <Device tone="pass" className="device--pass" caption={caption}>
      {pass}
    </Device>
  );
}
