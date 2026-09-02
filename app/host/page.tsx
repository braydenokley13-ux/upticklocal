import type { Metadata } from "next";
import ContactPanel from "@/components/ContactPanel";
import PageVisual from "@/components/PageVisual";
import ScreenFace from "@/components/home/ScreenFace";
import { CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Host a free screen",
  description:
    "A free 21-inch countertop screen for your business. Promote your own specials and events first, join a local network of non-competing businesses, and share in the campaign revenue that runs on your block.",
};

const GIVES = [
  {
    title: "We bring the screen",
    body: "A 21″ countertop display with anti-glare glass. One power cable and your Wi-Fi. Nothing to mount, nothing to configure, nothing to pay.",
  },
  {
    title: "Your specials go first",
    body: "Your own specials, events and announcements lead the loop. Send us one whenever you have one; it is on the screen the same day.",
  },
  {
    title: "You join the block",
    body: "Your counter becomes part of a network of non-competing businesses. Their customers see you; your screen carries only what does not compete with you.",
  },
  {
    title: "You share in what runs",
    body: "As paid campaigns run in your area, host businesses share in that revenue. Hosting has value on day one, and it is the foundation if you ever want Growth.",
  },
];

const PLACES = ["Convenience stores & gas stations", "Cafés & quick-serve", "Restaurants with a wait", "Salons & barbershops", "Gyms & studios", "Any busy counter"];

const FAQS = [
  {
    q: "What does it cost?",
    a: "Nothing. The screen, the setup and the support are covered by Uptick. Hosting never requires you to buy Growth or anything else.",
  },
  {
    q: "Will a competitor's message show up on my counter?",
    a: "No. Every placement is screened against what you sell. A café offer does not run in another café.",
  },
  {
    q: "How much work is this for me?",
    a: "A power outlet and Wi-Fi. Send us a special when you have one; we handle the rest.",
  },
  {
    q: "What if I want it gone?",
    a: "Tell us. We collect the screen. There is no term and no penalty.",
  },
];

export default function HostPage() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Host a screen · Free</p>
        <div className="page__copy">
          <h1 className="page__title">Promote your own business. Join the network.</h1>
          <p className="page__lead">
            A free 21-inch countertop screen that shows your own specials and events first, makes your counter part of a local
            network of non-competing businesses, and shares in the campaigns that run on it. No paid plan, ever.
          </p>
          <div className="page__acts">
            <a href="#apply" className="btn btn--mint">
              {CTA.host.label}
            </a>
          </div>
        </div>
        <div className="page__object">
          <div className="unit">
            <div className="unit__panel" aria-hidden="true">
              <ScreenFace way="host" />
            </div>
            <div className="unit__foot" aria-hidden="true" />
          </div>
        </div>
      </header>

      <PageVisual
        name="screen"
        alt="The Uptick screen on a host store's counter, showing the store's own special."
        caption="21″ · Free to host · Your specials first"
      />

      <section className="band band--paper" aria-labelledby="host-gives">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">What hosting gives you</p>
            <h2 id="host-gives" className="band__title">
              A screen that works for you before it works for anyone else.
            </h2>
          </header>
          <div className="steps">
            {GIVES.map((step, i) => (
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
          <header className="band__head">
            <p className="mono-tag">Who this suits</p>
            <h2 id="host-fit" className="band__title">
              Counters people already stand at.
            </h2>
            <p className="page__lead">
              High traffic, a natural pause, and eye level. If people wait at your counter for even thirty seconds, the screen
              has a job.
            </p>
          </header>
          <ul className="places" aria-label="Kinds of counter">
            {PLACES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="host-faq">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">Questions</p>
            <h2 id="host-faq" className="band__title">
              The four people ask first.
            </h2>
          </header>
          {FAQS.map((faq, i) => (
            <details key={faq.q} className="faq">
              <summary className="faq__q">
                <span className="faq__n">0{i + 1}</span>
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
          "What kind of business it is",
          "Roughly how many people come through in a day",
          "The best number or email to reach you",
        ]}
        subject="Host a free screen"
      />
    </div>
  );
}
