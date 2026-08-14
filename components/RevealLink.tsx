"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { useReveal } from "@/components/Reveal";

/**
 * Reveal applied to a link. The `next/link` reference stays on the client so
 * Server Components can render this without passing a component across the
 * server/client boundary.
 */
export default function RevealLink({
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof Link>) {
  const ref = useReveal();

  return (
    <Link ref={ref as React.Ref<HTMLAnchorElement>} {...rest}>
      {children}
    </Link>
  );
}
