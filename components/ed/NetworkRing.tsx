import { NETWORK } from "@/lib/audience";

/**
 * The local loop, drawn once.
 *
 * Uptick sits in the middle because Uptick is what coordinates; the four
 * parties sit on the ring because none of them is downstream of another.
 * A benefit travels the ring every week, which is why the ring is a cycle
 * and not a funnel.
 *
 * No JavaScript: the travelling mark is a CSS animation on an offset-path,
 * so this renders on the server, costs nothing to hydrate, and stops for
 * anyone who asked their system to reduce motion.
 */
export default function NetworkRing() {
  return (
    <figure className="ring" role="group" aria-labelledby="ring-caption">
      <div className="ring__stage">
        <svg
          className="ring__svg"
          viewBox="0 0 440 440"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--go)" stopOpacity="0.1" />
              <stop offset="70%" stopColor="var(--go)" stopOpacity="0.02" />
              <stop offset="100%" stopColor="var(--go)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="220" cy="220" r="200" fill="url(#ringGlow)" />

          {/* The path the benefit travels. */}
          <circle
            className="ring__track"
            cx="220"
            cy="220"
            r="142"
            fill="none"
          />

          {/* Direction of travel, four short arcs with heads. */}
          {[0, 90, 180, 270].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 220 220)`}>
              <path className="ring__arc" d="M 288 172 A 142 142 0 0 1 308 236" />
              <path className="ring__head" d="M 303 228 L 309 238 L 298 240" />
            </g>
          ))}

          {/* The mark that carries a week's benefit around the loop. */}
          <circle className="ring__mark" r="6" />
        </svg>

        {/* Centre: the coordinator. */}
        <div className="ring__hub">
          <span className="ring__hub-mark" aria-hidden="true">
            U
          </span>
          <span className="ring__hub-name">Uptick</span>
          <span className="ring__hub-role">Coordinates the week</span>
        </div>

        {/* The four parties, positioned around the ring. */}
        <ul className="ring__nodes plainlist">
          {NETWORK.nodes.map((node) => (
            <li key={node.id} className="ring__node" data-at={node.id}>
              <p className="ring__node-name">{node.name}</p>
              <p className="ring__node-line">{node.line}</p>
            </li>
          ))}
        </ul>
      </div>

      <figcaption id="ring-caption" className="ring__caption">
        {NETWORK.caption}
      </figcaption>
    </figure>
  );
}
