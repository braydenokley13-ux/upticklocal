import type { Metadata } from "next";
import Link from "next/link";
import StillFrame from "@/components/home/StillFrame";
import { CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Create an offer, Uptick distributes it to screens at nearby non-competing local stores, the customer claims it by text, visits, and redeems on their phone.",
};

const SEQUENCE = [
  {
    n: "01",
    title: "Create the offer",
    body: "A business decides on one clear reason to come in, and what the reward is.",
  },
  {
    n: "02",
    title: "It appears at nearby stores",
    body: "Uptick places it on screens at up to five participating non-competing local stores.",
  },
  {
    n: "03",
    title: "A customer scans",
    body: "They enter a phone number and the claim link arrives by text. Promotional texts are a separate, optional choice.",
  },
  {
    n: "04",
    title: "They visit",
    body: "The claim names the business and the address, and stays on the customer's phone until they use it.",
  },
  {
    n: "05",
    title: "They redeem",
    body: "Open the claim, tap redeem, show the confirmed screen to staff. No POS integration, no code entry, no new cashier software.",
  },
  {
    n: "06",
    title: "They come back",
    body: "Customers who opted in can receive future offers by text from that business.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">How it works</p>
        <h1 className="page__title">
          The block does the distribution.
        </h1>
        <p className="page__lead">
          Uptick is a neighbourhood screen and promotion network. One business&rsquo;s offer travels
          to the counters of nearby stores that do not compete with it, and turns into something the
          customer can carry.
        </p>
      </header>

      <section className="band band--deep" aria-label="The block">
        <div className="band__inner">
          <StillFrame name="model" alt="The block as a model: two rows of local storefronts, five of them carrying Uptick screens." />
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="sequence">
        <div className="band__inner">
          <h2 id="sequence" className="band__title">
            Offer to visit, in six steps.
          </h2>
          <div className="ledger">
            {SEQUENCE.map((step) => (
              <div key={step.n} className="sequence__row">
                <span className="step__n">{step.n}</span>
                <div>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__body">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="two-doors">
        <div className="band__inner">
          <p className="mono-tag">Two doors, one network</p>
          <h2 id="two-doors" className="band__title">
            Hosting and Growth are independent.
          </h2>
          <p className="page__lead">
            A store can host a free screen without ever buying anything. A business can run a Growth
            offer without ever installing a screen. Some do both; neither requires the other.
          </p>
          <div className="page__acts">
            <Link href={CTA.growth.href} className="btn btn--mint">
              {CTA.growth.label}
            </Link>
            <Link href={CTA.host.href} className="btn btn--outline">
              {CTA.host.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
