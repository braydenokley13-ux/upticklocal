/**
 * Copy that has to be identical in the DOM and inside the WebGL model — the
 * offer on the hero screen, the offer on the counter screens, the offer on the
 * customer's pass. One source so they can never drift.
 */
export const OFFER_TEXT = "GET $10 OFF YOUR FIRST VISIT";

/** Short form, for the phone chapters. */
export const OFFER_SHORT = "$10 off your first visit";

export const CONTACT_EMAIL = "iwhite@upticklocal.com";

export const CTA = {
  growth: { label: "START A 30-DAY GROWTH PILOT", href: "/growth" },
  host: { label: "HOST A FREE SCREEN", href: "/host" },
  promote: { label: "PROMOTE YOUR BUSINESS", href: "/growth" },
} as const;
