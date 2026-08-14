"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NETWORK_LIST } from "@/lib/networks";

const NAV = [
  { href: "/locations", label: "For Locations" },
  { href: "/advertisers", label: "For Advertisers" },
  { href: "/networks", label: "Our Networks", networks: true },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/partners", label: "Partner With Us" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [netOpen, setNetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  // Any navigation closes both surfaces.
  useEffect(() => {
    setNetOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!netOpen && !drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNetOpen(false);
        setDrawerOpen(false);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [netOpen, drawerOpen]);

  const isActive = (href: string) =>
    href === "/networks" ? pathname.startsWith("/networks") : pathname === href;

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="wordmark" aria-label="Uptick Local — home">
          <span className="wordmark__bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="wordmark__name">Uptick Local</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) =>
            item.networks ? (
              <div
                key={item.href}
                className="nav__group"
                ref={groupRef}
                onMouseEnter={() => setNetOpen(true)}
                onMouseLeave={() => setNetOpen(false)}
                onFocus={() => setNetOpen(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setNetOpen(false);
                }}
              >
                <Link
                  href={item.href}
                  className="nav__link nav__link--caret"
                  data-active={isActive(item.href)}
                  aria-expanded={netOpen}
                >
                  {item.label}
                  <span className="nav__caret" aria-hidden="true" />
                </Link>
                {netOpen && (
                  <ul className="netmenu">
                    {NETWORK_LIST.map((net) => (
                      <li key={net.slug}>
                        <Link
                          href={`/networks/${net.slug}`}
                          className="netmenu__link"
                          style={{ ["--net" as string]: net.color }}
                        >
                          {net.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="nav__link"
                data-active={isActive(item.href)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="site-header__end">
          <Link href="/locations" className="header-cta">
            Get a Free Screen<span aria-hidden="true">&#8594;</span>
          </Link>
          <button
            type="button"
            className="navtoggle"
            aria-label="Menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </div>

      <div className="navdrawer" data-open={drawerOpen}>
        {NAV.map((item) => (
          <div key={item.href}>
            <Link href={item.href}>{item.label}</Link>
            {item.networks &&
              NETWORK_LIST.map((net) => (
                <Link
                  key={net.slug}
                  href={`/networks/${net.slug}`}
                  data-sub="true"
                  style={{ ["--net" as string]: net.color }}
                >
                  {net.name}
                </Link>
              ))}
          </div>
        ))}
      </div>
    </header>
  );
}
