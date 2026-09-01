import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

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
    default: "Uptick Local — Reach nearby customers. Turn offers into visits.",
    template: "%s — Uptick Local",
  },
  description:
    "Uptick puts your offer on screens at nearby non-competing local stores. Customers scan, claim by text, visit, and redeem on their phone. Host stores get a free 21-inch screen.",
  openGraph: {
    title: "Uptick Local — Reach nearby customers. Turn offers into visits.",
    description:
      "Your offer on screens at up to five participating non-competing local stores. Free screens for host stores.",
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
