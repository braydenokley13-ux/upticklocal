import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";
import "./mobile.css";

/**
 * Three faces, in a strict hierarchy. Geist carries everything you read.
 * Geist Mono is the annotation on the drawing: labels, specs, states.
 * Newsreader italic is spent on one phrase per page, never more — the
 * editorial accent that says a person wrote this, not a template.
 */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});
const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["italic"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://upticklocal.com"),
  title: {
    default:
      "Uptick Local — Grow your business by reaching the customers already around you.",
    template: "%s — Uptick Local",
  },
  description:
    "A local business growth system. Host a free countertop screen, advertise across nearby Uptick locations, or plan a negotiated four-week Growth program with approved fulfillment and observed results. Growth does not require a screen.",
  openGraph: {
    title:
      "Uptick Local — Grow your business by reaching the customers already around you.",
    description:
      "Screens where people already go. Offers they can act on now. Content that makes them choose you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${serif.variable}`}
    >
      <body>
        <a href="#main" className="skiplink">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
