import type { WayId } from "@/lib/content";

/**
 * The block as a site plan: the same street the model shows, drawn as an
 * architect would draw it. Two rows of storefronts on one street, a screen
 * mark on every participating counter. The mode decides what lights up:
 *
 *   host       your counter joins the network; your screen is on
 *   advertise  your campaign runs on the screens around you (no screen of your own)
 *   growth     the Anchor is on your screen and the nearby ones; a Drop lands on
 *              a phone on the street and the visit comes back to your door
 *
 * Pure SVG; CSS owns colour and the transitions. Labels are the model's.
 */

type Store = { id: string; label: string; x: number; w: number; host?: boolean; you?: boolean };

const NORTH: Store[] = [
  { id: "gym", label: "Fitness", x: 24, w: 118, host: true },
  { id: "conv", label: "Convenience", x: 146, w: 112, host: true },
  { id: "rest", label: "Restaurant", x: 262, w: 108, host: true },
  { id: "salon", label: "Salon", x: 374, w: 88, host: true },
  { id: "n2", label: "", x: 466, w: 110 },
];

const SOUTH: Store[] = [
  { id: "s3", label: "", x: 24, w: 96 },
  { id: "well", label: "Wellness", x: 124, w: 100 },
  { id: "you", label: "Your business", x: 228, w: 128, you: true },
  { id: "cafe", label: "Café", x: 360, w: 88, host: true },
  { id: "s2", label: "", x: 452, w: 124 },
];

const N_Y = 40;
const S_Y = 204;
const H = 96;
const N_EDGE = N_Y + H; // north storefront line
const S_EDGE = S_Y; // south storefront line
const YOU = SOUTH.find((s) => s.you)!;
const DOOR = { x: YOU.x + YOU.w / 2, y: S_EDGE };

const cx = (s: Store) => s.x + s.w / 2;

/** A curve from Your Business's door to a host's screen, routed over the street. */
function arc(target: Store, north: boolean) {
  const tx = cx(target);
  const ty = north ? N_EDGE + 4 : S_EDGE - 4;
  if (north) return `M${DOOR.x},${DOOR.y - 4} C${DOOR.x},${DOOR.y - 60} ${tx},${ty + 60} ${tx},${ty}`;
  // A neighbour on the same side: along the pavement.
  return `M${DOOR.x},${DOOR.y - 4} C${DOOR.x + 10},${DOOR.y - 26} ${tx - 10},${ty - 22} ${tx},${ty}`;
}

export default function BlockPlan({ mode, className }: { mode: WayId; className?: string }) {
  const hosts = [...NORTH.filter((s) => s.host).map((s) => ({ s, north: true })), ...SOUTH.filter((s) => s.host).map((s) => ({ s, north: false }))];
  return (
    <svg className={`plan${className ? ` ${className}` : ""}`} viewBox="0 0 600 340" data-mode={mode} role="img" aria-hidden="true" focusable="false">
      {/* street */}
      <rect className="plan__street" x="0" y="150" width="600" height="40" />
      <line className="plan__kerb" x1="0" y1="150" x2="600" y2="150" />
      <line className="plan__kerb" x1="0" y1="190" x2="600" y2="190" />
      <line className="plan__centre" x1="0" y1="170" x2="600" y2="170" />
      <text className="plan__street-name" x="588" y="174" textAnchor="end">
        Main St
      </text>

      {/* the network: one hairline joining every counter screen, drawn along the pavements */}
      <path
        className="plan__net"
        d={`M${cx(NORTH[0])},${N_EDGE + 4} H${cx(NORTH[3])} M${cx(SOUTH[2])},${S_EDGE - 4} H${cx(SOUTH[3])} M${cx(NORTH[1])},${N_EDGE + 4} C${cx(NORTH[1])},${N_EDGE + 40} ${DOOR.x},${S_EDGE - 40} ${DOOR.x},${S_EDGE - 4}`}
      />

      {/* buildings */}
      {[...NORTH.map((s) => ({ s, north: true })), ...SOUTH.map((s) => ({ s, north: false }))].map(({ s, north }) => {
        const y = north ? N_Y : S_Y;
        const edge = north ? N_EDGE : S_EDGE;
        return (
          <g key={s.id} className="plan__store" data-id={s.id} data-host={s.host ? "true" : undefined} data-you={s.you ? "true" : undefined}>
            <rect className="plan__mass" x={s.x} y={y} width={s.w} height={H} />
            <line className="plan__front" x1={s.x + 4} y1={edge} x2={s.x + s.w - 4} y2={edge} />
            {s.label ? (
              <text className="plan__label" x={cx(s)} y={north ? y + 52 : y + 52} textAnchor="middle">
                {s.label}
              </text>
            ) : null}
            {(s.host || s.you) && (
              <g className="plan__screen" transform={`translate(${cx(s)}, ${north ? edge - 7 : edge + 7})`}>
                <circle className="plan__halo" r="14" />
                <rect className="plan__unit" x="-6" y="-2.5" width="12" height="5" rx="1" />
              </g>
            )}
          </g>
        );
      })}

      {/* campaign / anchor reaching the screens around you */}
      <g className="plan__reach">
        {hosts.map(({ s, north }) => (
          <path key={s.id} className="plan__arc" d={arc(s, north)} pathLength="1" />
        ))}
      </g>

      {/* growth: a Drop lands on a phone on the street, and the visit comes to your door */}
      <g className="plan__drop" transform="translate(372, 170)">
        <rect className="plan__phone" x="-5" y="-9" width="10" height="18" rx="2" />
        <circle className="plan__ping" r="16" />
      </g>
      <path className="plan__visit" d={`M367,172 C340,176 ${DOOR.x + 24},${S_EDGE - 30} ${DOOR.x + 2},${S_EDGE - 4}`} pathLength="1" />
      <text className="plan__note plan__note--drop" x="384" y="174">
        Drop
      </text>
      <text className="plan__note plan__note--you" x={DOOR.x + 8} y={S_EDGE - 12}>
        Visit
      </text>
      <text className="plan__note plan__note--host" x={DOOR.x} y={S_Y + H + 18} textAnchor="middle">
        Your screen
      </text>
    </svg>
  );
}
