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
