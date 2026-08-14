import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { NETWORKS, NETWORK_ORDER, type NetworkSlug } from "@/lib/networks";

type Params = { params: Promise<{ network: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return NETWORK_ORDER.map((network) => ({ network }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { network } = await params;
  const net = NETWORKS[network as NetworkSlug];
  if (!net) return {};
  return { title: net.name, description: `${net.line} ${net.desc}` };
}

export default async function NetworkPage({ params }: Params) {
  const { network } = await params;
  const net = NETWORKS[network as NetworkSlug];
  if (!net) notFound();

  const rail = { ["--net" as string]: net.color };

  return (
    <>
      <section className="netdetail" style={rail}>
        <div className="netdetail__rail" aria-hidden="true" />
        <div className="netdetail__grid">
          <div className="u-rise">
            <div className="netdetail__tag">{net.tag}</div>
            <h1 className="netdetail__title">{net.name}</h1>
            <p className="netdetail__line">{net.line}</p>
            <p className="netdetail__desc">{net.desc}</p>
            <div className="netdetail__acts">
              <Link href="/advertisers" className="btn btn--amber">
                Build a Campaign<span aria-hidden="true">&#8594;</span>
              </Link>
              <Link href="/networks" className="btn btn--ghost">
                All Networks
              </Link>
            </div>
          </div>

          {/* The one screen we draw rather than photograph — radius allowed here. */}
          <div className="device__wrap u-fade-quick">
            <div className="device">
              <div className="device__shell">
                <div className="device__screen">
                  <div className="device__now">
                    {net.tag}
                    <br />
                    NOW PLAYING
                  </div>
                  <div className="device__sample">{net.sample}</div>
                  <div className="device__slot">
                    <span>CAMPAIGN CREATIVE</span>
                  </div>
                </div>
                <div className="device__brand">UPTICK</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-paper band" style={rail}>
        <div className="netfacts">
          <Reveal>
            <div className="kicker kicker--deep">WHERE IT LIVES</div>
            {net.places.map((place) => (
              <div key={place} className="factrow">
                <span className="factrow__mark" aria-hidden="true" />
                {place}
              </div>
            ))}
          </Reveal>

          <Reveal>
            <div className="kicker kicker--deep">WHO YOU REACH</div>
            {net.reach.map((r) => (
              <div key={r} className="factrow factrow--plain">
                {r}
              </div>
            ))}
            <Link href="/advertisers" className="link-rule">
              Reach this audience<span aria-hidden="true">&#8594;</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
