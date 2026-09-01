import type { Metadata } from "next";
import ContactPanel from "@/components/ContactPanel";

export const metadata: Metadata = {
  title: "Host a free screen",
  description:
    "A free 21-inch countertop screen for your store. Show your own specials, join the local screen network, and share in advertising revenue. No paid plan required.",
};

const STEPS = [
  {
    title: "We bring the screen",
    body: "A 21″ countertop display with anti-glare glass. One power cable and your Wi-Fi. Nothing to mount, nothing to configure.",
  },
  {
    title: "Your specials go first",
    body: "Your own promotions run on it. Send us a special whenever you have one and we put it in the loop.",
  },
  {
    title: "It carries nearby offers",
    body: "Offers from local businesses that do not compete with you. We screen every placement against what you sell.",
  },
  {
    title: "You share the upside",
    body: "As paid advertising runs in your area, host stores share in the revenue.",
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
    q: "Do I have to advertise with Uptick to host a screen?",
    a: "No. Hosting a screen and running a Growth offer are two separate things. Plenty of host stores never run an offer of their own, and plenty of Growth customers never host a screen.",
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
        <p className="mono-tag">Door one &middot; Host stores</p>
        <h1 className="page__title">
          A screen on your counter, <em>at no cost.</em>
        </h1>
        <p className="page__lead">
          A free 21-inch countertop display that runs your own specials and carries offers from
          nearby non-competing local businesses. No paid plan required.
        </p>
        <div className="page__acts">
          <a href="#apply" className="btn btn--mint">
            Host a free screen
          </a>
        </div>
      </header>

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
          <h2 id="host-fit" className="band__title" style={{ color: "var(--on-ink-bright)" }}>
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
