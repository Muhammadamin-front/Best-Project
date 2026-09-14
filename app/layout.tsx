import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://duodosh.pokoandmii.chatgpt.site"),
  title: {
    default: "Duodosh — duoda birgamiz",
    template: "%s · Duodosh",
  },
  description: "Duo so‘rovlari, samimiy dalda va tasdiqlangan masjidlar bilan bog‘lovchi xavfsiz musulmon hamjamiyati.",
  openGraph: {
    title: "Duodosh — duoda birgamiz",
    description: "Bir-birimizni duoda eslaydigan mehrli hamjamiyat.",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Duodosh — Duoda birgamiz" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Duodosh — duoda birgamiz",
    description: "Bir-birimizni duoda eslaydigan mehrli hamjamiyat.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
