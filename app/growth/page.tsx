import type { Metadata } from "next";
import Link from "next/link";
import ContactPanel from "@/components/ContactPanel";
import DropMessage from "@/components/home/DropMessage";
import GrowthChapter from "@/components/home/GrowthChapter";
import ScreenFace from "@/components/home/ScreenFace";
import PageVisual from "@/components/PageVisual";
import { CTA, GROWTH_EXAMPLE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Uptick Growth",
  description:
    "A negotiated, operator-managed four-week Growth program with planned placements, approved fulfillment and observed results. Screens are optional.",
};

const HOW = [
  {
    title: "Define the Program",
    body: "Agree on the objective, exact member benefit, dates, places, category, negotiated program fee and spend ceiling. A merchant can propose this directly; no separate offer studio is required.",
  },
  {
    title: "Plan four weeks",
    body: "Uptick lays out the planned placements for each week. A plan may use an Uptick screen when it fits, but hosting a screen is not required.",
  },
  {
    title: "Approve Fulfillment",
    body: "Before release, Uptick checks real inventory, the fulfilling location and staff readiness. The business funding Growth and the business fulfilling a benefit may be different.",
  },
  {
    title: "Release the benefit",
    body: "An admitted adult member receives one featured benefit backed by approved supply, with no purchase or member payment required. Web access is standard; SMS is optional.",
  },
  {
    title: "Read Results",
    body: "See planned placements, issued benefits, claims, redemptions, fulfillment problems, recovery and credits. Uptick reports observed activity without inventing reach or sales.",
  },
];

const TRACKED = [
  ["Planned placements", "What was approved for each week"],
  [
    "Issued benefits",
    "Benefits backed by approved supply and released to eligible members",
  ],
  ["Claims", "Issued benefits opened or claimed"],
  ["Redemptions", "Completed fulfillment, with the observed time"],
  [
    "Fulfillment",
    "Readiness, exceptions and recovery when something goes wrong",
  ],
  ["Credits", "Approved adjustments tied to the program"],
  ["By placement", "Which approved placements produced observed activity"],
];

export default function GrowthPage() {
  const g = GROWTH_EXAMPLE;
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Uptick Growth · Four-week managed program</p>
        <div className="page__copy">
          <h1 className="page__title">Local growth, planned and measured.</h1>
          <p className="page__lead">
            Growth is a negotiated four-week program managed with Uptick. The
            approved record covers the program, weekly placements, fulfillment
            and results. Screens can be part of the plan, but hosting one is
            optional.
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
        alt="Across the street: several local businesses that could take part in an approved Growth placement or fulfill a member benefit."
        caption="Four weeks · Planned placements · Screens optional"
      />

      <section
        id="how"
        className="band band--paper"
        aria-labelledby="growth-how"
      >
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">Program · Fulfillment · Results</p>
            <h2 id="growth-how" className="band__title">
              One approved program, carried through four weeks.
            </h2>
            <p className="page__lead">
              The fee and commitments are negotiated once at the program level.
              Amendments are proposed and approved before they change an
              existing obligation.
            </p>
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

      <section className="band band--light" aria-labelledby="growth-protection">
        <div className="band__inner pair">
          <div>
            <p className="mono-tag">Bounded protection</p>
            <h2
              id="growth-protection"
              className="band__title"
              style={{ marginTop: 16 }}
            >
              Clear scope, dates and exceptions.
            </h2>
            <p className="page__lead" style={{ marginTop: 20 }}>
              If paid featured protection is included, the approved program
              states its dates, category and places. Its radius can never exceed
              the configured maximum of 1.5 straight-line miles. Any exception
              and termination rule is explicit.
            </p>
            <p className="step__body" style={{ marginTop: 28 }}>
              Protection does not remove organic supplier participation or
              recovery fulfillment. A supplier can participate independently
              without buying Growth and without paying a Growth fee.
            </p>
          </div>
          <div className="phone phone--drop" style={{ justifySelf: "center" }}>
            <DropMessage large />
          </div>
        </div>
      </section>

      <section className="band band--deep" aria-labelledby="growth-access">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">Member access</p>
            <h2 id="growth-access" className="band__title">
              The benefit does not depend on a marketing list.
            </h2>
            <p className="page__lead">
              Members use a private web experience. SMS is an optional Uptick
              Local membership channel and is never merchant marketing consent.
              Replying STOP ends texts while preserving membership and already
              issued benefits.
            </p>
          </header>
          <div className="ledger">
            <div className="ledger__row">
              <span>Web access</span>
              <span className="ledger__meta">
                Available without SMS consent.
              </span>
            </div>
            <div className="ledger__row">
              <span>Optional Uptick SMS</span>
              <span className="ledger__meta">
                Unchecked to start. Message frequency varies.
              </span>
            </div>
            <div className="ledger__row">
              <span>No merchant list</span>
              <span className="ledger__meta">
                A fulfiller does not receive Uptick membership consent or member
                history.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="growth-measure">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">What Uptick reports</p>
            <h2 id="growth-measure" className="band__title">
              Observed execution, not estimated audiences.
            </h2>
            <p className="page__lead">
              A screen play remains a play, not a headcount. Program results
              distinguish planned work, backed benefits and completed
              fulfillment.
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

          <div
            className="split"
            style={{ marginTop: "clamp(48px, 7vh, 80px)" }}
          >
            <div>
              <p className="mono-tag mono-tag--ink">Uptick manages</p>
              <ul className="plainlist plainlist--ink">
                <li>The approved four-week program</li>
                <li>Weekly placement planning</li>
                <li>Fulfillment checks and member access</li>
                <li>Observed results and approved credits</li>
              </ul>
            </div>
            <div>
              <p className="mono-tag mono-tag--ink">You approve</p>
              <p className="split__big">
                Scope and fee.
                <br />
                Benefit and ceiling.
              </p>
              <p className="step__body" style={{ marginTop: 22 }}>
                Hosting is a separate, optional way to join the screen network.{" "}
                <Link href="/host" className="textlink">
                  About hosting
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The worked example, end to end: benefit, access, redemption, result. */}
      <GrowthChapter />

      <ContactPanel
        id="start"
        tag="Four-week Growth program"
        title="Plan a four-week Growth program."
        lead="Tell us the outcome you want and where. Uptick will return a concrete program proposal with weekly placements, fulfillment requirements, negotiated fee and spend ceiling for review."
        include={[
          "Your business name and address",
          "The outcome and category you want to plan around",
          "The benefit, dates and places you want considered",
          "The best number or email to reach you",
        ]}
        subject="Four-week Growth program"
      />
    </div>
  );
}
