import type { Metadata } from "next";
import Lab from "./components/Lab";

export const metadata: Metadata = {
  title: "Film R&D Lab",
  robots: { index: false, follow: false },
};

/**
 * The film R&D workstation. Not a marketing page: a private stage for the
 * five hero-shot prototypes, with scrubbing, frame readout and links to the
 * rendered outputs. Nothing on the production routes imports from here.
 */
export default function FilmRdPage() {
  return <Lab />;
}
