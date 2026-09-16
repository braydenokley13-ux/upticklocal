/**
 * One source for every piece of copy that appears in more than one place —
 * on the 3D screen and the DOM surface that takes over from it, on the pass
 * and in the text thread, in the nav and in the footer. Nothing drifts.
 */

import { PROGRAM } from "@/lib/program";

/**
 * The opening of the network story.
 *
 * This was the company promise while the home page argued screens. The
 * company now leads with the membership, so this line describes what it
 * actually opens: the block, and the infrastructure Uptick runs on it. It
 * claims a mechanism, not a result.
 */
export const PROMISE = {
  lead: "Attention that stops at one door,",
  accent: "moving down the street.",
};
export const PROMISE_TEXT = `${PROMISE.lead} ${PROMISE.accent}`;

/** Under it: what the network physically is, in one breath. */
export const PROMISE_LINE =
  "Countertop screens at local businesses that do not compete, linked into one block. This is the infrastructure behind Uptick, not the membership itself.";

export const CONTACT_EMAIL = PROGRAM.supportEmail;

/* -------------------------------------------------------------------------
   What runs on the screen
   ---------------------------------------------------------------------- */

/** What a host's own screen shows: the store's own special, first. */
export const SPECIAL = {
  line1: "COFFEE + BAGEL, $4",
  line2: "WEEKDAY MORNINGS",
  tag: "Your special",
  where: "Convenience · 118 Main St",
};

/** An Advertise example: a nearby business, on the screens around it. */
export const CAMPAIGN = {
  line1: "GRAND OPENING",
  line2: "SATURDAY · 3 DOORS DOWN",
  who: "Main St Fitness",
  where: "Showing on the Uptick screens nearby",
};

/**
 * The Growth example. Joe's is a worked example of a four-week managed
 * program. A screen is one optional placement, not a prerequisite.
 */
export const GROWTH_EXAMPLE = {
  note: "A worked example. Joe's Market is not a client; the mechanics are exactly what runs.",
  merchant: "Joe's Market",
  address: "118 Main St",
  anchor: {
    tag: "Featured Uptick at Joe's",
    line1: "FREE LARGE COFFEE",
    line2: "NO PURCHASE NEEDED",
    scan: "Open the featured benefit",
  },
  drop: {
    kind: "Featured benefit",
    line: "Free large coffee before 11 AM. No purchase needed.",
    window: "Today only",
    sent: "6:48 AM",
  },
  /** Other shapes a Drop can take. Real mechanics, not manufactured urgency. */
  windows: [
    "Before 11 AM",
    "Friday to Sunday",
    "First 30 redemptions",
    "This week only",
    "While supplies last",
  ],
  offerShort: "Free large coffee · no purchase needed",
  claim: {
    code: "7QK2",
    link: "upticklocal.com/c/7QK2",
    dropLink: "upticklocal.com/d/7QK2",
  },
} as const;

/** Member benefit access is available on the web; SMS is one optional channel. */
export const CONSENT = {
  claim: "Open my benefit on the web",
  sms: "Text me Uptick Local membership notices",
  fine: "SMS is optional and unchecked to start. Leaving it off never affects membership or an issued benefit. Reply STOP any time.",
} as const;

/* -------------------------------------------------------------------------
   The opening act
   ---------------------------------------------------------------------- */

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
    body: "A screen on the counter of each participating business, linked into one local network. Attention that used to stop at the door moves along the street.",
  },
  screen: {
    tag: "03 · The screen",
    title: "Useful on its own. Stronger together.",
    specs: [
      ["21″", "countertop display, plug in and play"],
      ["Yours", "your own specials and events run first"],
      ["Free", "provided to host businesses, no paid plan"],
    ],
  },
} as const;

/** The same act on a phone: shorter lines, each over a picture in one narrow column. */
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
    body: "A screen on each participating counter, linked into one local network. Your business reaches the customers already next door.",
  },
  screen: {
    tag: "04 · The screen",
    title: "This is the Uptick screen.",
    body: "A free 21″ countertop display. Your own specials run on it first, and it is the door into everything else.",
  },
} as const;

/* -------------------------------------------------------------------------
   Navigation and actions
   ---------------------------------------------------------------------- */

export const CTA = {
  how: { label: "See how it works", href: "#block" },
  talk: {
    label: "Talk to us",
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Uptick Local")}`,
  },
  host: { label: "Host a free screen", href: "/host" },
  advertise: { label: "Advertise locally", href: "/advertise" },
  growth: { label: "Plan a four-week Growth program", href: "/growth" },
  suite: { label: "Ask about Uptick Suite", href: "/suite" },
} as const;

/** Primary navigation, in the order a new visitor should meet it. */
export const NAV = [
  {
    href: "/network",
    label: "The Network",
    line: "The block, the screens, the rules",
  },
  { href: "/host", label: "Host", line: "A free screen. Your own specials." },
  {
    href: "/advertise",
    label: "Advertise",
    line: "Your campaign on nearby screens. No screen needed.",
  },
  { href: "/growth", label: "Growth", line: "Program, Fulfillment, Results." },
  {
    href: "/suite",
    label: "Uptick Suite",
    line: "Content that makes them choose you.",
  },
] as const;

/* -------------------------------------------------------------------------
   The ways in
   ---------------------------------------------------------------------- */

/**
 * The three ways to use the physical network. Not tiers: Host is the network
 * itself, Advertise reaches it without a screen, and Growth is a managed
 * program that may include screens when they fit the approved plan.
 */
export const WAYS = [
  {
    id: "host",
    name: "Host",
    line: "Promote your own business. Join the network.",
    requirement: "Free screen included",
    short: "Free screen",
    diagram: "Your counter joins the network. Your specials run first.",
    points: [
      "A free 21″ countertop screen. One cable and your Wi-Fi.",
      "Your own specials and events run on it, first.",
      "Your business joins a block of non-competing counters.",
      "As paid campaigns run nearby, host businesses share in the revenue.",
    ],
    cta: CTA.host,
  },
  {
    id: "advertise",
    name: "Advertise",
    line: "Reach nearby customers across Uptick locations.",
    requirement: "No screen needed",
    short: "No screen needed",
    diagram: "Your campaign runs on the screens around you.",
    points: [
      "A service, an opening, an event, a product, a special.",
      "Uptick designs the creative with you.",
      "It runs on nearby screens, never in a competitor.",
      "You see where it ran, by location.",
    ],
    cta: CTA.advertise,
  },
  {
    id: "growth",
    name: "Growth",
    line: "Turn local attention into measurable customer activity.",
    requirement: "Screens optional",
    short: "Screens optional",
    diagram:
      "A four-week plan across approved placements, fulfillment and measured results.",
    points: [
      "One operator-managed four-week program with an approved scope and negotiated fee.",
      "Planned weekly placements; screens are optional.",
      "Approved supply and location readiness before member benefits are released.",
      "Program, Fulfillment and Results, reported plainly.",
    ],
    cta: CTA.growth,
  },
] as const;

export type WayId = (typeof WAYS)[number]["id"];

/* -------------------------------------------------------------------------
   Uptick Suite
   ---------------------------------------------------------------------- */

export const SUITE = {
  tag: "Uptick Suite",
  title: { lead: "Getting noticed is only", accent: "half", tail: "the job." },
  lead: "When a customer looks you up, what they find decides whether they choose you. Uptick Suite is the content behind local businesses that read as credible, sound like themselves, and stay top of mind.",
  /** One conversation with the owner, turned into every surface a customer checks. */
  source: {
    label: "One conversation with you",
    business: "Ridge Physical Therapy",
    topic:
      "What actually happens at a first physical therapy visit, and how to tell when it is time to book one.",
  },
  /** Every business named here is a worked example, and the site says so. */
  example: "A worked example. Ridge Physical Therapy is not a client.",
  /** A second worked example, from a different trade, for the Suite page. */
  second: {
    label: "One conversation with you",
    business: "Northside Roofing",
    topic:
      "Most people call us after the leak. Here is what we look for before it, and what an honest estimate includes.",
    surfaces: [
      {
        id: "site",
        channel: "Website copy",
        title: "An estimate you can read.",
        body: "A services page that explains what is in the number before anyone has to ask.",
      },
      {
        id: "blog",
        channel: "Blog & articles",
        title: "What a roof inspection actually covers",
        body: "Useful enough to be found, plain enough to be trusted.",
      },
      {
        id: "google",
        channel: "Google Business",
        title: "Storm week: the three things to check today.",
        body: "Profile posts that keep your listing current and chosen.",
      },
    ],
  },
  surfaces: [
    {
      id: "site",
      channel: "Website copy",
      title: "Your first visit, explained.",
      body: "A service page that answers the questions people have before they call.",
    },
    {
      id: "blog",
      channel: "Blog & articles",
      title: "Five signs it is time to see a physical therapist",
      body: "Search-aware, genuinely useful, written to be found.",
    },
    {
      id: "social",
      channel: "Social",
      title: "The thing we check first is rarely the part that hurts.",
      body: "A post that earns a save, not a scroll.",
    },
    {
      id: "google",
      channel: "Google Business",
      title: "New-patient visits this week: what to bring.",
      body: "Profile posts that keep your listing current and chosen.",
    },
    {
      id: "email",
      channel: "Email & newsletter",
      title: "Subject: The stretch we teach everyone first",
      body: "Campaigns that bring past patients back.",
    },
    {
      id: "ad",
      channel: "Ad creative & copy",
      title: "Move without the wince.",
      body: "Scroll-stopping creative and copy, for screens, social and search.",
    },
  ],
  services: [
    [
      "Website copy",
      "Clear, persuasive pages that give a visitor a reason to choose you.",
    ],
    [
      "Blogs & articles",
      "Helpful, search-aware writing that builds trust and supports your local visibility.",
    ],
    [
      "Local content",
      "Location pages, service pages and content that speaks to your community.",
    ],
    [
      "Social content",
      "Posts that build visibility and keep your audience coming back.",
    ],
    [
      "Google Business profile",
      "Updates and posts that keep the listing people check first current.",
    ],
    [
      "Email & newsletters",
      "Campaigns that inform, engage and bring people back.",
    ],
    [
      "Ad creative & copy",
      "Creative and copy for screens, social and search, built to be acted on.",
    ],
    [
      "Strategy & repurposing",
      "One plan, one voice, every channel; nothing written twice.",
    ],
  ],
  industries:
    "Dentists, physical therapists, chiropractors, dermatology and med spas, law firms, home-service companies, and other expert local businesses.",
  /**
   * Suite is delivered with JBCI, the editorial partner. Said plainly and
   * once: a customer buys the capability, not the corporate structure.
   */
  partner: {
    line: "Uptick Suite, in partnership with JBCI.",
    note: "JBCI is the editorial partner behind Suite: content strategy and professional writing. Uptick brings the local distribution, the screens and the customer activation.",
  },
  credibility: {
    line: "Written to a professional standard.",
    who: "Led by Jordana White, a Princeton graduate and professional writer who specializes in local businesses.",
  },
  website: "Need help with the website itself too? Ask us what is possible.",
  cta: CTA.suite,
} as const;

/* -------------------------------------------------------------------------
   Real-world proof
   ---------------------------------------------------------------------- */

/**
 * Documentary photographs. Every caption says what the picture literally
 * is; nothing here claims an Uptick-branded install unless it is one.
 */
export const PROOF = {
  tag: "In the wild",
  title: "The model shows the system. This is the counter.",
  body: "Eye level, next to the register, where people already stand and wait. That is the placement every Uptick screen is built for.",
  photos: [
    {
      src: "/photos/counter-convenience.webp",
      width: 558,
      height: 720,
      alt: "A convenience-store counter: a countertop display stands between the register and a heated case, with the store's shelves behind it.",
      caption:
        "Not an Uptick install. Another screen supplier's hardware and content, photographed as found on a convenience-store counter. The placement is the point.",
    },
  ],
} as const;

/* -------------------------------------------------------------------------
   The closing
   ---------------------------------------------------------------------- */

export const FINALE = {
  tag: "Your business · The businesses around it · One local network",
  title: "Put your business on the local map.",
  doors: [
    {
      id: "host",
      name: "Host a screen",
      line: "Turn your counter into a local destination.",
      href: CTA.host.href,
    },
    {
      id: "advertise",
      name: "Advertise",
      line: "Get in front of more locals, no screen needed.",
      href: CTA.advertise.href,
    },
    {
      id: "growth",
      name: "Growth",
      line: "Program, Fulfillment, Results.",
      href: CTA.growth.href,
    },
    {
      id: "suite",
      name: "Uptick Suite",
      line: "Content that gets you chosen online.",
      href: CTA.suite.href,
    },
  ],
} as const;

export const SIGN_OFF = { lead: "Increase your", accent: "local." };
