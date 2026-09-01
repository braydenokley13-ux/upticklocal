import * as THREE from "three";
import { applyShot, FINALE, PORTRAIT, resolveShot, resolveStory, type Shot } from "./shots";
import { buildWorld, type World } from "./world";
import { disposeTextures, skyEquirect } from "./textures";
import { disposeGeometry } from "./materials";

export type QualityTier = "performance" | "balanced" | "high";
export type Slot = "story" | "finale";
export type FrameInfo = { slot: Slot; p: number; camera: THREE.PerspectiveCamera; width: number; height: number };

type Options = {
  offerText: string;
  /** Reduced motion: cuts between compositions, no eased moves. */
  calm: boolean;
  forceTier?: QualityTier | null;
  onFrame?: (f: FrameInfo) => void;
};

const DPR: Record<QualityTier, number> = { performance: 1, balanced: 1.25, high: 1.5 };
const SHADOW: Record<QualityTier, number> = { performance: 0, balanced: 1024, high: 2048 };

/**
 * Render on demand.
 *
 * There is no game loop. A frame is drawn when the scroll position changes,
 * while the camera settles after it, when the viewport resizes, and once at
 * load. When nothing is changing the renderer sleeps, and the picture on
 * screen is simply the last frame — a still, which is what a photograph of a
 * model is anyway.
 */
export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.PerspectiveCamera(30, 1.6, 0.05, 220);
  world!: World;
  tier: QualityTier = "balanced";

  private story: Shot[] = [];
  private slot: Slot = "story";
  private target = 0;
  private current = 0;
  private active = false;
  private raf = 0;
  private lastT = 0;
  private w = 1;
  private h = 1;
  private env: THREE.Texture | null = null;
  private sky: THREE.Texture | null = null;
  private disposed = false;

  constructor(private canvas: HTMLCanvasElement, private opts: Options) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", stencil: false });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    // Nothing that casts a shadow ever moves, so the shadow map is drawn once.
    this.renderer.shadowMap.autoUpdate = false;
  }

  async init(width: number, height: number): Promise<QualityTier> {
    await document.fonts.ready;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.sky = skyEquirect();
    this.env = pmrem.fromEquirectangular(this.sky).texture;
    pmrem.dispose();
    this.world = buildWorld(this.env, this.sky, this.opts.offerText);
    this.w = width;
    this.h = height;
    this.applyTier("balanced");
    this.resize(width, height);
    this.world.warm(this.renderer, this.camera);
    const tier = this.opts.forceTier ?? (await this.measure());
    if (this.disposed) return tier;
    this.applyTier(tier);
    this.renderer.shadowMap.needsUpdate = true;
    this.draw();
    return tier;
  }

  /**
   * Quality is decided by measuring, not by counting CPU cores: a burst of
   * frames at the balanced setting, timed by the compositor. The result is
   * locked for the session — no tier flapping.
   */
  private async measure(): Promise<QualityTier> {
    if (this.opts.calm) return "balanced";
    const times: number[] = [];
    this.renderer.shadowMap.needsUpdate = true;
    await new Promise<void>((done) => {
      let n = 0;
      let last = 0;
      const step = (t: number) => {
        if (this.disposed) return done();
        if (last) times.push(t - last);
        last = t;
        // A slight move each frame so the compositor cannot skip the redraw.
        this.current = 0.02 * (n % 2);
        this.draw();
        n++;
        if (n < 9 && t - (times[0] ?? t) < 1600) requestAnimationFrame(step);
        else done();
      };
      requestAnimationFrame(step);
    });
    this.current = 0;
    const settled = times.slice(2).sort((a, b) => a - b);
    const median = settled[Math.floor(settled.length / 2)] ?? 16;
    const dpr = window.devicePixelRatio || 1;
    if (median > 21) return "performance";
    if (median < 9 && dpr >= 1.5 && this.w * this.h * 2.25 < 5.8e6) return "high";
    return "balanced";
  }

  private applyTier(tier: QualityTier) {
    this.tier = tier;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR[tier]);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.w, this.h, false);
    const size = SHADOW[tier];
    this.world.scene.traverse((o) => {
      const light = o as THREE.DirectionalLight;
      if (!light.isDirectionalLight || !light.shadow) return;
      light.castShadow = size > 0;
      if (size > 0 && light.shadow.mapSize.x !== size) {
        light.shadow.mapSize.set(size, size);
        light.shadow.map?.dispose();
        light.shadow.map = null;
      }
    });
    this.renderer.shadowMap.enabled = size > 0;
    this.renderer.shadowMap.needsUpdate = size > 0;
  }

  resize(width: number, height: number) {
    this.w = Math.max(1, width);
    this.h = Math.max(1, height);
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    this.story = resolveStory(this.world, this.camera.aspect);
    this.schedule();
  }

  /** `p === null` means the section has left the viewport. */
  setStage(slot: Slot, p: number | null) {
    if (p === null) {
      this.active = false;
      return;
    }
    if (slot !== this.slot) {
      this.slot = slot;
      this.current = p; // a new section starts settled, never slides in
    }
    this.target = p;
    if (this.opts.calm) this.current = p;
    this.active = true;
    this.schedule();
  }

  /**
   * One synchronous frame at an exact progress — for stills and bakes. In a
   * portrait viewport the named beat gets its own composition.
   */
  renderStill(slot: Slot, p: number, portraitOf?: string) {
    this.slot = slot;
    this.current = this.target = p;
    this.active = true;
    const portrait = portraitOf && this.camera.aspect < 1 ? PORTRAIT[portraitOf] : undefined;
    if (portrait) {
      const finale = slot === "finale";
      applyShot(this.camera, [resolveShot(this.world, portrait, this.camera.aspect)], p, false, true);
      this.world.update({ p, finale });
      this.renderer.render(this.world.scene, this.camera);
      return;
    }
    this.draw();
  }

  private schedule() {
    if (this.raf || this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (t: number) => {
    this.raf = 0;
    if (this.disposed) return;
    const dt = this.lastT ? Math.min(0.05, (t - this.lastT) / 1000) : 1 / 60;
    this.lastT = t;
    if (!this.active) return;
    // Weighted, frame-rate independent settle: most of the move lands inside
    // ~120ms, the last few percent trail off so the camera never feels welded
    // to the wheel and never lags behind it either.
    const gap = this.target - this.current;
    if (Math.abs(gap) < 0.0004) this.current = this.target;
    else this.current += gap * (1 - Math.exp(-dt * 16));
    this.draw();
    if (this.current !== this.target) this.schedule();
    else this.lastT = 0;
  };

  private draw() {
    const finale = this.slot === "finale";
    applyShot(this.camera, finale ? FINALE : this.story, this.current, this.opts.calm);
    this.world.update({ p: this.current, finale });
    this.renderer.render(this.world.scene, this.camera);
    this.opts.onFrame?.({ slot: this.slot, p: this.current, camera: this.camera, width: this.w, height: this.h });
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.world?.dispose();
    disposeGeometry();
    disposeTextures();
    this.env?.dispose();
    this.sky?.dispose();
    this.renderer.dispose();
  }
}
