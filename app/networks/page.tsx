import type { Metadata } from "next";
import RevealLink from "@/components/RevealLink";
import { NETWORK_LIST } from "@/lib/networks";

export const metadata: Metadata = {
  title: "Our Networks",
  description:
    "Screens grouped by who's standing in front of them: Family & Parent, Health & Wellness, Commuter & Driver.",
};

export default function NetworksPage() {
  return (
    <>
      <section className="netindex__head">
        <div className="kicker u-rise">OUR NETWORKS</div>
        <h1 className="netindex__title u-rise">
          Screens grouped by who&#8217;s standing in front of them.
        </h1>
      </section>

      <section className="netindex__list">
        {NETWORK_LIST.map((net) => (
          <RevealLink
            key={net.slug}
            href={`/networks/${net.slug}`}
            className="netrow"
            style={{ ["--net" as string]: net.color }}
          >
            <span className="netrow__tag">{net.tag}</span>
            <span className="netrow__name">{net.name}</span>
            <span className="netrow__blurb">{net.blurb}</span>
            <span className="netrow__arrow" aria-hidden="true">
              &#8594;
            </span>
          </RevealLink>
        ))}
      </section>
    </>
  );
}
