/**
 * The public front door, in the company's own words.
 *
 * Three audiences meet Uptick here — a member, a merchant, a partner — plus
 * the one sentence about what Uptick itself does. Screens, dashboards and
 * operator tooling are supporting infrastructure; none of them is the
 * company, so none of them leads.
 *
 * Every claim below is either a fact from `lib/program.ts` or a description
 * of mechanics the operating application actually implements. Nothing here
 * promises customers, sales, reach, exclusivity or a network that does not
 * yet exist. The pilot is bounded and enrollment is not open; the copy says
 * so rather than implying scale.
 */

import { PROGRAM } from "@/lib/program";

/* -------------------------------------------------------------------------
   The front door
   ---------------------------------------------------------------------- */

export const HERO = {
  eyebrow: "A free local membership",
  title: { lead: "Good things", accent: "closer to home." },
  lead: "Uptick is a free membership that helps you discover something worth knowing about the local businesses already around you. One good thing at a time, from a store a short walk or drive away.",
  primary: { label: "For members", href: "/membership" },
  secondary: { label: "For merchants", href: "/growth" },
  promises: [
    ["Free to join", "No membership fee. No purchase to get the benefit."],
    ["No app", "It works on the web. A text is optional, never required."],
    ["Local stores", "Real businesses near you, fulfilling a real perk."],
    [
      "A bounded pilot",
      `Adults ${PROGRAM.minimumMemberAge}+. Targeting ${PROGRAM.pilotTargetMembers} members, capped at ${PROGRAM.pilotMemberCap}.`,
    ],
  ],
} as const;

/* -------------------------------------------------------------------------
   The three audiences
   ---------------------------------------------------------------------- */

export const AUDIENCES = [
  {
    id: "members",
    eyebrow: "For members",
    title: "Something useful nearby. Free.",
    line: "Each published week, one featured benefit at a participating local business — backed by supply that was checked before it was offered.",
    points: [
      "Free to join, and free to use. No purchase is required for the benefit.",
      "Nothing to download. Your membership opens on the web.",
      "Texts are optional and off unless you ask for them.",
      "Stop the texts any time without losing your membership.",
    ],
    cta: { label: "How membership works", href: "/membership" },
  },
  {
    id: "merchants",
    eyebrow: "For merchants",
    title: "A managed four-week run.",
    line: "Run a four-week program to help nearby people discover your store. You provide a useful perk; Uptick manages the member experience and reports what actually happened.",
    points: [
      "You decide the perk, the dates and the capacity. Nothing runs unapproved.",
      "Uptick handles membership, distribution, support and measurement.",
      "Supply and staff readiness are checked before a benefit is released.",
      "You see issued benefits, claims, redemptions and problems — not invented reach.",
    ],
    cta: { label: "See the four-week program", href: "/growth" },
  },
  {
    id: "partners",
    eyebrow: "For partners",
    title: "Two ways in, and neither costs you a list.",
    line: "Already operate screens? Uptick buys placements on inventory it does not own — a customer, not a competing network. Serve a local population? Point people at the membership without handing anyone a list.",
    points: [
      "Screen operators keep their hardware, venues and advertisers.",
      "Uptick buys the placement; it does not want the inventory.",
      "No customer or resident list changes hands, ever.",
      "Uptick carries membership, support and the messaging relationship.",
    ],
    cta: { label: "Both kinds of partnership", href: "/partners" },
  },
] as const;

/* -------------------------------------------------------------------------
   The member story
   ---------------------------------------------------------------------- */

export const MEMBER_STEPS = [
  {
    n: "1",
    title: "Join",
    body: "A phone number and a ZIP. It takes a moment, it is free, and no purchase is involved.",
  },
  {
    n: "2",
    title: "Get your Uptick",
    body: "When a week is published, your featured benefit is waiting on the web. A text about it is optional.",
  },
  {
    n: "3",
    title: "Claim & visit",
    body: "Open the pass and go to the named local business during the stated window.",
  },
  {
    n: "4",
    title: "Enjoy",
    body: "The store fulfills it. You found something nearby that you might not have tried.",
  },
] as const;

export const MEMBER_QUOTE = {
  line: "It is an easy way to support local and get something good each week.",
  by: "How Uptick is meant to feel. Not a member testimonial.",
} as const;

/* -------------------------------------------------------------------------
   The merchant story
   ---------------------------------------------------------------------- */

export const MERCHANT_PITCH = {
  eyebrow: "For merchants",
  title: "Bring more nearby people through your doors.",
  lead: "Uptick helps a local store run a focused four-week program that puts a genuinely useful perk in front of nearby members. You provide the perk. Uptick handles the member experience, the distribution and the reporting.",
  pillars: [
    [
      "Simple",
      "You approve the perk, the window and the capacity. One negotiated program, not a platform to learn.",
    ],
    [
      "Local",
      "It reaches members near you, in the market cell your store actually sits in.",
    ],
    [
      "Managed",
      "Uptick carries membership, access, messaging and support. Your staff hand over the perk.",
    ],
    [
      "Measured",
      "Issued benefits, claims, redemptions, fulfillment problems and credits — reported as observed.",
    ],
  ],
  honesty:
    "Uptick does not promise customers, sales or a return. A four-week program is a test, and the report says what happened, including when the answer is “not much”.",
  cta: { label: "Talk to Uptick", href: "/growth" },
} as const;

/* -------------------------------------------------------------------------
   The network
   ---------------------------------------------------------------------- */

export const NETWORK = {
  eyebrow: "The local loop",
  title: { lead: "A stronger local network,", accent: "one week at a time." },
  lead: "Uptick connects members, merchants and partners so a small amount of local attention ends up somewhere useful. Everyone keeps what is theirs — the store keeps its customers, the partner keeps its list, the member keeps their phone number.",
  nodes: [
    {
      id: "partners",
      name: "Partners",
      line: "Spread the word, or sell Uptick the screen space to do it.",
    },
    {
      id: "members",
      name: "Members",
      line: "Join free, and find something worth knowing nearby.",
    },
    {
      id: "stores",
      name: "Local stores",
      line: "Provide a useful perk and fulfill it at the counter.",
    },
    {
      id: "community",
      name: "The neighborhood",
      line: "Money and attention stay closer to where people live.",
    },
  ],
  caption:
    "Uptick sits in the middle because Uptick coordinates the week: membership, benefits, distribution, fulfillment, support and measurement.",
  chain: {
    title: "What actually happens in a week",
    steps: [
      ["A partner mentions Uptick", "No list is shared. People join themselves."],
      ["A member joins, free", "Adults 18+. Web access; texts optional."],
      ["Uptick publishes the week", "Only after supply and readiness are checked."],
      ["The member visits the store", "The named business fulfills the perk."],
      ["Uptick reports what happened", "Observed activity, including problems."],
    ],
  },
} as const;

/* -------------------------------------------------------------------------
   Trust
   ---------------------------------------------------------------------- */

export const TRUST = {
  eyebrow: "Trust & privacy",
  title: { lead: "Your info.", accent: "Our responsibility." },
  lead: "We keep this simple, private and reviewable. Uptick sends the messages a member asked for, and a participating store never receives a member's phone number or messaging consent.",
  pillars: [
    [
      "You are in control",
      "Promotional texts are optional, unchecked to start, and separate from membership itself.",
    ],
    [
      "We do not share your number",
      "Mobile numbers and messaging consent are never shared with third parties or affiliates for their marketing.",
    ],
    [
      "Stop any time",
      "Reply STOP to end texts. Your membership and any benefit already issued to you stay yours.",
    ],
  ],
  docs: [
    {
      id: "privacy",
      name: "Privacy Policy",
      line: "What is collected, how it is used, and what is never shared.",
      href: PROGRAM.urls.privacy,
    },
    {
      id: "terms",
      name: "Terms",
      line: "The member and merchant terms, in plain language.",
      href: PROGRAM.urls.terms,
    },
    {
      id: "sms",
      name: "SMS Policy",
      line: "Every message Uptick can send, and how to stop them.",
      href: PROGRAM.urls.sms,
    },
  ],
  evidence: {
    name: "The opt-in walkthrough",
    line: "A public, redacted walkthrough of the membership signup and SMS consent flow, published for transparency and messaging review.",
    href: "/opt-in",
  },
  signoff: { lead: "Real places. Real people.", accent: "A brighter tomorrow." },
} as const;

/* -------------------------------------------------------------------------
   Navigation
   ---------------------------------------------------------------------- */

/**
 * The front door is organised by who you are, not by what Uptick sells.
 * The older product pages (the block, hosting, advertising, Suite) are
 * still reachable from The Network and the footer; they are how the
 * network runs, not the first thing a stranger needs.
 */
export const AUDIENCE_NAV = [
  {
    href: "/membership",
    label: "For members",
    line: "Free to join. Something good nearby.",
  },
  {
    href: "/growth",
    label: "For merchants",
    line: "A managed four-week run.",
  },
  {
    href: "/partners",
    label: "For partners",
    line: "Screen operators, and local introductions.",
  },
  {
    href: "/network",
    label: "The Network",
    line: "The block, the screens, the rules.",
  },
  {
    href: "/trust",
    label: "Trust",
    line: "Privacy, terms and every message we send.",
  },
] as const;

/**
 * The header action. Enrollment is not open, so it does not say "Join" —
 * it says what will actually happen when it is pressed. When the pilot
 * opens and a join URL is configured, this becomes the real join action.
 */
export const HEADER_ACTION = PROGRAM.membershipJoinUrl
  ? { label: "Join Uptick", href: PROGRAM.membershipJoinUrl }
  : {
      label: "Ask about access",
      href: `mailto:${PROGRAM.supportEmail}?subject=${encodeURIComponent(
        "Uptick Local membership pilot",
      )}`,
    };

/**
 * An illustrated example of a weekly pass, for the front door.
 *
 * Deliberately generic: no real business has agreed to this perk and no
 * week has been published, so the card says "Example" on its face and the
 * caption repeats it. It exists to make "one featured benefit" concrete,
 * not to advertise anything.
 */
export const EXAMPLE_PASS = {
  week: "Your Uptick this week",
  perk: "A free coffee, any size.",
  where: "At a participating local shop nearby",
  window: "During the stated hours",
  cost: "No purchase needed",
  note: "An illustration of what a weekly Uptick looks like. Not a live offer, and not a real business.",
} as const;

/* -------------------------------------------------------------------------
   Partners — two different relationships that share one word
   ---------------------------------------------------------------------- */

/**
 * Distribution partners: firms that already own screens.
 *
 * The relationship is the plain one — Uptick buys placements on inventory it
 * does not own. That has to be said first and said clearly, because a screen
 * operator reading "local screen network" reasonably assumes a competitor.
 * Uptick is a buyer here, not a rival network, and does not want their
 * hardware, their venues or their advertisers.
 *
 * Nothing below claims volume, spend or an existing book of placements. The
 * pilot is bounded; this describes how Uptick buys, not how much.
 */
export const DISTRIBUTION_PARTNERS = {
  eyebrow: "Distribution partners",
  title: { lead: "You own the screens.", accent: "We buy the placement." },
  lead: "If you already operate screens — in a gym, a medical office, a café, a lobby — Uptick is a customer, not a competitor. We buy placements on screens we do not own, near the local businesses running a benefit that week.",
  notCompetition: {
    title: "To be direct: we are not competing with you.",
    body: "Uptick does not want your hardware, your venues, your contracts or your advertisers. We are not trying to put our own screens where yours already are. When a week's benefit sits near your locations, we would rather buy space on your screens than build a parallel network beside them.",
  },
  why: {
    title: "Why proximity is the whole point",
    body: "A member benefit is redeemed at one address. The people most likely to use it are the ones already within a few minutes of it — which is exactly who is standing in front of your screens. A perk at a gas station is worth showing on the screens in the gym and the medical office nearby. That is a placement worth paying for, and it is yours to sell.",
  },
  keep: [
    [
      "Your hardware stays yours",
      "Your screens, your CMS, your installs, your maintenance. Nothing is rebranded and nothing is replaced.",
    ],
    [
      "Your venues stay yours",
      "We do not approach your locations to host Uptick screens instead. The relationship is with you.",
    ],
    [
      "Your advertisers stay yours",
      "We are one more buyer in your existing book, not a broker positioned between you and your clients.",
    ],
    [
      "Your rules stay yours",
      "You approve every creative and keep whatever category exclusions you already promise your venues.",
    ],
  ],
  fits: {
    title: "The kinds of screens this usually fits",
    items: [
      "Fitness and gym networks",
      "Medical, dental and clinic waiting rooms",
      "Convenience, fuel and c-store counters",
      "Cafés, salons and neighborhood retail",
      "Lobbies, coworking and residential buildings",
    ],
    note: "Local and regional operators especially. A placement only has to make sense on one block to be worth buying.",
  },
  honesty:
    "Uptick is running a bounded pilot, so this describes how we buy placements — not a volume commitment, a rate card or an existing book of business.",
  cta: {
    label: "Tell us about your screens",
    subject: "Distribution partner — screen inventory",
    include: [
      "How many screens, and roughly where",
      "The kinds of venues they sit in",
      "What runs on them today, and any category exclusions you hold",
      "The best number or email to reach you",
    ],
  },
} as const;

/**
 * Acquisition partners: organizations that simply tell the people they
 * already serve that Uptick exists. A different relationship entirely from
 * the screen operators above, which is why the two are separated rather
 * than filed under one word.
 */
export const ACQUISITION_PARTNERS = {
  eyebrow: "Acquisition partners",
  title: { lead: "Offer something local,", accent: "without sharing a list." },
  lead: "If you serve a local population — an employer, a building, an association, a municipality — you can point people at a genuinely useful local membership without handing anyone a resident or customer list.",
  points: [
    [
      "No list changes hands",
      "Uptick never asks for one, and cannot use one. People join themselves, on their own terms.",
    ],
    [
      "No messaging obligation for you",
      "Uptick carries membership, support and the messaging relationship, including consent and opt-outs.",
    ],
    [
      "Nothing to administer",
      "There is no portal to run, no codes to distribute and no reconciliation on your side.",
    ],
    [
      "You can stop at the mention",
      "Point to something real and local, and leave it there. That is a complete version of this.",
    ],
  ],
  cta: {
    label: "Talk about an introduction",
    subject: "Acquisition partner — introducing Uptick",
    include: [
      "Who you serve, and roughly how many people",
      "The area you cover",
      "How you normally tell them about something like this",
      "The best number or email to reach you",
    ],
  },
} as const;
