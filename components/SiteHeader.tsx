"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTACT_EMAIL, CTA, NAV } from "@/lib/content";
import { onScrollFrame } from "@/lib/scroll";

/**
 * On a desktop: the five places to go and one action. On a phone: the
 * wordmark and one trigger, opening a sheet that lists everything in the
 * order a new visitor should meet it. The bar reads the section under it
 * and swaps its contrast as the page passes from blue hour onto canvas.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stop = onScrollFrame(() => {
      const scrolled = window.scrollY > 24;
      if (el.dataset.scrolled !== String(scrolled)) el.dataset.scrolled = String(scrolled);
    });
    // Whatever section crosses the line just under the bar decides its theme.
    // An observer on a one-pixel band costs nothing per scroll frame.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-theme]")).filter((s) => s !== el);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (!hit) return;
        const theme = (hit.target as HTMLElement).dataset.theme ?? "dark";
        if (el.dataset.theme !== theme) el.dataset.theme = theme;
      },
      { rootMargin: `-40px 0px -${Math.max(0, window.innerHeight - 41)}px 0px`, threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => {
      stop();
      observer.disconnect();
    };
  }, [pathname]);

  // The sheet closes on navigation, on Escape, and returns focus to the trigger.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.menu = open ? "open" : "";
    if (!open) return;
    sheetRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.menu;
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header ref={ref} className="site-header" data-scrolled="false" data-theme="dark" data-menu={open ? "open" : "closed"}>
      <Link href="/" className="wordmark" aria-label="Uptick Local — home">
        <span className="wordmark__dot" aria-hidden="true" />
        <span>uptick local</span>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="navlink" aria-current={current(item.href)}>
            {item.label}
          </Link>
        ))}
      </nav>

      <a href={CTA.talk.href} className="navcta">
        {CTA.talk.label}
      </a>

      <button ref={triggerRef} type="button" className="menu-btn" aria-expanded={open} aria-controls="site-menu" onClick={toggle}>
        {open ? "Close" : "Menu"}
        <span className="menu-btn__lines" aria-hidden="true" />
      </button>

      <div ref={sheetRef} id="site-menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <nav aria-label="Primary, phone">
          <ul className="menu__list plainlist">
            <li>
              <Link href="/" className="menu__link" aria-current={current("/")} onClick={() => setOpen(false)}>
                <span className="menu__name">Overview</span>
                <span className="menu__line">The block, the screen, the whole system</span>
              </Link>
            </li>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="menu__link" aria-current={current(item.href)} onClick={() => setOpen(false)}>
                  <span className="menu__name">{item.label}</span>
                  <span className="menu__line">{item.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu__foot">
          <p className="mono-tag">Talk to us</p>
          <a className="menu__mail" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </header>
  );
}
