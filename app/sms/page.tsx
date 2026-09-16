import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument from "@/components/LegalDocument";
import {
  KEYWORD_BEHAVIOR,
  MESSAGE_SAMPLES,
  PROGRAM,
  SMS_PROGRAM,
} from "@/lib/program";

export const metadata: Metadata = {
  title: "Uptick Local SMS Program",
  description:
    "Learn what messages Uptick Local Members may receive, how frequency and consent work, and how to reply STOP or HELP.",
};

const TOC = [
  { id: "sms-program", label: "The program" },
  { id: "sms-consent", label: "Consent" },
  { id: "sms-messages", label: "Messages" },
  { id: "sms-phone-change", label: "A changed number" },
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
          <strong>{SMS_PROGRAM.sender}</strong> sends messages to people who
          choose to receive Uptick Local membership texts. The program notifies
          a member about an issued Uptick, provides relevant local benefit
          information, and sends necessary membership or service communications.
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
          SMS consent is a separate choice for the Uptick Local Membership
          program. It should be clear what messages a member is choosing to
          receive, and the choice should not be preselected or bundled with
          acceptance of general terms. Consent to receive messages is not a
          condition of purchase.
        </p>
        <p>
          This public page describes the program; it is not a signup form. When
          a membership flow asks for messaging permission, a member can decline
          SMS and still use membership and an issued benefit through the private
          web experience.
        </p>
      </section>

      <section id="sms-messages">
        <h2>Every message Uptick can send you.</h2>
        <p>
          There are four, and this is all of them. The wording below is the
          wording the Uptick application actually sends, shown with placeholder
          links in place of the private one-time token each real message
          carries. None of these is a live offer.
        </p>
        <ol className="sms-samples plainlist">
          {MESSAGE_SAMPLES.map((sample) => (
            <li key={sample.id} className="sms-sample">
              <div className="sms-sample__head">
                <h3>{sample.purpose}</h3>
                <p
                  className="sms-sample__kind"
                  data-tone={
                    sample.kind.startsWith("Promotional")
                      ? "promotional"
                      : "transactional"
                  }
                >
                  {sample.kind}
                </p>
              </div>
              <p className="sms-sample__text">{sample.text}</p>
              <dl className="sms-sample__meta">
                <div>
                  <dt>When it arrives</dt>
                  <dd>{sample.when}</dd>
                </div>
                <div>
                  <dt>What it means for consent</dt>
                  <dd>{sample.consent}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
        <p className="program-document__smallprint">
          Bracketed values are variable content. A real private token is never
          published here or submitted as a sample.
        </p>
      </section>

      <section id="sms-phone-change">
        <h2>If your number changes.</h2>
        <p>
          Tell support. A member-requested correction is verified through the
          account process first; then Uptick sends a single short-lived
          verification link to the <em>proposed new number</em> only. The link
          expires after 15 minutes and works once.
        </p>
        <p>
          Confirming it proves you control that number. It does not subscribe
          you to promotional texts. When the correction is applied, earlier
          access links and sessions are revoked and promotional messaging is
          turned off until you choose it again. Benefits already issued to you
          stay yours.
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
        <ul className="keyword-table plainlist">
          {KEYWORD_BEHAVIOR.map((entry) => (
            <li key={entry.keyword} className="keyword-row">
              <p className="keyword-row__word">{entry.keyword}</p>
              <div className="keyword-row__body">
                <p className="keyword-row__does">{entry.does}</p>
                <p className="keyword-row__not">{entry.doesNot}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="program-document__smallprint">
          Message and data rates may apply. Message frequency varies.
        </p>
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
          appropriate permission from the member. Uptick Local membership
          consent is not a pass that can be handed from one business to another.
          Participating locations do not receive Uptick consent records or
          member history.
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
