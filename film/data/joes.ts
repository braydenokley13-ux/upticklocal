/**
 * Joe's Fuel & Go — the one fixture every hero shot reads from.
 *
 * Every number in the film comes from here, and the numbers here are built
 * to agree with each other. If two shots ever disagree, the bug is in this
 * file, nowhere else. Joe's is a demonstration business; all data is
 * illustrative.
 */

export const BUSINESS = {
  name: "Joe's Fuel & Go",
  short: "Joe's",
  address: "118 Main St",
  block: "Main St",
  kind: "fuel + convenience",
} as const;

/** The gap. The film opens on this number. */
export const GAP = {
  visits: 3,
  when: "Last Friday",
  window: "07:00–10:00",
  windowShort: "7–10",
  sentence: "customers between 7 and 10 last Friday.",
} as const;

/** The owner's own words, said Thursday evening. */
export const INTENT = {
  sentence: "Friday mornings are slow",
  words: ["Friday", "mornings", "are", "slow"] as const,
  said: "Thursday · 6:41 PM",
  prompt: "What do you want to improve?",
} as const;

/**
 * Relationships are one set. Signals are attributes on that set and may
 * overlap; they are never added together.
 */
export const RELATIONSHIPS = {
  permissioned: 104,
  signals: {
    morningResponders: 63,
    lapsed: 41,
  },
  lines: {
    permissioned: "people who said yes to hearing from Joe's.",
    morningResponders: "tend to respond in the morning.",
    lapsed: "haven't visited recently.",
  },
} as const;

/** What the reward costs Joe, and the rule he never breaks. */
export const ECONOMICS = {
  coffeeCost: 0.62,
  coffeeCostLabel: "$0.62",
  coffeeLine: "what a large coffee costs Joe.",
  limit: 30,
  limitLine: "rewards, then it stops.",
  maxExposure: 18.6,
  maxExposureLabel: "$18.60",
  fuelRule: "Fuel is never discounted.",
  fuelRuleTag: "Joe's rule.",
} as const;

/** Channels Joe actually has. Screens are an advantage, never a requirement. */
export const REACH = {
  /* `line` is the film's voice: one self-contained sentence a viewer reads in a second,
     spoken over the thing it describes. `label`/`detail`/`how` stay for the product surfaces. */
  direct: { label: "Your customers", detail: "104 said yes", how: "text · tonight", line: "A text tonight, to the 104 who said yes." },
  location: { label: "Your location", detail: "pump & counter", how: "the code at the pump and the counter", line: "The code at his pump and his counter." },
  screens: { label: "Nearby Uptick reach", detail: "2 screens on this block", count: 2, how: "Friday 7–10", available: true, line: "Two Uptick screens on this block." },
  noScreens: { label: "Nearby Uptick reach", detail: "Not in this area yet", note: "The plan runs without it." },
} as const;

/** The one owner-facing object. Film-level hierarchy: readable in seconds. */
export const PLAN = {
  title: "Morning Coffee Drop",
  window: "Friday · 7–10 AM",
  windowShort: "Friday · 7–10 AM · tomorrow",
  offer: "$25+ fill-up · coffee on us",
  offerLong: "$25+ fill-up → free large coffee.",
  reward: "Free large coffee",
  qualifier: "$25+ fill-up",
  audience: "Existing customers + nearby reach",
  limitLine: "First 30",
  exposureLine: "max reward exposure $18.60",
  fuel: { label: "Fuel", values: ["Regular", "Premium", "Diesel"] as const, line: "Regular · Premium · Diesel" },
  goal: "Bring in more Friday morning visits.",
  why: "High perceived value. Low merchant cost. Fuel price untouched.",
  approve: "Approve",
  approvedAt: "Thursday · 6:47 PM",
  activeAt: "Thursday · 6:48 PM",
} as const;

/** The same offer, as each channel carries it. Shared words: "Coffee's on us". */
export const MESSAGE = {
  shared: "Coffee's on us",
  text: {
    from: BUSINESS.name,
    body: "Coffee's on us tomorrow morning.",
    detail: "$25+ fill-up · 7–10 AM · First 30",
    link: "Open offer",
    when: "Thu 6:48 PM",
    fine: "Reply STOP to opt out",
    who: "Existing relationship · 1 of 104",
  },
  screen: {
    from: BUSINESS.name,
    where: "2 doors down",
    body: "Coffee's on us Friday morning.",
    detail: "$25+ fill-up · 7–10 AM · First 30",
    cta: "Scan to claim",
    when: "Friday · 7:04 AM",
  },
} as const;

/** The Offer object both paths collapse into. */
export const OFFER = {
  merchant: BUSINESS.name,
  address: BUSINESS.address,
  headline: "Coffee's on us.",
  line: "A free large coffee with any $25+ fill-up.",
  rows: [
    ["When", "Friday · 7–10 AM"],
    ["How many", "First 30"],
    ["Fuel", "Regular, premium, diesel"],
  ] as const,
  permission: "Hear from Joe's again?",
  yes: "Yes",
  save: "Save my pass",
  fine: "No app · No account",
} as const;

/** The conversation. Grounded questions are answered from approved details. */
export const CONVERSE = {
  question: "Does diesel count?",
  askedAt: "Fri 7:09 AM",
  silenceMs: 900,
  answer: "Yes — regular, premium, and diesel fill-ups qualify.",
  answerParts: { lead: "Yes — ", values: ["regular", "premium", "and diesel"], tail: " fill-ups qualify." },
  provenance: "From Joe's approved offer details",
  principle: "Automatic when grounded. Human when uncertain.",
  escalation: "Not in the approved details → goes to Joe.",
  /** The week so far: what the plan answered on its own, and what went to Joe. */
  week: { handled: 38, toJoe: 2, line: "This week · 38 handled by the plan · 2 needed Joe" },
} as const;

/**
 * The pass and its redemption. The customer opens it at Joe's, staff glance
 * at it, the customer taps Redeem now, confirms once, and the pass becomes a
 * live redeemed state: the merchant, the current time, one detail that could
 * only exist now. No PIN, no scanner, no second phone, no POS.
 */
export const PASS = {
  id: "JF·0417",
  /** The pass is the offer, saved — so it says what the offer said. */
  title: OFFER.headline,
  instruction: "Show this at the counter, then tap Redeem now.",
  merchant: BUSINESS.name,
  window: "Friday · 7–10 AM · one per customer",
  redeemNow: "Redeem now",
  /** The live state's clock starts here and runs in real seconds. */
  redeemedAt: "Fri · 7:42 AM",
  redeemedClock: { h: 7, m: 42, s: 8 },
  redeemedLine: "Redeemed.",
  redeemedDetail: "One large coffee · Pump 3 · regular",
  ordinal: "1 of 30",
} as const;

/**
 * The result. 21 through the door: 14 returned (direct relationships), 7 new
 * (nearby screens). 14 + 7 = 21, always.
 */
export const RESULT = {
  total: 21,
  returned: 14,
  newCustomers: 7,
  when: "This Friday",
  window: "07:00–10:00",
  line: "came through the door.",
  returnedLine: "returned.",
  newLine: "were new.",
  /** The count steps the film shows on the way to 21. */
  steps: [1, 4, 9, 14, 21] as const,
} as const;

if (RESULT.returned + RESULT.newCustomers !== RESULT.total) {
  throw new Error("Joe's fixture is incoherent: returned + new must equal total.");
}
if (Math.round(ECONOMICS.coffeeCost * ECONOMICS.limit * 100) / 100 !== ECONOMICS.maxExposure) {
  throw new Error("Joe's fixture is incoherent: coffee cost × limit must equal max exposure.");
}

/** The whole street. Joe's sits mid-block; the two screens are the café and the pharmacy. */
export const BLOCK = {
  street: "Main St",
  lots: [
    { id: "gym", name: "Gym", number: 110, screen: false },
    { id: "pharmacy", name: "Pharmacy", number: 114, screen: true },
    { id: "joes", name: "Joe's Fuel & Go", number: 118, screen: false, you: true },
    { id: "cafe", name: "Café", number: 122, screen: true },
    { id: "barber", name: "Barber", number: 126, screen: false },
    { id: "restaurant", name: "Restaurant", number: 130, screen: false },
  ] as const,
  screens: ["pharmacy", "cafe"] as const,
} as const;

export const DISCLAIMER = "Joe's Fuel & Go is a demonstration business. All data shown is illustrative.";

export const JOES = { BUSINESS, GAP, INTENT, RELATIONSHIPS, ECONOMICS, REACH, PLAN, MESSAGE, OFFER, CONVERSE, PASS, RESULT, BLOCK, DISCLAIMER } as const;
export default JOES;
