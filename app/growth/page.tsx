import type { Metadata } from "next";
import Link from "next/link";
import ContactPanel from "@/components/ContactPanel";
import DropMessage from "@/components/home/DropMessage";
import ScreenFace from "@/components/home/ScreenFace";
import PageVisual from "@/components/PageVisual";
import { CONSENT, CTA, GROWTH_EXAMPLE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Uptick Growth",
  description:
    "Uptick Growth turns local attention into measurable customer activity: a Monthly Anchor on your screen and the Uptick screens nearby, Uptick Drops that give customers a reason to come in now, claims and redemptions on their phone, and a plain report. Requires hosting.",
};

const HOW = [
  {
    title: "Set the Anchor",
    body: "One offer for the month, and what the reward is. It runs on your screen and on the Uptick screens nearby, with one code to scan. The screen is the durable reason to care.",
  },
  {
    title: "Customers scan and claim",
    body: "A number delivers this month's pass by text. Two boxes, both optional and off to start: updates from you, and Uptick Drops from nearby businesses.",
  },
  {
    title: "They visit and redeem",
    body: "Open the pass, show staff, tap redeem, confirm. Uptick records the redemption and the time. No POS integration, no cashier code, no new software.",
  },
  {
    title: "Send Drops",
    body: "A Drop is a limited-time offer to the people who asked for one: morning hours, this weekend, the first thirty. The phone is the urgent reason to act.",
  },
  {
    title: "Read the report",
    body: "Signups, claims, redemptions with time, Drops sent and what each brought back, by placement. Only what Uptick can actually observe.",
  },
];

const TRACKED = [
  ["Signups", "Numbers entered at the Anchor"],
  ["Claims", "Passes delivered and opened"],
  ["Redemptions", "Passes redeemed at your counter, with the time"],
  ["Drops sent", "Each Drop, and the claims and redemptions it brought back"],
  ["Your list", "Customers who chose to hear from you again"],
  ["Uptick Drops", "Customers who chose Drops from nearby businesses"],
  ["By placement", "Which counters the activity came from"],
];

export default function GrowthPage() {
  const g = GROWTH_EXAMPLE;
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Uptick Growth · Requires hosting</p>
        <div className="page__copy">
          <h1 className="page__title">Local attention, turned into visits you can count.</h1>
          <p className="page__lead">
            Growth is the premium layer on a host screen. A Monthly Anchor on the counter is the reason to care; an Uptick Drop on
            the phone is the reason to act now; the pass is redeemed at your register and reported back to you plainly.
          </p>
          <div className="page__acts">
            <a href="#start" className="btn btn--mint">
              {CTA.growth.label}
            </a>
            <a href="#how" className="btn btn--outline">
              How it works
            </a>
          </div>
        </div>
        <div className="page__object">
          <div className="unit">
            <div className="unit__panel" aria-hidden="true">
              <ScreenFace way="growth" />
            </div>
            <div className="unit__foot" aria-hidden="true" />
          </div>
          <p className="object__note">{g.note}</p>
        </div>
      </header>

      <PageVisual
        name="pockets"
        alt="Across the street: the convenience store, the gym and the restaurant, each with a counter screen that can carry your Anchor."
        caption="Requires hosting · Anchor on the screens · Drops on the phone"
      />

      <section id="how" className="band band--paper" aria-labelledby="growth-how">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">How Growth works</p>
            <h2 id="growth-how" className="band__title">
              Five steps. Two of them are yours.
            </h2>
            <p className="page__lead">You choose the offer and provide the reward. Uptick does the rest, and reports it back.</p>
          </header>
          <div className="steps">
            {HOW.map((step, i) => (
              <div key={step.title}>
                <p className="step__n">0{i + 1}</p>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--light" aria-labelledby="growth-drop">
        <div className="band__inner pair">
          <div>
            <p className="mono-tag">What makes a Drop a Drop</p>
            <h2 id="growth-drop" className="band__title" style={{ marginTop: 16 }}>
              Real windows. Real limits. Nothing invented.
            </h2>
            <p className="page__lead" style={{ marginTop: 20 }}>
              A screen whose content changes monthly cannot keep saying &ldquo;today only&rdquo; and stay credible. A Drop can,
              because it is true: it lands when the window opens and it ends when the window closes.
            </p>
            <ul className="places" aria-label="Kinds of Drop window" style={{ marginTop: 28 }}>
              {g.windows.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="step__body" style={{ marginTop: 28 }}>
              Drops go only to the people who asked for them. How often is up to you and the offer, not a schedule Uptick imposes.
            </p>
          </div>
          <div className="phone phone--drop" style={{ justifySelf: "center" }}>
            <DropMessage large />
          </div>
        </div>
      </section>

      <section className="band band--deep" aria-labelledby="growth-consent">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">Consent, exactly</p>
            <h2 id="growth-consent" className="band__title">
              The claim is one thing. The lists are two others.
            </h2>
            <p className="page__lead">
              A customer&rsquo;s number is used once, to deliver the pass. Everything else is a separate choice, and both are
              unchecked to start.
            </p>
          </header>
          <div className="ledger">
            <div className="ledger__row">
              <span>{CONSENT.claim}</span>
              <span className="ledger__meta">The action itself. Delivers this month&rsquo;s pass. No list is joined.</span>
            </div>
            <div className="ledger__row">
              <span>{CONSENT.merchant}</span>
              <span className="ledger__meta">Optional. Your Drops and updates, from your business only. Reply STOP any time.</span>
            </div>
            <div className="ledger__row">
              <span>{CONSENT.network}</span>
              <span className="ledger__meta">Optional, and separate. Drops from other nearby businesses, never hidden inside the first box.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="growth-measure">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">What Uptick reports</p>
            <h2 id="growth-measure" className="band__title">
              Real activity, not estimated audiences.
            </h2>
            <p className="page__lead">
              A screen playing your Anchor is a play count, not a headcount. Uptick does not convert plays into impressions and does
              not claim to know a customer&rsquo;s total spending. What it can observe, it reports.
            </p>
          </header>
          <div className="ledger">
            {TRACKED.map(([name, meta]) => (
              <div key={name} className="ledger__row">
                <span>{name}</span>
                <span className="ledger__meta">{meta}</span>
              </div>
            ))}
          </div>

          <div className="split" style={{ marginTop: "clamp(48px, 7vh, 80px)" }}>
            <div>
              <p className="mono-tag mono-tag--ink">Uptick handles</p>
              <ul className="plainlist plainlist--ink">
                <li>The screens</li>
                <li>The code and the claim flow</li>
                <li>The texts, the passes, the Drops</li>
                <li>Tracking and the report</li>
              </ul>
            </div>
            <div>
              <p className="mono-tag mono-tag--ink">You handle</p>
              <p className="split__big">
                Choose the offer.
                <br />
                Provide the reward.
              </p>
              <p className="step__body" style={{ marginTop: 22 }}>
                Growth runs on a host screen at your business. Hosting is free, and it is where every pilot starts.{" "}
                <Link href="/host" className="textlink">
                  Host a screen
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactPanel
        id="start"
        tag="30-day Growth pilot"
        title="Start a 30-day Growth pilot."
        lead="Tell us what you sell and where you are, and we will come back with the Anchor we would run first and which nearby counters could carry it."
        include={[
          "Your business name and address",
          "What you sell, so we can screen for non-competing counters",
          "The offer you would want to run",
          "The best number or email to reach you",
        ]}
        subject="30-day Growth pilot"
      />
    </div>
  );
}
