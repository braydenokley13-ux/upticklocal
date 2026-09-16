import type { Metadata } from "next";
import Link from "next/link";
import {
  JOIN_FLOW,
  KEYWORD_BEHAVIOR,
  MESSAGE_SAMPLES,
  PROGRAM,
  SMS_PROGRAM,
} from "@/lib/program";

export const metadata: Metadata = {
  title: "Membership opt-in walkthrough",
  description:
    "A public, redacted walkthrough of the Uptick Local membership signup and SMS consent flow: the join screen, the private confirmation screen, every message the program sends, and STOP, START and HELP behavior.",
};

/**
 * The public opt-in walkthrough.
 *
 * This page exists so that anyone — a prospective member, a merchant, or a
 * messaging reviewer — can see exactly what Uptick asks for and what it
 * does with the answer, without creating an account or being sent a text.
 *
 * The two screens below are faithful, non-functional reproductions of the
 * real join flow. Every string is mirrored from the operating application
 * (see `JOIN_FLOW` in lib/program.ts), the checkboxes render in their true
 * default states, and the inputs are inert: there is nothing to submit
 * here and no message can be triggered from this page.
 *
 * Deliberately absent: real member data, a real access token, any
 * credential, and any login requirement.
 */

const FLOW_FACTS = [
  [
    "Who can join",
    `Adults age ${PROGRAM.minimumMemberAge} or older. Joining is free and no purchase is required.`,
  ],
  [
    "What the first text is",
    "A one-time secure access link, sent because the person asked for it. It is transactional and does not create promotional consent.",
  ],
  [
    "How promotional consent is created",
    "Only by ticking the optional box and then confirming it again on the private access page. Two deliberate steps, both declinable.",
  ],
  [
    "How it is not created",
    "Not by joining, not by opening the access link, not by texting a keyword, and not by replying START. Uptick offers no keyword enrollment.",
  ],
] as const;

export default function OptInPage() {
  return (
    <div className="ed">
      <header className="ed-band ed-band--paper ed-hero" data-theme="light">
        <div className="ed-shell ed-hero__inner">
          <p className="ed-eyebrow">Public walkthrough</p>
          <h1 className="ed-display ed-display--xl">
            How joining Uptick <em>actually works.</em>
          </h1>
          <p className="ed-lead ed-hero__lead">
            This is the Uptick Local membership signup and SMS consent flow,
            shown in full and in public. The screens below are exact
            reproductions of the real ones, with sample data in place of any
            real person&rsquo;s details. Nothing here is a live form.
          </p>
          <div className="ed-acts">
            <Link href={PROGRAM.urls.privacy} className="ed-btn ed-btn--quiet">
              Privacy Policy
            </Link>
            <Link href={PROGRAM.urls.terms} className="ed-btn ed-btn--quiet">
              Terms
            </Link>
            <Link href={PROGRAM.urls.sms} className="ed-btn ed-btn--quiet">
              SMS Program
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- the short version */}
      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        aria-labelledby="optin-facts"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">The short version</p>
            <h2 id="optin-facts" className="ed-display ed-display--lg">
              Two permissions, <em>kept apart.</em>
            </h2>
            <p className="ed-lead">
              A person can ask Uptick for access to their membership without
              ever agreeing to promotional texts. Those are different
              questions, asked separately, and answered separately.
            </p>
          </div>
          <div className="ed-grid ed-grid--2">
            {FLOW_FACTS.map(([name, line]) => (
              <div key={name} className="ed-card">
                <h3>{name}</h3>
                <p>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ screen one */}
      <section
        className="ed-band ed-band--paper"
        data-theme="light"
        aria-labelledby="optin-screen-1"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">Screen one · Public join form</p>
            <h2 id="optin-screen-1" className="ed-display ed-display--lg">
              What the join page <em>asks for.</em>
            </h2>
            <p className="ed-lead">
              The promotional checkbox is visible, labelled optional, and
              unchecked. The form submits with it unchecked; nothing on this
              screen requires it.
            </p>
          </div>

          <div className="repro">
            <figure className="repro__screen">
              <figcaption className="repro__chrome">
                <span className="repro__dot" aria-hidden="true" />
                <span className="repro__url">
                  upticklocal.com/join <em>— reproduction, not a live form</em>
                </span>
              </figcaption>

              {/*
                A disabled fieldset: the controls render in their real default
                states so a screenshot proves them, but nothing is submittable
                and no message can be triggered from this page.
              */}
              <fieldset className="repro__form" disabled>
                <legend className="repro__legend">
                  Reproduction of the Uptick Local join form
                </legend>

                <p className="repro__eyebrow">Welcome to Uptick Local</p>
                <p className="repro__heading">{JOIN_FLOW.entry.heading}</p>
                <p className="repro__promise">{JOIN_FLOW.entry.promise}</p>

                <label className="repro__field">
                  <span>{JOIN_FLOW.entry.phoneLabel}</span>
                  <span className="repro__phone">
                    <span className="repro__cc">US +1</span>
                    <input
                      type="tel"
                      readOnly
                      value="(555) 010-0199"
                      aria-label="Mobile number, sample value"
                    />
                  </span>
                  <span className="repro__hint">
                    Sample number. Not a real member.
                  </span>
                </label>

                <div className="repro__row">
                  <label className="repro__field">
                    <span>{JOIN_FLOW.entry.homeZipLabel}</span>
                    <input type="text" readOnly value="10583" />
                  </label>
                  <label className="repro__field">
                    <span>
                      {JOIN_FLOW.entry.workZipLabel} <small>optional</small>
                    </span>
                    <input type="text" readOnly value="" placeholder="Nearby too?" />
                  </label>
                </div>

                <label className="repro__check repro__check--required">
                  <input type="checkbox" />
                  <span>{JOIN_FLOW.entry.adultCheckbox}</span>
                  <span className="repro__state">Required · shown unchecked</span>
                </label>
                <p className="repro__disclosure">
                  {JOIN_FLOW.entry.membershipTerms}
                </p>

                <label className="repro__check repro__check--optional">
                  <input type="checkbox" />
                  <span>{JOIN_FLOW.entry.promoCheckbox}</span>
                  <span className="repro__badge">Optional · unchecked by default</span>
                </label>

                <p className="repro__submit" aria-hidden="true">
                  {JOIN_FLOW.entry.submit}
                </p>

                <p className="repro__disclosure">
                  {JOIN_FLOW.entry.promoDisclosure}
                </p>
              </fieldset>

              {/* The three links are live on the real form and live here. */}
              <p className="repro__links">
                <Link href={PROGRAM.urls.sms}>SMS terms</Link>
                <span aria-hidden="true">·</span>
                <Link href={PROGRAM.urls.privacy}>Privacy</Link>
                <span aria-hidden="true">·</span>
                <Link href={PROGRAM.urls.terms}>Terms</Link>
              </p>
            </figure>

            <aside className="repro__notes" aria-label="Notes on screen one">
              <h3>What to notice</h3>
              <ol className="repro__notelist plainlist">
                <li>
                  <strong>The 18+ attestation is required.</strong> The form
                  cannot be submitted without it.
                </li>
                <li>
                  <strong>The promotional box is unchecked.</strong> That is its
                  initial state for every visitor, every time.
                </li>
                <li>
                  <strong>You can continue without it.</strong> Leaving it
                  unchecked still joins the membership and still sends the
                  requested access link.
                </li>
                <li>
                  <strong>The disclosure names the sender,</strong> describes
                  recurring automated promotional texts about the weekly Uptick
                  at usually one featured message per week, says consent is not
                  required to join or buy anything, states that message and data
                  rates may apply, and explains STOP and HELP.
                </li>
                <li>
                  <strong>Privacy, Terms and SMS are linked</strong> from the
                  form itself, and none of them requires a login.
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ screen two */}
      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        aria-labelledby="optin-screen-2"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">Screen two · Private access page</p>
            <h2 id="optin-screen-2" className="ed-display ed-display--lg">
              The choice is asked <em>a second time.</em>
            </h2>
            <p className="ed-lead">
              The requested access link opens a private page. If the person
              ticked the optional box on screen one, it is shown again with the
              full disclosure, and they can untick it before continuing.
              Recurring consent is recorded only after this confirmation.
            </p>
          </div>

          <div className="repro">
            <figure className="repro__screen">
              <figcaption className="repro__chrome">
                <span className="repro__dot" aria-hidden="true" />
                <span className="repro__url">
                  pilot.upticklocal.com/u/[REDACTED PRIVATE TOKEN]{" "}
                  <em>— reproduction, not a live page</em>
                </span>
              </figcaption>

              <fieldset className="repro__form" disabled>
                <legend className="repro__legend">
                  Reproduction of the Uptick Local private access page
                </legend>

                <p className="repro__eyebrow">Your Uptick</p>
                <p className="repro__heading">{JOIN_FLOW.confirm.heading}</p>

                <label className="repro__check repro__check--optional">
                  <input type="checkbox" />
                  <span>{JOIN_FLOW.confirm.promoCheckbox}</span>
                  <span className="repro__badge">Still optional · shown unchecked</span>
                </label>
                <p className="repro__disclosure">
                  {JOIN_FLOW.entry.promoDisclosure}
                </p>

                <p className="repro__submit" aria-hidden="true">
                  {JOIN_FLOW.confirm.submit}
                </p>
              </fieldset>
            </figure>

            <aside className="repro__notes" aria-label="Notes on screen two">
              <h3>What to notice</h3>
              <ol className="repro__notelist plainlist">
                <li>
                  <strong>The token is redacted.</strong> A real private link is
                  never published, screenshotted or submitted as a sample.
                </li>
                <li>
                  <strong>The choice can still be declined here.</strong>{" "}
                  Unticking it before continuing leaves promotional messaging
                  off, and membership opens either way.
                </li>
                <li>
                  <strong>Consent is recorded only on confirmation.</strong> A
                  refresh, a replay, or saving &ldquo;on&rdquo; again does not
                  create a new consent record or a second confirmation text.
                </li>
                <li>
                  <strong>No login is involved.</strong> The link itself is the
                  credential, it is time-limited, and it is revoked if the
                  member&rsquo;s number is later corrected.
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- the messages */}
      <section
        className="ed-band ed-band--paper"
        data-theme="light"
        aria-labelledby="optin-messages"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">Representative messages</p>
            <h2 id="optin-messages" className="ed-display ed-display--lg">
              Every message the program <em>can send.</em>
            </h2>
            <p className="ed-lead">
              Four templates, matching the wording the application renders.
              Bracketed values are variable; a real private token is never
              published here.
            </p>
          </div>
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
        </div>
      </section>

      {/* ------------------------------------------------------- stop and help */}
      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        aria-labelledby="optin-keywords"
      >
        <div className="ed-shell ed-shell--prose">
          <div className="ed-head">
            <p className="ed-eyebrow">STOP, START and HELP</p>
            <h2 id="optin-keywords" className="ed-display ed-display--lg">
              Leaving is <em>one word.</em>
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
            {SMS_PROGRAM.rates} Questions:{" "}
            <a href={`mailto:${PROGRAM.supportEmail}`}>
              {PROGRAM.supportEmail}
            </a>
            .
          </p>
          <p className="ed-gate" style={{ textAlign: "left" }}>
            Pilot enrollment is not open. This walkthrough documents the flow a
            member will meet when it opens; it does not enroll anyone and sends
            no messages.
          </p>
        </div>
      </section>
    </div>
  );
}
