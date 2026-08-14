import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CampaignInquiryForm from "@/components/CampaignInquiryForm";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import { NETWORK_LIST } from "@/lib/networks";
import install from "@/public/uptick-install.jpg";

export const metadata: Metadata = {
  title: "For Advertisers",
  description:
    "Who, and where. Pick a local audience network and a geography — Uptick runs your campaign on real screens where your customers already go.",
};

export default function AdvertisersPage() {
  return (
    <>
      {/* Two questions, nothing else in the first viewport. */}
      <section className="twoq">
        <div className="field-lines" aria-hidden="true" />
        <div className="kicker twoq__kicker">FOR ADVERTISERS &mdash; TWO QUESTIONS</div>
        <div className="twoq__grid">
          <div className="u-rise">
            <h1 className="twoq__q">
              Who<em>?</em>
            </h1>
            <p className="twoq__body">
              Parents at pizza night. Members mid-workout. Drivers grabbing coffee. Pick the
              audience, not the billboard.
            </p>
          </div>
          <div className="u-rise-slow">
            <p className="twoq__q">
              Where<em>?</em>
            </p>
            <p className="twoq__body">
              Your zips, your radius, your side of town. Campaigns run only where your customers
              actually live.
            </p>
          </div>
        </div>
        <div className="twoq__act">
          <a href="#inquiry" className="btn btn--amber">
            Start a Campaign<span aria-hidden="true">&#8594;</span>
          </a>
        </div>
      </section>

      <section className="page-paper band">
        <Reveal as="h2" className="section-title">
          Answer those two, and the system does the rest.
        </Reveal>

        <Reveal className="arow">
          <span className="arow__n">01</span>
          <span className="arow__title">Pick an audience network</span>
          <span className="chips">
            {NETWORK_LIST.map((net) => (
              <Link
                key={net.slug}
                href={`/networks/${net.slug}`}
                className="chip"
                style={{ ["--net" as string]: net.color }}
              >
                {net.name}
              </Link>
            ))}
          </span>
        </Reveal>

        <Reveal className="arow">
          <span className="arow__n">02</span>
          <span className="arow__title">Draw your geography</span>
          <span className="arow__meta">ZIP CODES &middot; RADIUS &middot; NEIGHBORHOODS</span>
        </Reveal>

        <Reveal className="arow">
          <span className="arow__n">03</span>
          <span className="arow__title">Run on real screens</span>
          <span className="arow__meta">21&#8243; SCREENS AT COUNTERS, LOBBIES &amp; CHECKOUTS</span>
        </Reveal>

        <Reveal className="arow">
          <span className="arow__n">04</span>
          <span className="arow__title">Follow through digitally</span>
          <span className="arow__meta">QR OFFERS &middot; NEWSLETTERS &middot; LOCAL CONTENT</span>
        </Reveal>
      </section>

      <section className="photoband">
        <Parallax amount={0.1} className="photoband__plane">
          <Image
            src={install}
            alt="Campaigns run where people already are — the neighborhood store counter"
            fill
            sizes="100vw"
            className="photoband__img"
          />
        </Parallax>
        <div className="photoband__veil" aria-hidden="true" />
        <div className="photoband__copy">
          <div className="photoband__kicker">NO SKIP BUTTON. NO FEED.</div>
          <div className="photoband__line">Your ad, at eye level, at the moment of purchase.</div>
        </div>
      </section>

      <CampaignInquiryForm />
    </>
  );
}
