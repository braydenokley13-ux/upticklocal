import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";
import "./mobile.css";
import "./editorial.css";

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
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://upticklocal.com"),
  title: {
    default: "Uptick Local — Good things closer to home.",
    template: "%s — Uptick Local",
  },
  description:
    "A free local membership for adults. Each published week brings one featured benefit at a participating local business, backed by approved supply. No purchase required, no app to download, and text messages are optional.",
  openGraph: {
    title: "Uptick Local — Good things closer to home.",
    description:
      "A free local membership. One good thing from a nearby business each published week. No purchase, no app, and texts are optional.",
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
