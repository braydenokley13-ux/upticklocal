/**
 * Public facts shared by the membership, SMS, privacy and terms pages.
 *
 * Keep this module limited to non-secret values that are safe to render in
 * the browser. The membership join destination is deliberately configurable:
 * the public site does not own the membership signup flow.
 */
const configuredMembershipJoinUrl =
  process.env.NEXT_PUBLIC_UPTICK_MEMBERSHIP_JOIN_URL?.trim();
const pilotEnrollmentOpen =
  process.env.NEXT_PUBLIC_UPTICK_PILOT_ENROLLMENT_OPEN === "true";

export const PROGRAM = {
  brandName: "Uptick Local",
  supportEmail: "iwhite@upticklocal.com",
  smsProgramName: "Uptick Local Membership",
  effectiveDate: "September 13, 2026",
  effectiveDateISO: "2026-09-13",
  urls: {
    membership: "/membership",
    sms: "/sms",
    privacy: "/privacy",
    terms: "/terms",
  },
  membershipJoinUrl:
    pilotEnrollmentOpen && configuredMembershipJoinUrl
      ? configuredMembershipJoinUrl
      : null,
  pilotEnrollmentOpen,
  pilotTargetMembers: 150,
  pilotMemberCap: 200,
  minimumMemberAge: 18,
} as const;

export const MEMBERSHIP_PILOT_HREF = `mailto:${PROGRAM.supportEmail}?subject=${encodeURIComponent("Uptick Local membership pilot")}`;

export const SMS_PROGRAM = {
  sender: PROGRAM.brandName,
  purpose:
    "Members who opt in receive Uptick membership messages, including notice of their featured local benefit and necessary membership or service communications.",
  frequency:
    "Message frequency varies. A published weekly release may create one featured-benefit notice, and service, transactional or support activity may create additional messages.",
  rates: "Message and data rates may apply.",
  optOut:
    "Reply STOP to stop receiving Uptick Local texts. STOP does not cancel membership or an already issued benefit.",
  restart:
    "Reply START to ask the carrier to remove its messaging block. START does not enroll you or provide new SMS consent.",
  help: `Reply HELP for help, or contact ${PROGRAM.supportEmail}.`,
  mobileInfoNonSharing:
    "Mobile information, including phone numbers and SMS opt-in or consent data, will not be shared with third parties or affiliates for their own marketing or promotional purposes.",
} as const;

/**
 * The four message templates the production application actually renders,
 * mirrored here word for word from `memberMessageText` in the operating
 * application. These are the templates submitted as Twilio A2P Campaign
 * samples, so the public page and the Campaign submission cannot drift.
 *
 * Variable content is in square brackets, per Twilio's sample-message rules.
 * Never publish a real private token: the links below are illustrative.
 */
export const MESSAGE_SAMPLES = [
  {
    id: "access",
    purpose: "Requested access",
    kind: "Transactional · you asked for it",
    when: "You enter your own mobile number and ask Uptick for one secure access link.",
    consent:
      "This message fulfills your request. It does not subscribe you to promotional texts.",
    text: "Uptick Local: Your requested secure access link: https://pilot.upticklocal.com/u/[secure-token] Open it to confirm your phone and review your membership choices. Reply STOP to stop texts. HELP for help.",
  },
  {
    id: "weekly",
    purpose: "Weekly Uptick notice",
    kind: "Promotional · optional, opt-in only",
    when: "A weekly release is published and you have confirmed the optional promotional choice.",
    consent:
      "Sent only to members who opted in and confirmed it on the private access page. Usually one featured message per week.",
    text: "Uptick Local: Your featured Uptick is ready. See this week's free local benefit: https://pilot.upticklocal.com/your-uptick No purchase required. Reply STOP to stop promotional texts. HELP for help.",
  },
  {
    id: "confirmation",
    purpose: "Opt-in confirmation",
    kind: "Promotional · one per new opt-in",
    when: "Immediately after you newly turn the optional promotional choice on and confirm it.",
    consent:
      "One confirmation per new opt-in. A refresh, a replay, saving “on” again, or replying START does not generate it.",
    text: "Uptick Local: You're subscribed to recurring automated promotional texts about your weekly Uptick: usually 1 featured message per week. Msg & data rates may apply. Reply STOP to stop or HELP for help.",
  },
  {
    id: "phone-change",
    purpose: "Phone-number correction",
    kind: "Transactional · member-requested",
    when: "You ask support to correct your number and support verifies the request. The link goes only to the proposed new number and expires in 15 minutes.",
    consent:
      "Confirming it proves you control the proposed number. It does not create promotional consent; promotional texts stay off until a fresh opt-in.",
    text: "Uptick Local: Confirm the new phone number you asked support to use: https://pilot.upticklocal.com/phone-change/[secure-token] This does not subscribe you to promotional texts. Reply STOP to stop texts. HELP for help.",
  },
] as const;

/** What the three carrier keywords do, stated the same way everywhere. */
export const KEYWORD_BEHAVIOR = [
  {
    keyword: "STOP",
    does: "Stops Uptick Local texts.",
    doesNot:
      "Does not cancel your membership and does not take away a benefit already issued to you. Your membership stays usable on the web.",
  },
  {
    keyword: "START",
    does: "Asks the carrier to remove its messaging block.",
    doesNot:
      "Does not enroll you and does not restore promotional consent. Promotional texts resume only after a fresh opt-in you make yourself.",
  },
  {
    keyword: "HELP",
    does: `Returns help information and a support path. Contact ${PROGRAM.supportEmail}.`,
    doesNot: "Does not create consent of any kind.",
  },
] as const;

/**
 * The join-flow copy, mirrored word for word from the operating
 * application's `membership-copy.ts` and `member-controls.tsx`. The public
 * opt-in walkthrough reproduces the real screens, so this is the same text
 * a member sees — not a paraphrase written for a reviewer.
 */
export const JOIN_FLOW = {
  /** Screen one: the public join form. */
  entry: {
    heading: "Your next good thing starts here.",
    promise:
      "We’ll text a one-time private link to confirm your phone and open your membership.",
    phoneLabel: "Mobile number",
    phonePlaceholder: "(201) 555-0123",
    homeZipLabel: "Home ZIP",
    workZipLabel: "Work ZIP",
    adultCheckbox:
      "I confirm that I am 18 or older and want to join Uptick.",
    membershipTerms:
      "Uptick Local is a free local membership for adults age 18 or older. Joining does not require promotional text-message consent or a purchase.",
    promoCheckbox: "I also want promotional texts about my weekly Uptick.",
    promoDisclosure:
      "Optional: I agree to recurring automated promotional texts from Uptick Local about my weekly Uptick, usually one featured message per week. Consent is not required to join or buy anything. Message and data rates may apply. Reply STOP to stop promotional texts or HELP for help. Participating stores do not receive permission to market to me. See Uptick’s SMS Terms, Privacy Policy, and Terms.",
    submit: "Join Uptick — it’s free",
  },
  /** Screen two: the private access page reached from the requested text. */
  confirm: {
    heading: "Confirm and open your Uptick.",
    promoCheckbox:
      "Yes, send me optional promotional texts about my weekly Uptick.",
    submit: "Join & open my Uptick",
  },
} as const;
