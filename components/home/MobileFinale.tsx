import Doors from "@/components/home/Doors";
import Frame from "@/components/home/Frame";
import { FINALE } from "@/lib/content";

/** Back to the block at blue hour, every counter lit — and the four doors, as a list. */
export default function MobileFinale() {
  return (
    <section className="m-finale" data-theme="dark" aria-labelledby="m-finale-h">
      <Frame name="finale" className="m-finale__picture" alt="The finished block at blue hour, every counter screen lit." />
      <div className="m-finale__scrim" aria-hidden="true" />
      <div className="m-finale__copy">
        <p className="mono-tag">{FINALE.tag}</p>
        <h2 id="m-finale-h" className="m-display m-display--light">
          {FINALE.title}
        </h2>
        <Doors />
      </div>
    </section>
  );
}
