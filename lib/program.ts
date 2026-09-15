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
  effectiveDate: "September 14, 2026",
  effectiveDateISO: "2026-09-14",
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
    "Members who separately opt in receive recurring automated promotional notices about their featured local benefit. Requested access, service and support messages are separate.",
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
  samples: {
    access:
      "Uptick Local: Your requested secure access link: https://pilot.upticklocal.com/u/[secure-token] Open it to confirm your phone and review your membership choices. Reply STOP to stop texts. HELP for help.",
    weekly:
      "Uptick Local: Your featured Uptick is ready. See this week's free local benefit: https://pilot.upticklocal.com/your-uptick No purchase required. Reply STOP to stop promotional texts. HELP for help.",
    optInConfirmation:
      "Uptick Local: You're subscribed to recurring automated promotional texts about your weekly Uptick: usually 1 featured message per week. Msg & data rates may apply. Reply STOP to stop or HELP for help.",
    phoneCorrection:
      "Uptick Local: Confirm the new phone number you asked support to use: https://pilot.upticklocal.com/phone-change/[secure-token] This does not subscribe you to promotional texts. Reply STOP to stop texts. HELP for help.",
  },
} as const;
