/**
 * Copy that has to be identical in more than one place — on the 3D screen and
 * on the DOM surface that takes over from it, on the pass and in the text
 * thread. One source so nothing drifts.
 */

/** The company promise. Everything on the homepage descends from this line. */
export const PROMISE = "Grow your business by reaching the customers already around you.";

/** What a host's own screen shows: the store's own special, first. */
export const SPECIAL = { line1: "COFFEE + BAGEL, $4", line2: "WEEKDAY MORNINGS", tag: "Your special" };

/** The Growth example offer. */
export const OFFER_TEXT = "GET $10 OFF YOUR FIRST VISIT";
export const OFFER_SHORT = "$10 off your first visit";

/** An Advertise example: a nearby business, on the screens around it. */
export const CAMPAIGN = { line1: "GRAND OPENING", line2: "SATURDAY · 3 DOORS DOWN", who: "Main St Fitness" };

export const CONTACT_EMAIL = "iwhite@upticklocal.com";

export const CTA = {
  how: { label: "SEE HOW IT WORKS", href: "#block" },
  host: { label: "HOST A FREE SCREEN", href: "/host" },
  advertise: { label: "ADVERTISE LOCALLY", href: "/advertise" },
  growth: { label: "START A 30-DAY GROWTH PILOT", href: "/growth" },
} as const;

/**
 * The three ways to take part. Host is the network itself; Advertise reaches
 * it without a screen; Growth is the premium layer on top of a screen.
 */
export const WAYS = [
  {
    id: "host",
    name: "Host",
    line: "Promote your own business. Join the network.",
    requirement: "Free screen included",
    points: [
      "A free 21″ countertop screen, plug and play.",
      "Your own specials and events run on it, first.",
      "It joins a local network of non-competing stores.",
    ],
    cta: CTA.host,
  },
  {
    id: "advertise",
    name: "Advertise",
    line: "Reach nearby customers across Uptick locations.",
    requirement: "No screen needed",
    points: [
      "Promote a service, an opening, an event, a special — whatever the campaign is.",
      "It runs on screens at participating non-competing local stores near you.",
      "You see where it ran, by location.",
    ],
    cta: CTA.advertise,
  },
  {
    id: "growth",
    name: "Growth",
    line: "Turn local attention into measurable customer activity.",
    requirement: "Requires an Uptick screen",
    points: [
      "Your offer on screens at up to five nearby non-competing local stores.",
      "Customers claim it by text, visit, and redeem on their phone.",
      "Follow-up offers for the customers who opt in, and a plain report.",
    ],
    cta: CTA.growth,
  },
] as const;

export type WayId = (typeof WAYS)[number]["id"];
