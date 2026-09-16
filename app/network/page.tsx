import type { Metadata } from "next";
import Link from "next/link";
import BlockPlan from "@/components/home/BlockPlan";
import { FinaleAct, StoryAct } from "@/components/home/HomeSplit";
import ModesChapter from "@/components/home/ModesChapter";
import ProofChapter from "@/components/home/ProofChapter";
import WorldLayer from "@/components/home/WorldLayer";
import { CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Network",
  description:
    "How the Uptick Local network is built: countertop screens at local businesses that do not compete, linked into one block. What runs on a screen, the rules that keep it fair, and how Host, Advertise, Growth and Uptick Suite sit on top of it.",
};

const LOOP = [
  [
    "Your own specials, first",
    "A host's screen always leads with the host. Specials, events, announcements: send one and it goes in the loop.",
  ],
  [
    "Campaigns from non-competing neighbours",
    "What Advertise puts on the block. Screened against what you sell, so nothing runs in a competitor.",
  ],
  [
    "Approved Growth placements",
    "A planned Growth message may run when a screen is included in the approved four-week program.",
  ],
  [
    "Network notices",
    "Occasionally, Uptick itself: what is new on the block, how to take part.",
  ],
];

const RULES = [
  {
    title: "Non-competing placement",
    body: "Every placement is checked against what the host sells. A café's message never runs in another café. That is the rule that makes hosting safe and advertising credible.",
  },
  {
    title: "Local by design",
    body: "A block is the businesses a customer can walk or drive between in a few minutes. Reach is measured in doors, not impressions.",
  },
  {
    title: "Hosts share in what runs",
    body: "As paid campaigns run on a block, the businesses hosting the screens share in that revenue. The network pays the people who make it possible.",
  },
  {
    title: "Honest counting",
    body: "A screen playing a frame is a play, never a headcount. Growth reports what it can actually observe: signups, claims, redemptions, with the time.",
  },
  {
    title: "Consent, explicitly",
    body: "Member web access does not require SMS. Uptick Local membership texts are optional, off to start and never become merchant marketing consent.",
  },
];

const SYSTEM = [
  {
    name: "Host",
    needs: "Nothing. The screen is free.",
    does: "Promote your own business; join the block; share in campaign revenue.",
    href: "/host",
  },
  {
    name: "Advertise",
    needs: "No screen of your own.",
    does: "Reach nearby customers on the screens around you.",
    href: "/advertise",
  },
  {
    name: "Growth",
    needs: "No host screen required.",
    does: "A negotiated four-week program with planned placements, fulfillment and observed results.",
    href: "/growth",
  },
  {
    name: "Uptick Suite",
    needs: "Nothing on the block. Works with any of the above.",
    does: "Content that gets you chosen when a customer looks you up.",
    href: "/suite",
  },
];

export default function NetworkPage() {
  return (
    <>
      {/*
        The block, told over the live model: your block is already a network,
        Uptick connects it, and this is the screen. A landscape desktop gets
        the pinned scene; a phone gets the same beats from baked frames.
      */}
      <WorldLayer />
      <StoryAct />

      <div className="page page--network">
        <header className="page__head page__head--tight">
          <p className="mono-tag">The Network</p>
          <div className="page__copy">
            <h1 className="page__title">One block. One network.</h1>
            <p className="page__lead">
              Countertop screens at local businesses that do not compete with
              each other, linked so that one business&rsquo;s message reaches
              the customers of the businesses around it. This page is the
              architecture: what a screen is, what runs on it, and the rules
              that keep it fair.
            </p>
            <div className="page__acts">
              <Link href={CTA.host.href} className="btn btn--mint">
                {CTA.host.label}
              </Link>
              <a href={CTA.talk.href} className="btn btn--outline">
                {CTA.talk.label}
              </a>
            </div>
          </div>
          <figure className="page__object board">
            <BlockPlan mode="host" />
            <figcaption className="board__caption">
              <span className="board__key" aria-hidden="true" />
              One street. Every marked counter carries a screen.
            </figcaption>
          </figure>
        </header>

      <section className="band band--paper" aria-labelledby="loop">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">What runs on a screen</p>
            <h2 id="loop" className="band__title">
              The loop, in order.
            </h2>
            <p className="page__lead">
              Every screen plays a short loop. The order is the promise to the
              host: their own business first, then the block.
            </p>
          </header>
          <div className="ledger">
            {LOOP.map(([name, meta], i) => (
              <div key={name} className="ledger__row">
                <span>
                  <span
                    className="step__n"
                    style={{ display: "inline", marginRight: 14 }}
                  >
                    0{i + 1}
                  </span>
                  {name}
                </span>
                <span className="ledger__meta">{meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--deep" aria-labelledby="rules">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">The rules of the block</p>
            <h2 id="rules" className="band__title">
              Five rules. None of them optional.
            </h2>
          </header>
          <div className="steps">
            {RULES.map((rule, i) => (
              <div key={rule.title}>
                <p className="step__n">0{i + 1}</p>
                <h3 className="step__title">{rule.title}</h3>
                <p className="step__body">{rule.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="system">
        <div className="band__inner">
          <header className="band__head">
            <p className="mono-tag">The system</p>
            <h2 id="system" className="band__title">
              Four ways to use it. One block underneath.
            </h2>
            <p className="page__lead">
              Three ways to take part in the physical network, and one
              capability for the half of the job that happens online. None of
              them is a tier of another.
            </p>
          </header>
          <div className="ledger">
            {SYSTEM.map((row) => (
              <Link
                key={row.name}
                href={row.href}
                className="ledger__row ledger__row--link"
              >
                <span>
                  {row.name}
                  <span className="ledger__needs">{row.needs}</span>
                </span>
                <span className="ledger__meta">{row.does} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="partners-note">
        <div className="band__inner">
          <p className="mono-tag">Already operate screens?</p>
          <h2
            id="partners-note"
            className="band__title"
            style={{ marginTop: 16 }}
          >
            Uptick can connect existing inventory to local demand.
          </h2>
          <div className="page__acts">
            <Link href="/partners" className="btn btn--outline">
              Screen network partners
            </Link>
          </div>
        </div>
      </section>
      </div>

      {/* One network, three ways to use it — the same street, lit differently. */}
      <ModesChapter />

      {/* The counter it actually lives on. Real photograph, honest caption. */}
      <ProofChapter />

      <FinaleAct />
    </>
  );
}
