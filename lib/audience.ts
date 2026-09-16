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
    title: "A local perk, without handing over a list.",
    line: "Offer the people you already serve a genuinely useful local membership — without giving anyone a resident or customer list.",
    points: [
      "No customer list changes hands. Uptick never asks for one.",
      "People join Uptick themselves, on their own terms.",
      "Uptick carries membership, support and the messaging relationship.",
      "You can point to something real and local, and stop there.",
    ],
    cta: { label: "How partners work with Uptick", href: "/partners" },
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
      line: "Tell the people they already serve that Uptick exists.",
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
