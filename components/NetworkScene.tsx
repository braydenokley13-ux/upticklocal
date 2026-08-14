"use client";

import { Fragment, useEffect, useRef } from "react";
import { clamp01, onScrollFrame, prefersReducedMotion } from "@/lib/scroll";

const CAPTIONS = [
  "A local business joins the network",
  "A free screen goes live on the counter",
  "Screens group into one audience network",
  "Advertisers buy the whole audience at once",
];

const NODES = [
  { label: ["LOCAL", "BUSINESS"], glyph: "business" },
  { label: ["FREE", "SCREEN"], glyph: "screen" },
  { label: ["LOCAL", "AUDIENCE"], glyph: "audience" },
  { label: ["LOCAL", "ADVERTISER"], glyph: "advertiser" },
] as const;

function Glyph({ kind }: { kind: (typeof NODES)[number]["glyph"] }) {
  if (kind === "business")
    return (
      <div className="glyph-business">
        <i />
      </div>
    );
  if (kind === "screen")
    return (
      <div className="glyph-screen">
        <i />
        <i />
      </div>
    );
  if (kind === "audience") return <div className="glyph-audience" />;
  return <div className="glyph-advertiser" />;
}

/**
 * The one big storytelling moment on the homepage: 320vh of scroll drives a
 * pinned stage where business → screen → audience → advertiser build in turn.
 * Replaces several paragraphs of explanation.
 */
export default function NetworkScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const capRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const calm = prefersReducedMotion();

    if (calm) {
      // No build-in — show the finished diagram, let the caption still track.
      nodeRefs.current.forEach((n) => {
        if (n) {
          n.style.opacity = "1";
          n.style.transform = "none";
        }
      });
      linkRefs.current.forEach((l) => {
        if (l) l.style.transform = "scaleX(1)";
      });
    }

    return onScrollFrame(() => {
      const vh = innerHeight;
      const r = wrap.getBoundingClientRect();
      const progress = clamp01(-r.top / Math.max(1, r.height - vh));
      const stage = progress * 4.4;

      if (!calm) {
        nodeRefs.current.forEach((node, i) => {
          if (!node) return;
          const v = clamp01(stage - i * 0.95);
          node.style.opacity = (0.14 + 0.86 * v).toFixed(2);
          node.style.transform = `translateY(${((1 - v) * 26).toFixed(1)}px)`;
        });
        linkRefs.current.forEach((link, i) => {
          if (!link) return;
          const v = clamp01(stage - (i * 0.95 + 0.62));
          link.style.transform = `scaleX(${v.toFixed(3)})`;
        });
      }

      const cap = capRef.current;
      if (cap) {
        const text = CAPTIONS[Math.min(3, Math.floor(stage / 1.05))];
        if (cap.textContent !== text) cap.textContent = text;
      }
    });
  }, []);

  return (
    <div id="how-it-works" ref={wrapRef} className="netscene">
      <div className="netscene__sticky">
        <div className="field-lines field-lines--soft" aria-hidden="true" />
        <h2 className="netscene__title">One screen becomes part of something bigger.</h2>

        <div className="netscene__row">
          {NODES.map((node, i) => (
            <Fragment key={node.glyph}>
              {i > 0 && (
                <div
                  className="nlink"
                  aria-hidden="true"
                  ref={(el) => {
                    linkRefs.current[i - 1] = el;
                  }}
                />
              )}
              <div
                className="nnode"
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
              >
                <Glyph kind={node.glyph} />
                <span className="nnode__label">
                  {node.label[0]}
                  <br />
                  {node.label[1]}
                </span>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="netscene__cap">
          <span ref={capRef}>{CAPTIONS[0]}</span>
        </div>
      </div>
    </div>
  );
}
