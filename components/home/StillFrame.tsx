type Props = {
  /** Frame name under /public/frames. */
  name: "hero" | "model" | "signal" | "screen" | "finale";
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * A baked still of the model, cropped for the orientation it is shown in.
 * Frames are rendered from the same scene the live cinematic uses (see
 * scripts/bake-frames.mjs), so a phone sees the same block a desktop does —
 * composed for a vertical page rather than shrunk to fit one.
 */
export default function StillFrame({ name, alt, className, priority }: Props) {
  return (
    <picture className={`still${className ? ` ${className}` : ""}`}>
      <source media="(orientation: portrait)" srcSet={`/frames/${name}-portrait.webp`} />
      <img
        src={`/frames/${name}-wide.webp`}
        alt={alt}
        width={1600}
        height={1000}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
