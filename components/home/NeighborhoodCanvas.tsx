"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { applyShot, FINALE_SHOTS, SHOTS, smoothstep } from "@/lib/three/shots";
import { subscribeStage, type StageSnapshot } from "@/lib/three/stage-bus";
import { counterScreenTexture, disposeTextures, skyEquirect } from "@/lib/three/textures";
import { disposeGeometry } from "@/lib/three/materials";
import { buildWorld, HOSTS, RISE_ORDER, type QualityTier, type World } from "@/lib/three/world";

type Props = {
  offerText: string;
};

/**
 * Flips the document into the drawn-elevation presentation. CSS owns the
 * swap, so a browser without WebGL gets the narrow-screen art direction at any
 * width rather than an empty dark box behind the copy.
 */
function markUnsupported() {
  document.documentElement.dataset.webgl = "off";
}

function pickQuality(): QualityTier {
  if (typeof navigator === "undefined") return "medium";
  const cores = navigator.hardwareConcurrency ?? 4;
  const wide = window.innerWidth >= 1180;
  return wide && cores >= 8 ? "high" : "medium";
}

/**
 * One renderer, one copy of the block, driven by whichever cinematic section
 * is currently on screen. Lives in a fixed layer behind the page; the opaque
 * chapters simply paint over it.
 */
export default function NeighborhoodCanvas({ offerText }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">("loading");

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!host || !canvas || !overlay) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      markUnsupported();
      setStatus("unsupported");
      return;
    }

    const quality = pickQuality();
    // 1.6 is the point past which the extra pixels stop being visible on this
    // material palette and start costing frames.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.6 : 1.25));
    renderer.shadowMap.enabled = true;
    // PCFSoft is deprecated as of r184 and silently falls back to PCF anyway.
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Blue-hour shadow should read as blue, not as black. ACES already rolls
    // the highlights off, so the exposure can sit high enough to keep the far
    // end of the street off the floor.
    renderer.toneMappingExposure = 1.28;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const sky = skyEquirect();
    const env = pmrem.fromEquirectangular(sky).texture;
    sky.dispose();
    pmrem.dispose();

    let world: World;
    try {
      world = buildWorld(env, offerText, quality);
    } catch (error) {
      console.error("[uptick] scene build failed", error);
      renderer.dispose();
      markUnsupported();
      setStatus("unsupported");
      return;
    }

    const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 400);

    /* --- projected labels ------------------------------------------------- */
    const labelEls = world.labels.map((label) => {
      const el = document.createElement("div");
      el.className = "worldlabel";
      if (label.you) el.dataset.you = "true";
      el.innerHTML = `<span class="worldlabel__chip">${label.text}</span><span class="worldlabel__stem"></span>`;
      overlay.appendChild(el);
      return el;
    });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let calm = motionQuery.matches;
    const onMotionChange = () => {
      calm = motionQuery.matches;
      damped = target; // no easing in from the old value
      dirty = true;
    };
    motionQuery.addEventListener("change", onMotionChange);

    let slot: "story" | "finale" = "story";
    let target = 0;
    let damped = 0;
    let active = false;
    let dirty = true;
    let raf = 0;
    let clock = 0;

    const projected = new THREE.Vector3();

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirty = true;
    };

    /* --- per-frame world state -------------------------------------------- */
    const draw = (time: number) => {
      const finale = slot === "finale";
      const p = damped;
      clock = time / 1000;

      applyShot(camera, finale ? FINALE_SHOTS : SHOTS, p, {
        snap: calm,
        // The float fades out as the camera closes on the screen, so the final
        // shot is dead steady.
        breathe: calm || finale ? 0 : (1 - smoothstep(0.78, 0.9, p)) * 0.18,
        time: clock,
      });

      // The block assembles itself, nearest neighbour first.
      RISE_ORDER.forEach((id, k) => {
        const g = world.groups[id];
        if (!g) return;
        const rise = finale ? 1 : smoothstep(0.15 + k * 0.022, 0.3 + k * 0.022, p);
        g.visible = rise > 0.002;
        g.position.y = -(g.userData.h as number) * 1.35 * (1 - rise);
      });

      // The offer leaves Your Business and travels to each host in turn.
      let chipPlaced = false;
      world.routes.forEach((route, k) => {
        const s = finale ? 1 : smoothstep(0.45 + k * 0.055, 0.585 + k * 0.055, p);
        route.mesh.geometry.setDrawRange(0, Math.floor(route.count * s));
        route.halo.geometry.setDrawRange(0, Math.floor(route.haloCount * s));
        const opacity = finale ? 0.26 : 0.62 * (1 - smoothstep(0.82, 0.92, p));
        route.mesh.material.opacity = opacity;
        route.halo.material.opacity = opacity * 0.1;
        if (!finale && !chipPlaced && s > 0.001 && s < 0.999) {
          route.curve.getPointAt(s, world.chip.position);
          world.chip.visible = true;
          chipPlaced = true;
        }
      });
      if (!chipPlaced) world.chip.visible = false;

      // Host screens switch from their own specials to the offer.
      world.screens.forEach((screen) => {
        const k = HOSTS.indexOf(screen.id as (typeof HOSTS)[number]);
        const activated = finale ? 1 : smoothstep(0.555 + k * 0.055, 0.63 + k * 0.055, p);
        const on = activated > 0.5;
        if (on !== !!screen.on) {
          screen.on = on;
          if (on && !screen.offer) screen.offer = counterScreenTexture("offer", offerText);
          screen.face.material.map = on ? screen.offer! : screen.idle;
          screen.face.material.needsUpdate = true;
        }
        const pulse = calm ? 0 : Math.sin(clock * 1.1 + k) * 0.08;
        screen.halo.material.opacity = activated * (0.34 + pulse);
        screen.halo.material.color.setHex(on ? 0xe8a24a : 0x6fe0c6);
      });

      // The glazing dissolves so the camera can step inside.
      if (world.heroGlass) {
        const dive = finale ? 0 : smoothstep(0.76, 0.88, p);
        world.heroGlass.material.opacity = 0.3 * (1 - dive);
        world.heroGlass.mesh.visible = dive < 0.99;
      }

      /* --- labels ---------------------------------------------------------- */
      const w = host.clientWidth;
      const h = host.clientHeight;
      world.labels.forEach((label, k) => {
        const el = labelEls[k];
        let opacity: number;
        if (finale) opacity = label.you ? 1 : 0.55;
        else if (label.you) opacity = smoothstep(0.05, 0.12, p) * (1 - smoothstep(0.62, 0.7, p));
        else
          opacity =
            smoothstep(0.24, 0.32, p) *
            (1 - smoothstep(0.62, 0.7, p)) *
            (label.host ? 1 : 0.7);

        if (opacity < 0.01) {
          el.style.opacity = "0";
          return;
        }
        projected.copy(label.position).project(camera);
        if (projected.z > 1) {
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(${((projected.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-projected.y * 0.5 + 0.5) * h).toFixed(1)}px, 0) translate(-50%, -100%)`;
      });

      renderer.render(world.scene, camera);
    };

    /* --- loop -------------------------------------------------------------- */
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!active) return;

      if (calm) {
        // Reduced motion: cuts, not moves. Only redraw when something changed.
        damped = target;
        if (!dirty) return;
        dirty = false;
        draw(time);
        return;
      }

      // Weighted, not lagging: 0.11 settles inside ~150ms but keeps the
      // camera from being welded to the wheel.
      damped += (target - damped) * 0.11;
      draw(time);
    };

    /* --- wiring ------------------------------------------------------------ */
    const onSnapshot = (snapshot: StageSnapshot) => {
      if (!snapshot) {
        if (active) {
          active = false;
          host.dataset.active = "false";
        }
        return;
      }
      if (snapshot.slot !== slot) {
        slot = snapshot.slot;
        // Entering a section: start settled at its own progress rather than
        // sliding in from wherever the other section left off.
        damped = snapshot.progress;
      }
      target = snapshot.progress;
      dirty = true;
      if (!active) {
        active = true;
        host.dataset.active = "true";
      }
    };

    const unsubscribe = subscribeStage(onSnapshot);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    // Prime the first frame before revealing the canvas.
    damped = target;
    draw(performance.now());
    setStatus("ready");
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      labelEls.forEach((el) => el.remove());
      world.dispose();
      disposeGeometry();
      disposeTextures();
      env.dispose();
      renderer.dispose();
    };
  }, [offerText]);

  if (status === "unsupported") return null;

  return (
    <div ref={hostRef} className="worldlayer" data-status={status} aria-hidden="true">
      <canvas ref={canvasRef} className="worldlayer__canvas" />
      <div ref={overlayRef} className="worldlayer__labels" />
      <div className="worldlayer__loader">
        <span>PREPARING THE MODEL</span>
        <span className="worldlayer__bar" />
      </div>
    </div>
  );
}
