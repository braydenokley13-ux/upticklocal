import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

/**
 * Three faces, each with one job: Newsreader carries every headline, Archivo
 * carries everything you read at length, IBM Plex Mono carries labels, specs
 * and anything the system is stating as fact.
 */
const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["200", "300", "400"],
  style: ["normal", "italic"],
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

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
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
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
