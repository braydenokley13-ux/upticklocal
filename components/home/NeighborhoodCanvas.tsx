"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Engine, type FrameInfo, type QualityTier, type Slot } from "@/lib/three/engine";
import { smoothstep } from "@/lib/three/shots";
import { subscribeStage } from "@/lib/three/stage-bus";

type Props = { offerText: string };

/** Named compositions, for `?still=` bakes and QA. */
const STILLS: Record<string, { slot: Slot; p: number }> = {
  hero: { slot: "story", p: 0 },
  model: { slot: "story", p: 0.31 },
  signal: { slot: "story", p: 0.56 },
  approach: { slot: "story", p: 0.7 },
  screen: { slot: "story", p: 0.83 },
  fill: { slot: "story", p: 1 },
  finale: { slot: "finale", p: 0.45 },
};

/** Flips the document to the still-frame presentation. CSS owns the swap. */
function markUnsupported() {
  document.documentElement.dataset.webgl = "off";
}

/**
 * One renderer, one model, driven by whichever cinematic section is on
 * screen. It lives in a fixed layer behind the page; the opaque chapters paint
 * over it. Three annotations are projected from the model into the DOM so
 * they stay crisp at any pixel ratio.
 */
export default function NeighborhoodCanvas({ offerText }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">("loading");

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const params = new URLSearchParams(window.location.search);
    const still = params.get("still");
    const forced = params.get("q") as QualityTier | null;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) document.documentElement.dataset.still = "pending";

    const projected = new THREE.Vector3();
    const onFrame = ({ slot, p, camera, width, height }: FrameInfo) => {
      const anchors = engine.world.anchors;
      const finale = slot === "finale";
      // Three annotations, each shown only while it is the thing to look at.
      const alphas = finale
        ? [0.9, 0, 0]
        : [
            smoothstep(0.24, 0.3, p) * (1 - smoothstep(0.6, 0.65, p)),
            smoothstep(0.56, 0.62, p) * (1 - smoothstep(0.68, 0.72, p)),
            smoothstep(0.78, 0.82, p) * (1 - smoothstep(0.87, 0.9, p)),
          ];
      [anchors.you, anchors.host, anchors.unit].forEach((anchor, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const a = alphas[i];
        if (a < 0.01) {
          if (el.style.opacity !== "0") el.style.opacity = "0";
          return;
        }
        projected.copy(anchor).project(camera);
        if (projected.z > 1) {
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = a.toFixed(3);
        el.style.transform = `translate3d(${((projected.x * 0.5 + 0.5) * width).toFixed(1)}px, ${((-projected.y * 0.5 + 0.5) * height).toFixed(1)}px, 0)`;
      });
    };

    let engine: Engine;
    try {
      engine = new Engine(canvas, { offerText, calm, forceTier: forced, onFrame });
    } catch {
      markUnsupported();
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    const observer = new ResizeObserver(() => {
      if (!cancelled) engine.resize(host.clientWidth, host.clientHeight);
    });

    engine
      .init(host.clientWidth || 1, host.clientHeight || 1)
      .then((tier) => {
        if (cancelled) return;
        host.dataset.tier = tier;
        observer.observe(host);
        if (still && STILLS[still]) {
          const s = STILLS[still];
          host.dataset.active = "true";
          engine.renderStill(s.slot, s.p, still);
          setStatus("ready");
          requestAnimationFrame(() => {
            document.documentElement.dataset.still = "ready";
          });
          return;
        }
        unsubscribe = subscribeStage((snapshot) => {
          if (!snapshot) {
            engine.setStage("story", null);
            host.dataset.active = "false";
            return;
          }
          host.dataset.active = "true";
          engine.setStage(snapshot.slot, snapshot.progress);
        });
        setStatus("ready");
      })
      .catch((error) => {
        console.error("[uptick] model failed", error);
        if (cancelled) return;
        markUnsupported();
        setStatus("unsupported");
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
      observer.disconnect();
      engine.dispose();
    };
  }, [offerText]);

  if (status === "unsupported") return null;

  return (
    <div ref={hostRef} className="worldlayer" data-status={status} aria-hidden="true">
      <canvas ref={canvasRef} className="worldlayer__canvas" />
      <div className="worldlayer__labels">
        {["Your business", "Selected host", "Uptick screen"].map((text, i) => (
          <div
            key={text}
            className="worldlabel"
            data-kind={i}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
          >
            <span className="worldlabel__stem" />
            <span className="worldlabel__text">{text}</span>
          </div>
        ))}
      </div>
      <div className="worldlayer__loader">
        <span className="worldlayer__bar" />
      </div>
    </div>
  );
}
