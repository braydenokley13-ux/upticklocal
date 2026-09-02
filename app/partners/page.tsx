import type { Metadata } from "next";
import ContactPanel from "@/components/ContactPanel";

export const metadata: Metadata = {
  title: "Screen network partners",
  description:
    "Already operate digital screens in retail, fitness or hospitality? Uptick can connect your inventory to local offer demand.",
};

const POINTS = [
  {
    title: "Your screens stay yours",
    body: "Keep your hardware, your locations and your operations. Nothing gets rebranded.",
  },
  {
    title: "We bring local demand",
    body: "Offers from businesses near your locations, screened so nothing competes with the store the screen sits in.",
  },
  {
    title: "Activity, reported per screen",
    body: "Plays, and for Growth offers the signups, claims and redemptions attributable to each placement. The same counting discipline we hold ourselves to everywhere else.",
  },
];

export default function PartnersPage() {
  return (
    <div className="page">
      <header className="page__head page__head--solo">
        <p className="mono-tag">Screen network partners</p>
        <div className="page__copy">
          <h1 className="page__title">Already operate screens? Let&rsquo;s talk.</h1>
          <p className="page__lead">
            If you run digital screens in retail, fitness or hospitality, Uptick can connect that inventory to local demand in
            the same neighborhoods: campaigns from nearby businesses and Growth Anchors, screened against what each host sells.
          </p>
        </div>
      </header>

      <section className="band band--paper" aria-labelledby="partner-points">
        <div className="band__inner">
          <h2 id="partner-points" className="band__title">
            How a partnership works.
          </h2>
          <div className="steps">
            {POINTS.map((point, i) => (
              <div key={point.title}>
                <p className="step__n">0{i + 1}</p>
                <h3 className="step__title">{point.title}</h3>
                <p className="step__body">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactPanel
        id="partnerships"
        tag="Partnerships"
        title="Tell us about your inventory."
        lead="Where the screens are, what they run today, and what you are trying to fill."
        include={[
          "How many screens, and where",
          "The kinds of venues they sit in",
          "What runs on them today",
          "The best number or email to reach you",
        ]}
        subject="Screen network partnership"
      />
    </div>
  );
}
