# Twilio A2P: what the public site now provides

This records what `upticklocal.com` publishes for the A2P Campaign
submission, what it deliberately does not, and the exact external steps that
remain. It is the public-site counterpart to
`docs/TWILIO_REAL_ENROLLMENT_PACKAGE.md` in the operating repository.

## The evidence URL

The operating repository's Campaign package carries two placeholders in its
"Message flow / call to action" text:

- `[[PUBLIC JOIN URL]]` — still blank. Pilot enrollment is not open, so no
  public join URL exists yet.
- `[[PUBLIC EVIDENCE URL]]` — **now satisfied by `https://upticklocal.com/opt-in`**
  once this branch is deployed.

Twilio accepts a publicly accessible screenshot or walkthrough URL when the
opt-in itself is not public or is gated. That is exactly this case.

## What `/opt-in` shows

Each item the package's screenshot set calls for, on one anonymous page:

| # | Required | Where |
|---|----------|-------|
| 1 | Adult membership signup | Screen one reproduction |
| 2 | Phone field | Screen one, sample number `(555) 010-0199` |
| 3 | Required 18+ attestation | Screen one, marked required |
| 4 | Optional promotional checkbox, initially unchecked | Screen one, drawn unchecked and labelled |
| 5 | Able to continue without promotional consent | Stated in note 3 beside the screen |
| 6 | Full disclosure | The exact `MARKETING_SMS_DISCLOSURE` text |
| 7 | Privacy link | In the hero and in the reproduced form |
| 8 | Terms link | In the hero and in the reproduced form |
| 9 | SMS link | In the hero and in the reproduced form |
| 10 | Private confirmation screen | Screen two reproduction |
| 11 | Promotional choice still optional there | Screen two, drawn unchecked |
| 12 | Representative messages | All four current templates |
| 13 | STOP / HELP behaviour | The keyword table |

The reproductions are inert: the fieldsets are disabled, the inputs are
read-only, and no form on the page can be submitted or send a message.

## Copy that is mirrored, not paraphrased

These strings are copied verbatim from the operating application so the
public page and the Campaign submission cannot drift:

| Public site | Operating application |
|---|---|
| `MESSAGE_SAMPLES[*].text` in `lib/program.ts` | `memberMessageText()` in `src/lib/member-messaging.ts` |
| `JOIN_FLOW.entry.membershipTerms` | `MEMBERSHIP_TERMS` in `src/lib/membership-copy.ts` |
| `JOIN_FLOW.entry.promoDisclosure` | `MARKETING_SMS_DISCLOSURE`, same file |
| `JOIN_FLOW.entry.adultCheckbox` / `promoCheckbox` / `submit` | `src/components/member-controls.tsx` |
| `JOIN_FLOW.confirm.promoCheckbox` / `submit` | same file |

**If the application's wording changes, change it here too.** A Campaign is
rejected when its samples do not match what the sender actually sends.

## Required Privacy Policy statements

Twilio rejects a privacy policy that omits any of these. All three are now
present in `/privacy` itself, not only on `/sms` and `/terms`:

1. Mobile numbers and messaging consent are not shared with third parties or
   affiliates for their own marketing (`SMS_PROGRAM.mobileInfoNonSharing`).
2. The message-frequency sentence (`SMS_PROGRAM.frequency`).
3. "Message and data rates may apply." (`SMS_PROGRAM.rates`).

## Public pages that must return 200 without login

Verified on the production build with no cookies and no redirects:
`/`, `/membership`, `/growth`, `/privacy`, `/terms`, `/sms`, `/opt-in`,
`/trust`.

## Still required, and not inventable here

These are business facts. They are **not** written anywhere on the public
site, and must not be guessed:

- `[REQUIRES VERIFIED BUSINESS FACT]` — the operating legal entity name and
  business form, for the Direct Brand registration and the policy pages.
- `[REQUIRES VERIFIED BUSINESS FACT]` — EIN / business registration number
  for the Brand record.
- `[REQUIRES VERIFIED BUSINESS FACT]` — the physical or mailing notice
  address publishable in the Privacy Policy and Terms.
- `[REQUIRES VERIFIED BUSINESS FACT]` — the tested support email that
  replaces `[[TESTED SUPPORT EMAIL]]` in the configured HELP response.
  `iwhite@upticklocal.com` is the current support address on the site, but
  the package requires the address to be tested before it is configured.
- `[REQUIRES VERIFIED BUSINESS FACT]` — confirmation of governing law,
  venue and dispute process by qualified review.
- `[REQUIRES VERIFIED BUSINESS FACT]` — the approved Uptick sender and
  Messaging Service SID for the dedicated membership sender.

Until the entity and notice address exist, the public pages say so rather
than naming anything. `NEXT_PUBLIC_UPTICK_PILOT_ENROLLMENT_OPEN` stays
unset and no join destination is rendered.

## The exact external steps that remain

Nothing in this repository can complete these; they happen in the Twilio
console and in the business.

1. Deploy this branch to `upticklocal.com` and confirm `/opt-in` returns
   200 anonymously on the real domain.
2. Fill `[[PUBLIC EVIDENCE URL]]` in the Campaign's message-flow text with
   `https://upticklocal.com/opt-in`. Leave `[[PUBLIC JOIN URL]]` blank, or
   remove that clause, while enrollment is closed.
3. Supply the verified business facts above and register the Direct Brand.
4. Configure the dedicated membership Messaging Service, then set Advanced
   Opt-Out to the keywords and responses in the operating package, with the
   tested support address substituted into the HELP response.
5. Submit the Campaign with the four sample messages exactly as published
   on `/sms` and `/opt-in`.
6. Run the controlled internal carrier test against `INTERNAL_TEST_NUMBERS`
   before enabling `PRODUCTION_DELIVERY_ENABLED`.

`A2P opt_in_message` stays blank: Uptick offers no keyword subscription.
