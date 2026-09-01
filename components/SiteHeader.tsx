"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { onScrollFrame } from "@/lib/scroll";

/**
 * Deliberately small. The site has two products and one explainer, so the
 * navigation has three destinations and the Growth door keeps primary weight.
 *
 * The bar is transparent over the opening shot and picks up a ground once the
 * page has moved, which keeps contrast honest as the visitor passes from the
 * blue-hour chapters onto the warm paper ones.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onScrollFrame(() => {
      const scrolled = window.scrollY > 24;
      const value = String(scrolled);
      if (el.dataset.scrolled !== value) el.dataset.scrolled = value;
    });
  }, []);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header ref={ref} className="site-header" data-scrolled="false">
      <Link href="/" className="wordmark" aria-label="Uptick Local — home">
        <span>uptick local</span>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        <Link href="/how-it-works" className="navlink navlink--quiet" aria-current={current("/how-it-works")}>
          How it works
        </Link>
        <Link href="/host" className="navlink" aria-current={current("/host")}>
          Host a free screen
        </Link>
        <Link href="/growth" className="navlink navlink--primary" aria-current={current("/growth")}>
          Promote your business
        </Link>
      </nav>
    </header>
  );
}
