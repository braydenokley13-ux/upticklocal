"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { onScrollFrame } from "@/lib/scroll";

/**
 * Deliberately small: two products and one explainer, so three destinations,
 * with the Growth door carrying the weight. The bar reads the section under
 * it and swaps its contrast as the page passes from blue hour onto canvas.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onScrollFrame(() => {
      const scrolled = window.scrollY > 24;
      if (el.dataset.scrolled !== String(scrolled)) el.dataset.scrolled = String(scrolled);
      // Whatever section sits under the bar decides its theme.
      const stack = document.elementsFromPoint(Math.round(window.innerWidth / 2), 40);
      const under = stack.find((node) => !el.contains(node));
      const theme = under?.closest<HTMLElement>("[data-theme]")?.dataset.theme ?? "dark";
      if (el.dataset.theme !== theme) el.dataset.theme = theme;
    });
  }, [pathname]);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header ref={ref} className="site-header" data-scrolled="false" data-theme="dark">
      <Link href="/" className="wordmark" aria-label="Uptick Local — home">
        <span className="wordmark__dot" aria-hidden="true" />
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
