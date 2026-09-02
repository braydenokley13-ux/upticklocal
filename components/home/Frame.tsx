import frames from "@/lib/frames.json";

export type FrameName = keyof typeof frames;

type Props = {
  name: FrameName;
  alt: string;
  className?: string;
  /** The first frame on the page: fetched before anything else. */
  priority?: boolean;
  /** A 16:10 desktop bake to show instead on a landscape desktop viewport. */
  wide?: string;
  sizes?: string;
};

/**
 * A baked still of the model, composed for a phone (see lib/three/shots.ts
 * `MOBILE` and scripts/bake-frames.mjs). Two widths so a 375px phone at 2×
 * and a 430px one at 3× each download a file that fits, and the intrinsic
 * size comes from the bake so the box is right before the bytes arrive.
 */
export default function Frame({ name, alt, className, priority, wide, sizes = "100vw" }: Props) {
  const { width, height } = frames[name];
  const img = (
    <img
      src={`/frames/${name}-1170.webp`}
      srcSet={`/frames/${name}-780.webp 780w, /frames/${name}-1170.webp 1170w`}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      draggable={false}
    />
  );
  return (
    <picture className={`frame${className ? ` ${className}` : ""}`}>
      {wide ? <source media="(min-width: 1024px) and (min-aspect-ratio: 1/1)" srcSet={`/frames/${wide}`} width={1600} height={1000} /> : null}
      {img}
    </picture>
  );
}
