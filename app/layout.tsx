import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { SonarGrid } from "@/components/ui/sonar-grid";
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
        <AuroraBackground
          className="global-aurora-backdrop"
          aria-hidden="true"
        >
          <span />
        </AuroraBackground>
        <SonarGrid
          className="global-sonar-backdrop"
          aria-hidden="true"
          spacing={29}
          dotRadius={1.15}
          baseOpacity={0.16}
          color="#26755b"
          pingEvery={3.8}
          speed={190}
          ringWidth={105}
          amplitude={1.65}
          maxRings={4}
          interactionTarget="window"
          pingArea={[0.08, 0.08, 0.92, 0.92]}
        />
        <div className="site-layer">{children}</div>
      </body>
    </html>
  );
}
