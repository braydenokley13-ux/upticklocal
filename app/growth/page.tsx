import type { Metadata } from "next";
import Link from "next/link";
import ContactPanel from "@/components/ContactPanel";
import { CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Promote your business",
  description:
    "Uptick Growth puts your offer on screens at up to five participating non-competing local stores. Customers scan, claim by text, visit, and redeem on their phone.",
};

const STEPS = [
  {
    title: "Choose the offer",
    body: "One clear reason to come in — a dollar amount off, a free item with purchase, a first-visit discount. You choose it and you provide the reward.",
  },
  {
    title: "It appears at nearby stores",
    body: "Uptick places the offer on screens at up to five participating non-competing local stores. A café offer never runs in another café.",
  },
  {
    title: "A customer scans",
    body: "They enter their phone number and the claim link arrives by text. Opting into future offers from you is a separate, optional box.",
  },
  {
    title: "They visit and redeem",
    body: "The customer opens the claim at your counter, taps redeem, and shows the confirmed screen to your staff. No POS integration, no code entry.",
  },
  {
    title: "You follow up",
    body: "Customers who opted in can receive future offers by text from your business — another reason to come back.",
  },
  {
    title: "You get a simple report",
    body: "Signups, claims, redemptions and repeat offer activity, by placement, in plain language.",
  },
];

const TRACKED = [
  ["Signups", "Numbers entered to receive a claim link"],
  ["Claims", "Claim links delivered and opened"],
  ["Redemptions", "Claims redeemed in your store, with time"],
  ["SMS consent", "Customers who separately opted into your text list"],
  ["Follow-up activity", "Sends, clicks, claims and redemptions on later offers"],
  ["Placement activity", "Which host stores the activity came from"],
];

export default function GrowthPage() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Door two &middot; Uptick Growth</p>
        <h1 className="page__title">
          Your offer, <em>five nearby counters.</em>
        </h1>
        <p className="page__lead">
          Uptick distributes your offer through screens at participating non-competing local stores,
          delivers the claim to the customer by text, and tracks what actually happens next.
        </p>
        <div className="page__acts">
          <a href="#start" className="btn btn--mint">
            {CTA.growth.label}
          </a>
          <Link href="/how-it-works" className="btn btn--outline">
            See how it works
          </Link>
        </div>
      </header>

      <section className="band band--paper" aria-labelledby="growth-steps">
        <div className="band__inner">
          <h2 id="growth-steps" className="band__title">
            Six steps, and two of them are yours.
          </h2>
          <div className="steps">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <p className="step__n">0{i + 1}</p>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="growth-measure">
        <div className="band__inner">
          <p className="mono-tag">What Uptick can tell you</p>
          <h2 id="growth-measure" className="band__title" style={{ color: "var(--on-ink-bright)" }}>
            Real activity, not estimated audiences.
          </h2>
          <div className="ledger">
            {TRACKED.map(([name, meta]) => (
              <div key={name} className="ledger__row">
                <span>{name}</span>
                <span className="ledger__meta">{meta}</span>
              </div>
            ))}
          </div>
          <p className="page__lead" style={{ marginTop: 34 }}>
            Uptick reports what it can actually observe. A screen playing your offer is a play
            count, not a headcount — we do not convert plays into impressions, and we do not claim
            to know a customer&rsquo;s total spending or every return visit.
          </p>
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="growth-split">
        <div className="band__inner">
          <h2 id="growth-split" className="band__title">
            You don&rsquo;t need another system.
          </h2>
          <div className="split-responsibility" style={{ paddingTop: 0 }}>
            <div>
              <p className="mono-tag mono-tag--ink">Uptick handles</p>
              <ul className="plainlist plainlist--ink">
                <li>Screens</li>
                <li>QR + claim flow</li>
                <li>Customer texts</li>
                <li>Tracking</li>
                <li>Reporting</li>
              </ul>
            </div>
            <div>
              <p className="mono-tag mono-tag--ink">Your business handles</p>
              <p className="responsibility__yours">
                Choose the offer.
                <br />
                Provide the reward.
              </p>
              <p className="step__body" style={{ marginTop: 26 }}>
                Growth does not require you to host a screen. The two are independent.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactPanel
        id="start"
        tag="30-day Growth pilot"
        title="Start a 30-day Growth pilot."
        lead="Tell us what you sell and where you are, and we will come back with which nearby stores could carry your offer."
        include={[
          "Your business name and address",
          "What you sell, so we can screen for non-competing stores",
          "The offer you would want to run",
          "The best number or email to reach you",
        ]}
        subject="30-day Growth pilot"
      />
    </div>
  );
}
