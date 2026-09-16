import type { Metadata } from "next";
import Link from "next/link";
import { TRUST } from "@/lib/audience";
import { KEYWORD_BEHAVIOR, PROGRAM, SMS_PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Trust & Privacy",
  description:
    "What Uptick Local does with a member's phone number, what it never shares, and how to stop messages. Links to the Privacy Policy, Terms, SMS program and the public opt-in walkthrough.",
};

/** The short version, so nobody has to read three policies to get the point. */
const PLAIN = [
  [
    "Joining is free",
    "No membership fee, and no purchase is required to receive the featured benefit.",
  ],
  [
    "Texts are a separate choice",
    "The promotional checkbox is optional and unchecked to start. You can join, use membership and redeem a benefit without ever agreeing to it.",
  ],
  [
    "Your number stays with Uptick",
    "A participating store fulfills the benefit. It does not receive your phone number, your messaging consent or your member history.",
  ],
  [
    "Stopping is not leaving",
    "Reply STOP and the texts end. Your membership and any benefit already issued to you are untouched.",
  ],
] as const;

export default function TrustPage() {
  return (
    <div className="ed">
      <header className="ed-band ed-band--paper ed-hero" data-theme="light">
        <div className="ed-shell ed-hero__inner">
          <p className="ed-eyebrow">{TRUST.eyebrow}</p>
          <h1 className="ed-display ed-display--xl">
            {TRUST.title.lead} <em>{TRUST.title.accent}</em>
          </h1>
          <p className="ed-lead ed-hero__lead">{TRUST.lead}</p>
        </div>
      </header>

      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        aria-labelledby="trust-plain"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">In plain language</p>
            <h2 id="trust-plain" className="ed-display ed-display--lg">
              Four things worth <em>saying straight.</em>
            </h2>
          </div>
          <div className="ed-grid ed-grid--2">
            {PLAIN.map(([name, line]) => (
              <div key={name} className="ed-card">
                <h3>{name}</h3>
                <p>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="ed-band ed-band--paper"
        data-theme="light"
        aria-labelledby="trust-keywords"
      >
        <div className="ed-shell ed-shell--prose">
          <div className="ed-head">
            <p className="ed-eyebrow">If you text us back</p>
            <h2 id="trust-keywords" className="ed-display ed-display--lg">
              What each word <em>actually does.</em>
            </h2>
          </div>
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
          <p className="ed-gate" style={{ textAlign: "left" }}>
            {SMS_PROGRAM.mobileInfoNonSharing} {SMS_PROGRAM.frequency}{" "}
            {SMS_PROGRAM.rates}
          </p>
        </div>
      </section>

      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        aria-labelledby="trust-docs"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">Read the documents</p>
            <h2 id="trust-docs" className="ed-display ed-display--lg">
              Nothing here is <em>behind a login.</em>
            </h2>
          </div>
          <div className="ed-doclinks">
            {TRUST.docs.map((doc) => (
              <Link key={doc.id} href={doc.href} className="ed-doclink">
                <span className="ed-doclink__name">{doc.name}</span>
                <span className="ed-doclink__line">{doc.line}</span>
              </Link>
            ))}
          </div>

          <div className="ed-evidence">
            <div>
              <p className="ed-eyebrow ed-eyebrow--muted">
                For reviewers and the curious
              </p>
              <h3 className="ed-display ed-display--md">
                {TRUST.evidence.name}
              </h3>
              <p className="ed-lead">{TRUST.evidence.line}</p>
            </div>
            <Link href={TRUST.evidence.href} className="ed-btn ed-btn--go">
              See the walkthrough
            </Link>
          </div>

          <p className="ed-signoff ed-signoff--home">
            {TRUST.signoff.lead}{" "}
            <em className="accent">{TRUST.signoff.accent}</em>
          </p>
          <p className="ed-gate">
            Questions about privacy or messaging:{" "}
            <a href={`mailto:${PROGRAM.supportEmail}`}>
              {PROGRAM.supportEmail}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
