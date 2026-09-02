import type { Metadata } from "next";
import ContactPanel from "@/components/ContactPanel";
import { CTA, SUITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Uptick Suite",
  description:
    "Uptick Suite is professional content for local businesses: website copy, blogs and articles, social, Google Business posts, email and newsletters, ad creative and copy, written to a professional standard and repurposed across every surface a customer checks.",
};

const HOW = [
  {
    title: "A conversation",
    body: "We learn how you talk about your work, what customers ask before they book, and what you are tired of explaining.",
  },
  {
    title: "A plan",
    body: "Which surfaces matter for your business, in what order. A dentist and a roofer do not need the same six things.",
  },
  {
    title: "Content, monthly, in one voice",
    body: "Written by people, to a professional standard, and repurposed so nothing is written twice or sounds like someone else.",
  },
  {
    title: "You approve. We publish or hand off.",
    body: "Your site, your profile, your list, your feeds. We can post directly, or deliver ready to paste.",
  },
];

export default function SuitePage() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">{SUITE.tag} · Content</p>
        <div className="page__copy">
          <h1 className="page__title">Content that gets you chosen.</h1>
          <p className="page__lead">
            The network gets you noticed. Then the customer looks you up, reads your site, checks your reviews and your posts, and
            decides. Uptick Suite is everything they find, written to a professional standard.
          </p>
          <div className="page__acts">
            <a href="#ask" className="btn btn--mint">
              {CTA.suite.label}
            </a>
          </div>
        </div>
        <div className="page__object">
          <ol className="stack">
            {SUITE.surfaces.slice(0, 3).map((s) => (
              <li key={s.id} className="surface surface--dark" data-id={s.id}>
                <span className="surface__channel">{s.channel}</span>
                <span className="surface__title">{s.title}</span>
                <span className="surface__body">{s.body}</span>
              </li>
            ))}
          </ol>
          <p className="stack__note">One conversation with {SUITE.source.business}, three of the six surfaces it became.</p>
        </div>
      </header>

      <section className="band band--paper" aria-labelledby="suite-includes">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">What Suite includes</p>
            <h2 id="suite-includes" className="band__title">
              Everything a customer reads before they choose.
            </h2>
            <p className="page__lead">
              The promise is content: clear, credible, in your voice, and kept current. Not a website build, though we can help
              with that too.
            </p>
          </header>
          <div className="ledger">
            {SUITE.services.map(([name, meta]) => (
              <div key={name} className="ledger__row">
                <span>{name}</span>
                <span className="ledger__meta">{meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--light" aria-labelledby="suite-how">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">How it works</p>
            <h2 id="suite-how" className="band__title">
              One voice. Every surface. Nothing written twice.
            </h2>
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

      <section className="band band--deep" aria-labelledby="suite-who">
        <div className="band__inner split">
          <div>
            <p className="mono-tag">Who it is for</p>
            <p className="statement" style={{ marginTop: 16 }}>
              Expert local businesses whose customers do their homework first.
            </p>
            <p className="page__lead" style={{ marginTop: 22 }}>
              {SUITE.industries}
            </p>
          </div>
          <div>
            <p className="mono-tag">The standard</p>
            <p className="statement" style={{ marginTop: 16 }}>
              {SUITE.credibility.line}
            </p>
            <p className="page__lead" style={{ marginTop: 22 }}>
              {SUITE.credibility.who} Uptick Suite is produced with JBCI, the content studio behind it.
            </p>
            <p className="page__lead" style={{ marginTop: 18 }}>
              {SUITE.website}
            </p>
          </div>
        </div>
      </section>

      <ContactPanel
        id="ask"
        tag="Uptick Suite"
        title="Tell us what customers find when they look you up."
        lead="Send the address of your website and any profiles you keep. We will come back with what we would write first, and why."
        include={[
          "Your business name and what you do",
          "Your website, and where else you post",
          "What customers ask you most",
          "The best number or email to reach you",
        ]}
        subject="Uptick Suite"
      />
    </div>
  );
}
