import type { Metadata } from "next";
import Image from "next/image";
import HostApplicationForm from "@/components/HostApplicationForm";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import install from "@/public/uptick-install.jpg";

export const metadata: Metadata = {
  title: "For Locations",
  description:
    "A free 21-inch screen that works for your business. We install it, load it with your promotions, and sell the remaining airtime to neighborhood advertisers.",
};

const STEPS = [
  {
    title: "We install it, free",
    body: "A 21″ portrait screen, mounted where your customers wait, pay, or browse. Hardware, setup, and support on us.",
  },
  {
    title: "It promotes you first",
    body: "Your specials, hours, events, and QR offers run in the loop every day. Think of it as your best sign, updated whenever you want.",
  },
  {
    title: "It carries local ads",
    body: "Neighborhood advertisers buy the remaining airtime through Uptick — screened so nothing competes with you.",
  },
  {
    title: "You share the upside",
    body: "Ad revenue opportunity on your screen, plus cross-promotion of your business on other screens in the network.",
  },
];

const TYPES = [
  ["Restaurants & Cafés", "DWELL 12–40 MIN"],
  ["Convenience & Gas", "HIGH FREQUENCY"],
  ["Gyms & Fitness Studios", "RECURRING VISITS"],
  ["Salons & Barbershops", "CAPTIVE DWELL"],
  ["Family & Kids Venues", "PARENT AUDIENCE"],
  ["Health & Wellness", "WAITING ROOMS"],
  ["Automotive", "SERVICE LOBBIES"],
  ["Other High-Traffic Spots", "TELL US"],
];

const FAQS = [
  {
    q: "What does the screen cost?",
    a: "Nothing. Hardware, installation, content updates, and support are covered by Uptick. We earn by selling airtime to local advertisers.",
  },
  {
    q: "What plays on it?",
    a: "Your promotions lead the loop, followed by vetted neighborhood advertisers. Nothing that competes with your business, ever.",
  },
  {
    q: "How much work is it for me?",
    a: "A power outlet and Wi-Fi. Send us a special when you have one; we design the slide and keep the loop fresh.",
  },
  {
    q: "Do I earn from the ads?",
    a: "Yes — as advertising sells in your area, hosts share in the revenue. Your screen also gets cross-promoted on other screens nearby.",
  },
];

export default function LocationsPage() {
  return (
    <>
      <section className="page-dark">
        <div className="field-lines" aria-hidden="true" />
        <div className="split">
          <div className="u-rise">
            <div className="kicker">FOR LOCATIONS</div>
            <h1 className="page-title">A free 21-inch screen that works for your business.</h1>
            <p className="page-lead">
              We install it, load it with your promotions, and sell the remaining airtime to
              neighborhood advertisers. No cost, no contract gymnastics, no work on your end.
            </p>
            <a href="#apply" className="btn btn--amber">
              See If My Location Is a Fit<span aria-hidden="true">&#8594;</span>
            </a>
          </div>

          <div className="shot__wrap u-fade">
            <div className="shot__frame shot__frame--short" style={{ width: "min(100%, 470px)" }}>
              <Parallax amount={0.05} className="shot__plane">
                <Image
                  src={install}
                  alt="The free Uptick counter screen inside a host store"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 470px"
                  className="shot__img shot__img--host"
                />
              </Parallax>
              <div className="shot__scrim shot__scrim--short" aria-hidden="true" />
              <div className="shot__badge">
                <span className="mono-meta">YOUR COUNTER. OUR HARDWARE.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-paper band">
        <Reveal as="h2" className="section-title">
          How hosting works
        </Reveal>
        <div className="steps">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} className="step">
              <div className="step__n">0{i + 1}</div>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__body">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-paper band--tail">
        <Reveal className="eyebrow" style={{ marginBottom: 18 }}>
          <span className="kicker kicker--deep">WHO WE&#8217;RE LOOKING FOR</span>
        </Reveal>
        <Reveal as="h2" className="section-title" style={{ marginBottom: 36, maxWidth: 620 }}>
          High-traffic neighborhood places
        </Reveal>
        <div className="typegrid">
          {TYPES.map(([name, meta]) => (
            <Reveal key={name} className="typerow">
              <span className="typerow__name">{name}</span>
              <span className="typerow__meta">{meta}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-paper band--tail">
        <div className="faqgrid">
          <Reveal as="h2" className="faqgrid__title">
            Host questions,
            <br />
            answered
          </Reveal>
          <Reveal className="faqlist">
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
          </Reveal>
        </div>
      </section>

      <HostApplicationForm />
    </>
  );
}
