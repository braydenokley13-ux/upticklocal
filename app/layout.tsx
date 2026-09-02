import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";
import "./mobile.css";

/**
 * Two faces. Geist carries everything you read — headlines and body alike, in
 * a narrow band of weights. Geist Mono is the annotation on the drawing:
 * labels, specs, states. Seasoning, not identity.
 */
const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://upticklocal.com"),
  title: {
    default: "Uptick Local — Grow your business by reaching the customers already around you.",
    template: "%s — Uptick Local",
  },
  description:
    "A hyperlocal screen network. Host a free screen and promote your own business, advertise across nearby Uptick locations, or run Growth: offers customers claim by text, visit and redeem in person.",
  openGraph: {
    title: "Uptick Local — Grow your business by reaching the customers already around you.",
    description: "Host a free screen, advertise locally, or turn local attention into measurable customer activity with Growth.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
