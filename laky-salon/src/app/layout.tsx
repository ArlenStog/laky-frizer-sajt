import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Laky – frizerski studio | Mladenovac",
  description:
    "Frizerski studio Laky u Mladenovcu – šišanje, feniranje, svečane frizure, farbanje i tretmani. Zakažite termin online.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr-Latn">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
