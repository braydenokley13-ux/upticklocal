"use client";

/**
 * The block as a drawn elevation.
 *
 * This is what narrow screens get instead of the WebGL model, and what any
 * browser without WebGL falls back to. It is not a downgrade dressed up as a
 * choice: a 390px viewport cannot hold a 34° perspective shot of a twelve
 * building street and stay legible, and running the full scene on a phone GPU
 * costs frames and battery for a composition nobody can read. An elevation
 * says the same thing — a row of neighbouring stores, one of them yours,
 * screens on the counters, an offer travelling between them — at a scale the
 * format can actually carry.
 *
 * Four frames replace the continuous camera. The offer travels as one
 * horizontal pass rather than five arcs.
 */

type Store = {
  id: string;
  name: string;
  /** Elevation width in viewBox units. */
  w: number;
  /** Parapet height above ground. */
  h: number;
  /** Facade tone. */
  fill: string;
  /** Cornice line. */
  edge: string;
  host?: boolean;
  you?: boolean;
  awning?: boolean;
};

const GROUND = 360;
const SHOP_H = 74; // shopfront height

const STORES: Store[] = [
  { id: "gym", name: "FITNESS", w: 150, h: 206, fill: "#152c33", edge: "#294c57", host: true },
  { id: "conv", name: "CONVENIENCE", w: 168, h: 152, fill: "#173038", edge: "#2d505c", host: true, awning: true },
  { id: "well", name: "WELLNESS", w: 128, h: 218, fill: "#142a31", edge: "#274853" },
  { id: "you", name: "YOUR BUSINESS", w: 178, h: 188, fill: "#22505d", edge: "#4d8496", you: true, awning: true },
  { id: "rest", name: "RESTAURANT", w: 156, h: 228, fill: "#1a3841", edge: "#315a66", host: true, awning: true },
  { id: "salon", name: "SALON", w: 130, h: 158, fill: "#163039", edge: "#2b505c", host: true },
  { id: "bout", name: "BOUTIQUE", w: 152, h: 182, fill: "#152e35", edge: "#2a4d59", host: true },
];

const GAP = 3;

/** Left edge of each store, and the running total. */
const LAYOUT = (() => {
  let x = 24;
  const items = STORES.map((s) => {
    const item = { ...s, x };
    x += s.w + GAP;
    return item;
  });
  return { items, width: x + 24 };
})();

const VIEW_W = LAYOUT.width;
const VIEW_H = 430;

function Windows({ store }: { store: (typeof LAYOUT.items)[number] }) {
  const top = GROUND - store.h;
  const bandTop = top + 26;
  const bandBottom = GROUND - SHOP_H - 22;
  const rows = Math.max(1, Math.floor((bandBottom - bandTop) / 34));
  const cols = Math.max(2, Math.round(store.w / 46));
  const cw = 22;
  const ch = 26;
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = store.x + ((c + 0.5) * store.w) / cols - cw / 2;
      const y = bandTop + r * 34;
      // A deterministic scatter of lit windows — no hydration-unsafe randomness.
      const lit = (r * 3 + c * 5 + store.w) % 3 === 0;
      out.push(
        <g key={`${r}-${c}`}>
          <rect x={x - 2} y={y - 2} width={cw + 4} height={ch + 4} fill={store.edge} opacity={0.45} />
          <rect
            x={x}
            y={y}
            width={cw}
            height={ch}
            fill={lit ? (store.you ? "#f0d7b0" : "#c99a5a") : "#0d2129"}
            opacity={lit ? (store.you ? 0.9 : 0.62) : 0.9}
          />
          <rect x={x - 3} y={y + ch + 2} width={cw + 6} height={2.5} fill={store.edge} opacity={0.6} />
        </g>
      );
    }
  }
  return <>{out}</>;
}

function StoreElevation({ store }: { store: (typeof LAYOUT.items)[number] }) {
  const top = GROUND - store.h;
  const shopTop = GROUND - SHOP_H;
  const glassX = store.x + 12;
  const glassW = store.w - 24;

  return (
    <g data-store={store.id} data-you={store.you ? "true" : undefined}>
      {/* body */}
      <rect x={store.x} y={top} width={store.w} height={store.h} fill={store.fill} />
      {/* cornice steps */}
      <rect x={store.x - 5} y={top - 7} width={store.w + 10} height={7} fill={store.edge} />
      <rect x={store.x - 2} y={top - 12} width={store.w + 4} height={5} fill={store.fill} />
      <rect x={store.x - 1} y={top + 16} width={store.w + 2} height={3} fill={store.edge} opacity={0.7} />

      <Windows store={store} />

      {/* storefront: recess, warm interior, glazing bars */}
      <rect x={store.x} y={shopTop} width={store.w} height={SHOP_H} fill="#0b1d23" />
      <rect
        x={glassX}
        y={shopTop + 10}
        width={glassW}
        height={SHOP_H - 14}
        fill={store.you ? "#f0d7b0" : "#c99a5a"}
        opacity={store.you ? 0.92 : 0.7}
      />
      {/* interior silhouettes — shelving at the back, a counter at the front */}
      <rect x={glassX + glassW * 0.08} y={shopTop + 20} width={glassW * 0.3} height={3} fill="#0b1d23" opacity={0.42} />
      <rect x={glassX + glassW * 0.08} y={shopTop + 31} width={glassW * 0.3} height={3} fill="#0b1d23" opacity={0.42} />
      <rect x={glassX + glassW * 0.62} y={shopTop + 20} width={glassW * 0.3} height={3} fill="#0b1d23" opacity={0.42} />
      <rect x={glassX + glassW * 0.62} y={shopTop + 31} width={glassW * 0.3} height={3} fill="#0b1d23" opacity={0.42} />
      {store.host && (
        <rect
          x={store.x + store.w / 2 - 27}
          y={shopTop + 48}
          width={54}
          height={SHOP_H - 52}
          fill="#0b1d23"
          opacity={0.62}
        />
      )}
      {[0.25, 0.5, 0.75].map((f) => (
        <rect key={f} x={glassX + glassW * f} y={shopTop + 10} width={2.5} height={SHOP_H - 14} fill="#0b1d23" opacity={0.55} />
      ))}
      {/* piers */}
      <rect x={store.x} y={shopTop} width={12} height={SHOP_H} fill={store.fill} />
      <rect x={store.x + store.w - 12} y={shopTop} width={12} height={SHOP_H} fill={store.fill} />

      {store.awning && (
        <g>
          <rect x={store.x + 10} y={shopTop - 12} width={store.w - 20} height={7} fill={store.edge} />
          <rect x={store.x + 10} y={shopTop - 5} width={store.w - 20} height={5} fill={store.edge} opacity={0.55} />
        </g>
      )}

      {/* sign box */}
      <rect x={store.x + 16} y={shopTop - 30} width={store.w - 32} height={17} fill="#0d1719" />
      <text
        className="elev__sign"
        x={store.x + store.w / 2}
        y={shopTop - 18}
        textAnchor="middle"
        fill={store.you ? "#eafaf4" : "rgba(236,229,216,.62)"}
      >
        {store.name}
      </text>

      {/* light pool on the pavement */}
      <ellipse
        cx={store.x + store.w / 2}
        cy={GROUND + 9}
        rx={store.you ? store.w * 0.52 : store.w * 0.34}
        ry={store.you ? 13 : 8}
        fill="url(#elev-pool)"
        opacity={store.you ? 0.62 : 0.3}
      />

      {/* The Uptick unit on the counter. Detailed enough to survive the close
          crop of frame four, where this is the only subject. */}
      {store.host && (
        <g className="elev__screen" data-store={store.id}>
          <rect x={store.x + store.w / 2 - 16} y={shopTop + 29} width={32} height={19} rx={2} fill="#0d3238" />
          <rect
            className="elev__screenface"
            x={store.x + store.w / 2 - 14}
            y={shopTop + 31}
            width={28}
            height={15}
            fill="#6fe0c6"
          />
          {/* offer lines + scan patch, drawn on the face */}
          <g className="elev__screencontent" fill="#05171b">
            <rect x={store.x + store.w / 2 - 11.5} y={shopTop + 34} width={13} height={2} />
            <rect x={store.x + store.w / 2 - 11.5} y={shopTop + 38} width={9} height={2} />
            <rect x={store.x + store.w / 2 + 5} y={shopTop + 34} width={7} height={7} />
          </g>
          <rect x={store.x + store.w / 2 - 5} y={shopTop + 48} width={10} height={2.5} fill="#15353a" />
        </g>
      )}
    </g>
  );
}

export default function BlockElevation({ frame = 0 }: { frame?: 0 | 1 | 2 | 3 }) {
  const you = LAYOUT.items.find((s) => s.you)!;
  const hosts = LAYOUT.items.filter((s) => s.host);
  const youCx = you.x + you.w / 2;
  const hero = LAYOUT.items.find((s) => s.id === "conv")!;
  const heroCx = hero.x + hero.w / 2;
  const lastHost = hosts[hosts.length - 1];
  const chipTravel = lastHost.x + lastHost.w / 2 - youCx;

  /**
   * Four framings, cut as viewBoxes rather than scaled transforms. Cropping is
   * what makes this work at 390px: fitting the whole street into a phone width
   * shrinks each storefront to about fifty pixels and the drawing stops saying
   * anything. Each frame instead shows only what that beat needs.
   */
  const view = ([
    // 01 — the block: Your Business and its immediate neighbours.
    [youCx - 300, 96, 600, 330],
    // 02 — the network: the whole street, every storefront lit.
    [0, 90, VIEW_W, 336],
    // 03 — the offer: the storefront band, so the route and every host screen
    // it reaches are in one frame.
    [0, 196, VIEW_W, 250],
    // 04 — the screen: the host counter, close enough that the unit is the
    // subject rather than a detail of a storefront.
    [heroCx - 82, GROUND - SHOP_H - 24, 164, 112],
  ] as const)[frame];

  return (
    <svg
      className="elev"
      data-frame={frame}
      style={{ ["--chip-travel" as string]: `${chipTravel}px` }}
      viewBox={view.join(" ")}
      role="img"
      aria-label="A drawn elevation of a neighbourhood block. Your business sits in the middle, lit brighter than its neighbours, with an offer travelling to Uptick screens on the counters of nearby non-competing stores."
    >
      <defs>
        <linearGradient id="elev-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050f13" />
          <stop offset="62%" stopColor="#0b232b" />
          <stop offset="100%" stopColor="#14414c" />
        </linearGradient>
        <radialGradient id="elev-pool">
          <stop offset="0%" stopColor="#ffb163" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffb163" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="elev-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8a24a" stopOpacity="0" />
          <stop offset="30%" stopColor="#f6cf9a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#e8a24a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Oversized so a cropped viewBox never exposes an unpainted edge. */}
      <rect x={-240} y={-160} width={VIEW_W + 480} height={VIEW_H + 320} fill="url(#elev-sky)" />

      {/* the camera: four framings of one drawing */}
      <g className="elev__camera">
        {LAYOUT.items.map((store) => (
          <StoreElevation key={store.id} store={store} />
        ))}

        {/* pavement and kerb */}
        <rect x={-240} y={GROUND} width={VIEW_W + 480} height="14" fill="#12333c" />
        <rect x={-240} y={GROUND + 14} width={VIEW_W + 480} height="4" fill="#0a1f26" />
        <rect x={-240} y={GROUND + 18} width={VIEW_W + 480} height={VIEW_H - GROUND + 140} fill="#0c1c21" />

        {/* street lamps */}
        {[0.14, 0.42, 0.7, 0.94].map((f) => {
          const x = 24 + (VIEW_W - 48) * f;
          return (
            <g key={f}>
              <rect x={x} y={GROUND - 96} width="3" height="96" fill="#2b3a40" />
              <rect x={x - 16} y={GROUND - 98} width="19" height="3" fill="#2b3a40" />
              <rect x={x - 20} y={GROUND - 97} width="8" height="4" fill="#ffc888" />
              <ellipse cx={x - 16} cy={GROUND - 94} rx="26" ry="20" fill="url(#elev-pool)" opacity="0.24" />
            </g>
          );
        })}

        {/* offer travel — one horizontal pass, left to right */}
        <g className="elev__route">
          <line
            x1={youCx}
            y1={GROUND - SHOP_H - 46}
            x2={hosts[hosts.length - 1].x + hosts[hosts.length - 1].w / 2}
            y2={GROUND - SHOP_H - 46}
            stroke="url(#elev-route)"
            strokeWidth="1.5"
          />
          <line
            x1={hosts[0].x + hosts[0].w / 2}
            y1={GROUND - SHOP_H - 46}
            x2={youCx}
            y2={GROUND - SHOP_H - 46}
            stroke="url(#elev-route)"
            strokeWidth="1.5"
          />
          {hosts.map((h) => (
            <line
              key={h.id}
              x1={h.x + h.w / 2}
              y1={GROUND - SHOP_H - 46}
              x2={h.x + h.w / 2}
              y2={GROUND - SHOP_H + 26}
              stroke="#e8a24a"
              strokeWidth="1"
              opacity="0.45"
            />
          ))}
          <circle className="elev__chip" cx={youCx} cy={GROUND - SHOP_H - 46} r="3.5" fill="#ffe6c2" />
        </g>

        {/* the one label that matters */}
        <g className="elev__youlabel">
          <line x1={youCx} y1={GROUND - you.h - 20} x2={youCx} y2={GROUND - you.h - 44} stroke="#6fe0c6" strokeWidth="1" opacity="0.7" />
          <text className="elev__youtext" x={youCx} y={GROUND - you.h - 52} textAnchor="middle" fill="#6fe0c6">
            YOUR BUSINESS
          </text>
        </g>

        {/* frame 4 marker: the host screen the customer scans */}
        <g className="elev__focus">
          <rect
            x={heroCx - 24}
            y={GROUND - SHOP_H + 21}
            width={48}
            height={33}
            fill="none"
            stroke="#6fe0c6"
            strokeWidth="0.6"
            opacity="0.7"
          />
        </g>
      </g>
    </svg>
  );
}
