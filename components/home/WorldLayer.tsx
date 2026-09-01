"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OFFER_TEXT } from "@/lib/content";
import { useMediaQuery } from "@/lib/useMediaQuery";

/** Live 3D only where it earns its cost: a landscape viewport at least 1024px wide. */
export const LIVE_QUERY = "(min-width: 1024px) and (min-aspect-ratio: 1/1)";

/**
 * Three and the model load as their own chunk, and only on screens that get
 * the live cinematic. Phones and portrait tablets never download any of it;
 * they get the same model as art-directed stills.
 */
const NeighborhoodCanvas = dynamic(() => import("@/components/home/NeighborhoodCanvas"), { ssr: false });

/** `?still=` renders one composition for the frame bake, at any viewport. */
function useStillMode() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(new URLSearchParams(window.location.search).has("still"));
  }, []);
  return still;
}

export default function WorldLayer() {
  const live = useMediaQuery(LIVE_QUERY);
  const still = useStillMode();
  if (!live && !still) return null;
  return <NeighborhoodCanvas offerText={OFFER_TEXT} />;
}
