import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Bootstrap } from "@/components/Bootstrap";

import "./globals.css";

/*
 * `latin-ext` şərtdir, dekorativ deyil: azərbaycan əlifbasının ə ğ ı ş ö ü ç hərfləri
 * `latin` subset-inə düşmür. Onsuz brauzer həmin qliflər üçün fallback şrift çəkir və mətnin
 * şrifti söz ortasında dəyişir.
 */
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "məcnun",
  description: "Dərdini danış. Burda qulaq asan var.",
  // Anonim cihaz hesabı ilə işləyən şəxsi söhbət — axtarış nəticələrində yeri yoxdur.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#131313",
  // Mobil brauzerdə input-a fokuslananda səhifənin öz-özünə zoom-lanmasını dayandırır.
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="az" className={`${inter.variable} h-full`}>
      <body className="h-full bg-bg text-ink antialiased">
        <Bootstrap>{children}</Bootstrap>
      </body>
    </html>
  );
}
