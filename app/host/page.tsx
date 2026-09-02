import type { Metadata } from "next";
import ContactPanel from "@/components/ContactPanel";
import PageVisual from "@/components/PageVisual";

export const metadata: Metadata = {
  title: "Host a free screen",
  description:
    "A free 21-inch countertop screen for your store. Promote your own specials and events, and join a local network of non-competing stores. No paid plan required.",
};

const STEPS = [
  {
    title: "We bring the screen",
    body: "A 21″ countertop display with anti-glare glass. One power cable and your Wi-Fi. Nothing to mount, nothing to configure.",
  },
  {
    title: "Your specials go first",
    body: "Your own specials, events and announcements run on it. Send us one whenever you have one and it goes in the loop.",
  },
  {
    title: "You join the local network",
    body: "Your store becomes part of a block of connected counters: the customers of nearby businesses see you, and your screen carries campaigns from businesses that do not compete with you.",
  },
  {
    title: "It can go further",
    body: "Hosting is the foundation for Growth, if you ever want it. And as paid campaigns run in your area, host stores may share in that revenue.",
  },
];

const SUITED = [
  ["Convenience stores & gas stations", "Best fit"],
  ["Cafés & quick-serve food", "High frequency"],
  ["Restaurants with a waiting area", "Long dwell"],
  ["Salons & barbershops", "Captive dwell"],
  ["Gyms & fitness studios", "Recurring visits"],
  ["Other high-traffic counters", "Tell us"],
];

const FAQS = [
  {
    q: "What does it cost?",
    a: "Nothing. The screen, the setup and the support are covered by Uptick. Hosting never requires you to buy Growth or any other paid plan.",
  },
  {
    q: "Do I have to buy anything to host a screen?",
    a: "No. Hosting is free and stands on its own: the screen promotes your business from day one. Advertising and Growth are separate choices you can make later, or never.",
  },
  {
    q: "Will a competitor's offer show up on my counter?",
    a: "No. Placements are screened against what you sell. A café offer does not run in another café.",
  },
  {
    q: "How much work is this for me?",
    a: "A power outlet and Wi-Fi. Send us a special when you have one; we handle the rest.",
  },
];

export default function HostPage() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Host a screen</p>
        <h1 className="page__title">Promote your own business. Join the network.</h1>
        <p className="page__lead">
          A free 21-inch countertop screen that shows your own specials and events first, and makes
          your store part of a local network of non-competing businesses. No paid plan required.
        </p>
        <div className="page__acts">
          <a href="#apply" className="btn btn--mint">
            Host a free screen
          </a>
        </div>
      </header>

      <PageVisual
        name="screen"
        alt="The Uptick screen on a host store's counter, showing the store's own special."
        caption="21″ · Free to host · Your specials first"
      />

      <section className="band band--paper" aria-labelledby="host-steps">
        <div className="band__inner">
          <h2 id="host-steps" className="band__title">
            How hosting works.
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

      <section className="band band--deep" aria-labelledby="host-fit">
        <div className="band__inner">
          <p className="mono-tag">Who this suits</p>
          <h2 id="host-fit" className="band__title">
            Counters people already stand at.
          </h2>
          <div className="ledger">
            {SUITED.map(([name, meta]) => (
              <div key={name} className="ledger__row">
                <span>{name}</span>
                <span className="ledger__meta">{meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="host-faq">
        <div className="band__inner">
          <h2 id="host-faq" className="band__title">
            Host questions, answered.
          </h2>
          {FAQS.map((faq) => (
            <details key={faq.q} className="faq">
              <summary className="faq__q">
                {faq.q}
                <span className="faq__sign" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="faq__a">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <ContactPanel
        id="apply"
        tag="Host application"
        title="See if your counter is a fit."
        lead="We look at foot traffic and at what is already running nearby, then come back to you about installation."
        include={[
          "Your business name and address",
          "What kind of store it is",
          "Roughly how many people come through in a day",
          "The best number or email to reach you",
        ]}
        subject="Host a free screen"
      />
    </div>
  );
}
