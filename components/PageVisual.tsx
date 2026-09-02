import Frame, { type FrameName } from "@/components/home/Frame";

type Props = {
  name: FrameName;
  alt: string;
  caption?: string;
  /** Also on a landscape desktop, from the wide bake named here. */
  wide?: string;
};

/**
 * A page's hero object: one full-bleed frame of the model under the title,
 * so a phone meets the thing before the paragraph about it. Phone-only
 * unless a wide bake is given — the desktop pages were composed without it.
 */
export default function PageVisual({ name, alt, caption, wide }: Props) {
  return (
    <div className={`page-visual${wide ? " page-visual--all" : ""}`}>
      <Frame name={name} alt={alt} wide={wide} />
      {caption ? <p className="page-visual__caption">{caption}</p> : null}
    </div>
  );
}
