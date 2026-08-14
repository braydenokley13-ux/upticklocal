import type { Metadata } from "next";
import { Archivo, Familjen_Grotesk, Martian_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const display = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://upticklocal.com"),
  title: {
    default: "Uptick Local — The neighborhood is the network.",
    template: "%s — Uptick Local",
  },
  description:
    "Uptick puts free digital screens inside local businesses — and connects them to advertisers who want the people standing right there.",
  openGraph: {
    title: "Uptick Local — The neighborhood is the network.",
    description:
      "Free 21-inch screens for local businesses. Local audience networks for advertisers.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
