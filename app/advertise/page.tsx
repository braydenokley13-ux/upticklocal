import type { Metadata } from "next";
import Link from "next/link";
import ContactPanel from "@/components/ContactPanel";
import PageVisual from "@/components/PageVisual";
import { CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Advertise locally",
  description:
    "Reach nearby customers across Uptick screen locations. Promote a service, an opening, an event or a special on screens at participating non-competing local stores. No screen of your own needed.",
};

const STEPS = [
  {
    title: "Choose what to promote",
    body: "A service, a grand opening, a new location, an event, catering, a seasonal special, a product. Whatever the campaign is, it runs as one clean frame in the loop.",
  },
  {
    title: "Choose where",
    body: "Participating Uptick locations near you. Every placement is screened against what the host store sells, so nothing runs in a competitor.",
  },
  {
    title: "It runs on the block",
    body: "Your frame plays on the counter screens of nearby stores, at eye level, in the places your customers already go. No screen of your own is required.",
  },
  {
    title: "You see where it ran",
    body: "Placements and play counts, by location, in plain language. Plays are not people: Uptick does not turn them into impressions.",
  },
];

const CAMPAIGNS = [
  ["A grand opening", "Announce it on the block before the doors open"],
  ["A service", "Catering, repairs, classes, delivery"],
  ["An event", "Tastings, launches, live nights, markets"],
  ["A seasonal special", "Holiday hours, menus, offers"],
  ["A new location", "Tell the neighbourhood you are here"],
  ["An offer", "When you want one — and Growth if you want it measured"],
];

export default function AdvertisePage() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Advertise &middot; Reach the network</p>
        <h1 className="page__title">Reach nearby customers across Uptick locations.</h1>
        <p className="page__lead">
          Advertise on screens at participating non-competing local stores around you. Flexible in
          what you promote, precise in where it runs, and no screen of your own required.
        </p>
        <div className="page__acts">
          <a href="#plan" className="btn btn--mint">
            {CTA.advertise.label}
          </a>
          <Link href="/how-it-works" className="btn btn--outline">
            See how it works
          </Link>
        </div>
      </header>

      <PageVisual
        name="connect"
        alt="The block from above: a campaign leaves one business and the counter screens at the nearby stores switch on."
        caption="Your campaign · Nearby screens · No screen of your own"
      />

      <section className="band band--paper" aria-labelledby="advertise-steps">
        <div className="band__inner">
          <h2 id="advertise-steps" className="band__title">
            How advertising works.
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

      <section className="band band--deep" aria-labelledby="advertise-what">
        <div className="band__inner">
          <p className="mono-tag">What a campaign can be</p>
          <h2 id="advertise-what" className="band__title" style={{ color: "var(--on-marine)" }}>
            Whatever the neighbourhood should know.
          </h2>
          <div className="ledger">
            {CAMPAIGNS.map(([name, meta]) => (
              <div key={name} className="ledger__row">
                <span>{name}</span>
                <span className="ledger__meta">{meta}</span>
              </div>
            ))}
          </div>
          <p className="page__lead" style={{ marginTop: 34 }}>
            Want the campaign measured all the way to a visit? That is Growth: an offer customers
            claim by text and redeem in person. It runs on a host screen of your own.
          </p>
          <div className="page__acts">
            <Link href={CTA.growth.href} className="btn btn--outline">
              About Uptick Growth
            </Link>
          </div>
        </div>
      </section>

      <ContactPanel
        id="plan"
        tag="Local campaign"
        title="Plan a local campaign."
        lead="Tell us what you want the neighbourhood to know and roughly where, and we will come back with the Uptick locations nearby that could carry it."
        include={[
          "Your business name and address",
          "What you want to promote",
          "Roughly how far around you it should run",
          "The best number or email to reach you",
        ]}
        subject="Local campaign"
      />
    </div>
  );
}
