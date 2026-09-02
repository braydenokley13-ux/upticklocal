import type { Metadata } from "next";
import Link from "next/link";
import BlockPlan from "@/components/home/BlockPlan";
import ContactPanel from "@/components/ContactPanel";
import PageVisual from "@/components/PageVisual";
import { CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Advertise locally",
  description:
    "Reach nearby customers across Uptick screen locations. Promote a service, an opening, an event, a product or a special on the counter screens of non-competing local businesses near you. Uptick designs the creative with you. No screen of your own needed.",
};

const STEPS = [
  {
    title: "Choose what to promote",
    body: "A service, a grand opening, a new location, an event, catering, a seasonal special, a product. One clear message for one clean frame.",
  },
  {
    title: "We design it with you",
    body: "You do not need a designer or an agency. Tell us the message; Uptick produces the creative, in your voice, to the screen's proportions.",
  },
  {
    title: "Choose where",
    body: "Participating Uptick locations near you. Every placement is screened against what the host sells, so nothing runs in a competitor.",
  },
  {
    title: "It runs on the block",
    body: "Your frame plays at eye level on the counters your customers already stand at. No screen of your own is required.",
  },
  {
    title: "You see where it ran",
    body: "Placements and play counts, by location, in plain language. Plays are not people, and Uptick never turns them into impressions.",
  },
];

const CAMPAIGNS = [
  ["A grand opening", "Announce it on the block before the doors open."],
  ["A service", "Catering, repairs, classes, delivery, consultations."],
  ["An event", "Tastings, launches, live nights, markets, open houses."],
  ["A seasonal special", "Holiday hours, menus, limited runs."],
  ["A new location", "Tell the neighborhood you are here."],
  ["A product", "The thing you want people to walk in and ask for."],
];

export default function AdvertisePage() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Advertise · No screen needed</p>
        <div className="page__copy">
          <h1 className="page__title">Reach nearby customers across Uptick locations.</h1>
          <p className="page__lead">
            Your message on the counter screens of non-competing local businesses around you. Flexible in what you promote,
            precise in where it runs, designed with you, and no screen of your own required.
          </p>
          <div className="page__acts">
            <a href="#plan" className="btn btn--mint">
              {CTA.advertise.label}
            </a>
            <Link href="/network" className="btn btn--outline">
              How the network works
            </Link>
          </div>
        </div>
        <figure className="page__object board">
          <BlockPlan mode="advertise" />
          <figcaption className="board__caption">
            <span className="board__key" aria-hidden="true" />
            Your campaign runs on the screens around you.
          </figcaption>
        </figure>
      </header>

      <PageVisual
        name="connect"
        alt="The block from above: a campaign leaves one business and the counter screens at the nearby stores switch on."
        caption="Your campaign · Nearby screens · No screen of your own"
      />

      <section className="band band--paper" aria-labelledby="advertise-steps">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">How advertising works</p>
            <h2 id="advertise-steps" className="band__title">
              Five steps, and we take three of them.
            </h2>
          </header>
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

      <section className="band band--light" aria-labelledby="advertise-what">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">What a campaign can be</p>
            <h2 id="advertise-what" className="band__title">
              Whatever the neighborhood should know.
            </h2>
            <p className="page__lead">
              Want an offer measured all the way to the visit, with customers claiming it on their phone? That is Growth, and it
              runs on a host screen at your own business.{" "}
              <Link href="/growth" className="textlink">
                About Growth
              </Link>
            </p>
          </header>
          <div className="ledger">
            {CAMPAIGNS.map(([name, meta]) => (
              <div key={name} className="ledger__row">
                <span>{name}</span>
                <span className="ledger__meta">{meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactPanel
        id="plan"
        tag="Local campaign"
        title="Plan a local campaign."
        lead="Tell us what you want the neighborhood to know and roughly where, and we will come back with the Uptick locations nearby that could carry it, and a first draft of the creative."
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
