"use client";

import dynamic from "next/dynamic";

/** The stage needs window (Remotion's Player, the FontFace API), so it is client-only. */
const Stage = dynamic(() => import("./Stage"), { ssr: false, loading: () => <div className="lab__loading">Loading the lab…</div> });

export default function Lab() {
  return <Stage />;
}
