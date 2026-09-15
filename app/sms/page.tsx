import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument from "@/components/LegalDocument";
import { PROGRAM, SMS_PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Uptick Local SMS Program",
  description:
    "Learn what messages Uptick Local Members may receive, how frequency and consent work, and how to reply STOP or HELP.",
};

const TOC = [
  { id: "sms-program", label: "The program" },
  { id: "sms-consent", label: "Consent" },
  { id: "sms-messages", label: "Messages" },
  { id: "sms-phone-change", label: "Phone changes" },
  { id: "sms-controls", label: "STOP and HELP" },
  { id: "sms-merchants", label: "Participating merchants" },
  { id: "sms-contact", label: "Contact" },
];

export default function SmsPage() {
  return (
    <LegalDocument
      eyebrow={PROGRAM.smsProgramName}
      title="Messages with a reason to arrive."
      lead="This page explains the Uptick Local Membership messaging program in plain language, including what members may receive and how to control it."
      toc={TOC}
    >
      <section id="sms-program">
        <h2>The Uptick Local Membership messaging program</h2>
        <p>
          <strong>{SMS_PROGRAM.sender}</strong> sends messages to Uptick Local
          members. A member may request one secure access link and may
          separately choose recurring promotional notices. Service and support
          messages are sent when the member requests or needs them.
        </p>
        <dl className="program-facts">
          <div>
            <dt>Program</dt>
            <dd>{PROGRAM.smsProgramName}</dd>
          </div>
          <div>
            <dt>Sender</dt>
            <dd>{SMS_PROGRAM.sender}</dd>
          </div>
          <div>
            <dt>Purpose</dt>
            <dd>{SMS_PROGRAM.purpose}</dd>
          </div>
          <div>
            <dt>Frequency</dt>
            <dd>{SMS_PROGRAM.frequency}</dd>
          </div>
        </dl>
        <p className="program-callout">
          These are recurring automated SMS messages where applicable.{" "}
          {SMS_PROGRAM.rates}
        </p>
      </section>

      <section id="sms-consent">
        <h2>Consent is specific and optional.</h2>
        <p>
          Entering your own mobile number and submitting an access request asks
          Uptick Local to send one secure access link. That requested
          informational message does not create recurring promotional consent.
        </p>
        <p>
          Recurring automated promotional texts are a separate choice for the
          Uptick Local Membership program. The promotional checkbox is initially
          unchecked and must be confirmed in the private Uptick web flow. A
          member can decline promotional texts and still join, use membership,
          and redeem an issued benefit. Consent is not a condition of purchase.
        </p>
        <p>
          Uptick does not offer keyword opt-in. Texting START or another keyword
          does not create recurring promotional consent.
        </p>
      </section>

      <section id="sms-messages">
        <h2>What a message may say.</h2>
        <p>
          A message may point a member to an available Uptick, explain the
          relevant timing or location, confirm a membership action, or provide
          service and support information. Uptick does not use this page to
          publish a live offer or promise availability in a particular market.
        </p>
        <div
          className="program-sample"
          aria-label="Sample requested Uptick Local access message"
        >
          <p className="mono-tag mono-tag--ink">
            Sample requested access message
          </p>
          <p>{SMS_PROGRAM.samples.access}</p>
        </div>
        <div
          className="program-sample"
          aria-label="Sample Uptick Local weekly message, not a live offer"
        >
          <p className="mono-tag mono-tag--ink">
            Sample weekly message · not a live offer
          </p>
          <p>{SMS_PROGRAM.samples.weekly}</p>
        </div>
        <div
          className="program-sample"
          aria-label="Sample Uptick Local promotional opt-in confirmation"
        >
          <p className="mono-tag mono-tag--ink">
            Sample promotional opt-in confirmation
          </p>
          <p>{SMS_PROGRAM.samples.optInConfirmation}</p>
        </div>
        <div
          className="program-sample"
          aria-label="Sample requested Uptick Local phone correction verification"
        >
          <p className="mono-tag mono-tag--ink">
            Sample requested phone correction verification
          </p>
          <p>{SMS_PROGRAM.samples.phoneCorrection}</p>
        </div>
      </section>

      <section id="sms-phone-change">
        <h2>Verifying a requested phone-number correction.</h2>
        <p>
          A member who needs to change the mobile number on an existing Uptick
          account first asks Uptick support for the correction. After Uptick
          verifies the original member&rsquo;s correction request, Uptick may
          send a verification link only to the proposed new number. The link
          expires after 15 minutes and can be confirmed once. Confirming it
          proves control of the proposed number; it does not subscribe the
          member to promotional texts.
        </p>
        <p>
          Support must apply the correction within 24 hours after the new
          number is confirmed. Applying it ends earlier private sessions and
          access links, prevents queued messages from being sent under the old
          account context, and turns promotional texts off. The member must use
          the new number for a fresh private access flow and make a new
          affirmative web choice before promotional texts can resume. An
          already issued benefit and its history are not erased by the phone
          correction.
        </p>
      </section>

      <section id="sms-controls">
        <h2>STOP to stop. HELP to get help.</h2>
        <p>
          <strong>Reply STOP</strong> to a message to stop receiving Uptick
          Local Membership texts. <strong>Reply HELP</strong> for help, or
          contact{" "}
          <a href={`mailto:${PROGRAM.supportEmail}`}>{PROGRAM.supportEmail}</a>.
          Opt-out and help requests apply to this Uptick program; they do not
          create or transfer consent for any independent merchant program.
        </p>
        <ul className="program-list">
          <li>{SMS_PROGRAM.optOut}</li>
          <li>{SMS_PROGRAM.restart}</li>
          <li>{SMS_PROGRAM.help}</li>
          <li>Message and data rates may apply. Message frequency varies.</li>
        </ul>
      </section>

      <section id="sms-merchants">
        <h2>Uptick is the sender. A merchant fulfills the benefit.</h2>
        <p>
          An approved local location may fulfill an Uptick benefit. That does
          not make the merchant an automatic SMS sender, and joining Uptick does
          not automatically enroll a member in the merchant&rsquo;s independent
          marketing program.
        </p>
        <p>
          If merchant-specific marketing is offered later, it requires its own
          appropriate permission from the member. Uptick Local membership is not
          a merchant list. Participating locations do not receive member phone
          numbers, Uptick consent records or cross-location member history.
        </p>
      </section>

      <section id="sms-contact">
        <h2>Questions about the program?</h2>
        <p>
          Contact{" "}
          <a href={`mailto:${PROGRAM.supportEmail}`}>{PROGRAM.supportEmail}</a>.
          You can also read the
          <Link href={PROGRAM.urls.privacy}> Privacy Policy</Link> and{" "}
          <Link href={PROGRAM.urls.terms}> Terms</Link>.
        </p>
        <p className="program-document__smallprint">
          Carriers are not liable for delayed or undelivered messages.
        </p>
      </section>
    </LegalDocument>
  );
}
