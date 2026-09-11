/**
 * Public facts shared by the membership, SMS, privacy and terms pages.
 *
 * Keep this module limited to non-secret values that are safe to render in
 * the browser. The membership join destination is deliberately configurable:
 * the public site does not own the membership signup flow.
 */
const configuredMembershipJoinUrl = process.env.NEXT_PUBLIC_UPTICK_MEMBERSHIP_JOIN_URL?.trim();

export const PROGRAM = {
  brandName: "Uptick Local",
  supportEmail: "iwhite@upticklocal.com",
  smsProgramName: "Uptick Local Membership",
  effectiveDate: "September 11, 2026",
  effectiveDateISO: "2026-09-11",
  urls: {
    membership: "/membership",
    sms: "/sms",
    privacy: "/privacy",
    terms: "/terms",
  },
  membershipJoinUrl: configuredMembershipJoinUrl || null,
} as const;

export const MEMBERSHIP_PILOT_HREF = `mailto:${PROGRAM.supportEmail}?subject=${encodeURIComponent("Uptick Local membership pilot")}`;

export const SMS_PROGRAM = {
  sender: PROGRAM.brandName,
  purpose:
    "Members receive their Uptick membership messages, including local perk messages and necessary membership or service communications.",
  frequency:
    "Approximately one featured Uptick per week. Service, transactional and support messages may create additional messages when needed.",
  rates: "Message and data rates may apply.",
  optOut: "Reply STOP to stop receiving Uptick Local messages.",
  help: `Reply HELP for help, or contact ${PROGRAM.supportEmail}.`,
  mobileInfoNonSharing:
    "Mobile information, including phone numbers and SMS opt-in or consent data, will not be shared with third parties or affiliates for their own marketing or promotional purposes.",
} as const;
