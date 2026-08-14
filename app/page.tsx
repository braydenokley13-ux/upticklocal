import Image from "next/image";
import Link from "next/link";
import NetworkScene from "@/components/NetworkScene";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import RevealLink from "@/components/RevealLink";
import { NETWORK_LIST } from "@/lib/networks";
import install from "@/public/uptick-install.jpg";

const HOST_POINTS = [
  "Promote your business, all day",
  "Open an advertising revenue opportunity",
  "Join the Uptick network",
];

const ADVERTISER_POINTS = [
  "Choose your audience",
  "Choose your geography",
  "Reach customers where they already go",
];

export default function HomePage() {
  return (
    <>
      {/* 1 — HERO. One idea, two doors, one real screen in a real store. */}
      <section className="hero">
        <div className="field-lines" aria-hidden="true" />
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__copy u-rise">
            <div className="eyebrow">
              <span className="kicker">Local media network</span>
            </div>
            <h1 className="hero__title">
              The neighborhood
              <br />
              is the network.
            </h1>
            <p className="hero__sub">
              Uptick puts free digital screens inside local businesses — and connects them to
              advertisers who want the people standing right there.
            </p>

            <div className="doors">
              <Link href="/locations" className="door door--primary">
                <span>
                  <span className="door__kicker">I HAVE A LOCATION</span>
                  <span className="door__label">Get a Free Screen</span>
                </span>
                <span className="door__arrow" aria-hidden="true">
                  &#8594;
                </span>
              </Link>
              <Link href="/advertisers" className="door door--ghost">
                <span>
                  <span className="door__kicker">I WANT TO ADVERTISE</span>
                  <span className="door__label">Reach Local Customers</span>
                </span>
                <span className="door__arrow" aria-hidden="true">
                  &#8594;
                </span>
              </Link>
            </div>
          </div>

          <div className="shot__wrap u-fade">
            <figure className="shot">
              <div className="shot__frame">
                <Parallax amount={0.05} className="shot__plane">
                  <Image
                    src={install}
                    alt="An Uptick screen installed on the counter of a neighborhood convenience store"
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 470px"
                    className="shot__img shot__img--hero"
                  />
                </Parallax>
                <div className="shot__scrim" aria-hidden="true" />
                <div className="shot__badge">
                  <span className="dot-live" aria-hidden="true" />
                  <span className="mono-meta">LIVE INSTALL &mdash; NEIGHBORHOOD MARKET</span>
                </div>
              </div>
              <figcaption className="shot__meta">
                <span>UNIT 014 &middot; COUNTER MOUNT</span>
                <span>21&#8243; PORTRAIT</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 2 — TWO SIDES. Both doors again, this time with just enough substance. */}
      <section className="two-sides">
        <div className="two-sides__grid">
          <Reveal className="side">
            <div className="kicker kicker--deep">FOR LOCATIONS</div>
            <h2 className="side__title">A free 21-inch screen that works for your business.</h2>
            <div className="pointlist">
              {HOST_POINTS.map((point, i) => (
                <div key={point} className="point">
                  <span className="point__n">0{i + 1}</span>
                  {point}
                </div>
              ))}
            </div>
            <Link href="/locations" className="link-rule">
              Explore Free Screens<span aria-hidden="true">&#8594;</span>
            </Link>
          </Reveal>

          <Reveal className="side">
            <div className="kicker kicker--deep">FOR ADVERTISERS</div>
            <h2 className="side__title">Reach the local audiences that matter.</h2>
            <div className="pointlist">
              {ADVERTISER_POINTS.map((point, i) => (
                <div key={point} className="point">
                  <span className="point__n">0{i + 1}</span>
                  {point}
                </div>
              ))}
            </div>
            <Link href="/advertisers" className="link-rule">
              Explore Advertising<span aria-hidden="true">&#8594;</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 3 — THE NETWORK VISUAL. */}
      <NetworkScene />

      {/* 4 — CHOOSE YOUR AUDIENCE. Three doorways, nothing more. */}
      <section className="audiences">
        <Reveal className="eyebrow">
          <span className="kicker kicker--deep">CHOOSE YOUR AUDIENCE</span>
        </Reveal>
        <Reveal as="h2" className="audiences__title">
          Three networks. Three kinds of attention.
        </Reveal>
        <div className="doorcards">
          {NETWORK_LIST.map((net) => (
            <RevealLink
              key={net.slug}
              href={`/networks/${net.slug}`}
              className="doorcard"
              style={{ ["--net" as string]: net.color }}
            >
              <div>
                <div className="doorcard__n">{net.tag}</div>
                <div className="doorcard__name">
                  {net.nameLines[0]}
                  <br />
                  {net.nameLines[1]}
                </div>
              </div>
              <div>
                <p className="doorcard__blurb">{net.line}</p>
                <span className="doorcard__cta">
                  Explore Network<span aria-hidden="true">&#8594;</span>
                </span>
              </div>
            </RevealLink>
          ))}
        </div>
      </section>

      {/* 5 — FINAL CTA. The same two doors, closing the loop. */}
      <section className="finalcta">
        <Link href="/locations" className="finalcta__panel finalcta__panel--amber">
          <span className="finalcta__kicker">HAVE A LOCATION?</span>
          <span className="finalcta__row">
            <span className="finalcta__title">
              Get a
              <br />
              Free Screen
            </span>
            <span className="finalcta__arrow" aria-hidden="true">
              &#8594;
            </span>
          </span>
        </Link>
        <Link href="/advertisers" className="finalcta__panel finalcta__panel--dark">
          <span className="finalcta__kicker">WANT TO REACH CUSTOMERS?</span>
          <span className="finalcta__row">
            <span className="finalcta__title">
              Build a
              <br />
              Campaign
            </span>
            <span className="finalcta__arrow" aria-hidden="true">
              &#8594;
            </span>
          </span>
        </Link>
      </section>
    </>
  );
}
