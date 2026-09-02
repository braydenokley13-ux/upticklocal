"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Engine, type FrameInfo, type QualityTier, type Slot } from "@/lib/three/engine";
import { MOBILE, smoothstep, type Shot } from "@/lib/three/shots";
import { subscribeStage } from "@/lib/three/stage-bus";

type Props = { special: { line1: string; line2: string; tag: string } };

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

/**
 * `?still=` selects a composition for the bake and for QA:
 *   still=<name>            one of the named desktop compositions
 *   still=p:<progress>      any point in the story
 *   still=m:<name>          one of the phone frames (its own camera and state)
 * `cam=px,py,pz,tx,ty,tz,fov[,unit]` overrides the camera, and `p=` the state,
 * so a composition can be tuned from the address bar before it is written down.
 */
function parseStill(params: URLSearchParams): { slot: Slot; p: number; shot?: Shot } | null {
  const still = params.get("still");
  if (still === null) return null;
  let wanted: { slot: Slot; p: number; shot?: Shot } | undefined;
  if (still.startsWith("p:")) wanted = { slot: "story", p: Number(still.slice(2)) };
  else if (still.startsWith("m:")) {
    const frame = MOBILE[still.slice(2)];
    if (frame) wanted = { slot: frame.finale ? "finale" : "story", p: frame.p, shot: { p: 0, ...frame.shot } };
  } else if (STILLS[still]) wanted = STILLS[still];
  if (!wanted) return null;
  const cam = params.get("cam");
  if (cam) {
    const n = cam.split(",");
    const v = n.slice(0, 7).map(Number);
    wanted.shot = { p: 0, pos: [v[0], v[1], v[2]], target: [v[3], v[4], v[5]], fov: v[6], rel: n[7] === "unit" ? "unit" : undefined };
  }
  const p = params.get("p");
  if (p !== null) wanted.p = Number(p);
  return wanted;
}

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
export default function NeighborhoodCanvas({ special }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">("loading");
  const [labels, setLabels] = useState<{ id: string; text: string }[]>([]);

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
      const finale = slot === "finale";
      // Act II names every pocket of attention on the block; Act III keeps
      // only Your Business; the screen is named when the camera reaches it.
      const block = smoothstep(0.24, 0.3, p) * (1 - smoothstep(0.39, 0.44, p));
      const you = finale ? 0.9 : Math.max(block, smoothstep(0.47, 0.52, p) * (1 - smoothstep(0.62, 0.66, p)));
      const unit = finale ? 0 : smoothstep(0.78, 0.82, p) * (1 - smoothstep(0.87, 0.9, p));
      engine.world.labels.forEach((label, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const a = label.id === "unit" ? unit : label.id === "you" ? you : finale ? 0 : block;
        if (a < 0.01) {
          if (el.style.opacity !== "0") el.style.opacity = "0";
          return;
        }
        projected.copy(label.position).project(camera);
        if (projected.z > 1) {
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = a.toFixed(3);
        el.style.transform = `translate3d(${((projected.x * 0.5 + 0.5) * width).toFixed(1)}px, ${((-projected.y * 0.5 + 0.5) * height).toFixed(1)}px, 0)`;
      });
    };

    // Probe for a context first, so a browser without WebGL takes the still
    // presentation quietly instead of three.js reporting a failed renderer.
    const probe = document.createElement("canvas");
    let supported = false;
    try {
      supported = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      supported = false;
    }
    if (!supported) {
      markUnsupported();
      setStatus("unsupported");
      return;
    }

    let engine: Engine;
    try {
      engine = new Engine(canvas, { special, calm, forceTier: forced, onFrame });
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
        setLabels(engine.world.labels.map(({ id, text }) => ({ id, text })));
        observer.observe(host);
        const wanted = parseStill(params);
        if (wanted) {
          host.dataset.active = "true";
          engine.renderStill(wanted.slot, wanted.p, wanted.shot);
          // The bake reads the panel's corners off the window once the frame is up.
          (window as Window & { __still?: { panel: [number, number][] } }).__still = { panel: engine.projectPanel() };
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
  }, [special]);

  if (status === "unsupported") return null;

  return (
    <div ref={hostRef} className="worldlayer" data-status={status} aria-hidden="true">
      <canvas ref={canvasRef} className="worldlayer__canvas" />
      <div className="worldlayer__labels">
        {labels.map(({ id, text }, i) => (
          <div
            key={id}
            className="worldlabel"
            data-id={id}
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
