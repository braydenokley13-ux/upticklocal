import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Screen Network Partners",
  description:
    "Already operate digital screens? Uptick plugs your inventory into our local demand and audience networks, and sells the advertising.",
};

const POINTS = [
  {
    title: "Your screens stay yours",
    body: "Keep your hardware, your locations, and your operations. Nothing gets rebranded.",
  },
  {
    title: "We bring the demand",
    body: "Your inventory joins our audience networks and gets sold by our local sales engine.",
  },
  {
    title: "Revenue, shared",
    body: "Transparent per-screen reporting and a straightforward split on every campaign.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <section className="partners__head">
        <div className="field-lines" aria-hidden="true" />
        <div className="partners__copy u-rise">
          <div className="kicker">SCREEN NETWORK PARTNERS</div>
          <h1 className="partners__title">
            Already operate screens? We&#8217;ll sell the advertising.
          </h1>
          <p className="partners__lead">
            If you run digital screens in retail, fitness, or hospitality, Uptick plugs your
            inventory into our local demand and audience networks.
          </p>
          <a href="mailto:iwhite@upticklocal.com" className="btn btn--amber">
            Talk to Partnerships<span aria-hidden="true">&#8594;</span>
          </a>
        </div>
      </section>

      <section className="page-paper band">
        <div className="steps steps--wide">
          {POINTS.map((point, i) => (
            <Reveal key={point.title} className="step">
              <div className="step__n">0{i + 1}</div>
              <h3 className="step__title">{point.title}</h3>
              <p className="step__body">{point.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
