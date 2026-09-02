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

/** The example claim, everywhere it is shown: the claim page, the text, the pass. */
export const CLAIM = { merchant: "Your Business", address: "118 Main St", code: "4KQ2", link: "upticklocal.com/c/4KQ2", followUp: "upticklocal.com/c/8RM1" };

/** The opening act, as the desktop tells it in one pinned scene. */
export const STORY = {
  block: {
    tag: "01 · The block",
    title: "Your block is already a network.",
    body: "The café, the gym, the salon, the restaurant, the corner store. Each already has customers. Separate pockets of local attention, a few doors apart.",
  },
  connect: {
    tag: "02 · The connection",
    title: "Uptick connects them.",
    body: "A screen at each participating business, linked into one local network — so a business can reach the customers already next door.",
  },
  screen: {
    tag: "03 · The screen",
    title: "Useful on its own. Stronger together.",
    specs: [
      ["21″", "countertop display, plug in and play"],
      ["Yours", "your own specials and events run first"],
      ["Free", "provided to host stores, no paid plan"],
    ],
  },
} as const;

/**
 * The same act on a phone: five frames, each its own picture. Shorter lines,
 * because each sits over a picture in one narrow column.
 */
export const PHONE_STORY = {
  pockets: {
    tag: "01 · Next door",
    title: "Every store around you already has customers.",
    body: "The café, the gym, the salon, the corner store. Each one a pocket of local attention, a few doors from yours.",
  },
  block: {
    tag: "02 · The block",
    title: STORY.block.title,
    body: "Separate businesses, separate customers. Physically a few doors apart.",
  },
  connect: {
    tag: "03 · The connection",
    title: STORY.connect.title,
    body: "A screen at each participating store, linked into one local network. Your business can reach the customers already next door.",
  },
  screen: {
    tag: "04 · The screen",
    title: "This is the Uptick screen.",
    body: "A free 21″ countertop display. Your own specials run on it first, and it is the door into everything else.",
  },
  handoff: {
    tag: "Uptick Growth",
    title: "Growth goes one step further.",
    body: "Host and Advertise are complete on their own. Growth is the premium layer: an offer that leaves the screen, lands on a customer's phone, and comes back as a visit you can count.",
  },
} as const;

/** Primary navigation, in the order a new visitor should meet it. */
export const NAV = [
  { href: "/", label: "Overview", line: "The block, the screen, three ways in" },
  { href: "/how-it-works", label: "How it works", line: "The network, in one picture" },
  { href: "/host", label: "Host", line: "A free screen. Your own specials." },
  { href: "/advertise", label: "Advertise", line: "Your campaign on nearby screens. No screen needed." },
  { href: "/growth", label: "Growth", line: "Offer → claim → visit → redeem → measure.", premium: true },
] as const;

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
    short: "Free screen",
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
    short: "No screen needed",
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
    short: "Needs a screen",
    points: [
      "Your offer on screens at up to five nearby non-competing local stores.",
      "Customers claim it by text, visit, and redeem on their phone.",
      "Follow-up offers for the customers who opt in, and a plain report.",
    ],
    cta: CTA.growth,
  },
] as const;

export type WayId = (typeof WAYS)[number]["id"];
