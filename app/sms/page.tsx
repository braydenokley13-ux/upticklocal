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
          <strong>{SMS_PROGRAM.sender}</strong> sends messages to people who choose to receive Uptick Local membership texts. The
          program helps deliver a member&rsquo;s Uptick, local perk information, and necessary membership or service communications.
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
            <dd>{SMS_PROGRAM.frequency} Message frequency varies.</dd>
          </div>
        </dl>
        <p className="program-callout">
          These are recurring automated SMS messages where applicable. {SMS_PROGRAM.rates}
        </p>
      </section>

      <section id="sms-consent">
        <h2>Consent is specific and optional.</h2>
        <p>
          SMS consent is a separate choice for the Uptick Local Membership program. It should be clear what messages a member is
          choosing to receive, and the choice should not be preselected or bundled with acceptance of general terms. Consent to
          receive messages is not a condition of purchase.
        </p>
        <p>
          This public page describes the program; it is not a signup form. When a membership flow asks for messaging permission, a
          member must be able to decline SMS and still continue with any unrelated action that is available to them.
        </p>
      </section>

      <section id="sms-messages">
        <h2>What a message may say.</h2>
        <p>
          A message may point a member to an available Uptick, explain the relevant timing or location, confirm a membership action,
          or provide service and support information. Uptick does not use this page to publish a live offer or promise availability in
          a particular market.
        </p>
        <div className="program-sample" aria-label="Sample Uptick Local message, not a live offer">
          <p className="mono-tag mono-tag--ink">Sample message · not a live offer</p>
          <p>
            Uptick Local: Your featured Uptick is ready. Open your member message for the eligible perk, location and timing. Reply
            STOP to opt out.
          </p>
        </div>
      </section>

      <section id="sms-controls">
        <h2>STOP to stop. HELP to get help.</h2>
        <p>
          <strong>Reply STOP</strong> to a message to stop receiving Uptick Local Membership texts. <strong>Reply HELP</strong> for
          help, or contact <a href={`mailto:${PROGRAM.supportEmail}`}>{PROGRAM.supportEmail}</a>. Opt-out and help requests apply to
          this Uptick program; they do not create or transfer consent for any independent merchant program.
        </p>
        <ul className="program-list">
          <li>{SMS_PROGRAM.optOut}</li>
          <li>{SMS_PROGRAM.help}</li>
          <li>Message and data rates may apply. Message frequency varies.</li>
        </ul>
      </section>

      <section id="sms-merchants">
        <h2>Uptick is the sender. A merchant fulfills the benefit.</h2>
        <p>
          A participating gas station, convenience store, or other eligible location may fulfill an Uptick benefit. That does not
          make the merchant an automatic SMS sender, and joining Uptick does not automatically enroll a member in the merchant&rsquo;s
          independent marketing program.
        </p>
        <p>
          If merchant-specific marketing is offered later, it requires its own appropriate permission from the member. Uptick Local
          membership consent is not a pass that can be handed from one business to another.
        </p>
      </section>

      <section id="sms-contact">
        <h2>Questions about the program?</h2>
        <p>
          Contact <a href={`mailto:${PROGRAM.supportEmail}`}>{PROGRAM.supportEmail}</a>. You can also read the
          <Link href={PROGRAM.urls.privacy}> Privacy Policy</Link> and <Link href={PROGRAM.urls.terms}> Terms</Link>.
        </p>
        <p className="program-document__smallprint">Carriers are not liable for delayed or undelivered messages.</p>
      </section>
    </LegalDocument>
  );
}
